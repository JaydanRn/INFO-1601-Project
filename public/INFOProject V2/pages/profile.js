import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
const editProfileBtn = document.getElementById("edit-profile");

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
    postsCountEl.textContent = querySnapshot.size;
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
      const favoriteSpots = favoritesData.spots || {};
      favoritesCountEl.textContent = Object.keys(favoriteSpots).length;
    } else {
      favoritesCountEl.textContent = 0;
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
      const commentsData = doc.data().comments || {};
      Object.values(commentsData).forEach((comment) => {
        if (comment.userId === userId) {
          totalComments++;
        }
      });
    });

    commentsCountEl.textContent = totalComments;
  } catch (error) {
    console.error("Error fetching user comments:", error);
  }
}

// Edit Profile Functionality
function setupEditProfile(userId) {
  editProfileBtn.addEventListener("click", () => {
    const currentName = profileNameEl.textContent;
    const currentEmail = profileEmailEl.textContent;

    // Create input fields
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = currentName;
    nameInput.className = "profile-edit-input";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = currentEmail;
    emailInput.className = "profile-edit-input";

    // Replace text with inputs
    profileNameEl.replaceWith(nameInput);
    profileEmailEl.replaceWith(emailInput);

    // Create save/cancel buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "profile-edit-buttons";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn-secondary";
    saveBtn.textContent = "Save";
    
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-primary";
    cancelBtn.textContent = "Cancel";

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    editProfileBtn.replaceWith(buttonContainer);

    // Save handler
    saveBtn.addEventListener("click", async () => {
      const newName = nameInput.value.trim();
      const newEmail = emailInput.value.trim();

      if (!newName) {
        alert("Username cannot be empty");
        return;
      }

      if (!newEmail || !newEmail.includes("@")) {
        alert("Please enter a valid email");
        return;
      }

      try {
        await updateDoc(doc(db, "users", userId), {
          username: newName,
          email: newEmail
        });

        // Update UI
        profileNameEl.textContent = newName;
        profileEmailEl.textContent = newEmail;

        nameInput.replaceWith(profileNameEl);
        emailInput.replaceWith(profileEmailEl);
        buttonContainer.replaceWith(editProfileBtn);

        showToast("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    });

    // Cancel handler
    cancelBtn.addEventListener("click", () => {
      nameInput.replaceWith(profileNameEl);
      emailInput.replaceWith(profileEmailEl);
      buttonContainer.replaceWith(editProfileBtn);
    });
  });
}

// Initialize Profile Page
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    fetchUserProfile(userId);
    fetchUserSpots(userId);
    fetchUserFavorites(userId);
    fetchUserComments(userId);
    setupEditProfile(userId);
  } else {
    window.location.href = "login.html";
  }
});

// === Toast ===
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => t.remove(), 3000);
}