
document.querySelectorAll(".nav-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

btn.classList.add("active");

document.getElementById("tab-"+btn.dataset.tab).style.display="block";

});

});

function tableau(data,total){

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

function connexion(){

let id=document.getElementById("identifiant").value.toUpperCase();

database.ref('eleves/' + id).once('value')
  .then(snapshot => {
    let e = snapshot.val();
    
    if(!e){
      alert("Identifiant inconnu");
      return;
    }
    
    document.getElementById("loginScreen").style.display="none";

    document.getElementById("appShell").style.display="flex";

    document.getElementById("sessionNom").innerHTML=e.nom;

    document.getElementById("nom").innerHTML=e.nom;

    let noteElement=document.getElementById("note");

    if(!e.note){

      noteElement.innerHTML="—";

      noteElement.style.color="#888";

      document.getElementById("contenu").innerHTML="<p class='bientot-disponible'>Aucune évaluation disponible pour le moment.</p>";

      return;

    }

    noteElement.innerHTML=e.note;

    let couleur=obtenirCouleurNote(e.note);

    noteElement.style.color=couleur;

    let html="";

    html+="<h3>Exercice 1 - Main gauche</h3>";

    html+=tableau(e.mainGauche,10);

    html+="<h3>Exercice 2 - Main droite</h3>";

    html+=tableau(e.mainDroite,9);

    html+="<hr style='margin:5px auto; border:none; border-top:1px solid #ccc; width:80%;'>";

    html+=e.rapport;

    document.getElementById("contenu").innerHTML=html;
  })
  .catch(error => {
    alert("Erreur de connexion à la base de données");
    console.error(error);
  });

}

function deconnexion(){

document.getElementById("appShell").style.display="none";

document.getElementById("loginScreen").style.display="flex";

document.getElementById("identifiant").value="";

document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

document.querySelector('.nav-btn[data-tab="piano"]').classList.add("active");

document.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");

document.getElementById("tab-piano").style.display="block";

}

