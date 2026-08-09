import { useState } from 'react';
import { Download, ExternalLink, Quote } from 'lucide-react';
import { Paper } from '../api';

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);

  const authorString = paper.authors.join(', ');
  const abstractPreviewLength = 300;
  const isLongAbstract = paper.abstract && paper.abstract.length > abstractPreviewLength;
  const displayAbstract = expanded 
    ? paper.abstract 
    : paper.abstract?.slice(0, abstractPreviewLength) + (isLongAbstract ? '...' : '');

  return (
    <div className="border border-neutral-200 bg-white p-5 mb-4 hover:border-neutral-300 transition-colors">
      <h3 className="text-xl font-serif font-medium leading-tight mb-2 text-neutral-900">
        {paper.title}
      </h3>
      
      <div className="text-sm text-neutral-600 mb-3 flex flex-wrap gap-2 items-center">
        <span className="font-medium text-neutral-800">{authorString}</span>
        {paper.year && (
          <>
            <span className="text-neutral-300">•</span>
            <span>{paper.year}</span>
          </>
        )}
        {paper.venue && (
          <>
            <span className="text-neutral-300">•</span>
            <span className="italic">{paper.venue}</span>
          </>
        )}
      </div>

      {paper.abstract && (
        <div className="mb-4 text-sm text-neutral-700 leading-relaxed">
          {displayAbstract}
          {isLongAbstract && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-accent hover:underline font-medium focus:outline-none"
            >
              {expanded ? 'collapse' : 'expand'}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center pt-2 border-t border-neutral-100">
        <div className="flex items-center text-sm text-neutral-500 gap-4">
          <div className="flex items-center gap-1.5" title="Citations">
            <Quote size={14} />
            <span>{paper.citationCount.toLocaleString()}</span>
          </div>
          <div className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600">
            {paper.source}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {paper.pdfUrl ? (
            <a 
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-blue-800 transition-colors"
            >
              <Download size={16} />
              Download PDF
            </a>
          ) : (
            <a 
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ExternalLink size={16} />
              View Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
