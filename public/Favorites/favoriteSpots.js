import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Fetch and display the user's favorites
async function fetchFavorites(userId) {
    try {
        const userFavoritesRef = doc(db, "favorites", userId);
        const docSnapshot = await getDoc(userFavoritesRef);

        if (docSnapshot.exists()) {
            const spotIds = docSnapshot.data().spotIds;

            if (spotIds.length === 0) {
                document.getElementById("favorites-list").innerHTML = "<p>You have no favorites yet.</p>";
                return;
            }

            // Fetch details for each favorited spot
            const spotsHtml = await Promise.all(
                spotIds.map(async (spotId) => {
                    const spotDoc = await getDoc(doc(db, "spots", spotId));
                    if (spotDoc.exists()) {
                        const spotData = spotDoc.data();
                        return `
                            <div class="favorite-item">
                                <img src="${spotData.image}" alt="${spotData.name}" />
                                <h3>${spotData.name}</h3>
                                <p>${spotData.location}</p>
                                <a href="../newspot-spotdetail/spot-detail.html?spotId=${spotId}" class="view-details-btn">View Details</a>
                            </div>
                        `;
                    }
                    return "";
                })
            );

            document.getElementById("favorites-list").innerHTML = spotsHtml.join("");
        } else {
            document.getElementById("favorites-list").innerHTML = "<p>You have no favorites yet.</p>";
        }
    } catch (error) {
        console.error("Error fetching favorites:", error);
        document.getElementById("favorites-list").innerHTML = "<p>Failed to load favorites. Please try again later.</p>";
    }
}

// Check if the user is logged in and fetch their favorites
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchFavorites(user.uid);
    } else {
        document.getElementById("favorites-list").innerHTML = "<p>You must be logged in to view your favorites.</p>";
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
*/
