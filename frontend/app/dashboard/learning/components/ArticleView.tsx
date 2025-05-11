"use client"

import { X, BookmarkCheck, Bookmark, Clock } from 'lucide-react';
import { Article, Concept } from '../mockData';

interface ArticleViewProps {
  article: Article;
  onClose: () => void;
  onBookmarkToggle: (articleId: string) => void;
  onConceptClick: (concept: Concept) => void;
}

export default function ArticleView({ 
  article, 
  onClose, 
  onBookmarkToggle, 
  onConceptClick 
}: ArticleViewProps) {
  
  const highlightConcepts = (text: string, conceptsToHighlight: Concept[]) => {
    if (!conceptsToHighlight.length) return text;
    
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
            {article.readTime} min read
          </div>
          
          <button onClick={() => onBookmarkToggle(article.id)}>
            {article.isBookmarked ? (
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
            {article.category} · {article.level}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {article.title}
        </h1>
      </div>
      
      <div className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Introduction</h2>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: highlightConcepts(article.content.introduction, article.relatedConcepts) 
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'SPAN' && target.dataset.conceptId) {
              const concept = article.relatedConcepts.find(
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
            __html: highlightConcepts(article.content.background, article.relatedConcepts) 
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'SPAN' && target.dataset.conceptId) {
              const concept = article.relatedConcepts.find(
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
            __html: highlightConcepts(article.content.application, article.relatedConcepts) 
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'SPAN' && target.dataset.conceptId) {
              const concept = article.relatedConcepts.find(
                c => c.id === target.dataset.conceptId
              );
              if (concept) onConceptClick(concept);
            }
          }}
          className="text-gray-300 mb-6"
        />
        
        <div className="mt-10 bg-zinc-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Related Concepts</h3>
          <div className="flex flex-wrap gap-2">
            {article.relatedConcepts.map((concept) => (
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
      </div>
    </div>
  );
}