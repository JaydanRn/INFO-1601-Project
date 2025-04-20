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
    const loadingSpinner = document.getElementById("loading-spinner");
    const spotContainer = document.getElementById("spot-container");

    // Show the loading spinner
    loadingSpinner.style.display = "block";
    spotContainer.style.display = "none";

    if (!spotId) {
        loadingSpinner.style.display = "none";
        document.querySelector(".spot-detail").innerHTML = "<p>Invalid spot ID.</p>";
        return;
    }

    try {
        const spotDoc = await getDoc(doc(db, "spots", spotId));
        if (spotDoc.exists()) {
            const spotData = spotDoc.data();
            displaySpotDetails(spotData);

            // Hide the loading spinner and show the spot details
            loadingSpinner.style.display = "none";
            spotContainer.style.display = "flex";
        } else {
            loadingSpinner.style.display = "none";
            document.querySelector(".spot-detail").innerHTML = "<p>Spot not found.</p>";
        }
    } catch (error) {
        console.error("Error fetching spot details:", error);
        loadingSpinner.style.display = "none";
        document.querySelector(".spot-detail").innerHTML = "<p>Failed to load spot details. Please try again later.</p>";
    }
}

// Function to display the spot details on the page
function displaySpotDetails(spotData) {
    // Update the image
    const detailImg = document.querySelector(".detail-img");
    detailImg.src = spotData.image || "../assets/images/pie.jpg"; // Use placeholder if no image is provided
    detailImg.alt = spotData.name || "Spot Image";

    // Update the spot name
    document.querySelector(".detail-info h2").textContent = spotData.name || "Spot Name";

    // Update the location
    document.querySelector(".location").textContent = `📍 ${spotData.location || "Location not available"}`;

    // Update the rating
    document.querySelector(".rating").textContent = `⭐️ ${spotData.rating || "N/A"}`;

    // Update the description
    document.querySelector(".description").textContent = spotData.description || "No description available.";

    // Update the category
    document.querySelector(".category").textContent = `Category: ${spotData.category || "N/A"}`;
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

        alert("Spot added to favorites!");
        // Redirect to favorites page
        window.location.href = "../Favorites/favorites.html";
    } catch (error) {
        console.error("Error adding to favorites:", error);
        alert("Failed to add to favorites. Please try again.");
    }
}

// Handle the favorite button click
document.getElementById("favorite-btn").addEventListener("click", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            addToFavorites(user.uid, spotId); // Pass the user's ID and the spot ID
        } else {
            alert("You must be logged in to favorite a spot.");
        }
    });
});

// Fetch and display comments for the spot
async function fetchComments() {
    const commentsSection = document.querySelector(".comments");
    commentsSection.innerHTML = "<h3>Comments</h3>";

    try {
        const commentsRef = doc(db, "comments", spotId);
        const commentsSnapshot = await getDoc(commentsRef);

        if (commentsSnapshot.exists()) {
            const commentsData = commentsSnapshot.data();

            // Display each comment
            for (const [userId, comment] of Object.entries(commentsData)) {
                // Fetch the username for the userId
                const userRef = doc(db, "users", userId);
                const userSnapshot = await getDoc(userRef);

                let username = userId; // Default to userId if username is not found
                if (userSnapshot.exists()) {
                    username = userSnapshot.data().username || userId;
                }

                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");
                commentDiv.innerHTML = `<p><strong>@${username}:</strong> ${comment}</p>`;
                commentsSection.appendChild(commentDiv);
            }
        } else {
            commentsSection.innerHTML += "<p>No comments yet. Be the first to comment!</p>";
        }

        // Always display the comment input form
        const commentForm = document.createElement("form");
        commentForm.classList.add("comment-form");
        commentForm.innerHTML = `
            <input type="text" placeholder="Leave a comment…" />
            <button type="submit">Post</button>
        `;
        commentsSection.appendChild(commentForm);

        // Add event listener for comment submission
        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const commentInput = commentForm.querySelector("input");
            const commentText = commentInput.value;

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    submitComment(user.uid, commentText); // Pass the user's ID and comment text
                    commentInput.value = ""; // Clear the input field
                } else {
                    alert("You must be logged in to comment.");
                }
            });
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        commentsSection.innerHTML += "<p>Failed to load comments. Please try again later.</p>";
    }
}

// Submit a new comment
async function submitComment(userId, commentText) {
    if (!commentText.trim()) {
        alert("Comment cannot be empty!");
        return;
    }

    try {
        const commentsRef = doc(db, "comments", spotId);

        // Update the comments document with the new comment
        await updateDoc(commentsRef, {
            [userId]: commentText
        }, { merge: true });

        alert("Comment posted!");
        fetchComments(); // Refresh the comments section
    } catch (error) {
        console.error("Error posting comment:", error);
        alert("Failed to post comment. Please try again.");
    }
}

// Handle comment form submission
document.querySelector(".comment-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const commentInput = event.target.querySelector("input");
    const commentText = commentInput.value;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            submitComment(user.uid, commentText); // Pass the user's ID and comment text
            commentInput.value = ""; // Clear the input field
        } else {
            alert("You must be logged in to comment.");
        }
    });
});

// Call the function to fetch and display spot details
fetchSpotDetails();

// Call the function to fetch and display comments
fetchComments();