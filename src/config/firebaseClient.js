const {initializeApp} = require('firebase/app');
const {getAuth} = require('firebase/auth');



const firebaseConfig = {
    apiKey: "AIzaSyA_Q3B_YxDSO0ocQTKHx68MBUWByvc_2rA",
    authDomain: "sodam-server-authentication.firebaseapp.com",
    projectId: "sodam-server-authentication",
    storageBucket: "sodam-server-authentication.appspot.com",
    messagingSenderId: "678407056345",
    appId: "1:678407056345:web:69436cec79115d39f087c8"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

module.exports = {firebaseApp, firebaseAuth, firebaseConfig};