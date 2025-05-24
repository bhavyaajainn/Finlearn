"use client"

import { useEffect, useState } from 'react';
import { X, Clock, AlertCircle, Info, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { NewsDetailResponse, TooltipWord, TrendingNewsItem } from '@/app/store/slices/dashboardSlice';
import { Badge } from '@/components/ui/badge';

interface NewsDetailViewProps {
  newsDetail: NewsDetailResponse | null;
  selectedNewsItem: TrendingNewsItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

interface TooltipModal {
  word: string;
  tooltip: string;
  isOpen: boolean;
}

export default function NewsDetailView({
  newsDetail,
  selectedNewsItem,
  loading,
  error,
  onClose,
}: NewsDetailViewProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const processContent = (content: string) => {
    if (!content) return '';
    
    const sections = content.split(/^##\s+/m).filter(section => section.trim().length > 0);
    
    let processedContent = '';
    
    sections.forEach(section => {
      const sectionLines = section.split('\n');
      const sectionTitle = sectionLines[0].trim();
      const sectionContent = sectionLines.slice(1).join('\n').trim();
      
      if (sectionTitle && sectionContent) {
        processedContent += `<h2 class="text-lg sm:text-xl font-semibold text-white mt-6 sm:mt-8 mb-3 sm:mb-4">${sectionTitle}</h2>`;
        processedContent += `<div class="text-gray-300 mb-5 sm:mb-6">${processMarkdownContent(sectionContent)}</div>`;
      } else if (sectionTitle) {
        processedContent += `<h2 class="text-lg sm:text-xl font-semibold text-white mt-6 sm:mt-8 mb-3 sm:mb-4">${sectionTitle}</h2>`;
      }
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
    
    processedContent = processedContent.replace(/See the "tooltip_words" section below for clear explanations of key terms used in this article\./gi, '');
    processedContent = processedContent.replace(/\*\*Technical Terms Explained\*\*\s*See the "tooltip_words" section below for clear explanations of key terms used in this article\./gi, '');
    
    if (newsDetail?.article?.tooltip_words) {
      newsDetail.article.tooltip_words.forEach((tooltipItem: TooltipWord) => {
        const wordToFind = escapeRegExp(tooltipItem.word);
        const tooltipToAdd = encodeURIComponent(tooltipItem.tooltip);
        
        const regex = new RegExp(`\\b${wordToFind}\\b`, 'gi');
        
        processedContent = processedContent.replace(
          regex,
          `<button class="tooltip-word font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/30 px-1 py-0.5 rounded transition-colors text-xs sm:text-sm" data-word="${encodeURIComponent(tooltipItem.word)}" data-tooltip="${tooltipToAdd}">${tooltipItem.word}</button>`
        );
      });
    }
    
    return processedContent;
  };

  const processReference = (ref: string) => {
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
      
      return {
        displayText: displayText.trim(),
        url,
        date
      };
    } catch (error) {
      return {
        displayText: ref,
        url: '',
        date: ''
      };
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  };

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white flex items-center transition-colors"
        >
          <X className="h-5 w-5 mr-1" />
          Back to news
        </button>

        {selectedNewsItem?.url && (
          <a
            href={selectedNewsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Read Original
          </a>
        )}
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
              <p className="font-semibold text-red-500">Error loading news article</p>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && newsDetail && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              {selectedNewsItem?.topics?.map((topic, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-blue-500/10 text-blue-400 border-blue-800 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {capitalizeFirstLetter(topic)}
                </Badge>
              ))}
              <Badge 
                variant="outline" 
                className="bg-purple-500/10 text-purple-400 border-purple-800 text-xs"
              >
                {capitalizeFirstLetter(newsDetail.expertise_level)}
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {newsDetail.article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4 sm:mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{selectedNewsItem?.source || 'Financial Times'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{selectedNewsItem ? formatDate(selectedNewsItem.published_at) : 'Recently Published'}</span>
              </div>
            </div>

            {selectedNewsItem?.summary && (
              <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Summary</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {selectedNewsItem.summary}
                </p>
              </div>
            )}
          </div>

          <div className="prose prose-invert prose-sm sm:prose-base max-w-none" onClick={handleDocumentClick}>
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(newsDetail.article.content)
              }}
              className="text-gray-300 leading-relaxed"
            />
          </div>

          {newsDetail.article.references && newsDetail.article.references.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">References</h3>
              <div className="space-y-3">
                {newsDetail.article.references.map((ref, index) => {
                  const parsedRef = processReference(ref);
                  return (
                    <div key={index} className="text-sm text-gray-300">
                      <span className="font-medium">{parsedRef.displayText}</span>
                      {parsedRef.url && (
                        <a 
                          href={parsedRef.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 ml-2 break-all underline"
                        >
                          {parsedRef.url}
                        </a>
                      )}
                      {parsedRef.date && (
                        <span className="text-gray-400 ml-2">({parsedRef.date})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedNewsItem?.topics && selectedNewsItem.topics.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNewsItem.topics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-500/10 text-blue-400 border-blue-800"
                  >
                    {capitalizeFirstLetter(topic)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !newsDetail && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Article Content Unavailable</h3>
          <p className="text-gray-400 max-w-md">
            The detailed content for this news article isn't available right now. Please try again later.
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