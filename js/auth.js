// ============================================================
// auth.js — Firebase Authentication (Email + Google Sign-In)
// ============================================================

import { auth, googleProvider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ─── Auth State Observer ────────────────────────────────────
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Register with Email & Password ────────────────────────
export async function registerWithEmail(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
}

// ─── Login with Email & Password ───────────────────────────
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ─── Sign In / Register with Google ────────────────────────
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// ─── Sign Out ───────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}

// ─── Get Current User ───────────────────────────────────────
export function getCurrentUser() {
  return auth.currentUser;
}

// ─── Update Navbar based on auth state ─────────────────────
export function setupNavAuth() {
  const loginLink    = document.getElementById("nav-login");
  const registerLink = document.getElementById("nav-register");
  const userMenu     = document.getElementById("nav-user-menu");
  const userAvatar   = document.getElementById("nav-avatar");
  const userName     = document.getElementById("nav-username");
  const logoutBtn    = document.getElementById("nav-logout");
  const postBtn      = document.querySelectorAll(".post-listing-btn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginLink)    loginLink.style.display    = "none";
      if (registerLink) registerLink.style.display = "none";
      if (userMenu)     userMenu.style.display      = "flex";
      if (userAvatar)   userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=006AFF&color=fff`;
      if (userName)     userName.textContent = user.displayName || user.email.split("@")[0];
      postBtn.forEach(btn => btn.style.display = "inline-flex");
    } else {
      if (loginLink)    loginLink.style.display    = "inline-flex";
      if (registerLink) registerLink.style.display = "inline-flex";
      if (userMenu)     userMenu.style.display      = "none";
      postBtn.forEach(btn => btn.style.display = "none");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      window.location.href = "index.html";
    });
  }
}

// ─── Require Auth Guard ─────────────────────────────────────
export function requireAuth(redirectTo = "login.html") {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}
