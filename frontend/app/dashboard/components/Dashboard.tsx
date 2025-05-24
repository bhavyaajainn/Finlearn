"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { 
  fetchNewsDetail,
  clearNewsDetail,
  TrendingNewsItem
} from "@/app/store/slices/dashboardSlice"
import { usePreferencesContext } from "../layout"
import UserPreferencesDialog from "./UserPreferencesDialog"
import { TrendingNewsSection } from "./TrendingNewsCard"
import NewsDetailView from "./NewsDetailView"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GlossaryCard } from "./GlossaryCard"
import MotivationCard from "./MotivationCard"
import Watchlist from "./Watchlist"
import { 
  Award, 
  Trophy,
  BookOpen,
  BarChart3
} from "lucide-react"

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<TrendingNewsItem | null>(null);
  const [newsDetailFetched, setNewsDetailFetched] = useState<string | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { preferences } = useAppSelector((state) => state.preferences);
  const { preferencesChecked } = usePreferencesContext();
  const { 
    essentials, 
    streak, 
    trendingNews,
    newsDetail,
    loading, 
    error 
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (preferencesChecked && user?.uid && preferences) {
      if (!preferences?.expertise_level || !preferences?.categories?.length) {
        setShowPreferencesDialog(true);
      }
    }
  }, [preferencesChecked, user?.uid, preferences]);

  const handleNewsClick = useCallback(async (newsItem: TrendingNewsItem) => {
    if (!user?.uid || newsDetailFetched === newsItem.id || fetchingRef.current.has(`news-${newsItem.id}`)) return;
    
    setSelectedNewsItem(newsItem);
    setNewsDetailFetched(newsItem.id);
    
    fetchingRef.current.add(`news-${newsItem.id}`);
    dispatch(fetchNewsDetail({ 
      newsId: newsItem.id, 
      userId: user.uid,
      refresh: false 
    })).finally(() => {
      fetchingRef.current.delete(`news-${newsItem.id}`);
    });
  }, [user?.uid, dispatch, newsDetailFetched]);

  const handleCloseNewsDetail = useCallback(() => {
    setSelectedNewsItem(null);
    setNewsDetailFetched(null);
    dispatch(clearNewsDetail());
  }, [dispatch]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const conceptsProgress = streak ? Math.min((streak.total_articles / 100) * 100, 100) : 0;

  return (
    <>
      <UserPreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
      />
    
      <div className="w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
            {!selectedNewsItem ? (
              <>
                <motion.div variants={item}>
                  <TrendingNewsSection 
                    newsItems={trendingNews}
                    loading={loading.trendingNews}
                    error={error.trendingNews}
                    onNewsClick={handleNewsClick}
                  />
                </motion.div>
                
                <motion.div variants={item}>
                  <Card className="bg-black border-blue-900/50 w-full">
                    <CardHeader className="pb-2 px-4 sm:px-6">
                      <CardTitle className="text-base sm:text-lg text-white flex items-center">
                        <BarChart3 className="text-blue-400 mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">Your Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col gap-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-200 truncate">Current Streak</span>
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-bold text-white">
                              {loading.streak ? "..." : streak?.current_streak || 0}
                            </span>
                            <span className="text-sm text-gray-400">days</span>
                            {!loading.streak && streak && streak.current_streak > 0 && (
                              <Badge variant="outline" className="bg-green-950/50 text-green-400 border-green-800 text-xs">
                                🔥 On Fire
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 7 }).map((_, i) => {
                              const daysToHighlight = Math.min(streak?.current_streak || 0, 7);
                              return (
                                <div 
                                  key={i} 
                                  className={`h-1.5 flex-1 rounded-full ${
                                    i < daysToHighlight ? "bg-blue-500" : "bg-blue-900"
                                  }`} 
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-400">This week's activity</span>
                        </div>

                        <div className="flex flex-col gap-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-200 truncate">Longest Streak</span>
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-bold text-white">
                              {loading.streak ? "..." : streak?.longest_streak || 0}
                            </span>
                            <span className="text-sm text-gray-400">days</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            {loading.streak ? "Loading..." : 
                              streak && streak.longest_streak > streak.current_streak ? 
                              "Keep going to beat your record!" : 
                              "You're at your best streak!"
                            }
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-0 sm:col-span-2 lg:col-span-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-200 truncate">Concepts Learned</span>
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-bold text-white">
                              {loading.streak ? "..." : streak?.total_articles || 0}
                            </span>
                            <span className="text-sm text-gray-400">of 100</span>
                          </div>
                          <Progress value={conceptsProgress} className="h-2 bg-blue-900 w-full" />
                          <span className="text-xs text-gray-400">
                            {100 - (streak?.total_articles || 0)} more to master basics
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={item}>
                  <MotivationCard 
                    quote={essentials?.quote} 
                    loading={loading.essentials}
                    error={error.essentials}
                  />
                </motion.div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
                  <motion.div variants={item} className="min-w-0">
                    <GlossaryCard 
                      glossaryTerms={essentials?.glossary_term || []}
                      loading={loading.essentials}
                      error={error.essentials}
                    />
                  </motion.div>
                  <motion.div variants={item} className="min-w-0">
                    <Watchlist />
                  </motion.div>
                </div>
              </>
            ) : (
              <motion.div variants={item}>
                <NewsDetailView 
                  newsDetail={newsDetail}
                  selectedNewsItem={selectedNewsItem}
                  loading={loading.newsDetail}
                  error={error.newsDetail}
                  onClose={handleCloseNewsDetail}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}