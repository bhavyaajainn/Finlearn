"use client"

import { Search, Award } from 'lucide-react';
import { ArticleCategory } from '../mockData';

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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Search bar */}
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
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
        className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg"
      >
        <Award className="h-5 w-5 mr-2" />
        Daily Summary
      </button>
    </div>
  );
}