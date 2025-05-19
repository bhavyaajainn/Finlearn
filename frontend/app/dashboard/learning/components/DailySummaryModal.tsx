"use client"

import { useState } from 'react';
import { X, CheckCircle, ChevronRight, BookOpen, Zap, Award, TrendingUp, BarChart2, Bitcoin, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DailySummaryTooltip {
  topic_title: string;
  word: string;
  tooltip: string;
}

interface DailySummaryStatistics {
  articles_read: number;
  categories: Record<string, number>;
}

interface DailySummaryStreak {
  current_streak: number;
  longest_streak: number;
}

interface DailySummaryData {
  articles_read: string[];
  tooltips_viewed: DailySummaryTooltip[];
  statistics: DailySummaryStatistics;
  streak: DailySummaryStreak;
  summary: string;
  quiz_questions: any[]; 
  generated_at: string;
}

export default function DailySummaryModal({ 
  dailySummary, 
  isOpen, 
  isLoading,
  error,
  onClose, 
  onQuizStart 
}: any) {
  const [activeTab, setActiveTab] = useState('summary');
  
  if (!isOpen) return null;
  
  const categories = dailySummary?.statistics?.categories || {};
  const tooltipsByTopic = dailySummary?.tooltips_viewed?.reduce((acc: Record<string, DailySummaryTooltip[]>, tooltip: DailySummaryTooltip) => {
    if (!acc[tooltip.topic_title]) {
      acc[tooltip.topic_title] = [];
    }
    
    if (!acc[tooltip.topic_title].some(t => t.word === tooltip.word)) {
      acc[tooltip.topic_title].push(tooltip);
    }
    return acc;
  }, {}) || {};

  const topTopics = Object.entries(tooltipsByTopic)
    .sort(([, a], [, b]) => (b as DailySummaryTooltip[]).length - (a as DailySummaryTooltip[]).length)
    .slice(0, 3);

  const getUniqueTerms = (tooltips: DailySummaryTooltip[] | undefined) => {
    if (!tooltips) return [];
    const terms = new Set<string>();
    tooltips.forEach(tooltip => {
      terms.add(tooltip.word);
    });
    return Array.from(terms).slice(0, 8); 
  };
  
  const keyTerms = getUniqueTerms(dailySummary?.tooltips_viewed);
  
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
        
     
        {!isLoading && !error && dailySummary && (
          <div className="flex border-b border-zinc-800 px-4 sm:px-6">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-colors relative ${
                activeTab === 'summary' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Overview
              {activeTab === 'summary' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-colors relative ${
                activeTab === 'details' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Learning Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>
        )}
        
       
        <div className="overflow-y-auto p-4 sm:p-6 flex-grow">
          
          {isLoading && renderLoading()}
          
         
          {!isLoading && error && renderError()}
          
       
          {!isLoading && !error && dailySummary && activeTab === 'summary' && (
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

              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1 sm:mr-2" />
                    <div className="text-xs sm:text-sm font-medium text-gray-300">Articles Read</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{dailySummary.statistics?.articles_read || 0}</div>
                </div>
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-zinc-700/50 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 mr-1 sm:mr-2" />
                    <div className="text-xs sm:text-sm font-medium text-gray-300">Terms Learned</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{dailySummary.tooltips_viewed?.length || 0}</div>
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
                  {Object.entries(categories).map(([category, count]: [string, any], index) => (
                    <div key={index} className="flex items-center bg-zinc-700/30 py-1 sm:py-2 px-2 sm:px-3 rounded-lg">
                      {category === 'cryptocurrencies' ? (
                        <Bitcoin className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1 sm:mr-2" />
                      ) : category === 'stocks' ? (
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1 sm:mr-2" />
                      ) : (
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1 sm:mr-2" />
                      )}
                      <span className="text-gray-200 capitalize text-xs sm:text-sm">{category}</span>
                      <span className="ml-1 sm:ml-2 bg-zinc-600/50 text-xs px-1.5 sm:px-2 py-0.5 rounded-full text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 sm:mt-4 text-gray-300 text-xs sm:text-sm">
                  <p>Your focus is balanced between traditional financial markets and digital assets, showing a comprehensive approach to financial education.</p>
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

              {/* Key Terms */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Key Terms You've Learned</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {keyTerms.map((term: any, index: number) => (
                    <div key={index} className="bg-blue-500/20 text-blue-300 py-0.5 sm:py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm">
                      {term}
                    </div>
                  ))}
                </div>
              </div>
              
             
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 sm:p-5 rounded-lg border border-blue-700/30 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Test Your Knowledge</h4>
                    <p className="text-gray-200 text-xs sm:text-sm">
                      Ready to see how much you've learned? Take the daily quiz with {dailySummary.quiz_questions?.length || 0} questions covering today's materials.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onQuizStart();
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center sm:justify-start transition-colors flex-shrink-0"
                  >
                    <span className="text-sm sm:text-base">Start Quiz</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && dailySummary && activeTab === 'details' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Topics and Terms */}
              <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Topics & Terms Explored</h4>
              
              {topTopics.map(([topic, tooltips]: [string, any], index: number) => (
                <div key={index} className="bg-zinc-800/30 p-3 sm:p-5 rounded-lg border border-zinc-700/50 mb-3 sm:mb-4">
                  <h5 className="font-medium text-white text-sm sm:text-lg mb-2 sm:mb-3">{topic}</h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {tooltips.slice(0, 8).map((tooltip: any, i: number) => (
                      <div key={i} className="relative group">
                        <div className="bg-blue-500/20 text-blue-300 py-0.5 sm:py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm cursor-help">
                          {tooltip.word}
                        </div>
                        <div className="absolute z-10 left-0 -bottom-1 transform translate-y-full w-48 sm:w-64 p-2 sm:p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-xs sm:text-sm text-gray-300">{tooltip.tooltip}</p>
                        </div>
                      </div>
                    ))}
                    {tooltips.length > 8 && (
                      <div className="bg-zinc-700/30 text-gray-400 py-0.5 sm:py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm">
                        +{tooltips.length - 8} more
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Activity Timeline */}
              <div className="bg-zinc-800/30 p-3 sm:p-5 rounded-lg border border-zinc-700/50">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Learning Activity</h4>
                <div className="flex items-center text-gray-400 mb-3 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Last updated: {new Date(dailySummary.generated_at).toLocaleString()}</span>
                </div>
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 sm:w-8 flex justify-center">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                      </div>
                      <div className="h-full w-0.5 bg-zinc-700 mx-auto mt-1"></div>
                    </div>
                    <div className="ml-3 sm:ml-4 pb-4 sm:pb-6">
                      <h5 className="text-white font-medium text-sm sm:text-base">Articles Completed</h5>
                      <p className="text-gray-400 text-xs sm:text-sm">Read {dailySummary.statistics?.articles_read} articles on topics including cryptocurrencies and stocks</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 sm:w-8 flex justify-center">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400" />
                      </div>
                      <div className="h-full w-0.5 bg-zinc-700 mx-auto mt-1"></div>
                    </div>
                    <div className="ml-3 sm:ml-4 pb-4 sm:pb-6">
                      <h5 className="text-white font-medium text-sm sm:text-base">Terms Learned</h5>
                      <p className="text-gray-400 text-xs sm:text-sm">Explored {dailySummary.tooltips_viewed?.length || 0} financial terms across different topics</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 sm:w-8 flex justify-center">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h5 className="text-white font-medium text-sm sm:text-base">Streak Maintained</h5>
                      <p className="text-gray-400 text-xs sm:text-sm">Maintained a {dailySummary.streak?.current_streak}-day learning streak</p>
                    </div>
                  </div>
                </div>
              </div>
              
             
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 sm:p-5 rounded-lg border border-blue-700/30">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Your Learning Path</h4>
                <p className="text-gray-200 mb-2 sm:mb-3 text-xs sm:text-sm">
                  You're making great progress in your financial learning journey. Your consistent {dailySummary.streak?.current_streak}-day streak shows commitment to expanding your knowledge.
                </p>
                <div className="flex items-center">
                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5 sm:h-2">
                    <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="ml-2 sm:ml-3 text-gray-300 text-xs sm:text-sm font-medium">Level: Intermediate</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with Actions - Consolidated quiz button */}
        {!isLoading && !error && dailySummary && (
          <div className="flex justify-center sm:justify-end p-4 sm:p-6 border-t border-zinc-800">
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
          </div>
        )}
      
        {(isLoading || error || !dailySummary) && (
          <div className="flex justify-center sm:justify-end p-4 sm:p-6 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}