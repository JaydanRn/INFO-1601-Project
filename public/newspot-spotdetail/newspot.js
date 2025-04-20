import firebaseConfig from "../firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


document.getElementById("addspot").addEventListener("click", async (event) => {
    event.preventDefault();

    // Get form values
    const spotName = document.getElementById("name").value.trim();
    const location = document.getElementById("location").value.trim();
    const embed = document.getElementById("embed").value.trim();
    const category = document.getElementById("category").value.trim();
    const rating = document.getElementById("rating").value.trim();
    const description = document.getElementById("description").value.trim();

    // Check if all fields are filled
    if (!spotName || !location || !embed || !category || !rating || !description) {
        alert("Please fill out all fields before submitting.");
        return;
    }

    // Validate rating is a number
    if (isNaN(parseFloat(rating)) || parseFloat(rating) < 0 || parseFloat(rating) > 5) {
        alert("Please enter a valid rating between 0 and 5.");
        return;
    }

    const spotData = {
        name: spotName,
        location: location,
        embed: embed,
        category: category,
        rating: parseFloat(rating),
        description: description,
        createdAt: new Date().toISOString() // Add a timestamp
    };

    try {
        // Generate a unique ID for the spot
        const spotId = spotName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(); // Example: "spot-name-1681234567890"
    
        // Add a new document with the generated ID
        await setDoc(doc(db, "spots", spotId), spotData);
    
        console.log("Document written with ID: ", spotId);
    
        // Show success message
        alert("Spot added successfully!");
    
        // Reset the form
        document.getElementById("addspotform").reset();
    
        // Optional: Redirect or update UI
        // window.location.href = "/success-page.html";
    
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error adding spot: " + error.message);
    }
});
