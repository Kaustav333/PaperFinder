import React, { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { PaperCard } from './components/PaperCard';
import { SkeletonCard } from './components/SkeletonCard';
import { searchPapers, Paper } from './api';

function App() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourcesFailed, setSourcesFailed] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [filterSource, setFilterSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');

  const handleSearch = async (newQuery: string) => {
    setQuery(newQuery);
    setIsLoading(true);
    setError('');
    setSourcesFailed([]);
    setPapers([]);
    setVisibleCount(10);
    
    try {
      const response = await searchPapers(newQuery);
      setPapers(response.results);
      if (response.sources_failed && response.sources_failed.length > 0) {
        setSourcesFailed(response.sources_failed);
      }
    } catch (err) {
      setError('Search failed to connect to the server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedPapers = useMemo(() => {
    let result = [...papers];
    
    if (filterSource !== 'all') {
      result = result.filter(p => p.source.toLowerCase() === filterSource.toLowerCase());
    }
    
    if (sortBy === 'citations') {
      result.sort((a, b) => b.citationCount - a.citationCount);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    
    return result;
  }, [papers, filterSource, sortBy]);

  return (
    <div className="min-h-screen pb-20">
      <header className={`transition-all duration-500 ease-in-out flex flex-col items-center justify-center ${papers.length > 0 || isLoading || error ? 'pt-12 pb-8' : 'h-[80vh]'}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 tracking-tight mb-3">PaperFind</h1>
          <p className="text-neutral-500 font-sans text-lg">A minimal research search engine</p>
        </div>
        
        <div className="w-full px-4">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="p-4 mb-6 border border-red-200 bg-red-50 text-red-800 text-center">
            {error}
          </div>
        )}

        {sourcesFailed.length > 0 && (
          <div className="mb-6 text-sm text-amber-700 bg-amber-50 p-3 border border-amber-200 text-center">
            Some sources were unavailable ({sourcesFailed.join(', ')}). Showing results from remaining sources.
          </div>
        )}

        {(papers.length > 0 || isLoading) && (
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b border-neutral-200 pb-4">
            <div className="text-neutral-600 text-sm">
              {!isLoading && `${filteredAndSortedPapers.length} results found`}
            </div>
            
            <div className="flex gap-4 text-sm">
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="border border-neutral-300 py-1.5 px-3 bg-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="arxiv">arXiv</option>
                <option value="semantic scholar">Semantic Scholar</option>
                <option value="openalex">OpenAlex</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 py-1.5 px-3 bg-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="citations">Sort by Citations</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!isLoading && papers.length > 0 && filteredAndSortedPapers.length === 0 && (
            <div className="text-center py-16 text-neutral-500 text-lg">
              No results match your filters. Try adjusting them.
            </div>
          )}

          {!isLoading && papers.length === 0 && query && !error && (
            <div className="text-center py-16 text-neutral-500 text-lg">
              No results for that query — try removing filters or using different keywords.
            </div>
          )}

          {!isLoading && filteredAndSortedPapers.slice(0, visibleCount).map((paper, index) => (
            <PaperCard key={`${paper.doi || paper.title}-${index}`} paper={paper} />
          ))}

          {!isLoading && filteredAndSortedPapers.length > visibleCount && (
            <div className="flex justify-center pt-6 pb-12">
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-6 py-3 bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Load More Results
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
