import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Add event listener to the login button
document.getElementById("login-btn").addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;

  try {
    // Authenticate user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Retrieve the username from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const username = userDoc.data().username;

      // Update last login time in Firestore
      await updateDoc(userDocRef, {
        lastLogin: new Date() // Set the current timestamp as the last login time
      });

      // Display a welcome message with the username
      alert(`Welcome back, ${username}!`);
      window.location.href = "home.html"; // Redirect to the homepage
    } else {
      console.error("User document does not exist in Firestore.");
      alert("An error occurred. Please try again later.");
    }
  } catch (error) {
    console.error("Login error:", error);

    // User-friendly error messages
    let errorMessage = "Login failed. Please try again.";
    if (error.code === "auth/user-not-found") {
      errorMessage = "No user found with this email.";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format.";
    }

    alert(errorMessage);
  }
  });
