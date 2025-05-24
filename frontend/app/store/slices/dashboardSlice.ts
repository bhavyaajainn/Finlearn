import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface GlossaryTerm {
  term: string;
  definition: string;  
  example: string;
}

export interface Quote {
  text: string;
  author: string;
}

export interface DashboardEssentials {
  user_id: string;
  expertise_level: string;
  glossary_term: GlossaryTerm[];
  quote: Quote;
  timestamp: string;
}

export interface StreakData {
  current_streak: number;
  user_id: string;
  last_active: string;
  updated_at: string;
  total_articles: number;
  longest_streak: number;
}

export interface StreakResponse {
  user_id: string;
  streak: StreakData;
  fetched_at: string;
}

export interface TrendingNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  published_at: string;
  topics: string[];
}

export interface TrendingNewsResponse {
  user_id: string;
  trending_news: TrendingNewsItem[];
  timestamp: string;
}

export interface WatchlistItem {
  asset_type: string;
  symbol: string;
  added_on: string;
  notes: string;
  name: string;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  currency: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap: number;
}

export interface WatchlistResponse {
  watchlist: WatchlistItem[];
  count: number;
}

interface DashboardState {
  essentials: DashboardEssentials | null;
  streak: StreakData | null;
  watchlist: WatchlistItem[];
  trendingNews: TrendingNewsItem[];
  loading: {
    essentials: boolean;
    streak: boolean;
    watchlist: boolean;
    trendingNews: boolean;
  };
  error: {
    essentials: string | null;
    streak: string | null;
    watchlist: string | null;
    trendingNews: string | null;
  };
}

const initialState: DashboardState = {
  essentials: null,
  streak: null,
  watchlist: [],
  trendingNews: [],
  loading: {
    essentials: false,
    streak: false,
    watchlist: false,
    trendingNews: false,
  },
  error: {
    essentials: null,
    streak: null,
    watchlist: null,
    trendingNews: null,
  },
};

export const fetchDashboardEssentials = createAsyncThunk(
  'dashboard/fetchEssentials',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/home/essential?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard essentials');
      }
      
      const data = await response.json();
      return data as DashboardEssentials;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStreakData = createAsyncThunk(
  'dashboard/fetchStreak',
  async ({ userId, refresh = true }: { userId: string; refresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/streak?user_id=${userId}&refresh=${refresh}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch streak data');
      }
      
      const data: StreakResponse = await response.json();
      return data.streak;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrendingNews = createAsyncThunk(
  'dashboard/fetchTrendingNews',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/home/news?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending news');
      }
      
      const data: TrendingNewsResponse = await response.json();
      return data.trending_news;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWatchlist = createAsyncThunk(
  'dashboard/fetchWatchlist',
  async ({ userId, limit = 5 }: { userId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/watchlist?user_id=${userId}&include_similar=false`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      
      const data: WatchlistResponse = await response.json();
      return data.watchlist.slice(0, limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.essentials = null;
      state.streak = null;
      state.watchlist = [];
      state.trendingNews = [];
      state.error = {
        essentials: null,
        streak: null,
        watchlist: null,
        trendingNews: null,
      };
    },
    updateStreakData: (state, action: PayloadAction<Partial<StreakData>>) => {
      if (state.streak) {
        state.streak = { ...state.streak, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardEssentials.pending, (state) => {
        state.loading.essentials = true;
        state.error.essentials = null;
      })
      .addCase(fetchDashboardEssentials.fulfilled, (state, action) => {
        state.loading.essentials = false;
        state.essentials = action.payload;
      })
      .addCase(fetchDashboardEssentials.rejected, (state, action) => {
        state.loading.essentials = false;
        state.error.essentials = action.payload as string;
      })
      
      .addCase(fetchStreakData.pending, (state) => {
        state.loading.streak = true;
        state.error.streak = null;
      })
      .addCase(fetchStreakData.fulfilled, (state, action) => {
        state.loading.streak = false;
        state.streak = action.payload;
      })
      .addCase(fetchStreakData.rejected, (state, action) => {
        state.loading.streak = false;
        state.error.streak = action.payload as string;
        state.streak = {
          current_streak: 0,
          longest_streak: 0,
          total_articles: 0,
          user_id: '',
          last_active: '',
          updated_at: ''
        };
      })
      
      .addCase(fetchTrendingNews.pending, (state) => {
        state.loading.trendingNews = true;
        state.error.trendingNews = null;
      })
      .addCase(fetchTrendingNews.fulfilled, (state, action) => {
        state.loading.trendingNews = false;
        state.trendingNews = action.payload;
      })
      .addCase(fetchTrendingNews.rejected, (state, action) => {
        state.loading.trendingNews = false;
        state.error.trendingNews = action.payload as string;
      })
      
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading.watchlist = true;
        state.error.watchlist = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading.watchlist = false;
        state.watchlist = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading.watchlist = false;
        state.error.watchlist = action.payload as string;
      });
  },
});

export const { clearDashboardData, updateStreakData } = dashboardSlice.actions;
export default dashboardSlice.reducer;