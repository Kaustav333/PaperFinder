from pydantic import BaseModel
from typing import List, Optional

class Paper(BaseModel):
    title: str
    authors: List[str]
    year: Optional[int]
    venue: Optional[str]
    abstract: Optional[str]
    citationCount: int
    pdfUrl: Optional[str]
    sourceUrl: str
    doi: Optional[str]
    source: str
