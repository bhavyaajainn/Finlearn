"use client"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, LineChart, User, TrendingUp } from "lucide-react"
import { useAppSelector } from "@/app/store/hooks"
import { MultiSelect } from "@/components/multi-select"
import { topicOptions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { fetchPreferences, fetchstreak, updatePreferences } from "@/lib/actions"
import { UserPreferences } from "./types/profiletypes"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface Streak {
  current_streak: number
  longest_streak: number
  total_articles: number
}
interface RawDay {
  date: string
  count: number
}

interface HeatmapDay extends RawDay {
  week: number
  day: number
}

interface HeatmapData {
  user_id: string
  year: number
  data: RawDay[]
}
interface LearningSummary {
  period: string;
  date_range: {
    start: string;  // ISO date string
    end: string;    // ISO date string
  };
  summary: string;
  statistics: {
    tooltips_viewed: number;
    categories: Record<string, number>;
    articles_read: number;
  };
  articles_read: string[];
  user_id: string;
  generated_at: string;  // ISO datetime string
  streak: {
    current_streak: number;
    last_active: string;   // ISO date string
    updated_at: string;    // ISO datetime string with timezone
    total_articles: number;
    longest_streak: number;
  };
  quiz_questions: QuizQuestion[];
}

interface QuizQuestion {
  explanation: string;
  correct_answer: string;
  options: QuizOption[];
  question: string;
}

interface QuizOption {
  text: string;
  label: string;
}
export interface DailyCount {
  date: string // e.g. "Mon", "Tue"
  count: number
}

export interface DateRange {
  start: string // e.g. "2025-05-19"
  end: string   // e.g. "2025-05-25"
}

export interface CategoriesData {
  [category: string]: DailyCount[]
}

export interface UserProgressData {
  user_id: string
  period: 'week' | 'month'
  date_range: DateRange
  articles_data: DailyCount[]
  tooltips_data: DailyCount[]
  categories_data: CategoriesData
}


const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>("topics")
  const [userdata, setUserdata] = useState<UserPreferences>();
  const [expertiseLevel, setExpertiseLevel] = useState<string>("beginner")
  const { user } = useAppSelector((state) => state.auth)
  const [streak, setStreak] = useState<Streak>();
  const [topics, setTopics] = useState<string[]>([]);
  const [heatmap, setheatmap] = useState<HeatmapData>();
  const [summary, setsummary] = useState<LearningSummary>();
  const [progress, setprogress] = useState<UserProgressData>();

  const fetchUserPreferences = async () => {
    if (!user) return toast("No user found.");
    try {
      const data = await fetchPreferences(user.uid);

      console.log("fetched data",data)

      setUserdata(data);
    } catch (err: any) {
      toast(err.message || "Error fetching preferences.");
    }
  };

  const fetchuserstreak = async () => {
    if (!user) return toast.error("No user found.");
    try {
      const streakData = await fetchstreak(user.uid);
      setStreak(streakData);
    } catch (err: any) {
      toast.error(err.message || "Error fetching streak.");
    }
  };
  const handleExpertiseSelect = async (level: string) => {
    setExpertiseLevel(level);
    await updateUserPreferences();
    setActiveTab("topics");
  }
  const updateUserPreferences = async () => {
    if (!user) return toast.error("No user found.");
    if (topics.length === 0) return toast.error("No topics added.");

    try {
      const updated = await updatePreferences(user.uid, expertiseLevel, topics, userdata!);
      setUserdata(updated);
      toast.success("Preferences updated!");
    } catch (err: any) {
      toast.error(err.message || "Error updating preferences.");
    }
  };

  const fetchHeatMap = async () => {
    if (!user) return toast("No user found.");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/summary/heatmap?user_id=${user.uid}&year=2025`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      setheatmap(data);

    } catch (error: any) {
      console.error("Error searching assets:", error.message);
      return [];
    }
  };

  const fetchusersummary = async (day: string, start_date: string, end_date: string) => {
    if (!user) return toast("No user found.");
    try {

      console.log(day, start_date, end_date);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}summary?user_id=${user.uid}&refresh=false`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      console.log(data)

      setsummary(data);

    } catch (error: any) {
      console.log(error)
      console.error("Error searching assets:", error.message);
      return [];
    }
  };

  const fetchuserprogress = async () => {
    if (!user) return toast("No user found.");
    try {

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}summary/progress-chart?user_id=${user.uid}&period=week`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      console.log(data)

      setprogress(data);

    } catch (error: any) {
      console.log(error)
      console.error("Error searching assets:", error.message);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
      fetchuserstreak();
      fetchHeatMap();
      fetchusersummary("day", "25-05-2025", "26-05-2025");
      fetchuserprogress();
    }
  }, [user]);

  const Heatmap = () => {
    const getWeekOfYear = (date: Date) => {
      const first = new Date(date.getFullYear(), 0, 1)
      const dayOfYear = Math.floor((+date - +first) / (1000 * 60 * 60 * 24))
      return Math.floor((dayOfYear + first.getDay()) / 7)
    }

    const getIntensityLevel = (count: number) => {
      if (count === 0) return 0
      if (count <= 2) return 1
      if (count <= 4) return 2
      if (count <= 6) return 3
      return 4
    }

    const colors = [
      "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",      // 0
      "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",// 1
      "bg-green-200 dark:bg-green-800/50 border-gray-300 dark:border-gray-700",  // 2
      "bg-green-400 dark:bg-green-600/70 border-green-500",                      // 3
      "bg-green-600 dark:bg-green-500 border-green-700 dark:border-green-400",   // 4
    ]

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

    const getActivityText = (c: number) =>
      c === 0 ? "No articles read" : c === 1 ? "1 article read" : `${c} articles read`

    // ─── Transform raw data to include week/day ───────────────────────────────────
    const processedData: HeatmapDay[] = useMemo(() => {
      if (!heatmap) return []
      return heatmap.data.map((d) => {
        const dt = new Date(d.date)
        return {
          ...d,
          day: dt.getDay(),
          week: getWeekOfYear(dt),
        }
      })
    }, [heatmap])

    if (!heatmap) return null

    // ─── Build weeks matrix ───────────────────────────────────────────────────────
    const sortedData = [...processedData].sort((a, b) => +new Date(a.date) - +new Date(b.date))

    // Group by unique week key: `${year}-W${week}`
    const weekMap = new Map<string, (HeatmapDay | null)[]>()

    sortedData.forEach((d) => {
      const weekKey = `${new Date(d.date).getFullYear()}-W${d.week}`
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, Array<HeatmapDay | null>(7).fill(null))
      }
      const weekColumn = weekMap.get(weekKey)!
      weekColumn[d.day] = d
    })

    const weeks = Array.from(weekMap.values())

    // const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // ─── Summary stats ────────────────────────────────────────────────────────────
    const total = heatmap.data.reduce((s, d) => s + d.count, 0)
    const activeDays = heatmap.data.filter((d) => d.count > 0).length
    const best = Math.max(...heatmap.data.map((d) => d.count))
    const avg = Math.round(total / (activeDays || 1))

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
      <TooltipProvider>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Learning Activity – {heatmap.year}
              </h3>
            </div>

            {/* Month labels */}
            {/* <div className="hidden sm:block mb-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-400 ml-8">
                {monthLabels.map((m, i) => (
                  <div key={i} className="text-center">{m}</div>
                ))}
              </div>
            </div> */}

            <div className="flex gap-2">
              {/* Day labels */}
              <div className="hidden sm:flex flex-col gap-1 text-xs text-gray-400 pt-1">
                {dayLabels.map((d, i) => (
                  <div key={i} className="h-3 flex items-center">
                    {i % 2 === 1 ? d : ""}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {weeks.map((col, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {col.map((cell, di) => (
                        <Tooltip key={`${wi}-${di}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm border transition-all duration-200
                                hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 cursor-pointer
                                ${cell ? colors[getIntensityLevel(cell.count)]
                                  : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-gray-900 border-gray-700 text-white p-3 rounded-lg shadow-lg"
                          >
                            <div className="text-sm">
                              <div className="font-medium">
                                {cell ? getActivityText(cell.count) : "No activity"}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {cell
                                  ? formatDate(cell.date)
                                  : `${heatmap.year}-${String(Math.floor(wi / 4) + 1).padStart(2, "0")}-${String(di + 1).padStart(2, "0")}`}
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
            <div className="flex items-center justify-between mt-6 text-xs text-gray-300">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                {colors.map((c, i) => (
                  <div key={i} className={`w-3 h-3 ${c} rounded-sm`}></div>
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }
  // User Summary Section
  const UserSummary = () => {

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
        forex: "bg-blue-500",
        "technical analysis": "bg-purple-500",
        "risk management": "bg-red-500",
        "market analysis": "bg-green-500",
        economics: "bg-yellow-500",
        trading: "bg-indigo-500",
      }
      return colors[category] || "bg-gray-500"
    }

    return (
      <div className="space-y-6">
        {/* Enhanced Statistics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats Card */}
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Learning Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">{summary?.statistics?.articles_read || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Articles Read</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">{summary?.streak?.current_streak || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Current Streak</div>
                  <div className="text-xs text-gray-500 mt-1">Days</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-400">{summary?.streak?.total_articles || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Articles</div>
                  <div className="text-xs text-gray-500 mt-1">All time</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-400">{summary?.quiz_questions?.length || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Quiz Questions</div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Categories Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.statistics?.categories && Object.entries(summary.statistics.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                      <span className="text-white capitalize text-sm">{category}</span>
                    </div>
                    <Badge className="bg-zinc-800 text-white border-zinc-700">
                      {count} article{count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
                <div className="pt-2 border-t border-zinc-700">
                  <div className="text-xs text-gray-400">
                    Last active: {formatDate(summary?.streak?.last_active || "")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Read Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Recent Articles ({summary?.articles_read?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.articles_read?.map((article, index) => (
                <div
                  key={index}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{article}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge className="bg-blue-900/30 text-blue-300 border-blue-800">
                          {Object.keys(summary?.statistics?.categories || {})[0]}
                        </Badge>
                        <span className="text-gray-400">Read on {formatDate(summary?.date_range?.start || "")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                  <div className="text-center text-white">
                    No articles read yet.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Performance Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-400" />
              Quiz Performance ({summary?.quiz_questions?.length || 0} Questions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.quiz_questions?.map((quiz, index) => (
                <div key={index} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="mb-3">
                    <h4 className="text-white font-medium mb-2">Question {index + 1}</h4>
                    <p className="text-gray-300 text-sm mb-3">{quiz.question}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {quiz.options.map((option) => (
                      <div
                        key={option.label}
                        className={`p-2 rounded text-sm border ${option.label === quiz.correct_answer
                          ? "bg-green-900/30 border-green-700 text-green-300"
                          : "bg-zinc-700/50 border-zinc-600 text-gray-300"
                          }`}
                      >
                        <span className="font-medium">{option.label}:</span> {option.text}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-900/20 border border-blue-800 rounded">
                    <div className="text-blue-300 text-xs font-medium mb-1">Explanation:</div>
                    <div className="text-blue-200 text-sm">{quiz.explanation}</div>
                  </div>
                </div>
              )) || (
                  <div className="text-center text-white">
                    No quiz questions completed yet.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Summary */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Personalized Learning Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {summary?.summary?.replace(/###/g, "").replace(/\*\*/g, "") || "No summary available yet."}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="text-xs text-gray-500">Generated on {formatDate(summary?.generated_at || "")}</div>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap and Charts */}
        <Heatmap />
        {/* <ProgressChart /> */}
      </div>
    )
  }

  function ProgressChart({ data }: any) {
    return (
      <div className="p-4 bg-transparent rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-white">Weekly Learning Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Articles Read" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

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
                        <div className="text-white">{streak?.current_streak || 0} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
                        <div className="text-white">{streak?.longest_streak || 0} days</div>
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
                        onClick={() => handleExpertiseSelect(level)}
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
                      {userdata?.categories.map((category) => (
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
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={updateUserPreferences}>Save Preferences</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <ProgressChart data={progress?.articles_data} />
          <UserSummary />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
