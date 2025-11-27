# User Data Schema Description (v1.1)

This document describes the **User Data Schema (v1.1)** implemented for the Wavelength project. It serves as the foundational data structure for the agentic matchmaking system, designed to be populated and maintained by an LLM based on user interactions.

## Core Concept: The Agentic Profile

The user profile is not a static form but a dynamic document that evolves.
- **Source of Truth**: The `events` log (append-only history of interactions).
- **Materialized View**: The `user_profile_v1` object, which is periodically updated by the Agentic LLM by processing new events.

## Root Structure: `user_profile_v1`

The profile is a JSON object with the following top-level sections:

```jsonc
{
  "user_id": "string",
  "version": "v1",
  "facts": { ... },             // Explicit user inputs
  "inferences": { ... },        // LLM-derived traits (High Confidence)
  "hypotheses": { ... },        // LLM guesses (Low Confidence)
  "summaries": { ... },         // Textual summaries
  "archetypes": { ... },        // High-level labels
  "relationship_style": { ... },// Needs & patterns
  "attraction_profile": { ... },// Preferences
  "preference_rules": [ ... ],  // Custom logic
  "events": [ ... ],            // Interaction log
  "metadata": { ... }
}
```

---

## Section Details

### 1. Facts (`facts`)
Objective data provided directly by the user.
- **Demographics**: `name`, `age`, `gender`, `sexual_orientation`, `home_origin`, `raised_till_18_location_cluster`.
- **Socio-Economic**: `education_tier` (1-3), `job_difficulty` (1-3), `income_band`, `profession`, `industry`.
- **Lifestyle**: `diet`, `smoking`, `drinking`, `nightlife`, `current_area_in_bangalore`, `living_setup`.
- **Intent**: `relationship_intent` (casual/serious/open_to_both), `dealbreakers` (explicit exclusions).

### 2. Inferences (`inferences`)
Traits derived by the LLM with reasonable confidence. This is the primary engine for compatibility matching.

#### A. MBTI & Personality
- **`mbti_axes`**: Continuous [0,1] scores for `IE` (Introvert-Extrovert), `SN` (Sensing-Intuitive), `FT` (Feeling-Thinking), `JP` (Judging-Perceiving).
- **`mbti_matching_prefs`**: Configuration for matching logic (e.g., `sn_strict_mode` to enforce Intuitive-only matches).

#### B. Humour Profile (`humour_profile`)
A high-importance dimension for compatibility.
- **`styles`**: Scores [0,1] for specific styles: `wordplay_puns`, `double_entendre`, `dry_deadpan`, `slapstick_goofy`, `dark_morbid`, `meta_internet_memes`, `sarcasm`.
- **Tolerances**: `cringe_tolerance` (enjoyment of "bad" jokes), `offence_tolerance` (resilience to edgy/dark humor).
- **Role**: `performs_vs_appreciates` (0 = audience, 1 = comic).

#### C. Attachment (`attachment`)
Scores [0,1] for `anxious` and `avoidant` dimensions. Used to predict relationship stability.

#### D. Values & Politics
- **`values`**: Scores for `family_oriented`, `career_focused`, `risk_taking`, `traditional_modern_score`.
- **`political_lean`**: Scalar [0,1] (Left to Right).

#### E. Hobbies (`hobbies`)
List of objects with `name`, `involvement` (0-1), and `skill` (0-1).

#### F. Appearance (`appearance`)
*Placeholder for future signals.*
- `attractiveness_band`: Estimated score (currently unused).
- `appearance_salience`: How much the user prioritizes aesthetics.

### 3. Hypotheses (`hypotheses`)
Speculative inferences (confidence < 0.5). Used by the Agent to generate clarifying questions during conversation (e.g., "User might be conflict-avoidant?").

### 4. Relationship Style (`relationship_style`)
Structured representation of needs:
- `communication_need`: Frequency/depth of contact.
- `independence_need`: Need for space.
- `long_term_orientation`: Readiness for commitment.
- `conflict_style`: Textual description (e.g., "Collaborative").

### 5. Summaries & Archetypes
- **`summaries`**: LLM-written paragraphs for `matching_v1` (bio), `relationship_history_v1`, etc.
- **`archetypes`**: Tags for quick clustering (e.g., "Startup_Extrovert", "Old_School_Romantic").

### 6. Events (`events`)
The raw log of interactions.
- Structure: `{ type: string, timestamp: ISO8601, payload: any }`.
- Types: `onboarding_answered`, `shared_story`, `feedback_given`.

---

## Relations to Other Components
- **Input for**: `baseline_matcher.js` (uses `facts`, `inferences`, `relationship_style`).
- **Output of**: The Agentic LLM conversation loop.
