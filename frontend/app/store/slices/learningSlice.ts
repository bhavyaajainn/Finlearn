import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types for our learning content
export interface Topic {
  category: string;
  level: string;
  topics: TopicItem[];
}

export interface TopicItem {
  topic_id: string;
  title: string;
  description: string;
  category: string;
  expertise_level:string
  level: string; // Updated from 'expertise_level' to 'level' for consistency
  importance: string;
  relevance: string;
  date_published: string; // Updated from 'generated_date' to 'date_published' for clarity
}

export interface TopicDetailResponse {
  description: string;
  introduction: string;
  background: string;
  application: string;
  related_concepts: RelatedConcept[];
}

export interface RelatedConcept {
  term: string;
  id: string;
  definition: string;
  category: string;
}

// State interface
interface LearningState {
  topics: TopicItem[];
  filteredTopics: TopicItem[];
  currentTopic: TopicDetailResponse | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  bookmarkedTopics: string[];
  readTopics: string[];
}

// Initial state
const initialState: LearningState = {
  topics: [],
  filteredTopics: [],
  currentTopic: null,
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'All',
  currentPage: 1,
  itemsPerPage: 6,
  totalPages: 1,
  bookmarkedTopics: [],
  readTopics: []
};

// Async thunks
export const fetchTopics = createAsyncThunk(
  'learning/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      // The URL seen in the screenshot
      const response = await fetch('https://finlearn.onrender.com/dailytopics?user_id=bhavya&category=crypto&level=beginner');
      
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

export const fetchTopicDetail = createAsyncThunk(
  'learning/fetchTopicDetail',
  async (topicId: string, { rejectWithValue }) => {
    try {
      // Assuming there's an endpoint for topic details
      const response = await fetch(`https://finlearn.onrender.com/topic/${topicId}`);
      
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

export const bookmarkTopic = createAsyncThunk(
  'learning/bookmarkTopic',
  async ({ userId, topicId }: { userId: string; topicId: string }, { rejectWithValue }) => {
    try {
      // Mocked API call for now
      // In a real implementation, we would call the API
      // const result = await ApiService.bookmarkTopic(userId, topicId);
      
      // Mocked successful response
      const result = { success: true };
      
      if (result.success) {
        return topicId;
      } else {
        throw new Error('Failed to bookmark topic');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markTopicAsRead = createAsyncThunk(
  'learning/markTopicAsRead',
  async ({ userId, topicId }: { userId: string; topicId: string }, { rejectWithValue }) => {
    try {
      // Mocked API call for now
      // In a real implementation, we would call the API
      // const result = await ApiService.markTopicAsRead(userId, topicId);
      
      // Mocked successful response
      const result = { success: true };
      
      if (result.success) {
        return topicId;
      } else {
        throw new Error('Failed to mark topic as read');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserTopicsStatus = createAsyncThunk(
  'learning/fetchUserTopicsStatus',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Mocked API calls for now
      // In a real implementation, we would call the API
      // const [bookmarkedTopics, readTopics] = await Promise.all([
      //   ApiService.getBookmarkedTopics(userId),
      //   ApiService.getReadTopics(userId)
      // ]);
      
      // Mocked data
      const bookmarkedTopics: string[] = [];
      const readTopics: string[] = [];
      
      return { bookmarkedTopics, readTopics };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
      // Apply filters
      applyFilters(state);
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1; // Reset to first page when changing category
      // Apply filters
      applyFilters(state);
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
      // Fetch topics cases
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<Topic>) => {
        state.loading = false;
        // Extract topics array from the response
        state.topics = action.payload.topics || [];
        
        // Apply filters and pagination
        applyFilters(state);
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch topic detail cases
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
      
      // Bookmark topic cases
      .addCase(bookmarkTopic.fulfilled, (state, action) => {
        const topicId = action.payload as string;
        if (!state.bookmarkedTopics.includes(topicId)) {
          state.bookmarkedTopics.push(topicId);
        }
      })
      
      // Mark topic as read cases
      .addCase(markTopicAsRead.fulfilled, (state, action) => {
        const topicId = action.payload as string;
        if (!state.readTopics.includes(topicId)) {
          state.readTopics.push(topicId);
        }
      })
      
      // Fetch user topics status cases
      .addCase(fetchUserTopicsStatus.fulfilled, (state, action) => {
        const { bookmarkedTopics, readTopics } = action.payload as { 
          bookmarkedTopics: string[]; 
          readTopics: string[] 
        };
        state.bookmarkedTopics = bookmarkedTopics;
        state.readTopics = readTopics;
      });
  },
});

// Helper function to apply filters (search term, category) and pagination
function applyFilters(state: LearningState) {
  let filtered = [...state.topics];
  
  // Apply category filter if not "All"
  if (state.selectedCategory !== 'All') {
    filtered = filtered.filter(topic => topic.category === state.selectedCategory);
  }
  
  // Apply search filter
  if (state.searchTerm.trim() !== '') {
    const searchTerm = state.searchTerm.toLowerCase();
    filtered = filtered.filter(topic => 
      topic.title.toLowerCase().includes(searchTerm) || 
      topic.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Update filtered topics
  state.filteredTopics = filtered;
  
  // Update pagination info
  state.totalPages = Math.ceil(filtered.length / state.itemsPerPage);
  if (state.currentPage > state.totalPages && state.totalPages > 0) {
    state.currentPage = state.totalPages;
  }
}

// Export actions and reducer
export const { 
  setSearchTerm, 
  setSelectedCategory, 
  setCurrentPage, 
  clearCurrentTopic,
  toggleBookmark,
  markAsRead
} = learningSlice.actions;

export default learningSlice.reducer;