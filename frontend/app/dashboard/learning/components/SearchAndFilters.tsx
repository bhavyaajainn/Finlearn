"use client"

import { Search, Award } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  onDailySummaryOpen: () => void;
}

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onDailySummaryOpen
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
      {/* Search bar */}
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-zinc-900/50 border border-zinc-800 text-white text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-3"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap justify-center md:justify-between w-full md:flex-1">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button 
            onClick={() => onCategoryChange('All')}
            className={`px-4 py-2 rounded-full text-sm ${selectedCategory === 'All' 
              ? 'bg-blue-600 text-white' 
              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Daily summary button */}
        <button
          onClick={onDailySummaryOpen}
          className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full text-sm mt-4 md:mt-0"
        >
          <Award className="h-4 w-4 mr-2" />
          Daily Summary
        </button>
      </div>
    </div>
  );
}