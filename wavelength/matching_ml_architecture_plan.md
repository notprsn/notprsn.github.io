
# matching_ml_architecture_plan.md

## 0. Context and Current State

You are extending **Wavelength (Bengaluru Edition)**, which currently has: fileciteturn0file2

- A fully defined **User Profile v1.1 schema** (`user_profile_v1`) documented in `generated_user_data_schema_description.md`. fileciteturn0file1  
- A **Baseline Matching Model** implemented in `js/baseline_matcher.js` and explained in `generated_baseline_matching_description.md`. fileciteturn0file0  
- Interactive UIs:
  - `schema.html`: Schema browser / dev docs.
  - `matching_demo.html`: Baseline matching demo on ~10 mock Bengaluru users.
  - `index.html`: Concept landing page.

This document defines a **concrete, demo-first v1 ML architecture** that:

1. Keeps the existing **baseline matcher** intact.
2. Adds an **ML layer spec** (two-tower + cluster-specific baselines).
3. Specifies how to build a **demo version** of this ML layer using **synthetic / hand-crafted outputs** on top of the existing `matching_demo.html`.
4. Remains compatible with future **real training code** (Python / PyTorch).

Think of this as: *“Design the real architecture, but implement a JS-powered, explainable mock of it now.”*

---

## 1. Target ML Architecture (Conceptual, Real System)

This section defines the **real model** we want eventually. The demo will approximate its outputs.

### 1.1 Data: swipe / like events

Training data will come from **swipe events**, independent of the demo for now.

**Event schema (conceptual):**

```jsonc
{
  "event_id": "uuid",
  "timestamp": "ISO8601",
  "viewer_id": "user_id",       // swiping user
  "target_id": "user_id",       // profile being viewed
  "viewer_gender": "F" | "M",
  "target_gender": "F" | "M",
  "decision": "like" | "pass",
  "source": "baseline_v1",      // which ranking model produced it
  "shown_in_rank": 3,           // position in candidate list (optional)
  "context": {
    "p_match_baseline": 0.42    // snapshot of old baseline p_match at show-time
  }
}
```

For **heterosexual v1**:

- Only use events where `(viewer_gender, target_gender) ∈ {(F,M), (M,F)}`.
- Define binary labels:
  - For *female likes male*:
    - `y_f(f,m) = 1` if female f liked male m, else 0.
  - For *male likes female*:
    - `y_m(f,m) = 1` if male m liked female f, else 0.

### 1.2 Per-user feature vectors

Using `user_profile_v1`, build dense vectors for each user. fileciteturn0file1  

Let:

- `x_female(f) ∈ R^{D_f}`
- `x_male(m)   ∈ R^{D_m}`

Include:

1. **Static / Demographic (`facts`)**

- Age (normalized, e.g. `(age - 25) / 5`)
- Encoded:
  - `current_area_in_bangalore`
  - `education_tier`
  - `job_difficulty`
  - `income_band`
  - `diet`
  - `living_setup`
  - Primary language

Use one-hot or learned small embeddings and then concatenate.

2. **Psychometrics & Preferences (`inferences`)**

- MBTI axes: `IE`, `SN`, `FT`, `JP` ∈ [0,1].
- Attachment: `anxious`, `avoidant` ∈ [0,1].
- Humour profile:
  - Styles: `wordplay_puns`, `double_entendre`, `dry_deadpan`, `slapstick_goofy`, `dark_morbid`, `meta_internet_memes`, `sarcasm`.
  - Tolerances: `cringe_tolerance`, `offence_tolerance`.
  - Role: `performs_vs_appreciates` (0–1).
- Values: `family_oriented`, `career_focused`, `risk_taking`, `traditional_modern_score`.
- Relationship_style: `long_term_orientation`, `communication_need`, `independence_need`.

3. **Behaviour counters (later)**

- `likes_given_count`, `likes_received_count`, `acceptance_rate`, etc. (optional in early training).

4. **Text embeddings**

- Embeddings for:
  - `summaries.matching_v1`
  - `user_written_bio`
  - `relationship_history_v1`  
- Use a fixed embedding model; dimension ~128, then project to 32 for inclusion.

For real training, we will align `D_f` and `D_m` (e.g. by using the same feature template and zero-padding missing fields).

### 1.3 Pairwise baseline features

For a female–male pair (f, m), compute existing **baseline feature group scores** from `baseline_matcher.js`: fileciteturn0file0  

- `DEMO(f,m)`
- `HUM(f,m)`
- `MBTI(f,m)`
- `HOB(f,m)`
- `VALPOL(f,m)`
- `ATTREL(f,m)`
- `INTENT(f,m)`
- `SOFTLIFE(f,m)`

Define:

```text
g(f,m) = [
  DEMO, HUM, MBTI, HOB,
  VALPOL, ATTREL, INTENT, SOFTLIFE
] ∈ R^8
```

And global baseline probabilities (from the existing engine):

- `p_f_base_global(f,m)`  
- `p_m_base_global(f,m)`

Assemble **baseline_pair_features**:

```text
b(f,m) = [
  DEMO,
  HUM,
  MBTI,
  HOB,
  VALPOL,
  ATTREL,
  INTENT,
  SOFTLIFE,
  p_f_base_global,
  p_m_base_global
] ∈ R^{10}
```

### 1.4 Two-tower architecture

We design a **role-aware two-tower model**.

#### 1.4.1 Towers

- Female tower: `T_f : R^{D_f} → R^d`
- Male tower:   `T_m : R^{D_m} → R^d`

Architecture (both towers):

- Dense(D → 128), activation GELU
- Dense(128 → 64), activation GELU
- Output: Dense(64 → d), linear

Set embedding dimension:

- `d = 64`

Compute base embeddings:

- `h_f_base(f) = T_f(x_female(f)) ∈ R^{64}`
- `h_m_base(m) = T_m(x_male(m)) ∈ R^{64}`

#### 1.4.2 Role-specific heads

To model asymmetry:

For female:

- Actor embedding:

  ```text
  h_f_actor = W_f_actor · h_f_base + b_f_actor    // 64×64, 64
  ```

- Target embedding (as perceived by male):

  ```text
  h_f_target = W_f_target · h_f_base + b_f_target
  ```

For male:

- Actor embedding:

  ```text
  h_m_actor = W_m_actor · h_m_base + b_m_actor
  ```

- Target embedding (as perceived by female):

  ```text
  h_m_target = W_m_target · h_m_base + b_m_target
  ```

All W_* are 64×64; b_* have size 64.

#### 1.4.3 Pairwise heads

**Female likes male**:

Input:

```text
z_f(f,m) = concat(h_f_actor, h_m_target, b(f,m)) ∈ R^{64 + 64 + 10} = R^{138}
```

MLP `H_f`:

- Dense(138 → 64), GELU
- Dense(64 → 32), GELU
- Dense(32 → 1), linear

Output:

- `s_f_ML(f,m) = H_f(z_f(f,m))`
- `p_f_ML(f,m) = σ(s_f_ML(f,m))`

**Male likes female**:

Input:

```text
z_m(f,m) = concat(h_m_actor, h_f_target, b(f,m)) ∈ R^{138}
```

MLP `H_m`: same shape, separate params.

Output:

- `s_m_ML(f,m) = H_m(z_m(f,m))`
- `p_m_ML(f,m) = σ(s_m_ML(f,m))`

### 1.5 Training objective (real system)

For a batch of female-like samples:

\[
L_f = -rac{1}{N_f} \sum_{i=1}^{N_f} ig[ y_f^{(i)} \log p_f^{ML,(i)} + (1-y_f^{(i)}) \log(1-p_f^{ML,(i)}) ig]
\]

For male-like:

\[
L_m = -rac{1}{N_m} \sum_{j=1}^{N_m} ig[ y_m^{(j)} \log p_m^{ML,(j)} + (1-y_m^{(j)}) \log(1-p_m^{ML,(j)}) ig]
\]

Total:

\[
L_{total} = L_f + L_m
\]

Optimizer: Adam / AdamW, lr ≈ 1e-3.

(We do **not** implement this in JS demo; this is for future Python training.)

---

## 2. Clusters and Cluster-Specific Baselines

We want **different baselines for different user types**, implemented via clustering in the embedding space.

### 2.1 Clustering on embeddings

After training towers:

- For each female `f`, we have `h_f_base(f)`.
- For each male `m`, we have `h_m_base(m)`.

Run k-means separately:

- **Females**:
  - Input: `{ h_f_base(f) }`
  - `K_f = 4` clusters → `cluster_f(f) ∈ {0,1,2,3}`

- **Males**:
  - Input: `{ h_m_base(m) }`
  - `K_m = 2` clusters → `cluster_m(m) ∈ {0,1}`

Store these cluster IDs in user metadata.

### 2.2 Cluster-specific baseline weights (female side)

For each female cluster `c`:

1. Collect female-like events `(f,m,y_f)` where `cluster_f(f) = c`.
2. Use baseline feature vector `g(f,m) ∈ R^8`.
3. Fit logistic regression:

\[
\logit(p_{f,base}^{(c)}(f,m)) = eta_{f,0}^{(c)} + \sum_{k=1}^8 eta_{f,k}^{(c)} g_k(f,m)
\]

Store `β_f^(c)`.

At inference for female `f` with cluster `c`:

\[
L_{f,base}^{(c)}(f,m) = eta_{f,0}^{(c)} + \sum_{k=1}^8 eta_{f,k}^{(c)} g_k(f,m)
\]
\[
p_{f,base}^{(c)}(f,m) = σ(L_{f,base}^{(c)}(f,m))
\]

### 2.3 Cluster-specific baseline weights (male side)

Similarly for male cluster `d ∈ {0,1}`:

\[
\logit(p_{m,base}^{(d)}(f,m)) = eta_{m,0}^{(d)} + \sum_{k=1}^8 eta_{m,k}^{(d)} g_k(f,m)
\]

At inference:

\[
L_{m,base}^{(d)}(f,m) = eta_{m,0}^{(d)} + \sum_{k=1}^8 eta_{m,k}^{(d)} g_k(f,m)
\]
\[
p_{m,base}^{(d)}(f,m) = σ(L_{m,base}^{(d)}(f,m))
\]

---

## 3. Final Score Combination (Real System)

For pair (f,m):

1. Determine clusters:
   - `c = cluster_f(f)` (0–3)
   - `d = cluster_m(m)` (0–1)

2. Compute **cluster-adjusted baseline**:

\[
L_{f,base} = L_{f,base}^{(c)}(f,m), \quad
L_{m,base} = L_{m,base}^{(d)}(f,m)
\]
\[
p_{f,base} = σ(L_{f,base}), \quad
p_{m,base} = σ(L_{m,base})
\]

3. Compute **ML predictions**:

- `p_f_ML(f,m)` and `p_m_ML(f,m)` from two-tower model.

4. Convert to logits:

\[
L_{f,base} = \lograc{p_{f,base}}{1-p_{f,base}}, \quad
L_{m,base} = \lograc{p_{m,base}}{1-p_{m,base}}
\]
\[
L_{f,ML} = \lograc{p_{f,ML}}{1-p_{f,ML}}, \quad
L_{m,ML} = \lograc{p_{m,ML}}{1-p_{m,ML}}
\]

5. Logit-level mixture:

- Choose fixed mixing weights:

  - `α_f = 0.6` (women: slightly more trust baseline)
  - `α_m = 0.5` (men: equal baseline/ML)

\[
L_{f,final} = lpha_f L_{f,base} + (1-lpha_f) L_{f,ML}
\]
\[
L_{m,final} = lpha_m L_{m,base} + (1-lpha_m) L_{m,ML}
\]

Convert to probabilities:

\[
p_{f,final} = σ(L_{f,final}), \quad p_{m,final} = σ(L_{m,final})
\]

6. Final match probability and ranking:

\[
p_{match}^{final} = p_{f,final} \cdot p_{m,final}
\]

Use existing ranking logic (Gumbel noise etc.) already in the baseline demo: fileciteturn0file0  

\[
Score(f,m) = \log(p_{match}^{final} + arepsilon) + 	au \cdot G
\]

Where:

- `ε = 1e-6`
- `τ = 0.2`
- `G` is a Gumbel(0,1) random variable.

---

## 4. Demo Implementation Plan (JS, No Real Training Yet)

The goal now is to **simulate** this ML architecture in the existing project, using the current 10 mock users and the baseline engine.

### 4.1 High-level strategy

- Keep **baseline code unchanged** (`js/baseline_matcher.js`).
- Add a new JS module, e.g. `js/ml_mock_matcher.js`, that:
  - Exposes functions that **mimic** the real ML outputs:
    - `computeClusterBaselineForFemale(f, m, featureGroups)`
    - `computeClusterBaselineForMale(f, m, featureGroups)`
    - `computeMockMLProbabilities(f, m, p_f_base, p_m_base)`
    - `mixWithBaseline(p_base, p_ML, alpha)`
    - `computeFinalMatchProbability(f, m, featureGroups, mode, alphaF, alphaM)`
- Extend `matching_demo.html` (or add a new tab inside it) to:
  - Show three modes:
    1. Baseline only
    2. Baseline + ML (global)
    3. Cluster-adjusted baseline + ML
  - Animate transitions and show explainability.

### 4.2 Synthetic cluster assignments (for mock population)

For the current 10 mock users in `js/demo_population.js`:

1. Manually assign **female clusters** `{0,1,2,3}` based on their vibe:
   - E.g. cluster 0 = “Koramangala startup extroverts”
   - cluster 1 = “South BLR introvert/trad”
   - cluster 2 = “Indiranagar artsy”
   - cluster 3 = “North BLR corporate”
2. Manually assign **male clusters** `{0,1}`:
   - cluster 0 = “High ambition / high education”
   - cluster 1 = “Chill / lower ambition”

Store these as properties in the mock user objects:

```js
// demo_population.js
{
  user_id: "F1",
  gender: "F",
  ...,
  ml_cluster_id: 2 // 0..3 for females
}

{
  user_id: "M3",
  gender: "M",
  ...,
  ml_cluster_id: 1 // 0..1 for males
}
```

`ml_mock_matcher.js` can then simply read `user.ml_cluster_id`.

### 4.3 Mock cluster-specific baseline weights

For the demo, instead of fitting logistic regressions, **define simple, hard-coded β coefficients** per cluster that emphasize different feature groups:

- For female clusters `c ∈ {0,1,2,3}`:

  ```js
  const beta_f = {
    0: { intercept: 0.0, DEMO:  0.6, HUM: 0.8, MBTI: 0.2, HOB: 0.4, VALPOL: 0.3, ATTREL: 0.4, INTENT: 0.3, SOFTLIFE: 0.2 },
    1: { intercept: 0.0, DEMO:  0.9, HUM: 0.4, MBTI: 0.3, HOB: 0.2, VALPOL: 0.4, ATTREL: 0.5, INTENT: 0.5, SOFTLIFE: 0.2 },
    2: { intercept: 0.0, DEMO:  0.5, HUM: 0.7, MBTI: 0.4, HOB: 0.6, VALPOL: 0.3, ATTREL: 0.3, INTENT: 0.2, SOFTLIFE: 0.4 },
    3: { intercept: 0.0, DEMO:  0.7, HUM: 0.5, MBTI: 0.5, HOB: 0.3, VALPOL: 0.4, ATTREL: 0.6, INTENT: 0.4, SOFTLIFE: 0.3 }
  };
  ```

- For male clusters `d ∈ {0,1}`:

  ```js
  const beta_m = {
    0: { intercept: 0.0, DEMO:  0.5, HUM: 0.6, MBTI: 0.3, HOB: 0.4, VALPOL: 0.2, ATTREL: 0.3, INTENT: 0.2, SOFTLIFE: 0.5 },
    1: { intercept: 0.0, DEMO:  0.3, HUM: 0.7, MBTI: 0.2, HOB: 0.5, VALPOL: 0.1, ATTREL: 0.2, INTENT: 0.1, SOFTLIFE: 0.6 }
  };
  ```

Then implement:

```js
function computeClusterBaselineForFemale(f, m, featureGroups) {
  const c = f.ml_cluster_id;
  const b = beta_f[c];
  const L =
    b.intercept +
    b.DEMO     * featureGroups.DEMO +
    b.HUM      * featureGroups.HUM +
    b.MBTI     * featureGroups.MBTI +
    b.HOB      * featureGroups.HOB +
    b.VALPOL   * featureGroups.VALPOL +
    b.ATTREL   * featureGroups.ATTREL +
    b.INTENT   * featureGroups.INTENT +
    b.SOFTLIFE * featureGroups.SOFTLIFE;
  const p = 1 / (1 + Math.exp(-L));
  return { L, p };
}
```

Similarly for male.

This **demonstrates** cluster-adjusted baselines without real training.

### 4.4 Mock ML probabilities

For `p_f_ML` and `p_m_ML` in the demo, we want:

- Numbers that differ from baseline in a plausible way.
- Enough variation to show the effect of α sliders and cluster changes.

Simple approach:

```js
function computeMockMLProbabilities(f, m, p_f_base, p_m_base) {
  // Use a deterministic pseudo-random seed based on user IDs
  const seed = hashToUnit(f.user_id + "|" + m.user_id); // in [0,1)

  // Let ML slightly correct baseline +/- up to 0.15
  const delta_f = (seed - 0.5) * 0.3; // in [-0.15, +0.15]
  const delta_m = (0.5 - seed) * 0.3;

  let p_f_ML = clamp01(p_f_base + delta_f);
  let p_m_ML = clamp01(p_m_base + delta_m);

  return { p_f_ML, p_m_ML };
}
```

Where `hashToUnit` is a simple hash→[0,1), and `clamp01` clips to [0,1].

For extra flavour, you can tweak deltas by cluster:

- For certain female clusters, bias ML to **favour humour more**.
- For others, bias toward **education/location**.

### 4.5 Logit-level mixing in JS

Implement the real formula:

```js
function mixWithBaseline(p_base, p_ML, alpha) {
  const eps = 1e-6;
  const pB = clamp01(p_base, eps, 1 - eps);
  const pM = clamp01(p_ML, eps, 1 - eps);

  const L_base = Math.log(pB / (1 - pB));
  const L_ML   = Math.log(pM / (1 - pM));

  const L_final = alpha * L_base + (1 - alpha) * L_ML;
  const p_final = 1 / (1 + Math.exp(-L_final));
  return { L_base, L_ML, L_final, p_final };
}
```

Where:

- For demo defaults:
  - `alpha_f = 0.6`
  - `alpha_m = 0.5`

Then:

```js
function computeFinalMatchProbability(f, m, featureGroups, mode, alphaF, alphaM) {
  // 1. Baseline global (existing baseline_matcher)
  const { p_f_base_global, p_m_base_global } = computeBaselineProbabilities(f, m, featureGroups);

  // 2. Optional: cluster-adjusted baseline
  let p_f_base = p_f_base_global;
  let p_m_base = p_m_base_global;

  if (mode === "cluster_adjusted") {
    const { p: p_f_cluster } = computeClusterBaselineForFemale(f, m, featureGroups);
    const { p: p_m_cluster } = computeClusterBaselineForMale(f, m, featureGroups);
    p_f_base = p_f_cluster;
    p_m_base = p_m_cluster;
  }

  // 3. Mock ML predictions
  const { p_f_ML, p_m_ML } = computeMockMLProbabilities(f, m, p_f_base, p_m_base);

  // 4. Mode-dependent mixing
  if (mode === "baseline_only") {
    const p_match = p_f_base * p_m_base;
    return {
      p_f_base, p_m_base,
      p_f_ML: null, p_m_ML: null,
      p_f_final: p_f_base,
      p_m_final: p_m_base,
      p_match_final: p_match
    };
  }

  // Baseline + ML (global or cluster-adjusted)
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
    debug: {
      L_f_base: mixF.L_base,
      L_f_ML:   mixF.L_ML,
      L_f_final:mixF.L_final,
      L_m_base: mixM.L_base,
      L_m_ML:   mixM.L_ML,
      L_m_final:mixM.L_final
    }
  };
}
```

### 4.6 UI / animation integration with `matching_demo.html`

Extend the existing matching demo to:

1. **Add mode toggle**

- Options:
  - `"baseline_only"`
  - `"baseline_plus_ML"`
  - `"cluster_adjusted_plus_ML"`

You can map:

- `baseline_plus_ML` → use `mode = "baseline_plus_ML"` (no cluster adjustment).
- `cluster_adjusted_plus_ML` → `mode = "cluster_adjusted"`.

For simplicity, you can implement both non-baseline modes by sharing the same code and toggling `mode` and cluster usage.

2. **Add α sliders**

- One slider each:
  - `α_f` ∈ [0,1], default 0.6.
  - `α_m` ∈ [0,1], default 0.5.
- On input change:
  - Recompute `computeFinalMatchProbability(...)` for the currently selected pair.
  - Animate bar heights and probability gauges.

3. **Per-feature contribution bars**

For each side:

- Break down **baseline contributions** using the coefficients currently used in `baseline_matcher.js` (or derived grouping):

  - Show bars for:
    - `DEMO`, `HUM`, `MBTI`, `HOB`, `VALPOL`, `ATTREL`, `INTENT`, `SOFTLIFE`.

- For cluster-adjusted mode:
  - Compute contributions using `beta_f[c]` and `beta_m[d]` and show **changed bar heights**.

Implementation hint:

- Represent each bar by `weight * feature_value`.
- Normalize across groups so bars fit in [0,1] visually.

Animate using CSS transitions:

```css
.bar {
  transition: height 0.4s ease-in-out;
}
```

4. **Probability timeline / gauge**

- Show a numeric + visual indicator of:
  - `p_match_baseline_only`
  - `p_match_after_ML`
  - Optionally intermediate:

    - `p_match_after_cluster_adjustment`

- When toggling modes or changing sliders:
  - Smoothly animate gauge or bar width to new value.

5. **Cluster labels**

- Hard-code **cluster descriptions** for demo (these are placeholders for future LLM-generated ones):

  ```js
  const femaleClusterDescriptions = {
    0: { name: "Koramangala Startup Extroverts", bullets: ["High ambition", "Clubbing / gigs", "Career-focused"] },
    1: { name: "South BLR Calm Traditional", bullets: ["Family-oriented", "Community ties", "Moderate ambition"] },
    2: { name: "Indiranagar Creative Intuitives", bullets: ["Art / music", "High humour sensitivity", "Intuitive-leaning"] },
    3: { name: "North BLR Corporate Analysts", bullets: ["Structured", "Heavy workweeks", "Stable lifestyle"] }
  };

  const maleClusterDescriptions = {
    0: { name: "Driven Builder Types", bullets: ["High education", "Demanding jobs", "Long-term leaning"] },
    1: { name: "Chill Explorer Types", bullets: ["Flexible careers", "Experience-seeking", "Lower material focus"] }
  };
  ```

- Display cluster name + bullets for each user near their card in the demo.

---

## 5. LLM Hooks (For Later, Not in Demo Logic)

The demo does **not** need to call LLMs. However, the real system will use LLMs for:

1. **Cold-start cluster assignment** (pick initial `cluster_f`, `cluster_m` from traits).
2. **Cluster description generation** (turn stats into human text).
3. **Match explanation** (turn numeric contributions into a friendly paragraph).

You may stub UI for explanations (e.g., a button “Generate Explanation” that shows a placeholder text now, to connect later).

---

## 6. Implementation Checklist for the Agent

1. **Do NOT modify**:
   - `index.html`
   - Core schema definition (`schema.html` logic).
   - Existing baseline API surface (`js/baseline_matcher.js`) except to add optional ML-related hooks if really needed.

2. **Add new JS module**:
   - `js/ml_mock_matcher.js` implementing:
     - `computeClusterBaselineForFemale`
     - `computeClusterBaselineForMale`
     - `computeMockMLProbabilities`
     - `mixWithBaseline`
     - `computeFinalMatchProbability`

3. **Extend demo population**:
   - Add `ml_cluster_id` to each mock user in `js/demo_population.js`.

4. **Extend `matching_demo.html`**:
   - Add mode toggle, α sliders, cluster labels.
   - Wire in `ml_mock_matcher.js` for additional modes.
   - Add animated bar charts for contributions and probability gauges.

5. **Keep behaviour backward compatible**:
   - When mode = `"baseline_only"`, behaviour should be identical to the current baseline demo (scores, ranking, visuals, etc. should match or be trivially equivalent).

6. **Document in README**:
   - Add a short section explaining:
     - The existence of ML demo modes.
     - That ML outputs are synthetic for now.
     - That the architecture matches `matching_ml_architecture_plan.md` and can be wired to real models later.

Once all of this is in place, Wavelength has:

- A **baseline matcher** (real, heuristic).
- A **mock ML layer demo** that:
  - Mirrors the intended two-tower + cluster architecture.
  - Is visually explainable.
  - Is ready to swap mock numbers for real model outputs when trained.
