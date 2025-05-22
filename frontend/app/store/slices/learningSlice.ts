import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TopicItem {
  topic_id: string;
  title: string;
  description: string;
  category: string;
  expertise_level: string;
  generated_date: string;
  importance: string;
  relevance: string;
  viewed?: boolean;
}

export interface CategoryTopics {
  [category: string]: TopicItem[];
}

export interface TopicResponse {
  user_id?: string;
  expertise_level?: string;
  selected_categories?: string[];
  recommendations: CategoryTopics;
  refreshed_at: string;
}

export interface TopicDetailResponse {
  description: string;
  introduction: string;
  background: string;
  application: string;
  related_concepts: RelatedConcept[];
  article?: {
    content: string;
    tooltip_words: TooltipWord[];
    references: string[];
  };
}

export interface TooltipWord {
  word: string;
  tooltip: string;
}

export interface RelatedConcept {
  term: string;
  id: string;
  definition: string;
  category: string;
}

export interface DailySummary {
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

interface LearningState {
  topics: CategoryTopics;
  filteredTopics: TopicItem[];
  currentTopic: TopicDetailResponse | null;
  loading: boolean;
  filterLoading: boolean; // New loading state for filtering
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  bookmarkedTopics: string[];
  readTopics: string[];
  categories: string[];
  dailySummary: DailySummary | null;
  dailySummaryLoading: boolean;
  dailySummaryError: string | null;
}

const initialState: LearningState = {
  topics: {},
  filteredTopics: [],
  currentTopic: null,
  loading: false,
  filterLoading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'All',
  currentPage: 1,
  itemsPerPage: 6,
  totalPages: 1,
  bookmarkedTopics: [],
  readTopics: [],
  categories: [],
  dailySummary: null,
  dailySummaryLoading: false,
  dailySummaryError: null
};

// Fetch all topics (initial load)
export const fetchTopics = createAsyncThunk(
  'learning/fetchTopics',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/user/recommendedtopics?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch topics by category filter
export const fetchTopicsByCategory = createAsyncThunk(
  'learning/fetchTopicsByCategory',
  async ({ userId, category }: { userId: string; category: string }, { rejectWithValue }) => {
    try {
      let url = `http://127.0.0.1:8000/user/recommendedtopics?user_id=${userId}`;
      
      // If category is 'All', fetch all topics
      if (category === 'All') {
        console.log('Fetching all topics with URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        
        const data = await response.json();
        console.log('All topics API response:', data);
        return { data, category: 'All' };
      }
      
      // Fetch topics for specific category
      // Convert category to lowercase for API call
      const categoryParam = category.toLowerCase();
      url += `&category=${encodeURIComponent(categoryParam)}`;
      
      console.log('Fetching category topics with URL:', url);
      console.log('Category parameter:', categoryParam);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topics for category: ${category}`);
      }
      
      const data = await response.json();
      console.log(`Category ${category} API response:`, data);
      return { data, category };
    } catch (error: any) {
      console.error('Error in fetchTopicsByCategory:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopicDetail = createAsyncThunk(
  'learning/fetchTopicDetail',
  async ({ topicId, userId }: { topicId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/article/topic/${topicId}?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch topic details');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserTopicsStatus = createAsyncThunk(
  'learning/fetchUserTopicsStatus',
  async (userId: string, { rejectWithValue }) => {
    try {
      const bookmarkedTopics: string[] = [];
      const readTopics: string[] = [];
      
      return { bookmarkedTopics, readTopics };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDailySummary = createAsyncThunk(
  'learning/fetchDailySummary',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/summary?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily summary');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; 
      applySearchFilter(state);
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      // Only update if it's actually different
      if (state.selectedCategory !== action.payload) {
        state.selectedCategory = action.payload;
        state.currentPage = 1;
      }
      // Don't apply filters here - this will be handled by the async action
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (state.bookmarkedTopics.includes(topicId)) {
        state.bookmarkedTopics = state.bookmarkedTopics.filter(id => id !== topicId);
      } else {
        state.bookmarkedTopics.push(topicId);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (!state.readTopics.includes(topicId)) {
        state.readTopics.push(topicId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<TopicResponse>) => {
        state.loading = false;
        state.topics = action.payload.recommendations || {};
        state.categories = Object.keys(state.topics);
        
        // If no category is selected or 'All' is selected, show all topics
        if (state.selectedCategory === 'All') {
          applyFiltersForAllTopics(state);
        }
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch topics by category
      .addCase(fetchTopicsByCategory.pending, (state) => {
        state.filterLoading = true;
        state.error = null;
      })
      .addCase(fetchTopicsByCategory.fulfilled, (state, action) => {
        state.filterLoading = false;
        const { data, category } = action.payload;
        
        console.log('Category API Response:', { data, category }); // Debug log
        
        if (category === 'All') {
          // Update all topics
          state.topics = data.recommendations || {};
          state.categories = Object.keys(state.topics);
          applyFiltersForAllTopics(state);
        } else {
          // Update topics for specific category
          if (data.recommendations && Object.keys(data.recommendations).length > 0) {
            // Merge new topics with existing ones
            state.topics = { ...state.topics, ...data.recommendations };
            
            // Find topics for the selected category (convert to lowercase for matching)
            const categoryKey = Object.keys(data.recommendations).find(
              key => key.toLowerCase() === category.toLowerCase()
            ) || category;
            
            console.log('Looking for category:', category, 'Found key:', categoryKey); // Debug log
            console.log('Available topics for category:', data.recommendations[categoryKey]); // Debug log
            
            if (data.recommendations[categoryKey] && Array.isArray(data.recommendations[categoryKey])) {
              state.filteredTopics = data.recommendations[categoryKey];
            } else {
              // If direct match fails, try to find topics in any category
              let allTopicsForCategory: TopicItem[] = [];
              Object.values(data.recommendations).forEach(categoryTopics => {
                if (Array.isArray(categoryTopics)) {
                  allTopicsForCategory = [...allTopicsForCategory, ...categoryTopics];
                }
              });
              state.filteredTopics = allTopicsForCategory;
            }
          } else {
            console.log('No recommendations found in response'); // Debug log
            state.filteredTopics = [];
          }
          
          // Apply search filter if there's a search term
          if (state.searchTerm.trim() !== '') {
            applySearchFilter(state);
          }
          
          // Update pagination
          updatePagination(state);
        }
        
        console.log('Final filtered topics:', state.filteredTopics); // Debug log
      })
      .addCase(fetchTopicsByCategory.rejected, (state, action) => {
        state.filterLoading = false;
        state.error = action.payload as string;
      })
      
      // Other existing cases...
      .addCase(fetchTopicDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicDetail.fulfilled, (state, action: PayloadAction<TopicDetailResponse>) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchUserTopicsStatus.fulfilled, (state, action) => {
        const { bookmarkedTopics, readTopics } = action.payload as { 
          bookmarkedTopics: string[]; 
          readTopics: string[] 
        };
        state.bookmarkedTopics = bookmarkedTopics;
        state.readTopics = readTopics;
      })
      
      .addCase(fetchDailySummary.pending, (state) => {
        state.dailySummaryLoading = true;
        state.dailySummaryError = null;
      })
      .addCase(fetchDailySummary.fulfilled, (state, action: PayloadAction<DailySummary>) => {
        state.dailySummaryLoading = false;
        state.dailySummaryError = null;
        state.dailySummary = action.payload;
      })
      .addCase(fetchDailySummary.rejected, (state, action) => {
        state.dailySummaryLoading = false;
        state.dailySummaryError = action.payload as string;
      });
  },
});

// Helper functions
function applyFiltersForAllTopics(state: LearningState) {
  let filtered: TopicItem[] = [];
  
  console.log('All topics in state:', state.topics); // Debug log
  
  // Combine all topics from all categories
  Object.entries(state.topics).forEach(([categoryName, categoryTopics]) => {
    console.log(`Processing category ${categoryName}:`, categoryTopics); // Debug log
    if (Array.isArray(categoryTopics)) {
      filtered = [...filtered, ...categoryTopics];
    }
  });
  
  console.log('Combined filtered topics:', filtered); // Debug log
  
  state.filteredTopics = filtered;
  
  // Apply search filter if there's a search term
  if (state.searchTerm.trim() !== '') {
    applySearchFilter(state);
  }
  
  updatePagination(state);
}

function applySearchFilter(state: LearningState) {
  if (state.searchTerm.trim() === '') {
    return;
  }
  
  const searchTerm = state.searchTerm.toLowerCase();
  state.filteredTopics = state.filteredTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm) || 
    topic.description.toLowerCase().includes(searchTerm)
  );
  
  updatePagination(state);
}

function updatePagination(state: LearningState) {
  state.totalPages = Math.ceil(state.filteredTopics.length / state.itemsPerPage);
  if (state.currentPage > state.totalPages && state.totalPages > 0) {
    state.currentPage = state.totalPages;
  }
}

export const { 
  setSearchTerm, 
  setSelectedCategory, 
  setCurrentPage, 
  clearCurrentTopic,
  toggleBookmark,
  markAsRead
} = learningSlice.actions;

export default learningSlice.reducer;