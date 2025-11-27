
/**
 * demo_population.js
 * 
 * A diverse set of 10 mock users (5 Male, 5 Female) for the Baseline Matching Demo.
 * All based in Bengaluru with varying traits.
 */

export const demoPopulation = [
    // --- MALES ---
    {
        id: "m1",
        name: "Rohan",
        gender: "Male",
        ml_cluster_id: 0, // Driven Builder
        facts: {
            name: "Rohan",
            age: 28,
            gender: "Male",
            education_tier: 3, // Masters
            job_difficulty: 2, // Tech Lead
            income_band: 3,
            current_area_in_bangalore: "Indiranagar",
            dealbreakers: { diet: "must_not_smoke" },
            relationship_intent: "serious",
            smoking: "no",
            drinking: "yes",
            nightlife: "yes",
            diet: "Non-Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.8 }, SN: { value: 0.7 }, FT: { value: 0.4 }, JP: { value: 0.2 } }, // ENTJ
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { wordplay_puns: { value: 0.8 }, sarcasm: { value: 0.7 }, dark_morbid: { value: 0.3 } },
                cringe_tolerance: { value: 0.6 },
                offence_tolerance: { value: 0.5 },
                performs_vs_appreciates: { value: 0.7 }
            },
            hobbies: [
                { name: "badminton", involvement: 0.8 },
                { name: "investing", involvement: 0.6 }
            ],
            values: {
                career_focused: { value: 0.9 },
                family_oriented: { value: 0.5 },
                risk_taking: { value: 0.7 },
                traditional_modern_score: { value: 0.8 }
            },
            political_lean: { scalar_0_1: { value: 0.6 } },
            attachment: { anxious: { value: 0.3 }, avoidant: { value: 0.4 } }
        },
        relationship_style: { communication_need: { value: 0.7 }, independence_need: { value: 0.6 }, long_term_orientation: { value: 0.9 } }
    },
    {
        id: "m2",
        name: "Karthik",
        gender: "Male",
        ml_cluster_id: 1, // Chill Explorer
        facts: {
            name: "Karthik",
            age: 26,
            gender: "Male",
            education_tier: 2, // Bachelors
            job_difficulty: 1, // Graphic Designer
            income_band: 1,
            current_area_in_bangalore: "Jayanagar",
            dealbreakers: {},
            relationship_intent: "casual",
            smoking: "yes",
            drinking: "yes",
            nightlife: "yes",
            diet: "Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.3 }, SN: { value: 0.8 }, FT: { value: 0.8 }, JP: { value: 0.9 } }, // INFP
            mbti_matching_prefs: { sn_strict_mode: { value: true } }, // Strict Intuitive
            humour_profile: {
                styles: { wordplay_puns: { value: 0.4 }, dark_morbid: { value: 0.1 }, meta_internet_memes: { value: 0.9 } },
                cringe_tolerance: { value: 0.8 },
                offence_tolerance: { value: 0.2 },
                performs_vs_appreciates: { value: 0.2 }
            },
            hobbies: [
                { name: "art", involvement: 0.9 },
                { name: "gaming", involvement: 0.7 }
            ],
            values: {
                career_focused: { value: 0.4 },
                family_oriented: { value: 0.7 },
                risk_taking: { value: 0.3 },
                traditional_modern_score: { value: 0.4 }
            },
            political_lean: { scalar_0_1: { value: 0.8 } },
            attachment: { anxious: { value: 0.7 }, avoidant: { value: 0.2 } }
        },
        relationship_style: { communication_need: { value: 0.9 }, independence_need: { value: 0.3 }, long_term_orientation: { value: 0.5 } }
    },
    {
        id: "m3",
        name: "Vikram",
        gender: "Male",
        ml_cluster_id: 0, // Driven Builder
        facts: {
            name: "Vikram",
            age: 30,
            gender: "Male",
            education_tier: 3, // MBA
            job_difficulty: 3, // Consultant
            income_band: 3,
            current_area_in_bangalore: "Whitefield",
            dealbreakers: { diet: "must_be_veg" },
            relationship_intent: "serious",
            smoking: "no",
            drinking: "no",
            nightlife: "no",
            diet: "Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.6 }, SN: { value: 0.2 }, FT: { value: 0.1 }, JP: { value: 0.1 } }, // ESTJ
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { dry_deadpan: { value: 0.8 }, slapstick_goofy: { value: 0.2 } },
                cringe_tolerance: { value: 0.3 },
                offence_tolerance: { value: 0.4 },
                performs_vs_appreciates: { value: 0.5 }
            },
            hobbies: [
                { name: "golf", involvement: 0.6 },
                { name: "reading", involvement: 0.5 }
            ],
            values: {
                career_focused: { value: 0.9 },
                family_oriented: { value: 0.8 },
                risk_taking: { value: 0.2 },
                traditional_modern_score: { value: 0.3 }
            },
            political_lean: { scalar_0_1: { value: 0.3 } },
            attachment: { anxious: { value: 0.2 }, avoidant: { value: 0.3 } }
        },
        relationship_style: { communication_need: { value: 0.5 }, independence_need: { value: 0.6 }, long_term_orientation: { value: 1.0 } }
    },
    {
        id: "m4",
        name: "Aditya",
        gender: "Male",
        ml_cluster_id: 1, // Chill Explorer
        facts: {
            name: "Aditya",
            age: 24,
            gender: "Male",
            education_tier: 2,
            job_difficulty: 2, // Developer
            income_band: 2,
            current_area_in_bangalore: "HSR Layout",
            dealbreakers: {},
            relationship_intent: "open_to_both",
            smoking: "no",
            drinking: "yes",
            nightlife: "yes",
            diet: "Eggetarian"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.5 }, SN: { value: 0.6 }, FT: { value: 0.4 }, JP: { value: 0.6 } }, // ENTP-ish
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { dark_morbid: { value: 0.8 }, sarcasm: { value: 0.9 } },
                cringe_tolerance: { value: 0.5 },
                offence_tolerance: { value: 0.9 },
                performs_vs_appreciates: { value: 0.8 }
            },
            hobbies: [
                { name: "coding", involvement: 0.9 },
                { name: "gaming", involvement: 0.8 }
            ],
            values: {
                career_focused: { value: 0.7 },
                family_oriented: { value: 0.4 },
                risk_taking: { value: 0.6 },
                traditional_modern_score: { value: 0.7 }
            },
            political_lean: { scalar_0_1: { value: 0.5 } },
            attachment: { anxious: { value: 0.4 }, avoidant: { value: 0.4 } }
        },
        relationship_style: { communication_need: { value: 0.6 }, independence_need: { value: 0.7 }, long_term_orientation: { value: 0.6 } }
    },
    {
        id: "m5",
        name: "Kabir",
        gender: "Male",
        ml_cluster_id: 1, // Chill Explorer
        facts: {
            name: "Kabir",
            age: 29,
            gender: "Male",
            education_tier: 1, // Arts
            job_difficulty: 1, // Musician
            income_band: 1,
            current_area_in_bangalore: "Koramangala",
            dealbreakers: {},
            relationship_intent: "casual",
            smoking: "yes",
            drinking: "yes",
            nightlife: "yes",
            diet: "Non-Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.9 }, SN: { value: 0.8 }, FT: { value: 0.9 }, JP: { value: 0.8 } }, // ENFP
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { slapstick_goofy: { value: 0.8 }, wordplay_puns: { value: 0.6 } },
                cringe_tolerance: { value: 0.9 },
                offence_tolerance: { value: 0.6 },
                performs_vs_appreciates: { value: 0.9 }
            },
            hobbies: [
                { name: "guitar", involvement: 0.9 },
                { name: "travel", involvement: 0.7 }
            ],
            values: {
                career_focused: { value: 0.3 },
                family_oriented: { value: 0.4 },
                risk_taking: { value: 0.9 },
                traditional_modern_score: { value: 0.9 }
            },
            political_lean: { scalar_0_1: { value: 0.9 } },
            attachment: { anxious: { value: 0.5 }, avoidant: { value: 0.5 } }
        },
        relationship_style: { communication_need: { value: 0.7 }, independence_need: { value: 0.8 }, long_term_orientation: { value: 0.3 } }
    },

    // --- FEMALES ---
    {
        id: "f1",
        name: "Ananya",
        gender: "Female",
        ml_cluster_id: 3, // North BLR Corporate
        facts: {
            name: "Ananya",
            age: 27,
            gender: "Female",
            education_tier: 3, // Masters
            job_difficulty: 2, // Architect
            income_band: 2,
            current_area_in_bangalore: "Indiranagar",
            dealbreakers: { diet: "must_not_smoke" },
            relationship_intent: "serious",
            smoking: "no",
            drinking: "yes",
            nightlife: "yes",
            diet: "Eggetarian"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.6 }, SN: { value: 0.7 }, FT: { value: 0.6 }, JP: { value: 0.4 } }, // ENFJ
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { wordplay_puns: { value: 0.7 }, sarcasm: { value: 0.5 } },
                cringe_tolerance: { value: 0.6 },
                offence_tolerance: { value: 0.4 },
                performs_vs_appreciates: { value: 0.4 }
            },
            hobbies: [
                { name: "design", involvement: 0.8 },
                { name: "yoga", involvement: 0.6 }
            ],
            values: {
                career_focused: { value: 0.8 },
                family_oriented: { value: 0.7 },
                risk_taking: { value: 0.5 },
                traditional_modern_score: { value: 0.7 }
            },
            political_lean: { scalar_0_1: { value: 0.7 } },
            attachment: { anxious: { value: 0.4 }, avoidant: { value: 0.3 } }
        },
        relationship_style: { communication_need: { value: 0.8 }, independence_need: { value: 0.5 }, long_term_orientation: { value: 0.9 } }
    },
    {
        id: "f2",
        name: "Meera",
        gender: "Female",
        ml_cluster_id: 1, // South BLR Calm
        facts: {
            name: "Meera",
            age: 25,
            gender: "Female",
            education_tier: 2, // Bachelors
            job_difficulty: 1, // Writer
            income_band: 1,
            current_area_in_bangalore: "Jayanagar",
            dealbreakers: {},
            relationship_intent: "open_to_both",
            smoking: "no",
            drinking: "no",
            nightlife: "no",
            diet: "Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.2 }, SN: { value: 0.9 }, FT: { value: 0.8 }, JP: { value: 0.3 } }, // INFJ
            mbti_matching_prefs: { sn_strict_mode: { value: true } }, // Strict Intuitive
            humour_profile: {
                styles: { wordplay_puns: { value: 0.9 }, dark_morbid: { value: 0.0 } },
                cringe_tolerance: { value: 0.7 },
                offence_tolerance: { value: 0.1 },
                performs_vs_appreciates: { value: 0.3 }
            },
            hobbies: [
                { name: "reading", involvement: 0.9 },
                { name: "poetry", involvement: 0.7 }
            ],
            values: {
                career_focused: { value: 0.5 },
                family_oriented: { value: 0.8 },
                risk_taking: { value: 0.2 },
                traditional_modern_score: { value: 0.4 }
            },
            political_lean: { scalar_0_1: { value: 0.6 } },
            attachment: { anxious: { value: 0.3 }, avoidant: { value: 0.4 } }
        },
        relationship_style: { communication_need: { value: 0.7 }, independence_need: { value: 0.6 }, long_term_orientation: { value: 0.8 } }
    },
    {
        id: "f3",
        name: "Priya",
        gender: "Female",
        ml_cluster_id: 3, // North BLR Corporate
        facts: {
            name: "Priya",
            age: 29,
            gender: "Female",
            education_tier: 3, // MD
            job_difficulty: 3, // Doctor
            income_band: 3,
            current_area_in_bangalore: "Malleshwaram",
            dealbreakers: { diet: "must_be_veg" },
            relationship_intent: "serious",
            smoking: "no",
            drinking: "no",
            nightlife: "no",
            diet: "Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.4 }, SN: { value: 0.3 }, FT: { value: 0.2 }, JP: { value: 0.1 } }, // ISTJ
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { dry_deadpan: { value: 0.6 } },
                cringe_tolerance: { value: 0.2 },
                offence_tolerance: { value: 0.3 },
                performs_vs_appreciates: { value: 0.2 }
            },
            hobbies: [
                { name: "classical_music", involvement: 0.7 },
                { name: "cooking", involvement: 0.8 }
            ],
            values: {
                career_focused: { value: 0.9 },
                family_oriented: { value: 0.9 },
                risk_taking: { value: 0.1 },
                traditional_modern_score: { value: 0.2 }
            },
            political_lean: { scalar_0_1: { value: 0.4 } },
            attachment: { anxious: { value: 0.2 }, avoidant: { value: 0.2 } }
        },
        relationship_style: { communication_need: { value: 0.6 }, independence_need: { value: 0.5 }, long_term_orientation: { value: 1.0 } }
    },
    {
        id: "f4",
        name: "Zoya",
        gender: "Female",
        ml_cluster_id: 0, // Koramangala Startup
        facts: {
            name: "Zoya",
            age: 26,
            gender: "Female",
            education_tier: 2,
            job_difficulty: 2, // Marketing
            income_band: 2,
            current_area_in_bangalore: "Koramangala",
            dealbreakers: {},
            relationship_intent: "casual",
            smoking: "yes",
            drinking: "yes",
            nightlife: "yes",
            diet: "Non-Veg"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.8 }, SN: { value: 0.7 }, FT: { value: 0.5 }, JP: { value: 0.8 } }, // ESFP
            mbti_matching_prefs: { sn_strict_mode: { value: false } },
            humour_profile: {
                styles: { sarcasm: { value: 0.8 }, meta_internet_memes: { value: 0.9 } },
                cringe_tolerance: { value: 0.8 },
                offence_tolerance: { value: 0.7 },
                performs_vs_appreciates: { value: 0.6 }
            },
            hobbies: [
                { name: "dancing", involvement: 0.8 },
                { name: "instagram", involvement: 0.9 }
            ],
            values: {
                career_focused: { value: 0.6 },
                family_oriented: { value: 0.3 },
                risk_taking: { value: 0.8 },
                traditional_modern_score: { value: 0.8 }
            },
            political_lean: { scalar_0_1: { value: 0.8 } },
            attachment: { anxious: { value: 0.6 }, avoidant: { value: 0.4 } }
        },
        relationship_style: { communication_need: { value: 0.8 }, independence_need: { value: 0.7 }, long_term_orientation: { value: 0.4 } }
    },
    {
        id: "f5",
        name: "Riya",
        gender: "Female",
        ml_cluster_id: 2, // Indiranagar Creative
        facts: {
            name: "Riya",
            age: 28,
            gender: "Female",
            education_tier: 3, // PhD
            job_difficulty: 3, // Scientist
            income_band: 2,
            current_area_in_bangalore: "HSR Layout",
            dealbreakers: {},
            relationship_intent: "serious",
            smoking: "no",
            drinking: "yes",
            nightlife: "no",
            diet: "Eggetarian"
        },
        inferences: {
            mbti_axes: { IE: { value: 0.3 }, SN: { value: 0.6 }, FT: { value: 0.2 }, JP: { value: 0.4 } }, // INTJ
            mbti_matching_prefs: { sn_strict_mode: { value: true } }, // Strict Intuitive
            humour_profile: {
                styles: { dark_morbid: { value: 0.9 }, dry_deadpan: { value: 0.8 } },
                cringe_tolerance: { value: 0.4 },
                offence_tolerance: { value: 0.8 },
                performs_vs_appreciates: { value: 0.5 }
            },
            hobbies: [
                { name: "chess", involvement: 0.7 },
                { name: "astronomy", involvement: 0.8 }
            ],
            values: {
                career_focused: { value: 1.0 },
                family_oriented: { value: 0.4 },
                risk_taking: { value: 0.5 },
                traditional_modern_score: { value: 0.6 }
            },
            political_lean: { scalar_0_1: { value: 0.5 } },
            attachment: { anxious: { value: 0.3 }, avoidant: { value: 0.6 } }
        },
        relationship_style: { communication_need: { value: 0.4 }, independence_need: { value: 0.9 }, long_term_orientation: { value: 0.8 } }
    }
];
