// ============================================================
// maps.js — Google Maps helpers for listing detail page
// ============================================================

// ─── Initialize Detail Map ──────────────────────────────────
export function initDetailMap(lat, lng, locationName) {
  const mapEl = document.getElementById("detail-map");
  if (!mapEl) return;

  if (!lat || !lng) {
    mapEl.style.display  = "none";
    const noMap = document.getElementById("no-map-msg");
    if (noMap) noMap.style.display = "block";
    return;
  }

  const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

  const map = new google.maps.Map(mapEl, {
    center: position,
    zoom: 15,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  });

  const marker = new google.maps.Marker({
    map,
    position,
    title: locationName || "Property Location",
    animation: google.maps.Animation.DROP
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding:6px 4px;">
        <div style="font-weight:700;color:#006AFF;font-size:14px;">${locationName || "Property"}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">📍 Listed on PropertyHub</div>
      </div>`
  });
  infoWindow.open(map, marker);
}

// ─── Street View Panorama ───────────────────────────────────
export function initStreetView(lat, lng) {
  const svEl = document.getElementById("street-view");
  if (!svEl || !lat || !lng) return;

  const panorama = new google.maps.StreetViewPanorama(svEl, {
    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
    pov: { heading: 34, pitch: 10 },
    zoom: 1
  });
}

// ─── Static Map URL (for cards/thumbnails) ─────────────────
export function staticMapUrl(lat, lng, zoom = 13, size = "400x200") {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:blue%7C${lat},${lng}&key=YOUR_MAPS_API_KEY`;
}
