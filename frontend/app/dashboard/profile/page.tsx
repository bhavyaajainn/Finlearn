"use client"
import { useState } from "react"
import { BookOpen, LineChart, User, TrendingUp } from "lucide-react"
import { useAppSelector } from "@/app/store/hooks"
import { MultiSelect } from "@/components/multi-select"
import { topicOptions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
} from "recharts"

// Enhanced dummy data for yearly heatmap
const generateYearlyHeatmapData = (year: number) => {
  const data = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    // Generate random activity data (0-10 articles read per day)
    const count = Math.random() > 0.7 ? Math.floor(Math.random() * 8) + 1 : 0
    data.push({
      date: dateStr,
      count: count,
      day: d.getDay(),
      week: Math.floor((d.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
    })
  }
  return data
}

const dummyHeatmapData = {
  user_id: "kea4N8foGdMvvuyO9NNITS1QmP62",
  year: 2025,
  data: generateYearlyHeatmapData(2025),
}

const dummyProgressData = {
  user_id: "kea4N8foGdMvvuyO9NNITS1QmP62",
  period: "week",
  date_range: { start: "2025-05-19", end: "2025-05-25" },
  articles_data: [
    { date: "Mon", count: 2 },
    { date: "Tue", count: 4 },
    { date: "Wed", count: 3 },
    { date: "Thu", count: 5 },
    { date: "Fri", count: 2 },
    { date: "Sat", count: 1 },
    { date: "Sun", count: 3 },
  ],
  categories_data: {
    forex: [
      { date: "Mon", count: 1 },
      { date: "Tue", count: 2 },
      { date: "Wed", count: 1 },
      { date: "Thu", count: 3 },
      { date: "Fri", count: 2 },
      { date: "Sat", count: 0 },
      { date: "Sun", count: 2 },
    ],
  },
}

interface Streak {
  current_streak: number
  longest_streak: number
  total_articles: number
}

interface UserPreferences {
  categories: string[]
  expertiseLevel: string
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>("topics")
  const [userdata, setUserdata] = useState<UserPreferences>({
    categories: ["forex", "technical analysis"],
    expertiseLevel: "intermediate",
  })
  const [expertiseLevel, setExpertiseLevel] = useState<string>("beginner")
  const [streak] = useState<Streak>({
    current_streak: 5,
    longest_streak: 10,
    total_articles: 25,
  })
  const [topics, setTopics] = useState<string[]>(["forex", "technical analysis"])
  const { user } = useAppSelector((state) => state.auth)

  // Enhanced GitHub-style Heatmap Component
  const Heatmap = () => {
    const getIntensityLevel = (count: number): number => {
      if (count === 0) return 0
      if (count <= 2) return 1
      if (count <= 4) return 2
      if (count <= 6) return 3
      return 4
    }

    const getColor = (count: number): string => {
      const intensity = getIntensityLevel(count)
      const colors = [
        "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700", // 0
        "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800", // 1
        "bg-green-200 dark:bg-green-800/50 border-green-300 dark:border-green-700", // 2
        "bg-green-400 dark:bg-green-600/70 border-green-500 dark:border-green-500", // 3
        "bg-green-600 dark:bg-green-500 border-green-700 dark:border-green-400", // 4
      ]
      return colors[intensity]
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const getActivityText = (count: number): string => {
      if (count === 0) return "No articles read"
      if (count === 1) return "1 article read"
      return `${count} articles read`
    }

    // Group data by weeks
    const weeks: any[][] = []
    const maxWeek = Math.max(...dummyHeatmapData.data.map((d) => d.week))

    for (let week = 0; week <= maxWeek; week++) {
      const weekData = Array(7).fill(null)
      dummyHeatmapData.data
        .filter((d) => d.week === week)
        .forEach((d) => {
          weekData[d.day] = d
        })
      weeks.push(weekData)
    }

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <TooltipProvider>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Learning Activity - {dummyHeatmapData.year}</h3>
            </div>

            {/* Month labels */}
            <div className="hidden sm:block mb-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-400 ml-8">
                {monthLabels.map((month, index) => (
                  <div key={index} className="text-center">
                    {month}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {/* Day labels */}
              <div className="hidden sm:flex flex-col gap-1 text-xs text-gray-400 pt-1">
                {dayLabels.map((day, index) => (
                  <div key={index} className="h-3 flex items-center">
                    {index % 2 === 1 ? day : ""}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm border transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 cursor-pointer ${day
                                ? getColor(day.count)
                                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                }`}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-gray-900 border-gray-700 text-white p-3 rounded-lg shadow-lg"
                          >
                            <div className="text-sm">
                              <div className="font-medium">{day ? getActivityText(day.count) : "No activity"}</div>
                              <div className="text-gray-400 text-xs mt-1">
                                {day
                                  ? formatDate(day.date)
                                  : `${dummyHeatmapData.year}-${String(Math.floor(weekIndex / 4) + 1).padStart(2, "0")}-${String(dayIndex + 1).padStart(2, "0")}`}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 dark:bg-green-800/50 border border-green-300 dark:border-green-700 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 dark:bg-green-600/70 border border-green-500 dark:border-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-white">
                  {dummyHeatmapData.data.reduce((sum, day) => sum + day.count, 0)}
                </div>
                <div className="text-xs text-gray-400">Total articles</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {dummyHeatmapData.data.filter((day) => day.count > 0).length}
                </div>
                <div className="text-xs text-gray-400">Active days</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {Math.max(...dummyHeatmapData.data.map((day) => day.count))}
                </div>
                <div className="text-xs text-gray-400">Best day</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {Math.round(
                    dummyHeatmapData.data.reduce((sum, day) => sum + day.count, 0) /
                    dummyHeatmapData.data.filter((day) => day.count > 0).length,
                  ) || 0}
                </div>
                <div className="text-xs text-gray-400">Daily average</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  // Progress Chart Component
  const ProgressChart = () => (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={dummyProgressData.articles_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <RechartsTooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Articles Read" />
              <Line
                type="monotone"
                dataKey={(entry) =>
                  dummyProgressData.categories_data.forex.find((d) => d.date === entry.date)?.count || 0
                }
                stroke="#10B981"
                strokeWidth={2}
                name="Forex Articles"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )

  // User Summary Section
  const UserSummary = () => (
    <div className="space-y-6">
      <h3 className="text-white text-xl">
        Your Learning Stats
      </h3>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-white">{streak.total_articles}</div>
              <div className="text-sm text-gray-400">Total Articles</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-white">{streak.current_streak}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-white">{streak.longest_streak}</div>
              <div className="text-sm text-gray-400">Longest Streak</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Active Days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Heatmap />
      <ProgressChart />
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your account and track your learning progress</p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:w-1/4 mb-6 md:mb-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <User className="h-16 w-16 text-blue-400/70" />
                  </div>
                </div>
                <div className="md:w-3/4 md:pl-8 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Name</div>
                        <div className="text-white">{user?.displayName || "Name not found"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>
                        <div className="text-white">{user?.email || "Email not found"}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Streak</div>
                        <div className="text-white">{streak.current_streak} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
                        <div className="text-white">{streak.longest_streak} days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Personalize Your Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 w-full sm:w-1/2 bg-zinc-800 p-1 rounded-md">
                  <TabsTrigger value="expertise" className="data-[state=active]:bg-blue-900/50 text-white">
                    <User className="h-4 w-4 mr-2" /> Expertise
                  </TabsTrigger>
                  <TabsTrigger value="topics" className="data-[state=active]:bg-blue-900/50 text-white">
                    <BookOpen className="h-4 w-4 mr-2" /> Topics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expertise" className="space-y-6">
                  <p className="text-gray-400 text-sm">Select your expertise level</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setExpertiseLevel(level)}
                        className={`p-6 rounded-lg border ${expertiseLevel === level
                          ? "border-blue-600 bg-blue-900/30 text-blue-300"
                          : "border-zinc-700 bg-zinc-800 hover:border-blue-800 text-white"
                          } transition-all`}
                      >
                        <div className="text-lg capitalize">{level}</div>
                      </button>
                    ))}
                  </div>
                  <Button onClick={() => setActiveTab("topics")} className="bg-blue-600 hover:bg-blue-700">
                    Continue to Topics
                  </Button>
                </TabsContent>

                <TabsContent value="topics" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Selected Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {userdata.categories.map((category) => (
                        <Badge key={category} className="bg-blue-900/30 text-blue-300 border-blue-800">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Add More Topics</h3>
                    <MultiSelect
                      options={topicOptions}
                      selected={topics}
                      onChange={setTopics}
                      placeholder="Select topics"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Data Visualization Section */}
          <UserSummary />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
