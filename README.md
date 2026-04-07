# Markd

Markd is a React + Vite student organiser for subjects, deadlines, tasks, exams, past papers, goals, activities, portfolio tracking, calendar-feed imports, and an AI study assistant.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`.

3. Create a Supabase project and add:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

4. In Supabase SQL Editor, run [supabase/schema.sql](/Users/rg/my-app/supabase/schema.sql).

5. Add a Google AI Studio API key if you want the AI assistant:

```env
GEMINI_API_KEY=...
```

Optional:

```env
GEMMA_MODEL=gemma-4-31b-it
```

6. Start the app:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Auth and saved data now use Supabase instead of browser-only app storage.
- Existing local browser data is imported automatically the first time a matching user signs in with the same email and the cloud workspace is still empty.
- Teams sync still requires a separate backend via `VITE_API_URL`.
- Calendar import expects a published feed URL. For `calendar.online` / `kalender.digital`, open the school link, use the top-right options menu, choose `Export as Calendar Feed`, then paste the first link into the app.
- The AI assistant uses hosted Gemma through the Google Gemini API proxy in [api/ai.js](/Users/rg/my-app/api/ai.js).
