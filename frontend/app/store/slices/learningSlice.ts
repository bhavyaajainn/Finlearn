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
  filterLoading: boolean;
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
  lastFetchedCategory: string | null; // Add this to track last fetched category
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
  dailySummaryError: null,
  lastFetchedCategory: null,
};

// Add meta to track if request was aborted
let lastFetchController: AbortController | null = null;

export const fetchTopics = createAsyncThunk(
  'learning/fetchTopics',
  async (userId: string, { rejectWithValue, signal }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/recommendedtopics?user_id=${userId}`, {
        signal
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopicsByCategory = createAsyncThunk(
  'learning/fetchTopicsByCategory',
  async ({ userId, category }: { userId: string; category: string }, { rejectWithValue, signal, getState }) => {
    const state = getState() as { learning: LearningState };
    
    // Prevent duplicate requests for the same category
    if (state.learning.lastFetchedCategory === category && state.learning.filterLoading) {
      return rejectWithValue('Request already in progress');
    }

    // Cancel previous request if exists
    if (lastFetchController) {
      lastFetchController.abort();
    }
    
    lastFetchController = new AbortController();
    
    try {
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/user/recommendedtopics?user_id=${userId}`;
      
      if (category !== 'All') {
        const categoryParam = category.toLowerCase();
        url += `&category=${encodeURIComponent(categoryParam)}`;
      }
      
      const response = await fetch(url, {
        signal: lastFetchController.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topics for category: ${category}`);
      }
      
      const data = await response.json();
      return { data, category };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopicDetail = createAsyncThunk(
  'learning/fetchTopicDetail',
  async ({ topicId, userId }: { topicId: string; userId: string }, { rejectWithValue, signal }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/article/topic/${topicId}?user_id=${userId}`, {
        signal
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch topic details');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
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
  async (userId: string, { rejectWithValue, signal }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/summary?user_id=${userId}`, {
        signal
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily summary');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
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
      if (state.selectedCategory !== action.payload) {
        state.selectedCategory = action.payload;
        state.currentPage = 1;
        state.lastFetchedCategory = null; // Reset to allow refetch
      }
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
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<TopicResponse>) => {
        state.loading = false;
        state.topics = action.payload.recommendations || {};
        state.categories = Object.keys(state.topics);
      
        if (state.selectedCategory === 'All') {
          applyFiltersForAllTopics(state);
        }
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        if (action.payload !== 'Request aborted') {
          state.error = action.payload as string;
        }
      })
     
      .addCase(fetchTopicsByCategory.pending, (state, action) => {
        state.filterLoading = true;
        state.error = null;
        state.lastFetchedCategory = action.meta.arg.category;
      })
      .addCase(fetchTopicsByCategory.fulfilled, (state, action) => {
        state.filterLoading = false;
        const { data, category } = action.payload;
        
        if (category === 'All') {
          state.topics = data.recommendations || {};
          state.categories = Object.keys(state.topics);
          applyFiltersForAllTopics(state);
        } else {
          if (data.recommendations && Object.keys(data.recommendations).length > 0) {
            state.topics = { ...state.topics, ...data.recommendations };
         
            const categoryKey = Object.keys(data.recommendations).find(
              key => key.toLowerCase() === category.toLowerCase()
            ) || category;
            
            if (data.recommendations[categoryKey] && Array.isArray(data.recommendations[categoryKey])) {
              state.filteredTopics = data.recommendations[categoryKey];
            } else {
              let allTopicsForCategory: TopicItem[] = [];
              Object.values(data.recommendations).forEach(categoryTopics => {
                if (Array.isArray(categoryTopics)) {
                  allTopicsForCategory = [...allTopicsForCategory, ...categoryTopics];
                }
              });
              state.filteredTopics = allTopicsForCategory;
            }
          } else {
            state.filteredTopics = [];
          }
          
          if (state.searchTerm.trim() !== '') {
            applySearchFilter(state);
          }
          
          updatePagination(state);
        }
      })
      .addCase(fetchTopicsByCategory.rejected, (state, action) => {
        state.filterLoading = false;
        if (action.payload !== 'Request aborted' && action.payload !== 'Request already in progress') {
          state.error = action.payload as string;
        }
      })
      
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
        if (action.payload !== 'Request aborted') {
          state.error = action.payload as string;
        }
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
        if (action.payload !== 'Request aborted') {
          state.dailySummaryError = action.payload as string;
        }
      });
  },
});

function applyFiltersForAllTopics(state: LearningState) {
  let filtered: TopicItem[] = [];
  Object.entries(state.topics).forEach(([categoryName, categoryTopics]) => {
    if (Array.isArray(categoryTopics)) {
      filtered = [...filtered, ...categoryTopics];
    }
  });
  
  state.filteredTopics = filtered;
  
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