// Composant du module Programmes avec Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('programmesComponent', () => ({
    listeProgrammes: [],
    listeChants: [],
    modaleOuverte: false,
    programmeActif: { id: null, dateEvent: '', typeEvent: 'Culte du Dimanche', consignes: '', sequence: [] },
    message: '',
    messageType: 'success',
    peutEcrire: false,

    init() {
      auth.onAuthStateChanged(user => {
        if (user) {
          database.ref('membres/' + user.uid).once('value').then(snapshot => {
            let m = snapshot.val();
            if (m) {
              this.peutEcrire = (m.role === 'admin' || m.role === 'lead' || m.role === 'pasteur');
            }
          });

          // Écouter les chants pour la liaison déroulé
          database.ref('repertoire').on('value', snapshot => {
            let val = snapshot.val() || {};
            this.listeChants = Object.keys(val).map(key => Object.assign({ id: key }, val[key]));
          });

          // Écouter les programmes à venir
          database.ref('programmes').on('value', snapshot => {
            let val = snapshot.val() || {};
            // Trier les programmes par date (le plus récent en premier)
            this.listeProgrammes = Object.keys(val).map(key => {
              let p = Object.assign({ id: key }, val[key]);
              // Charger le nom de la personne qui a modifié le programme
              let lastAuthor = p.lastModifiedBy || p.createdBy;
              if (lastAuthor) {
                database.ref('membres/' + lastAuthor).once('value').then(s => {
                  let m = s.val();
                  if (m) p.modifieParNom = (m.prenom || '') + ' ' + (m.nom || '');
                });
              }
              return p;
            }).sort((a, b) => (b.dateEvent || '').localeCompare(a.dateEvent || ''));
          });
        } else {
          this.listeProgrammes = [];
          this.listeChants = [];
          this.peutEcrire = false;
        }
      });
    },

    estComplet(prog) {
      // Un programme est complet s'il contient au moins un chant lié dans sa séquence
      return prog.sequence && prog.sequence.some(etape => !!etape.songId);
    },

    trouverTitreChant(songId) {
      let song = this.listeChants.find(c => c.id === songId);
      return song ? song.titre + ' (' + song.gamme + ')' : 'Chant introuvable';
    },

    formaterDateEvent(dateStr) {
      if (!dateStr) return '';
      let parts = dateStr.split('-');
      if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
      }
      return dateStr;
    },

    formaterTimestamp(ts) {
      if (!ts) return 'Inconnue';
      return new Date(ts).toLocaleString('fr-FR');
    },

    ouvrirAjout() {
      this.programmeActif = { id: null, dateEvent: new Date().toISOString().split('T')[0], typeEvent: 'Culte du Dimanche', consignes: '', sequence: [] };
      this.modaleOuverte = true;
    },

    ouvrirEdition(prog) {
      // Cloner pour éviter l'édition directe en DB avant enregistrement
      this.programmeActif = JSON.parse(JSON.stringify(prog));
      if (!this.programmeActif.sequence) {
        this.programmeActif.sequence = [];
      }
      this.modaleOuverte = true;
    },

    fermerModale() {
      this.modaleOuverte = false;
    },

    ajouterEtape() {
      this.programmeActif.sequence.push({ heure: '', titreSection: '', songId: '' });
    },

    supprimerEtape(index) {
      this.programmeActif.sequence.splice(index, 1);
    },

    monterEtape(index) {
      if (index > 0) {
        const etapes = [...this.programmeActif.sequence];
        [etapes[index - 1], etapes[index]] = [etapes[index], etapes[index - 1]];
        this.programmeActif.sequence = etapes;
      }
    },

    descendreEtape(index) {
      if (index < this.programmeActif.sequence.length - 1) {
        const etapes = [...this.programmeActif.sequence];
        [etapes[index + 1], etapes[index]] = [etapes[index], etapes[index + 1]];
        this.programmeActif.sequence = etapes;
      }
    },

    enregistrerProgramme() {
      let dateEvent = this.programmeActif.dateEvent;
      if (!dateEvent) {
        alert("La date de l'événement est obligatoire.");
        return;
      }

      let data = {
        dateEvent: dateEvent,
        typeEvent: this.programmeActif.typeEvent,
        consignes: this.programmeActif.consignes || "",
        sequence: this.programmeActif.sequence || []
      };

      if (this.programmeActif.id) {
        data.lastModifiedBy = auth.currentUser.uid;
        data.lastModifiedAt = firebase.database.ServerValue.TIMESTAMP;

        database.ref('programmes/' + this.programmeActif.id).update(data)
          .then(() => {
            this.message = "Programme modifié avec succès !";
            this.messageType = "success";
            this.fermerModale();
            setTimeout(() => this.message = "", 3000);
          })
          .catch(err => {
            alert("Erreur lors de la modification : " + err.message);
          });
      } else {
        data.createdBy = auth.currentUser.uid;
        data.createdAt = firebase.database.ServerValue.TIMESTAMP;

        database.ref('programmes').push(data)
          .then(() => {
            this.message = "Programme créé avec succès !";
            this.messageType = "success";
            this.fermerModale();
            setTimeout(() => this.message = "", 3000);
          })
          .catch(err => {
            alert("Erreur lors de la création : " + err.message);
          });
      }
    },

    supprimerProgramme(id) {
      if (confirm("Voulez-vous vraiment supprimer ce programme ?")) {
        database.ref('programmes/' + id).remove()
          .then(() => {
            this.message = "Programme supprimé avec succès !";
            this.messageType = "success";
            setTimeout(() => this.message = "", 3000);
          })
          .catch(err => {
            alert("Erreur lors de la suppression : " + err.message);
          });
      }
    }
  }));
});
