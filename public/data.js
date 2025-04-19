// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

async function saveUserToFirestore(email, password) {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        const userData = {
            email: email,
            password: password, // Avoid storing plain passwords in production; use hashing instead
        };

        // Add the user data to the "users" collection
        await addDoc(collection(db, "Users"), userData);
        console.log("User data saved successfully to Firestore!");
    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
        throw error;
    }
}

document.getElementById("login-btn").addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        await saveUserToFirestore(email, password);
        alert("User registered successfully!");
        window.location.href = "./login.html"; // Redirect to login page
    } catch (error) {
        alert("Error registering user: " + error.message);
    }
});