
# baseline_matching_plan.md

## 0. Purpose and Scope

This document specifies a **baseline matching model** for a heterosexual dating app using the existing `user_profile_v1` schema.

The goals are:

1. Define **mathematical feature functions** on top of `user_profile_v1`.
2. Define **asymmetric like-probability functions** for female and male users.
3. Define **match probability** and a **ranking score**.
4. Define how to apply **hard filters**, **soft penalties**, and **diversity / randomness**.
5. Provide clear structure so the baseline can later be:
   - Tuned from data, or
   - Replaced/augmented by a two-tower / GNN model.

The document is implementation-oriented and uses explicit functions, weights, and tunables.

---

## 1. Notation and Setup

### 1.1 User types

For this baseline we assume only **heterosexual** matches:

- Let **f** denote a female user.
- Let **m** denote a male user.

A **candidate pair** is an ordered pair (f, m).

Extension to non-heterosexual matching can be handled later by defining separate scoring functions.

### 1.2 Profiles

Each user has a `user_profile_v1` as described in `user_data_schema_plan.md`.

We denote:

- `facts(f)`, `inferences(f)`, etc., as the corresponding sections of the profile.
- All continuous traits in `inferences` (e.g. MBTI axes, attachment, humour) are taken to be in **[0, 1]**.

### 1.3 Logistic and clipping functions

Define:

- Logistic function:  
  \[
    \sigma(x) = \frac{1}{1 + e^{-x}}
  \]

- Clipping to [0, 1]:  
  \[
    \mathrm{clip01}(x) = \min(1, \max(0, x))
  \]

All feature scores are in [0, 1] unless explicitly stated.

---

## 2. Hard Filters

Before computing any scores, apply **hard filters**. If any fails, the pair (f,m) is **rejected** with:

\[
  p_{\text{match}}(f,m) = 0
\]

### 2.1 Explicit dealbreakers

For each user u ∈ {f, m}, let `dealbreakers(u)` encode explicit rules, for example:

- diet: must_be_veg, must_not_smoke, etc.
- relationship_intent: must_be_serious (if the user chooses to define this as hard).
- religion if explicitly requested, etc.

Define a function:

- `passes_dealbreakers(u, other)` → {0,1}

Implementation:

- If any dealbreaker rule in `u.dealbreakers` is violated by `other.facts` or `other.inferences`, return 0.
- Else return 1.

Hard filter condition:

\[
  \text{if } passes\_dealbreakers(f,m) = 0 \text{ or } passes\_dealbreakers(m,f) = 0, \text{ then reject pair.}
\]

### 2.2 SN strict mode (Intuitive vs Sensing, optional hard-ish rule)

From `mbti_axes` and `mbti_matching_prefs`:

- Let `SN_f`, `SN_m` ∈ [0,1].
- Let `sn_strict_mode_f` be a boolean flag from `mbti_matching_prefs(f)`, default false.

Define:

- High-N threshold: `T_high = 0.7`
- High-S threshold: `T_low  = 0.3`

If:

- `sn_strict_mode_f = true`, and  
- `SN_f ≥ T_high`, and  
- `SN_m ≤ T_low`

then define:

\[
  \text{sn\_strict\_block}(f,m) = 1
\]

Otherwise:

\[
  \text{sn\_strict\_block}(f,m) = 0
\]

Hard filter effect:

\[
  \text{if } \text{sn\_strict\_block}(f,m) = 1, \text{ then reject pair.}
\]

This is intentionally asymmetric: the strict preference is applied for the female user f in this baseline; it can be extended symmetrically if needed.

---

## 3. Feature Functions

For each candidate pair (f,m), we compute several feature scores in [0,1]. These are used differently in the female and male scoring functions.

### 3.1 Education and Job Features

We assume:

- `education_tier(u)` ∈ {0, 1, 2, 3}, ordered from lowest to highest tier.
- `job_difficulty(u)` ∈ {0, 1, 2, 3}, ordered from lowest to highest perceived difficulty / cognitive demand.
- `income_band(u)` ∈ {0, 1, 2, 3}, ordered from lowest to highest.

If these are unknown, we can treat them as 1 or impute from other data.

Let:

- Δedu = education_tier(m) − education_tier(f)
- Δjob = job_difficulty(m) − job_difficulty(f)
- Δinc = income_band(m) − income_band(f)

Define female-side educational features:

\[
  E_f(f,m) = \sigma(\alpha_{f,edu} \cdot \Delta edu)
\]

\[
  J_f(f,m) = \sigma(\alpha_{f,job} \cdot \Delta job)
\]

\[
  I_f(f,m) = \sigma(\alpha_{f,inc} \cdot \Delta inc)
\]

with suggested constants:

- α_{f,edu} = 2.0  
- α_{f,job} = 1.5  
- α_{f,inc} = 1.5  

These functions output values close to 1 when male ≥ female, and < 0.5 when male < female, with stronger penalty as the gap increases.

Male-side education/job features are more relaxed:

\[
  E_m(f,m) = 0.5 + \beta_{m,edu} (\sigma(\alpha_{m,edu} (education\_tier(f) - education\_tier(m))) - 0.5)
\]

\[
  J_m(f,m) = 0.5 + \beta_{m,job} (\sigma(\alpha_{m,job} (job\_difficulty(f) - job\_difficulty(m))) - 0.5)
\]

\[
  I_m(f,m) = 0.5 + \beta_{m,inc} (\sigma(\alpha_{m,inc} (income\_band(f) - income\_band(m))) - 0.5)
\]

with suggested constants:

- α_{m,edu} = α_{m,job} = α_{m,inc} = 1.0  
- β_{m,edu} = β_{m,job} = β_{m,inc} = 0.2  

So male-side features stay close to 0.5 (weak effect) even if there is an education/job/income gap.

Define aggregate education/job features:

\[
  EDU\_f(f,m) = \frac{E_f + J_f + I_f}{3}
\]

\[
  EDU\_m(f,m) = \frac{E_m + J_m + I_m}{3}
\]

### 3.2 Proximity / Location

Assume `current_area_in_bangalore` is mapped to:

- A 2D coordinate (x,y) by cluster centroids, or
- A distance metric `dist_km(f,m)` in kilometres.

Define a distance-based score:

\[
  D_{loc}(f,m) = \mathrm{clip01}\left(1 - \frac{dist\_km(f,m)}{d_{max}}\right)
\]

where `d_max` is a tunable maximum radius (e.g. 20 km). Distances ≥ d_max produce 0.

Optionally, if both live in the same area cluster:

\[
  D_{sameArea}(f,m) = 1
\]

else:

\[
  D_{sameArea}(f,m) = 0
\]

Define:

\[
  LOC(f,m) = \lambda_{loc1} D_{loc} + \lambda_{loc2} D_{sameArea}
\]

with default:

- λ_{loc1} = 0.7  
- λ_{loc2} = 0.3  

This yields LOC ∈ [0,1].

### 3.3 Humour Profile Features

From `humour_profile` of each user:

- `styles_u[k]` for humour style k (e.g. wordplay_puns, dark_morbid, etc.)  
- `cringe_tolerance(u)` ∈ [0,1]  
- `offence_tolerance(u)` ∈ [0,1]  
- `performs_vs_appreciates(u)` ∈ [0,1]

#### 3.3.1 Humour style similarity

Let K be the set of humour style keys. For each k ∈ K, define:

- s_f(k) = styles_f[k].value
- s_m(k) = styles_m[k].value

Define:

\[
  H_{styles}(f,m) = 1 - \frac{1}{K} \sum_{k \in K} (s_f(k) - s_m(k))^2
\]

This yields a value in (−∞,1], but since s_f,s_m ∈ [0,1], the minimum is −1 (when difference is 1 for all K). To clip to [0,1]:

\[
  H_{styles}(f,m) = \mathrm{clip01}\left(1 - \frac{1}{K} \sum_{k \in K} (s_f(k) - s_m(k))^2\right)
\]

#### 3.3.2 Cringe and offence alignment

Let:

- c_f = cringe_tolerance(f), c_m = cringe_tolerance(m)
- o_f = offence_tolerance(f), o_m = offence_tolerance(m)

Define:

\[
  H_{cringe}(f,m) = 1 - |c_f - c_m|
\]

\[
  H_{offence}(f,m) = 1 - |o_f - o_m|
\]

These are in [0,1].

Define a **strong penalty** for dark/offence mismatch:

Let:

- d_f = styles_f[dark_morbid].value
- d_m = styles_m[dark_morbid].value

Define:

\[
  P_{darkOffense}(f,m) = 1 - \gamma_{dark} \cdot \max(0, d_f - o_m) - \gamma_{dark} \cdot \max(0, d_m - o_f)
\]

with γ_{dark} ∈ [0,1], for example γ_{dark} = 0.7. Then clip:

\[
  P_{darkOffense}(f,m) = \mathrm{clip01}(P_{darkOffense}(f,m))
\]

This penalises when one user likes dark humour but the other has low offence_tolerance.

#### 3.3.3 Performer vs appreciator

Let:

- p_f = performs_vs_appreciates(f)
- p_m = performs_vs_appreciates(m)

Define:

\[
  H_{perform}(f,m) = 1 - |p_f - p_m|
\]

#### 3.3.4 Combined humour score

\[
  HUM(f,m) = \mathrm{clip01}\left(
    w_{h,styles} H_{styles} +
    w_{h,cringe} H_{cringe} +
    w_{h,offence} H_{offence} +
    w_{h,perform} H_{perform}
  \right) \cdot P_{darkOffense}
\]

with default weights:

- w_{h,styles}  = 0.4  
- w_{h,cringe}  = 0.2  
- w_{h,offence} = 0.2  
- w_{h,perform} = 0.2  

HUM ∈ [0,1].

### 3.4 MBTI Compatibility Features

From `mbti_axes`:

- IE_u, SN_u, FT_u, JP_u ∈ [0,1] for u ∈ {f,m}.

#### 3.4.1 SN compatibility (Sensing vs Intuitive)

Define:

- d_SN = |SN_f − SN_m|

If strict block already rejected the pair, skip further SN logic. Else define:

\[
  SN\_comp(f,m) = 1 - d_{SN}
\]

SN_comp ∈ [0,1], with 1 for identical SN and 0 for maximal difference.

#### 3.4.2 IE compatibility (Introversion vs Extraversion)

Define ambivert band:

- ambi_low = 0.35  
- ambi_high = 0.65

Define:

\[
  A_f = 1 \text{ if } IE_f \in [ambi\_low, ambi\_high], \text{ else } 0
\]
\[
  A_m = 1 \text{ if } IE_m \in [ambi\_low, ambi\_high], \text{ else } 0
\]

Let d_IE = |IE_f − IE_m|.

Then:

- If A_f = 1 and A_m = 1:  
  \[
    IE\_comp(f,m) = 1
  \]
- Else if exactly one of (A_f, A_m) = 1:  
  \[
    IE\_comp(f,m) = 1 - 0.5 d_{IE}
  \]
- Else (both non-ambivert):  
  \[
    IE\_comp(f,m) = 1 - d_{IE}
  \]

#### 3.4.3 JP compatibility (Judging vs Perceiving)

Let d_JP = |JP_f − JP_m|. Define:

\[
  JP\_comp(f,m) = 1 - d_{JP}^2
\]

This is a broad tolerance curve; d_JP ∈ [0,1] gives JP_comp ∈ [0,1].

#### 3.4.4 FT feature (Thinking vs Feeling)

Treat FT as neutral in baseline:

\[
  FT\_comp(f,m) = 0.5
\]

unless there is a user-specific rule in `preference_rules`.

#### 3.4.5 Combined MBTI score

\[
  MBTI(f,m) = \mathrm{clip01}\left(
    w_{mbti,SN} SN\_comp +
    w_{mbti,IE} IE\_comp +
    w_{mbti,JP} JP\_comp +
    w_{mbti,FT} FT\_comp
  \right)
\]

with suggested weights:

- w_{mbti,SN} = 0.5  
- w_{mbti,IE} = 0.3  
- w_{mbti,JP} = 0.15  
- w_{mbti,FT} = 0.05  

MBTI ∈ [0,1].

### 3.5 Hobbies and Lifestyle

From `hobbies` list, each with:

- name, involvement ∈ [0,1], skill ∈ [0,1]

Let H_f and H_m be the sets of hobby names for f and m.

#### 3.5.1 Hobby overlap

Define involvement-weighted vectors over a unified hobby vocabulary V:

For each u ∈ {f,m} and v ∈ V:

- h_u(v) = involvement_u(v) if user has hobby v, else 0.

Define:

\[
  H_{overlap}(f,m) = 1 - \frac{1}{|V|} \sum_{v \in V} (h_f(v) - h_m(v))^2
\]

Then clip:

\[
  H_{overlap}(f,m) = \mathrm{clip01}(H_{overlap}(f,m))
\]

#### 3.5.2 Hobby count alignment

Let:

- n_f = number of hobbies for f with involvement ≥ 0.5
- n_m = number of hobbies for m with involvement ≥ 0.5

Define:

- n_max = max(n_f, n_m, 1)

Define:

\[
  H_{count}(f,m) = 1 - \frac{|n_f - n_m|}{n_{max}}
\]

This yields 1 when counts are equal, and close to 0 when one has many and the other has very few.

#### 3.5.3 Combined hobbies score

\[
  HOB(f,m) = \mathrm{clip01}\left(
    w_{hob,overlap} H_{overlap} +
    w_{hob,count} H_{count}
  \right)
\]

with:

- w_{hob,overlap} = 0.6  
- w_{hob,count} = 0.4  

### 3.6 Values and Politics

From `values`:

- family_oriented, career_focused, risk_taking, traditional_modern_score ∈ [0,1]

Let v_f(i), v_m(i) be corresponding values for trait i. Define mean squared difference:

\[
  V_{diff}(f,m) = \frac{1}{N_v} \sum_{i} (v_f(i) - v_m(i))^2
\]

Then:

\[
  VAL(f,m) = 1 - V_{diff}(f,m)
\]

Clip to [0,1].

From `political_lean.scalar_0_1`, define:

\[
  POL(f,m) = 1 - |pol_f - pol_m|
\]

This is also low-weight.

### 3.7 Attachment and Relationship Style

From `attachment`:

- anxious_f, avoidant_f, anxious_m, avoidant_m ∈ [0,1]

Define average insecurity:

\[
  A_{insec}(f,m) = \frac{anxious_f + avoidant_f + anxious_m + avoidant_m}{4}
\]

Define:

\[
  ATT(f,m) = 1 - \lambda_{att} \cdot A_{insec}(f,m)
\]

with λ_{att} ∈ [0,1], e.g. λ_{att} = 0.3.

From `relationship_style`:

- communication_need(u), independence_need(u), long_term_orientation(u) ∈ [0,1]

Define:

\[
  R_{comm}(f,m) = 1 - |comm_f - comm_m|
\]
\[
  R_{indep}(f,m) = 1 - |indep_f - indep_m|
\]
\[
  R_{long}(f,m) = 1 - |long_f - long_m|
\]

Then:

\[
  RELSTYLE(f,m) = \mathrm{clip01}\left(
    \frac{R_{comm} + R_{indep} + R_{long}}{3}
  \right)
\]

### 3.8 Relationship Intent

Let:

- intent(u) ∈ {casual, serious, open_to_both}

Define:

- If intent(f) = intent(m):  
  \[
    INTENT(f,m) = 1
  \]
- Else if one is `open_to_both` and other is `casual` or `serious`:  
  \[
    INTENT(f,m) = 0.9
  \]
- Else (casual vs serious only mismatch):  
  \[
    INTENT(f,m) = 0.7
  \]

### 3.9 Smoking, Drinking, and Similar Soft Preferences

For each such trait t (e.g. smoking, drinking, nightlife), define:

- If there is an explicit hard dealbreaker for that trait, the pair has already been rejected in Section 2.1.
- Otherwise, define:

Let s_f, s_m ∈ {0,1} encode the trait.

\[
  T_{soft}(f,m) =
    \begin{cases}
      1 & \text{if } s_f = s_m \\
      1 - \delta_t & \text{if } s_f \neq s_m
    \end{cases}
\]

with δ_t ∈ [0,0.3], e.g. δ_t = 0.15.

For multiple soft traits, define:

\[
  SOFTLIFE(f,m) = \frac{1}{N_t} \sum_{t} T_{soft,t}(f,m)
\]

---

## 4. Female and Male Scoring Functions

We define **two separate scoring functions**:

- Female-side latent score: S_f(f,m)
- Male-side latent score: S_m(f,m)

These are then converted to like probabilities via logistic functions.

### 4.1 Aggregate feature groups

Define the following composite features, all in [0,1]:

- Demographic/logistics score:

\[
  DEMO(f,m) = \mathrm{clip01}\left(
    w_{d,loc} LOC +
    w_{d,edu,f} EDU_f +
    w_{d,edu,m} EDU_m
  \right)
\]

On the female side we emphasise EDU_f; on the male side, EDU_m will have lower weight.

- Humour score: HUM(f,m)
- MBTI score: MBTI(f,m)
- Hobbies score: HOB(f,m)
- Values/politics score:

\[
  VALPOL(f,m) = \mathrm{clip01}\left(
    w_{vp,val} VAL +
    w_{vp,pol} POL
  \right)
\]

- Attachment/relationship style score:

\[
  ATTREL(f,m) = \mathrm{clip01}\left(
    w_{ar,att} ATT +
    w_{ar,rel} RELSTYLE
  \right)
\]

- Intent score: INTENT(f,m)
- Soft lifestyle score: SOFTLIFE(f,m)

Suggested group weights:

- w_{d,loc}   = 0.4, w_{d,edu,f} = 0.5, w_{d,edu,m} = 0.1  
- w_{vp,val}  = 0.8, w_{vp,pol}  = 0.2  
- w_{ar,att}  = 0.4, w_{ar,rel}  = 0.6  

### 4.2 Female latent score S_f

\[
  S_f(f,m) = 
    a_f^0
    + a_{f,dem} \cdot DEMO
    + a_{f,hum} \cdot HUM
    + a_{f,mbti} \cdot MBTI
    + a_{f,hob} \cdot HOB
    + a_{f,val} \cdot VALPOL
    + a_{f,att} \cdot ATTREL
    + a_{f,intent} \cdot INTENT
    + a_{f,softlife} \cdot SOFTLIFE
\]

Suggested default coefficients:

- a_f^0           = 0.0  
- a_{f,dem}       = 2.0  
- a_{f,hum}       = 2.5  
- a_{f,mbti}      = 1.0  
- a_{f,hob}       = 0.8  
- a_{f,val}       = 0.5  
- a_{f,att}       = 0.5  
- a_{f,intent}    = 0.5  
- a_{f,softlife}  = 0.3  

### 4.3 Male latent score S_m

\[
  S_m(f,m) = 
    a_m^0
    + a_{m,dem} \cdot DEMO'
    + a_{m,hum} \cdot HUM
    + a_{m,mbti} \cdot MBTI
    + a_{m,hob} \cdot HOB
    + a_{m,val} \cdot VALPOL
    + a_{m,att} \cdot ATTREL
    + a_{m,intent} \cdot INTENT
    + a_{m,softlife} \cdot SOFTLIFE
\]

Where DEMO' is defined with different internal weights:

\[
  DEMO'(f,m) = \mathrm{clip01}\left(
    w'_{d,loc} LOC +
    w'_{d,edu,f} EDU_f +
    w'_{d,edu,m} EDU_m
  \right)
\]

For male-side, suggested weights:

- w'_{d,loc}   = 0.6  
- w'_{d,edu,f} = 0.1  
- w'_{d,edu,m} = 0.3  

Suggested coefficients:

- a_m^0           = 0.0  
- a_{m,dem}       = 1.5  
- a_{m,hum}       = 1.5  
- a_{m,mbti}      = 0.8  
- a_{m,hob}       = 0.8  
- a_{m,val}       = 0.4  
- a_{m,att}       = 0.4  
- a_{m,intent}    = 0.3  
- a_{m,softlife}  = 0.3  

### 4.4 Like probabilities

Convert S_f and S_m into probabilities via logistic functions:

\[
  p_f(f,m) = \sigma(k_f (S_f(f,m) - b_f))
\]

\[
  p_m(f,m) = \sigma(k_m (S_m(f,m) - b_m))
\]

with default parameters:

- k_f = 1.0, b_f = 3.0  
- k_m = 0.8, b_m = 2.0  

### 4.5 Match probability

\[
  p_{match}(f,m) = p_f(f,m) \cdot p_m(f,m)
\]

If the pair failed hard filters, p_match = 0.

---

## 5. Ranking and Diversity

### 5.1 Base ranking score

\[
  s_{base}(f,m) = \log(p_{match}(f,m) + \epsilon)
\]

with ε a small constant (e.g. 10^{-6}).

### 5.2 Exploration noise (Gumbel)

Let U ~ Uniform(0,1]. Define:

\[
  G = -\log(-\log(U))
\]

Define the final ranking score:

\[
  s_{rank}(f,m) = s_{base}(f,m) + \tau \cdot G
\]

with τ ∈ [0,1], e.g. τ = 0.2.

### 5.3 Archetype diversity constraint

To limit oversampling of a single archetype:

- For each user, `archetypes.dating_archetype` provides one or more labels.
- For candidate list for a given user, after computing s_rank for all candidates, sort descending.
- To select top K:
  - Maintain a count C(label) for each archetype label.
  - Define max_per_archetype (e.g. 5).
  - Iterate through sorted list; include candidate if C(label) < max_per_archetype; increment C(label).  
  - Continue until K candidates are selected or list exhausted.

---

## 6. Explanation Traces

For explainability, record per-feature contributions.

For female-side:

- contrib_DEMO_f   = a_{f,dem}      × DEMO
- contrib_HUM_f    = a_{f,hum}      × HUM
- contrib_MBTI_f   = a_{f,mbti}     × MBTI
- contrib_HOB_f    = a_{f,hob}      × HOB
- contrib_VALPOL_f = a_{f,val}      × VALPOL
- contrib_ATTREL_f = a_{f,att}      × ATTREL
- contrib_INTENT_f = a_{f,intent}   × INTENT
- contrib_SOFT_f   = a_{f,softlife} × SOFTLIFE

Similarly for male-side.

Store these contributions alongside p_f, p_m, p_match and s_rank so that an LLM can later generate natural language explanations.

---

## 7. Implementation Guidance for the Agent

The agent should:

1. **Add a Baseline Matching section to the existing presentation**
   - New page or tab: “Baseline Matching”.
   - Show:
     - Definitions of p_f, p_m, p_match.
     - Definitions of key feature groups (DEMO, HUM, MBTI, HOB, VALPOL, ATTREL, INTENT, SOFTLIFE).
     - An outline of the ranking process and diversity step.

2. **Implement computation functions (on mock data)**
   - `computeFeatures(fProfile, mProfile)` → feature object.
   - `computeFemaleScore(features)` → S_f.
   - `computeMaleScore(features)` → S_m.
   - `computeProbabilities(S_f, S_m)` → p_f, p_m, p_match.
   - `computeRankScore(p_match)` → s_rank (with noise and diversity control).

3. **Keep weights configurable**
   - Implement all weights and thresholds as a configuration object or module.
   - Use the numeric defaults from this document as initial values.

4. **Test with example profiles**
   - Use 2–3 example `user_profile_v1` pairs.
   - Display:
     - All feature scores.
     - S_f, S_m, p_f, p_m, p_match.
     - s_rank and top-K selection.

5. **Maintain independence from `index.html`**
   - This matching demo can be entirely separate from the main visual landing page, sharing only styles if needed.

This completes the baseline matching plan.
