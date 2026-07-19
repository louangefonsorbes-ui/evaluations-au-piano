
function echapperHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

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

html+="<td>"+echapperHTML(l[0])+"</td>";

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

function trierEvaluationsParDate(evaluations){

return Object.keys(evaluations||{})
  .map(id=>Object.assign({id:id}, evaluations[id]))
  .sort((a,b)=>{
    let dateComparaison=(b.date||"").localeCompare(a.date||"");
    if(dateComparaison!==0){return dateComparaison;}
    return (b.updatedAt||0)-(a.updatedAt||0);
  });

}

function afficherEvaluation(nom,evaluations){

document.getElementById("sessionNom").textContent=nom;

document.getElementById("nom").textContent=nom;

let entrees=trierEvaluationsParDate(evaluations);

if(entrees.length===0){

document.getElementById("contenu").innerHTML="<p class='bientot-disponible'>Aucune évaluation disponible pour le moment.</p>";

return;

}

let html="<div class='historique-evaluations'>";

entrees.forEach((e,index)=>{

html+="<details"+(index===0 ? " open" : "")+">";

html+="<summary></summary>";

html+="<div class='evaluation-entree' data-resume-id='"+e.id+"'>";

html+="<div class='note-container-box'>";

html+="<h3>Résultat général</h3>";

html+="<h2 data-note-id='"+e.id+"'></h2>";

html+="</div>";

html+="<h3>Exercice 1 - Main gauche</h3>";

html+=tableau(e.mainGauche);

html+="<h3>Exercice 2 - Main droite</h3>";

html+=tableau(e.mainDroite);

html+="<hr style='margin:5px auto; border:none; border-top:1px solid #ccc; width:80%;'>";

html+="<div class='rapport-contenu' data-rapport-id='"+e.id+"'></div>";

html+="</div>";

html+="</details>";

});

html+="</div>";

document.getElementById("contenu").innerHTML=html;

entrees.forEach(e=>{

document.querySelector("[data-resume-id='"+e.id+"']").previousElementSibling.textContent = (e.titre || "Évaluation")+" du "+(e.date || "date inconnue");

document.querySelector("[data-rapport-id='"+e.id+"']").innerHTML = e.rapport || "";

let noteGlobale=(totalNote(e.mainGauche)+totalNote(e.mainDroite))/2;

let noteTexte=Number.isInteger(noteGlobale) ? noteGlobale+" /20" : noteGlobale.toFixed(1).replace(".",",")+" /20";

let noteElement=document.querySelector("[data-note-id='"+e.id+"']");

noteElement.textContent=noteTexte;

noteElement.style.color=obtenirCouleurNote(noteTexte);

});

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

}

function chargerProfilAdmin(uid){

database.ref('membres/' + uid).once('value').then(snapshot=>{

let m=snapshot.val();

if(!m){return;}

document.getElementById("adminIdentifiant").value=m.identifiant || "";

document.getElementById("adminIdentifiant").disabled=true;

document.getElementById("adminNom").value=m.nom || "";

document.getElementById("adminPrenom").value=m.prenom || "";

document.getElementById("adminRole").value=m.role || "membre";

document.getElementById("adminMotDePasseInitialWrapper").style.display="none";

document.getElementById("adminEnregistrerBtn").style.display="";

document.getElementById("adminCreerBtn").style.display="none";

}).catch(error=>{

alert("Erreur de chargement de la fiche");

console.error(error);

});

}

function viderHistoriqueAdmin(){

document.getElementById("adminHistoriqueEvaluations").innerHTML="<p class='bientot-disponible'>Sélectionnez un membre pour voir son historique.</p>";

}

function construireEntreeAdminHTML(evalId,uid,ouverte,nouvelle){

let html="";

html+="<details"+(ouverte ? " open" : "")+" data-id='"+evalId+"'"+(nouvelle ? " data-nouvelle='true'" : "")+">";

html+="<summary></summary>";

html+="<div class='evaluation-entree-admin'>";

html+="<div class='evaluation-entree-champs'>";

html+="<label>Titre de la séance<br><input type='text' id='ev_"+evalId+"_titre'></label>";

html+="<label>Date<br><input type='date' id='ev_"+evalId+"_date'></label>";

html+="<div class='piano-criteres-grid'>";

html+="<label>Posture au piano<br><input type='number' min='0' max='5' id='ev_"+evalId+"_posture'></label>";

for(let i=1;i<CRITERES.length;i++){

html+="<label>"+CRITERES[i]+" (G)<br><input type='number' min='0' max='5' id='ev_"+evalId+"_mg"+i+"'></label>";

html+="<label>"+CRITERES[i]+" (D)<br><input type='number' min='0' max='5' id='ev_"+evalId+"_md"+i+"'></label>";

}

html+="</div>";

html+="<label>Rapport (HTML)<br><textarea id='ev_"+evalId+"_rapport' rows='6'></textarea></label>";

html+="<p id='ev_"+evalId+"_derniereModif' style='color:#888;font-size:12px;'></p>";

html+="</div>";

html+="<div class='evaluation-entree-actions'>";

html+="<button type='button' class='btn-compact' onclick=\"enregistrerEvaluationEntree('"+uid+"','"+evalId+"',this)\">Enregistrer</button>";

html+="<button type='button' class='btn-compact' onclick=\"annulerEntreeAdmin('"+uid+"','"+evalId+"',this.closest('details'))\">Annuler</button>";

html+="<button type='button' class='btn-compact' disabled title='Bientôt disponible'>Supprimer</button>";

html+="</div>";

html+="</div>";

html+="</details>";

return html;

}

function remplirEntreeAdmin(e){

document.querySelector("details[data-id='"+e.id+"'] summary").textContent = (e.titre || "Évaluation")+" du "+(e.date || "date inconnue");

document.getElementById("ev_"+e.id+"_titre").value = e.titre || "";

document.getElementById("ev_"+e.id+"_date").value = e.date || "";

document.getElementById("ev_"+e.id+"_posture").value = (e.mainGauche && e.mainGauche[0]) ? e.mainGauche[0][1] : 0;

for(let i=1;i<CRITERES.length;i++){

document.getElementById("ev_"+e.id+"_mg"+i).value = (e.mainGauche && e.mainGauche[i]) ? e.mainGauche[i][1] : 0;

document.getElementById("ev_"+e.id+"_md"+i).value = (e.mainDroite && e.mainDroite[i]) ? e.mainDroite[i][1] : 0;

}

document.getElementById("ev_"+e.id+"_rapport").value = e.rapport || "";

document.getElementById("ev_"+e.id+"_derniereModif").textContent = e.updatedAt ? "Dernière modification : "+new Date(e.updatedAt).toLocaleString("fr-FR") : "";

}

function annulerEntreeAdmin(uid,evalId,detailsElement){

if(detailsElement.dataset.nouvelle==="true"){

detailsElement.remove();

return;

}

database.ref('evaluationsPiano/' + uid + '/' + evalId).once('value').then(snapshot=>{

let e=snapshot.val();

if(!e){detailsElement.remove();return;}

remplirEntreeAdmin(Object.assign({id:evalId}, e));

}).catch(error=>{

alert("Erreur lors de l'annulation");

console.error(error);

});

}

function construireAccordeonAdmin(uid,evaluations){

let conteneur=document.getElementById("adminHistoriqueEvaluations");

let entrees=trierEvaluationsParDate(evaluations);

if(entrees.length===0){

conteneur.innerHTML="<p class='bientot-disponible'>Aucune évaluation pour ce membre.</p>";

return;

}

conteneur.innerHTML = entrees.map((e,index)=>construireEntreeAdminHTML(e.id,uid,index===0)).join("");

entrees.forEach(remplirEntreeAdmin);

}

function chargerHistoriqueAdmin(uid){

database.ref('evaluationsPiano/' + uid).once('value').then(snapshot=>{

let data=snapshot.val();

if(data && data.mainGauche){

let cle=database.ref('evaluationsPiano/' + uid).push().key;

let entreeMigree={

titre: "Évaluation",

date: "2026-06-27",

mainGauche: data.mainGauche,

mainDroite: data.mainDroite,

rapport: data.rapport || "",

createdBy: auth.currentUser.uid,

updatedBy: auth.currentUser.uid,

updatedAt: data.updatedAt || firebase.database.ServerValue.TIMESTAMP

};

let nouvelleValeur={};

nouvelleValeur[cle]=entreeMigree;

return database.ref('evaluationsPiano/' + uid).set(nouvelleValeur).then(()=>nouvelleValeur);

}

return data;

}).then(data=>{

construireAccordeonAdmin(uid, data || {});

}).catch(error=>{

alert("Erreur de chargement de l'historique");

console.error(error);

});

}

function enregistrerEvaluationEntree(uid,evalId,bouton){

let titre=document.getElementById("ev_"+evalId+"_titre").value.trim();

let date=document.getElementById("ev_"+evalId+"_date").value;

if(!date){

alert("La date de la séance est obligatoire");

return;

}

if(!confirm("Enregistrer cette évaluation ?")){

return;

}

let posture=parseInt(document.getElementById("ev_"+evalId+"_posture").value)||0;

let mainGauche=[[CRITERES[0],posture]];

let mainDroite=[[CRITERES[0],posture]];

for(let i=1;i<CRITERES.length;i++){

mainGauche.push([CRITERES[i], parseInt(document.getElementById("ev_"+evalId+"_mg"+i).value)||0]);

mainDroite.push([CRITERES[i], parseInt(document.getElementById("ev_"+evalId+"_md"+i).value)||0]);

}

let rapport=document.getElementById("ev_"+evalId+"_rapport").value;

bouton.disabled=true;

bouton.textContent="Enregistrement...";

let refEntree=database.ref('evaluationsPiano/' + uid + '/' + evalId);

refEntree.once('value').then(snapshot=>{

let existant=snapshot.val();

let miseAJour={

titre: titre,

date: date,

mainGauche: mainGauche,

mainDroite: mainDroite,

rapport: rapport,

updatedBy: auth.currentUser.uid,

updatedAt: firebase.database.ServerValue.TIMESTAMP

};

if(!existant || !existant.createdBy){

miseAJour.createdBy=auth.currentUser.uid;

}

return refEntree.update(miseAJour);

}).then(()=>{

chargerHistoriqueAdmin(uid);

}).catch(error=>{

alert("Erreur lors de l'enregistrement de l'évaluation");

console.error(error);

}).finally(()=>{

bouton.disabled=false;

bouton.textContent="Enregistrer";

});

}

function nouvelleEvaluationAdmin(uid){

if(!uid){

alert("Sélectionnez d'abord un membre");

return;

}

let cle=database.ref('evaluationsPiano/' + uid).push().key;

let conteneur=document.getElementById("adminHistoriqueEvaluations");

if(conteneur.querySelector(".bientot-disponible")){

conteneur.innerHTML="";

}

conteneur.querySelectorAll("details").forEach(d=>d.removeAttribute("open"));

conteneur.insertAdjacentHTML("afterbegin", construireEntreeAdminHTML(cle,uid,true,true));

document.getElementById("ev_"+cle+"_titre").value="";

document.getElementById("ev_"+cle+"_date").valueAsDate=new Date();

document.querySelector("details[data-id='"+cle+"'] summary").textContent="Nouvelle évaluation";

}

function chargerListeAdmin(){

database.ref('membres').once('value').then(snapshot=>{

let membres=snapshot.val() || {};

let select=document.getElementById("adminSelectEleve");

select.innerHTML="<option value=''>Sélectionner un membre</option>";

let corpsTableau=document.getElementById("adminMembresTableBody");

corpsTableau.innerHTML="";

let identifiants=Object.keys(membres);

identifiants.forEach(uid=>{

    let m=membres[uid];

    let option=document.createElement("option");

    option.value=uid;

    option.textContent=(m.nom || "")+" ("+(m.identifiant || "")+")";

    select.appendChild(option);

    let carte=document.createElement("div");

    carte.className="membre-carte";

    carte.dataset.identifiant=m.identifiant || "";

    let role=m.role==="admin" ? "Admin" : "Membre";

    let badgeClasse=m.role==="admin" ? "badge-admin" : "badge-membre";

    let nomEchappe = echapperHTML(m.nom || "");
    let prenomEchappe = echapperHTML(m.prenom || "");

    carte.innerHTML="<div class='membre-nom'>"+nomEchappe+" "+prenomEchappe+"</div><div class='membre-actions'><span class='badge "+badgeClasse+"'>"+role+"</span><a href='#' onclick=\"voirMembreAdmin('"+uid+"');return false;\">Voir</a> / <a href='#' onclick=\"selectionnerMembreAdmin('"+uid+"');return false;\">Modifier</a></div>";

    corpsTableau.appendChild(carte);

});

document.getElementById("adminTotalMembres").textContent="Total membres : "+identifiants.length;

}).catch(error=>{

alert("Erreur de chargement de la liste des membres");

console.error(error);

});

}

function ouvrirModal(id){

document.getElementById(id).style.display="flex";

}

function fermerModal(id){

document.getElementById(id).style.display="none";

}

function selectionnerMembreAdmin(uid){

document.getElementById("adminSelectEleve").value=uid;

chargerProfilAdmin(uid);

chargerHistoriqueAdmin(uid);

document.getElementById("modalMembreTitre").textContent="Modifier le membre";

ouvrirModal("modalMembre");

}

function voirMembreAdmin(uid){

database.ref('membres/' + uid).once('value').then(snapshot=>{

let m=snapshot.val();

if(!m){return;}

document.getElementById("voirIdentifiant").textContent=m.identifiant || "";

document.getElementById("voirNom").textContent=m.nom || "";

document.getElementById("voirPrenom").textContent=m.prenom || "";

document.getElementById("voirRole").textContent = m.role==="admin" ? "Admin" : "Membre";

ouvrirModal("modalVoirMembre");

}).catch(error=>{

alert("Erreur de chargement de la fiche");

console.error(error);

});

}

function nouveauMembreForm(){

document.getElementById("adminSelectEleve").value="";

viderFormulaireAdmin();

viderHistoriqueAdmin();

document.getElementById("modalMembreTitre").textContent="Nouveau membre";

ouvrirModal("modalMembre");

document.getElementById("adminIdentifiant").focus();

}

function enregistrerProfil(){

let uid=document.getElementById("adminSelectEleve").value;

let identifiant=document.getElementById("adminIdentifiant").value.trim();

let nom=document.getElementById("adminNom").value.trim();

let prenom=document.getElementById("adminPrenom").value.trim();

let role=document.getElementById("adminRole").value;

if(!uid || !identifiant || !nom){

alert("Identifiant et nom obligatoires");

return;

}

if(!confirm("Enregistrer les modifications pour "+nom+" ?")){

return;

}

let bouton=document.getElementById("adminEnregistrerBtn");

bouton.disabled=true;

bouton.textContent="Enregistrement...";

let profil={

identifiant: identifiant,

nom: nom,

prenom: prenom,

role: role

};

database.ref('membres/' + uid).update(profil)
  .then(()=>{
    chargerListeAdmin();
    fermerModal("modalMembre");
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
  .then(()=>{
    alert("Compte créé");
    viderFormulaireAdmin();
    chargerListeAdmin();
    fermerModal("modalMembre");
  })
  .catch(error=>{
    alert("Erreur lors de la création du compte : "+error.code+" - "+error.message);
    console.error(error);
  })
  .finally(()=>{
    bouton.disabled=false;
    bouton.textContent="Créer le compte";
  });

}

viderFormulaireAdmin();

document.getElementById("adminSelectEleve").addEventListener("change",function(){

if(this.value){

chargerHistoriqueAdmin(this.value);

} else {

viderHistoriqueAdmin();

}

});

document.getElementById("adminRechercheMembre").addEventListener("input",function(){

let filtre=this.value.toLowerCase();

document.querySelectorAll("#adminMembresTableBody .membre-carte").forEach(carte=>{

let texteRecherchable=(carte.textContent+" "+carte.dataset.identifiant).toLowerCase();

carte.style.display = texteRecherchable.includes(filtre) ? "" : "none";

});

});
