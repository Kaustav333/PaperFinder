export interface Paper {
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  abstract?: string;
  citationCount: number;
  pdfUrl?: string;
  sourceUrl: string;
  doi?: string;
  source: string;
}

export interface SearchResponse {
  query: string;
  results: Paper[];
  sources_failed: string[];
  cached: boolean;
}

export async function searchPapers(query: string): Promise<SearchResponse> {
  const res = await fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error('Search request failed');
  }
  return res.json();
}
