
/**
 * ml_mock_matcher.js
 * 
 * Implements the mock ML layer for the Wavelength demo.
 * Simulates:
 * 1. Cluster-specific baseline adjustments.
 * 2. Two-tower ML probability predictions (synthetic).
 * 3. Logit-level mixing of Baseline + ML scores.
 */

// --- Constants & Config ---

// Mock cluster weights (beta coefficients)
// These emphasize different features per cluster to show variety.
const beta_f = {
    0: { intercept: 0.0, DEMO: 0.6, HUM: 0.8, MBTI: 0.2, HOB: 0.4, VALPOL: 0.3, ATTREL: 0.4, INTENT: 0.3, SOFTLIFE: 0.2 }, // Koramangala Startup Extroverts
    1: { intercept: 0.0, DEMO: 0.9, HUM: 0.4, MBTI: 0.3, HOB: 0.2, VALPOL: 0.4, ATTREL: 0.5, INTENT: 0.5, SOFTLIFE: 0.2 }, // South BLR Calm Traditional
    2: { intercept: 0.0, DEMO: 0.5, HUM: 0.7, MBTI: 0.4, HOB: 0.6, VALPOL: 0.3, ATTREL: 0.3, INTENT: 0.2, SOFTLIFE: 0.4 }, // Indiranagar Creative Intuitives
    3: { intercept: 0.0, DEMO: 0.7, HUM: 0.5, MBTI: 0.5, HOB: 0.3, VALPOL: 0.4, ATTREL: 0.6, INTENT: 0.4, SOFTLIFE: 0.3 }  // North BLR Corporate Analysts
};

const beta_m = {
    0: { intercept: 0.0, DEMO: 0.5, HUM: 0.6, MBTI: 0.3, HOB: 0.4, VALPOL: 0.2, ATTREL: 0.3, INTENT: 0.2, SOFTLIFE: 0.5 }, // Driven Builder Types
    1: { intercept: 0.0, DEMO: 0.3, HUM: 0.7, MBTI: 0.2, HOB: 0.5, VALPOL: 0.1, ATTREL: 0.2, INTENT: 0.1, SOFTLIFE: 0.6 }  // Chill Explorer Types
};

export const clusterDescriptions = {
    female: {
        0: { name: "Koramangala Startup Extroverts", bullets: ["High ambition", "Clubbing / gigs", "Career-focused"] },
        1: { name: "South BLR Calm Traditional", bullets: ["Family-oriented", "Community ties", "Moderate ambition"] },
        2: { name: "Indiranagar Creative Intuitives", bullets: ["Art / music", "High humour sensitivity", "Intuitive-leaning"] },
        3: { name: "North BLR Corporate Analysts", bullets: ["Structured", "Heavy workweeks", "Stable lifestyle"] }
    },
    male: {
        0: { name: "Driven Builder Types", bullets: ["High education", "Demanding jobs", "Long-term leaning"] },
        1: { name: "Chill Explorer Types", bullets: ["Flexible careers", "Experience-seeking", "Lower material focus"] }
    }
};

// --- Helper Functions ---

function clamp01(x, min = 0, max = 1) {
    return Math.min(max, Math.max(min, x));
}

// Simple hash function to generate deterministic pseudo-random numbers
function hashToUnit(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
}

// --- Core Logic ---

// 1. Cluster-Specific Baselines
function computeClusterBaseline(u, featureGroups, betas) {
    const c = u.ml_cluster_id !== undefined ? u.ml_cluster_id : 0; // Default to 0 if missing
    const b = betas[c];

    // Linear combination
    const L = b.intercept +
        b.DEMO * featureGroups.DEMO +
        b.HUM * featureGroups.HUM +
        b.MBTI * featureGroups.MBTI +
        b.HOB * featureGroups.HOB +
        b.VALPOL * featureGroups.VALPOL +
        b.ATTREL * featureGroups.ATTREL +
        b.INTENT * featureGroups.INTENT +
        b.SOFTLIFE * featureGroups.SOFTLIFE;

    const p = 1 / (1 + Math.exp(-L));
    return { L, p, c };
}

export function computeClusterBaselineForFemale(f, featureGroups) {
    return computeClusterBaseline(f, featureGroups, beta_f);
}

export function computeClusterBaselineForMale(m, featureGroups) {
    return computeClusterBaseline(m, featureGroups, beta_m);
}

// 2. Mock ML Probabilities
export function computeMockMLProbabilities(f, m, p_f_base, p_m_base) {
    // Deterministic seed based on pair
    const seed = hashToUnit(f.id + "|" + m.id);

    // Let ML slightly correct baseline +/- up to 0.15
    // This simulates the ML model finding non-linear patterns the baseline missed
    const delta_f = (seed - 0.5) * 0.3;
    const delta_m = (0.5 - seed) * 0.3; // Anti-correlated for variety

    let p_f_ML = clamp01(p_f_base + delta_f);
    let p_m_ML = clamp01(p_m_base + delta_m);

    return { p_f_ML, p_m_ML };
}

// 3. Logit Mixing
export function mixWithBaseline(p_base, p_ML, alpha) {
    const eps = 1e-6;
    const pB = clamp01(p_base, eps, 1 - eps);
    const pM = clamp01(p_ML, eps, 1 - eps);

    const L_base = Math.log(pB / (1 - pB));
    const L_ML = Math.log(pM / (1 - pM));

    const L_final = alpha * L_base + (1 - alpha) * L_ML;
    const p_final = 1 / (1 + Math.exp(-L_final));

    return { L_base, L_ML, L_final, p_final };
}

// --- Main Orchestrator ---

export function computeFinalMatchProbability(f, m, featureGroups, baselineResult, mode, alphaF, alphaM) {
    // 1. Baseline Global (from existing baseline_matcher)
    // We assume baselineResult contains p_f, p_m from the global baseline model
    const p_f_base_global = baselineResult.p_f;
    const p_m_base_global = baselineResult.p_m;

    // 2. Determine Base Probs (Global vs Cluster)
    let p_f_base = p_f_base_global;
    let p_m_base = p_m_base_global;
    let f_cluster_info = null;
    let m_cluster_info = null;

    if (mode === "cluster_adjusted_plus_ML") {
        const fRes = computeClusterBaselineForFemale(f, featureGroups);
        const mRes = computeClusterBaselineForMale(m, featureGroups);
        p_f_base = fRes.p;
        p_m_base = mRes.p;
        f_cluster_info = fRes;
        m_cluster_info = mRes;
    }

    // 3. Mock ML Predictions
    // We compute these regardless of mode to show them in UI if needed, 
    // but they are only used in mixing if mode != baseline_only
    const { p_f_ML, p_m_ML } = computeMockMLProbabilities(f, m, p_f_base, p_m_base);

    // 4. Mode-Dependent Logic
    if (mode === "baseline_only") {
        return {
            p_f_base, p_m_base,
            p_f_ML: null, p_m_ML: null,
            p_f_final: p_f_base,
            p_m_final: p_m_base,
            p_match_final: p_f_base * p_m_base,
            details: baselineResult.details, // Pass through original details
            clusters: { f: f.ml_cluster_id, m: m.ml_cluster_id }
        };
    }

    // Mixing (for baseline_plus_ML and cluster_adjusted_plus_ML)
    const mixF = mixWithBaseline(p_f_base, p_f_ML, alphaF);
    const mixM = mixWithBaseline(p_m_base, p_m_ML, alphaM);

    const p_match_final = mixF.p_final * mixM.p_final;

    return {
        p_f_base,
        p_m_base,
        p_f_ML,
        p_m_ML,
        p_f_final: mixF.p_final,
        p_m_final: mixM.p_final,
        p_match_final,
        details: baselineResult.details,
        clusters: { f: f.ml_cluster_id, m: m.ml_cluster_id },
        debug: {
            L_f_base: mixF.L_base,
            L_f_ML: mixF.L_ML,
            L_f_final: mixF.L_final,
            L_m_base: mixM.L_base,
            L_m_ML: mixM.L_ML,
            L_m_final: mixM.L_final
        }
    };
}
