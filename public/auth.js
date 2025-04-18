// Import the Firebase app and authentication modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"; // Import Firebase Realtime Database
import firebaseConfig from "./firebaseConfig.js"; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Initialize the database
/**
 * Function to log in a user with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise} - Resolves with user credentials or rejects with an error
 */
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
}

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
      const db = getDatabase(app); // Initialize the database
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

export { registerUser, loginUser};