import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

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
const logoutBtn = document.getElementById("logout-btn");

// === Authentication Functions ===
function setupLogout() {
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showToast("Successfully logged out");
        // Redirect after successful logout
        window.location.href = '../pages/login.html';
      } catch (error) {
        console.error("Error signing out:", error);
        showToast("Failed to log out", true);
      }
    });
  }
}

// === Toast Function ===
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// === Profile Data Functions ===
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
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    showToast("Failed to load profile", true);
  }
}

async function fetchUserSpots(userId) {
  try {
    const spotsRef = collection(db, "spots");
    const q = query(spotsRef, where("user", "==", userId));
    const querySnapshot = await getDocs(q);
    postsCountEl.textContent = querySnapshot.size;
  } catch (error) {
    console.error("Error fetching user spots:", error);
    showToast("Failed to load spots", true);
  }
}

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
    showToast("Failed to load favorites", true);
  }
}

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
    showToast("Failed to load comments", true);
  }
}

// === Edit Profile Function ===
function setupEditProfile(userId) {
  editProfileBtn.addEventListener("click", () => {
    const currentName = profileNameEl.textContent;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = currentName;
    nameInput.className = "profile-edit-input";
    nameInput.placeholder = "Enter new username";

    profileNameEl.replaceWith(nameInput);

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

    saveBtn.addEventListener("click", async () => {
      const newName = nameInput.value.trim();

      if (!newName) {
        showToast("Username cannot be empty", true);
        return;
      }

      try {
        await updateDoc(doc(db, "users", userId), {
          username: newName
        });

        profileNameEl.textContent = newName;
        nameInput.replaceWith(profileNameEl);
        buttonContainer.replaceWith(editProfileBtn);
        showToast("Username updated successfully!");
      } catch (error) {
        console.error("Error updating username:", error);
        showToast("Failed to update username", true);
      }
    });

    cancelBtn.addEventListener("click", () => {
      nameInput.replaceWith(profileNameEl);
      buttonContainer.replaceWith(editProfileBtn);
    });
  });
}

// === Initialize Page ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    setupLogout();
    const userId = user.uid;
    fetchUserProfile(userId);
    fetchUserSpots(userId);
    fetchUserFavorites(userId);
    fetchUserComments(userId);
    setupEditProfile(userId);
  } else {
    alert("Logged out.");
    window.location.href = '../pages/login.html';
  }
});