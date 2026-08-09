from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from typing import List

from database import init_db, get_cached_results, set_cached_results
from fetchers import fetch_semantic_scholar, fetch_openalex, fetch_arxiv
from merger import deduplicate_and_rank

app = FastAPI(title="PaperFind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/search")
async def search(q: str = Query(..., description="Search query")):
    if not q.strip():
        return {"query": q, "results": [], "sources_failed": []}
        
    cached = get_cached_results(q)
    if cached is not None:
        return {"query": q, "results": cached, "sources_failed": [], "cached": True}

    results = await asyncio.gather(
        fetch_semantic_scholar(q),
        fetch_openalex(q),
        fetch_arxiv(q),
        return_exceptions=True
    )
    
    all_papers = []
    sources_failed = []
    
    if isinstance(results[0], list):
        all_papers.extend(results[0])
    else:
        sources_failed.append("Semantic Scholar")
        
    if isinstance(results[1], list):
        all_papers.extend(results[1])
    else:
        sources_failed.append("OpenAlex")
        
    if isinstance(results[2], list):
        all_papers.extend(results[2])
    else:
        sources_failed.append("arXiv")

    merged = deduplicate_and_rank(all_papers, q)
    
    merged_dicts = [p.dict() for p in merged]
    set_cached_results(q, merged_dicts)
    
    return {
        "query": q,
        "results": merged_dicts,
        "sources_failed": sources_failed,
        "cached": False
    }
