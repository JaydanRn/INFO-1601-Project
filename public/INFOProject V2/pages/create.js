import firebaseConfig from "/public/firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get form values
  const spotName = document.getElementById("spot-name").value.trim();
  const location = document.getElementById("spot-location").value.trim();
  const embed = document.getElementById("spot-embed").value.trim();
  const description = document.getElementById("spot-description").value.trim();

  // Get category
  const categoryInput = document.getElementById("spot-category");
  const customCategoryInput = document.getElementById("spot-category-custom");
  const category = categoryInput.value || customCategoryInput.value.trim();

  // Get rating
  const ratingInputs = document.querySelectorAll('.rating input[name="rating"]');
  let rating = 0;
  ratingInputs.forEach((input) => {
    if (input.checked) {
      rating = parseInt(input.value, 10); // Get the selected rating value
    }
  });

  // Validate form fields
  if (!spotName || !location || !embed || !description || !category || rating === 0) {
    alert("Please fill out all fields and select a rating before submitting.");
    return;
  }

  const spotData = {
    name: spotName,
    location: location,
    embed: embed,
    category: category,
    rating: rating,
    description: description,
    createdAt: new Date(), // Add a timestamp
  };

  try {
    // Generate a unique ID for the spot
    const spotId = spotName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(); // Example: "spot-name-1681234567890"

    // Add a new document with the generated ID to the "spots" collection
    await setDoc(doc(db, "spots", spotId), spotData);

    // Initialize the comments collection for the new spot
    await setDoc(doc(db, "comments", spotId), {
      comments: {} // Initialize with an empty comments map
    });

    console.log("Document written with ID: ", spotId);

    // Show success message
    alert("Spot added successfully!");

    // Reset the form
    const form = document.getElementById("create-form");
    form.reset();

    // Reset the stars to default color
    const ratingLabels = document.querySelectorAll(".rating label");
    ratingLabels.forEach((label) => {
      label.classList.remove("highlighted");
    });

    // Reset the category to none selected
    const categoryPills = document.querySelectorAll(".category-pill");
    categoryPills.forEach((pill) => {
      pill.classList.remove("category-pill--active");
    });
    categoryInput.value = ""; // Clear the hidden input value
    customCategoryInput.value = ""; // Clear the custom category input
    customCategoryInput.style.display = "none"; // Hide the custom category input

    // Optional: Redirect or update UI
    // window.location.href = "/success-page.html";
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding spot: " + error.message);
  }
});