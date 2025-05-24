"use client"

import { useEffect, useState } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { TopicItem, TopicDetailResponse, RelatedConcept } from '@/app/store/slices/learningSlice';

interface ArticleViewProps {
  topic: TopicItem;
  topicDetail: TopicDetailResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConceptClick: (concept: RelatedConcept) => void;
}

interface TooltipWord {
  word: string;
  tooltip: string;
}

interface TooltipModal {
  word: string;
  tooltip: string;
  isOpen: boolean;
}

export default function ArticleView({
  topic,
  topicDetail,
  loading,
  error,
  onClose,
  onConceptClick,
}: ArticleViewProps) {
  const [tooltipModal, setTooltipModal] = useState<TooltipModal>({
    word: '',
    tooltip: '',
    isOpen: false
  });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tooltipModal.isOpen) {
        closeTooltipModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tooltipModal.isOpen]);

  const estimatedReadTime = Math.max(1, Math.ceil((topic.description?.length || 0) / 500));
  
  
  const renderContent = (content: string) => {
    if (!content) return '';
    
    
    const sections = content.split(/^##\s+/m).filter(section => section.trim().length > 0);
    
    let processedContent = '';
    
    sections.forEach(section => {
      const sectionLines = section.split('\n');
      const sectionTitle = sectionLines[0].trim();
      const sectionContent = sectionLines.slice(1).join('\n').trim();
      
      
      if (sectionTitle.toLowerCase() === 'references') {
        return;
      }
      
      processedContent += `<h2 class="text-lg sm:text-xl font-semibold text-white mt-6 sm:mt-8 mb-3 sm:mb-4">${sectionTitle}</h2>`;
      processedContent += `<div class="text-gray-300 mb-5 sm:mb-6">${processMarkdownContent(sectionContent)}</div>`;
    });

    return processedContent;
  };
  
  
  const processMarkdownContent = (content: string) => {
    if (!content) return '';
    
    let processedContent = content.replace(/\n\n/g, '</p><p>');
    processedContent = `<p class="text-xs sm:text-sm md:text-base">${processedContent}</p>`;
    
    
    processedContent = processedContent.replace(/^\s*-\s+(.+)$/gm, '<li class="text-xs sm:text-sm md:text-base">$1</li>');
    processedContent = processedContent.replace(/<li(.+)<\/li>\s*<li/g, '<li$1</li><li');
    processedContent = processedContent.replace(/<p>(<li>.*<\/li>)<\/p>/g, '<ul class="list-disc pl-5 mb-4">$1</ul>');
    
    
    processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    
    processedContent = processedContent.replace(/\[(.+?)\]\((.+?)\)/g, 
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    
    if (topicDetail?.article?.tooltip_words) {
      topicDetail.article.tooltip_words.forEach((tooltipItem: TooltipWord) => {
        const wordToFind = escapeRegExp(tooltipItem.word);
        const tooltipToAdd = encodeURIComponent(tooltipItem.tooltip);
        
        const regex = new RegExp(`\\b${wordToFind}\\b`, 'gi');
        
        processedContent = processedContent.replace(
          regex,
          `<button class="tooltip-word font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/30 px-1 py-0.5 rounded transition-colors text-xs sm:text-sm" data-word="${encodeURIComponent(tooltipItem.word)}" data-tooltip="${tooltipToAdd}">${tooltipItem.word}</button>`
        );
      });
    }
    
    
    if (topicDetail?.related_concepts && topicDetail.related_concepts.length > 0) {
      topicDetail.related_concepts.forEach(concept => {
        const regex = new RegExp(`\\b${escapeRegExp(concept.term)}\\b`, 'gi');
        processedContent = processedContent.replace(
          regex,
          `<span class="font-bold text-blue-400 cursor-pointer concept-term text-xs sm:text-sm" data-concept-id="${concept.id}">${concept.term}</span>`
        );
      });
    }
    
    return processedContent;
  };
  
  
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  
  const renderReferences = () => {
    if (!topicDetail?.article?.references || topicDetail.article.references.length === 0) {
      return '';
    }
    
    return `
      <h2 class="text-lg sm:text-xl font-semibold text-white mt-8 sm:mt-10 mb-3 sm:mb-4">References</h2>
      <div class="text-gray-300 mb-5 sm:mb-6">
        <ol class="list-decimal list-inside space-y-2">
          ${topicDetail.article.references.map((ref: string, index: number) => {
            
            try {
              
              const urlMatch = ref.match(/(https?:\/\/[^\s,]+)/);
              const url = urlMatch ? urlMatch[0] : '';
              
              
              let displayText = ref.replace(url, '').trim();
              
              displayText = displayText.replace(/,\s*$/, '');
              
              
              const dateMatch = displayText.match(/,?\s*([A-Z][a-z]+ \d{1,2},? \d{4})\.?$/);
              let date = '';
              
              if (dateMatch) {
                date = dateMatch[1];
                
                displayText = displayText.replace(dateMatch[0], '');
              }
              
              return `
                <li class="text-xs sm:text-sm md:text-base">
                  <span class="font-medium">${displayText}</span>
                  ${url ? `
                    <a href="${url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="text-blue-400 hover:text-blue-300 ml-1 break-all">
                      ${url}
                    </a>
                  ` : ''}
                  ${date ? `<span class="text-gray-400 ml-1">(${date})</span>` : ''}
                </li>
              `;
            } catch (error) {
              
              return `<li class="text-xs sm:text-sm md:text-base">${ref}</li>`;
            }
          }).join('')}
        </ol>
      </div>
    `;
  };
  
  const openTooltipModal = (word: string, tooltip: string) => {
    setTooltipModal({
      word,
      tooltip,
      isOpen: true
    });
  };
  
  const closeTooltipModal = () => {
    setTooltipModal(prev => ({
      ...prev,
      isOpen: false
    }));
  };
  
  const handleDocumentClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('tooltip-word')) {
      const word = decodeURIComponent(target.dataset.word || '');
      const tooltip = decodeURIComponent(target.dataset.tooltip || '');
      openTooltipModal(word, tooltip);
      e.stopPropagation();
      return;
    }
    
    if (target.classList.contains('concept-term') && target.dataset.conceptId) {
      const concept = topicDetail?.related_concepts?.find(
        c => c.id === target.dataset.conceptId
      );
      if (concept) onConceptClick(concept);
      e.stopPropagation();
      return;
    }
  };

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white flex items-center"
        >
          <X className="h-5 w-5 mr-1" />
          Back to articles
        </button>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
            {topic.category} · {topic.expertise_level || 'beginner'}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
          {topic.title || 'Untitled Article'}
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

      {!loading && !error && topicDetail?.article && (
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none" onClick={handleDocumentClick}>
          <div
            dangerouslySetInnerHTML={{
              __html: renderContent(topicDetail.article.content)
            }}
            className="text-gray-300 text-sm sm:text-base"
          />
          
          {/* Render references section separately */}
          <div
            dangerouslySetInnerHTML={{
              __html: renderReferences()
            }}
          />

          {topicDetail.related_concepts && topicDetail.related_concepts.length > 0 && (
            <div className="mt-8 sm:mt-10 bg-zinc-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Related Concepts</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {topicDetail.related_concepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onConceptClick(concept);
                    }}
                    className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-400 text-xs sm:text-sm rounded-full hover:bg-blue-500/20"
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
      
      {tooltipModal.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeTooltipModal}
          ></div>
          
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl 
                      w-[95%] max-w-md z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center bg-zinc-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-700">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Term Definition</h3>
              </div>
              <button 
                onClick={closeTooltipModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-blue-400 mb-2 sm:mb-3">{tooltipModal.word}</h4>
              <div className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {tooltipModal.tooltip.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2 sm:mt-3' : ''}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="bg-zinc-900/50 px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-700 flex justify-end">
              <button 
                onClick={closeTooltipModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}