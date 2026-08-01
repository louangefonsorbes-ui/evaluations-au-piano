// Initialisation du module Répertoire avec Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('repertoireComponent', () => ({
    listeChantsOriginale: [],
    termeRecherche: '',
    gammeSelectionnee: 'Toutes',
    filtreAccords: 'tous',
    filtreParoles: 'toutes',
    modaleOuverte: false,
    modeEdition: false,
    chantActif: { id: null, titre: '', gamme: 'Do', pdfParolesUrl: '', pdfAccordsUrl: '', lienYoutube: '' },
    message: '',
    messageType: 'success',
    currentUserRole: 'membre',
    peutEcrire: false,
    peutVoirAccords: true,

    init() {
      auth.onAuthStateChanged(user => {
        if (user) {
          // Charger le rôle et les autorisations de l'utilisateur
          database.ref('membres/' + user.uid).once('value').then(snapshot => {
            let m = snapshot.val();
            if (m) {
              this.currentUserRole = m.role || 'membre';
              // Les admins, pasteurs et leads ont le droit d'écrire dans le répertoire
              this.peutEcrire = (m.role === 'admin' || m.role === 'lead' || m.role === 'pasteur');
              // Masquer les accords pour le rôle spécifique "boss" si demandé
              this.peutVoirAccords = (m.role !== 'boss');
            }
          });

          // Écouter les chants en temps réel dans Firebase
          database.ref('repertoire').on('value', snapshot => {
            let val = snapshot.val() || {};
            this.listeChantsOriginale = Object.keys(val).map(key => Object.assign({ id: key }, val[key]));
          });
        } else {
          this.listeChantsOriginale = [];
          this.peutEcrire = false;
          this.peutVoirAccords = true;
        }
      });
    },

    get chantsFiltrés() {
      return this.listeChantsOriginale.filter(chant => {
        // Recherche textuelle sur le titre normalisé
        let matchesSearch = true;
        if (this.termeRecherche) {
          let query = this.normaliserTitre(this.termeRecherche);
          let titreNorm = this.normaliserTitre(chant.titre || '');
          matchesSearch = titreNorm.includes(query);
        }

        // Filtre Gamme
        let matchesGamme = true;
        if (this.gammeSelectionnee !== 'Toutes') {
          matchesGamme = (chant.gamme === this.gammeSelectionnee);
        }

        // Filtre Accords
        let matchesAccords = true;
        if (this.filtreAccords === 'avec') {
          matchesAccords = !!chant.pdfAccordsUrl;
        } else if (this.filtreAccords === 'sans') {
          matchesAccords = !chant.pdfAccordsUrl;
        }

        // Filtre Paroles
        let matchesParoles = true;
        if (this.filtreParoles === 'avec') {
          matchesParoles = !!chant.pdfParolesUrl;
        } else if (this.filtreParoles === 'sans') {
          matchesParoles = !chant.pdfParolesUrl;
        }

        return matchesSearch && matchesGamme && matchesAccords && matchesParoles;
      });
    },

    normaliserTitre(str) {
      if (!str) return '';
      return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/\s+/g, ""); // Supprime les espaces
    },

    chargerFichierPDF(event, propertyName) {
      const file = event.target.files[0];
      if (file) {
        if (file.type === 'application/pdf') {
          // Simulation Front-End via une URL blob locale
          this.chantActif[propertyName] = URL.createObjectURL(file);
        } else {
          alert("Veuillez sélectionner un fichier au format PDF.");
          event.target.value = '';
        }
      }
    },

    ouvrirVisualisation(chant) {
      this.chantActif = Object.assign({
        creeParNom: 'Chargement...',
        modifieParNom: ''
      }, chant);
      this.modeEdition = false;
      this.modaleOuverte = true;

      // Charger les noms des auteurs de création et modification
      if (chant.createdBy) {
        database.ref('membres/' + chant.createdBy).once('value').then(snap => {
          let m = snap.val();
          if (m) this.chantActif.creeParNom = (m.prenom || '') + ' ' + (m.nom || '');
        });
      }
      if (chant.lastModifiedBy) {
        database.ref('membres/' + chant.lastModifiedBy).once('value').then(snap => {
          let m = snap.val();
          if (m) this.chantActif.modifieParNom = (m.prenom || '') + ' ' + (m.nom || '');
        });
      }
    },

    ouvrirAjout() {
      this.chantActif = { id: null, titre: '', gamme: 'Do', pdfParolesUrl: '', pdfAccordsUrl: '', lienYoutube: '' };
      this.modeEdition = true;
      this.modaleOuverte = true;
    },

    basculerEdition() {
      this.modeEdition = true;
    },

    annulerEdition() {
      if (this.chantActif.id) {
        let original = this.listeChantsOriginale.find(c => c.id === this.chantActif.id);
        this.ouvrirVisualisation(original);
      } else {
        this.fermerModale();
      }
    },

    fermerModale() {
      this.modaleOuverte = false;
      this.modeEdition = false;
    },

    formaterDate(timestamp) {
      if (!timestamp) return 'Inconnue';
      return new Date(timestamp).toLocaleString('fr-FR');
    },

    enregistrerChant() {
      let titre = (this.chantActif.titre || '').trim();
      if (!titre) {
        alert("Le titre du chant est obligatoire.");
        return;
      }

      let norm = this.normaliserTitre(titre);

      // Vérification anti-doublon
      let doublon = this.listeChantsOriginale.find(c => c.id !== this.chantActif.id && this.normaliserTitre(c.titre) === norm);
      if (doublon) {
        this.message = "Ce chant est déjà présent dans le répertoire.";
        this.messageType = "error";
        return;
      }

      let data = {
        titre: titre,
        titreNormalise: norm,
        gamme: this.chantActif.gamme,
        pdfParolesUrl: this.chantActif.pdfParolesUrl || "",
        pdfAccordsUrl: this.chantActif.pdfAccordsUrl || "",
        lienYoutube: this.chantActif.lienYoutube || ""
      };

      if (this.chantActif.id) {
        // Mise à jour
        data.lastModifiedBy = auth.currentUser.uid;
        data.lastModifiedAt = firebase.database.ServerValue.TIMESTAMP;

        database.ref('repertoire/' + this.chantActif.id).update(data)
          .then(() => {
            this.message = "Chant modifié avec succès !";
            this.messageType = "success";
            this.fermerModale();
            setTimeout(() => this.message = "", 3000);
          })
          .catch(err => {
            alert("Erreur lors de la modification : " + err.message);
          });
      } else {
        // Création
        data.createdBy = auth.currentUser.uid;
        data.createdAt = firebase.database.ServerValue.TIMESTAMP;

        database.ref('repertoire').push(data)
          .then(() => {
            this.message = "Chant enregistré avec succès !";
            this.messageType = "success";
            this.fermerModale();
            setTimeout(() => this.message = "", 3000);
          })
          .catch(err => {
            alert("Erreur lors de l'enregistrement : " + err.message);
          });
      }
    }
  }));

  // Composant global pour afficher la fiche de chant dans une modale
  Alpine.data('ficheChantComponent', () => ({
    ouvert: false,
    chant: {},
    peutVoirAccords: true,

    init() {
      auth.onAuthStateChanged(user => {
        if (user) {
          database.ref('membres/' + user.uid).once('value').then(snap => {
            let m = snap.val();
            if (m) {
              this.peutVoirAccords = (m.role !== 'boss');
            }
          });
        }
      });
    },

    ouvrir(songId) {
      database.ref('repertoire/' + songId).once('value').then(snap => {
        let val = snap.val();
        if (val) {
          this.chant = Object.assign({ id: songId }, val);
          this.ouvert = true;
        }
      });
    },

    fermer() {
      this.ouvert = false;
    }
  }));
});
