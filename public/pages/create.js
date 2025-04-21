import firebaseConfig from "../firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Available demo images
const DEMO_IMAGES = [
  '../assets/img/burger.jpg',
  '../assets/img/cake.jpg',
  '../assets/img/chicken.jpg',
  '../assets/img/roti.jpg',
  '../assets/img/bake.jpg',
  '../assets/img/doubles.jpg',
  '../assets/img/pie.jpg',
  '../assets/img/gyro.jpg',
  '../assets/img/pizza.jpg',
];

// Get random image
function getRandomImage() {
  return DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
}

// Form submission
document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const spotName = document.getElementById("spot-name").value.trim();
  const location = document.getElementById("spot-location").value.trim();
  const embed = document.getElementById("spot-embed").value.trim();
  const description = document.getElementById("spot-description").value.trim();
  const category = document.getElementById("spot-category").value || 
                   document.getElementById("spot-category-custom").value.trim();
  const rating = document.querySelector('input[name="rating"]:checked')?.value;

  // Validate
  if (!spotName || !location || !embed || !description || !category || !rating) {
    alert("Please fill all required fields");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to create spots");
      return;
    }

    try {
      const spotId = `${spotName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const spotData = {
        name: spotName,
        location,
        embed,
        category,
        rating: parseInt(rating),
        description,
        image: getRandomImage(), // Assign random image
        createdAt: new Date(),
        user: user.uid
      };

      await setDoc(doc(db, "spots", spotId), spotData);
      await setDoc(doc(db, "comments", spotId), { comments: {} });

      showToast("Spot created successfully!");
      document.getElementById("create-form").reset();
      
      // Reset UI
      document.querySelectorAll('.rating label').forEach(label => {
        label.classList.remove('highlighted');
      });
      document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('category-pill--active');
      });
      document.getElementById('custom-category-input').style.display = 'none';

    } catch (error) {
      console.error("Error creating spot:", error);
      showToast("Failed to create spot");
    }
  });
});

// Toast notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}