import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the spot ID from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get("spotId");

// Add favorite functionality
async function addToFavorites(userId, spotId) {
    try {
        const userFavoritesRef = doc(db, "favorites", userId);

        // Check if the user already has a favorites document
        const docSnapshot = await getDoc(userFavoritesRef);
        if (docSnapshot.exists()) {
            // Update the existing document by adding the spot ID to the array
            await updateDoc(userFavoritesRef, {
                spotIds: arrayUnion(spotId)
            });
        } else {
            // Create a new document with the spot ID
            await setDoc(userFavoritesRef, {
                spotIds: [spotId]
            });
        }

        alert("Spot added to favorites!");
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