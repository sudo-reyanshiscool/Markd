# Markd

Markd is a React + Vite student organiser for subjects, deadlines, tasks, exams, past papers, goals, activities, portfolio tracking, calendar-feed imports, and an AI study assistant.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`.

3. Create a Supabase project and add these env vars:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

4. In Supabase SQL Editor, run [supabase/schema.sql](/Users/rg/my-app/supabase/schema.sql).

5. For free local AI, install [Ollama](https://ollama.com/) and pull a Gemma 4 model:

```bash
ollama pull gemma4
```

6. Keep Ollama running, then start the app:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Auth and saved data use Supabase, so the same account works across devices and browsers.
- If a user signs in with the same email they used before the cloud upgrade, old local browser data is imported the first time that cloud workspace is still empty.
- Teams sync still requires a separate backend via `VITE_API_URL`.
- Calendar import expects a published feed URL. For `calendar.online` / `kalender.digital`, open the school link, use the top-right options menu, choose `Export as Calendar Feed`, then paste the first link into the app.
- The AI assistant prefers a local Ollama server through [api/ai.js](/Users/rg/my-app/api/ai.js).
- By default the server looks for Ollama at `http://127.0.0.1:11434` and uses `OLLAMA_MODEL=gemma4`.
- If you later want a hosted fallback, the proxy can still use `GEMINI_API_KEY`, but it is optional.
- Vercel cannot use your laptop's local Ollama server. If you deploy the app and want AI online there, `OLLAMA_BASE_URL` must point to a publicly reachable Ollama machine or another hosted inference endpoint.
