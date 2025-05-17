"use client"

import { BookmarkCheck, Bookmark, Clock, ChevronRight, CheckCircle } from "lucide-react"

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

interface ArticleCardProps {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  category: string;
  level: string;
  isBookmarked: boolean;
  isRead: boolean;
  onBookmarkToggle?: (topicId: string) => void;
}

export default function ArticleCard({ 
  topicId, 
  topicTitle, 
  topicDescription, 
  category, 
  level, 
  isBookmarked, 
  isRead,
  onBookmarkToggle
}: ArticleCardProps) {
  // Function to truncate text to a certain number of words and add ellipsis
  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Calculate read time based on original description length
  const readTime = Math.ceil(topicDescription.length / 500);

  return (
    <div className="cursor-pointer bg-black border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-blue-500/10 h-full flex flex-col">
      <div className="p-6 flex flex-col h-full">
        {/* Tags */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 flex-wrap">
            {/* Separate chips for category and level with capitalized first letter */}
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
              {capitalizeFirstLetter(category)}
            </span>
            
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full">
              {capitalizeFirstLetter(level)}
            </span>

            {isRead && (
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Read
              </span>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onBookmarkToggle) {
                onBookmarkToggle(topicId);
              }
            }}
            className="flex items-center justify-center"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-400" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-500 hover:text-blue-400 transition" />
            )}
          </button>
        </div>

        {/* Title - Fixed height with controlled truncation */}
        <h2 className="text-lg md:text-xl font-semibold text-white leading-tight mb-3">
          {truncateText(topicTitle, 10)}
        </h2>

        {/* Description - with controlled truncation */}
        <p className="text-gray-400 text-sm flex-grow">
          {truncateText(topicDescription, 25)}
        </p>

        {/* Separator line */}
        <div className="border-t border-zinc-800 w-full my-3 mt-4"></div>

        {/* Footer - Always at bottom */}
        <div className="flex items-center justify-between text-gray-400 text-sm mt-auto">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400 text-sm font-medium group">
            Start Reading 
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}