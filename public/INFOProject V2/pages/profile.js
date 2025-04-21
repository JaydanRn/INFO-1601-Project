import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "/public/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const profileNameEl = document.querySelector(".profile-name");
const profileEmailEl = document.querySelector(".profile-email");
const profileCreatedEl = document.getElementById("account-created");
const postsCountEl = document.getElementById("posts-count");
const favoritesCountEl = document.getElementById("favorites-count");
const commentsCountEl = document.getElementById("comments-count");

// Fetch and Display User Information
async function fetchUserProfile(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      profileNameEl.textContent = userData.username || "Anonymous";
      profileEmailEl.textContent = userData.email || "No email provided";
      profileCreatedEl.textContent = userData.createdAt
        ? new Date(userData.createdAt.toDate()).toLocaleDateString()
        : "Unknown";
    } else {
      console.error("User document does not exist.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

// Fetch and Count User's Spots
async function fetchUserSpots(userId) {
  try {
    const spotsRef = collection(db, "spots");
    const q = query(spotsRef, where("user", "==", userId));
    const querySnapshot = await getDocs(q);
    postsCountEl.textContent = querySnapshot.size; // Number of spots
  } catch (error) {
    console.error("Error fetching user spots:", error);
  }
}

// Fetch and Count User's Favorites
async function fetchUserFavorites(userId) {
  try {
    const favoritesDocRef = doc(db, "favorites", userId);
    const favoritesDoc = await getDoc(favoritesDocRef);

    if (favoritesDoc.exists()) {
      const favoritesData = favoritesDoc.data();
      const favoriteSpots = favoritesData.spots || {}; // Assuming the map is stored under "spots"
      favoritesCountEl.textContent = Object.keys(favoriteSpots).length; // Count the number of spot IDs
    } else {
      favoritesCountEl.textContent = 0; // No favorites for this user
    }
  } catch (error) {
    console.error("Error fetching user favorites:", error);
  }
}

// Fetch and Count User's Comments
async function fetchUserComments(userId) {
    try {
      const commentsRef = collection(db, "comments");
      const querySnapshot = await getDocs(commentsRef);
  
      let totalComments = 0;
  
      querySnapshot.forEach((doc) => {
        const commentsData = doc.data().comments || {}; // Access the 'comments' map
  
        // Iterate through the 'comments' map
        Object.values(commentsData).forEach((comment) => {
          if (comment.userId === userId) { // Check if the userId matches
            totalComments++;
          }
        });
      });
  
      commentsCountEl.textContent = totalComments; // Update the comments count in the DOM
    } catch (error) {
      console.error("Error fetching user comments:", error);
    }
  }

// Initialize Profile Page
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;

    // Fetch and display user data
    fetchUserProfile(userId);
    fetchUserSpots(userId);
    fetchUserFavorites(userId);
    fetchUserComments(userId);
  } else {
    console.error("No user is signed in.");
    window.location.href = "login.html"; // Redirect to login if not authenticated
  }
});