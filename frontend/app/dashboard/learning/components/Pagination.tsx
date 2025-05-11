"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  // Don't render pagination if there's only one page or none
  if (totalPages <= 1) return null;

  // Helper function to create page buttons
  const renderPageButtons = () => {
    const buttons = [];
    
    // Logic to determine which page buttons to show
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // First page button (if not in range)
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-md bg-zinc-800 text-gray-300 hover:bg-zinc-700"
        >
          1
        </button>
      );
      
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page button (if not in range)
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded-md bg-zinc-800 text-gray-300 hover:bg-zinc-700"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-8 h-8 rounded-md ${
          currentPage === 1 
            ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' 
            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {/* Page buttons */}
      {renderPageButtons()}
      
      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-8 h-8 rounded-md ${
          currentPage === totalPages 
            ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' 
            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
      