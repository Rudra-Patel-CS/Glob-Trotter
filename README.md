# GlobeTrotter — Smart Multi-City Travel Planner

GlobeTrotter is a personalized multi-city travel planning platform built with **React**, **Vite**, **Tailwind CSS**, **Supabase**, and **Google Gemini AI**.

---

## 🌟 Core Features

1. **Authentication & User Management**: Login, Sign-up, Profile editing, and Saved Destinations.
2. **Multi-City Itinerary Builder**: Reorder city stops, add activities, and track live running totals.
3. **Budget Engine & Recharts Analytics**: Category Donut Chart, Daily Spend Bar Chart, overbudget alerts, and line-item management.
4. **Interactive Leaflet Map View**: Interactive OpenStreetMap visualization plotting city stop markers and connecting route polylines.
5. **Route Optimization**: Distance calculator (Haversine formula) comparing current stop order vs. nearest-neighbor sequence.
6. **Weather-Aware Suggestions**: Open-Meteo weather forecasts integrated per day cell with rain warnings for outdoor activities.
7. **Public Sharing & Cloning**: Shared trip URLs with one-click "Copy This Trip to My Account" functionality.

---

## ✨ Phase 2 AI Features

- **AI Trip Generator (`/trips/ai-generate`)**: Generates custom day-by-day JSON itineraries powered by `@google/generative-ai` (Gemini) based on selected destinations, budget, duration, and travel style.
- **AI Budget Optimizer (`/trips/budget`)**: Analyzes trip expenses and produces actionable cost-saving recommendations with one-click discounts.
- **AI Travel Assistant (Floating Chat)**: Trip-aware chatbot available on itinerary pages.
- **Travel Personality Quiz**: Custom interest tag quiz integrated into the trip creation wizard.
- **Toast Action Feedback**: Real-time notifications for all mutations via `react-hot-toast`.

---

## 🚀 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your **Google Gemini API Key**:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. (Optional) Set your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

---

## 💻 Running Locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
