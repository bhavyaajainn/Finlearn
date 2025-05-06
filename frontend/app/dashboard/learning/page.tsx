"use client"

import { Search, Award, CheckCircle, BookmarkCheck, Bookmark, Clock, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Article, articles, Concept, dailySummary, userPreferences } from './mockData';


const LearningHub = () => {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showConcept, setShowConcept] = useState<Concept | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDailySummary, setShowDailySummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  
  useEffect(() => {
    filterArticles();
  }, [searchTerm, selectedCategory]);

  const filterArticles = () => {
    let result = [...articles];
    
    
    if (selectedCategory !== 'All') {
      result = result.filter(article => article.category === selectedCategory);
    }
    
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        article => 
          article.title.toLowerCase().includes(term) || 
          article.summary.toLowerCase().includes(term)
      );
    }
    
    setFilteredArticles(result);
  };

  const toggleBookmark = (articleId: string) => {
      const updatedArticles = filteredArticles.map((article) => 
        article.id === articleId 
          ? { ...article, isBookmarked: !article.isBookmarked } 
          : article
      );
      setFilteredArticles(updatedArticles);
    };

  const markAsRead = (articleId: string) => {
    const updatedArticles = filteredArticles.map(article => 
      article.id === articleId 
        ? { ...article, isRead: true } 
        : article
    );
    setFilteredArticles(updatedArticles);
  };

  const handleConceptClick = (concept: Concept) => {
    setShowConcept(concept);
  };

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
  
  
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!quizSubmitted) {
      setUserAnswers({
        ...userAnswers,
        [questionId]: optionIndex
      });
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const calculateQuizScore = () => {
    let score = 0;
    dailySummary.quiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswerIndex) {
        score += 1;
      }
    });
    return score;
  };

  
  const getOptionClasses = (questionId: string, optionIndex: number, correctIndex: number) => {
    const baseClasses = "p-3 rounded-lg border cursor-pointer transition-colors";
    
    if (!quizSubmitted) {
      return `${baseClasses} ${
        userAnswers[questionId] === optionIndex 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
          : 'bg-zinc-700 border-zinc-600 text-gray-300 hover:bg-zinc-600'
      }`;
    } else {
      if (optionIndex === correctIndex) {
        return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-400`;
      } else if (userAnswers[questionId] === optionIndex) {
        return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-400`;
      } else {
        return `${baseClasses} bg-zinc-700 border-zinc-600 text-gray-300`;
      }
    }
  };

  
  const closeQuiz = () => {
    setShowQuiz(false);
    resetQuiz();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Hub</h1>
        <p className="text-gray-400 mb-6">Your personalized financial knowledge center</p>
        
        {/* Top section with search and filters - Only show when no article is selected */}
        {!selectedArticle && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Search bar */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-sm ${selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
              >
                All
              </button>
              {userPreferences.interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => setSelectedCategory(interest)}
                  className={`px-4 py-2 rounded-full text-sm ${selectedCategory === interest 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
            
            {/* Daily summary button */}
            <button
              onClick={() => setShowDailySummary(true)}
              className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg"
            >
              <Award className="h-5 w-5 mr-2" />
              Daily Summary
            </button>
          </div>
        )}
        
        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6">
          {!selectedArticle && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
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
                      <button onClick={() => toggleBookmark(article.id)}>
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
                          setSelectedArticle(article);
                          markAsRead(article.id);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      >
                        Read article
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Article view */}
          {selectedArticle && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-white flex items-center"
                >
                  <X className="h-5 w-5 mr-1" />
                  Back to articles
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedArticle.readTime} min read
                  </div>
                  
                  <button onClick={() => toggleBookmark(selectedArticle.id)}>
                    {selectedArticle.isBookmarked ? (
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
                    {selectedArticle.category} · {selectedArticle.level}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {selectedArticle.title}
                </h1>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-semibold text-white mt-8 mb-4">Introduction</h2>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightConcepts(selectedArticle.content.introduction, selectedArticle.relatedConcepts) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                      const concept = selectedArticle.relatedConcepts.find(
                        c => c.id === target.dataset.conceptId
                      );
                      if (concept) handleConceptClick(concept);
                    }
                  }}
                  className="text-gray-300 mb-6"
                />
                
                <h2 className="text-xl font-semibold text-white mt-8 mb-4">Background</h2>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightConcepts(selectedArticle.content.background, selectedArticle.relatedConcepts) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                      const concept = selectedArticle.relatedConcepts.find(
                        c => c.id === target.dataset.conceptId
                      );
                      if (concept) handleConceptClick(concept);
                    }
                  }}
                  className="text-gray-300 mb-6"
                />
                
                <h2 className="text-xl font-semibold text-white mt-8 mb-4">Current Applications</h2>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightConcepts(selectedArticle.content.application, selectedArticle.relatedConcepts) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'SPAN' && target.dataset.conceptId) {
                      const concept = selectedArticle.relatedConcepts.find(
                        c => c.id === target.dataset.conceptId
                      );
                      if (concept) handleConceptClick(concept);
                    }
                  }}
                  className="text-gray-300 mb-6"
                />
                
                <div className="mt-10 bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Related Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.relatedConcepts.map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => handleConceptClick(concept)}
                        className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full hover:bg-blue-500/20"
                      >
                        {concept.term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Concept modal */}
      {showConcept && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">{showConcept.term}</h3>
              <button 
                onClick={() => setShowConcept(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                {showConcept.category}
              </span>
            </div>
            
            <p className="text-gray-300">{showConcept.definition}</p>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowConcept(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Daily summary modal */}
      {showDailySummary && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-white">Your Learning Summary</h3>
              <button 
                onClick={() => setShowDailySummary(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Articles You've Read
              </h4>
              {dailySummary.articlesRead.length > 0 ? (
                <ul className="space-y-2">
                  {dailySummary.articlesRead.map((title, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-gray-300">{title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">You haven't read any articles today.</p>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Concepts You've Learned
              </h4>
              {dailySummary.conceptsLearned.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dailySummary.conceptsLearned.map((term, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
                      {term}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't learned any new concepts today.</p>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  setShowDailySummary(false);
                  setShowQuiz(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
              >
                Take Daily Quiz
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
              
              <button
                onClick={() => setShowDailySummary(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Improved Quiz modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6 flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-2xl font-semibold text-white">Daily Quiz</h3>
              <button 
                onClick={closeQuiz}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 mb-6 space-y-8" style={{ height: '60vh', overflowY: 'scroll' }}>
              {dailySummary.quiz.questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-white font-medium mb-4">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={getOptionClasses(question.id, optionIndex, question.correctAnswerIndex)}
                        onClick={() => handleAnswerSelect(question.id, optionIndex)}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-3 ${
                            quizSubmitted && optionIndex === question.correctAnswerIndex 
                              ? 'bg-green-500 text-white' 
                              : quizSubmitted && userAnswers[question.id] === optionIndex 
                              ? 'bg-red-500 text-white'
                              : userAnswers[question.id] === optionIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-zinc-600 text-gray-300'
                          }`}>
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <div className="flex-grow">{option}</div>
                          {quizSubmitted && optionIndex === question.correctAnswerIndex && (
                            <CheckCircle className="h-5 w-5 text-green-400 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {quizSubmitted && userAnswers[question.id] !== question.correctAnswerIndex && (
                    <div className="mt-3 text-sm text-green-400">
                      <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswerIndex]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800 flex-shrink-0">
              {quizSubmitted && (
                <div className="text-lg font-medium">
                  Your score: <span className="text-blue-400">{calculateQuizScore()}/{dailySummary.quiz.questions.length}</span>
                </div>
              )}
              
              {!quizSubmitted && (
                <div className="text-gray-400 text-sm">
                  {Object.keys(userAnswers).length}/{dailySummary.quiz.questions.length} questions answered
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={closeQuiz}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                >
                  Close
                </button>
                
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                    disabled={Object.keys(userAnswers).length < dailySummary.quiz.questions.length}
                  >
                    Submit Answers
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningHub;