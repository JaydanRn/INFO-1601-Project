import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variable to store spots
let featuredSpots = [];

async function fetchSpotsFromFirestore() {
    try {
        featuredSpots = []; // Clear existing spots
        const querySnapshot = await getDocs(collection(db, "spots"));
        
        querySnapshot.forEach((doc) => {
            const spotData = doc.data();
            featuredSpots.push({
                id: doc.id, // Use Firestore document ID instead of array length
                title: spotData.name,
                image: spotData.image || "/public/assets/images/doubles.jpg",
                iframe: spotData.embed, // Changed from 'iframe' to 'embed' to match your form field
                location: spotData.location // Added location data for potential use
            });
        });

        console.log("Fetched spots:", featuredSpots);
        populateCarousel();
    } catch (error) {
        console.error("Error fetching spots:", error);
        // Optional: Show error to user
        alert("Failed to load spots. Please try again later.");
    }
}

function displaySpotIframe(iframeUrl, title) {
    const mapPlaceholder = document.getElementById("map-placeholder"); // Changed to getElementById
    
    if (!iframeUrl) {
        mapPlaceholder.innerHTML = `<p>No map available for ${title}</p>`;
        return;
    }

    // Create responsive iframe
    mapPlaceholder.innerHTML = `
        <div class="map-container">
            <h3>${title}</h3>
            <div class="iframe-wrapper">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50340.14574169056!2d-61.48870166331491!3d10.25680082575473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c358c59e3c3469b%3A0x63b1082bc49d3bb1!2sRising%20Star!5e0!3m2!1sen!2stt!4v1745125043624!5m2!1sen!2stt" 
                    width="600px" 
                    height="375"
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Location of ${title}">
                </iframe>
            </div>
        </div>
    `;
}

const toggleBtn = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const main = document.querySelector(".main-content");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
    main.classList.toggle("full-width");
});

// Carousel Scroll
const track = document.getElementById("carouselTrack");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const itemWidth = 180;

nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: itemWidth, behavior: "smooth" });
});

prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -itemWidth, behavior: "smooth" });
});

// Auto-scroll every 3 seconds
setInterval(() => {
    track.scrollBy({ left: itemWidth, behavior: "smooth" });

    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - itemWidth) {
        setTimeout(() => {
            track.scrollTo({ left: 0, behavior: "smooth" });
        }, 1000);
    }
}, 3000);

// Search function
function searchSpots() {
    const searchInput = document.getElementById("search-area").value.toLowerCase(); // Get the search query
    const filteredSpots = featuredSpots.filter((spot) =>
        spot.title.toLowerCase().includes(searchInput) || // Match by title
        spot.location.toLowerCase().includes(searchInput) // Match by location
    );

    if (filteredSpots.length === 0) {
        alert("No spots found matching your search.");
    }

    populateCarousel(filteredSpots); // Update the carousel with the filtered results
}


function populateCarousel(spots = featuredSpots) {
    const track = document.getElementById("carouselTrack");
    track.innerHTML = ""; // Clear existing items

    if (spots.length === 0) {
        track.innerHTML = "<p>No spots found</p>";
        return;
    }

    spots.forEach((spot) => {
        const item = document.createElement("div");
        item.classList.add("carousel-item");
        item.innerHTML = `
            <img src="${spot.image}" alt="${spot.title}" />
            <h3>${spot.title}</h3>
            <p>${spot.location}</p>
            <button class="view-details-btn" onclick="event.stopPropagation(); viewSpotDetails('${spot.id}')">View Spot</button>
        `;

        // Add click event listener to display the iframe when the item is clicked
        item.addEventListener("click", () => {
            displaySpotIframe(spot.iframe, spot.title);
        });

        track.appendChild(item);
    });
}

// Function to redirect to the spot detail page
window.viewSpotDetails = function (spotId) {
    // Redirect to the spot-detail.html page with the spot ID as a query parameter
    window.location.href = `../newspot-spotdetail/spot-detail.html?spotId=${spotId}`;
};

// Add event listener to the search button
document.getElementById("search-btn").addEventListener("click", searchSpots);
fetchSpotsFromFirestore(); // Fetch spots when the script loads

/*
// Initial fetch when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchSpotsFromFirestore();
});

// Existing featuredSpots array
const featuredSpots = [
    {
        id: 1,
        title: "Doubles by Junction",
        image: "/public/assets/images/doubles.jpg"
    },
    {
        id: 2,
        title: "Pie Man by Curepe",
        image: "/public/assets/images/pie.jpg"
    },
    {
        id: 3,
        title: "Bake & Shark",
        image: "/public/assets/images/bake.jpg"
    },
    {
        id: 4,
        title: "Chutney Chicken Van",
        image: "/public/assets/images/chicken.jpg"
    },
    {
        id: 5,
        title: "Roti Stop",
        image: "/public/assets/images/roti.jpg"
    }
];

// Function to fetch spots from Firestore and add them to featuredSpots
async function fetchSpotsFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "spots")); // Fetch all documents from "spots" collection
        querySnapshot.forEach((doc) => {
            const spotData = doc.data();
            featuredSpots.push({
                id: featuredSpots.length + 1, // Generate a new ID based on the array length
                title: spotData.name, // Assuming "name" is a field in the Firestore document
                image: spotData.image || "/public/assets/images/doubles.jpg" // Use a default image if none is provided
            });
        });

        console.log("Featured Spots Updated:", featuredSpots);
        populateCarousel(); // Populate the carousel after fetching spots
    } catch (error) {
        console.error("Error fetching spots from Firestore:", error);
    }
}

// Function to populate the carousel
function populateCarousel() {
    const track = document.getElementById("carouselTrack");
    track.innerHTML = ""; // Clear existing items

    featuredSpots.forEach((spot) => {
        const item = document.createElement("div");
        item.classList.add("carousel-item");
        item.innerHTML = `
            <img src="${spot.image}" alt="${spot.title}" />
            <p>${spot.title}</p>
        `;
        track.appendChild(item);
    });
}

// Sidebar Toggle
const toggleBtn = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const main = document.querySelector(".main-content");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
    main.classList.toggle("full-width");
});

// Carousel Scroll
const track = document.getElementById("carouselTrack");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const itemWidth = 180;

nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: itemWidth, behavior: "smooth" });
});

prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -itemWidth, behavior: "smooth" });
});

// Auto-scroll every 3 seconds
setInterval(() => {
    track.scrollBy({ left: itemWidth, behavior: "smooth" });

    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - itemWidth) {
        setTimeout(() => {
            track.scrollTo({ left: 0, behavior: "smooth" });
        }, 1000);
    }
}, 3000);

// Fetch spots and populate the carousel
fetchSpotsFromFirestore();
populateCarousel(); // Populate the carousel with existing featured spots
// Add event listeners to the buttons for manual scrolling
nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: itemWidth, behavior: "smooth" });
});   */