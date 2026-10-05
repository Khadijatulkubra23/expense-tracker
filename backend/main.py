from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import os
import analytics
import budgets
import models
import schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)
ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(budgets.router)


def get_or_404(db: Session, tx_id: int):
    tx = db.get(models.Transaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.get("/")
def root():
    return {"message": "Expense Tracker API is running"}


@app.post("/transactions", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(data: schemas.TransactionCreate, db: Session = Depends(get_db)):
    tx = models.Transaction(**data.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@app.post("/transactions/bulk", status_code=201)
def bulk_create(data: List[schemas.TransactionCreate], db: Session = Depends(get_db)):
    if not 0 < len(data) <= 1000:
        raise HTTPException(status_code=400, detail="Send between 1 and 1000 transactions")
    db.add_all([models.Transaction(**t.model_dump()) for t in data])
    db.commit()
    return {"imported": len(data)}


@app.get("/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    type: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Transaction)
    if type:
        query = query.filter(models.Transaction.type == type)
    if category:
        query = query.filter(models.Transaction.category == category)
    return query.order_by(models.Transaction.date.desc(), models.Transaction.id.desc()).all()


@app.get("/transactions/{tx_id}", response_model=schemas.TransactionOut)
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, tx_id)


@app.put("/transactions/{tx_id}", response_model=schemas.TransactionOut)
def update_transaction(tx_id: int, data: schemas.TransactionCreate, db: Session = Depends(get_db)):
    tx = get_or_404(db, tx_id)
    for key, value in data.model_dump().items():
        setattr(tx, key, value)
    db.commit()
    db.refresh(tx)
    return tx


@app.delete("/transactions/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, tx_id))
    db.commit()