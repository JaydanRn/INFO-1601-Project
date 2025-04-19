import firebaseConfig from "./firebaseConfig.js"; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
<<<<<<< HEAD
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
 
=======

>>>>>>> 52f54e1a3d047e5bf697da38b98db3b5b18fb939
const app = initializeApp(firebaseConfig);
const signUp = document.getElementById("submit");

<<<<<<< HEAD
signUp.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value;

    const auth = getAuth(app);
    const db = getFirestore(app); // Initialize Firestore

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    const userData = {
      email: email,
      username: username,
      password: password, // Avoid storing plain passwords in production; use hashing instead
    };
    alert("User created successfully!");
    const docRef = doc(db, "Users", user.uid); // Use the user's UID as the document ID
    setDoc(docRef, userData); // Save user data to Firestore
    window.location.href = "login.html"; // Redirect to the login page
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert("Error creating user: " + errorMessage);
  });
})



/*
const submit = document.getElementById("submitSignUp");
const auth = getAuth(app); // Initialize Firebase Authentication
=======
// Generate default username (e.g., "user" + random number)
function generateDefaultUsername(email) {
  const prefix = email.split('@')[0] || 'user';
  const randomNum = Math.floor(Math.random() * 10000);
  return `${prefix}${randomNum}`.toLowerCase();
}

const submit = document.getElementById("submit");
>>>>>>> 52f54e1a3d047e5bf697da38b98db3b5b18fb939
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
})*/