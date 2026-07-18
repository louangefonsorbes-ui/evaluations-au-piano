
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

let sessionSauvegardee=localStorage.getItem("identifiant");

if(sessionSauvegardee){

chargerEleve(sessionSauvegardee);

}

