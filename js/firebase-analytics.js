const CONFIG_MODULE_PATH = "./firebase-config.js";
const DEFAULT_SDK_VERSION = "12.7.0";
const REQUIRED_CONFIG_KEYS = ["apiKey", "authDomain", "projectId", "appId"];
const VISITOR_STORAGE_KEY = "notprsn.analytics.visitor.v1";
const COUNTERS_COLLECTION = "analytics";
const COUNTERS_DOCUMENT = "site";
const VISITORS_COLLECTION = "visitors";

let configPromise;
let firebasePromise;
let pageViewPromise;

export function initSiteAnalytics() {
    if (!pageViewPromise) {
        pageViewPromise = trackPageView();
    }

    return pageViewPromise;
}

export async function trackPageView() {
    const state = await getFirebaseState();
    if (!state.enabled) {
        debugAnalytics(state.reason);
        return { tracked: false, reason: state.reason };
    }

    try {
        const user = await ensureSignedIn(state);
        const visitorMarker = readVisitorMarker();
        const isNewVisitor = visitorMarker.visitorId !== user.uid;
        const path = currentPagePath();
        const referrerHost = currentReferrerHost();
        const {
            doc,
            increment,
            serverTimestamp,
            writeBatch,
        } = state.firestore;
        const now = serverTimestamp();
        const visitorRef = doc(state.db, VISITORS_COLLECTION, user.uid);
        const countersRef = doc(state.db, COUNTERS_COLLECTION, COUNTERS_DOCUMENT);
        const visitorData = {
            visitorId: user.uid,
            updatedAt: now,
            visitCount: increment(1),
            lastPath: path,
        };

        if (isNewVisitor) {
            visitorData.createdAt = now;
            visitorData.firstPath = path;
        }
        if (referrerHost) {
            visitorData.lastReferrerHost = referrerHost;
        }

        const batch = writeBatch(state.db);
        batch.set(visitorRef, visitorData, { merge: true });
        batch.set(
            countersRef,
            {
                totalVisits: increment(1),
                uniqueVisitors: increment(isNewVisitor ? 1 : 0),
                updatedAt: now,
                lastVisitAt: now,
            },
            { merge: true }
        );
        await batch.commit();
        writeVisitorMarker(user.uid);

        return { tracked: true };
    } catch (error) {
        warnAnalytics("Could not track page view.", error);
        return { tracked: false, reason: error.message };
    }
}

export async function trackLoveLettersUnlock() {
    const state = await getFirebaseState();
    if (!state.enabled) {
        debugAnalytics(state.reason);
        return { tracked: false, reason: state.reason };
    }

    try {
        await ensureSignedIn(state);
        const { doc, increment, serverTimestamp, setDoc } = state.firestore;
        const now = serverTimestamp();
        await setDoc(
            doc(state.db, COUNTERS_COLLECTION, COUNTERS_DOCUMENT),
            {
                loveLettersUnlocks: increment(1),
                updatedAt: now,
                lastUnlockAt: now,
            },
            { merge: true }
        );

        return { tracked: true };
    } catch (error) {
        warnAnalytics("Could not track love-letter unlock.", error);
        return { tracked: false, reason: error.message };
    }
}

export async function mountLoveLettersStatsPanel(container) {
    if (!(container instanceof Element)) {
        return;
    }

    const panel = ensureStatsPanel(container);
    const status = panel.querySelector("[data-love-stats-status]");
    const values = {
        uniqueVisitors: panel.querySelector("[data-love-stats-unique]"),
        totalVisits: panel.querySelector("[data-love-stats-total]"),
        unlocks: panel.querySelector("[data-love-stats-unlocks]"),
        lastVisit: panel.querySelector("[data-love-stats-last-visit]"),
        lastUnlock: panel.querySelector("[data-love-stats-last-unlock]"),
    };
    const signInButton = panel.querySelector("[data-love-stats-sign-in]");
    const refreshButton = panel.querySelector("[data-love-stats-refresh]");

    panel.hidden = false;
    setStatsStatus(status, "Loading stats...");

    const state = await getFirebaseState();
    if (!state.enabled) {
        setStatsStatus(status, "Analytics are not configured yet.");
        signInButton.hidden = true;
        refreshButton.hidden = true;
        return;
    }

    const refreshStats = async () => {
        setStatsStatus(status, "Loading stats...");
        try {
            const user = state.auth.currentUser;
            if (!user || user.isAnonymous) {
                setStatsStatus(status, "Sign in with your Google account to view private stats.");
                signInButton.hidden = false;
                refreshButton.hidden = true;
                return;
            }

            const stats = await readSiteStats(state);
            renderStats(values, stats);
            setStatsStatus(status, "Private stats loaded.");
            signInButton.hidden = true;
            refreshButton.hidden = false;
        } catch (error) {
            warnAnalytics("Could not load private stats.", error);
            setStatsStatus(status, "Stats are private. Check the allowed admin email in Firestore rules.");
            signInButton.hidden = false;
            refreshButton.hidden = false;
        }
    };

    signInButton.onclick = async () => {
        signInButton.disabled = true;
        setStatsStatus(status, "Opening Google sign-in...");
        try {
            const provider = new state.authApi.GoogleAuthProvider();
            await state.authApi.signInWithPopup(state.auth, provider);
            await refreshStats();
        } catch (error) {
            warnAnalytics("Google sign-in failed.", error);
            setStatsStatus(status, "Google sign-in did not finish.");
        } finally {
            signInButton.disabled = false;
        }
    };
    refreshButton.onclick = refreshStats;

    await refreshStats();
}

async function readSiteStats(state) {
    const { doc, getDoc } = state.firestore;
    const snapshot = await getDoc(doc(state.db, COUNTERS_COLLECTION, COUNTERS_DOCUMENT));
    return snapshot.exists() ? snapshot.data() : {};
}

function ensureStatsPanel(container) {
    const existing = container.querySelector("[data-love-stats-panel]");
    if (existing) {
        return existing;
    }

    const panel = document.createElement("article");
    panel.className = "letter-shell letter-shell--stats";
    panel.dataset.loveStatsPanel = "";
    panel.hidden = true;
    panel.innerHTML = `
        <p class="panel-label">Private Stats</p>
        <h2>Archive stats</h2>
        <p class="status-text love-stats__status" data-love-stats-status></p>
        <dl class="love-stats__grid">
            <div>
                <dt>Unique visitors</dt>
                <dd data-love-stats-unique>-</dd>
            </div>
            <div>
                <dt>Total visits</dt>
                <dd data-love-stats-total>-</dd>
            </div>
            <div>
                <dt>Unlocks</dt>
                <dd data-love-stats-unlocks>-</dd>
            </div>
            <div>
                <dt>Last visit</dt>
                <dd data-love-stats-last-visit>-</dd>
            </div>
            <div>
                <dt>Last unlock</dt>
                <dd data-love-stats-last-unlock>-</dd>
            </div>
        </dl>
        <div class="love-stats__actions">
            <button class="lock-button" type="button" data-love-stats-sign-in>Sign in with Google</button>
            <button class="lock-button" type="button" data-love-stats-refresh hidden>Refresh stats</button>
        </div>
    `;
    container.prepend(panel);
    return panel;
}

function renderStats(targets, stats) {
    targets.uniqueVisitors.textContent = formatCount(stats.uniqueVisitors);
    targets.totalVisits.textContent = formatCount(stats.totalVisits);
    targets.unlocks.textContent = formatCount(stats.loveLettersUnlocks);
    targets.lastVisit.textContent = formatTimestamp(stats.lastVisitAt);
    targets.lastUnlock.textContent = formatTimestamp(stats.lastUnlockAt);
}

async function getFirebaseState() {
    const configState = await loadConfig();
    if (!configState.enabled) {
        return configState;
    }

    if (!firebasePromise) {
        firebasePromise = loadFirebase(configState);
    }

    return firebasePromise;
}

async function loadConfig() {
    if (!configPromise) {
        configPromise = import(versionedModulePath(CONFIG_MODULE_PATH))
            .then((module) => normalizeConfig(module))
            .catch((error) => ({
                enabled: false,
                reason: `Firebase config could not be loaded: ${error.message}`,
            }));
    }

    return configPromise;
}

function normalizeConfig(module) {
    const config = module.firebaseConfig ?? {};
    const options = module.firebaseAnalyticsOptions ?? {};
    const missingKey = REQUIRED_CONFIG_KEYS.find((key) => !isConfiguredValue(config[key]));

    if (options.enabled !== true) {
        return {
            enabled: false,
            reason: "Firebase analytics are disabled in js/firebase-config.js.",
        };
    }
    if (missingKey) {
        return {
            enabled: false,
            reason: `Firebase analytics are missing config value: ${missingKey}.`,
        };
    }

    return {
        enabled: true,
        config,
        sdkVersion: options.sdkVersion || DEFAULT_SDK_VERSION,
    };
}

async function loadFirebase(configState) {
    const sdkVersion = encodeURIComponent(configState.sdkVersion);
    const [appApi, authApi, firestore] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-firestore.js`),
    ]);
    const app =
        appApi.getApps().find((firebaseApp) => firebaseApp.name === "notprsn-site") ||
        appApi.initializeApp(configState.config, "notprsn-site");
    const auth = authApi.getAuth(app);
    const db = firestore.getFirestore(app);

    await authApi.setPersistence(auth, authApi.browserLocalPersistence);

    return {
        enabled: true,
        app,
        auth,
        authApi,
        db,
        firestore,
    };
}

async function ensureSignedIn(state) {
    if (state.auth.currentUser) {
        return state.auth.currentUser;
    }

    const credential = await state.authApi.signInAnonymously(state.auth);
    return credential.user;
}

function readVisitorMarker() {
    try {
        const rawMarker = window.localStorage.getItem(VISITOR_STORAGE_KEY);
        return rawMarker ? JSON.parse(rawMarker) : {};
    } catch {
        return {};
    }
}

function writeVisitorMarker(visitorId) {
    try {
        window.localStorage.setItem(
            VISITOR_STORAGE_KEY,
            JSON.stringify({
                visitorId,
                updatedAt: new Date().toISOString(),
            })
        );
    } catch {
        // Tracking can still work for the current load without localStorage.
    }
}

function currentPagePath() {
    const path = `${window.location.pathname}${window.location.search}`;
    return path.slice(0, 240);
}

function currentReferrerHost() {
    if (!document.referrer) {
        return "";
    }

    try {
        const referrer = new URL(document.referrer);
        if (referrer.hostname === window.location.hostname) {
            return "";
        }
        return referrer.hostname.slice(0, 120);
    } catch {
        return "";
    }
}

function versionedModulePath(path) {
    const version = encodeURIComponent(window.Site?.getSiteVersion?.() || "dev");
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}v=${version}`;
}

function isConfiguredValue(value) {
    return typeof value === "string" && value.trim() && !value.includes("REPLACE_WITH");
}

function setStatsStatus(target, message) {
    if (!target) {
        return;
    }

    target.textContent = message;
    target.hidden = !message;
}

function formatCount(value) {
    return Number.isFinite(value) ? value.toLocaleString("en-US") : "0";
}

function formatTimestamp(value) {
    if (!value) {
        return "-";
    }

    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function debugAnalytics(message) {
    if (message) {
        console.debug(`[site analytics] ${message}`);
    }
}

function warnAnalytics(message, error) {
    console.warn(`[site analytics] ${message}`, error);
}
