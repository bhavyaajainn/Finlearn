"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/app/store/hooks'
import { useDailyGlossaryTerm, useWatchlist, useFinancialNews, useTrendingStocks, useTrendingCryptos } from '../hooks/useFinancialData'


export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.auth)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch financial data using React Query
  const { data: glossaryTerm } = useDailyGlossaryTerm()
  const { data: watchlist } = useWatchlist(user?.uid || null)
  const { data: news } = useFinancialNews()
  const { data: trendingStocks } = useTrendingStocks()
  const { data: trendingCryptos } = useTrendingCryptos()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Authenticated content
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.displayName || 'User'}</h1>
        
        {/* Glossary Term of the Day */}
        {glossaryTerm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Glossary Term of the Day</h2>
            <h3 className="text-lg font-medium mb-2">{glossaryTerm.term}</h3>
            <p className="text-gray-300">{glossaryTerm.definition}</p>
            {glossaryTerm.example && (
              <p className="mt-2 text-gray-400">Example: {glossaryTerm.example}</p>
            )}
          </div>
        )}
        
        {/* Dashboard content with sections for watchlist, news, trending, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Watchlist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Your Watchlist</h2>
            {watchlist && watchlist.length > 0 ? (
              <div className="space-y-4">
                {watchlist.map((item) => (
                  <div key={`${item.type}-${item.symbol}`} className="flex justify-between items-center p-3 bg-zinc-800 rounded-md">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-sm text-gray-400">{item.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Add stocks and crypto to your watchlist to track them here.</p>
            )}
          </div>
          
          {/* Trending Assets */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Trending Assets</h2>
            
            {/* Trending Stocks */}
            {trendingStocks && trendingStocks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Stocks</h3>
                <div className="space-y-2">
                  {trendingStocks.map((stock) => (
                    <div key={stock.symbol} className="flex justify-between items-center p-2 bg-zinc-800 rounded-md">
                      <div>
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-sm text-gray-400 ml-2">{stock.companyName}</span>
                      </div>
                      <div className={`${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending Cryptos */}
            {trendingCryptos && trendingCryptos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Crypto</h3>
                <div className="space-y-2">
                  {trendingCryptos.map((crypto) => (
                    <div key={crypto.symbol} className="flex justify-between items-center p-2 bg-zinc-800 rounded-md">
                      <span className="font-medium">{crypto.symbol}</span>
                      <div className={`${crypto.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Financial News */}
        {news && news.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Latest Financial News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {item.imageUrl && (
                    <div className="aspect-video relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}