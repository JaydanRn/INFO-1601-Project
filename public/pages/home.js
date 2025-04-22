import firebaseConfig from "../firebaseConfig.js";
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
const logoutBtn = document.getElementById("logout-btn");

// Set default map placeholder
mapPlaceholder.innerHTML = `
  <p class="no-map-message">Click on a spot to display the map</p>
`;

// Fetch spots and populate carousel
async function fetchSpots() {
  try {
    const spotsCollection = collection(db, "spots");
    const snapshot = await getDocs(spotsCollection);
    carouselTrack.innerHTML = "";

    snapshot.forEach((doc) => {
      const spot = doc.data();
      const spotId = doc.id;

      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel__item", "card");
      carouselItem.innerHTML = `
        <img src="${spot.image}" alt="${spot.name}" />
        <div class="card__body">
          <h3 class="card__header">${spot.name}</h3>
          <p class="card__sub">${spot.category} • ${"★".repeat(spot.rating)}${"☆".repeat(5 - spot.rating)}</p>
        </div>
      `;

      carouselItem.addEventListener("click", () => {
        displaySpotIframe(spot.embed, spot.name, spotId);
      });

      carouselTrack.appendChild(carouselItem);
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
  }
}

// Display spot iframe
function displaySpotIframe(iframeUrl, title, spotId) {
  if (!iframeUrl) {
    mapPlaceholder.innerHTML = `<p class="no-map-message">No map available for ${title}</p>`;
    return;
  }

  mapPlaceholder.innerHTML = `
    <div class="map-container">
      <h3 class="map-title">${title}</h3>
      <iframe src="${iframeUrl}" class="map-iframe" title="Location of ${title}"></iframe>
      <button class="view-details-btn" id="view-details-btn">View Details</button>
    </div>
  `;

  document.getElementById("view-details-btn").addEventListener("click", () => {
    window.location.href = `detail.html?spotId=${spotId}`;
  });
}

// Search functionality
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  if (!query) return;

  try {
    const spotsCollection = collection(db, "spots");
    const snapshot = await getDocs(spotsCollection);
    carouselTrack.innerHTML = "";

    let found = false;
    snapshot.forEach((doc) => {
      const spot = doc.data();
      if (spot.name.toLowerCase().includes(query)) {
        found = true;
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel__item", "card");
        carouselItem.innerHTML = `
          <img src="${spot.image}" alt="${spot.name}" />
          <div class="card__body">
            <h3 class="card__header">${spot.name}</h3>
            <p class="card__sub">${spot.category} • ${"★".repeat(spot.rating)}${"☆".repeat(5 - spot.rating)}</p>
          </div>
        `;
        carouselItem.addEventListener("click", () => {
          displaySpotIframe(spot.embed, spot.name, doc.id);
        });
        carouselTrack.appendChild(carouselItem);
      }
    });

    if (!found) alert("No spots found matching your search");
  } catch (error) {
    console.error("Error searching spots:", error);
  }
});


    // Handle logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await signOut(auth);
          // Redirect to login page without keeping history
          window.location.href = '../pages/login.html';
        } catch (error) {
          console.error("Logout failed:", error);
          alert("Failed to log out. Please try again.");
        }
      });
    }

// Initialize
fetchSpots();