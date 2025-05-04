import { useQuery } from '@tanstack/react-query';
import { fetchCryptoData, fetchDailyGlossaryTerm, fetchFinancialNews, fetchStockData, fetchTrendingCryptos, fetchTrendingStocks } from '../services/api';

// Hook for fetching stock data
export function useStockData(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockData(symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching crypto data
export function useCryptoData(symbol: string) {
  return useQuery({
    queryKey: ['crypto', symbol],
    queryFn: () => fetchCryptoData(symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching financial news
export function useFinancialNews(category?: string, limit = 10) {
  return useQuery({
    queryKey: ['news', category, limit],
    queryFn: () => fetchFinancialNews(category, limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for fetching trending stocks
export function useTrendingStocks(limit = 5) {
  return useQuery({
    queryKey: ['trending', 'stocks', limit],
    queryFn: () => fetchTrendingStocks(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for fetching trending cryptos
export function useTrendingCryptos(limit = 5) {
  return useQuery({
    queryKey: ['trending', 'cryptos', limit],
    queryFn: () => fetchTrendingCryptos(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for fetching the daily glossary term
export function useDailyGlossaryTerm() {
  return useQuery({
    queryKey: ['glossary', 'daily'],
    queryFn: fetchDailyGlossaryTerm,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// Hook for getting a user's watchlist from Firestore
export function useWatchlist(userId: string | null) {
  return useQuery({
    queryKey: ['watchlist', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // This would be implemented to fetch from Firebase
      // For now, return dummy data
      return [
        { type: 'stock', symbol: 'AAPL' },
        { type: 'stock', symbol: 'MSFT' },
        { type: 'crypto', symbol: 'BTC' },
        { type: 'crypto', symbol: 'ETH' },
      ];
    },
    enabled: !!userId,
  });
}