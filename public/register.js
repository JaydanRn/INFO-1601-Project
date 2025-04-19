import firebaseConfig from "./firebaseConfig.js"; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Generate default username (e.g., "user" + random number)
function generateDefaultUsername(email) {
  const prefix = email.split('@')[0] || 'user';
  const randomNum = Math.floor(Math.random() * 10000);
  return `${prefix}${randomNum}`.toLowerCase();
}

const submit = document.getElementById("submit");
submit.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    alert("User created successfully!");
    window.location.href = "login.html"; // Redirect to the login page
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert("Error creating user: " + errorMessage);
    // ..
  });
})