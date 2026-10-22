# LeadPulse CRM - Contact & Pipeline Management Web Application

A full-stack CRM web application built with **React** and **Node.js / Express.js** to log contacted businesses, advance them across sales stages, and schedule timely follow-up reminders.

---

## Key Features

1. **Authentication & User Management**
   - User Registration & Login with JWT authentication and bcrypt password hashing.
   - Isolated multi-tenant data per user.

2. **Lead Directory & Management (CRUD)**
   - Add new business leads with detailed records:
     - **Business Name** (required)
     - **Website** (with clickable external link)
     - **Primary Contact Details** (Name, Email, Phone with direct mailto/tel actions)
     - **Pipeline Stage**
     - **Follow-up Reminder Date**
     - **Notes & Interaction History**
   - Inline editing, modal updates, and deletion.

3. **Pipeline Stages & Kanban Board**
   - Interactive Kanban board organizing leads across stages:
     - `New` &rarr; `Contacted` &rarr; `Replied` &rarr; `Meeting` &rarr; `Won` &rarr; `Lost`
   - Drag-and-drop card movements and one-click stage advancement.

4. **Follow-up Reminders & Alerts**
   - Automated categorization of follow-up dates into **Overdue**, **Due Today**, and **Upcoming**.
   - Visual urgency indicators and persistent navbar badge counter.
   - Dedicated Follow-up Command Center view for quick outreach.

5. **Search & Multi-Filter Directory**
   - Instant search across business names, websites, contact names, emails, phone numbers, and notes.
   - Filter by stage (`New`, `Contacted`, `Replied`, `Meeting`, `Won`, `Lost`).
   - Filter by reminder status (`Overdue`, `Due Today`, `Upcoming`, `No Date`).
   - Sort by creation date, business name (A-Z / Z-A), or follow-up date.

6. **Executive Analytics Dashboard**
   - Total active pipeline leads and closed deals.
   - Real-time counts and percentage distributions for each stage.
   - Win Rate (%) calculations based on won vs. lost deals.
   - Interactive stage cards that link directly to filtered lead lists.
   - Visual pipeline conversion funnel.

---

## Tech Stack

- **Backend**: Node.js, Express.js 5, better-sqlite3 (SQLite database with WAL mode), JWT, bcryptjs, cors.
- **Frontend**: React 19, Vite, Lucide React icons, CSS design system with custom properties.
- **Testing**: Node.js test runner (`node --test`), Supertest.

---

## Project Structure

```text
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── AuthPage.jsx    # Sign in & Registration
│   │   │   ├── Dashboard.jsx   # Metrics & stage counts
│   │   │   ├── LeadList.jsx    # Search, filter & table view
│   │   │   ├── LeadModal.jsx   # Add/Edit lead modal
│   │   │   ├── Navbar.jsx      # Navigation & reminder badges
│   │   │   ├── PipelineBoard.jsx # Kanban pipeline workflow
│   │   │   └── RemindersPanel.jsx # Follow-up reminder center
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── services/
│   │   │   └── api.js          # REST API client
│   │   ├── App.jsx             # Main Application root
│   │   ├── index.css           # Styling system & theme
│   │   └── main.jsx            # React root entry
│   └── vite.config.js          # Vite config with API proxy
├── server/                     # Express REST API Backend
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── leads.js            # /api/leads routes
│   ├── app.js                  # Express app setup & SPA serving
│   ├── db.js                   # SQLite database initialization
│   └── index.js                # Server entry point
├── tests/
│   └── api.test.js             # Automated API integration tests
└── package.json                # Project scripts and dependencies
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Development Mode
Run both backend API (port 5000) and frontend development server (port 3000) simultaneously:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Execution
```bash
npm run build
npm start
```
Open [http://localhost:5000](http://localhost:5000).

### 4. Running Automated Tests
```bash
npm test
```

---

## REST API Summary

### Authentication
- `POST /api/auth/register` - Create user account (returns JWT token and user info)
- `POST /api/auth/login` - Authenticate user (returns JWT token)
- `GET /api/auth/me` - Retrieve authenticated user profile

### Leads & Analytics
- `GET /api/leads` - List leads (supports `q`, `stage`, `reminder`, `sort` query params)
- `GET /api/leads/:id` - Retrieve single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update existing lead
- `PATCH /api/leads/:id/stage` - Quick update lead pipeline stage
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/dashboard` - Get pipeline stage counts, win rate, and reminder statistics
- `GET /api/leads/reminders` - Get leads categorized into overdue, today, and upcoming follow-ups
