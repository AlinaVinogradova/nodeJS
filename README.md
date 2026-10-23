# LeadPulse CRM

A lightweight CRM web application built with **React** and **Node.js / Express.js** with SQLite to log contacted businesses, move them across pipeline stages, and track follow-up reminders.

---

## Features

1. **Authentication**: User sign up and login with JWT and bcrypt.
2. **Lead Management (CRUD)**: Add, edit, and delete business leads (business name, website, contact, notes, follow-up date).
3. **Pipeline Stages**: Move leads through stages: `New`, `Contacted`, `Replied`, `Meeting`, `Won`, `Lost`.
4. **Follow-up Reminders**: Highlight follow-ups due today or overdue with quick reminder filtering.
5. **Search & Filter**: Real-time text search and filter by stage or reminder status.
6. **Dashboard**: Live counts per stage and toggle between Kanban Board and List view.

---

## Project Structure

```text
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPage.jsx    # Sign in & registration form
│   │   │   ├── LeadModal.jsx   # Add / Edit lead modal
│   │   │   ├── PipelineBoard.jsx # Kanban pipeline board
│   │   │   └── LeadList.jsx    # Leads table list view
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state & persistence
│   │   ├── services/
│   │   │   └── api.js          # REST API client
│   │   ├── App.jsx             # Main application layout & dashboard
│   │   ├── index.css           # Styling
│   │   └── main.jsx            # Entry point
│   └── vite.config.js          # Vite config
├── server/                     # Express REST API Backend
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── leads.js            # /api/leads routes
│   ├── app.js                  # Express app setup
│   ├── db.js                   # SQLite database initialization
│   └── index.js                # Server entry point
└── package.json
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Production Build & Run
```bash
npm run build
npm start
```
Open [http://localhost:5000](http://localhost:5000).
