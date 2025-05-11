"use client"

import { SearchX } from 'lucide-react';

interface NoResultsProps {
  searchTerm: string;
  selectedCategory: string;
  onReset: () => void;
}

export default function NoResults({ 
  searchTerm, 
  selectedCategory,
  onReset 
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <SearchX className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Articles Found</h3>
      
      <p className="text-gray-400 max-w-md mb-6">
        {searchTerm && selectedCategory !== 'All' ? (
          <>No articles match your search <span className="text-blue-400">"{searchTerm}"</span> in the <span className="text-blue-400">{selectedCategory}</span> category.</>
        ) : searchTerm ? (
          <>No articles match your search <span className="text-blue-400">"{searchTerm}"</span>.</>
        ) : selectedCategory !== 'All' ? (
          <>No articles found in the <span className="text-blue-400">{selectedCategory}</span> category.</>
        ) : (
          <>No articles available at the moment. Please check back later.</>
        )}
      </p>
      
      {(searchTerm || selectedCategory !== 'All') && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}