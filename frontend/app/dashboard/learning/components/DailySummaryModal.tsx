"use client"

import { useState } from 'react';
import { X, CheckCircle, ChevronRight, BookOpen, Zap, Award, TrendingUp, Bitcoin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DailySummaryData {
  user_id: string;
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  statistics: {
    articles_read: number;
    tooltips_viewed: number;
    categories: Record<string, number>;
  };
  streak: {
    current_streak: number;
    last_active: string;
    updated_at: string;
    longest_streak: number;
  };
  articles_read: string[];
  tooltips_viewed: any[];
  summary: string;
  quiz_questions: {
    question: string;
    options: {
      label: string;
      text: string;
    }[];
    correct_answer: string;
    explanation: string;
  }[];
  generated_at: string;
}

export default function DailySummaryModal({ 
  dailySummary, 
  isOpen, 
  isLoading,
  error,
  onClose, 
  onQuizStart 
}: {
  dailySummary: DailySummaryData | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onQuizStart: () => void;
}) {
  
  if (!isOpen) return null;
  
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16">
      <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-300 text-base sm:text-lg">Loading your learning summary...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16">
      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-2">Error Loading Summary</h3>
      <p className="text-gray-300 text-center text-sm sm:text-base max-w-md">
        {error || "We couldn't load your learning summary. Please try again later."}
      </p>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800">
          <h3 className="text-xl sm:text-2xl font-semibold text-white">Your Learning Summary</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 sm:p-6 flex-grow">
          {isLoading && renderLoading()}
          {!isLoading && error && renderError()}
          {!isLoading && !error && dailySummary && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                  Articles You've Read Today ({dailySummary.articles_read?.length || 0})
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {dailySummary.articles_read?.map((title: string, index: number) => (
                    <li key={index} className="flex items-start bg-zinc-800/30 p-2 sm:p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-200 text-sm sm:text-base">{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1 sm:mr-2" />
                    <div className="text-xs sm:text-sm font-medium text-gray-300">Articles Read</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{dailySummary.statistics?.articles_read || 0}</div>
                </div>
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1 sm:mr-2" />
                    <div className="text-xs sm:text-sm font-medium text-gray-300">Current Streak</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{dailySummary.streak?.current_streak || 0} days</div>
                </div>
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 mr-1 sm:mr-2" />
                    <div className="text-xs sm:text-sm font-medium text-gray-300">Longest Streak</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{dailySummary.streak?.longest_streak || 0} days</div>
                </div>
              </div>
              <div className="bg-zinc-800/30 p-3 sm:p-5 rounded-lg border border-zinc-700/50">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Focus Areas</h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {Object.entries(dailySummary.statistics?.categories || {}).map(([category, count]: [string, any], index) => (
                    <div key={index} className="flex items-center bg-zinc-700/30 py-1 sm:py-2 px-2 sm:px-3 rounded-lg">
                      {category === 'cryptocurrencies' ? (
                        <Bitcoin className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1 sm:mr-2" />
                      ) : category === 'stocks' ? (
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1 sm:mr-2" />
                      ) : (
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1 sm:mr-2" />
                      )}
                      <span className="text-gray-200 capitalize text-xs sm:text-sm">{category.replace('_', ' ')}</span>
                      <span className="ml-1 sm:ml-2 bg-zinc-600/50 text-xs px-1.5 sm:px-2 py-0.5 rounded-full text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-800/30 p-3 sm:p-5 rounded-lg border border-zinc-700/50">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Your Learning Journey</h4>
                <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                  <ReactMarkdown>
                    {dailySummary.summary || ''}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 p-4 sm:p-6 border-t border-zinc-800">
          {!isLoading && !error && dailySummary && dailySummary.quiz_questions && dailySummary.quiz_questions.length > 0 && (
            <button
              onClick={() => {
                onClose();
                onQuizStart();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <span>Take Daily Quiz</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}