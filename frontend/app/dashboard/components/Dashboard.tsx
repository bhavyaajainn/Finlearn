"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"
import { 
  fetchDashboardEssentials, 
  fetchStreakData, 
  fetchWatchlist,
  fetchTrendingNews
} from "@/app/store/slices/dashboardSlice"
import UserPreferencesDialog from "./UserPreferencesDialog"
import { TrendingNewsSection } from "./TrendingNewsCard"
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
  BarChart3,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    essentials, 
    streak, 
    trendingNews,
    loading, 
    error 
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchDashboardEssentials(user.uid));
      dispatch(fetchStreakData({ userId: user.uid, refresh: true }));
      dispatch(fetchWatchlist({ userId: user.uid, limit: 5 }));
      dispatch(fetchTrendingNews(user.uid));
    }
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserPreferences(user.uid))
        .unwrap()
        .then((data) => {
          if (!data?.expertise_level || !data?.categories?.length) {
            setShowPreferencesDialog(true);
          }
        })
        .catch(() => {
          setShowPreferencesDialog(true);
        });
    }
  }, [user, dispatch]);

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
    
      <div className="max-w-full px-2 py-4">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item}>
            <TrendingNewsSection 
              newsItems={trendingNews}
              loading={loading.trendingNews}
              error={error.trendingNews}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="bg-black border-blue-900/50 w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center">
                  <BarChart3 className="text-blue-400 mr-2 h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-200">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {loading.streak ? "..." : streak?.current_streak || 0}
                      </span>
                      <span className="text-sm text-gray-400">days</span>
                      {!loading.streak && streak && streak.current_streak > 0 && (
                        <Badge variant="outline" className="bg-green-950/50 text-green-400 border-green-800 ml-2">
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
                            className={`h-1.5 w-full rounded-full ${
                              i < daysToHighlight ? "bg-blue-500" : "bg-blue-900"
                            }`} 
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-400">This week's activity</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-200">Longest Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
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

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-200">Concepts Learned</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {loading.streak ? "..." : streak?.total_articles || 0}
                      </span>
                      <span className="text-sm text-gray-400">of 100</span>
                    </div>
                    <Progress value={conceptsProgress} className="h-2 bg-blue-900" />
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
          
          <div className="flex flex-col lg:flex-row gap-6">
            <motion.div variants={item} className="flex-1">
              <GlossaryCard 
                glossaryTerms={essentials?.glossary_term || []}
                loading={loading.essentials}
                error={error.essentials}
              />
            </motion.div>
            <motion.div variants={item} className="flex-1">
              <Watchlist />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  )
}