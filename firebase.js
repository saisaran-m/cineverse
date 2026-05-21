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
    console.error("⚠️ Firebase initialization failed. Initializing robust developer mock environment...", error);
    
    // local storage state getters/setters for persistent mock DB
    const getMockDB = () => {
        try {
            const data = localStorage.getItem('cineverse_mock_db');
            return data ? JSON.parse(data) : {};
        } catch(e) { return {}; }
    };
    const saveMockDB = (data) => {
        try {
            localStorage.setItem('cineverse_mock_db', JSON.stringify(data));
        } catch(e) {}
    };

    // Global listener register for live snap updates
    if (!window.mockDocListeners) window.mockDocListeners = {};
    if (!window.mockColListeners) window.mockColListeners = {};

    class MockTimestamp {
        constructor(date) {
            this.date = date ? new Date(date) : new Date();
        }
        toDate() {
            return this.date;
        }
        toJSON() {
            return this.date.toISOString();
        }
    }

    class MockIncrement {
        constructor(amount) {
            this.amount = amount;
        }
    }

    const wrapMockTimestamps = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
            return new MockTimestamp(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(wrapMockTimestamps);
        }
        if (typeof obj === 'object') {
            const res = {};
            for (const k in obj) {
                res[k] = wrapMockTimestamps(obj[k]);
            }
            return res;
        }
        return obj;
    };

    class MockDoc {
        constructor(path) {
            this.path = path;
            this.id = path.split('/').pop();
        }
        get() {
            const dbData = getMockDB();
            const val = dbData[this.path];
            return Promise.resolve({
                exists: val !== undefined,
                id: this.id,
                data: () => wrapMockTimestamps(val) || {}
            });
        }
        set(data, options) {
            const dbData = getMockDB();
            let current = (options && options.merge && dbData[this.path] && typeof dbData[this.path] === 'object')
                ? { ...dbData[this.path] }
                : {};
            
            if (!(options && options.merge)) {
                current = {};
            } else if (!dbData[this.path]) {
                current = {};
            }

            const source = data || {};
            for (const key in source) {
                const val = source[key];
                if (val && typeof val === 'object' && val.constructor && val.constructor.name === 'MockIncrement') {
                    const prev = typeof current[key] === 'number' ? current[key] : 0;
                    current[key] = prev + val.amount;
                } else if (val && typeof val === 'object' && val.constructor && val.constructor.name === 'MockTimestamp') {
                    current[key] = val.toJSON();
                } else {
                    current[key] = val;
                }
            }

            dbData[this.path] = current;
            saveMockDB(dbData);
            
            // Notify doc listeners
            if (window.mockDocListeners[this.path]) {
                window.mockDocListeners[this.path].forEach(cb => cb({
                    exists: true,
                    id: this.id,
                    data: () => wrapMockTimestamps(dbData[this.path])
                }));
            }
            // Notify collection listeners
            const colPath = this.path.split('/').slice(0, -1).join('/');
            if (window.mockColListeners[colPath]) {
                window.mockColListeners[colPath].forEach(cb => cb());
            }
            return Promise.resolve();
        }
        update(data) {
            return this.set(data, { merge: true });
        }
        delete() {
            const dbData = getMockDB();
            delete dbData[this.path];
            saveMockDB(dbData);
            
            // Notify doc listeners
            if (window.mockDocListeners[this.path]) {
                window.mockDocListeners[this.path].forEach(cb => cb({
                    exists: false,
                    id: this.id,
                    data: () => ({})
                }));
            }
            // Notify collection listeners
            const colPath = this.path.split('/').slice(0, -1).join('/');
            if (window.mockColListeners[colPath]) {
                window.mockColListeners[colPath].forEach(cb => cb());
            }
            return Promise.resolve();
        }
        onSnapshot(callback) {
            if (!window.mockDocListeners[this.path]) window.mockDocListeners[this.path] = [];
            window.mockDocListeners[this.path].push(callback);
            this.get().then(snap => callback(snap));
            return () => {
                window.mockDocListeners[this.path] = window.mockDocListeners[this.path].filter(cb => cb !== callback);
            };
        }
        collection(name) {
            return new MockCol(this.path ? `${this.path}/${name}` : name);
        }
    }

    class MockCol {
        constructor(path) {
            this.path = path;
        }
        doc(id) {
            const finalId = id || Math.random().toString(36).substring(2, 15);
            return new MockDoc(this.path ? `${this.path}/${finalId}` : finalId);
        }
        add(data) {
            const docRef = this.doc();
            return docRef.set(data).then(() => docRef);
        }
        where() { return this; }
        limit() { return this; }
        orderBy() { return this; }
        get() {
            const dbData = getMockDB();
            const docs = [];
            Object.keys(dbData).forEach(key => {
                const parts = key.split('/');
                const parentPath = parts.slice(0, -1).join('/');
                if (parentPath === this.path) {
                    docs.push({
                        id: parts.pop(),
                        data: () => wrapMockTimestamps(dbData[key])
                    });
                }
            });
            return Promise.resolve({
                empty: docs.length === 0,
                size: docs.length,
                docs: docs,
                forEach: (cb) => docs.forEach(cb)
            });
        }
        onSnapshot(callback) {
            if (!window.mockColListeners[this.path]) window.mockColListeners[this.path] = [];
            const trigger = () => this.get().then(snap => callback(snap));
            window.mockColListeners[this.path].push(trigger);
            trigger();
            return () => {
                window.mockColListeners[this.path] = window.mockColListeners[this.path].filter(cb => cb !== trigger);
            };
        }
    }

    // Set mock database
    db = new MockCol("");

    // Setup mock authentication
    auth = {
        onAuthStateChanged: (cb) => {
            const loggedIn = localStorage.getItem('cineverse_logged_in') === 'true';
            if (loggedIn) {
                cb({
                    uid: "mock_user_123",
                    email: "developer@cineverse.com",
                    displayName: localStorage.getItem('cineverse_mock_name') || "CineVerse Developer",
                    photoURL: localStorage.getItem('cineverse_mock_avatar') || "assets/logo.png",
                    updateProfile: (profile) => {
                        console.log("Mock profile update:", profile);
                        if (profile.displayName) localStorage.setItem('cineverse_mock_name', profile.displayName);
                        if (profile.photoURL) localStorage.setItem('cineverse_mock_avatar', profile.photoURL);
                        return Promise.resolve();
                    }
                });
            } else {
                cb(null);
            }
            return () => {};
        },
        currentUser: null,
        signOut: () => {
            localStorage.removeItem('cineverse_logged_in');
            return Promise.resolve();
        },
        signInWithEmailAndPassword: (email, password) => {
            console.log("🔥 Mock sign-in successful!");
            localStorage.setItem('cineverse_logged_in', 'true');
            localStorage.setItem('cineverse_mock_name', email.split('@')[0]);
            return Promise.resolve({
                user: {
                    uid: "mock_user_123",
                    email: email,
                    displayName: email.split('@')[0],
                    photoURL: "assets/logo.png",
                    updateProfile: (profile) => Promise.resolve()
                }
            });
        },
        createUserWithEmailAndPassword: (email, password) => {
            console.log("🔥 Mock sign-up successful!");
            localStorage.setItem('cineverse_logged_in', 'true');
            localStorage.setItem('cineverse_mock_name', email.split('@')[0]);
            return Promise.resolve({
                user: {
                    uid: "mock_user_123",
                    email: email,
                    displayName: email.split('@')[0],
                    photoURL: "assets/logo.png",
                    updateProfile: (profile) => Promise.resolve()
                }
            });
        },
        signInWithPopup: (provider) => {
            console.log("🔥 Mock Google login successful!");
            localStorage.setItem('cineverse_logged_in', 'true');
            localStorage.setItem('cineverse_mock_name', "Google Developer");
            return Promise.resolve({
                user: {
                    uid: "mock_user_123",
                    email: "google.dev@cineverse.com",
                    displayName: "Google Developer",
                    photoURL: "assets/logo.png",
                    updateProfile: (profile) => Promise.resolve()
                }
            });
        },
        signInWithRedirect: (provider) => {
            console.log("🔥 Mock Redirect triggered!");
            localStorage.setItem('cineverse_logged_in', 'true');
            return Promise.resolve();
        },
        getRedirectResult: () => Promise.resolve(null),
        sendPasswordResetEmail: (email) => {
            console.log("🔥 Mock password reset sent to:", email);
            return Promise.resolve();
        }
    };

    // Update currentUser dynamically based on local storage
    const syncCurrentUser = () => {
        const loggedIn = localStorage.getItem('cineverse_logged_in') === 'true';
        auth.currentUser = loggedIn ? {
            uid: "mock_user_123",
            email: "developer@cineverse.com",
            displayName: localStorage.getItem('cineverse_mock_name') || "CineVerse Developer",
            photoURL: localStorage.getItem('cineverse_mock_avatar') || "assets/logo.png",
            updateProfile: (profile) => {
                if (profile.displayName) localStorage.setItem('cineverse_mock_name', profile.displayName);
                if (profile.photoURL) localStorage.setItem('cineverse_mock_avatar', profile.photoURL);
                syncCurrentUser();
                return Promise.resolve();
            }
        } : null;
    };
    syncCurrentUser();

    provider = {};

    // ------------------------------------------
    // GLOBAL NAMESPACE EMULATION
    // ------------------------------------------
    const mockFirestoreFunc = function() {
        return {
            collection: function(name) { return db.collection(name); }
        };
    };
    mockFirestoreFunc.FieldValue = {
        serverTimestamp: function() { return new MockTimestamp(); },
        increment: function(amount) { return new MockIncrement(amount); }
    };

    const mockAuthFunc = function() {
        return auth;
    };
    mockAuthFunc.GoogleAuthProvider = function() {
        this.addScope = function() {};
    };

    if (typeof firebase === 'undefined') {
        window.firebase = {
            apps: [],
            initializeApp: function() { return {}; },
            app: function() { return {}; },
            auth: mockAuthFunc,
            firestore: mockFirestoreFunc
        };
    } else {
        try {
            if (!firebase.auth) firebase.auth = mockAuthFunc;
            if (!firebase.firestore) firebase.firestore = mockFirestoreFunc;
        } catch(e) {}
    }
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
window.serverTimestamp = () => {
    return (typeof firebase !== 'undefined' && firebase.firestore) 
        ? firebase.firestore.FieldValue.serverTimestamp() 
        : new Date().toISOString();
};
window.FieldValue = (typeof firebase !== 'undefined' && firebase.firestore) 
    ? firebase.firestore.FieldValue 
    : { serverTimestamp: () => new Date().toISOString() };

