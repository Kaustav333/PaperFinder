import React from 'react';

export function SkeletonCard() {
  return (
    <div className="border border-neutral-200 bg-white p-5 mb-4 animate-pulse">
      <div className="h-6 bg-neutral-200 w-3/4 mb-3"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 bg-neutral-200 w-1/3"></div>
        <div className="h-4 bg-neutral-200 w-12"></div>
        <div className="h-4 bg-neutral-200 w-1/4"></div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="h-3 bg-neutral-100 w-full"></div>
        <div className="h-3 bg-neutral-100 w-full"></div>
        <div className="h-3 bg-neutral-100 w-5/6"></div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-200 w-12"></div>
          <div className="h-4 bg-neutral-200 w-16"></div>
        </div>
        <div className="h-4 bg-neutral-200 w-24"></div>
      </div>
    </div>
  );
}
