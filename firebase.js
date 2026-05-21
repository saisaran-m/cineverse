/* ============================================
   CineVerse — Firebase Configuration v6.0
   CORRECT config from Firebase Console
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyAlMLhAhPwKgZiTeGWeZiE9MsyrwOc8XIg",
    authDomain: "cineverse-d4485.firebaseapp.com",
    projectId: "cineverse-d4485",
    storageBucket: "cineverse-d4485.firebasestorage.app",
    messagingSenderId: "202365297476",
    appId: "1:202365297476:web:1e92e8f846530fe3f22d11",
    measurementId: "G-K0PK20WK1E"
};

// Initialize Firebase
let app, auth, db, provider;

try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    auth = firebase.auth();
    db = firebase.firestore();
    provider = new firebase.auth.GoogleAuthProvider();
    console.log("🔥 Firebase initialized successfully — Project: cineverse-d4485");
} catch (error) {
    console.error("⚠️ Firebase initialization failed.", error);
    // Provide safe mock objects to prevent site-wide crashes
    auth = { 
        onAuthStateChanged: (cb) => { if(cb) cb(null); return () => {}; },
        currentUser: null,
        signOut: () => Promise.resolve()
    };
    db = { 
        collection: () => ({ 
            doc: () => ({ 
                get: () => Promise.resolve({ exists: false }),
                onSnapshot: () => (() => {}),
                set: () => Promise.resolve()
            }),
            where: () => ({ limit: () => ({ get: () => Promise.resolve({ empty: true }) }) })
        })
    };
    provider = {};
}

// === Global Helper for Auth Observers ===
window.onAuthStateChanged = (authObj, callback) => {
    if (authObj && typeof authObj.onAuthStateChanged === 'function') {
        return authObj.onAuthStateChanged(callback);
    } else {
        console.warn("Auth not ready for observer, waiting...");
        return () => {};
    }
};

// Export to window for access in other scripts
window.auth = auth;
window.db = db;
window.provider = provider;

// Robust Auth Helpers
window.signOut = () => auth.signOut();
window.updateProfile = (profile) => auth.currentUser ? auth.currentUser.updateProfile(profile) : Promise.reject("No user");
window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
window.FieldValue = firebase.firestore.FieldValue;
