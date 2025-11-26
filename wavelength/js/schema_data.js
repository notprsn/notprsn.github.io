
// schema_data.js

export const schemaDocs = {
    overview: {
        title: "Overview",
        description: "The User Profile V1 is the core data structure for the agentic matchmaking system. It is designed to be maintained by an LLM based on user interactions.",
        diagram: "Events -> [LLM Processing] -> Profile (Facts + Inferences) -> [Matching Engine]",
        content: "The profile consists of three main layers:\n1. Facts: Direct user input.\n2. Inferences: LLM-derived traits with confidence scores.\n3. Hypotheses: Low-confidence guesses to guide future questions."
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
        title: "Inferences",
        description: "Traits derived by the LLM from conversations. Each trait has a value, confidence, and optional evidence.",
        typeDefinition: `{
  mbti_axes: {
    IE: { value: number; confidence: number; ... }; // 0=Introvert, 1=Extrovert
    SN: { value: number; confidence: number; ... };
    FT: { value: number; confidence: number; ... };
    JP: { value: number; confidence: number; ... };
  };
  attachment: {
    anxious: { value: number; confidence: number; ... };
    avoidant: { value: number; confidence: number; ... };
  };
  hobbies: Hobby[];
  values: Record<string, Trait>;
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
