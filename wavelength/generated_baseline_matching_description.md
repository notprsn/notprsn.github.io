# Baseline Matching Model Description

This document describes the **Baseline Matching Model** implemented in `baseline_matcher.js`. It is a heuristic-based compatibility engine designed to rank candidate pairs (Female `f`, Male `m`) using the `user_profile_v1` schema.

## Goal
To provide a "common sense" baseline ranking that mimics human intuition about compatibility before implementing advanced ML (Two-Tower/GNN) models.

---

## 1. Hard Filters (The Gatekeepers)
Before scoring, pairs are checked against binary rejection criteria. If any fail, $p_{match} = 0$.

1.  **Explicit Dealbreakers**: Checks `facts.dealbreakers` against the other user's `facts`.
    *   *Example*: If User A has `diet: "must_be_veg"` and User B is `Non-Veg`, the match is blocked.
2.  **SN Strict Mode**: A personality-based filter.
    *   If a user enables `mbti_matching_prefs.sn_strict_mode` and is high-Intuitive (N), they strictly reject high-Sensing (S) partners.

---

## 2. Feature Scoring
If filters pass, the model computes feature scores in $[0, 1]$.

### A. Demographics & Lifestyle
*   **Education/Job/Income**: Penalizes large gaps where Female > Male (hypergamy heuristic), but is more relaxed for Male > Female.
*   **Location**: Distance-based decay ($1 - d/d_{max}$) plus a bonus for being in the same area cluster.
*   **Soft Traits**: Penalties for mismatches in smoking, drinking, and nightlife habits.

### B. Humour Compatibility (High Weight)
*   **Style Similarity**: Euclidean distance between humour style vectors (e.g., Puns, Dark, Sarcasm).
*   **Tolerance Matching**: Penalizes if one user loves Dark/Offensive humour and the other has low `offence_tolerance`.
*   **Dynamics**: Matches Performers with Appreciators.

### C. MBTI Compatibility
*   **S-N Axis**: High penalty for differences (communication style mismatch).
*   **I-E Axis**: Prefers "Ambivert + Any" or "Introvert + Extrovert" balance; penalizes "Introvert + Introvert" or "Extrovert + Extrovert" extremes slightly less.
*   **J-P Axis**: Broad tolerance.

### D. Values & Interests
*   **Values**: Alignment on `career_focused`, `family_oriented`, `risk_taking`.
*   **Hobbies**: Score based on overlap of shared hobbies and alignment of "hobby count" (busyness).

### E. Attachment & Relationship
*   **Security**: Bonus for high security (low anxiety/avoidance).
*   **Needs**: Similarity in `communication_need`, `independence_need`, and `long_term_orientation`.

---

## 3. Latent Scoring (Asymmetric)
The model computes two separate latent scores, reflecting that men and women may prioritize different signals.

### Female Latent Score ($S_f$)
*   **Priorities**: High weight on **Socio-Economic Status** (Education/Job), **Humour**, and **Relationship Intent**.
*   *Formula*: Linear combination of features with weights $\alpha_f$.

### Male Latent Score ($S_m$)
*   **Priorities**: High weight on **Physical/Location** (assumed proxy in baseline), **Humour**, and **"Soft Life"** compatibility. Lower weight on partner's career status.
*   *Formula*: Linear combination of features with weights $\alpha_m$.

---

## 4. Probability & Ranking

### Match Probability
Latent scores are converted to probabilities via a logistic function $\sigma$:
$$ p_f = \sigma(k_f \cdot (S_f - b_f)) $$
$$ p_m = \sigma(k_m \cdot (S_m - b_m)) $$
$$ p_{match} = p_f \cdot p_m $$

### Final Ranking Score
To ensure diversity and allow exploration in the recommendation feed:
$$ Score = \log(p_{match}) + \tau \cdot G $$
*   $G$: Gumbel noise (for stochastic ranking).
*   $\tau$: Temperature parameter (controls randomness).

---

## Implementation
*   **File**: `js/baseline_matcher.js`
*   **Usage**: `compute_match_scores(user_f, user_m)` returns full details.
*   **Demo**: `matching_demo.html` visualizes this logic on a mock population.
