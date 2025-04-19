// Import the Firebase app and authentication modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js"; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submit = document.getElementById("login-btn");

submit.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            alert("User signed in successfully!");
            window.location.href = "./Home Page/homepage.html"; // Redirect to the index page
            // Redirect to another page or perform other actions
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Error signing in: " + errorMessage);
        });
});


