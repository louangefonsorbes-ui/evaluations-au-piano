const firebaseConfig = {
  apiKey: "AIzaSyA3XB1v3Rkm52dLnT_UFSee_gKEYhc9ZdU",
  authDomain: "evaluation-piano.firebaseapp.com",
  databaseURL: "https://evaluation-piano-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "evaluation-piano",
  storageBucket: "evaluation-piano.firebasestorage.app",
  messagingSenderId: "680817556214",
  appId: "1:680817556214:web:d99d54fbd241313cbfcad7"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();