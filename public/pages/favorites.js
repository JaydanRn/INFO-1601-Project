import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Show skeleton placeholders
function showSkeletons(count = 3) {
  const listEl = document.getElementById("favorites-list");
  listEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "card skeleton-card";
    sk.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="card__body">
        <div class="skeleton-text short"></div>
        <div class="skeleton-text long"></div>
      </div>`;
    listEl.appendChild(sk);
  }
}

// Fetch favorites from Firestore
async function fetchFavorites(userId) {
  const listEl = document.getElementById("favorites-list");
  listEl.innerHTML = "<p style='color:#666;'>Loading your favorites...</p>";

  try {
    const userFavoritesRef = doc(db, "favorites", userId);
    const docSnapshot = await getDoc(userFavoritesRef);

    if (docSnapshot.exists()) {
      const spots = docSnapshot.data().spots;
      const spotIds = Object.keys(spots).filter((spotId) => spots[spotId]);

      if (spotIds.length === 0) {
        listEl.innerHTML = "<p style='color:#666;'>You haven't favorited any spots yet.</p>";
        return;
      }

      listEl.innerHTML = ""; // Clear the loading message

      // Fetch details for each favorited spot
      for (const spotId of spotIds) {
        const spotDoc = await getDoc(doc(db, "spots", spotId));
        if (spotDoc.exists()) {
          const spotData = spotDoc.data();
          const card = document.createElement("div");
          card.classList.add("card", "spot-card");
          card.innerHTML = `
            <img src="${spotData.image || '../assets/img/doubles.jpg'}" alt="${spotData.name}" />
            <div class="card__body">
              <h3 class="card__header">${spotData.name}</h3>
              <p class="card__sub">
                ${spotData.category || "Category"} • ${"★".repeat(spotData.rating || 0)}${"☆".repeat(5 - (spotData.rating || 0))}
              </p>
              <button class="delete-btn" data-id="${spotId}">Remove</button>
            </div>`;
          
          // Attach event listener to the "Remove" button
          const deleteButton = card.querySelector(".delete-btn");
          deleteButton.addEventListener("click", () => removeFavorite(userId, spotId));

          listEl.appendChild(card);
        }
      }
    } else {
      listEl.innerHTML = "<p style='color:#666;'>You haven't favorited any spots yet.</p>";
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    listEl.innerHTML = "<p style='color:#666;'>Failed to load favorites. Please try again later.</p>";
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
      
      fetchFavorites(userId); // Refresh the favorites list
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    alert("Failed to remove favorite. Please try again.");
  }
}

// Handle logout
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        // Prevent back navigation after logout
        window.location.replace('../pages/login.html');
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to log out. Please try again.");
      }
    });
  }
}

// Check if the user is logged in and fetch their favorites
onAuthStateChanged(auth, (user) => {
  if (user) {
    showSkeletons(); // Show skeletons while loading
    fetchFavorites(user.uid);
    setupLogout(); // Initialize logout functionality
  } else {
    document.getElementById("favorites-list").innerHTML = "<p style='color:#666;'>You must be logged in to view your favorites.</p>"; 
  }
});