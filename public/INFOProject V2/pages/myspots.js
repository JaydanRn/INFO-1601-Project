import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import firebaseConfig from "/public/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let allSpots = [];
let currentPage = 0;
const perPage = 5;

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
  
  // Clear existing spots
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

// Initialize the page
async function init() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      allSpots = await fetchSpots(user.uid);
      renderPage();
    } else {
      alert("You must be logged in to view your spots.");
      window.location.href = "login.html";
    }
  });
}

// Handle "Load More" button click
document.getElementById("load-more").addEventListener("click", () => {
  currentPage++;
  renderPage();
});

// === Delete Modal & Toast ===
let deleteId = null;
const modal = document.getElementById("delete-modal");
const cancelBtn = document.getElementById("cancel-delete");
const confirmBtn = document.getElementById("confirm-delete");

document.getElementById("spots-list").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.closest(".card").dataset.id;
  if (btn.dataset.action === "delete") {
    deleteId = id;
    modal.classList.add("open");
  }
  if (btn.dataset.action === "edit") {
    inlineEdit(btn.closest(".card"));
  }
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("open");
  deleteId = null;
});

confirmBtn.addEventListener("click", async () => {
  try {
    await deleteDoc(doc(db, "spots", deleteId));
    document.querySelector(`.card[data-id="${deleteId}"]`).remove();
    allSpots = allSpots.filter((s) => s.id !== deleteId);
    modal.classList.remove("open");
    showToast("Spot deleted");
    
    // Check if we need to show empty state after deletion
    if (allSpots.length === 0) {
      renderPage();
    }
  } catch (error) {
    console.error("Error deleting spot:", error);
    alert("Failed to delete spot. Please try again.");
  }
});

// === Inline Edit ===
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
  actions.addEventListener(
    "click",
    async (e) => {
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
    },
    { once: true }
  );
}

// === Toast ===
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

init();