"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"
import {
  fetchDashboardEssentials,
  fetchStreakData,
  fetchWatchlist
} from "@/app/store/slices/dashboardSlice"
import UserPreferencesDialog from "./UserPreferencesDialog"
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
import { container, item } from "../animations/animation"

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    essentials,
    streak,
    loading,
    error
  } = useAppSelector((state) => state.dashboard);
  const conceptsProgress = streak ? Math.min((streak.total_articles / 100) * 100, 100) : 0;

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchDashboardEssentials(user.uid));
      dispatch(fetchStreakData({ userId: user.uid, refresh: true }));
      dispatch(fetchWatchlist({ userId: user.uid, limit: 5 }));
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

  return (
    <>
      <UserPreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
      />

      <div className="max-w-full px-2 py-4">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
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
                        // Calculate which days to highlight based on current streak
                        const daysToHighlight = Math.min(streak?.current_streak || 0, 7);
                        return (
                          <div
                            key={i}
                            className={`h-1.5 w-full rounded-full ${i < daysToHighlight ? "bg-blue-500" : "bg-blue-900"
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
            <Card className="bg-black border-blue-900/50 w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center">
                  <Zap className="text-yellow-400 mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    {
                      icon: BookOpen,
                      label: "Continue Learning",
                      href: "/dashboard/learning",
                      color: "from-blue-500/20 to-cyan-500/20",
                      iconColor: "text-blue-400"
                    },
                    {
                      icon: TrendingUp,
                      label: "View Watchlist",
                      href: "/dashboard/watchlist",
                      color: "from-green-500/20 to-emerald-500/20",
                      iconColor: "text-green-400"
                    },
                    {
                      icon: Target,
                      label: "Update Profile",
                      href: "/dashboard/profile",
                      color: "from-purple-500/20 to-pink-500/20",
                      iconColor: "text-purple-400"
                    }
                  ].map((action, index) => (
                    <Link key={index} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`bg-gradient-to-br ${action.color} rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group h-full`}
                      >
                        <div className="text-center">
                          <div className="mb-2 flex justify-center">
                            <action.icon className={`h-6 w-6 ${action.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {action.label}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
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
          <motion.div variants={item}>
            <GlossaryCard
              glossaryTerms={essentials?.glossary_term || []}
              loading={loading.essentials}
              error={error.essentials}
            />
          </motion.div>
          <motion.div variants={item}>
            <Watchlist />
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}