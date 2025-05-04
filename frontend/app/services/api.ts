// Financial API services for the app

// Base URL for financial APIs
const YAHOO_FINANCE_API_BASE = "https://yahoo-finance-api.example.com"; // Replace with actual API endpoint
const CRYPTO_API_BASE = "https://crypto-api.example.com"; // Replace with actual API endpoint

// Types
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  companyName: string;
  marketCap: number;
  volume: number;
}

export interface CryptoData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

// API functions
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_API_BASE}/stock/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchCryptoData(symbol: string): Promise<CryptoData> {
  try {
    const response = await fetch(`${CRYPTO_API_BASE}/crypto/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching crypto data for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchFinancialNews(category?: string, limit = 10): Promise<NewsItem[]> {
  try {
    const url = category
      ? `${YAHOO_FINANCE_API_BASE}/news?category=${category}&limit=${limit}`
      : `${YAHOO_FINANCE_API_BASE}/news?limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch financial news');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial news:', error);
    throw error;
  }
}

export async function fetchTrendingStocks(limit = 5): Promise<StockData[]> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_API_BASE}/trending/stocks?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending stocks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    throw error;
  }
}

export async function fetchTrendingCryptos(limit = 5): Promise<CryptoData[]> {
  try {
    const response = await fetch(`${CRYPTO_API_BASE}/trending?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending cryptos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending cryptos:', error);
    throw error;
  }
}

// Daily financial glossary term
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example?: string;
}

export async function fetchDailyGlossaryTerm(): Promise<GlossaryTerm> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_API_BASE}/glossary/daily`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily glossary term');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily glossary term:', error);
    throw error;
  }
}