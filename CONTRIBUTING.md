# Contributing to ClashJudge

Thank you for your interest in contributing to **ClashJudge**! We welcome contributions ranging from adding new coding problems and optimizing judge heuristics to improving duel real-time sync and UI responsiveness.

---

## 🌟 Code of Conduct

We expect all contributors to maintain a respectful, inclusive, and collaborative environment. Be kind and constructive in issues and pull requests.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0+ or v20+
- **MongoDB**: v6.0+ running locally on port `27017` or a MongoDB Atlas connection URI
- **Package Manager**: `npm`

### 2. Fork & Clone
```bash
git clone https://github.com/your-username/clashjudge.git
cd clashjudge
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the necessary API keys (`GROQ_API_KEY`, `ONLINECOMPILER_API_KEY`, `AUTH_SECRET`).

### 5. Seed Problem Database
Populate your local database with curated benchmark problems:
```bash
npx tsx scripts/seed.ts
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Adding New Problems

Problems are structured in `src/models/Question.ts` and can be seeded via `scripts/seed.ts` or created dynamically through the `/admin` problem studio.

Each problem should include:
- `title`, `slug`, `description` (Markdown supported)
- `difficulty`: `Very Easy` | `Easy` | `Medium` | `Hard`
- `category`: e.g. `Strings`, `Arrays`, `Algorithms`, `Math`, `Dynamic Programming`
- `tags`: Array of string search tags
- `starterCode`: Python, JavaScript, C++, C, Java starter templates
- `testCases`: Array of `{ input: string, expectedOutput: string, isHidden: boolean }` with at least 2 public and 3 hidden test cases.

---

## 🛠 Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names like `feat/duel-spectator-mode` or `fix/editor-timer-sync`.
2. **Type Safety**: Ensure TypeScript compiles cleanly:
   ```bash
   npx tsc --noEmit
   ```
3. **Build Check**: Ensure production builds succeed without warnings:
   ```bash
   npm run build
   ```
4. **Descriptive PRs**: Provide context, screenshots/GIFs for UI changes, and test instructions in your PR description.

---

## 📬 Reporting Bugs & Feedback
Please open an issue on GitHub with reproduction steps, system specifications, and browser console/server logs if applicable.
