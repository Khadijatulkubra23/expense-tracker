import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db, month_of

router = APIRouter(prefix="/budgets", tags=["budgets"])

T = models.Transaction
MONTH_PATTERN = r"^\d{4}-\d{2}$"


@router.get("")
def list_budgets(month: Optional[str] = Query(None, pattern=MONTH_PATTERN), db: Session = Depends(get_db)):
    month = month or datetime.date.today().strftime("%Y-%m")
    spent = dict(
        db.query(T.category, func.sum(T.amount))
                .filter(T.type == "expense", month_of(T.date) == month)
        .group_by(T.category)
        .all()
    )
    result = []
    for b in db.query(models.Budget).order_by(models.Budget.category).all():
        used = round(spent.get(b.category, 0), 2)
        result.append(
            {
                "id": b.id,
                "category": b.category,
                "monthly_limit": b.monthly_limit,
                "spent": used,
                "remaining": round(b.monthly_limit - used, 2),
                "percent": round(used / b.monthly_limit * 100, 1),
            }
        )
    return result


@router.put("", response_model=schemas.BudgetOut)
def set_budget(data: schemas.BudgetIn, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter(models.Budget.category == data.category).first()
    if budget:
        budget.monthly_limit = data.monthly_limit
    else:
        budget = models.Budget(**data.model_dump())
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.get(models.Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()