// ============================================================
// upload.js — Handles listing upload form logic
// ============================================================

import { addListing, uploadImages } from "./listings.js";
import { requireAuth } from "./auth.js";

let selectedFiles = [];
let selectedLat   = null;
let selectedLng   = null;
let selectedPlace = "";
let uploadMap     = null;
let uploadMarker  = null;

// ─── Initialize the Upload Form ────────────────────────────
export async function initUploadForm(presetCategory = null) {
  // Wait for auth
  const user = await requireAuth("login.html");

  const form       = document.getElementById("upload-form");
  const imgInput   = document.getElementById("img-input");
  const preview    = document.getElementById("img-preview");
  const catSelect  = document.getElementById("category");
  const submitBtn  = document.getElementById("submit-btn");

  if (!form) return;

  // ── Preset category if page-specific ────────────────────
  if (presetCategory && catSelect) {
    catSelect.value = presetCategory;
  }

  // ── Image selection & preview ────────────────────────────
  imgInput.addEventListener("change", (e) => {
    selectedFiles = Array.from(e.target.files);
    preview.innerHTML = "";
    selectedFiles.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wrapper = document.createElement("div");
        wrapper.className = "preview-item";
        wrapper.innerHTML = `
          <img src="${ev.target.result}" alt="preview" />
          <button type="button" class="remove-img" data-index="${i}">✕</button>`;
        preview.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  preview.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-img")) {
      const idx = parseInt(e.target.dataset.index);
      selectedFiles.splice(idx, 1);
      // Re-render
      const items = preview.querySelectorAll(".preview-item");
      items[idx] && items[idx].remove();
      // Re-index
      preview.querySelectorAll(".remove-img").forEach((btn, i) => btn.dataset.index = i);
    }
  });

  // ── Location Autocomplete & Map ──────────────────────────
  initUploadMap();

  // ── Form Submit ──────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled    = true;
    submitBtn.textContent = "Uploading…";
    showToast("Uploading your listing…", "info");

    try {
      // Upload images
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles, "listings");
      }

      // Build listing data
      const listingData = {
        title:        form.querySelector("#title").value.trim(),
        category:     form.querySelector("#category").value,
        price:        form.querySelector("#price").value.trim(),
        description:  form.querySelector("#description").value.trim(),
        contact:      form.querySelector("#contact").value.trim(),
        images:       imageUrls,
        locationName: selectedPlace,
        lat:          selectedLat,
        lng:          selectedLng
      };

      if (!listingData.title || !listingData.category || !listingData.price) {
        throw new Error("Please fill in all required fields.");
      }

      const id = await addListing(listingData);
      showToast("Listing posted successfully! 🎉", "success");

      setTimeout(() => {
        window.location.href = `listing.html?id=${id}`;
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to post listing.", "error");
      submitBtn.disabled    = false;
      submitBtn.textContent = "Post Listing";
    }
  });
}

// ─── Initialize Google Map in Upload Form ──────────────────
function initUploadMap() {
  const mapEl = document.getElementById("upload-map");
  if (!mapEl) return;

  // Default center: New York
  uploadMap = new google.maps.Map(mapEl, {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 10,
    mapTypeControl: false
  });

  const locationInput = document.getElementById("location-input");
  if (!locationInput) return;

  const autocomplete = new google.maps.places.Autocomplete(locationInput, {
    types: ["geocode", "establishment"]
  });
  autocomplete.bindTo("bounds", uploadMap);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      showToast("No location details for that selection.", "error");
      return;
    }

    selectedPlace = place.formatted_address || place.name || locationInput.value;
    selectedLat   = place.geometry.location.lat();
    selectedLng   = place.geometry.location.lng();

    uploadMap.setCenter(place.geometry.location);
    uploadMap.setZoom(15);

    if (uploadMarker) uploadMarker.setMap(null);
    uploadMarker = new google.maps.Marker({
      map:      uploadMap,
      position: place.geometry.location,
      title:    selectedPlace,
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-weight:600;color:#006AFF">${selectedPlace}</div>`
    });
    infoWindow.open(uploadMap, uploadMarker);
  });
}

// ─── Toast Notification Helper ─────────────────────────────
export function showToast(message, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-visible"), 50);
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
