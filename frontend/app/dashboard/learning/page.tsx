"use client"

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { 
  fetchTopics, 
  fetchTopicDetail, 
  fetchUserTopicsStatus,
  fetchTopicsByCategory, // New import
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  markAsRead,
  fetchDailySummary,
  TopicItem,
  RelatedConcept
} from '@/app/store/slices/learningSlice';

import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import ConceptModal from './components/ConceptModal';
import DailySummaryModal from './components/DailySummaryModal';
import QuizModal from './components/QuizModal';
import SearchAndFilters from './components/SearchAndFilters';
import Pagination from './components/Pagination';
import NoResults from './components/NoResults';

const LearningHub = () => {
  const dispatch = useAppDispatch();
  const { 
    topics, 
    filteredTopics,
    loading, 
    filterLoading, // New loading state for filtering
    error,
    searchTerm,
    selectedCategory,
    currentPage,
    itemsPerPage,
    totalPages,
    readTopics,
    categories,
    dailySummary,
    dailySummaryLoading,
    dailySummaryError 
  } = useAppSelector(state => state.learning);
  
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedTopicItem, setSelectedTopicItem] = useState<TopicItem | null>(null);
  const [topicDetail, setTopicDetail] = useState<any>(null);
  const [showConcept, setShowConcept] = useState<RelatedConcept | null>(null);
  const [showDailySummary, setShowDailySummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [topicDetailLoading, setTopicDetailLoading] = useState(false);
  const [topicDetailError, setTopicDetailError] = useState<string | null>(null);
  const lastCategoryRef = useRef<string>('');
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Initial data fetch
  useEffect(() => {
    if (user?.uid && Object.keys(topics).length === 0 && !loading && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      dispatch(fetchTopics(user.uid));
      dispatch(fetchUserTopicsStatus(user.uid));
    }
  }, [dispatch, user, topics, loading]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      lastCategoryRef.current = '';
      isInitialLoadRef.current = true;
    };
  }, []);
  
  // Handle search term changes
  const handleSearchChange = (term: string) => {
    dispatch(setSearchTerm(term));
  };
  
  // Handle category changes with API call
  const handleCategoryChange = useCallback(async (category: string) => {
    if (!user?.uid) return;
    
    // Prevent API call if already loading, if the same category is selected, or if it's the same as last called
    if (filterLoading || selectedCategory === category || lastCategoryRef.current === category) {
      return;
    }
    
    // Update ref to track last category
    lastCategoryRef.current = category;
    
    // Update the selected category in state
    dispatch(setSelectedCategory(category));
    
    // Make API call to fetch topics for the selected category
    try {
      await dispatch(fetchTopicsByCategory({ 
        userId: user.uid, 
        category: category 
      })).unwrap();
    } catch (error) {
      console.error('Error fetching topics for category:', error);
      // Reset ref on error
      lastCategoryRef.current = '';
    }
  }, [user?.uid, filterLoading, selectedCategory, dispatch]);
  
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };
  
  const handleArticleSelect = async (topic: TopicItem) => {
    setSelectedTopicItem(topic);
    setTopicDetailLoading(true);
    setTopicDetailError(null);
    
    try {
      const resultAction = await dispatch(fetchTopicDetail({ 
        topicId: topic.topic_id, 
        userId: user?.uid || '' 
      })).unwrap();
      
      setTopicDetail(resultAction);
    } catch (error) {
      setTopicDetailError('Failed to load topic details');
      console.error('Error fetching topic detail:', error);
    } finally {
      setTopicDetailLoading(false);
    }
    
    dispatch(markAsRead(topic.topic_id));
  };
  
  const handleConceptClick = (concept: RelatedConcept) => {
    setShowConcept(concept);
  };
  
  const handleResetFilters = async () => {
    dispatch(setSearchTerm(''));
    // Only call API if not already on 'All' category
    if (selectedCategory !== 'All') {
      await handleCategoryChange('All');
    }
  };
  
  const handleCloseArticleView = () => {
    setSelectedTopicItem(null);
    setTopicDetail(null);
  };

  const handleDailySummaryOpen = () => {
    if (user?.uid) {
      dispatch(fetchDailySummary(user.uid));
    }
    setShowDailySummary(true);
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTopics.slice(startIndex, endIndex);
  };

  // Prepare capitalized categories for display
  const capitalizedCategories = categories.map(category => 
    category.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );

  // Debug logs
  console.log('Current state:', {
    loading,
    filterLoading,
    error,
    selectedCategory,
    categoriesCount: categories.length,
    filteredTopicsCount: filteredTopics.length,
    totalTopics: Object.keys(topics).length
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Hub</h1>
        <p className="text-gray-400 mb-8">Your personalized financial knowledge center</p>
        
        {/* Top section with search and filters - Only show when no article is selected */}
        {!selectedTopicItem && (
          <SearchAndFilters 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={capitalizedCategories}
            onDailySummaryOpen={handleDailySummaryOpen}
          />
        )}
        
        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Loading state for initial load */}
          {loading && !selectedTopicItem && (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-4 text-gray-400">Loading topics...</span>
            </div>
          )}
          
          {/* Loading state for category filtering */}
          {filterLoading && !selectedTopicItem && (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-4 text-gray-400">Filtering topics...</span>
            </div>
          )}
          
          {/* Error state */}
          {error && !selectedTopicItem && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Content</h3>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={() => user?.uid && dispatch(fetchTopics(user.uid))}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Articles grid */}
          {!selectedTopicItem && !loading && !filterLoading && !error && (
            <>
              {filteredTopics && filteredTopics.length > 0 ? (
                <>
                  {/* Grid layout for all articles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getCurrentPageItems().map((topic) => (
                      <div 
                        key={topic.topic_id} 
                        onClick={() => handleArticleSelect(topic)} 
                        className="h-full"
                      >
                        <ArticleCard 
                          topicId={topic.topic_id}
                          topicTitle={topic.title}
                          topicDescription={topic.description}
                          category={topic.category}
                          level={topic.expertise_level}
                          isRead={readTopics.includes(topic.topic_id)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <>
                  {/* Debug information */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Debug Info:</h4>
                    <pre className="text-xs text-gray-300">
                      {JSON.stringify({
                        selectedCategory,
                        categoriesAvailable: categories,
                        totalTopicsInState: Object.keys(topics).length,
                        filteredTopicsCount: filteredTopics.length,
                        searchTerm: searchTerm
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <NoResults 
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onReset={handleResetFilters}
                  />
                </>
              )}
            </>
          )}
          
          {/* Article view */}
          {selectedTopicItem && (
            <ArticleView 
              topic={selectedTopicItem}
              topicDetail={topicDetail}
              loading={topicDetailLoading}
              error={topicDetailError}
              onClose={handleCloseArticleView}
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
        isLoading={dailySummaryLoading}
        error={dailySummaryError}
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