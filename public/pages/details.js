import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the spot ID from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get("spotId");

// Fetch and display the spot details
async function fetchSpotDetails() {
  if (!spotId) {
    document.querySelector(".spot-details").innerHTML = "<p>Invalid spot ID.</p>";
    return;
  }

  try {
    // Fetch the spot document from Firestore
    const spotDoc = await getDoc(doc(db, "spots", spotId));
    if (spotDoc.exists()) {
      const spotData = spotDoc.data();
      displaySpotDetails(spotData);
    } else {
      document.querySelector(".spot-details").innerHTML = "<p>Spot not found.</p>";
    }
  } catch (error) {
    console.error("Error fetching spot details:", error);
    document.querySelector(".spot-details").innerHTML = "<p>Failed to load spot details. Please try again later.</p>";
  }
}

// Function to display the spot details in the placeholders
function displaySpotDetails(spotData) {
  // Update the spot name
  document.getElementById("spot-name").textContent = spotData.name || "Spot Name";

  // Update the location
  document.getElementById("spot-location").textContent = spotData.location || "Location not available";

  // Update the category
  document.getElementById("spot-category").textContent = spotData.category || "Category not available";

  // Update the rating using the star system
  const ratingElement = document.getElementById("spot-rating-display");
  const rating = spotData.rating || 0;
  ratingElement.innerHTML = "★".repeat(rating) + "☆".repeat(5 - rating);

  // Update the description
  document.getElementById("spot-description").textContent = spotData.description || "No description available.";
}

// Add to Favorites
async function addToFavorites(userId, spotId) {
  try {
    const userFavoritesRef = doc(db, "favorites", userId);

    // Check if the user already has a favorites document
    const docSnapshot = await getDoc(userFavoritesRef);
    if (docSnapshot.exists()) {
      // Update the existing document by adding the spot ID
      await updateDoc(userFavoritesRef, {
        [`spots.${spotId}`]: true
      });
    } else {
      // Create a new document with the spot ID
      await setDoc(userFavoritesRef, {
        spots: {
          [spotId]: true
        }
      });
    }

    // Update the favorite button text dynamically
    const favoriteText = document.getElementById("favorite-text");
    favoriteText.textContent = "Added to Favorites!";
    showToast("Added to Favorites!");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    alert("Failed to add to favorites. Please try again.");
  }
}

// Function to count and display comments
async function displayCommentCount() {
  try {
    const commentsDoc = await getDoc(doc(db, "comments", spotId));
    let commentCount = 0;
    
    if (commentsDoc.exists()) {
      const commentsData = commentsDoc.data().comments || {};
      commentCount = Object.keys(commentsData).length;
    }
    
    // Update the comment count display
    const commentCountElement = document.getElementById("comment-count");
    commentCountElement.textContent = `${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}`;
    
    return commentCount;
  } catch (error) {
    console.error("Error counting comments:", error);
    return 0;
  }
}

// Fetch and display comments for the spot
async function fetchComments() {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "<p>Loading comments...</p>";

  try {
    const commentsDoc = await getDoc(doc(db, "comments", spotId));
    const commentCount = await displayCommentCount(); // Update count
    
    if (commentsDoc.exists()) {
      const commentsData = commentsDoc.data().comments || {};
      commentsList.innerHTML = "";

      Object.entries(commentsData).forEach(([commentId, comment]) => {
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
    commentsList.innerHTML = "<p>Failed to load comments. Please try again later.</p>";
  }
}

// Submit a new comment
async function submitComment(event) {
  event.preventDefault();

  const commentInput = document.getElementById("comment-input");
  const commentText = commentInput.value.trim();

  if (!commentText) {
    showToast("Comment cannot be empty.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to submit a comment.");
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
    await fetchComments(); // This will also update the count
    showToast("Comment submitted successfully!");
  } catch (error) {
    console.error("Error submitting comment:", error);
    alert("Failed to submit comment. Please try again.");
  }
}

// Handle the favorite button click
document.getElementById("favorite-btn").addEventListener("click", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      addToFavorites(user.uid, spotId);
    } else {
      alert("You must be logged in to favorite a spot.");
    }
  });
});

// === Toast ===
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Attach event listener to the comment form
document.getElementById("comment-form").addEventListener("submit", submitComment);

// Call the function to fetch and display spot details
fetchSpotDetails();

// Call the function to fetch and display comments
fetchComments();