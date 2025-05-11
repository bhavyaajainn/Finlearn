"use client"

import { useState } from 'react';
import { BookmarkCheck, Bookmark, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { Article } from '../mockData';

interface ArticleCardProps {
  article: Article;
  onArticleSelect: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  onMarkAsRead: (articleId: string) => void;
}

export default function ArticleCard({ 
  article, 
  onArticleSelect, 
  onBookmarkToggle, 
  onMarkAsRead 
}: ArticleCardProps) {
  return (
    <div 
      key={article.id}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
              {article.category} · {article.level}
            </span>
            {article.isRead && (
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Read
              </span>
            )}
          </div>
          <button onClick={() => onBookmarkToggle(article.id)}>
            {article.isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-400" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-400" />
            )}
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          {article.title}
        </h2>
        
        <p className="text-gray-400 text-sm mb-4">
          {article.summary}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {article.readTime} min read
          </div>
          
          <button 
            onClick={() => {
              onArticleSelect(article);
              onMarkAsRead(article.id);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            Read article
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}