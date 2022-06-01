var  firebase = require('firebase-admin');
var firebaseConfig = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAi-mitwXb4VYIZo9p-FXCwzMeHSsknCnY",
//   authDomain: "feather-340809.firebaseapp.com",
//   databaseURL: "https://feather-340809-default-rtdb.firebaseio.com",
//   projectId: "feather-340809",
//   storageBucket: "feather-340809.appspot.com",
//   messagingSenderId: "310047587893",
//   appId: "1:310047587893:web:8d699a2dcacffefa39fb7c"
// };

// Initialize Firebase
let app = firebase.initializeApp(firebase.credential.cert(firebaseConfig));

exports.database = firebase.firestore().collection('wallet')
