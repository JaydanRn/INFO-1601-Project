import firebaseConfig from "/public/firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("signup-submit").addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("su-email").value;
  const password = document.getElementById("su-password").value;
  const confirmPassword = document.getElementById("su-confirm").value; // Get the confirmation password
  const username = document.getElementById("su-username").value;
  const dob = document.getElementById("su-dob").value;

  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return; // Stop the signup process
  }

  try {
    // Check if the username is unique
    const usersRef = collection(db, "users");
    const usernameQuery = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(usernameQuery);

    if (!querySnapshot.empty) {
      alert("This username is already taken. Please choose a different username.");
      return; // Stop the signup process
    }

    // 1. Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      password: password, // Store the password (not recommended in plaintext; use hashing in production)
      dob: dob,
      createdAt: new Date(),
    });

    alert(`Registration successful! Welcome, ${username}!`);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Registration error:", error);

    // User-friendly error messages
    let errorMessage = "Registration failed. Please try again.";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters.";
    }

    alert(errorMessage);
  }
});