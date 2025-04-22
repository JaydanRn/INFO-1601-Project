import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the spot ID from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get("spotId");

// === Authentication Functions ===
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showToast("Successfully logged out");
        // Redirect after successful logout
        window.location.href = '../pages/login.html'; 
      } catch (error) {
        console.error("Logout failed:", error);
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

// === Spot Details Functions ===
async function fetchSpotDetails() {
  if (!spotId) {
    document.querySelector(".spot-details").innerHTML = "<p>Invalid spot ID.</p>";
    return;
  }

  try {
    const spotDoc = await getDoc(doc(db, "spots", spotId));
    if (spotDoc.exists()) {
      displaySpotDetails(spotDoc.data());
    } else {
      document.querySelector(".spot-details").innerHTML = "<p>Spot not found.</p>";
    }
  } catch (error) {
    console.error("Error fetching spot details:", error);
    document.querySelector(".spot-details").innerHTML = "<p>Failed to load spot details.</p>";
  }
}

function displaySpotDetails(spotData) {
  document.getElementById("spot-name").textContent = spotData.name || "Spot Name";
  document.getElementById("spot-location").textContent = spotData.location || "Location not available";
  document.getElementById("spot-category").textContent = spotData.category || "Category not available";
  
  const rating = spotData.rating || 0;
  document.getElementById("spot-rating-display").innerHTML = "★".repeat(rating) + "☆".repeat(5 - rating);
  
  document.getElementById("spot-description").textContent = spotData.description || "No description available.";
}

// === Favorites Functions ===
async function addToFavorites(userId) {
  try {
    const userFavoritesRef = doc(db, "favorites", userId);
    const docSnapshot = await getDoc(userFavoritesRef);
    
    if (docSnapshot.exists()) {
      await updateDoc(userFavoritesRef, {
        [`spots.${spotId}`]: true
      });
    } else {
      await setDoc(userFavoritesRef, {
        spots: { [spotId]: true }
      });
    }

    document.getElementById("favorite-text").textContent = "Added to Favorites!";
    showToast("Added to Favorites!");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    showToast("Failed to add to favorites", true);
  }
}

// === Comments Functions ===
async function fetchComments() {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "<p>Loading comments...</p>";

  try {
    const commentsDoc = await getDoc(doc(db, "comments", spotId));
    await displayCommentCount();
    
    if (commentsDoc.exists()) {
      const commentsData = commentsDoc.data().comments || {};
      commentsList.innerHTML = "";

      Object.entries(commentsData).forEach(([_, comment]) => {
        const commentEl = document.createElement("div");
        commentEl.classList.add("comment");
        commentEl.innerHTML = `
          <p class="comment-user"><strong>${comment.user || "Anonymous"}</strong></p>
          <p class="comment-text">${comment.text || ""}</p>
        `;
        commentsList.appendChild(commentEl);
      });

      if (Object.keys(commentsData).length === 0) {
        commentsList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
      }
    } else {
      commentsList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    commentsList.innerHTML = "<p>Failed to load comments.</p>";
  }
}

async function submitComment(event) {
  event.preventDefault();

  const commentInput = document.getElementById("comment-input");
  const commentText = commentInput.value.trim();

  if (!commentText) {
    showToast("Comment cannot be empty.", true);
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      showToast("Please log in to comment", true);
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const username = userDoc.exists() ? userDoc.data().username : "Anonymous";

    const commentId = `comment-${Date.now()}`;
    await updateDoc(doc(db, "comments", spotId), {
      [`comments.${commentId}`]: {
        userId: user.uid,
        user: username,
        text: commentText,
      },
    });

    commentInput.value = "";
    await fetchComments();
    showToast("Comment submitted!");
  } catch (error) {
    console.error("Error submitting comment:", error);
    showToast("Failed to submit comment", true);
  }
}

async function displayCommentCount() {
  try {
    const commentsDoc = await getDoc(doc(db, "comments", spotId));
    let count = commentsDoc.exists() ? Object.keys(commentsDoc.data().comments || {}).length : 0;
    document.getElementById("comment-count").textContent = `${count} ${count === 1 ? 'Comment' : 'Comments'}`;
  } catch (error) {
    console.error("Error counting comments:", error);
  }
}

// === Initialize Page ===
function initializePage(user) {
  // Enable/disable features based on auth state
  const commentForm = document.getElementById("comment-form");
  const favoriteBtn = document.getElementById("favorite-btn");
  
  if (!user) {
    commentForm.style.opacity = "0.7";
    favoriteBtn.disabled = true;
  }
}

// Setup event listeners
document.getElementById("favorite-btn").addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    addToFavorites(user.uid);
  } else {
    showToast("Please log in to add favorites", true);
  }
});

document.getElementById("comment-form").addEventListener("submit", submitComment);

// Main initialization
onAuthStateChanged(auth, (user) => {
  initializePage(user);
  setupLogout();
  fetchSpotDetails();
  fetchComments();
});