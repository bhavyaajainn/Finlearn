"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"
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

// Interface for dashboard essentials API response
interface GlossaryTerm {
  term: string;
  definition: string;  
  example: string;
}

interface Quote {
  text: string;
  author: string;
}

interface DashboardEssentials {
  user_id: string;
  expertise_level: string;
  glossary_term: GlossaryTerm[];
  quote: Quote;
  timestamp: string;
}

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  const [dashboardEssentials, setDashboardEssentials] = useState<DashboardEssentials | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { preferences } = useAppSelector((state) => state.preferences);

  // Fetch dashboard essentials
  useEffect(() => {
    const fetchDashboardEssentials = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/dashboard/home/essential?user_id=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard essentials');
        }
        const data = await response.json();
        setDashboardEssentials(data);
      } catch (err) {
        console.error('Error fetching dashboard essentials:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardEssentials();
  }, [user?.uid]);

  // Check if we need to show the preferences dialog
  useEffect(() => {
    if (user) {
      dispatch(fetchUserPreferences(user.uid))
        .unwrap()
        .then((data) => {
          if (!data || !data.expertise_level || !data.categories || data.categories.length === 0) {
            setShowPreferencesDialog(true);
          }
        })
        .catch(() => {
          setShowPreferencesDialog(true);
        });
    }
  }, [user, dispatch]);

  // Animation variants
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

  return (
    <>
      <UserPreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
      />
    
      <div className="max-w-full px-2 py-4">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* Progress Section */}
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
                      <span className="text-sm font-medium text-gray-200">Days Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">21</span>
                      <Badge variant="outline" className="bg-green-950/50 text-green-400 border-green-800">
                        🔥 On Fire
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={`h-1.5 w-full rounded-full ${i < 5 ? "bg-blue-500" : "bg-blue-900"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">This week's activity</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-200">XP Earned</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">1,250</span>
                    </div>
                    <Progress value={65} className="h-2 bg-blue-900" />
                    <span className="text-xs text-gray-400">650 XP until next level</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-200">Concepts Learned</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">42</span>
                      <span className="text-sm text-gray-400">of 100</span>
                    </div>
                    <Progress value={42} className="h-2 bg-blue-900" />
                    <span className="text-xs text-gray-400">58 more to master basics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Card className="bg-black border-blue-900/50 w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center">
                  <Zap className="text-yellow-400 mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className={`bg-gradient-to-br ${action.color} rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group`}
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

          {/* Motivation Card - Using API data */}
          <motion.div variants={item}>
            <MotivationCard 
              quote={dashboardEssentials?.quote} 
              loading={loading}
              error={error}
            />
          </motion.div>

          {/* Glossary Card - Using API data */}
          <motion.div variants={item}>
            <GlossaryCard 
              glossaryTerms={dashboardEssentials?.glossary_term || []}
              loading={loading}
              error={error}
            />
          </motion.div>

          {/* Watchlist */}
          <motion.div variants={item}>
            <Watchlist />
          </motion.div>

        </motion.div>
      </div>
    </>
  )
}