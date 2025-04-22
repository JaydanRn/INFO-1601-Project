import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let allSpots = [];
let currentPage = 0;
const perPage = 5;
let deleteId = null;

// DOM Elements
const modal = document.getElementById("delete-modal");
const cancelBtn = document.getElementById("cancel-delete");
const confirmBtn = document.getElementById("confirm-delete");
const logoutBtn = document.getElementById("logout-btn");

// === Authentication Functions ===
function setupLogout() {
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showToast("Successfully logged out");
        window.location.href = '../pages/login.html';
      } catch (error) {
        console.error("Error signing out:", error);
        showToast("Failed to log out", true);
      }
    });
  }
}

// === Toast Function ===
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// === Spot Management Functions ===
async function fetchSpots(userId) {
  try {
    const spotsRef = collection(db, "spots");
    const q = query(spotsRef, where("user", "==", userId));
    const querySnapshot = await getDocs(q);

    const spots = [];
    querySnapshot.forEach((doc) => {
      spots.push({ id: doc.id, ...doc.data() });
    });

    return spots;
  } catch (error) {
    console.error("Error fetching spots:", error);
    showToast("Failed to load spots", true);
    return [];
  }
}

function renderPage(append = false) {
  const listEl = document.getElementById("spots-list");
  const emptyState = document.getElementById("empty-state");
  
  if (!append) {
    listEl.innerHTML = "";
    currentPage = 0; // Reset to first page when not appending
  }
  
  if (allSpots.length === 0) {
    emptyState.style.display = "block";
    document.getElementById("load-more").style.display = "none";
    return;
  } else {
    emptyState.style.display = "none";
  }

  const start = currentPage * perPage;
  const pageSpots = allSpots.slice(start, start + perPage);

  pageSpots.forEach((spot) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = spot.id;
    card.innerHTML = `
      <img src="${spot.image || "../assets/img/doubles.jpg"}" alt="${spot.name}">
      <div class="card__body">
        <h3 class="card__header">${spot.name}</h3>
        <p class="card__sub">
          ${spot.category} • ${"★".repeat(spot.rating || 0)}${"☆".repeat(5 - (spot.rating || 0))} • ${spot.location}
        </p>
        <div class="card__actions">
          <button class="btn-secondary" data-action="edit">Edit</button>
          <button class="btn-secondary" data-action="delete">Delete</button>
        </div>
      </div>`;
    listEl.appendChild(card);
  });

  // Update load more button visibility
  if ((currentPage + 1) * perPage >= allSpots.length) {
    document.getElementById("load-more").style.display = "none";
  } else {
    document.getElementById("load-more").style.display = "block";
  }
}

async function deleteSpotAndAssociatedData(spotId) {
  try {
    // 1. Delete the spot document
    await deleteDoc(doc(db, "spots", spotId));
    
    // 2. Delete the comments for this spot
    await deleteDoc(doc(db, "comments", spotId));
    
    // 3. Remove from all users' favorites
    const favoritesQuery = query(collection(db, "favorites"));
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    const updatePromises = [];
    favoritesSnapshot.forEach((doc) => {
      if (doc.data().spots && doc.data().spots[spotId]) {
        updatePromises.push(
          updateDoc(doc.ref, {
            [`spots.${spotId}`]: deleteField()
          })
        );
      }
    });
    
    await Promise.all(updatePromises);

    return true;
  } catch (error) {
    console.error("Error deleting spot and associated data:", error);
    return false;
  }
}

// === Event Listeners ===
document.getElementById("spots-list").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  
  const card = btn.closest(".card");
  const id = card.dataset.id;
  
  if (btn.dataset.action === "delete") {
    deleteId = id;
    modal.classList.add("open");
  }
  
  if (btn.dataset.action === "edit") {
    inlineEdit(card);
  }
});

confirmBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    showToast("You must be logged in to delete spots", true);
    return;
  }

  try {
    const success = await deleteSpotAndAssociatedData(deleteId);
    
    if (success) {
      // Update local state
      allSpots = allSpots.filter((s) => s.id !== deleteId);
      
      // Update UI
      document.querySelector(`.card[data-id="${deleteId}"]`)?.remove();
      modal.classList.remove("open");
      deleteId = null;
      
      showToast("Spot and all associated data deleted");
      
      // Show empty state if no spots left
      if (allSpots.length === 0) {
        renderPage();
      }
    } else {
      showToast("Failed to completely delete spot data", true);
    }
  } catch (error) {
    console.error("Error during deletion:", error);
    showToast("An error occurred during deletion", true);
  }
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("open");
  deleteId = null;
});

document.getElementById("load-more").addEventListener("click", (e) => {
  e.preventDefault();
  currentPage++;
  renderPage(true); // Append new spots
});

// === Helper Functions ===
function inlineEdit(card) {
  const header = card.querySelector(".card__header");
  const oldText = header.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  header.replaceWith(input);

  const actions = card.querySelector(".card__actions");
  actions.innerHTML = `
    <button class="btn-secondary" data-action="cancel">Cancel</button>
    <button class="btn-secondary" data-action="save">Save</button>
  `;

  actions.addEventListener("click", async (e) => {
    const act = e.target.dataset.action;
    if (act === "cancel") {
      input.replaceWith(header);
      actions.innerHTML = `
        <button class="btn-secondary" data-action="edit">Edit</button>
        <button class="btn-secondary" data-action="delete">Delete</button>
      `;
    }
    if (act === "save") {
      const newName = input.value.trim() || oldText;
      try {
        await updateDoc(doc(db, "spots", card.dataset.id), { name: newName });
        header.textContent = newName;
        input.replaceWith(header);
        actions.innerHTML = `
          <button class="btn-secondary" data-action="edit">Edit</button>
          <button class="btn-secondary" data-action="delete">Delete</button>
        `;
        showToast("Spot updated");
      } catch (error) {
        console.error("Error updating spot:", error);
        showToast("Failed to update spot", true);
      }
    }
  }, { once: true });
}

// === Initialize Page ===
onAuthStateChanged(auth, async (user) => {
  setupLogout();
  
  if (user) {
    allSpots = await fetchSpots(user.uid);
    renderPage();
  } else {
    document.getElementById("spots-list").innerHTML = "<p>Please log in to view your spots.</p>";
    document.getElementById("load-more").style.display = "none";
  }
});