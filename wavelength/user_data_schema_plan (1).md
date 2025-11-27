
# user_data_schema_plan.md (Updated Schema v1.1)

> **Note for the implementation agent:**  
> You have already implemented an earlier version of `user_data_schema_plan.md`.  
> **Do not throw that work away.**  
> This update is **additive**:
> - All existing sections (facts, inferences, hypotheses, summaries, archetypes, relationship_style, attraction_profile, preference_rules, events, etc.) **stay as they are**.
> - Your job now is to **extend** the schema presentation to include the **new fields and concepts** described here (humour profile, appearance placeholders, MBTI matching preferences), and lightly adjust explanations where relevant.

The structure, routes, and UI skeleton you already built should remain intact. You are just enriching:

- The `inferences` section with new subsections.
- The example `UserProfileV1` objects with the new fields.
- The documentation text to mention these new concepts.

---

## 0. Context & Goals

This document describes an updated **v1.1 user data schema** and how to present it interactively, for a dating app that uses **agentic LLMs** to do matchmaking.

- The existing project has an `index.html` that is **purely visual** (product/UX mock).
- You have already built a **separate interactive schema presentation** based on the earlier `user_data_schema_plan.md`.
- Now we are incrementally updating the schema and explanations to:
  - Add a **humour profile** (important for compatibility).
  - Add **placeholders** for appearance/attractiveness-related fields.
  - Add a knob for **MBTI matching strictness on the S–N axis**.
- Matching algorithms (baseline compatibility, two-tower, graph ML, etc.) are still to be added **later**; this update focuses on the **data layer**.

You may assume:

- You can keep using your existing stack (HTML/CSS/JS, TS/React, etc.).
- No real LLM API calls are needed yet (demo/stub only if you really want).

---

## 1. High-level Design: Layers in the User Model

This remains unchanged conceptually. Each user profile has:

1. **Facts** – directly user-provided, objective fields.
2. **Inferences** – LLM-derived traits with reasonable confidence (now including **humour profile** and optional **appearance** placeholders).
3. **Hypotheses** – speculative or low-confidence inferences.

Plus:

- **Summaries** – short LLM-written descriptions.
- **Archetypes** – label-based clusters.
- **Relationship Style** – communication, independence, etc.
- **Attraction Profile** – what they like/dislike.
- **Preference Rules** – mini per-user rules.
- **Events** – append-only log.

New in this update:

- A structured **`humour_profile`** under `inferences`, treated as a **high-importance** dimension for future matching.
- An optional **`appearance`** object under `inferences` for attractiveness-related signals (initially unused by matching).
- A simple **`mbti_matching_prefs`** object to configure stricter S–N matching for certain users.

---

## 2. Top-level Schema: `user_profile_v1`

The overall structure is unchanged:

```jsonc
{
  "user_id": "string",
  "version": "v1",
  "facts": { ... },
  "inferences": { ... },
  "hypotheses": { ... },
  "summaries": { ... },
  "archetypes": { ... },
  "relationship_style": { ... },
  "attraction_profile": { ... },
  "preference_rules": [ ... ],
  "events": [ ... ],
  "metadata": {
    "created_at": "ISO8601",
    "last_materialized_at": "ISO8601"
  }
}
```

For now, keep `"version": "v1"` in the data itself; this document is conceptually v1.1, but we do not need to enforce a new version string in code unless you want to.

All previously-described sections (`facts`, `hypotheses`, `summaries`, etc.) stay as-is. Only `inferences` gains additional fields.

---

## 2.1 `facts` (unchanged)

No schema changes here. You’ve already implemented:

- `name`, `age`, `gender`, `sexual_orientation`
- `home_origin`, `raised_till_18_location_cluster`
- `education_level`, `degree`, `college`, `education_tier`
- `profession`, `industry`, `income_band` (optional)
- `diet`, `languages_primary`, `languages_secondary`
- `current_area_in_bangalore`, `living_setup`
- `family_background`, `dating_history`
- `relationship_intent`, `dealbreakers`
- `user_written_bio`

You should keep presenting `facts` as before.

---

## 2.2 `inferences` (UPDATED)

This section still includes:

- `mbti_axes`
- `attachment`
- `hobbies`
- `values`, `political_lean`
- `embeddings`

Now we add:

1. `humour_profile` – detailed humour preferences.
2. `appearance` – placeholders for attractiveness-related info.
3. `mbti_matching_prefs` – preference toggles for MBTI-based matching (currently just S–N strictness).

### 2.2.1 MBTI Axes (unchanged representation)

As before, we represent MBTI as four continuous axes in [0,1]:

- `IE`: introversion–extraversion  
- `SN`: sensing–intuitive  
- `FT`: feeling–thinking  
- `JP`: judging–perceiving  

Example (unchanged):

```jsonc
"mbti_axes": {
  "IE": { "value": 0.72, "confidence": 0.8, "last_updated_at": "2025-11-26T10:30:00Z" },
  "SN": { "value": 0.80, "confidence": 0.8, "last_updated_at": "2025-11-26T10:30:00Z" },
  "FT": { "value": 0.30, "confidence": 0.75, "last_updated_at": "2025-11-26T10:30:00Z" },
  "JP": { "value": 0.55, "confidence": 0.6, "last_updated_at": "2025-11-26T10:30:00Z" }
}
```

### 2.2.1b NEW: `mbti_matching_prefs`

We add a small object that lets the system know how strict to be about S–N matching for this user.

```jsonc
"mbti_matching_prefs": {
  "sn_strict_mode": {
    "value": true,
    "last_updated_at": "2025-11-27T11:00:00Z",
    "notes": "User is strongly intuitive and explicitly prefers partners who are also intuitive."
  }
}
```

- `sn_strict_mode.value = true` means:
  - In the future matching layer, if this user is high N (e.g. `SN > 0.7`), we can heavily penalise or effectively exclude clear S types (`SN < 0.3`) from their candidate pool.
- For now this is just **documented and displayed**; the matching logic will be added later.

You can display this as a tiny sub-section in the MBTI tab.

---

### 2.2.2 Attachment (unchanged)

The `attachment` structure is unchanged:

```jsonc
"attachment": {
  "anxious": {
    "value": 0.6,
    "confidence": 0.7,
    "last_updated_at": "2025-11-26T10:35:00Z",
    "evidence_snippets": [
      "I always worry they'll lose interest if they don't text back quickly."
    ]
  },
  "avoidant": {
    "value": 0.2,
    "confidence": 0.6,
    "last_updated_at": "2025-11-26T10:35:00Z",
    "evidence_snippets": [
      "I like having my own routine but I enjoy closeness too."
    ]
  }
}
```

---

### 2.2.3 Hobbies (unchanged)

The `hobbies` object remains as you already implemented:

```jsonc
"hobbies": [
  { "name": "badminton", "involvement": 0.8, "skill": 0.7 },
  { "name": "stand_up_comedy", "involvement": 0.4, "skill": 0.5 },
  { "name": "cooking", "involvement": 0.6, "skill": 0.6 }
]
```

---

### 2.2.4 Values / Politics / Vibe (unchanged)

No schema changes; keep your existing representation, e.g.:

```jsonc
"values": {
  "family_oriented": { "value": 0.8, "confidence": 0.7 },
  "career_focused": { "value": 0.7, "confidence": 0.8 },
  "risk_taking": { "value": 0.3, "confidence": 0.5 },
  "traditional_modern_score": { "value": 0.6, "confidence": 0.6 }
},
"political_lean": {
  "scalar_0_1": { "value": 0.42, "confidence": 0.4 }
},
"embeddings": {
  "profile_bio_v1": "vec_profile_123",
  "hobbies_v1": "vec_hobbies_987",
  "relationship_narrative_v1": "vec_rel_456"
}
```

---

### 2.2.5 NEW: `humour_profile`

We are adding a dedicated `humour_profile` object to capture the user’s sense of humour. This will be a **high-importance dimension** in the later matching logic (second only to demographics like location/diet/education).

Suggested structure:

```jsonc
"humour_profile": {
  "styles": {
    "wordplay_puns":       { "value": 0.9, "confidence": 0.7 },
    "double_entendre":     { "value": 0.8, "confidence": 0.6 },
    "dry_deadpan":         { "value": 0.4, "confidence": 0.7 },
    "slapstick_goofy":     { "value": 0.2, "confidence": 0.6 },
    "dark_morbid":         { "value": 0.1, "confidence": 0.5 },
    "meta_internet_memes": { "value": 0.7, "confidence": 0.8 },
    "sarcasm":             { "value": 0.6, "confidence": 0.7 }
  },
  "cringe_tolerance":      { "value": 0.8, "confidence": 0.7 }, // laughs at lame jokes?
  "offence_tolerance":     { "value": 0.3, "confidence": 0.5 }, // comfort with edgy jokes
  "performs_vs_appreciates": {
    "value": 0.4,
    "confidence": 0.7
  }, // 0 = mostly appreciates, 1 = often performs/creates jokes
  "summary_text": "Loves wordplay and slightly lame puns, into meme humor, low tolerance for dark jokes.",
  "evidence_snippets": [
    "I will laugh at the worst puns if they're delivered with confidence.",
    "Dark jokes make me uncomfortable; I prefer silly stuff."
  ]
}
```

Implementation notes:

- **Inference source**: The agentic LLM can infer this from:
  - Direct questions about favourite jokes and comedians.
  - Asking the user to rate example jokes/memes.
  - Asking them to write a joke they find funny.
- **Presentation**:
  - Add a **new sub-tab or section** under `inferences` called “Humour Profile”.
  - Show:
    - A short textual explanation of why humour matters.
    - The `styles` table with sliders or numeric values.
    - The `summary_text` and some `evidence_snippets`.
- **Future use**:
  - Later, our compatibility function will compute similarity between two users’ humour styles and tolerances.
  - For now, we just need to document and display the structure.

---

### 2.2.6 NEW: `appearance` (placeholder for attractiveness-related signals)

We add a lightweight `appearance` object to hold attractiveness-related signals, mostly to be **filled later** as we learn from swipe data.

Example:

```jsonc
"appearance": {
  "attractiveness_band": {
    "value": 3,
    "confidence": 0.2,
    "scale": "1_to_5",
    "notes": "Placeholder – to be inferred from aggregate swipe behaviour in future; currently unused."
  },
  "appearance_salience": {
    "value": 0.7,
    "confidence": 0.8,
    "notes": "How much they themselves emphasise looks, aesthetics, fashion, etc. in their stories and preferences."
  }
}
```

Important:

- For now, we **do not** use `attractiveness_band` in any matching logic.
- `appearance_salience` can be inferred by the LLM from how much they talk about looks, fashion, and aesthetics.
- This is purely a schema placeholder so that when we have enough data, we can start making use of it.

Presentation:

- Under `inferences`, add a small “Appearance (placeholder)” section.
- Explain clearly in the copy that:
  - This is **not** a user-facing rating.
  - It will eventually be estimated indirectly (e.g. from swipe data), not from user self-declaration.

---

## 2.3 `hypotheses` (unchanged)

You already have a structure where:

```jsonc
"hypotheses": {
  "conflict_avoidant": {
    "value": 0.5,
    "confidence": 0.3,
    "evidence_snippets": [ ... ]
  }
}
```

No schema-level changes are required here. Just keep the existing UI.

---

## 2.4–2.9 Other Sections (unchanged)

All of the following sections are unchanged in schema; just make sure your existing implementation remains:

- `summaries`
- `archetypes`
- `relationship_style`
- `attraction_profile`
- `preference_rules`
- `events`
- `metadata`

You do **not** need to refactor these, only ensure the documentation still feels coherent with the new fields.

---

## 3. Presentation Updates (for the Implementation Agent)

Your existing schema presentation already has:

- Overview
- Schema browser
- Example user profiles
- LLM interaction notes
- Future matching placeholder

Now:

### 3.1 Extend the Schema Browser

Under your existing `inferences` tab, make sure to surface:

1. **MBTI**  
   - Add a small note / panel for `mbti_matching_prefs.sn_strict_mode`.
   - Explain that this allows stricter exclusion of S–N mismatches for certain users.

2. **Humour Profile (NEW)**  
   - New sub-tab / section: “Humour Profile”.
   - Show the `humour_profile` JSON structure.
   - Provide a human-readable explanation:
     - Why humour is important for compatibility.
     - How styles, cringe_tolerance, offence_tolerance, and performs_vs_appreciates work.

3. **Appearance (placeholder) (NEW)**  
   - New sub-section: “Appearance (Placeholder)”.
   - Show the `appearance` JSON structure.
   - Explain that:
     - `attractiveness_band` is a future, indirect measure.
     - `appearance_salience` reflects how much they emphasise looks.

### 3.2 Update Example User Profiles

- For at least one example user, populate:
  - `humour_profile` with realistic values.
  - `appearance` with a conservative placeholder (e.g. confidence low on `attractiveness_band`).
  - `mbti_matching_prefs.sn_strict_mode` for a highly intuitive user.
- Ensure the UI can display these without breaking older parts of the profile.

### 3.3 Overview & LLM Interaction Notes

- In your **Overview** section, mention explicitly:
  - Humour is now modeled via `humour_profile`.
  - There is an `appearance` placeholder reserved for future signals.
  - `mbti_matching_prefs` is a per-user knob that the LLM can set based on their stated preferences.

- In your **LLM interaction notes**:
  - Mention how the agentic LLM is expected to:
    - Ask humour-related questions.
    - Infer humour styles and tolerances.
    - Optionally set `sn_strict_mode` when a user strongly expresses that “N only” preference.

No code changes beyond documentation & mock data are required at this stage.

---

## 4. Future Matching Layer Placeholder (still later)

Keep your existing “Coming Soon: Matching Algorithms” section, but you can add two bullets to reflect the new fields:

- The future baseline compatibility function `Compat(A,B)` will:
  - Treat humour alignment (`humour_profile`) as a **high-weight feature** after basic demographics (diet, location, education).
  - Optionally use `mbti_matching_prefs.sn_strict_mode` to enforce stricter S–N matching for certain users.
  - Eventually include `appearance_salience` and indirect attractiveness measures as features.

No implementation of the matching logic is required yet; this is just to keep the documentation in sync.

---

## 5. Success Criteria for This Update

Consider this update successful if:

- The schema presentation still works exactly as before **and**:
  - Shows the new `humour_profile`, `appearance`, and `mbti_matching_prefs` structures clearly.
  - Example profiles include these fields with realistic mock values.
  - The Overview and Inferences sections explain why these new fields exist and how they will be used *later*.
- No existing sections or views are removed; you’ve only **extended** the UI and documentation.

This updated `user_data_schema_plan.md` is now your **new source of truth** for the schema until we add the next layer (baseline compatibility / matching model plan) in a separate document.
