import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, AlertCircle } from "lucide-react"
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"
import { useAppSelector } from '@/app/store/hooks'
import { useRouter } from 'next/navigation'

// Interface for watchlist item from API
interface WatchlistItem {
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

interface WatchlistResponse {
  watchlist: WatchlistItem[];
  count: number;
}

const Watchlist = () => {
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Fetch watchlist data
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/watchlist?user_id=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch watchlist');
        }
        const data: WatchlistResponse = await response.json();
        // Show only first 5 items for dashboard
        setWatchlistData(data.watchlist.slice(0, 5));
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user?.uid]);

  // Format price based on currency
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${price.toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  // Format market cap
  const formatMarketCap = (marketCap: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    if (marketCap >= 1e12) {
      return `${symbol}${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `${symbol}${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `${symbol}${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `${symbol}${marketCap.toLocaleString()}`;
  };

  const handleViewFullWatchlist = () => {
    router.push('/dashboard/watchlist');
  };

  if (loading) {
    return (
      <Card className="bg-black border-blue-900/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Your Watchlist</CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                <div>
                  <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black border-red-900/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Your Watchlist
          </CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4 px-4">
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20"
            onClick={handleViewFullWatchlist}
          >
            View Full Watchlist
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (watchlistData.length === 0) {
    return (
      <Card className="bg-black border-blue-900/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Your Watchlist</CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No assets in your watchlist yet.</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleViewFullWatchlist}
            >
              Add Your First Asset
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
    
  return (
    <Card className="bg-black border-blue-900/50 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-white">Your Watchlist</CardTitle>
        <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          {watchlistData.map((item, i) => (
            <motion.div 
              key={`${item.symbol}-${item.exchange}`}
              className="flex items-center justify-between py-3 px-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/dashboard/watchlist/${item.symbol}/${item.asset_type}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base text-white truncate">{item.symbol}</div>
                <div className="text-sm text-gray-400 truncate">{item.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.sector} • {item.exchange}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="font-medium text-base text-white">
                  {formatPrice(item.current_price, item.currency)}
                </div>
                <div
                  className={`text-sm flex items-center justify-end ${
                    item.price_change_percent >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.price_change_percent >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(item.price_change_percent).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatMarketCap(item.market_cap, item.currency)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-4">
        <Button 
          variant="ghost" 
          className="w-full mt-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20"
          onClick={handleViewFullWatchlist}
        >
          View Full Watchlist
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Watchlist