import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fetchFavorites(userId) {
    const favoriteList = document.getElementById("favoriteList");
    favoriteList.innerHTML = "<p style='color:#666;'>Loading your favorites...</p>";
  
    try {
      const userFavoritesRef = doc(db, "favorites", userId);
      const docSnapshot = await getDoc(userFavoritesRef);
  
      if (docSnapshot.exists()) {
        const spots = docSnapshot.data().spots;
        const spotIds = Object.keys(spots);
  
        if (spotIds.length === 0) {
          favoriteList.innerHTML = "<p style='color:#666;'>You haven’t favorited any spots yet.</p>";
          return;
        }
  
        favoriteList.innerHTML = ""; // Clear the loading message
  
        // Fetch details for each favorited spot
        for (const spotId of spotIds) {
          const spotDoc = await getDoc(doc(db, "spots", spotId));
          if (spotDoc.exists()) {
            const spotData = spotDoc.data();
            const card = document.createElement("div");
            card.classList.add("spot-card");
            card.innerHTML = `
              <img src="${spotData.image || '../assets/images/pie.jpg'}" alt="${spotData.name}" />
              <div class="card-info">
                <h3>${spotData.name}</h3>
                <p>⭐️ ${spotData.rating || "N/A"} • ${spotData.location || "Unknown location"}</p>
                <p>${spotData.description || "No description available."}</p>
              </div>
              <button class="delete-btn">🗑️ Remove</button>
            `;
  
            // Attach event listener to the "Remove" button
            const deleteButton = card.querySelector(".delete-btn");
            deleteButton.addEventListener("click", () => removeFavorite(userId, spotId));
  
            favoriteList.appendChild(card);
          }
        }
      } else {
        favoriteList.innerHTML = "<p style='color:#666;'>You haven’t favorited any spots yet.</p>";
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      favoriteList.innerHTML = "<p style='color:#666;'>Failed to load favorites. Please try again later.</p>";
    }
  }

// Remove a favorite spot
async function removeFavorite(userId, spotId) {
  try {
    const userFavoritesRef = doc(db, "favorites", userId);
    const docSnapshot = await getDoc(userFavoritesRef);

    if (docSnapshot.exists()) {
      const updatedSpots = { ...docSnapshot.data().spots };
      delete updatedSpots[spotId]; // Remove the spot from the user's favorites

      await updateDoc(userFavoritesRef, { spots: updatedSpots });
      alert("Spot removed from favorites!");
      fetchFavorites(userId); // Refresh the favorites list
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    alert("Failed to remove favorite. Please try again.");
  }
}

// Check if the user is logged in and fetch their favorites
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchFavorites(user.uid);
  } else {
    document.getElementById("favoriteList").innerHTML = "<p style='color:#666;'>You must be logged in to view your favorites.</p>";
  }
});
  

/*const favoriteSpots = [
    {
      id: 101,
      title: "Sunset Doubles",
      image: "../assets/images/doubles.jpg",
      rating: 4.8,
      location: "Maracas Bay"
    },
    {
      id: 102,
      title: "City Bake & Shark",
      image: "../assets/images/bake.jpg",
      rating: 4.6,
      location: "Port of Spain"
    }
  ];


<!-- Data File -->
  <script src="favoriteSpots.js"></script>

  <!-- Render Favorites -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const list = document.getElementById("favoriteList");

      if (!favoriteSpots || favoriteSpots.length === 0) {
        list.innerHTML = '<p style="color:#666;">You haven’t favorited any spots yet.</p>';
        return;
      }

      favoriteSpots.forEach(spot => {
        const card = document.createElement("div");
        card.classList.add("spot-card");
        card.innerHTML = `
          <img src="${spot.image}" alt="${spot.title}" />
          <div class="card-info">
            <h3>${spot.title}</h3>
            <p>⭐️ ${spot.rating} • ${spot.location}</p>
          </div>
          <button class="delete-btn">🗑️</button>
        `;
        list.appendChild(card);
      });
    });
  </script>
*/