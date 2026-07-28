# Healthrizz_app_V2

Expo/React Native rebuild of the Health Rizz kids' app, ported feature-by-feature from `HealthRizz-Mobile` and wired to the same Supabase backend as the web app. See [CLAUDE.md](CLAUDE.md) for how to run it.

## Known dev-environment gotcha: "Unable to resolve data for blob"

If every Supabase call suddenly starts failing — habit toggles do nothing, screens load with everything blank/zeroed, Metro logs show a wall of `WARN ... Error: Unable to resolve data for blob: <uuid>` — this is **not an app bug**. It's RN 0.81's new-architecture `Blob` registry (used internally by `fetch`/`XMLHttpRequest`) getting corrupted in the running dev-client process.

**Trigger:** a Fast Refresh that lands while a component is mid-crash or a network request is in flight — e.g. editing a file and leaving behind a stale reference (a `ReferenceError` in the Metro log right before the blob spam starts is the tell). Once it happens, no in-app reload fixes it — every `fetch` from that process is broken until the whole app process dies.

**Fix** — a real process restart, not just Cmd+R:
```bash
# 1. Kill Metro
ps aux | grep "expo start" | grep -v grep   # find the PID
kill <pid>

# 2. Restart with a cleared cache
npx expo start --dev-client --clear

# 3. Fully terminate + relaunch the app (not a JS-only reload)
xcrun simctl terminate booted org.healthrizz.app
xcrun simctl launch booted org.healthrizz.app
```
Confirm it's fixed by checking Metro's log has no more blob warnings after the relaunch, then re-test the screen that was broken.

## Supabase tables

Every table this app actually reads or writes, kept in sync with the code (not the webapp's migration files, which have been found to describe columns that don't really exist — see the `child_map_progress` note below). `auth.users` is Supabase Auth itself, managed via `supabase.auth.*` in `stores/authStore.ts` — not a custom table, but the actual source of the session/identity everything else hangs off of.

| Table | Columns actually used | Written by | Read by |
|---|---|---|---|
| `profiles` | `id`, `email` | `ensureProfile()` in `stores/authStore.ts` — upserted on every `SIGNED_IN` event, since no DB trigger creates this row automatically | — (not read anywhere yet) |
| `children` | `id`, `parent_id`, `nickname`, `primary_persona`, `secondary_persona`, `active_goals` | `app/onboarding/persona.tsx` — one row created once, at the end of onboarding | `stores/authStore.ts`'s `syncChildId` (id/parent_id, re-derives `childId` on every sign-in); `core/habits/api.ts`'s `fetchActiveGoals` (active_goals, drives the "My Goal" badge); `core/profile/api.ts`'s `fetchChildSummary` (nickname/primary_persona) |
| `child_map_progress` | `child_id`, `node_id`, `completed_at`, `stars_earned` | `completeNode()` in `core/map/progress.ts` — called from the lesson/quiz/game completion screens | `fetchNodeCompletion()` — used by the submap screen (node lock state), the Recipes tab (island-recipe unlock), and the Profile tab (Islands Completed badges) |
| `habit_tracking` | `child_id`, `habit_type`, `tracked_date`, `completed` | `setHabit()` in `core/habits/api.ts` — upserted on every toggle from the Habits tab | `fetchTodayHabits()` / `fetchHabitLogs()`, both in `core/habits/api.ts`, both only consumed by the Habits tab |

**Known schema gaps** (checked against the live REST schema directly, not the webapp's migration files):
- `child_map_progress`'s migration file describes `xp_earned`/`started_at`/`is_practice`/`practice_count` columns that don't actually exist on the live table (found in #3) — the write payload already excludes them. Its `node_id` also has a real FK to `map_nodes`, which is empty except for two hand-inserted rows for Splash Springs — every other topic's node id never matches a row, so their completion checks always come back empty (i.e. permanently locked, by design until those islands ship).
- `children` genuinely has `avatar_url`/`stars_earned`/`current_streak`/`longest_streak`/`last_activity_date` columns (schema matches the full `ChildProfile` type this time) — but nothing in the codebase writes to any of them, confirmed by a full-repo grep (found in #6). They'd only ever show stale defaults if read, so nothing reads them.
- The Recipes tab (`core/recipes/api.ts`) doesn't touch Supabase at all beyond the shared `fetchNodeCompletion` check above — its recipe data is static fixtures, not a DB table.

## What's shipped

A running log of what each PR added, kept up to date as features land — including bugs found and fixed along the way, since a couple of those were subtle enough to be worth remembering.

### [#7 — Fix: log out now redirects to login instead of leaving user stuck](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/7)
- **Bug found and fixed:** `signOut()` correctly cleared the Supabase session, but `app/(tabs)/_layout.tsx` never checked session state the way `app/index.tsx` and `login.tsx` already do — so logging out from Profile just left the same tab screen up with a cleared session underneath. Added the same session-based `Redirect` guard to the tabs layout. Verified live end-to-end: fresh signup → onboarding → log out (immediate redirect to login) → log back in (session + child correctly re-synced, straight to the map).

### [#6 — Populate Profile tab: islands completed, real account info](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/6)
- Header with child nickname + persona badge (`children.primary_persona`, set once at onboarding); "Islands Completed" progress bar + a badge per island, unlocked via the same `child_map_progress` completion check the submap and Recipes tab use; existing account/logout section restyled to match. There's no dedicated "Profile" screen in `HealthRizz-Mobile` — its closest analog is the Progress tab — so this merges that content into the existing tab rather than replacing it.
- A "Streak Stickers" section (per-habit pips) was included in an earlier revision, then removed on request since the Habits tab already shows the same data.
- **Supabase check:** confirmed the live `children` table genuinely has `stars_earned`/`current_streak`/`longest_streak`/`avatar_url` columns (schema matches the type this time, unlike `child_map_progress` in #3) — but a full-codebase grep found nothing ever writes to them, so they'd only ever show stale zeros. Left them out; `nickname`/`primary_persona` are real (written at onboarding) and safe to use.
- Confirmed no false-positive completion path: `completeNode('${topicKey}-game', ...)` only fires if the game was actually passed, and the submap gates Play behind Practice behind Learn.
- Intentionally left out (needs new infra this app doesn't have): the milestone/badge-earning system and the streak-freeze warning banner from upstream's Progress screen.

### [#5 — Populate Recipes tab: island + bonus recipes, gated by map completion](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/5)
- All 9 island recipes (one per island, e.g. Health Rizz Soda for Splash Springs) + 8 bonus recipes from the Kids Recipe Book, with All/Island/Bonus/Unlocked filter chips. Ported from `HealthRizz-Mobile`'s `RecipeExplorer`/recipe-detail screens.
- Unlock rule: bonus recipes are always available (no coin economy exists in this app); an island recipe unlocks the moment that island's game node is completed, reusing the same `child_map_progress` completion check the submap screen already uses. Only Splash Springs is playable today, so only Health Rizz Soda can actually unlock — the other 8 stay locked until their islands ship.
- Intentionally dropped from the upstream version: bundled recipe artwork (source SVGs are multi-MB raster exports, not worth bundling yet — cards use an emoji hero instead) and the coin-purchase unlock flow (this app has no spendable currency wired up).
- **Bug found and fixed:** the horizontal filter-chip row clipped the last chip flush at the screen edge with no visual cue it scrolled, making counts/labels look cut off. Ported the fade-edge `LinearGradient` fix already validated on `HealthRizz-Mobile`'s `feat/onboarding-quiz-habit-scoring` branch instead of re-solving it from scratch.

### [#4 — Add habit tracking: daily toggles, streaks, and history calendar](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/4)
- Hydro/Phyto/Pro Rizzler daily-toggle cards on the Habits tab, backed by `habit_tracking` in Supabase (upsert on `child_id, habit_type, tracked_date`).
- Streak pips (fill up to 5, cap there) and a "⭐ My Goal" badge pulled from the child's `active_goals` chosen during onboarding.
- 60-day history: monthly calendar with a colored dot per completed habit per day, tap a day for a read-only detail panel.
- Client-side streak/longest-streak/total-days math from the flat log array — no server-side aggregation.
- **Bugs found and fixed:**
  - *Silent write failures* — `setHabit()` swallowed Supabase errors and the UI applied its optimistic toggle regardless, so a failed write silently desynced from the server. It now returns a success boolean and the toggle rolls back (+ haptic error) on failure.
  - *UTC/local date mismatch* — `todayDate()` used UTC while the calendar and streak math used local date parts, so a toggle made late in the evening could land under tomorrow's date and never show up on today's calendar cell. Unified on the local-date helper.

### [#3 — Home map, tabs, Splash Springs content, and progress tracking](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/3)
- Real home/map screen (pinch/pan overworld, pulsing current-island glow) and the 4-tab bar (Map, Recipes, Habits, Profile), replacing the placeholder home.
- Splash Springs fully built out end to end — Learn (ported slide player, 12 slides + micro-checks + read-aloud), Practice (ported quiz, pass/fail gated), Play (Quiz Battle mini-game) — each node sequentially unlocked. Other 8 islands intentionally left "coming soon" until this one pipeline was proven.
- Real Supabase-backed progress: a `children` row is created at onboarding completion, `authStore` re-derives it on every sign-in so a returning account doesn't silently re-onboard, and lesson/quiz/game completion writes to `child_map_progress`.
- **Bugs found and fixed:**
  - `child_map_progress` doesn't actually have the `xp_earned`/`started_at`/`is_practice`/`practice_count` columns the webapp's migration file describes — an earlier `CREATE TABLE IF NOT EXISTS` had been a no-op. Dropped the missing columns from the write payload.
  - `child_map_progress.node_id` has a real FK to `map_nodes`, which was completely empty in production (the webapp's own seed script never successfully populated it). Inserted real `map_nodes` rows for Splash Springs by hand, following the seed script's own id convention.

### [#2 — Port onboarding flow, gated to first-time signups (local-only)](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/2)
- Full onboarding ported from HealthRizz-Mobile: privacy welcome → COPPA consent → age → nickname/companion → quiz → persona reveal, including persona-matching logic and brand UI.
- Trimmed to end at the persona reveal — goal-picking and its backend writes were deferred as out of scope for this build.
- Onboarding completion tracked with a local, device-only flag at this stage (made account-aware in #3 once real backend persistence existed).
- **Bug found and fixed:** a fresh signup could skip onboarding entirely because the local completion flag was device-scoped, not account-scoped, so a previous account's completion carried over onto a new one. `signUp()` now resets the flag for every new account.

### [#1 — Add Supabase login/sign-up flow and brand styling](https://github.com/rayyan-netizen/Healthrizz_app_V2/pull/1)
- Real Supabase Auth email/password login and sign-up, with session-aware routing (`/` → `/login` when logged out and back when logged in).
- Sign-up upserts a `profiles` row client-side, since no DB trigger creates one automatically.
- Ported the real brand palette and fonts from `HealthRizz-Mobile`'s theme into `tailwind.config.js` and restyled login/home to match.
