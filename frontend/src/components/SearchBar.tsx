import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isLoading: boolean;
}

export function SearchBar({ onSearch, initialQuery = '', isLoading }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative group">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for research papers..."
        className="w-full pl-5 pr-14 py-4 text-lg border border-neutral-300 focus:border-accent focus:outline-none transition-colors shadow-sm font-sans"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-accent disabled:opacity-50 transition-colors"
      >
        <Search size={24} />
      </button>
    </form>
  );
}
