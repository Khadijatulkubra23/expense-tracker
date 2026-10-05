# Spendly: Expense Tracker

A full-stack expense tracker with an analytics dashboard. Track income and expenses, set category budgets, spot spending patterns, and import or export your data.


## Features

- Add, edit, and delete transactions, with undo after deleting
- Search, filter (type, category, month), and sort the transaction list
- Monthly summary with month-over-month change and a real balance trend
- Charts: income vs expenses (last 6 months) and spending by category
- Insights: top category, biggest expense, daily average, month-end projection
- Daily spending heatmap with click-through day details
- Per-category monthly budgets with progress bars (warning at 80%, over at 100%)
- CSV export, and CSV import with row validation and preview
- Light and dark themes, responsive layout down to mobile


## Tech Stack

- **Frontend:** React, Vite, Recharts, plain CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** SQLite

## Getting Started

You need Python 3.10+ and Node.js 18+.

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000, with interactive docs at `/docs`. The SQLite database file is created automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (use `localhost`, since the backend's CORS setting allows that origin).

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/transactions` | List (filterable) or create a transaction |
| POST | `/transactions/bulk` | Create up to 1000 transactions at once (CSV import) |
| GET / PUT / DELETE | `/transactions/{id}` | Read, update, or delete one transaction |
| GET | `/analytics/summary` | Income, expenses, balance, savings rate for a month |
| GET | `/analytics/by-category` | Expense totals and percentages per category |
| GET | `/analytics/monthly` | Income vs expenses for the last N months |
| GET | `/budgets` | Budgets with spent, remaining, and percent for a month |
| PUT | `/budgets` | Create or update a category budget |
| DELETE | `/budgets/{id}` | Delete a budget |

## Project Structure

```
expense-tracker/
├── backend/
│   ├── main.py          # app setup and transaction endpoints
│   ├── analytics.py     # summary, category, and monthly endpoints
│   ├── budgets.py       # budget endpoints
│   ├── models.py        # SQLAlchemy tables
│   ├── schemas.py       # Pydantic validation
│   └── database.py      # engine and session
└── frontend/
    └── src/
        ├── components/  # dashboard, charts, modals, list, heatmap
        ├── api.js       # all backend calls
        ├── csv.js       # CSV parsing and export helpers
        └── utils.js
```

## Possible Improvements

- User accounts and authentication
- Recurring transactions
- Savings goals
- Duplicate detection on CSV import
- Deployment with a hosted database

## What I Learned

Building a REST API with FastAPI and SQLAlchemy, validating data with Pydantic, connecting it to a React frontend, and turning raw transactions into charts and insights.