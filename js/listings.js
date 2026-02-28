// ============================================================
// listings.js — Firestore CRUD operations for listings
// ============================================================

import { db, storage } from "./firebase-config.js";
import { getCurrentUser } from "./auth.js";
import { API_BASE } from "./app-config.js";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ─── Upload Images to Firebase Storage ─────────────────────
export async function uploadImages(files, folder = "listings") {
  const urls = [];
  for (const file of files) {
    const uniqueName = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, uniqueName);
    const snapshot   = await uploadBytes(storageRef, file);
    const url        = await getDownloadURL(snapshot.ref);
    urls.push(url);
  }
  return urls;
}

// ─── Add a New Listing ──────────────────────────────────────
export async function addListing(data) {
  const user = getCurrentUser();
  if (!user) throw new Error("Must be logged in to post a listing.");

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    let msg = "Failed to create listing";
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }

  const out = await res.json();
  return out.id;
}

// ─── Get All Listings (real-time) ──────────────────────────
export function getListingsRealtime(category, callback) {
  let q;
  if (category) {
    q = query(
      collection(db, "listings"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  }
  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(listings);
  });
}

// ─── Get Single Listing by ID ───────────────────────────────
export async function getListingById(id) {
  const docRef  = doc(db, "listings", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// ─── Delete a Listing ───────────────────────────────────────
export async function deleteListing(id) {
  const user = getCurrentUser();
  if (!user) throw new Error("Must be logged in.");

  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}/api/listings/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    let msg = "Failed to delete listing";
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }

  return true;
}

// ─── Get Latest Listings for Homepage (no real-time) ───────
export async function getLatestListings(limitCount = 8) {
  const q       = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  const snap    = await getDocs(q);
  return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() }));
}

// ─── Format Price ───────────────────────────────────────────
export function formatPrice(price, category) {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
  if (category === "rent") return `${formatted}/mo`;
  return formatted;
}

// ─── Render Listing Card HTML ───────────────────────────────
export function renderCard(listing) {
  const image = listing.images && listing.images.length > 0
    ? listing.images[0]
    : "https://placehold.co/400x260/e8f0fe/006AFF?text=No+Image";

  const price = formatPrice(listing.price, listing.category);
  const categoryLabel = {
    phone:     "📱 Phone",
    land:      "🌍 Land",
    rent:      "🏠 Rent",
    sell_house:"🏡 House"
  }[listing.category] || listing.category;

  const detailUrl = `listing.html?id=${listing.id}`;

  return `
    <div class="listing-card" onclick="window.location.href='${detailUrl}'">
      <div class="card-image-wrapper">
        <img src="${image}" alt="${listing.title}" loading="lazy" />
        <span class="category-badge">${categoryLabel}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${listing.title}</h3>
        <div class="card-price">${price}</div>
        <div class="card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${listing.locationName || "Location not set"}
        </div>
        <p class="card-desc">${(listing.description || "").substring(0, 80)}${(listing.description || "").length > 80 ? "…" : ""}</p>
        <div class="card-footer">
          <span class="card-owner">
            <img src="${listing.ownerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.ownerName || "User")}&background=006AFF&color=fff&size=24`}" alt="owner" />
            ${listing.ownerName || "Anonymous"}
          </span>
          <a class="card-btn" href="${detailUrl}">View Details</a>
        </div>
      </div>
    </div>`;
}
