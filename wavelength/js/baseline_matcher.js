/**
 * baseline_matcher.js
 * 
 * Implements the Baseline Matching Model described in wavelength/baseline_matching_plan.md.
 * This module assumes input user objects follow the user_profile_v1 schema.
 */

const CONFIG = {
    // 2.2 SN Strict Mode
    sn_threshold_high: 0.7,
    sn_threshold_low: 0.3,

    // 3.1 Education & Job
    alpha_f_edu: 2.0,
    alpha_f_job: 1.5,
    alpha_f_inc: 1.5,

    alpha_m_edu: 1.0,
    alpha_m_job: 1.0,
    alpha_m_inc: 1.0,
    beta_m_edu: 0.2,
    beta_m_job: 0.2,
    beta_m_inc: 0.2,

    // 3.2 Location
    d_max_km: 20,
    lambda_loc1: 0.7,
    lambda_loc2: 0.3,

    // 3.3 Humour
    gamma_dark: 0.7,
    w_h_styles: 0.4,
    w_h_cringe: 0.2,
    w_h_offence: 0.2,
    w_h_perform: 0.2,

    // 3.4 MBTI
    ambi_low: 0.35,
    ambi_high: 0.65,
    w_mbti_sn: 0.5,
    w_mbti_ie: 0.3,
    w_mbti_jp: 0.15,
    w_mbti_ft: 0.05,

    // 3.5 Hobbies
    w_hob_overlap: 0.6,
    w_hob_count: 0.4,

    // 3.7 Attachment
    lambda_att: 0.3,

    // 3.9 Soft Traits
    delta_soft: 0.15,

    // 4.1 Aggregate Weights
    // Female side
    w_d_loc: 0.4, w_d_edu_f: 0.5, w_d_edu_m: 0.1,
    w_vp_val: 0.8, w_vp_pol: 0.2,
    w_ar_att: 0.4, w_ar_rel: 0.6,

    // Male side
    w_prime_d_loc: 0.6, w_prime_d_edu_f: 0.1, w_prime_d_edu_m: 0.3,

    // 4.2 Female Latent Score Coefficients
    a_f_0: 0.0,
    a_f_dem: 2.0,
    a_f_hum: 2.5,
    a_f_mbti: 1.0,
    a_f_hob: 0.8,
    a_f_val: 0.5,
    a_f_att: 0.5,
    a_f_intent: 0.5,
    a_f_softlife: 0.3,

    // 4.3 Male Latent Score Coefficients
    a_m_0: 0.0,
    a_m_dem: 1.5,
    a_m_hum: 1.5,
    a_m_mbti: 0.8,
    a_m_hob: 0.8,
    a_m_val: 0.4,
    a_m_att: 0.4,
    a_m_intent: 0.3,
    a_m_softlife: 0.3,

    // 4.4 Logistic Params
    k_f: 1.0, b_f: 3.0,
    k_m: 0.8, b_m: 2.0,

    // 5. Ranking
    epsilon: 1e-6,
    tau: 0.2
};

// --- Helper Functions ---

function sigma(x) {
    return 1 / (1 + Math.exp(-x));
}

function clip01(x) {
    return Math.min(1, Math.max(0, x));
}

// Mock distance function (replace with real geo-calc if coords available)
function dist_km(u1, u2) {
    // For now, return a random distance or 0 if same area
    if (u1.facts.current_area_in_bangalore === u2.facts.current_area_in_bangalore) {
        return 0;
    }
    return 5 + Math.random() * 20; // Random 5-25km
}

// --- Hard Filters ---

function passes_dealbreakers(u, other) {
    // Implementation of 2.1
    // Check if 'other' violates 'u's dealbreakers
    if (!u.facts.dealbreakers) return 1;

    // Example: Diet
    if (u.facts.dealbreakers.diet) {
        const req = u.facts.dealbreakers.diet; // e.g., "must_be_veg"
        const otherDiet = (other.facts.diet || "").toLowerCase();
        const otherSmoking = (other.facts.smoking || "").toLowerCase();

        if (req === "must_be_veg" && otherDiet !== "veg") return 0;
        if (req === "must_not_smoke" && otherSmoking === "yes") return 0;
    }

    // Add more specific checks as needed based on schema
    return 1;
}

function sn_strict_block(f, m) {
    // Implementation of 2.2
    const sn_f = f.inferences.mbti_axes.SN.value;
    const sn_m = m.inferences.mbti_axes.SN.value;

    const strict_mode = f.inferences.mbti_matching_prefs?.sn_strict_mode?.value || false;

    if (strict_mode && sn_f >= CONFIG.sn_threshold_high && sn_m <= CONFIG.sn_threshold_low) {
        return 1; // Blocked
    }
    return 0;
}

// --- Feature Functions ---

// 3.1 Education & Job
function compute_edu_job_features(f, m) {
    // Helpers to safely get values, defaulting to 1 (middle-ish) if missing
    const get_edu = (u) => u.facts.education_tier || 1;
    const get_job = (u) => u.facts.job_difficulty || 1; // Not in schema explicitly, assume injected or defaulted
    const get_inc = (u) => u.facts.income_band || 1;

    const delta_edu = get_edu(m) - get_edu(f);
    const delta_job = get_job(m) - get_job(f);
    const delta_inc = get_inc(m) - get_inc(f);

    // Female-side
    const E_f = sigma(CONFIG.alpha_f_edu * delta_edu);
    const J_f = sigma(CONFIG.alpha_f_job * delta_job);
    const I_f = sigma(CONFIG.alpha_f_inc * delta_inc);

    const EDU_f = (E_f + J_f + I_f) / 3;

    // Male-side
    const E_m = 0.5 + CONFIG.beta_m_edu * (sigma(CONFIG.alpha_m_edu * (get_edu(f) - get_edu(m))) - 0.5);
    const J_m = 0.5 + CONFIG.beta_m_job * (sigma(CONFIG.alpha_m_job * (get_job(f) - get_job(m))) - 0.5);
    const I_m = 0.5 + CONFIG.beta_m_inc * (sigma(CONFIG.alpha_m_inc * (get_inc(f) - get_inc(m))) - 0.5);

    const EDU_m = (E_m + J_m + I_m) / 3;

    return { EDU_f, EDU_m };
}

// 3.2 Location
function compute_location_score(f, m) {
    const d = dist_km(f, m);
    const D_loc = clip01(1 - d / CONFIG.d_max_km);

    const same_area = f.facts.current_area_in_bangalore === m.facts.current_area_in_bangalore;
    const D_sameArea = same_area ? 1 : 0;

    const LOC = CONFIG.lambda_loc1 * D_loc + CONFIG.lambda_loc2 * D_sameArea;
    return LOC;
}

// 3.3 Humour
function compute_humour_score(f, m) {
    if (!f.inferences.humour_profile || !m.inferences.humour_profile) return 0.5; // Default if missing

    const hf = f.inferences.humour_profile;
    const hm = m.inferences.humour_profile;

    // 3.3.1 Styles
    const styles = Object.keys(hf.styles);
    let sum_sq_diff = 0;
    styles.forEach(k => {
        const v_f = hf.styles[k]?.value || 0;
        const v_m = hm.styles[k]?.value || 0;
        sum_sq_diff += Math.pow(v_f - v_m, 2);
    });
    const H_styles = clip01(1 - (1 / styles.length) * sum_sq_diff);

    // 3.3.2 Cringe & Offence
    const H_cringe = 1 - Math.abs(hf.cringe_tolerance.value - hm.cringe_tolerance.value);
    const H_offence = 1 - Math.abs(hf.offence_tolerance.value - hm.offence_tolerance.value);

    // Dark Penalty
    const d_f = hf.styles['dark_morbid']?.value || 0;
    const d_m = hm.styles['dark_morbid']?.value || 0;
    const o_f = hf.offence_tolerance.value;
    const o_m = hm.offence_tolerance.value;

    const P_darkOffense = clip01(1 - CONFIG.gamma_dark * Math.max(0, d_f - o_m) - CONFIG.gamma_dark * Math.max(0, d_m - o_f));

    // 3.3.3 Perform vs Appreciate
    const p_f = hf.performs_vs_appreciates.value;
    const p_m = hm.performs_vs_appreciates.value;
    const H_perform = 1 - Math.abs(p_f - p_m);

    // 3.3.4 Combined
    const HUM = clip01(
        CONFIG.w_h_styles * H_styles +
        CONFIG.w_h_cringe * H_cringe +
        CONFIG.w_h_offence * H_offence +
        CONFIG.w_h_perform * H_perform
    ) * P_darkOffense;

    return HUM;
}

// 3.4 MBTI
function compute_mbti_score(f, m) {
    const ax_f = f.inferences.mbti_axes;
    const ax_m = m.inferences.mbti_axes;

    // SN
    const d_SN = Math.abs(ax_f.SN.value - ax_m.SN.value);
    const SN_comp = 1 - d_SN;

    // IE
    const IE_f = ax_f.IE.value;
    const IE_m = ax_m.IE.value;
    const A_f = (IE_f >= CONFIG.ambi_low && IE_f <= CONFIG.ambi_high) ? 1 : 0;
    const A_m = (IE_m >= CONFIG.ambi_low && IE_m <= CONFIG.ambi_high) ? 1 : 0;
    const d_IE = Math.abs(IE_f - IE_m);

    let IE_comp;
    if (A_f && A_m) IE_comp = 1;
    else if (A_f || A_m) IE_comp = 1 - 0.5 * d_IE;
    else IE_comp = 1 - d_IE;

    // JP
    const d_JP = Math.abs(ax_f.JP.value - ax_m.JP.value);
    const JP_comp = 1 - d_JP * d_JP;

    // FT
    const FT_comp = 0.5;

    const MBTI = clip01(
        CONFIG.w_mbti_sn * SN_comp +
        CONFIG.w_mbti_ie * IE_comp +
        CONFIG.w_mbti_jp * JP_comp +
        CONFIG.w_mbti_ft * FT_comp
    );

    return MBTI;
}

// 3.5 Hobbies
function compute_hobbies_score(f, m) {
    const h_f = f.inferences.hobbies || [];
    const h_m = m.inferences.hobbies || [];

    // Create map of involvement
    const map_f = {}; h_f.forEach(h => map_f[h.name] = h.involvement);
    const map_m = {}; h_m.forEach(h => map_m[h.name] = h.involvement);

    const all_hobbies = new Set([...Object.keys(map_f), ...Object.keys(map_m)]);

    // Overlap
    let sum_sq = 0;
    all_hobbies.forEach(h => {
        const v_f = map_f[h] || 0;
        const v_m = map_m[h] || 0;
        sum_sq += Math.pow(v_f - v_m, 2);
    });

    const V_size = all_hobbies.size || 1;
    const H_overlap = clip01(1 - (1 / V_size) * sum_sq);

    // Count
    const n_f = h_f.filter(h => h.involvement >= 0.5).length;
    const n_m = h_m.filter(h => h.involvement >= 0.5).length;
    const n_max = Math.max(n_f, n_m, 1);
    const H_count = 1 - Math.abs(n_f - n_m) / n_max;

    const HOB = clip01(
        CONFIG.w_hob_overlap * H_overlap +
        CONFIG.w_hob_count * H_count
    );

    return HOB;
}

// 3.6 Values & Politics
function compute_values_score(f, m) {
    const v_f = f.inferences.values;
    const v_m = m.inferences.values;

    const keys = ['family_oriented', 'career_focused', 'risk_taking', 'traditional_modern_score'];
    let sum_sq = 0;
    keys.forEach(k => {
        sum_sq += Math.pow(v_f[k].value - v_m[k].value, 2);
    });
    const V_diff = sum_sq / keys.length;
    const VAL = clip01(1 - V_diff);

    const pol_f = f.inferences.political_lean.scalar_0_1.value;
    const pol_m = m.inferences.political_lean.scalar_0_1.value;
    const POL = 1 - Math.abs(pol_f - pol_m);

    const VALPOL = clip01(CONFIG.w_vp_val * VAL + CONFIG.w_vp_pol * POL);
    return VALPOL;
}

// 3.7 Attachment & Relationship
function compute_att_rel_score(f, m) {
    // Attachment
    const att_f = f.inferences.attachment;
    const att_m = m.inferences.attachment;
    const A_insec = (att_f.anxious.value + att_f.avoidant.value + att_m.anxious.value + att_m.avoidant.value) / 4;
    const ATT = 1 - CONFIG.lambda_att * A_insec;

    // Relationship Style
    // Assuming these fields exist in relationship_style object
    const rs_f = f.relationship_style;
    const rs_m = m.relationship_style;

    // Defaulting to 0.5 if missing (schema plan implies they exist)
    const get_val = (u, k) => u[k]?.value || 0.5;

    const R_comm = 1 - Math.abs(get_val(rs_f, 'communication_need') - get_val(rs_m, 'communication_need'));
    const R_indep = 1 - Math.abs(get_val(rs_f, 'independence_need') - get_val(rs_m, 'independence_need'));
    const R_long = 1 - Math.abs(get_val(rs_f, 'long_term_orientation') - get_val(rs_m, 'long_term_orientation'));

    const RELSTYLE = clip01((R_comm + R_indep + R_long) / 3);

    const ATTREL = clip01(CONFIG.w_ar_att * ATT + CONFIG.w_ar_rel * RELSTYLE);
    return ATTREL;
}

// 3.8 Intent
function compute_intent_score(f, m) {
    const i_f = f.facts.relationship_intent;
    const i_m = m.facts.relationship_intent;

    if (i_f === i_m) return 1;
    if (i_f === 'open_to_both' || i_m === 'open_to_both') return 0.9;
    return 0.7;
}

// 3.9 Soft Lifestyle
function compute_softlife_score(f, m) {
    // Example traits: smoking, drinking. Assuming in facts or inferences.
    // Schema doesn't explicitly list them in facts summary but implies them.
    // Let's assume they are in facts for now.
    const traits = ['smoking', 'drinking', 'nightlife'];
    let sum = 0;
    let count = 0;

    traits.forEach(t => {
        if (f.facts[t] && m.facts[t]) {
            count++;
            if (f.facts[t] === m.facts[t]) sum += 1;
            else sum += (1 - CONFIG.delta_soft);
        }
    });

    if (count === 0) return 1; // Neutral if no data
    return sum / count;
}

// --- Main Scoring ---

function compute_match_scores(f, m) {
    // 2. Hard Filters
    if (passes_dealbreakers(f, m) === 0 || passes_dealbreakers(m, f) === 0) {
        return { p_match: 0, reason: "Dealbreaker" };
    }
    if (sn_strict_block(f, m) === 1) {
        return { p_match: 0, reason: "SN Strict Block" };
    }

    // 3. Features
    const { EDU_f, EDU_m } = compute_edu_job_features(f, m);
    const LOC = compute_location_score(f, m);
    const HUM = compute_humour_score(f, m);
    const MBTI = compute_mbti_score(f, m);
    const HOB = compute_hobbies_score(f, m);
    const VALPOL = compute_values_score(f, m);
    const ATTREL = compute_att_rel_score(f, m);
    const INTENT = compute_intent_score(f, m);
    const SOFTLIFE = compute_softlife_score(f, m);

    // 4.1 Aggregate Groups
    const DEMO = clip01(CONFIG.w_d_loc * LOC + CONFIG.w_d_edu_f * EDU_f + CONFIG.w_d_edu_m * EDU_m);
    const DEMO_prime = clip01(CONFIG.w_prime_d_loc * LOC + CONFIG.w_prime_d_edu_f * EDU_f + CONFIG.w_prime_d_edu_m * EDU_m);

    // 4.2 Female Latent Score
    const S_f = CONFIG.a_f_0 +
        CONFIG.a_f_dem * DEMO +
        CONFIG.a_f_hum * HUM +
        CONFIG.a_f_mbti * MBTI +
        CONFIG.a_f_hob * HOB +
        CONFIG.a_f_val * VALPOL +
        CONFIG.a_f_att * ATTREL +
        CONFIG.a_f_intent * INTENT +
        CONFIG.a_f_softlife * SOFTLIFE;

    // 4.3 Male Latent Score
    const S_m = CONFIG.a_m_0 +
        CONFIG.a_m_dem * DEMO_prime +
        CONFIG.a_m_hum * HUM +
        CONFIG.a_m_mbti * MBTI +
        CONFIG.a_m_hob * HOB +
        CONFIG.a_m_val * VALPOL +
        CONFIG.a_m_att * ATTREL +
        CONFIG.a_m_intent * INTENT +
        CONFIG.a_m_softlife * SOFTLIFE;

    // 4.4 Like Probabilities
    const p_f = sigma(CONFIG.k_f * (S_f - CONFIG.b_f));
    const p_m = sigma(CONFIG.k_m * (S_m - CONFIG.b_m));

    // 4.5 Match Probability
    const p_match = p_f * p_m;

    return {
        p_match,
        p_f,
        p_m,
        S_f,
        S_m,
        details: {
            DEMO, DEMO_prime, HUM, MBTI, HOB, VALPOL, ATTREL, INTENT, SOFTLIFE
        }
    };
}

// 5. Ranking
function compute_ranking_score(p_match) {
    const s_base = Math.log(p_match + CONFIG.epsilon);

    // Gumbel noise
    const U = Math.random();
    const G = -Math.log(-Math.log(U));

    const s_rank = s_base + CONFIG.tau * G;
    return s_rank;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compute_match_scores, compute_ranking_score, CONFIG };
} else {
    // Browser global
    window.BaselineMatcher = { compute_match_scores, compute_ranking_score, CONFIG };
}
