// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configurations
const firebaseConfig = {
  apiKey: "AIzaSyDlX-NSZEdYRtcz4xev3S7QDRCg5xPvOt8",
  authDomain: "personal-protfolio-1aac1.firebaseapp.com",
  databaseURL: "https://personal-protfolio-1aac1-default-rtdb.firebaseio.com",
  projectId: "personal-protfolio-1aac1",
  storageBucket: "personal-protfolio-1aac1.firebasestorage.app",
  messagingSenderId: "714598956542",
  appId: "1:714598956542:web:9c493f217f4074041e14af",
  measurementId: "G-ENXVE0DH1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// analytics can be blocked by browser extensions (adblockers) which causes
// net::ERR_BLOCKED_BY_CLIENT entries in the console when the module is
// imported eagerly. We initialize analytics lazily and guard it so the app
// won't log noisy errors when analytics is blocked.
let analytics: any = null;
const database = getDatabase(app);

if (typeof window !== "undefined" && import.meta && import.meta.env && import.meta.env.MODE === "production") {
  (async () => {
    try {
      // dynamic import so bundlers create a separate chunk and we can catch
      // failures if an extension blocks the resource
      const mod = await import("firebase/analytics");
      analytics = mod.getAnalytics(app);
    } catch (err) {
      // Don't throw — just log a helpful message for debugging.
      // Common cause: adblock/privacy extension blocking analytics requests.
      // The app can continue to work without analytics.
      // eslint-disable-next-line no-console
      console.warn('Firebase Analytics not initialized (possibly blocked by an extension):', err);
    }
  })();
}

export { app, analytics, database };