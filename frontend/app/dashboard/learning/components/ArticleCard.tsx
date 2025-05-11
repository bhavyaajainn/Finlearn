"use client"

import { useState } from 'react';
import { BookmarkCheck, Bookmark, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { TopicItem } from '@/app/store/slices/learningSlice';

interface ArticleCardProps {
  topic: TopicItem;
  onArticleSelect: (topic: TopicItem) => void;
  onBookmarkToggle: (topicId: string) => void;
  onMarkAsRead: (topicId: string) => void;
  isBookmarked: boolean;
  isRead: boolean;
}

export default function ArticleCard({ 
  topic, 
  onArticleSelect, 
  onBookmarkToggle, 
  onMarkAsRead,
  isBookmarked,
  isRead
}: ArticleCardProps) {
  // Estimate read time based on the description length (1 minute per 500 chars)
  const estimatedReadTime = Math.max(1, Math.ceil(topic.description.length / 500));
  
  return (
    <div 
      key={topic.topic_id}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
              {topic.category} · {topic.expertise_level}
            </span>
            {isRead && (
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Read
              </span>
            )}
          </div>
          <button onClick={() => onBookmarkToggle(topic.topic_id)}>
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-400" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-400" />
            )}
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          {topic.title}
        </h2>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {topic.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {estimatedReadTime} min read
          </div>
          
          <button 
            onClick={() => {
              onArticleSelect(topic);
              onMarkAsRead(topic.topic_id);
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