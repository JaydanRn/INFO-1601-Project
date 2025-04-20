import firebaseConfig from "./firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Generate default username function
function generateDefaultUsername(email) {
  // Clean the email prefix by removing special characters
  const prefix = (email.split('@')[0] || 'user')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .substring(0, 15); // Limit length
  
  const randomNum = Math.floor(Math.random() * 10000);
  return `${prefix}${randomNum}`;
}

document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  
  try {
    // 1. Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Generate default username
    const username = generateDefaultUsername(email);
    
    // 3. Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      isCustomUsername: false, // Flag to track if username was customized
      createdAt: new Date(),
      lastLogin: new Date()
    });

    alert(`Registration successful! Your username is: ${username}`);
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