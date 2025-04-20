import firebaseConfig from "../firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


document.getElementById("addspot").addEventListener("click", async (event) => {
    event.preventDefault();

    const spotName = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const embed = document.getElementById("embed").value;
    const category = document.getElementById("category").value;
    const rating = document.getElementById("rating").value;
    const description = document.getElementById("description").value;

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
