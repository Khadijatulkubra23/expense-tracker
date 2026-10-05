import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    title: str = Field(min_length=1)
    amount: float = Field(gt=0)
    type: Literal["income", "expense"]
    category: str
    date: datetime.date = Field(default_factory=datetime.date.today)
    note: Optional[str] = None


class TransactionOut(TransactionCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BudgetIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    category: str = Field(min_length=1)
    monthly_limit: float = Field(gt=0)


class BudgetOut(BudgetIn):
    id: int
    model_config = ConfigDict(from_attributes=True)