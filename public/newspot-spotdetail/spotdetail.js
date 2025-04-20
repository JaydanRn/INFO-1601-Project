import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the spot ID from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get("spotId");

// Fetch and display the spot details
async function fetchSpotDetails() {
    if (!spotId) {
        document.querySelector(".spot-detail").innerHTML = "<p>Invalid spot ID.</p>";
        return;
    }

    try {
        const spotDoc = await getDoc(doc(db, "spots", spotId));
        if (spotDoc.exists()) {
            const spotData = spotDoc.data();
            displaySpotDetails(spotData);
        } else {
            document.querySelector(".spot-detail").innerHTML = "<p>Spot not found.</p>";
        }
    } catch (error) {
        console.error("Error fetching spot details:", error);
        document.querySelector(".spot-detail").innerHTML = "<p>Failed to load spot details. Please try again later.</p>";
    }
}

// Function to display the spot details on the page
function displaySpotDetails(spotData) {
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

// Call the function to fetch and display spot details
fetchSpotDetails();