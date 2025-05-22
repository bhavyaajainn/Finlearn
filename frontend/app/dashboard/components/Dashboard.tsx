"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"
import UserPreferencesDialog from "./UserPreferencesDialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserInfo } from "./UserInfo"
import { GlossaryCard } from "./GlossaryCard"
import MotivationCard from "./MotivationCard"
import Watchlist from "./Watchlist"
import { 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Award, 
  Trophy,
  Newspaper,
  BookOpen
} from "lucide-react"
import Link from "next/link"

// Mock data for trending news
const trendingNews = [
  {
    id: "news-1",
    title: "Understanding Market Volatility: What Every Investor Should Know",
    description: "Learn how market volatility works and strategies to navigate uncertain market conditions effectively.",
    category: "Markets",
    readTime: 5,
    date: "2025-05-15",
  },
  {
    id: "news-2",
    title: "The Rise of DeFi: A New Era in Financial Technology",
    description: "Explore how decentralized finance is transforming traditional financial systems and creating new investment opportunities.",
    category: "Crypto",
    readTime: 7,
    date: "2025-05-14",
  },
  {
    id: "news-3",
    title: "ESG Investing: Balancing Profit with Purpose",
    description: "How environmental, social, and governance factors are becoming essential considerations for modern investors.",
    category: "Investing",
    readTime: 6,
    date: "2025-05-13",
  }
]

// News card component
interface NewsCardProps {
  title: string
  description: string
  category: string
  readTime: number
  date: string
}

const NewsCard = ({ title, description, category, readTime, date }: NewsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black border-blue-900/50 h-full hover:border-blue-500/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="mb-3 flex justify-between">
            <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
              {category}
            </Badge>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {readTime} min read
            </div>
          </div>
          <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{date}</span>
            <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-300 flex items-center text-xs">
              Read more <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { preferences, loading } = useAppSelector((state) => state.preferences);

  // Check if we need to show the preferences dialog
  useEffect(() => {
    if (user) {
      dispatch(fetchUserPreferences(user.uid))
        .unwrap()
        .then((data) => {
          // If no preferences are set, show the dialog
          if (!data || !data.expertise_level || !data.categories || data.categories.length === 0) {
            setShowPreferencesDialog(true);
          }
        })
        .catch(() => {
          // If there's an error fetching preferences, show the dialog
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
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">

          {/* Progress Section */}
          <motion.div variants={item}>
            <Card className="bg-black border-blue-900/50 w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Your Progress</CardTitle>
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

          {/* Trending News Section */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Newspaper className="text-blue-400 mr-2 h-5 w-5" />
                <h2 className="text-xl font-bold text-white">Trending Financial News</h2>
              </div>
              <Button variant="link" asChild className="text-blue-400 hover:text-blue-300">
                <Link href="/dashboard/news">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingNews.map((news) => (
                <NewsCard 
                  key={news.id}
                  title={news.title}
                  description={news.description}
                  category={news.category}
                  readTime={news.readTime}
                  date={news.date}
                />
              ))}
            </div>
          </motion.div>

          {/* Motivation Card */}
          <motion.div variants={item}>
            <MotivationCard />
          </motion.div>

          {/* Glossary Card and Watchlist */}
          <motion.div variants={item}>
            <GlossaryCard />
          </motion.div>

        </motion.div>
      </div>
    </>

  )
}