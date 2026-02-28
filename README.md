# 🏠 PropertyHub — Full Setup Guide

## Project Overview
PropertyHub is a Zillow-like marketplace website with:
- **4 Categories**: Buy Second-Hand Phones, Sell Land, Rent House, Sell House
- **Google Auth**: Email/Password + Google Sign-In (OAuth)
- **Image Upload**: Multiple photos from device → Firebase Storage
- **Google Maps**: Location picker + pin display on every listing
- **Real-time**: Firestore real-time listener for live updates

---

## 📁 File Structure
```
propertyhub/
├── index.html          ← Homepage
├── login.html          ← Login page
├── register.html       ← Registration page
├── buy-phone.html      ← Browse phones
├── sell-land.html      ← Browse land
├── rent-house.html     ← Browse rentals
├── sell-house.html     ← Browse houses
├── upload.html         ← Post a new listing
├── listing.html        ← Listing detail page
├── css/
│   ├── style.css       ← Global styles
│   ├── auth.css        ← Auth page styles
│   └── listing.css     ← Upload + detail styles
├── js/
│   ├── firebase-config.js  ← Firebase init
│   ├── auth.js             ← Auth functions
│   ├── listings.js         ← Firestore CRUD
│   ├── upload.js           ← Upload helpers
│   ├── maps.js             ← Maps helpers
│   └── main.js             ← Shared utilities
└── README.md
```

---

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A Google account
- A Firebase account (free) → https://firebase.google.com
- A Google Cloud account (for Maps API) → https://console.cloud.google.com
- (Optional) Node.js for local dev server or Firebase CLI

---

## 🔥 Step 1: Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it `propertyhub` (or any name you like)
4. Disable Google Analytics (optional, or enable it)
5. Click **Create project**

---

## 🔑 Step 2: Get Firebase Config

1. In the Firebase Console, click **⚙️ Project Settings** (gear icon)
2. Scroll to **"Your apps"** → Click **"</> Web"**
3. Register the app (name: `propertyhub-web`)
4. Copy the `firebaseConfig` object — it looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "propertyhub-abc.firebaseapp.com",
  projectId: "propertyhub-abc",
  storageBucket: "propertyhub-abc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

5. Open `js/firebase-config.js` and **replace the placeholder values** with your real config.

---

## 🔐 Step 3: Enable Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **Email/Password** → Save
5. Enable **Google** → Set support email → Save

---

## 📦 Step 4: Setup Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add rules later)
4. Select a region close to your users → **Enable**

### Firestore Security Rules (Production)
After testing, go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read listings
    match /listings/{listingId} {
      allow read: if true;
      // Only authenticated users can create
      allow create: if request.auth != null 
        && request.resource.data.ownerId == request.auth.uid;
      // Only the owner can update/delete
      allow update, delete: if request.auth != null 
        && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

---

## 🗄️ Step 5: Setup Firebase Storage

1. In Firebase Console → **Build** → **Storage**
2. Click **"Get started"**
3. Start in **test mode** → Choose region → **Done**

### Storage Security Rules (Production)
Go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{allPaths=**} {
      // Anyone can read images
      allow read: if true;
      // Only authenticated users can upload (max 5MB)
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🗺️ Step 6: Get Google Maps API Key

1. Go to **https://console.cloud.google.com**
2. Create a new project or select your Firebase project
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
5. Go to **APIs & Services** → **Credentials**
6. Click **"+ Create Credentials"** → **API Key**
7. Copy the API key

### Restrict the API Key (Recommended)
- Under **Application restrictions** → Select **HTTP referrers**
- Add your domain: `http://localhost/*` and `https://yourdomain.com/*`
- Under **API restrictions** → Restrict to the 3 APIs above

### Add Your Key to the Code
In `upload.html` and `listing.html`, replace:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_MAPS_API_KEY...">
```
with your actual key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyABC123...">
```

Also update `js/maps.js` line:
```javascript
// Replace YOUR_MAPS_API_KEY with your actual key in staticMapUrl()
```

---

## 🚀 Step 7: Run Locally

### Option A: Direct File Opening
Simply double-click `index.html` to open in browser.

> ⚠️ Note: Firebase modules work best with a local server. Use Option B for full functionality.

### Option B: VS Code Live Server (Recommended)
1. Install **VS Code** → https://code.visualstudio.com
2. Install extension: **"Live Server"** by Ritwick Dey
3. Right-click `index.html` → **"Open with Live Server"**
4. Browser opens at `http://127.0.0.1:5500`

### Option C: Node.js Simple Server
```bash
# Install serve globally
npm install -g serve

# Navigate to project folder
cd propertyhub

# Start server
serve .

# Open http://localhost:3000
```

### Option D: Python Server
```bash
cd propertyhub
python -m http.server 8080
# Open http://localhost:8080
```

---

## 🌐 Step 8: Deploy to Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login:**
```bash
firebase login
```

3. **Initialize hosting in your project folder:**
```bash
cd propertyhub
firebase init hosting
```
- Select your Firebase project
- Public directory: `.` (current directory)
- Single-page app: **No**
- Overwrite index.html: **No**

4. **Deploy:**
```bash
firebase deploy --only hosting
```

5. Your site goes live at: `https://YOUR_PROJECT_ID.web.app`

---

## ✅ Step 9: Test Your Site

1. **Register** a new account (or use Google Sign-In)
2. Go to any category page → Click **"Post a Listing"**
3. Fill the form, upload photos, select location on map
4. Submit → You'll be redirected to the listing detail page
5. Check the map shows the correct pin location
6. Verify listing appears in the category page grid

---

## 🔧 Troubleshooting

### ❌ "Firebase App Named '[DEFAULT]' Already Exists"
- This happens if `firebase-config.js` is imported twice
- Check no duplicate `<script>` tags import it

### ❌ Google Sign-In Popup Blocked
- Allow popups for your domain in browser settings
- Make sure the domain is added to Firebase Auth → Authorized domains

### ❌ Maps Not Loading
- Check your Google Maps API key is correct
- Make sure **Maps JavaScript API** and **Places API** are enabled
- Check browser console for API key errors
- Ensure billing is enabled on your Google Cloud project

### ❌ Images Not Uploading
- Check Firebase Storage rules allow authenticated writes
- Verify Storage bucket name in `firebase-config.js`
- Check image file size (max 5MB per image)

### ❌ Listings Not Appearing
- Check Firestore rules allow reads
- Open browser console for errors
- Verify `firebase-config.js` has correct `projectId`

### ❌ "Permission Denied" on Firestore
- Update Firestore rules (Step 4)
- Make sure user is logged in before posting

---

## 🏗️ Project Architecture

```
User Action          →  Frontend JS        →  Firebase Backend
─────────────────────────────────────────────────────────────
Register/Login       →  auth.js            →  Firebase Auth
Post Listing         →  upload.js          →  Firestore + Storage
Browse Listings      →  listings.js        →  Firestore (real-time)
View Details         →  listing.html       →  Firestore getDoc
Show Location        →  Google Maps API    →  Maps JavaScript API
```

---

## 🎨 Customization Tips

### Change Color Scheme
Edit `css/style.css` CSS variables at the top:
```css
:root {
  --primary:       #006AFF;  /* ← Change this */
  --accent:        #FF6B35;  /* ← And this */
}
```

### Add Currency
In `js/listings.js`, update `formatPrice()`:
```javascript
const formatted = new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN"   // ← Nigerian Naira
}).format(num);
```

### Add More Categories
1. Add option in `upload.html` select dropdown
2. Add icon/color in `js/listings.js` `renderCard()` categoryLabel map
3. Create a new HTML page for that category

---

## 📞 Support

If you run into issues:
1. Check the browser console (F12 → Console tab)
2. Firebase Console → Project → Usage & Billing
3. Google Cloud Console → APIs → Credentials

---

## 📄 License
MIT License — Free to use, modify, and distribute.

---

*Built with ❤️ using Firebase, Google Maps API & Vanilla JavaScript*

---

# 🔌 Backend (Express) Setup (Recommended)

This repo now includes an **Express backend** (`/backend`) that:
- Verifies Firebase ID tokens on the server
- Creates/deletes listings securely using **Firebase Admin SDK**

Firebase Auth ID token verification is the recommended way to securely identify a signed-in user on your own backend [Source](https://firebase.google.com/docs/auth/admin/verify-id-tokens).

## 1) Create a Firebase Service Account key
Firebase Console → Project settings → **Service accounts** → **Generate new private key**.

Save it as:
```
backend/serviceAccountKey.json
```

## 2) Backend install & run
From the project root:
```bash
cd backend
npm install
cp .env.example .env
# edit .env and confirm GOOGLE_APPLICATION_CREDENTIALS path
npm run dev
```
Backend runs at: `http://localhost:5001`

## 3) Frontend run
Use Live Server (VS Code) or:
```bash
npm install
npm run dev
```

## 4) Firestore Rules (IMPORTANT)
If you use the Express backend for writes, lock Firestore writes from the client:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{id} {
      allow read: if true;
      allow write: if false; // only backend (Admin SDK) writes
    }
  }
}
```

