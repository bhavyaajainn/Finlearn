"use client"
import { useState, useEffect } from "react"
import { BookOpen, LineChart, User, TrendingUp, Award, Target, Clock, Zap } from "lucide-react"
import { useAppSelector } from "@/app/store/hooks"
import { toast } from "sonner"
import { MultiSelect } from "@/components/multi-select"
import { topicOptions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts"
import { fetchPreferences, fetchstats, fetchstreak } from "@/lib/actions"

interface Streak {
  current_streak: number
  longest_streak: number
  total_articles: number
}

interface UserPreferences {
  categories: string[]
  expertiseLevel: string
}

interface UserStats {
  totalLessons: number
  completedLessons: number
  totalHours: number
  averageScore: number
  weeklyGoal: number
  weeklyProgress: number
  monthlyGoal: number
  monthlyProgress: number
}

interface Achievement {
  id: string
  title: string
  color: string
  date: string
}

interface SkillLevel {
  skill: string
  level: number
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>("topics")
  const [userdata, setUserdata] = useState<UserPreferences>({ categories: [], expertiseLevel: "beginner" })
  const [expertiseLevel, setExpertiseLevel] = useState<string>("beginner")
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0, total_articles: 0 })
  const [topics, setTopics] = useState<string[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchUserPreferences = async (userId: string) => {
    if (!userId) return toast("No user found.");
    try {
      const data = await fetchPreferences(userId);
      setUserdata(data);
    } catch (err: any) {
      toast.error(err.message || "Error fetching preferences.");
    }
  };

  const fetchStreak = async (userId: string) => {
    if (!userId) return toast("No user found.");

    try {
      const streakData = await fetchstreak(userId);
      setStreak(streakData);
    } catch (err: any) {
      toast.error(err.message || "Error fetching streak.");
    }
  }

  const fetchUserStats = async (userId: string, period: string, startdate: string, end_date: string) => {
    if (!userId) return toast("No user found.");

    try {
      const statsData = await fetchstats(API_BASE_URL || "", userId, period, startdate, end_date);
      setUserStats(statsData);
    } catch (err: any) {
      toast(err.message || "Error fetching streak.");
    }
  }

  const fetchAchievements = async (userId: string): Promise<Achievement[]> => {
    try {
      const response = await fetch(
          `${API_BASE_URL}/summary?user_id=${userId}&period=${period}&start_date=${start_date}&end_date=${end_date}&refresh=false`
      );
      const data = await response.json();

      console.log("fetch watchlist",data);

      return data;

  } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to fetch watchlist");
  }
  }

  const fetchSkillLevels = async (userId: string): Promise<SkillLevel[]> => {
    const response = await fetch(`/api/user/skills?userId=${userId}`)
    if (!response.ok) throw new Error("Failed to fetch skill levels")
    return response.json()
  }

  const updatePreferences = async (userId: string, expertise: string, topics: string[]): Promise<UserPreferences> => {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, expertise, topics })
    })
    if (!response.ok) throw new Error("Failed to update preferences")
    return response.json()
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)
      if (user) {
        const [prefs, streakData, stats, achieves, skills] = await Promise.all([
          fetchUserPreferences(user.uid),
          fetchStreak(user.uid),
          fetchUserStats(user.uid),
          fetchAchievements(user.uid),
          fetchSkillLevels(user.uid)
        ])

        setUserdata(prefs)
        setStreak(streakData)
        setUserStats(stats)
        setAchievements(achieves)
        setSkillLevels(skills)
        setExpertiseLevel(prefs.expertiseLevel)
        setTopics(prefs.categories)
      }
    } catch (error) {
      toast.error("Failed to fetch user data")
    } finally {
      setLoading(false)
    }
  }

  const handleExpertiseSelect = async (level: string) => {
    setExpertiseLevel(level)
    await updateUserPreferences()
    setActiveTab("topics")
  }

  const updateUserPreferences = async () => {
    if (!user) return toast.error("No user found.")
    if (topics.length === 0) return toast.error("No topics added.")

    try {
      const updated = await updatePreferences(user.uid, expertiseLevel, topics)
      setUserdata(updated)
      toast.success("Preferences updated!")
    } catch (err: any) {
      toast.error(err.message || "Error updating preferences.")
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const ProgressChart = () => {
    if (!userStats) return null

    const goalsData = [
      { name: 'Weekly', progress: userStats.weeklyProgress, goal: userStats.weeklyGoal },
      { name: 'Monthly', progress: userStats.monthlyProgress, goal: userStats.monthlyGoal }
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Learning Progress</h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={goalsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="progress" fill="#3B82F6" name="Progress" />
              <Bar dataKey="goal" fill="#10B981" name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8">
          <h4 className="font-medium mb-4">Skill Mastery</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="20%"
                outerRadius="100%"
                data={skillLevels}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="level"
                  cornerRadius={8}
                  fill="#3B82F6"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const UserSummary = () => {
    if (!userStats) return null

    return (
      <div className="space-y-6 text-white">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Learning Summary</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalLessons}</div>
              <div className="text-xs text-gray-400">Total Lessons</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.completedLessons}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalHours}</div>
              <div className="text-xs text-gray-400">Hours Learned</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.averageScore}%</div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 4).map((achievement) => (
              <Badge
                key={achievement.id}
                variant="secondary"
                className={`bg-${achievement.color}-900/30 text-${achievement.color}-300 border-${achievement.color}-800`}
              >
                <Award className="h-3 w-3 mr-1" />
                {achievement.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Completion Rate</span>
            <span className="text-sm text-gray-400">
              {Math.round((userStats.completedLessons / userStats.totalLessons) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(userStats.completedLessons / userStats.totalLessons) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading profile data...</div>
      </div>
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
          {/* Basic Information Card */}
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
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-400/70" />
                    </div>
                  </div>
                </div>

                <div className="md:w-3/4 md:pl-8 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Name</div>
                        <div className="text-white break-words">{user?.displayName ?? "Name not found!"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>
                        <div className="text-white break-words">{user?.email ?? "Email not found!"}</div>
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

          {/* Preferences Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-400" />
                <CardTitle>Personalize Your Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full sm:w-1/2 bg-zinc-800 p-1 rounded-md">
                  <TabsTrigger
                    value="expertise"
                    className="data-[state=active]:bg-blue-900/50 text-white data-[state=active]:text-blue-300 cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Expertise
                  </TabsTrigger>
                  <TabsTrigger
                    value="topics"
                    className="data-[state=active]:bg-blue-900/50 text-white data-[state=active]:text-blue-300 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Topics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expertise" className="space-y-6 mt-4">
                  <p className="text-gray-400 text-sm">
                    Select your expertise level to help us tailor your learning journey.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleExpertiseSelect(level)}
                        className={`p-6 rounded-lg border ${expertiseLevel === level
                          ? "border-blue-600 bg-blue-900/30 text-blue-300"
                          : "border-zinc-700 bg-zinc-800 text-gray-300 hover:border-blue-800 hover:bg-zinc-700"
                          } transition-all flex flex-col items-center justify-center gap-3`}
                      >
                        <div className="text-lg capitalize font-medium">{level}</div>
                        <div className="text-xs text-center text-gray-400">
                          {level === "beginner" && "New to the subject, learning fundamentals"}
                          {level === "intermediate" && "Comfortable with basics, expanding knowledge"}
                          {level === "advanced" && "Advanced knowledge, seeking deep insights"}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      onClick={() => setActiveTab("topics")}
                      disabled={!expertiseLevel}
                    >
                      Continue to Topics
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="topics" className="space-y-6 mt-4">
                  <p className="text-gray-400 text-sm">Select topics you're interested in learning about.</p>

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Your Current Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {userdata.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-900/30 text-blue-300 border-blue-800">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Add More Topics</h3>
                    <MultiSelect
                      options={topicOptions}
                      selected={topics}
                      onChange={setTopics}
                      placeholder="Select topics of interest"
                      className="w-full bg-zinc-800 text-white border border-white/30 rounded-md"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button
                      variant="secondary"
                      className="border-zinc-700 text-black cursor-pointer hover:bg-slate-300 flex-1 sm:flex-none"
                      onClick={() => setActiveTab("expertise")}
                    >
                      Back
                    </Button>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex-1 sm:flex-none"
                      onClick={updateUserPreferences}
                      disabled={topics.length === 0}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <UserSummary />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <ProgressChart />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage