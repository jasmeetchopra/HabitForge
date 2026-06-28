# 🔥 HabitForge

A modern habit-tracking and productivity dashboard built with the **MERN** stack
(MongoDB, Express, React, Node). Create habits, mark them done each day, keep
streaks alive, and watch your consistency grow on a GitHub-style heatmap.

This project is deliberately built **from first principles** — no third-party
auth, no realtime sync, no extra magic — so every piece is small enough to read,
understand, and explain in an interview.

---

## Features

- **Auth** — register, login, logout, JWT in an httpOnly cookie, bcrypt-hashed passwords, protected routes
- **Habits** — full CRUD (create / read / update / delete), daily or weekly frequency
- **Completion tracking** — mark/unmark a habit done per day, one log per day enforced by the database
- **Dashboard** — current streak, completion rate, habits done today, total habits
- **Calendar heatmap** — last 120 days, coloured by how many habits you completed
- **Consistency score** — per-habit `(completed ÷ expected) × 100`, plus an overall average
- **Dark, responsive UI** — mobile-friendly, keyboard-focusable, reduced-motion aware

---

## Tech stack

| Layer    | Tools                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React, Vite, React Router, Axios, Context API, plain CSS    |
| Backend  | Node.js, Express, JWT, bcryptjs                             |
| Database | MongoDB, Mongoose                                           |

---

## Project structure

```
HabitForge/
├── server/
│   ├── config/        # db connection
│   ├── controllers/   # request handlers (auth, habits, dashboard)
│   ├── middleware/    # auth guard, error handler, validators
│   ├── models/        # Mongoose schemas (User, Habit, HabitLog)
│   ├── routes/        # route definitions
│   ├── utils/         # token, async wrapper, date/streak math
│   └── index.js       # server entry point
└── client/
    └── src/
        ├── components/ # reusable UI (HabitCard, Modal, Heatmap, …)
        ├── pages/      # one component per screen
        ├── context/    # AuthContext, HabitContext (global state)
        ├── hooks/      # useAuth, useHabits
        ├── services/   # axios calls grouped by domain
        ├── routes/     # route table, ProtectedRoute, layout
        ├── utils/      # date helpers
        ├── App.jsx
        └── main.jsx
```

---

## Getting started

You need **Node.js 18+** and **MongoDB** (a local install or a free MongoDB
Atlas cluster).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # then edit .env with your values
npm run dev               # starts on http://localhost:5000
```

Fill in `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/habitforge
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts on http://localhost:5173
```

Open **http://localhost:5173**, register an account, and start forging habits.

> In development, Vite proxies every `/api/...` request to the backend on
> port 5000 (see `client/vite.config.js`), so the frontend code never hardcodes
> a host.

---

## API reference

All habit and dashboard routes are **private** (require a valid login cookie).

### Auth
| Method | Route                | Body                          |
| ------ | -------------------- | ----------------------------- |
| POST   | `/api/auth/register` | `{ name, email, password }`   |
| POST   | `/api/auth/login`    | `{ email, password }`         |
| POST   | `/api/auth/logout`   | —                             |
| GET    | `/api/auth/me`       | — (restores session on refresh) |

### Habits
| Method | Route                          | Purpose                  |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/habits`                  | list my habits           |
| GET    | `/api/habits/:id`              | one habit + its logs     |
| POST   | `/api/habits`                  | create                   |
| PUT    | `/api/habits/:id`              | update                   |
| DELETE | `/api/habits/:id`              | delete (and its logs)    |
| POST   | `/api/habits/:id/complete`     | mark done (defaults today) |
| DELETE | `/api/habits/:id/complete`     | unmark                   |

### Dashboard
| Method | Route             | Returns                                  |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/api/dashboard`  | stats + per-habit scores/streaks + heatmap |

---

## Database design

Three collections:

**User** — `{ name, email, password (hashed), createdAt }`
**Habit** — `{ userId, title, description, frequency, createdAt }`
**HabitLog** — `{ habitId, userId, date, completed }`

### Why are `Habit` and `HabitLog` separate collections?

A **habit** is a single, fairly static record — its title, description, and
frequency rarely change. A **completion** is the opposite: it's a stream of
events that grows by one entry every single day you show up. Mixing the two
causes real problems:

1. **Unbounded growth inside a document.** If completions lived in an array
   inside each habit (`completions: [...]`), that document would grow forever.
   MongoDB documents have a 16 MB cap, and large arrays get slow to read and
   update. A separate collection lets the log scale independently.

2. **The database can guarantee "one completion per day".** `HabitLog` has a
   compound **unique index** on `(habitId, date)`. That means even a
   double-click or a buggy request physically *cannot* create two "done" rows
   for the same habit on the same day — the database rejects it. You can't get
   that guarantee from an embedded array.

3. **Queries stay cheap and targeted.** The heatmap and streak math need "all
   completions in a date range." With a dedicated, indexed collection that's a
   single fast query, instead of loading every full habit document just to read
   its dates.

This is the classic **one-to-many** relationship: one habit *has many* logs.
We model it by reference (`habitId` on each log), which is the right call when
the "many" side is large and grows over time.

---

## State management

The app uses the **Context API** with two contexts. The guiding question is
always: *does more than one unrelated component need this, and must they stay in
sync?* If yes → global (Context). If no → local (`useState`).

### `AuthContext` (global)
Holds the logged-in `user`. Lives globally because the navbar, the route guard,
the profile page, and others all read it, and they must all agree on who is
logged in. On first load it calls `/api/auth/me` to restore the session from the
cookie so a page refresh doesn't log you out.

### `HabitContext` (global)
Holds the `habits` list and the add/edit/delete actions. It's global because
both the **Dashboard** and **My Habits** pages read and mutate the same list —
deleting a habit on one page should reflect on the other without a refetch.

### What stays local (`useState`)
- **Form fields** in `HabitForm`, `Login`, `Register` — only that form cares.
- **Modal open/closed** state — only the page showing the modal cares.
- **"Done today" / streak map** on the My Habits page — a view-specific detail.

### Rule of thumb
- `useState` → state owned by one component (inputs, toggles, a page's fetch result).
- **Context** → state shared across many components that would otherwise need
  ugly "prop drilling" through layers that don't care about it.

---

## How streaks & consistency are calculated

- **Current streak** — count back from today across consecutive completed days.
  An unfinished *today* doesn't break the streak (we start from yesterday if
  today isn't done yet).
- **Longest streak** — the longest run of consecutive days ever completed.
- **Consistency score** — `completedDays ÷ expectedDays × 100`, capped at 100.
  `expectedDays` = days since the habit was created (or weeks, for weekly
  habits). **Overall consistency** is the average of every habit's score.

All "day" comparisons use a plain `YYYY-MM-DD` string so time zones never cause
off-by-one bugs.

---

## Notes & possible extensions

Kept intentionally out of scope to stay beginner-friendly: realtime sync,
notifications, OAuth, Redis, websockets. Natural next steps if you want to grow
it: pagination on logs, habit categories/tags, editable completion dates on the
heatmap, and unit tests for the streak utilities.

---

# Extended features (phases 1–4)

The base app above was extended with auth hardening, recurring schedules, a
todos module, a navigation redesign, and an analytics dashboard. Summary below.

## New npm packages
- `server`: **nodemailer** (forgot-password emails)
- `client`: **recharts** (bar / line / pie charts)

## New .env variables (server)
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`. If SMTP is left
blank in development, password-reset links are printed to the server console so
the flow is fully testable without a mail server. `CLIENT_URL` (already present)
is reused to build the reset link.

## Migrations
**None.** Every new field is additive and optional:
- `User`: `resetPasswordToken`, `resetPasswordExpire` (both `select:false`)
- `Habit`: `frequency` now allows `custom`, plus `daysOfWeek:[0-6]` and `interval`
  (existing habits default to `daily` and behave exactly as before)
- `Todo`: brand-new collection

## New / changed API routes
```
# Auth (Phase 1)
POST   /api/auth/forgot-password        { email }            public
POST   /api/auth/reset-password/:token  { password }         public
PUT    /api/auth/change-password        { currentPassword, newPassword }  private

# Todos (Phase 3)
GET    /api/todos                                             private
POST   /api/todos      { title, description?, priority?, dueDate? }       private
PUT    /api/todos/:id  (also toggles `completed`)             private
DELETE /api/todos/:id                                         private

# Analytics (Phase 4)
GET    /api/analytics            summary, weekly, monthly, byHabit, missed,
                                 todoStats, 365-day heatmap   private
GET    /api/analytics/day/:date  completed/missed habits + completed todos  private
```

## Recurrence model (Phase 2)
`isScheduledOn(habit, date)` in `server/utils/schedule.js` is the single source
of truth for the Today filter, streaks, and consistency:
- `daily` → every day
- `weekly` → specific weekday(s) in `daysOfWeek` (defaults to the creation
  weekday if none chosen)
- `custom` → specific weekdays, or "every N days" via `interval`

Streaks count **only scheduled days**: missing a non-scheduled day cannot break a
streak; missing a scheduled day does. Consistency uses scheduled days as the
denominator, so the score is fair across recurrence types.

## Navigation (Phase 3)
The sidebar was removed in favour of a top nav (`TopNav` in
`components/Navigation.jsx`): logo + Dashboard / Habits / Todos, with the avatar
and username forming one clickable link to `/profile`. "New Habit" was removed
from navigation; the add-habit button lives on the Habits page.

## Dashboard / analytics (Phase 4)
The dashboard is composed from reusable widgets: stat cards, quick-add habit/todo,
today's habits (recurrence-filtered) and today's todos, an "at a glance" insights
card, a today pie chart, a per-habit consistency bar chart, a 30-day trend line
chart, and a 365-day heatmap whose cells open a day-detail modal
(completed habits / missed habits / todos completed).

## Security & edge cases (auth)
- Only the **SHA-256 hash** of the reset token is stored; the raw token lives only
  in the emailed link. Tokens expire in 15 minutes, are single-use (cleared on
  success), and a new request invalidates older links.
- `forgot-password` is **anti-enumeration**: identical response for known and
  unknown emails.
- `change-password` re-fetches the user **with** the password field (the `protect`
  middleware strips it) before verifying, and both reset and change reject reusing
  the current password.

## Avoiding the `next is not a function` regression
The single `pre('save')` hook in `User.js` is unchanged and declares `next`
(arity ≥ 1, which is what makes Mongoose pass the callback). **No new pre-save
hooks were added** — register, reset, and change-password all route through
`user.save()` to reuse that one correct hook. `createPasswordResetToken` is a
plain instance method that never touches `next`.

## Testing checklist (extended)
- Forgot → reset link in console → reset → login with new password; reused/expired
  link rejected; resetting to the old password rejected.
- Change password: wrong current → 401; same-as-current → 400; success re-login.
- Create habits with daily / Mon-Wed-Fri / every-2-days schedules; confirm only
  scheduled habits appear under "Today's habits"; confirm a missed off-day doesn't
  break the streak.
- Todos: create/edit/delete, toggle complete, filter All/Pending/Completed/Overdue,
  sort by due date and priority.
- Dashboard: charts render, heatmap spans a year, clicking a day shows its detail.
