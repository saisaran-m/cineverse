/* ============================================
   CineVerse — Firebase Configuration & Safety
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyAlMLhAhPwKgZiTeGWeZiE9MsyrwOc8XIg",
    authDomain: "cineverse-sai.firebaseapp.com",
    projectId: "cineverse-sai",
    storageBucket: "cineverse-sai.appspot.com",
    messagingSenderId: "367305260195",
    appId: "1:367305260195:web:86566085a86d268d374474",
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
        if (callback) callback(null);
        return () => {};
    }
};

// Export to window for access in other scripts
window.auth = auth;
window.db = db;
window.provider = provider;
window.signInWithEmailAndPassword = firebase.auth?.signInWithEmailAndPassword || (() => Promise.reject("Auth not ready"));
window.createUserWithEmailAndPassword = firebase.auth?.createUserWithEmailAndPassword || (() => Promise.reject("Auth not ready"));
window.signOut = firebase.auth?.signOut || (() => Promise.resolve());
window.signInWithPopup = firebase.auth?.signInWithPopup || (() => Promise.reject("Popup auth not ready"));
window.signInWithPhoneNumber = firebase.auth?.signInWithPhoneNumber || (() => Promise.reject("Phone auth not ready"));
window.RecaptchaVerifier = firebase.auth?.RecaptchaVerifier;
window.updateProfile = (user, profile) => user ? user.updateProfile(profile) : Promise.reject("No user");
window.serverTimestamp = firebase.firestore?.FieldValue?.serverTimestamp || (() => Date.now());
