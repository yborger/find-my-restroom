# 🚽 Find My Restroom

> **A note on this project:** This app is an experiment in using AI to develop a production-scale web application from scratch. Every line of code, every architectural decision, every database schema, and every deployment step was generated and guided by AI (Claude by Anthropic), with a human in the driver's seat providing direction, product vision, and real-world debugging. It was built as a hands-on exploration of where AI-assisted development genuinely excels — and where it still falls short.

---

## 🤖 What We Learned About Building With AI

### Strengths
- **Speed** — The whole app took about 2.5 hours start to finish. A full-stack application with auth, a live database, geo-search, and a recommendation engine — deployed — in an afternoon. The output at each step was near-instant.
- **Breadth of knowledge** — No documentation, no Stack Overflow, no "let me check the syntax for that." The AI knew every layer of the stack simultaneously and just used it correctly.
- **Boilerplate and fixes** — Structural code got written fast, and when something was off it got corrected almost as quickly as it was written. The feedback loop was quick.
- **Decision support** — When there was a choice to make (like for the tech stack) the AI laid out the trade-offs clearly and made a recommendation for the specific project. No extra research required.

### Weaknesses
- **Lack of customization** — The AI can build what you describe, but it has no instinct for user flows or product feel. Every interaction and pathway had to be spelled out explicitly. If you didn't specify it, it didn't exist.
- **Blind to what didn't work** — The AI only knows what it's told. It has no visibility into what actually broke, what rendered wrong, or what quietly didn't ship. Catching that gap was entirely on the human side.
- **Brute-force debugging** — When a bug came up, the AI was confident it knew the fix and would just keep trying variations. There were moments of running the same thing 8 times on a problem that turned out to be pretty simple. Confidence doesn't always equal correctness.
- **Context drift** — In a long session, the AI had to actively re-check prior decisions every time it touched a new file to avoid contradicting itself. It doesn't just passively hold the whole project in mind.
- **The UI is flat** — This one is pretty visible in the final product. It works, but it looks like AI built it. Every element is a rounded block. It's clean, it's correct, and it's a little visually sad. That design instinct doesn't come standard.

---

## 📍 About the App

**Find My Restroom** is a public restroom finder and community rating app. Tell it how urgently you need to go, set your preferences, and it recommends the best nearby option — factoring in cleanliness ratings, distance, accessibility, and whether you need to buy something or find a code to get in.

Built as a demo MVP. Real data sourced from the [Refuge Restrooms](https://www.refugerestrooms.org) open dataset.

---

## Features

- 🗺️ Interactive dark map (Leaflet + OpenStreetMap) with color-coded cleanliness pins
- 📍 Recommendation engine weighted by urgency, distance, cleanliness, and access type
- ⭐ Community cleanliness ratings (1–5 stars)
- 💬 User reviews and comments per restroom
- ♿ Accessibility filter
- 🔐 Guest browsing, account sign-up to rate and review
- ➕ Community restroom submissions (pending moderation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth |
| Map | Leaflet + react-leaflet + OpenStreetMap |
| Deployment | Vercel |

---

## Data Source

Restroom data seeded from the [Refuge Restrooms API](https://www.refugerestrooms.org/api/docs/) — an open, community-maintained dataset of safe and accessible restrooms. All seeded entries are marked as `access_type: free`. Additional community submissions can be added through the app and are reviewed before appearing on the map.

---

## License

MIT
