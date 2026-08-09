import httpx
import asyncio
import xml.etree.ElementTree as ET
from typing import List
from schemas import Paper

TIMEOUT = 5.0

async def fetch_semantic_scholar(query: str) -> List[Paper]:
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "fields": "title,authors,year,venue,abstract,citationCount,openAccessPdf,url,externalIds",
        "limit": 20
    }
    
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            papers = []
            for item in data.get("data", []):
                authors = [author.get("name") for author in item.get("authors", []) if author.get("name")]
                pdf_url = None
                if item.get("openAccessPdf"):
                    pdf_url = item["openAccessPdf"].get("url")
                
                doi = None
                if item.get("externalIds") and "DOI" in item["externalIds"]:
                    doi = item["externalIds"]["DOI"]
                
                papers.append(Paper(
                    title=item.get("title") or "",
                    authors=authors,
                    year=item.get("year"),
                    venue=item.get("venue"),
                    abstract=item.get("abstract"),
                    citationCount=item.get("citationCount") or 0,
                    pdfUrl=pdf_url,
                    sourceUrl=item.get("url") or "",
                    doi=doi,
                    source="Semantic Scholar"
                ))
            return papers
    except Exception as e:
        print(f"Semantic Scholar error: {e}")
        return []

async def fetch_openalex(query: str) -> List[Paper]:
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "select": "title,authorships,publication_year,primary_location,abstract_inverted_index,cited_by_count,open_access,doi,id",
        "per-page": 20
    }
    
    def decode_abstract(inverted_index: dict) -> str:
        if not inverted_index:
            return None
        positions_list = [max(positions) for positions in inverted_index.values() if positions]
        if not positions_list:
            return None
        max_idx = max(positions_list)
        words = [""] * (max_idx + 1)
        for word, positions in inverted_index.items():
            for pos in positions:
                words[pos] = word
        return " ".join(words).strip()

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            papers = []
            for item in data.get("results", []):
                authors = []
                for auth in item.get("authorships", []):
                    if auth.get("author") and auth["author"].get("display_name"):
                        authors.append(auth["author"]["display_name"])
                
                abstract = decode_abstract(item.get("abstract_inverted_index")) if item.get("abstract_inverted_index") else None
                
                venue = None
                pdf_url = None
                source_url = item.get("id")
                
                if item.get("primary_location"):
                    loc = item["primary_location"]
                    if loc.get("source") and loc["source"].get("display_name"):
                        venue = loc["source"]["display_name"]
                    if loc.get("pdf_url"):
                        pdf_url = loc["pdf_url"]
                    if loc.get("landing_page_url"):
                        source_url = loc["landing_page_url"]
                
                doi = item.get("doi")
                if doi:
                    doi = doi.replace("https://doi.org/", "")

                papers.append(Paper(
                    title=item.get("title") or "",
                    authors=authors,
                    year=item.get("publication_year"),
                    venue=venue,
                    abstract=abstract,
                    citationCount=item.get("cited_by_count") or 0,
                    pdfUrl=pdf_url,
                    sourceUrl=source_url or "",
                    doi=doi,
                    source="OpenAlex"
                ))
            return papers
    except Exception as e:
        print(f"OpenAlex error: {e}")
        return []

async def fetch_arxiv(query: str) -> List[Paper]:
    url = "http://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": 20
    }
    
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.text)
            ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
            
            papers = []
            for entry in root.findall("atom:entry", ns):
                title_el = entry.find("atom:title", ns)
                title = title_el.text.replace("\n", " ").strip() if title_el is not None else ""
                
                summary_el = entry.find("atom:summary", ns)
                abstract = summary_el.text.replace("\n", " ").strip() if summary_el is not None else ""
                
                authors = []
                for author in entry.findall("atom:author", ns):
                    name_el = author.find("atom:name", ns)
                    if name_el is not None:
                        authors.append(name_el.text)
                
                published_el = entry.find("atom:published", ns)
                year = int(published_el.text[:4]) if published_el is not None and published_el.text else None
                
                id_el = entry.find("atom:id", ns)
                source_url = id_el.text if id_el is not None else ""
                
                pdf_url = None
                for link in entry.findall("atom:link", ns):
                    if link.attrib.get("title") == "pdf":
                        pdf_url = link.attrib.get("href")
                        break
                
                doi_el = entry.find("arxiv:doi", ns)
                doi = doi_el.text if doi_el is not None else None
                
                papers.append(Paper(
                    title=title,
                    authors=authors,
                    year=year,
                    venue="arXiv",
                    abstract=abstract,
                    citationCount=0,
                    pdfUrl=pdf_url,
                    sourceUrl=source_url,
                    doi=doi,
                    source="arXiv"
                ))
            return papers
    except Exception as e:
        print(f"arXiv error: {e}")
        return []
