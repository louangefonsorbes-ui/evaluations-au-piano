
document.querySelectorAll(".nav-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

btn.classList.add("active");

document.getElementById("tab-"+btn.dataset.tab).style.display="block";

});

});

function totalNote(data){

return data.reduce((somme,l)=>somme+l[1],0);

}

function tableau(data){

let total=totalNote(data);

let html="";

html+="<table>";

html+="<tr><th>Critère</th><th>Note /5</th></tr>";

data.forEach(l=>{

html+="<tr>";

html+="<td>"+l[0]+"</td>";

html+="<td>"+l[1]+"/5</td>";

html+="</tr>";

});

html+="<tr>";

html+="<th>Total</th>";

html+="<th>"+total+"/20</th>";

html+="</tr>";

html+="</table>";

return html;

}

function obtenirCouleurNote(note){

let valeur=parseFloat(note.replace(",","."));

if(valeur<7){return"#d32f2f";}

else if(valeur<9){return"#ff9800";}

else{return"#388e3c";}

}

function afficherEvaluation(nom,evaluation){

document.getElementById("sessionNom").innerHTML=nom;

document.getElementById("nom").innerHTML=nom;

let noteElement=document.getElementById("note");

if(!evaluation || !evaluation.mainGauche || !evaluation.mainDroite){

noteElement.innerHTML="—";

noteElement.style.color="#888";

document.getElementById("contenu").innerHTML="<p class='bientot-disponible'>Aucune évaluation disponible pour le moment.</p>";

return;

}

let noteGlobale=(totalNote(evaluation.mainGauche)+totalNote(evaluation.mainDroite))/2;

let noteTexte=Number.isInteger(noteGlobale) ? noteGlobale+" /20" : noteGlobale.toFixed(1).replace(".",",")+" /20";

noteElement.innerHTML=noteTexte;

noteElement.style.color=obtenirCouleurNote(noteTexte);

let html="";

html+="<h3>Exercice 1 - Main gauche</h3>";

html+=tableau(evaluation.mainGauche);

html+="<h3>Exercice 2 - Main droite</h3>";

html+=tableau(evaluation.mainDroite);

html+="<hr style='margin:5px auto; border:none; border-top:1px solid #ccc; width:80%;'>";

html+=evaluation.rapport;

document.getElementById("contenu").innerHTML=html;

}

function chargerProfil(){

let uid=auth.currentUser.uid;

database.ref('membres/' + uid).once('value')
  .then(snapshot=>{
    let m=snapshot.val();

    if(!m){
      alert("Compte non configuré, contactez l'administrateur");
      auth.signOut();
      return;
    }

    document.getElementById("loginScreen").style.display="none";

    document.getElementById("appShell").style.display="flex";

    document.getElementById("navAdmin").style.display = m.role==="admin" ? "" : "none";

    database.ref('evaluationsPiano/' + uid).once('value')
      .then(s=>afficherEvaluation(m.nom,s.val()))
      .catch(error=>{
        alert("Erreur de chargement de l'évaluation");
        console.error(error);
      });

    if(m.role==="admin"){
      chargerListeAdmin();
    }
  })
  .catch(error=>{
    alert("Erreur de connexion à la base de données");
    console.error(error);
  });

}

function connexion(){

let identifiant=document.getElementById("identifiant").value.trim();

let motDePasse=document.getElementById("motDePasse").value;

if(!identifiant || !motDePasse){

alert("Identifiant et mot de passe sont obligatoires");

return;

}

let email=identifiant.toLowerCase()+"@adorateurs.local";

auth.signInWithEmailAndPassword(email,motDePasse)
  .catch(error=>{
    alert("Identifiant ou mot de passe incorrect");
    console.error(error);
  });

}

function deconnexion(){

auth.signOut();

}

auth.onAuthStateChanged(user=>{

if(user){

chargerProfil();

} else {

document.getElementById("navAdmin").style.display="none";

document.getElementById("appShell").style.display="none";

document.getElementById("loginScreen").style.display="flex";

document.getElementById("identifiant").value="";

document.getElementById("motDePasse").value="";

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelector('.nav-btn[data-tab="piano"]').classList.add("active");

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

document.getElementById("tab-piano").style.display="block";

}

});

const CRITERES=["Posture au piano","Position des doigts","Déplacements clavier","Maîtrise de l'exercice"];

function construireCriteres(conteneurId,prefixeId){

let conteneur=document.getElementById(conteneurId);

conteneur.innerHTML="";

CRITERES.forEach((nomCritere,i)=>{

conteneur.innerHTML+="<label>"+nomCritere+" <input type='number' min='0' max='5' id='"+prefixeId+i+"'></label><br>";

});

}

function lireCriteres(prefixeId){

return CRITERES.map((nomCritere,i)=>[nomCritere, parseInt(document.getElementById(prefixeId+i).value)||0]);

}

function remplirCriteres(prefixeId,data){

CRITERES.forEach((nomCritere,i)=>{

document.getElementById(prefixeId+i).value = data[i] ? data[i][1] : 0;

});

}

function viderFormulaireAdmin(){

document.getElementById("adminIdentifiant").value="";

document.getElementById("adminIdentifiant").disabled=false;

document.getElementById("adminNom").value="";

document.getElementById("adminPrenom").value="";

document.getElementById("adminRole").value="membre";

document.getElementById("adminMotDePasseInitial").value="";

document.getElementById("adminMotDePasseInitialWrapper").style.display="block";

document.getElementById("adminEnregistrerBtn").style.display="none";

document.getElementById("adminCreerBtn").style.display="";

remplirCriteres("adminMG",[]);

remplirCriteres("adminMD",[]);

document.getElementById("adminRapport").value="";

document.getElementById("adminDerniereModif").textContent="";

}

function chargerMembreAdmin(uid){

database.ref('membres/' + uid).once('value').then(snapshot=>{

let m=snapshot.val();

if(!m){return null;}

document.getElementById("adminIdentifiant").value=m.identifiant || "";

document.getElementById("adminIdentifiant").disabled=true;

document.getElementById("adminNom").value=m.nom || "";

document.getElementById("adminPrenom").value=m.prenom || "";

document.getElementById("adminRole").value=m.role || "membre";

document.getElementById("adminMotDePasseInitialWrapper").style.display="none";

document.getElementById("adminEnregistrerBtn").style.display="";

document.getElementById("adminCreerBtn").style.display="none";

return database.ref('evaluationsPiano/' + uid).once('value');

}).then(snapshot=>{

if(!snapshot){return;}

let e=snapshot.val() || {};

remplirCriteres("adminMG",e.mainGauche || []);

remplirCriteres("adminMD",e.mainDroite || []);

document.getElementById("adminRapport").value=e.rapport || "";

document.getElementById("adminDerniereModif").textContent = e.updatedAt ? "Dernière modification : "+new Date(e.updatedAt).toLocaleString("fr-FR") : "";

}).catch(error=>{

alert("Erreur de chargement de la fiche");

console.error(error);

});

}

function chargerListeAdmin(){

database.ref('membres').once('value').then(snapshot=>{

let membres=snapshot.val() || {};

let select=document.getElementById("adminSelectEleve");

select.innerHTML="<option value=''>Nouveau membre</option>";

Object.keys(membres).forEach(uid=>{

let option=document.createElement("option");

option.value=uid;

option.textContent=membres[uid].nom+" ("+membres[uid].identifiant+")";

select.appendChild(option);

});

}).catch(error=>{

alert("Erreur de chargement de la liste des membres");

console.error(error);

});

}

function enregistrerEleve(){

let uid=document.getElementById("adminSelectEleve").value;

let nom=document.getElementById("adminNom").value.trim();

let prenom=document.getElementById("adminPrenom").value.trim();

let role=document.getElementById("adminRole").value;

if(!uid || !nom){

alert("Nom obligatoire");

return;

}

if(!confirm("Enregistrer les modifications pour "+nom+" ?")){

return;

}

let bouton=document.getElementById("adminEnregistrerBtn");

bouton.disabled=true;

bouton.textContent="Enregistrement...";

let profil={

nom: nom,

prenom: prenom,

role: role

};

let evaluation={

mainGauche: lireCriteres("adminMG"),

mainDroite: lireCriteres("adminMD"),

rapport: document.getElementById("adminRapport").value,

updatedAt: firebase.database.ServerValue.TIMESTAMP

};

Promise.all([
    database.ref('membres/' + uid).update(profil),
    database.ref('evaluationsPiano/' + uid).update(evaluation)
  ])
  .then(()=>{
    chargerListeAdmin();
  })
  .catch(error=>{
    alert("Erreur lors de l'enregistrement");
    console.error(error);
  })
  .finally(()=>{
    bouton.disabled=false;
    bouton.textContent="Enregistrer";
  });

}

function creerMembre(){

let identifiant=document.getElementById("adminIdentifiant").value.trim();

let nom=document.getElementById("adminNom").value.trim();

let prenom=document.getElementById("adminPrenom").value.trim();

let role=document.getElementById("adminRole").value;

let motDePasse=document.getElementById("adminMotDePasseInitial").value;

if(!identifiant || !nom || !motDePasse){

alert("Identifiant, nom et mot de passe initial sont obligatoires");

return;

}

if(!confirm("Créer le compte de "+nom+" ("+identifiant+") ?")){

return;

}

let bouton=document.getElementById("adminCreerBtn");

bouton.disabled=true;

bouton.textContent="Création...";

let email=identifiant.toLowerCase()+"@adorateurs.local";

secondaryAuth.createUserWithEmailAndPassword(email,motDePasse)
  .then(credential=>{
    let uid=credential.user.uid;
    return secondaryAuth.signOut().then(()=>{
      return database.ref('membres/' + uid).set({
        identifiant: identifiant,
        nom: nom,
        prenom: prenom,
        role: role
      });
    }).then(()=>uid);
  })
  .then(uid=>{
    return database.ref('eleves/' + identifiant.toUpperCase()).once('value').then(snapshot=>{
      let ancienneEvaluation=snapshot.val();
      if(!ancienneEvaluation || !ancienneEvaluation.mainGauche || !ancienneEvaluation.mainDroite){
        return false;
      }
      return database.ref('evaluationsPiano/' + uid).update({
        mainGauche: ancienneEvaluation.mainGauche,
        mainDroite: ancienneEvaluation.mainDroite,
        rapport: ancienneEvaluation.rapport,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      }).then(()=>true);
    });
  })
  .then(evaluationMigree=>{
    alert(evaluationMigree ? "Compte créé, évaluation existante migrée automatiquement depuis eleves/"+identifiant.toUpperCase() : "Compte créé (aucune évaluation existante trouvée pour cet identifiant dans eleves)");
    viderFormulaireAdmin();
    chargerListeAdmin();
  })
  .catch(error=>{
    alert("Erreur lors de la création du compte");
    console.error(error);
  })
  .finally(()=>{
    bouton.disabled=false;
    bouton.textContent="Créer le compte";
  });

}

construireCriteres("adminCriteresGauche","adminMG");

construireCriteres("adminCriteresDroite","adminMD");

viderFormulaireAdmin();

document.getElementById("adminSelectEleve").addEventListener("change",function(){

if(this.value){

chargerMembreAdmin(this.value);

} else {

viderFormulaireAdmin();

}

});
