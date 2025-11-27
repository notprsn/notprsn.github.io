
# user_data_schema_plan.md

## 0. Context & Goals

This document describes a **v1 user data schema** and how to present it interactively, for a dating app that uses **agentic LLMs** to do matchmaking.

- The existing project currently has an `index.html` that is **purely visual**, showing the *idea* of a GenAI-powered dating app.
- **Your job as the implementation agent** is to build a **separate, self-contained interactive presentation** of the **user data schema and reasoning layer**, *independent of* the existing `index.html`.
- We are starting with the **schema / data layer only**.  
  Matching algorithms and models (two-tower, graph ML, semantic search, etc.) will be added in later iterations, and the presentation should leave room for that.

You may assume:

- You can write any frontend / backend code as needed (HTML/CSS/JS, TS/React, simple Node, etc.).
- You *can* call a GenAI model (e.g. Gemini via `GEMINI_API_KEY`) later, but for **this first iteration** API calls should be **demonstrative only or stubbed**.
- The goal of the presentation is **implementation-focused**, not marketing-focused:
  - It should help engineers and collaborators understand the schema and how it supports agentic LLM reasoning.
  - It should be easy to iterate on later.

---

## 1. High-level Design: Layers in the User Model

The app is a **matchmaking system for Bangalore users aged ~22–29**. A user’s record is designed assuming that:

- An **agentic LLM** will:
  - Conduct onboarding conversations.
  - Maintain and update structured traits and inferences.
  - Occasionally perform pairwise reasoning between two users at match time.

We conceptualise each user profile as three main layers:

1. **Facts** – directly user-provided, objective fields (age, diet, location, etc.).
2. **Inferences** – LLM-derived traits with reasonable confidence (MBTI axes, attachment axes, hobbies with involvement and skill, values).
3. **Hypotheses** – speculative or low-confidence inferences that **may influence questions asked** but should not heavily bias matching.

On top of this we maintain:

- **Summaries** – short LLM-written descriptions (for matching, history, lifestyle).
- **Archetypes** – label-based clusters that capture “what kind of person this is” in a few words.
- **Relationship Style** – structured representation of communication, independence, long-term vs casual orientation, etc.
- **Attraction Profile** – structured representation of what they like / dislike in partners.
- **Preference Rules** – small, interpretable rules like “if other is veg & slightly more extroverted → +0.15 to like probability”.
- **Events** – an append-only log of user interactions and updates, from which the LLM can re-materialise the profile.

Everything should support:

- Each trait having a **value**, **confidence**, and **last_updated_at**.
- **Evidence snippets**, where applicable, showing the text basis for inferences.

---

## 2. Top-level Schema: `user_profile_v1`

The core object we care about is a **versioned user profile**.

At a high level:

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

### 2.1 `facts` (ground truth, user-provided)

These are directly asked and stored as structured data:

- `name`, `age`, `gender`, `sexual_orientation`
- `home_origin` (city/state/country or cluster)
- `raised_till_18_location_cluster`
- `education_level`, `degree`, `college`, optional `education_tier`
- `profession`, `industry`, optional `income_band`
- `diet` (veg / nonveg / eggetarian / vegan)
- `languages_primary` (list), `languages_secondary` (list)
- `current_area_in_bangalore` (clustered neighbourhood)
- `living_setup` (alone / flatmates / parents)
- `family_background`:
  - `parents_professions`
  - `parents_marriage_type` (love / arranged / other)
  - `siblings_count`
- `dating_history`:
  - `num_previous_partners`
  - `num_long_term_relationships`
  - `longest_relationship_months`
- `relationship_intent` (casual / open_to_both / serious_only)
- `dealbreakers` (structured list, e.g. diet, smoking, kids/no-kids)
- `user_written_bio` (short free text as typed by user)

**Implementation notes for the agent:**

- In your presentation, show `facts` as a straightforward **table or collapsible card** with clear labels and types.
- Optionally, define **TypeScript interfaces** or JSON Schema for `facts` to make the structure explicit.

---

### 2.2 `inferences` (LLM-derived traits)

These are traits the LLM infers from onboarding conversations, stories, and follow-ups. Each trait should track:

- `value` – numeric or categorical.
- `confidence` – 0–1 indicating how sure the LLM is.
- `last_updated_at` – ISO timestamp.
- Optionally `evidence_snippets` – one or more short user quotes that support the inference.

#### 2.2.1 MBTI Axes as Continuous Values

We represent MBTI not as a label (e.g. ENFP) but as **four continuous axes in [0,1]**:

- `IE` (introversion–extraversion)
- `SN` (sensing–intuitive)
- `FT` (feeling–thinking)
- `JP` (judging–perceiving)

Semantic mapping:

- For each axis, 0.0 indicates one extreme, 1.0 the other:
  - `IE`: 0 → strongly introverted, 1 → strongly extraverted
  - `SN`: 0 → strongly S, 1 → strongly N
  - `FT`: 0 → strongly F, 1 → strongly T
  - `JP`: 0 → strongly J, 1 → strongly P

Example representation:

```jsonc
"mbti_axes": {
  "IE": { "value": 0.72, "confidence": 0.8, "last_updated_at": "2025-11-26T10:30:00Z" },
  "SN": { "value": 0.65, "confidence": 0.7, "last_updated_at": "2025-11-26T10:30:00Z" },
  "FT": { "value": 0.30, "confidence": 0.75, "last_updated_at": "2025-11-26T10:30:00Z" },
  "JP": { "value": 0.55, "confidence": 0.6, "last_updated_at": "2025-11-26T10:30:00Z" }
}
```

#### 2.2.2 Attachment Axes

Two independent axes, also in [0,1]:

- `anxious` – fear of abandonment, reassurance need.
- `avoidant` – discomfort with closeness, preference for distance.

Example:

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

#### 2.2.3 Hobbies With Involvement and Skill

Each hobby is an object with:

- `name` – normalised string (e.g. "badminton", "trekking", "classical_music").
- `involvement` – [0,1], how central this is in their life:
  - ~0.2: dabbling
  - ~0.5: casual regular
  - ~0.8+: serious hobby
- `skill` – [0,1], inferred or explicit:
  - If unspecified → default to ~0.5 (median skill).

Example:

```jsonc
"hobbies": [
  { "name": "badminton", "involvement": 0.8, "skill": 0.7 },
  { "name": "stand_up_comedy", "involvement": 0.4, "skill": 0.5 },
  { "name": "cooking", "involvement": 0.6, "skill": 0.6 }
]
```

#### 2.2.4 Values / Politics / Vibe

We want both:

- A small set of **interpretable scores/tags**, and
- One or more **embeddings** for semantic matching later.

Example:

```jsonc
"values": {
  "family_oriented": { "value": 0.8, "confidence": 0.7 },
  "career_focused": { "value": 0.7, "confidence": 0.8 },
  "risk_taking": { "value": 0.3, "confidence": 0.5 },
  "traditional_modern_score": { "value": 0.6, "confidence": 0.6 }
},
"political_lean": {
  "scalar_0_1": { "value": 0.42, "confidence": 0.4 } // e.g. 0 = one end, 1 = other end; internal use only
},
"embeddings": {
  "profile_bio_v1": "vec_profile_123",
  "hobbies_v1": "vec_hobbies_987",
  "relationship_narrative_v1": "vec_rel_456"
}
```

The actual vectors (`vec_profile_123` etc.) live in a **vector store**; this profile just stores IDs / references.

---

### 2.3 `hypotheses` (low-confidence guesses)

This section holds traits that are speculative:

```jsonc
"hypotheses": {
  "conflict_avoidant": {
    "value": 0.5,
    "confidence": 0.3,
    "evidence_snippets": [
      "I hate fights so I usually just shut down until the other person cools off."
    ]
  }
}
```

- Matching should treat `hypotheses` as **weak priors** or ignore them until confidence improves.
- The LLM agent can use them to decide what **clarifying questions** to ask later.

---

### 2.4 `summaries` (canonical LLM-written views)

We maintain a few short, reusable summaries:

- `matching_v1` – short, neutral description optimised for matching.
- `relationship_history_v1` – how many relationships, typical patterns.
- `weekend_v1` – what weekends typically look like (cafes, clubs, treks, etc.).
- Others can be added later.

Example:

```jsonc
"summaries": {
  "matching_v1": "25-year-old software engineer in Koramangala, introverted but warm in small groups, loves live music and board games, looking for a serious relationship.",
  "relationship_history_v1": "Two past relationships: one 3-year college relationship that ended mutually, one 6-month situationship where they felt emotionally neglected.",
  "weekend_v1": "Alternates between small house parties and exploring cafes or live gigs in Indiranagar."
}
```

These summaries are used to:

- Feed paired user descriptions into an LLM for match explanation.
- Keep token usage bounded by avoiding sending entire event logs.

---

### 2.5 `archetypes` (LLM-generated cluster labels)

These are short labels that group users into intuitive “types”:

```jsonc
"archetypes": {
  "dating_archetype": [
    "south_blr_creative_introvert",
    "long_term_leaning_but_cautious"
  ],
  "lifestyle_archetype": [
    "startup_belt_koramangala",
    "weekend_gigs_and_cafes"
  ]
}
```

- These labels can be used **symbolically** in matching and in explanation text.
- The agent should treat them as additive metadata, not rigid categories.

---

### 2.6 `relationship_style`

Structured representation of how they tend to relate:

```jsonc
"relationship_style": {
  "communication_need": { "value": 0.7, "confidence": 0.8 }, // 0 = low, 1 = high
  "independence_need": { "value": 0.6, "confidence": 0.7 },
  "conflict_style": "avoids_conflict_but_opens_up_later", // label string
  "long_term_orientation": { "value": 0.8, "confidence": 0.9 },
  "summary_text": "Wants frequent texting, values emotional honesty, slight fear of being taken for granted."
}
```

- The LLM should keep this updated as the user shares more stories.
- The matching engine can use these values to align expectations (e.g. communication_need vs independence_need).

---

### 2.7 `attraction_profile`

Structured view of what they like / dislike in others:

```jsonc
"attraction_profile": {
  "hard_turn_ons": [
    "emotionally_expressive",
    "similar_ambition_level",
    "likes_live_music_and_standup"
  ],
  "hard_turn_offs": [
    "rude_to_service_staff",
    "rigid_traditional_gender_roles"
  ],
  "soft_preferences": [
    "slightly_more_extroverted_than_self",
    "similar_or_slightly_higher_education_level"
  ]
}
```

- These tags can be used by the matching model and the explanation layer.
- They should be derived from explicit statements (e.g. “I’m really drawn to people who…” or “Major ick for me is…”).

---

### 2.8 `preference_rules` (mini per-user rules)

These are small, LLM-generated rules that define *how this user’s like probability shifts* based on features of the other person.

Example:

```jsonc
"preference_rules": [
  {
    "if_other": {
      "IE": "> 0.6",
      "diet": "veg_or_eggetarian"
    },
    "then_effect_on_like_prob": 0.15,
    "rationale": "They say they are drawn to outgoing people from similar dietary backgrounds."
  },
  {
    "if_other": {
      "living_setup": "with_parents"
    },
    "then_effect_on_like_prob": -0.1,
    "rationale": "They mentioned wanting someone fairly independent in terms of living situation."
  }
]
```

Implementation details for later:

- For now, the presentation only needs to display **example rules** and their structure.
- The actual logic engine that applies these rules to candidate profiles can be added once we build the matching layer.

---

### 2.9 `events` (append-only interaction log)

This records raw chronological events, which can be used as **source-of-truth** for re-materialising the profile.

Event types could include:

- `onboarding_answered` – user answered a question.
- `shared_story` – user gave a longer narrative about a relationship, childhood, etc.
- `updated_preference` – user changed a setting.
- Later: `swiped_right_on`, `swiped_left_on`, `match_formed`, etc.

Example:

```jsonc
"events": [
  {
    "type": "onboarding_answered",
    "timestamp": "2025-11-26T10:20:00Z",
    "payload": {
      "question_id": "relationship_intent",
      "answer_text": "I'm looking for something serious but happy to start slow."
    }
  },
  {
    "type": "shared_story",
    "timestamp": "2025-11-26T10:25:00Z",
    "payload": {
      "story_type": "past_relationship",
      "text": "In my last relationship, I felt like I was always the one initiating plans..."
    }
  }
]
```

The LLM agent:

- Periodically or on-demand, re-derives `inferences`, `summaries`, etc. from `events`.
- The presentation should visualise that **events → inferences → profile** is the mental model.

---

## 3. Presentation Requirements (for the Implementation Agent)

You will build a **separate interactive presentation** of this schema.

### 3.1 Independence from existing `index.html`

- Do **not** modify or depend on `index.html` beyond basic shared styles if needed.
- Create a new entry point, e.g.:
  - `schema.html` (pure HTML/JS), **or**
  - `schema/index.html` + associated JS, **or**
  - A separate React view (e.g. `/schema` route) if using a SPA setup.

The key is: this presentation stands on its own as a **developer-facing documentation & exploration tool** for the user data model.

### 3.2 Suggested structure of the presentation

At minimum, the presentation should include:

1. **Overview section**
   - High-level explanation of: facts, inferences, hypotheses, summaries, archetypes, relationship_style, attraction_profile, preference_rules, events.
   - Simple diagram or flow: `events → profile (facts/inferences/hypotheses) → matching`.

2. **Schema browser**
   - A left-hand navigation or tabs for:
     - Top-level `user_profile_v1`
     - `facts`
     - `inferences` (sub-tabs: MBTI, attachment, hobbies, values)
     - `hypotheses`
     - `summaries`
     - `archetypes`
     - `relationship_style`
     - `attraction_profile`
     - `preference_rules`
     - `events`
   - Each tab shows:
     - Textual explanation of what the section is for.
     - Example JSON snippet (syntax-highlighted).
     - Notes about how the LLM is expected to maintain/update it.

3. **Example user profile(s)**
   - At least one **mock user** with a fully-populated `user_profile_v1`.
   - Maybe include 2–3 contrasting archetypes (e.g. “Koramangala startup extrovert” vs “South Bangalore bookish introvert”) to illustrate.

4. **LLM interaction notes (non-functional for now)**
   - A small text section describing how the agentic LLM will:
     - Parse onboarding conversation into `events`.
     - Materialise/update `inferences`, `summaries`, `archetypes`, etc.
   - If you want, you can stub out a button “Simulate LLM update” that just toggles between example profiles—**no real API calls yet**.

5. **Future matching layer placeholder**
   - A clearly labeled “Coming Soon: Matching Algorithms” section that lists:
     - Baseline human-prior compatibility function.
     - Two-tower model idea.
     - Possible Graph ML / GNN layer.
     - Human-vector embeddings for dating.
   - No implementation needed yet, just placeholders so future work can plug in.

---

## 4. Implementation Guidance for the Agent

You can choose your stack, but here’s a suggested approach that is simple and extensible:

1. **Data representation**
   - Create a TypeScript file or JS module that defines:
     - Type/interface for `UserProfileV1`.
     - One or more example `UserProfileV1` objects populated with realistic data.

2. **UI**
   - Build a single-page presentation with:
     - A sidebar navigation listing schema sections.
     - A main content area that shows:
       - A prose explanation of the section.
       - A rendered, syntax-highlighted JSON example.
       - Any diagrams or bullet points about how LLMs will interact with that part.
   - Keep styling clear and developer-friendly; Tailwind or lightweight CSS is fine.

3. **Interactivity**
   - Allow switching between example users if multiple mocks are defined.
   - Allow expanding/collapsing subsections (e.g. showing/hiding `evidence_snippets`).
   - Consider a simple “schema mode vs example mode” toggle:
     - Schema mode: show types & field descriptions.
     - Example mode: show concrete sample data.

4. **Extensibility**
   - Structure the code so that:
     - Adding new fields to `UserProfileV1` automatically updates the presentation (or is at least localised to a small config file).
     - Later, matching algorithms (compatibility scoring, two-tower explanation, etc.) can be documented in **similar fashion**:
       - A new tab “Matching Models” that can show pseudocode, diagrams, and numeric examples.

5. **No real API calls yet**
   - The current iteration should **avoid** actual calls to Gemini or other LLM APIs.
   - If you include any API code, keep it disabled / commented or clearly demo-only.
   - Focus on **schema clarity and UX** for understanding the data model.

---

## 5. Multi-step Roadmap (How This Plan Will Be Used)

1. **Step 1 – Implement this schema presentation**
   - Agent builds the interactive `user_data_schema` presentation as per sections above.
   - This becomes the reference for how user data is structured and maintained.

2. **Step 2 – Add baseline compatibility / human-prior matching**
   - We will define a deterministic compatibility function `Compat(A,B)` using:
     - Context, location, lifestyle, MBTI axes, attachment axes, hobbies, intent, etc.
   - Agent will then extend the presentation with:
     - A “Matching Logic” tab that shows:
       - Feature groups.
       - How the score is computed (weights, non-linearities).
       - Example pair scoring breakdown and explanation.

3. **Step 3 – Introduce learned models**
   - Two-tower models for predicting swipe probability.
   - Later, graph ML / knowledge graph layer.
   - We will again update the plan and have the agent:
     - Document these models with diagrams.
     - Show how they use the same `user_profile_v1` schema and embeddings.
     - Possibly add interactive “toy” demos.

4. **Step 4 – Hook in real agentic flows**
   - Once the schema and matching logic are stable, we will:
     - Connect the onboarding chatbot to actually populate `events`.
     - Materialise profiles using a real LLM through `GEMINI_API_KEY` (or another key).
     - Display real user data (with privacy considerations) in the same schema UI.

---

## 6. Success Criteria for This Iteration

For this iteration, consider it successful if:

- There is a dedicated **schema presentation page** (or route) that:
  - Clearly explains the **user_profile_v1** schema and all its sections.
  - Shows at least one fully-populated example user.
  - Shows how agentic LLMs will **maintain** these fields conceptually.
- The implementation is **independent of the existing `index.html`** and can be iterated upon without disturbing the current visual mock.
- The code is structured so that:
  - New fields or sections in the schema can be added with minimal friction.
  - Future “Matching Models” documentation can be plugged in smoothly.

This document (`user_data_schema_plan.md`) should be treated as the **source of truth** for the schema and initial presentation until we revise it in later iterations.
