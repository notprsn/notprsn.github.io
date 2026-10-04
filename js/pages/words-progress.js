const OWNER_EMAIL = "prasann.work@gmail.com";

export async function connectProgress(section, { onChange, onOwner, onError }) {
    const { firebaseConfig, firebaseAnalyticsOptions } = await import(window.Site.appendSiteVersion("../firebase-config.js"));
    const sdk = firebaseAnalyticsOptions.sdkVersion || "12.7.0";
    const [appApi, authApi, firestore] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${sdk}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${sdk}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${sdk}/firebase-firestore.js`),
    ]);
    // Keep owner sign-in separate from the site's anonymous analytics session.
    const app = appApi.getApps().find((app) => app.name === "notprsn-words")
        || appApi.initializeApp(firebaseConfig, "notprsn-words");
    const auth = authApi.getAuth(app);
    const db = firestore.getFirestore(app);
    const collection = section === "reading" ? "nights" : "places";
    let isOwner = false;

    const unsubscribeProgress = firestore.onSnapshot(
        firestore.collection(db, "wordProgress", section, collection),
        (snapshot) => onChange(Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]))),
        onError,
    );
    const unsubscribeAuth = authApi.onAuthStateChanged(auth, async (user) => {
        isOwner = false;
        onOwner(false);
        try {
            if (user?.email === OWNER_EMAIL && user.emailVerified) {
                const token = await user.getIdTokenResult();
                isOwner = token.signInProvider === "google.com";
            }
            onOwner(isOwner);
        } catch (error) {
            onError(error);
        }
    });
    window.addEventListener("pagehide", (event) => {
        if (event.persisted) return;
        unsubscribeProgress();
        unsubscribeAuth();
    });

    return {
        async signIn() {
            const provider = new authApi.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account", login_hint: OWNER_EMAIL });
            const result = await authApi.signInWithPopup(auth, provider);
            if (result.user.email !== OWNER_EMAIL || !result.user.emailVerified) {
                await authApi.signOut(auth);
                throw new Error("This account cannot edit progress.");
            }
        },
        signOut: () => authApi.signOut(auth),
        async save(id, data) {
            if (!isOwner) throw new Error("Owner sign-in is required.");
            await firestore.setDoc(firestore.doc(db, "wordProgress", section, collection, String(id)), {
                ...data,
                updatedAt: firestore.serverTimestamp(),
            }, { merge: true });
        },
    };
}
