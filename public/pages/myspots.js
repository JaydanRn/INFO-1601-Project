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
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

// Fetch spots posted by the logged-in user
async function fetchSpots(userId) {
  const spotsRef = collection(db, "spots");
  const q = query(spotsRef, where("user", "==", userId));
  const querySnapshot = await getDocs(q);

  const spots = [];
  querySnapshot.forEach((doc) => {
    spots.push({ id: doc.id, ...doc.data() });
  });

  return spots;
}

// Render spots on the page
function renderPage() {
  const listEl = document.getElementById("spots-list");
  const emptyState = document.getElementById("empty-state");
  
  listEl.innerHTML = "";
  
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

  if ((currentPage + 1) * perPage >= allSpots.length) {
    document.getElementById("load-more").style.display = "none";
  } else {
    document.getElementById("load-more").style.display = "block";
  }
}

// Delete spot and all associated data
async function deleteSpotAndAssociatedData(spotId, userId) {
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

// Handle delete button clicks
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

// Handle delete confirmation
confirmBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to delete spots.");
    return;
  }

  try {
    const success = await deleteSpotAndAssociatedData(deleteId, user.uid);
    
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
      alert("Failed to completely delete spot data. Please try again.");
    }
  } catch (error) {
    console.error("Error during deletion:", error);
    alert("An error occurred during deletion. Please try again.");
  }
});

// Cancel delete
cancelBtn.addEventListener("click", () => {
  modal.classList.remove("open");
  deleteId = null;
});

// Inline edit functionality
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
        alert("Failed to update spot. Please try again.");
      }
    }
  }, { once: true });
}

// Load more spots
document.getElementById("load-more").addEventListener("click", () => {
  currentPage++;
  renderPage();
});

// Toast notification
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Initialize the page
onAuthStateChanged(auth, async (user) => {
  if (user) {
    allSpots = await fetchSpots(user.uid);
    renderPage();
  } else {
    alert("You must be logged in to view your spots.");
    window.location.href = "login.html";
  }
});