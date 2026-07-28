# Healthrizz_app_V2

Expo/React Native rebuild of the Health Rizz kids' app, ported feature-by-feature from `HealthRizz-Mobile` and wired to the same Supabase backend as the web app. See [CLAUDE.md](CLAUDE.md) for how to run it.

## What's shipped

A running log of what each PR added, kept up to date as features land — including bugs found and fixed along the way, since a couple of those were subtle enough to be worth remembering.

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
