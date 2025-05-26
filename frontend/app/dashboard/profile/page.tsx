"use client"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, LineChart, User, TrendingUp, Plus, Trophy, Calendar, Target } from "lucide-react"
import { useAppSelector } from "@/app/store/hooks"
import { MultiSelect } from "@/components/multi-select"
import { topicOptions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { fetchPreferences, fetchstreak, updatePreferences } from "@/lib/actions"
import { UserPreferences } from "./types/profiletypes"

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
  const { user } = useAppSelector((state) => state.auth)
  const [streak, setStreak] = useState<Streak>();
  const [topics, setTopics] = useState<string[]>([]);
  const [heatmap, setheatmap] = useState<HeatmapData>();
  const [expertiseLevel, setExpertiseLevel] = useState<string>(``)

  const fetchUserPreferences = async () => {
    if (!user) return toast("No user found.");
    try {
      const data = await fetchPreferences(user.uid);

      console.log("fetched data", data)

      setUserdata(data);
      setExpertiseLevel(`${data?.expertise_level}`);
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
  };
  const updateUserPreferences = async () => {
    if (!user) return toast.error("No user found.");
    if (topics.length === 0) return toast.error("No topics added.");

    try {
      const previousTopics = userdata?.categories || [];
      const mergedTopics = Array.from(new Set([...previousTopics, ...topics]));

      const updated = await updatePreferences(user.uid, expertiseLevel, mergedTopics, userdata!);
      setUserdata(updated);
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

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
      fetchuserstreak();
      fetchHeatMap();
    }
  }, [user]);

  const Heatmap = ({ heatmap }: { heatmap: HeatmapData }) => {
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

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

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

    const sortedData = [...processedData].sort((a, b) => +new Date(a.date) - +new Date(b.date))

    const weekMap = new Map<string, (HeatmapDay | null)[]>()
    sortedData.forEach((d) => {
      const weekKey = `${new Date(d.date).getFullYear()}-W${d.week}`
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, Array<HeatmapDay | null>(7).fill(null))
      }
      const weekColumn = weekMap.get(weekKey)!
      weekColumn[d.day!] = d
    })

    const weeks = Array.from(weekMap.values())

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const monthLabelPositions = useMemo(() => {
      const labels: { name: string; index: number }[] = []
      const seen = new Set<string>()

      weeks.forEach((week, index) => {
        const firstDay = week.find((d) => d !== null)
        if (firstDay) {
          const month = new Date(firstDay.date).getMonth()
          const monthName = new Date(firstDay.date).toLocaleString("default", { month: "short" })
          if (!seen.has(monthName)) {
            labels.push({ name: monthName, index })
            seen.add(monthName)
          }
        }
      })

      return labels
    }, [weeks])

    const colors = [
      "bg-zinc-800 border-zinc-700",
      "bg-green-900/30 border-green-800",
      "bg-green-800/50 border-green-700",
      "bg-green-600/70 border-green-600",
      "bg-green-500 border-green-400",
    ]

    return (
      <TooltipProvider>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Activity Calendar</h3>
              </div>
            </div>

            {/* Month labels */}
            <div className="hidden sm:block mb-2">
              <div className="flex text-xs text-gray-400 ml-8">
                {weeks.map((_, i) => {
                  const label = monthLabelPositions.find((m) => m.index === i)
                  return (
                    <div key={i} className="w-3 h-3 mr-1 text-center">
                      {label ? label.name : ""}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              {/* Day labels */}
              <div className="hidden sm:flex flex-col gap-1 text-xs text-gray-400 pt-1">
                {dayLabels.map((day, i) => (
                  <div key={i} className="h-3 flex items-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => {
                        const intensity = day ? getIntensityLevel(day.count) : 0
                        return (
                          <Tooltip key={`${weekIndex}-${dayIndex}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 rounded-sm border transition-all duration-200
                                hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 cursor-pointer
                                ${colors[intensity]}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-gray-900 border-gray-700 text-white p-3 rounded-lg shadow-lg"
                            >
                              <div className="text-sm">
                                <div className="font-medium">
                                  {day ? `${day.count} article${day.count > 1 ? "s" : ""} read` : "No activity"}
                                </div>
                                <div className="text-gray-400 text-xs mt-1">
                                  {day ? formatDate(day.date) : "No date"}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Activity Level:</span>
                <div className="flex items-center gap-1">
                  {colors.map((cls, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm border ${cls}`}></div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400">Less ← → More</div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
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
                    <h3 className="font-medium text-white">Select Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {userdata?.categories.map((category) => (
                        <button
                          key={category}
                          className={`p-4 rounded-lg border transition-all 
                               border-blue-600 bg-blue-900/30 text-blue-300
                             `}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}</span>
                          </div>
                        </button>
                      ))}

                    </div>
                    <MultiSelect options={topicOptions} selected={topics} onChange={setTopics} placeholder="Select topics" className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={updateUserPreferences}>
                    Save Preferences
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          {/* Learning Progress */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Learning Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-left justify-start cursor-pointer">
                  <Calendar className="h-4 w-4 mr-2" />
                  Learning Streak
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 bg-zinc-800 hover:bg-zinc-900 hover:text-white text-white h-12 text-left justify-start cursor-pointer"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Challenges
                </Button>
              </div>
            </CardContent>
            {heatmap && <Heatmap heatmap={heatmap} />}
          </Card>

          {/* Activity Calendar */}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
