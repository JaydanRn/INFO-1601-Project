import firebaseConfig from "../firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Available demo images
const DEMO_IMAGES = [
  '../assets/img/burger.jpg',
  '../assets/img/cake.jpg',
  '../assets/img/chicken.jpg',
  '../assets/img/roti.jpeg',
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

// Toast notification
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showToast("Logged out successfully");
        window.location.href = '../pages/login.html';
      } catch (error) {
        console.error("Error signing out:", error);
        showToast("Failed to log out", true);
      }
    });
  }
}

// Check auth state and handle UI
function handleAuthState(user) {
  const form = document.getElementById("create-form");
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!user) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Please Log In to Add Spots";
    submitBtn.classList.add('btn-disabled');
    showToast("You need to log in to create spots", true);
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Spot";
    submitBtn.classList.remove('btn-disabled');
  }
}

// Form submission
document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showToast("Please log in to create spots", true);
    return;
  }

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
    showToast("Please fill all required fields", true);
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
      image: getRandomImage(),
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
    showToast("Failed to create spot", true);
  }
});

// Initialize the page
onAuthStateChanged(auth, (user) => {
  handleAuthState(user);
  setupLogout();
});