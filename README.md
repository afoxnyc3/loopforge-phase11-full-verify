# Todo List App

A simple full-stack Todo List application built with React (Vite) and Express + SQLite.

## Project Structure

```
.
├── client/          # React SPA (Vite)
├── server/          # Express REST API
├── docs/            # Architecture & API contract docs
└── schemas/         # Database schema SQL
```

## Prerequisites

- Node.js >= 18
- npm >= 9

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment (optional)

```bash
cp server/.env.example server/.env
# Edit server/.env if you need non-default ports
```

## Running in Development

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
npm run dev:server
# API available at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
npm run dev:client
# UI available at http://localhost:5173
```

## API Endpoints

| Method | Path              | Description          |
|--------|-------------------|----------------------|
| GET    | /api/todos        | List all todos       |
| POST   | /api/todos        | Create a todo        |
| PATCH  | /api/todos/:id    | Update a todo        |
| DELETE | /api/todos/:id    | Delete a todo        |

See `docs/api-contracts.md` for full request/response shapes.

## Database

SQLite database is auto-created at `server/data/todos.db` on first run. No migration step required.
