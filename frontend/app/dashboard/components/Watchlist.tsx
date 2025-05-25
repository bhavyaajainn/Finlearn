import React from 'react'
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, AlertCircle } from "lucide-react"
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"
import { useAppSelector } from '@/app/store/hooks'
import { useRouter } from 'next/navigation'

interface WatchlistProps {
  hideViewFullButton?: boolean;
}

const Watchlist = ({ hideViewFullButton = false }: WatchlistProps) => {
  const router = useRouter();
  const { 
    watchlist, 
    loading: { watchlist: loading }, 
    error: { watchlist: error } 
  } = useAppSelector((state) => state.dashboard);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${price?.toLocaleString()}`;
    }
    return `$${price?.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    if (marketCap >= 1e12) {
      return `${symbol}${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `${symbol}${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `${symbol}${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `${symbol}${marketCap?.toLocaleString()}`;
  };

  const handleViewFullWatchlist = () => {
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    
    setTimeout(() => {
      router.push('/dashboard/watchlist');
    }, 100);
  };

  const handleAssetClick = (symbol: string, assetType: string) => {
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    
    setTimeout(() => {
      router.push(`/dashboard/watchlist/${symbol}/${assetType}`);
    }, 100);
  };

  if (loading) {
    return (
      <Card className="bg-black border-blue-900/50 text-white h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center justify-between">
            Your Watchlist
            {!hideViewFullButton && (
              <Button 
                variant="ghost" 
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20 text-sm h-8 px-3"
                onClick={handleViewFullWatchlist}
              >
                View Full Watchlist
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
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
      <Card className="bg-black border-red-900/50 text-white h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Your Watchlist
            </div>
            {!hideViewFullButton && (
              <Button 
                variant="ghost" 
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20 text-sm h-8 px-3"
                onClick={handleViewFullWatchlist}
              >
                View Full Watchlist
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (watchlist.length === 0) {
    return (
      <Card className="bg-black border-blue-900/50 text-white h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center justify-between">
            Your Watchlist
            {!hideViewFullButton && (
              <Button 
                variant="ghost" 
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20 text-sm h-8 px-3"
                onClick={handleViewFullWatchlist}
              >
                View Full Watchlist
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex items-center justify-center">
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
    <Card className="bg-black border-blue-900/50 text-white h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          Your Watchlist
          {!hideViewFullButton && (
            <Button 
              variant="ghost" 
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all duration-200 border border-transparent hover:border-blue-500/20 text-sm h-8 px-3"
              onClick={handleViewFullWatchlist}
            >
              View Full Watchlist
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="overflow-y-auto h-full">
          {watchlist.map((item, i) => (
            <motion.div 
              key={`${item.symbol}-${item.exchange}`}
              className="flex items-center justify-between py-3 px-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAssetClick(item.symbol, item.asset_type)}
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
                  {/* {formatPrice(item.current_price, item.currency)} */}
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
                  {/* {formatMarketCap(item.market_cap, item.currency)} */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Watchlist