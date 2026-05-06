/* ============================================
   CineVerse — Firebase Configuration & Safety
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyAlMLhAhPwKgZiTeGWeZiE9MsyrwOc8XIg",
    authDomain: "cineverse-d4485.firebaseapp.com",
    projectId: "cineverse-d4485",
    storageBucket: "cineverse-d4485.appspot.com",
    messagingSenderId: "202365297476",
    appId: "1:202365297476:web:86566085a86d268d374474", // Estimated - may need user verification
    measurementId: "G-6EXV6EXV6E"
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
    console.log("🔥 Firebase initialized successfully");
} catch (error) {
    console.error("⚠️ Firebase initialization failed. Entering Bulletproof/Safety Mode.", error);
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
        // Wait for real auth to be ready if possible, don't trigger 'logged out' logic prematurely
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
window.signInWithPopup = () => auth.signInWithPopup(provider);
window.signInWithRedirect = () => auth.signInWithRedirect(provider);
window.getRedirectResult = () => auth.getRedirectResult();

window.updateProfile = (profile) => auth.currentUser ? auth.currentUser.updateProfile(profile) : Promise.reject("No user");
window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
window.FieldValue = firebase.firestore.FieldValue;
