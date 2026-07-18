
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

function chargerEleve(id){

database.ref('eleves/' + id).once('value')
  .then(snapshot => {
    let e = snapshot.val();

    if(!e){
      localStorage.removeItem("identifiant");
      alert("Identifiant inconnu");
      return;
    }

    localStorage.setItem("identifiant", id);

    document.getElementById("loginScreen").style.display="none";

    document.getElementById("appShell").style.display="flex";

    document.getElementById("sessionNom").innerHTML=e.nom;

    document.getElementById("nom").innerHTML=e.nom;

    let noteElement=document.getElementById("note");

    if(!e.mainGauche || !e.mainDroite){

      noteElement.innerHTML="—";

      noteElement.style.color="#888";

      document.getElementById("contenu").innerHTML="<p class='bientot-disponible'>Aucune évaluation disponible pour le moment.</p>";

      return;

    }

    let noteGlobale=(totalNote(e.mainGauche)+totalNote(e.mainDroite))/2;

    let noteTexte=Number.isInteger(noteGlobale) ? noteGlobale+" /20" : noteGlobale.toFixed(1).replace(".",",")+" /20";

    noteElement.innerHTML=noteTexte;

    let couleur=obtenirCouleurNote(noteTexte);

    noteElement.style.color=couleur;

    let html="";

    html+="<h3>Exercice 1 - Main gauche</h3>";

    html+=tableau(e.mainGauche);

    html+="<h3>Exercice 2 - Main droite</h3>";

    html+=tableau(e.mainDroite);

    html+="<hr style='margin:5px auto; border:none; border-top:1px solid #ccc; width:80%;'>";

    html+=e.rapport;

    document.getElementById("contenu").innerHTML=html;
  })
  .catch(error => {
    alert("Erreur de connexion à la base de données");
    console.error(error);
  });

}

function connexion(){

let id=document.getElementById("identifiant").value.toUpperCase();

chargerEleve(id);

}

function deconnexion(){

localStorage.removeItem("identifiant");

document.getElementById("appShell").style.display="none";

document.getElementById("loginScreen").style.display="flex";

document.getElementById("identifiant").value="";

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelector('.nav-btn[data-tab="piano"]').classList.add("active");

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

document.getElementById("tab-piano").style.display="block";

}

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

remplirCriteres("adminMG",[]);

remplirCriteres("adminMD",[]);

document.getElementById("adminRapport").value="";

document.getElementById("adminDerniereModif").textContent="";

}

function chargerEleveAdmin(id){

database.ref('eleves/' + id).once('value').then(snapshot=>{

let e=snapshot.val();

if(!e){return;}

document.getElementById("adminIdentifiant").value=id;

document.getElementById("adminIdentifiant").disabled=true;

document.getElementById("adminNom").value=e.nom || "";

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

database.ref('eleves').once('value').then(snapshot=>{

let eleves=snapshot.val() || {};

let select=document.getElementById("adminSelectEleve");

select.innerHTML="<option value=''>Nouvel élève</option>";

Object.keys(eleves).forEach(id=>{

let option=document.createElement("option");

option.value=id;

option.textContent=eleves[id].nom+" ("+id+")";

select.appendChild(option);

});

}).catch(error=>{

alert("Erreur de chargement de la liste des élèves");

console.error(error);

});

}

function enregistrerEleve(){

let id=document.getElementById("adminIdentifiant").value.trim().toUpperCase();

let nom=document.getElementById("adminNom").value.trim();

if(!id || !nom){

alert("Identifiant et nom sont obligatoires");

return;

}

if(!confirm("Enregistrer les modifications pour "+nom+" ("+id+") ?")){

return;

}

let bouton=document.getElementById("adminEnregistrerBtn");

bouton.disabled=true;

bouton.textContent="Enregistrement...";

let donnees={

nom: nom,

mainGauche: lireCriteres("adminMG"),

mainDroite: lireCriteres("adminMD"),

rapport: document.getElementById("adminRapport").value,

updatedAt: firebase.database.ServerValue.TIMESTAMP

};

database.ref('eleves/' + id).update(donnees)
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

function activerOngletAdmin(){

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

document.getElementById("navAdmin").classList.add("active");

document.getElementById("tab-admin").style.display="block";

document.getElementById("loginScreen").style.display="none";

document.getElementById("appShell").style.display="flex";

}

function afficherLoginAdmin(){

document.getElementById("loginAdmin").style.display="block";

}

function connexionAdmin(){

let email=document.getElementById("adminEmail").value;

let motDePasse=document.getElementById("adminMotDePasse").value;

auth.signInWithEmailAndPassword(email,motDePasse)
  .then(()=>{
    activerOngletAdmin();
  })
  .catch(error=>{
    alert("Connexion admin refusée");
    console.error(error);
  });

}

function deconnexionAdmin(){

auth.signOut().then(()=>{

document.getElementById("appShell").style.display="none";

document.getElementById("loginScreen").style.display="flex";

});

}

construireCriteres("adminCriteresGauche","adminMG");

construireCriteres("adminCriteresDroite","adminMD");

viderFormulaireAdmin();

document.getElementById("adminSelectEleve").addEventListener("change",function(){

if(this.value){

chargerEleveAdmin(this.value);

} else {

viderFormulaireAdmin();

}

});

auth.onAuthStateChanged(user=>{

let navAdmin=document.getElementById("navAdmin");

if(user){

navAdmin.style.display="";

if(document.getElementById("appShell").style.display==="none"){

activerOngletAdmin();

}

chargerListeAdmin();

} else {

navAdmin.style.display="none";

}

});

let sessionSauvegardee=localStorage.getItem("identifiant");

if(sessionSauvegardee){

chargerEleve(sessionSauvegardee);

}

