"use client"

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { 
  fetchTopics, 
  fetchTopicDetail, 
  clearCurrentTopic,
  fetchUserTopicsStatus,
  bookmarkTopic,
  markTopicAsRead,
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  toggleBookmark,
  markAsRead,
  TopicItem,
  RelatedConcept
} from '@/app/store/slices/learningSlice';

// Import components
import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import ConceptModal from './components/ConceptModal';
import DailySummaryModal from './components/DailySummaryModal';
import QuizModal from './components/QuizModal';
import SearchAndFilters from './components/SearchAndFilters';
import Pagination from './components/Pagination';
import NoResults from './components/NoResults';

// Example data for daily summary and quiz, since we're not implementing that API
import { dailySummary } from './mockData';

const LearningHub = () => {
  // Get state from Redux store
  const dispatch = useAppDispatch();
  const { 
    topics, 
    filteredTopics,
    currentTopic,
    loading, 
    error,
    searchTerm,
    selectedCategory,
    currentPage,
    itemsPerPage,
    totalPages,
    bookmarkedTopics,
    readTopics
  } = useAppSelector(state => state.learning);
  
  const { user } = useAppSelector(state => state.auth);
  
  // Local state
  const [selectedTopicItem, setSelectedTopicItem] = useState<TopicItem | null>(null);
  const [showConcept, setShowConcept] = useState<RelatedConcept | null>(null);
  const [showDailySummary, setShowDailySummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  
  // Fetch topics and user status on initial load
  useEffect(() => {
    dispatch(fetchTopics());
    
    // If user is logged in, fetch their bookmarked and read topics
    if (user?.uid) {
      dispatch(fetchUserTopicsStatus(user.uid));
    }
  }, [dispatch, user]);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTopics.slice(startIndex, endIndex);
  };
  
  // Get unique categories from topics
  const getCategories = () => {
    const categoriesSet = new Set<string>();
    topics.forEach(topic => {
      if (topic.category) {
        categoriesSet.add(topic.category);
      }
    });
    return Array.from(categoriesSet);
  };
  
  // Handler for search term change
  const handleSearchChange = (term: string) => {
    dispatch(setSearchTerm(term));
  };
  
  // Handler for category change
  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category));
  };
  
  // Handler for page change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };
  
  // Handler for article selection
  const handleArticleSelect = (topic: TopicItem) => {
    setSelectedTopicItem(topic);
    dispatch(fetchTopicDetail(topic.topic_id));
    
    // Mark as read in local state
    dispatch(markAsRead(topic.topic_id));
    
    // If user is logged in, update on server
    if (user?.uid) {
      dispatch(markTopicAsRead({ userId: user.uid, topicId: topic.topic_id }));
    }
  };
  
  // Handler for bookmark toggle
  const handleBookmarkToggle = (topicId: string) => {
    // Update in local state
    dispatch(toggleBookmark(topicId));
    
    // If user is logged in, update on server
    if (user?.uid) {
      dispatch(bookmarkTopic({ userId: user.uid, topicId }));
    }
  };
  
  // Handler for concept click
  const handleConceptClick = (concept: RelatedConcept) => {
    setShowConcept(concept);
  };
  
  // Handler for reset filters
  const handleResetFilters = () => {
    dispatch(setSearchTerm(''));
    dispatch(setSelectedCategory('All'));
  };
  
  // Close article view and clear current topic
  const handleCloseArticleView = () => {
    setSelectedTopicItem(null);
    dispatch(clearCurrentTopic());
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Hub</h1>
        <p className="text-gray-400 mb-6">Your personalized financial knowledge center</p>
        
        {/* Top section with search and filters - Only show when no article is selected */}
        {!selectedTopicItem && (
          <SearchAndFilters 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={getCategories()}
            onDailySummaryOpen={() => setShowDailySummary(true)}
          />
        )}
        
        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Loading state */}
          {loading && !selectedTopicItem && (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && !selectedTopicItem && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Content</h3>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={() => dispatch(fetchTopics())}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Articles grid */}
          {!selectedTopicItem && !loading && !error && (
            <>
              {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentPageItems().map((topic) => (
                    <ArticleCard 
                      key={topic.topic_id}
                      topic={topic}
                      onArticleSelect={handleArticleSelect}
                      onBookmarkToggle={handleBookmarkToggle}
                      onMarkAsRead={(topicId) => dispatch(markAsRead(topicId))}
                      isBookmarked={bookmarkedTopics.includes(topic.topic_id)}
                      isRead={readTopics.includes(topic.topic_id)}
                    />
                  ))}
                </div>
              ) : (
                <NoResults 
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  onReset={handleResetFilters}
                />
              )}
              
              {/* Pagination */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
          
          {/* Article view */}
          {selectedTopicItem && (
            <ArticleView 
              topic={selectedTopicItem}
              topicDetail={currentTopic}
              loading={loading}
              error={error}
              onClose={handleCloseArticleView}
              onBookmarkToggle={handleBookmarkToggle}
              onConceptClick={handleConceptClick}
              isBookmarked={bookmarkedTopics.includes(selectedTopicItem.topic_id)}
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