# Traject

**Chart your traject to the offer.**

A job search is a pipeline whether you track it like one or not — companies enter, some fall away, a few close as offers. Traject just makes that pipeline visible: drag applications across five stages on a real Kanban board, watch the shape of your search take form on an Insights dashboard, and keep every company's real logo, contacts, and history one click away. Built for anyone who's tired of a spreadsheet pretending to be a CRM.

**Live app:** _add your Vercel URL here_
**Mock API:** _add your Render URL here_

---

## At a glance

| | |
|---|---|
| 📊 **Dashboard** | Your pipeline's vital signs — totals, active count, interviewing, offers — plus a live feed of what you touched most recently |
| 🗂️ **Kanban board** | Drag applications between Wishlist → Applied → Interviewing → Offer → Closed, with an instant undo if a drag goes sideways |
| 🏢 **Company directory** | Every company you've applied to, its real logo, industry, size, and every application logged against it |
| 📈 **Insights dashboard** | Salary ranges, an application-volume timeline, a status breakdown, and a stale-application detector — all computed from your own data, nothing invented |
| 👤 **Profile** | Your name, email, and a custom avatar, stored right in your browser — no account required |
| 🌗 **Dark mode** | A real second theme, not an inverted filter — remembered across reloads |
| ⌨️ **Keyboard accessible** | Every chart is arrow-key navigable, not just mouse-hover |
| 📱 **Mobile-first** | Designed at 375px first, not squeezed in afterward |

## Why

Everyone in this cohort is about to start a job search. Most of that search happens in a spreadsheet that never quite becomes a system. Traject treats it like the pipeline it actually is — the same mental model a CRM uses for deals, applied to the job you're chasing instead of the one you're selling.

## Features

### The board

Five columns, one drag. Moving a card between stages fires an optimistic update — the UI reflects the change instantly, a single PATCH goes out for exactly the card that moved (never the whole column), and if you drag the wrong card, an undo toast puts it right back where it came from. A plain click, no drag, still opens the card's full detail page.

### The dashboard

Four numbers that matter — total applications, active pipeline, interviewing, offers — and a recent-activity feed showing the five applications you touched most recently, company logo and status badge included.

### The company directory

A card grid of every company you've applied to: real logo (pulled from the company's own domain, with an automatic initials fallback if it can't load), industry, headquarters city. Click through to a company's own page to see every application you've logged against them in one place.

### The Insights dashboard

Three tabs, all fed by pure, testable functions — nothing hardcoded, nothing guessed:

- **Salary ranges** — min/max by company, sorted so you can see where the ceiling actually is
- **Application timeline** — volume by month, so you can see whether your search is speeding up or stalling
- **Status breakdown** — a single pie showing what fraction of your pipeline is still moving, closed, or turned into an offer

A quick-insight card at the bottom flags anything that's gone quiet for 10+ days — a nudge to follow up, not just a number.

Deliberately absent: any "+12% vs. last month"-style trend stat. This app's data model has no history to compute a real trend from, and a number that isn't backed by anything is worse than no number at all.

### Profile

Your name, email, and a custom avatar — picked from your own photos, compressed client-side, and stored right in your browser. No account, no login, no password. The Privacy tab says exactly what that means: everything here is local to this browser, nothing syncs to another device, and clearing your browser data clears your profile too. A Display-settings tab is scaffolded in and reserved for a future pass.

This is the one piece of the app that *doesn't* talk to the mock API — there's no user-accounts collection in the backend, so profile data lives in `localStorage` instead. Worth knowing if you're grading or extending this: it's a deliberate architectural choice, not an oversight.

### Dark mode

A genuine second theme — chart colors, borders, and surfaces are re-selected per mode rather than filtered from one palette, so dark mode never reads as "the light version, dimmed." Your choice persists across a hard reload.

### Keyboard accessibility

Every chart on the Insights page supports `role="application"` keyboard navigation — arrow keys move between data points and trigger the same tooltip a mouse hover would. Nothing on this app requires a mouse to explore.

### Mobile-first

Every layout was designed at a 375px viewport first, not adapted afterward. Verified: zero horizontal overflow, stat tiles collapse to two columns, charts stack to one, and the Kanban board scrolls its columns instead of squeezing them.

## Two standout features

1. **Drag-and-drop Kanban with optimistic updates and undo**, built on `@dnd-kit` and backed by `ApplicationsContext` — the app's Context API layer, which also satisfies the course's Context API bonus. Reordering uses fractional ("lexicographic") positioning, the same trick Trello, Linear, and Notion use, so a single drag only ever touches the one card that moved.
2. **An Insights dashboard with zero invented numbers.** Every chart traces back to a pure function in `src/lib/insights.js` — auditable, testable, and honest about what the data does and doesn't support.

## Tech stack

- **React 19** + **Vite 8** + **react-router-dom 7**
- **Mantine 9** — UI components, dark mode, modals, notifications, dates
- **React Final Form** — forms, with a small adapter bridging it to Mantine inputs
- **@dnd-kit** — the Kanban board's drag-and-drop
- **Recharts** — the Insights dashboard
- **json-server 0.17.4** — the mock backend

## Running locally

Clone both repos — this one (`traject`) and the mock API (`traject-api`).

**Backend:**

```bash
cd traject-api
npm install
npx json-server db.json --port 5005
```

**Frontend** (in a separate terminal):

```bash
cd traject
npm install
npm run dev
```

The app expects the API at `http://localhost:5005`.

## Data model

Three collections on the backend, related by id:

- **`companies`** — `id`, `name`, `industry`, `size`, `hqCity`, `website`, `logo`
- **`applications`** — `id`, `companyId` (→ `companies.id`), `role`, `status`, `workMode`, `location`, `salaryMin`/`salaryMax`/`currency`, `source`, `jobUrl`, `appliedDate`, `lastActivityDate`, `priority`, `tags`, `notes`, `order`
- **`interviews`** — `id`, `applicationId` (→ `applications.id`), `round`, `date`, `interviewer`, `format`, `outcome`, `notes`

Applications are read with `companies` expanded (`_expand=company`) and interviews embedded (`_embed=interviews`), so every application already carries its company's name and logo without a second round-trip.

**Profile data is not part of this backend.** It's read and written straight to `localStorage` in the browser — see the Profile section above for why.

## Known gotchas if you deploy this yourself

1. **Render free tier cold start.** The mock API sleeps after ~15 minutes idle; the first request after that can take up to 50 seconds. If you're demoing this live, hit the API a few minutes beforehand to warm it up.
2. **Ephemeral disk on Render.** Writes to `db.json` don't persist across a redeploy or a wake-from-sleep. Fine for a demo/mock API — just don't expect data you added yesterday to still be there after Render restarts the instance.
3. **SPA refresh 404 on Vercel.** A Vite SPA needs a rewrite rule so deep links like `/board` don't 404 on a hard refresh or direct URL visit — add a `vercel.json` with a catch-all rewrite to `/index.html`.
4. **Profile data is per-browser.** It lives in `localStorage`, not the backend — it won't follow you to another device or browser, and clearing site data clears it.

## Project structure

```
src/
  api/            axios calls to the mock backend
  components/     presentational + feature components, grouped by domain
  context/        ApplicationsContext (Context API bonus)
  lib/            pure, framework-free helper functions (insights.js, format.js, validators.js, chartColors.js, imageUtils.js)
  pages/          one component per route
```