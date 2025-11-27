# Wavelength (Bengaluru Edition)

**An Agentic Matchmaking System for the Silicon Valley of India.**

Wavelength is a project exploring the future of dating apps using **Agentic LLMs** and **Psychometric Profiling**. Instead of static forms, it uses an AI agent to build a dynamic, evolving profile of the user based on natural conversation, and uses this deep understanding to perform highly nuanced compatibility matching.

## Project Structure

The project is divided into three main layers:

### 1. Data Layer (The Schema)
The foundation of the system is the **User Profile V1.1**.
*   **Description**: [generated_user_data_schema_description.md](generated_user_data_schema_description.md)
*   **Key Features**:
    *   Dynamic `inferences` derived from `events`.
    *   Rich psychometrics: MBTI, Humour Profile, Attachment Style.
    *   Bengaluru-specific context (Location clusters, Tech/Startup culture).

### 2. Logic Layer (The Matcher)
A heuristic-based compatibility engine that mimics human intuition.
*   **Description**: [generated_baseline_matching_description.md](generated_baseline_matching_description.md)
*   **Implementation**: `js/baseline_matcher.js`
*   **Key Features**:
    *   Asymmetric scoring (Male vs Female priorities).
    *   Hard filters for dealbreakers and personality clashes.
    *   Nuanced scoring for Humour and Values.

### 3. Presentation Layer (The UI)
Interactive web visualizations to demonstrate the concepts.
*   **Schema Documentation**: `schema.html` - A developer-facing browser for the V1.1 schema.
*   **Matching Demo**: `matching_demo.html` - A live playground to test the matching algorithm on a diverse mock population of 10 Bengaluru users.
*   **Concept Landing**: `index.html` - A visual storytelling experience explaining the "Neural Love Vector" concept.

## Getting Started

1.  **Explore the Schema**: Open `schema.html` to see the data structure.
2.  **Try the Matcher**: Click "Try Matching Demo" in the schema view (or open `matching_demo.html`) to see the algorithm in action.
3.  **View the Code**: Check `js/baseline_matcher.js` for the scoring logic and `js/demo_population.js` for the mock data.

## Current Status
*   ✅ **Schema V1.1**: Fully defined and documented.
*   ✅ **Baseline Matcher**: Implemented and verified.
*   ✅ **Interactive Demo**: Live with 10 diverse user profiles.
