from typing import List
from thefuzz import fuzz
import string
import math
from schemas import Paper

def normalize_string(s: str) -> str:
    if not s:
        return ""
    s = s.lower()
    s = s.translate(str.maketrans('', '', string.punctuation))
    return s.strip()

def deduplicate_and_rank(papers: List[Paper], query: str) -> List[Paper]:
    deduped: List[Paper] = []
    
    for paper in papers:
        is_duplicate = False
        
        for existing in deduped:
            # 1. Match by DOI
            if paper.doi and existing.doi and paper.doi.lower() == existing.doi.lower():
                is_duplicate = True
            # 2. Fuzzy match title
            elif paper.title and existing.title:
                norm_paper_title = normalize_string(paper.title)
                norm_existing_title = normalize_string(existing.title)
                if fuzz.ratio(norm_paper_title, norm_existing_title) > 90:
                    is_duplicate = True
            
            if is_duplicate:
                # Merge logic: enhance existing with better data
                if paper.citationCount > existing.citationCount:
                    existing.citationCount = paper.citationCount
                if not existing.pdfUrl and paper.pdfUrl:
                    existing.pdfUrl = paper.pdfUrl
                if not existing.doi and paper.doi:
                    existing.doi = paper.doi
                break
                
        if not is_duplicate:
            deduped.append(paper)
            
    query_norm = normalize_string(query)
    
    def get_score(p: Paper) -> float:
        title_score = fuzz.partial_ratio(query_norm, normalize_string(p.title))
        citation_score = math.log10(p.citationCount + 1) * 10 
        return title_score + citation_score

    deduped.sort(key=get_score, reverse=True)
    return deduped
