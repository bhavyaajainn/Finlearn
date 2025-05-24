"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, TrendingUp, AlertCircle } from "lucide-react"

interface TrendingNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  published_at: string;
  topics: string[];
}

interface TrendingNewsCardProps {
  newsItem: TrendingNewsItem;
  onClick?: () => void;
}

export function TrendingNewsCard({ newsItem, onClick }: TrendingNewsCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleCardClick = () => {
    if (newsItem.url) {
      window.open(newsItem.url, '_blank', 'noopener noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card 
        className={`bg-black border-zinc-800 h-full min-h-[240px] transition-all duration-300 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10 ${
          newsItem.url || onClick ? 'cursor-pointer' : ''
        } flex flex-col`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1.5">
              {newsItem.topics.map((topic, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-blue-500/10 text-blue-400 border-blue-800 text-xs"
                >
                  {capitalizeFirstLetter(topic)}
                </Badge>
              ))}
            </div>
            <TrendingUp className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold text-white leading-tight">
            {truncateText(newsItem.title, 12)}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-grow justify-between pt-0">
          <p className="text-gray-400 text-sm flex-grow mb-4">
            {truncateText(newsItem.summary, 20)}
          </p>
          
          <div className="border-t border-zinc-800 pt-3 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">{newsItem.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(newsItem.published_at)}</span>
                </div>
              </div>
              {newsItem.url && (
                <ExternalLink className="h-3 w-3 text-blue-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TrendingNewsSectionProps {
  newsItems: TrendingNewsItem[];
  loading?: boolean;
  error?: string | null;
}

export function TrendingNewsSection({ newsItems = [], loading = false, error = null }: TrendingNewsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Trending News</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="bg-black border-zinc-800 h-[240px] animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                    <div className="h-5 bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-full"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Trending News</h2>
        </div>
        <Card className="bg-black border-red-900/50 text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Unable to load trending news</span>
            </div>
            <p className="text-gray-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Trending News</h2>
        </div>
        <Card className="bg-black border-zinc-800 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">No trending news available at the moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Trending News</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsItems.map((newsItem) => (
          <TrendingNewsCard key={newsItem.id} newsItem={newsItem} />
        ))}
      </div>
    </div>
  );
}