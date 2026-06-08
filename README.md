<div align="center">
  <h1>Twin</h1>
  <p>Your AI-powered fitness companion — track, train, and improve together.</p>
  <a href="https://twin-l3hf.vercel.app">Live App</a> · <a href="#getting-started">Get Started</a> · <a href="#tech-stack">Tech Stack</a>
</div>

---

## What is Twin?

Twin is a mobile-first fitness app that combines calorie tracking, workout logging, goal setting, and social accountability — with **Kai**, an AI fitness assistant, at the center of it all.

Whether you're cutting, bulking, or just trying to stay consistent, Twin gives you the tools to track your progress and the intelligence to understand it.

---

## Features

### 🔥 Calorie & Macros Tracker
Log your daily meals and track calories, protein, carbs, and fat in real time. Set custom targets and see exactly how much you have left for the day.

### 🏋️ Workout Planner & Logger
Plan your workouts by muscle group, log every set and rep, and keep a full history of every session.

### 📊 Progress Analytics
Visualise your PR and average performance over time with per-exercise charts. Track nutrition trends across days with macro and calorie history graphs.

### ✅ Daily Tasks & Long-term Goals
Set daily habits and longer-term goals. Check them off as you go and stay on track with what matters.

### 📝 Notes
A personal notes section — jot down anything from meal plans to training thoughts.

### 👥 Friends & Social Accountability
Search and add friends, view their daily macro intake and calorie progress, and message them directly. Stay accountable together.

### 🤖 Kai — AI Fitness Assistant
Kai is a RAG-powered AI assistant with deep knowledge of fitness, nutrition, and training. Ask about macros for a specific food, get a meal plan for a cut, or ask anything training-related. Kai knows your food log and context, so answers are relevant to *you*.

---

## Screenshots

| Home | Progress | Kai |
|------|----------|-----|
| Calorie ring, macro bars, daily tasks | PR & avg analytics by exercise | Chat with real-time nutrition data |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Auth | better-auth |
| Database | MongoDB |
| Query Builder | Kysely |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/sufiyan733/twin.git
cd twin

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your MongoDB URI, better-auth secret, and AI API key

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on a mobile viewport (or use DevTools device mode at 390px).

> **Note:** Twin is designed exclusively for mobile. It will not render correctly on desktop browsers without device emulation.

---

## Project Structure

```
app/          # Routes and layouts (Next.js App Router)
lib/          # Auth config, DB client, shared utilities
public/       # Static assets
```

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request

Please run `npm run lint` and fix all errors before submitting.

---

<div align="center">
  Built with 🤍 by <a href="https://github.com/sufiyan733">sufiyan733</a>
</div>