import firebaseConfig from "/public/firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const carouselTrack = document.querySelector(".carousel__track");
const mapPlaceholder = document.getElementById("map");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const logoutBtn = document.getElementById("logout-btn");

// Placeholder image for spots
const placeholderImage = "../assets/img/doubles.jpg";

// Fetch spots from Firestore and populate the carousel
async function fetchSpots() {
  try {
    const spotsCollection = collection(db, "spots");
    const snapshot = await getDocs(spotsCollection);

    // Clear the carousel track
    carouselTrack.innerHTML = "";

    snapshot.forEach((doc) => {
      const spot = doc.data();
      const spotId = doc.id;

      // Create carousel item
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel__item", "card");
      carouselItem.innerHTML = `
        <img src="${placeholderImage}" alt="${spot.name}" />
        <div class="card__body">
          <h3 class="card__header">${spot.name}</h3>
          <p class="card__sub">Rating: ${"★".repeat(spot.rating)}${"☆".repeat(5 - spot.rating)}</p>
        </div>
      `;

      // Add click event to render the map iframe
      carouselItem.addEventListener("click", () => {
        displaySpotIframe(spot.embed, spot.name); // Call displaySpotIframe with embed link and spot name
      });

      // Append the item to the carousel track
      carouselTrack.appendChild(carouselItem);
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
  }
}

// Render the map iframe
function displaySpotIframe(iframeUrl, title) {
    const mapPlaceholder = document.getElementById("map");
  
    if (!iframeUrl) {
      mapPlaceholder.innerHTML = `<p class="no-map-message">No map available for ${title}</p>`;
      return;
    }
  
    // Create responsive iframe with a "View Details" button
    mapPlaceholder.innerHTML = `
      <div class="map-container">
        <h3 class="map-title">${title}</h3>
        <iframe 
          src="${iframeUrl}"
          class="map-iframe"
          title="Location of ${title}">
        </iframe>
        <button class="view-details-btn" onclick="redirectToDetails()">View Details</button>
      </div>
    `;
  }
  
  // Make the function globally accessible
window.redirectToDetails = function () {
    window.location.href = "detail.html";
  };
  
  // Set the default placeholder message when the page loads
  mapPlaceholder.innerHTML = `
    <p class="no-map-message">Click on a spot to display the map</p>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const carouselTrack = document.querySelector(".carousel__track");
  
    console.log("Search button:", searchBtn); // Debugging log
  
    searchBtn.addEventListener("click", async () => {
      const query = searchInput.value.trim().toLowerCase();
  
      if (!query) {
        alert("Please enter a spot name to search.");
        return;
      }
  
      console.log("Search query:", query); // Debugging log
  
      try {
        const spotsCollection = collection(db, "spots");
        const snapshot = await getDocs(spotsCollection);
  
        // Clear the carousel track
        carouselTrack.innerHTML = "";
  
        let found = false;
  
        snapshot.forEach((doc) => {
          const spot = doc.data();
          console.log("Spot name:", spot.name); // Debugging log
          if (spot.name.toLowerCase().includes(query)) {
            found = true;
  
            // Create carousel item
            const carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel__item", "card");
            carouselItem.innerHTML = `
              <img src="${placeholderImage}" alt="${spot.name}" />
              <div class="card__body">
                <h3 class="card__header">${spot.name}</h3>
                <p class="card__sub">Rating: ${"★".repeat(spot.rating)}${"☆".repeat(5 - spot.rating)}</p>
              </div>
            `;
  
            // Add click event to render the map iframe
            carouselItem.addEventListener("click", () => {
                displaySpotIframe(spot.embed, spot.name, spotId);
              });
  
            // Append the item to the carousel track
            carouselTrack.appendChild(carouselItem);
          }
        });
  
        if (!found) {
          alert("No spots found with that name.");
        }
      } catch (error) {
        console.error("Error searching spots:", error);
      }
    });
  });

// Logout functionality
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error logging out:", error);
    alert("Failed to log out. Please try again.");
  }
});

// Initialize the page
fetchSpots();