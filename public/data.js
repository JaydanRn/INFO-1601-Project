import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"; // Import Firebase Realtime Database
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";
/**
 * Function to register a new user with email and password and save their information to Firebase
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @param {string} username - The user's username or additional information
 * @returns {Promise} - Resolves with user credentials or rejects with an error
 */
async function registerUser(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful:", userCredential.user);
  
      // Save additional user information to Firebase Realtime Database
      const db = getDatabase(); // Initialize the database
      const userId = userCredential.user.uid; // Get the user's unique ID
      await set(ref(db, `users/${userId}`), {
        username: username,
        email: email,
      });
  
      console.log("User information saved to database.");
      return userCredential.user;
    } catch (error) {
      console.error("Error registering user:", error.message);
      throw error;
    }
  }

export { registerUser };
