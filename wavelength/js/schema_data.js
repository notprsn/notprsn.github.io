
// schema_data.js

export const schemaDocs = {
    overview: {
        title: "Overview",
        description: "The User Profile V1.1 is the core data structure for the agentic matchmaking system. It is designed to be maintained by an LLM based on user interactions.",
        diagram: "Events -> [LLM Processing] -> Profile (Facts + Inferences) -> [Matching Engine]",
        content: "The profile consists of three main layers:\n1. Facts: Direct user input.\n2. Inferences: LLM-derived traits (including Humour & Appearance).\n3. Hypotheses: Low-confidence guesses to guide future questions.\n\nNew in v1.1: Humour Profile, Appearance Placeholders, and MBTI Matching Preferences."
    },
    user_profile_v1: {
        title: "User Profile V1",
        description: "The root object containing all user data.",
        typeDefinition: `{
  user_id: string;
  version: "v1";
  facts: Facts;
  inferences: Inferences;
  hypotheses: Hypotheses;
  summaries: Summaries;
  archetypes: Archetypes;
  relationship_style: RelationshipStyle;
  attraction_profile: AttractionProfile;
  preference_rules: PreferenceRule[];
  events: UserEvent[];
  metadata: Metadata;
}`
    },
    facts: {
        title: "Facts",
        description: "Ground truth data provided directly by the user. These are objective fields.",
        typeDefinition: `{
  name: string;
  age: number;
  gender: string;
  sexual_orientation: string;
  home_origin: string;
  // ... other demographic fields
  dating_history: {
    num_previous_partners: number;
    // ...
  };
  dealbreakers: string[];
}`
    },
    inferences: {
        title: "Inferences (Core)",
        description: "Traits derived by the LLM from conversations. Now includes Humour and Appearance.",
        typeDefinition: `{
  mbti_axes: { ... };
  mbti_matching_prefs: {
    sn_strict_mode: { value: boolean; ... };
  };
  attachment: { ... };
  hobbies: Hobby[];
  values: Record<string, Trait>;
  humour_profile: HumourProfile; // See "Inferences: Humour"
  appearance: Appearance; // See "Inferences: Appearance"
}`
    },
    inferences_humour: {
        title: "Inferences: Humour",
        description: "Detailed breakdown of humour styles and tolerances. High-importance for matching.",
        dataPath: "inferences.humour_profile",
        typeDefinition: `{
  styles: {
    wordplay_puns: Trait;
    double_entendre: Trait;
    dry_deadpan: Trait;
    slapstick_goofy: Trait;
    dark_morbid: Trait;
    meta_internet_memes: Trait;
    sarcasm: Trait;
  };
  cringe_tolerance: Trait;
  offence_tolerance: Trait;
  performs_vs_appreciates: Trait; // 0=Audience, 1=Performer
  summary_text: string;
  evidence_snippets: string[];
}`
    },
    inferences_appearance: {
        title: "Inferences: Appearance",
        description: "Placeholder for future attractiveness signals. NOT user-facing.",
        dataPath: "inferences.appearance",
        typeDefinition: `{
  attractiveness_band: {
    value: number; // 1-5 scale (inferred later)
    confidence: number;
    notes: string;
  };
  appearance_salience: {
    value: number; // How much they care about looks
    confidence: number;
  };
}`
    },
    hypotheses: {
        title: "Hypotheses",
        description: "Speculative inferences with low confidence. Used to generate clarifying questions.",
        typeDefinition: `{
  [trait_name: string]: {
    value: any;
    confidence: number; // Usually < 0.5
    evidence_snippets: string[];
  }
}`
    },
    summaries: {
        title: "Summaries",
        description: "Canonical LLM-written text summaries for quick context and matching explanations.",
        typeDefinition: `{
  matching_v1: string;
  relationship_history_v1: string;
  weekend_v1: string;
}`
    },
    archetypes: {
        title: "Archetypes",
        description: "High-level cluster labels for quick categorization.",
        typeDefinition: `{
  dating_archetype: string[];
  lifestyle_archetype: string[];
}`
    },
    relationship_style: {
        title: "Relationship Style",
        description: "Structured representation of relationship needs and patterns.",
        typeDefinition: `{
  communication_need: Trait;
  independence_need: Trait;
  conflict_style: string;
  long_term_orientation: Trait;
  summary_text: string;
}`
    },
    attraction_profile: {
        title: "Attraction Profile",
        description: "What the user likes/dislikes in a partner.",
        typeDefinition: `{
  hard_turn_ons: string[];
  hard_turn_offs: string[];
  soft_preferences: string[];
}`
    },
    preference_rules: {
        title: "Preference Rules",
        description: "Small logic rules that adjust matching probability based on specific features.",
        typeDefinition: `Array<{
  if_other: Record<string, any>;
  then_effect_on_like_prob: number;
  rationale: string;
}>`
    },
    events: {
        title: "Events",
        description: "Append-only log of all interactions. The source of truth for re-materializing the profile.",
        typeDefinition: `Array<{
  type: "onboarding_answered" | "shared_story" | "updated_preference";
  timestamp: string;
  payload: any;
}>`
    },
    matching_algorithms: {
        title: "Matching Algorithms",
        description: "Future logic for compatibility scoring (Coming Soon).",
        content: "The future baseline compatibility function Compat(A,B) will:\n- Treat humour alignment (humour_profile) as a high-weight feature.\n- Use mbti_matching_prefs.sn_strict_mode to enforce S-N matching.\n- Eventually include appearance_salience and indirect attractiveness measures.\n\nPlanned Models:\n- Two-Tower Models for swipe probability.\n- Graph ML layers for community detection.",
        typeDefinition: "// Logic to be implemented in v2"
    }
};

export const mockUsers = [
    {
        id: "user_123",
        name: "Arjun",
        data: {
            user_id: "user_123",
            version: "v1",
            facts: {
                name: "Arjun",
                age: 27,
                gender: "Male",
                sexual_orientation: "Heterosexual",
                home_origin: "Mumbai",
                raised_till_18_location_cluster: "Metro_Tier1",
                education_level: "Masters",
                degree: "Computer Science",
                college: "IIITB",
                profession: "Product Manager",
                industry: "FinTech",
                diet: "Non-Veg",
                languages_primary: ["English", "Hindi"],
                languages_secondary: ["Marathi"],
                current_area_in_bangalore: "Koramangala",
                living_setup: "Flatmates",
                family_background: {
                    parents_professions: ["Banker", "Teacher"],
                    parents_marriage_type: "Arranged",
                    siblings_count: 1
                },
                dating_history: {
                    num_previous_partners: 2,
                    num_long_term_relationships: 1,
                    longest_relationship_months: 18
                },
                relationship_intent: "Serious",
                dealbreakers: ["Smoking", "Conservative Values"],
                user_written_bio: "Tech guy who loves indie music and weekend treks."
            },
            inferences: {
                mbti_axes: {
                    IE: { value: 0.7, confidence: 0.8, last_updated_at: "2025-11-26T10:00:00Z" },
                    SN: { value: 0.6, confidence: 0.7, last_updated_at: "2025-11-26T10:00:00Z" },
                    FT: { value: 0.3, confidence: 0.75, last_updated_at: "2025-11-26T10:00:00Z" },
                    JP: { value: 0.5, confidence: 0.6, last_updated_at: "2025-11-26T10:00:00Z" }
                },
                mbti_matching_prefs: {
                    sn_strict_mode: {
                        value: false,
                        last_updated_at: "2025-11-27T11:00:00Z",
                        notes: "Flexible on S/N."
                    }
                },
                attachment: {
                    anxious: { value: 0.6, confidence: 0.7, last_updated_at: "2025-11-26T10:00:00Z" },
                    avoidant: { value: 0.2, confidence: 0.6, last_updated_at: "2025-11-26T10:00:00Z" }
                },
                hobbies: [
                    { name: "guitar", involvement: 0.7, skill: 0.6 },
                    { name: "trekking", involvement: 0.5, skill: 0.5 }
                ],
                values: {
                    career_focused: { value: 0.8, confidence: 0.9 },
                    risk_taking: { value: 0.6, confidence: 0.7 }
                },
                humour_profile: {
                    styles: {
                        wordplay_puns: { value: 0.8, confidence: 0.8 },
                        double_entendre: { value: 0.7, confidence: 0.6 },
                        dry_deadpan: { value: 0.5, confidence: 0.5 },
                        slapstick_goofy: { value: 0.3, confidence: 0.6 },
                        dark_morbid: { value: 0.2, confidence: 0.7 },
                        meta_internet_memes: { value: 0.6, confidence: 0.8 },
                        sarcasm: { value: 0.5, confidence: 0.6 }
                    },
                    cringe_tolerance: { value: 0.7, confidence: 0.8 },
                    offence_tolerance: { value: 0.4, confidence: 0.6 },
                    performs_vs_appreciates: { value: 0.3, confidence: 0.7 },
                    summary_text: "Enjoys dad jokes and puns. Not into dark humour.",
                    evidence_snippets: ["Laughed at the 'why did the chicken cross the road' anti-joke."]
                },
                appearance: {
                    attractiveness_band: {
                        value: 3,
                        confidence: 0.1,
                        scale: "1_to_5",
                        notes: "Placeholder."
                    },
                    appearance_salience: {
                        value: 0.4,
                        confidence: 0.6,
                        notes: "Doesn't mention looks often."
                    }
                }
            },
            hypotheses: {
                conflict_avoidant: {
                    value: 0.6,
                    confidence: 0.3,
                    evidence_snippets: ["Mentioned disliking arguments in past relationship."]
                }
            },
            summaries: {
                matching_v1: "27-year-old PM in Koramangala. Extroverted, career-focused, musical. Seeks serious connection.",
                relationship_history_v1: "One major 1.5yr relationship. Ended due to location differences.",
                weekend_v1: "Gigs at Fandom or trekking near Nandi Hills."
            },
            archetypes: {
                dating_archetype: ["Startup_Extrovert", "Passionate_Creative"],
                lifestyle_archetype: ["Koramangala_Socialite"]
            },
            relationship_style: {
                communication_need: { value: 0.8, confidence: 0.8 },
                independence_need: { value: 0.5, confidence: 0.7 },
                conflict_style: "Collaborative",
                long_term_orientation: { value: 0.9, confidence: 0.9 },
                summary_text: "Values open communication and shared activities."
            },
            attraction_profile: {
                hard_turn_ons: ["Artistic", "Ambitious"],
                hard_turn_offs: ["Smoker", "Closed-minded"],
                soft_preferences: ["Vegetarian friendly", "Dog lover"]
            },
            preference_rules: [
                {
                    if_other: { diet: "Veg" },
                    then_effect_on_like_prob: 0.1,
                    rationale: "Prefers partners with similar lifestyle choices."
                }
            ],
            events: [
                {
                    type: "onboarding_answered",
                    timestamp: "2025-11-26T09:00:00Z",
                    payload: { question: "What do you do?", answer: "I'm a PM at a fintech startup." }
                }
            ],
            metadata: {
                created_at: "2025-11-26T09:00:00Z",
                last_materialized_at: "2025-11-26T10:00:00Z"
            }
        }
    },
    {
        id: "user_456",
        name: "Sneha",
        data: {
            user_id: "user_456",
            version: "v1",
            facts: {
                name: "Sneha",
                age: 25,
                gender: "Female",
                sexual_orientation: "Heterosexual",
                home_origin: "Bangalore",
                raised_till_18_location_cluster: "Metro_Tier1",
                education_level: "Bachelors",
                degree: "Literature",
                college: "Christ University",
                profession: "Content Writer",
                industry: "Media",
                diet: "Veg",
                languages_primary: ["English", "Kannada"],
                languages_secondary: ["Hindi"],
                current_area_in_bangalore: "Jayanagar",
                living_setup: "Parents",
                family_background: {
                    parents_professions: ["Doctor", "Homemaker"],
                    parents_marriage_type: "Arranged",
                    siblings_count: 0
                },
                dating_history: {
                    num_previous_partners: 1,
                    num_long_term_relationships: 0,
                    longest_relationship_months: 6
                },
                relationship_intent: "Open to both",
                dealbreakers: ["Disrespectful", "Unambitious"],
                user_written_bio: "Bookworm, coffee addict, and occasional poet."
            },
            inferences: {
                mbti_axes: {
                    IE: { value: 0.2, confidence: 0.9, last_updated_at: "2025-11-26T11:00:00Z" }, // Introvert
                    SN: { value: 0.8, confidence: 0.7, last_updated_at: "2025-11-26T11:00:00Z" }, // Intuitive
                    FT: { value: 0.8, confidence: 0.8, last_updated_at: "2025-11-26T11:00:00Z" }, // Feeling
                    JP: { value: 0.3, confidence: 0.6, last_updated_at: "2025-11-26T11:00:00Z" }  // Judging
                },
                mbti_matching_prefs: {
                    sn_strict_mode: {
                        value: true,
                        last_updated_at: "2025-11-27T11:00:00Z",
                        notes: "User is strongly intuitive and explicitly prefers partners who are also intuitive."
                    }
                },
                attachment: {
                    anxious: { value: 0.3, confidence: 0.6, last_updated_at: "2025-11-26T11:00:00Z" },
                    avoidant: { value: 0.4, confidence: 0.5, last_updated_at: "2025-11-26T11:00:00Z" }
                },
                hobbies: [
                    { name: "reading", involvement: 0.9, skill: 0.8 },
                    { name: "writing", involvement: 0.8, skill: 0.7 }
                ],
                values: {
                    family_oriented: { value: 0.9, confidence: 0.9 },
                    traditional_modern_score: { value: 0.4, confidence: 0.7 }
                },
                humour_profile: {
                    styles: {
                        wordplay_puns: { value: 0.9, confidence: 0.7 },
                        double_entendre: { value: 0.8, confidence: 0.6 },
                        dry_deadpan: { value: 0.4, confidence: 0.7 },
                        slapstick_goofy: { value: 0.2, confidence: 0.6 },
                        dark_morbid: { value: 0.1, confidence: 0.5 },
                        meta_internet_memes: { value: 0.7, confidence: 0.8 },
                        sarcasm: { value: 0.6, confidence: 0.7 }
                    },
                    cringe_tolerance: { value: 0.8, confidence: 0.7 },
                    offence_tolerance: { value: 0.3, confidence: 0.5 },
                    performs_vs_appreciates: { value: 0.4, confidence: 0.7 },
                    summary_text: "Loves wordplay and slightly lame puns, into meme humor, low tolerance for dark jokes.",
                    evidence_snippets: ["I will laugh at the worst puns if they're delivered with confidence."]
                },
                appearance: {
                    attractiveness_band: {
                        value: 3,
                        confidence: 0.2,
                        scale: "1_to_5",
                        notes: "Placeholder."
                    },
                    appearance_salience: {
                        value: 0.7,
                        confidence: 0.8,
                        notes: "Often talks about aesthetic cafes and fashion."
                    }
                }
            },
            hypotheses: {
                risk_averse: {
                    value: 0.7,
                    confidence: 0.4,
                    evidence_snippets: ["Prefers familiar places over new adventures."]
                }
            },
            summaries: {
                matching_v1: "25yo Writer in Jayanagar. Introverted, deep thinker, values family. Looking for intellectual connection.",
                relationship_history_v1: "Brief dating history, cautious approach.",
                weekend_v1: "Bookstores in Church Street or family time."
            },
            archetypes: {
                dating_archetype: ["Old_School_Romantic", "Intellectual_Introvert"],
                lifestyle_archetype: ["South_Bangalore_Traditional"]
            },
            relationship_style: {
                communication_need: { value: 0.6, confidence: 0.7 },
                independence_need: { value: 0.7, confidence: 0.6 },
                conflict_style: "Avoidant",
                long_term_orientation: { value: 0.7, confidence: 0.8 },
                summary_text: "Needs space but values deep emotional bonds."
            },
            attraction_profile: {
                hard_turn_ons: ["Well-read", "Calm demeanor"],
                hard_turn_offs: ["Loud", "Party animal"],
                soft_preferences: ["Kannada speaker", "Artistic"]
            },
            preference_rules: [
                {
                    if_other: { mbti_axes: { IE: "< 0.5" } },
                    then_effect_on_like_prob: 0.2,
                    rationale: "Prefers fellow introverts."
                }
            ],
            events: [
                {
                    type: "onboarding_answered",
                    timestamp: "2025-11-26T10:30:00Z",
                    payload: { question: "Ideal Sunday?", answer: "Reading a book with coffee." }
                }
            ],
            metadata: {
                created_at: "2025-11-26T10:30:00Z",
                last_materialized_at: "2025-11-26T11:00:00Z"
            }
        }
    }
];
