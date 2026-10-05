import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

import models
from database import get_db, month_of

router = APIRouter(prefix="/analytics", tags=["analytics"])

T = models.Transaction
month_col = month_of(T.date)
MONTH_PATTERN = r"^\d{4}-\d{2}$"


def current_month():
    return datetime.date.today().strftime("%Y-%m")


def last_months(n: int):
    today = datetime.date.today()
    year, month = today.year, today.month
    keys = []
    for _ in range(n):
        keys.append(f"{year}-{month:02d}")
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return keys[::-1]


@router.get("/summary")
def summary(month: Optional[str] = Query(None, pattern=MONTH_PATTERN), db: Session = Depends(get_db)):
    month = month or current_month()
    rows: dict[str, float] = dict(
        db.query(T.type, func.sum(T.amount)).filter(month_col == month).group_by(T.type).all()
    )
    income = round(rows.get("income", 0), 2)
    expenses = round(rows.get("expense", 0), 2)
    balance = round(income - expenses, 2)
    rate = round(balance / income * 100, 1) if income else 0
    return {"month": month, "income": income, "expenses": expenses, "balance": balance, "savings_rate": rate}


@router.get("/by-category")
def by_category(month: Optional[str] = Query(None, pattern=MONTH_PATTERN), db: Session = Depends(get_db)):
    month = month or current_month()
    rows = (
        db.query(T.category, func.sum(T.amount))
        .filter(T.type == "expense", month_col == month)
        .group_by(T.category)
        .order_by(func.sum(T.amount).desc())
        .all()
    )
    total = sum(r[1] for r in rows)
    return [
        {"category": cat, "total": round(amt, 2), "percent": round(amt / total * 100, 1)}
        for cat, amt in rows
    ]


@router.get("/monthly")
def monthly(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    keys = last_months(months)
    rows = (
        db.query(month_col, T.type, func.sum(T.amount))
        .filter(month_col.in_(keys))
        .group_by(month_col, T.type)
        .all()
    )
    data = {(m, t): round(s, 2) for m, t, s in rows}
    return [
        {"month": k, "income": data.get((k, "income"), 0), "expenses": data.get((k, "expense"), 0)}
        for k in keys
    ]