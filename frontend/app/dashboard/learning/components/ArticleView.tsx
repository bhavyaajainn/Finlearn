"use client"

import { useEffect } from 'react';
import { X, BookmarkCheck, Bookmark, Clock, AlertCircle } from 'lucide-react';
import { TopicItem, TopicDetailResponse, RelatedConcept } from '@/app/store/slices/learningSlice';

interface ArticleViewProps {
  topic: TopicItem;
  topicDetail: TopicDetailResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onBookmarkToggle: (topicId: string) => void;
  onConceptClick: (concept: RelatedConcept) => void;
  isBookmarked: boolean;
}

export default function ArticleView({ 
  topic,
  topicDetail,
  loading,
  error,
  onClose, 
  onBookmarkToggle, 
  onConceptClick,
  isBookmarked
}: ArticleViewProps) {
  // Estimate read time based on the description length
  const estimatedReadTime = Math.max(1, Math.ceil(topic.description.length / 500));
  
  const highlightConcepts = (text: string, conceptsToHighlight: RelatedConcept[]) => {
    if (!conceptsToHighlight || !conceptsToHighlight.length) return text;
    
    let highlightedText = text;
    conceptsToHighlight.forEach(concept => {
      const regex = new RegExp(`\\b${concept.term}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="font-bold text-blue-400 cursor-pointer" data-concept-id="${concept.id}">${concept.term}</span>`
      );
    });
    
    return highlightedText;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white flex items-center"
        >
          <X className="h-5 w-5 mr-1" />
          Back to articles
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {estimatedReadTime} min read
          </div>
          
          <button onClick={() => onBookmarkToggle(topic.topic_id)}>
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-400" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-400" />
            )}
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
            {topic.category} · {topic.expertise_level}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {topic.title}
        </h1>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500">Error loading article</p>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && topicDetail && (
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Introduction</h2>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightConcepts(topicDetail.introduction, topicDetail.related_concepts) 
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                const concept = topicDetail.related_concepts.find(
                  c => c.id === target.dataset.conceptId
                );
                if (concept) onConceptClick(concept);
              }
            }}
            className="text-gray-300 mb-6"
          />
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Background</h2>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightConcepts(topicDetail.background, topicDetail.related_concepts) 
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                const concept = topicDetail.related_concepts.find(
                  c => c.id === target.dataset.conceptId
                );
                if (concept) onConceptClick(concept);
              }
            }}
            className="text-gray-300 mb-6"
          />
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Current Applications</h2>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightConcepts(topicDetail.application, topicDetail.related_concepts) 
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                const concept = topicDetail.related_concepts.find(
                  c => c.id === target.dataset.conceptId
                );
                if (concept) onConceptClick(concept);
              }
            }}
            className="text-gray-300 mb-6"
          />
          
          {topicDetail.related_concepts && topicDetail.related_concepts.length > 0 && (
            <div className="mt-10 bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Related Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {topicDetail.related_concepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => onConceptClick(concept)}
                    className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full hover:bg-blue-500/20"
                  >
                    {concept.term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!loading && !error && !topicDetail && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Article Content Unavailable</h3>
          <p className="text-gray-400 max-w-md">
            The detailed content for this article isn't available right now. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}