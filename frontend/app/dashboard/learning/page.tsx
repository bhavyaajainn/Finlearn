"use client"

import { useEffect, useState } from 'react';
import { Article, Concept, articles, dailySummary, userPreferences } from './mockData';
import {
  ArticleCard,
  ArticleView,
  ConceptModal,
  DailySummaryModal,
  QuizModal,
  SearchAndFilters
} from './components';

const LearningHub = () => {
  // Articles state
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // UI state
  const [showConcept, setShowConcept] = useState<Concept | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDailySummary, setShowDailySummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Initialize and filter articles
  useEffect(() => {
    filterArticles();
  }, [searchTerm, selectedCategory]);

  const filterArticles = () => {
    let result = [...articles];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(article => article.category === selectedCategory);
    }
    
    // Filter by search term
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

  // Article handlers
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

  // Handler for concept click
  const handleConceptClick = (concept: Concept) => {
    setShowConcept(concept);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Hub</h1>
        <p className="text-gray-400 mb-6">Your personalized financial knowledge center</p>
        
        {/* Top section with search and filters - Only show when no article is selected */}
        {!selectedArticle && (
          <SearchAndFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={userPreferences.interests}
            onDailySummaryOpen={() => setShowDailySummary(true)}
          />
        )}
        
        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6">
          {!selectedArticle && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard 
                  key={article.id}
                  article={article}
                  onArticleSelect={setSelectedArticle}
                  onBookmarkToggle={toggleBookmark}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
          
          {/* Article view */}
          {selectedArticle && (
            <ArticleView 
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
              onBookmarkToggle={toggleBookmark}
              onConceptClick={handleConceptClick}
            />
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ConceptModal 
        concept={showConcept} 
        onClose={() => setShowConcept(null)} 
      />
      
      <DailySummaryModal 
        dailySummary={dailySummary}
        isOpen={showDailySummary}
        onClose={() => setShowDailySummary(false)}
        onQuizStart={() => {
          setShowDailySummary(false);
          setShowQuiz(true);
        }}
      />
      
      <QuizModal 
        dailySummary={dailySummary}
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
      />
    </div>
  );
};

export default LearningHub;