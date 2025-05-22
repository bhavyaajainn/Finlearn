"use client";
import { useState, useEffect } from "react";
import {
  Award,
  BadgeCheck,
  Bitcoin,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Home,
  LineChart,
  Lock,
  Plus,
  Save,
  Upload,
  User
} from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";
import { toast } from "sonner";
import { MultiSelect } from "@/components/multi-select";
import { topicOptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserPreferences {
  expertise_level: string,
  categories: string[],
}


const challengesData = [
  {
    id: "7day",
    name: "7-Day Streak",
    description: "Complete at least one learning activity daily for 7 consecutive days",
    progress: 100,
    completed: true,
    reward: "Quick Learner Badge",
    icon: <Award className="h-5 w-5 text-green-400" />
  },
  {
    id: "30day",
    name: "30-Day Challenge",
    description: "Complete at least one learning activity daily for 30 consecutive days",
    progress: 100,
    completed: true,
    reward: "Dedicated Student Badge",
    icon: <Award className="h-5 w-5 text-blue-400" />
  },
  {
    id: "100day",
    name: "100-Day Challenge",
    description: "Complete at least one learning activity daily for 100 consecutive days",
    progress: 65,
    completed: false,
    reward: "Finance Expert Badge",
    icon: <Clock className="h-5 w-5 text-yellow-400" />
  },
  {
    id: "365day",
    name: "365-Day Challenge",
    description: "Complete at least one learning activity daily for a full year",
    progress: 15,
    completed: false,
    reward: "Finance Master Title",
    icon: <Lock className="h-5 w-5 text-gray-400" />
  },
];
const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [calendarView, setCalendarView] = useState("1year");
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("topics");
  const [userdata, setuserdata] = useState<UserPreferences>();
  const [expertiseLevel, setExpertiseLevel] = useState("beginner"); // or fetched value
  const [interests, setInterests] = useState([
    { id: "stocks", name: "Stocks", icon: <LineChart className="h-4 w-4" />, selected: true },
    { id: "crypto", name: "Cryptocurrency", icon: <Bitcoin className="h-4 w-4" />, selected: true },
    { id: "personal-finance", name: "Personal Finance", icon: <DollarSign className="h-4 w-4" />, selected: true },
    { id: "real-estate", name: "Real Estate", icon: <Home className="h-4 w-4" />, selected: true },
    { id: "macro-economics", name: "Macro Economics", icon: <LineChart className="h-4 w-4" />, selected: true },
    { id: "budgeting", name: "Budgeting", icon: <DollarSign className="h-4 w-4" />, selected: true },
    { id: "retirement", name: "Retirement Planning", icon: <Briefcase className="h-4 w-4" />, selected: true },
    { id: "tax-optimization", name: "Tax Optimization", icon: <DollarSign className="h-4 w-4" />, selected: true },
  ]);
  const handleExpertiseSelect = async (level: string) => {
    setExpertiseLevel(level);
    await updatePreferences();
    setActiveTab("topics");
  }
  const [topics, setTopics] = useState<string[]>([]);
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const fetchPreferences = async () => {
    if (!user) {
      toast.error("No user found.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/selectedcategories?user_id=${user.uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to fetch data.");
      }

      const data = await res.json();

      setuserdata(data);

      console.log("User preferences:", data);
      toast.success("User preferences fetched successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const updatePreferences = async () => {
    if (!user) {
      toast.error("No user found.");
      return;
    }

    if (topics.length == 0) {
      toast.error("No Topics Added");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/selectedcategories?user_id=${user.uid}`,
        {
          method: "PUT",
          body: JSON.stringify({
            expertise_level: expertiseLevel,
            categories: topics.length === 0 ? userdata?.categories : topics,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        console.log(errorData)
        throw new Error(errorData?.message || "Failed to update data.", errorData);
      }

      const data = await res.json();

      setuserdata(data);

      console.log("User preferences:", data);

      toast.success("User preferences updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  useEffect(() => {
    const today = new Date();
    const data: Record<string, number> = {};

    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];


      const activity = Math.floor(Math.random() * 5);
      data[dateStr] = activity;
    }

    setActivityData(data);
  }, []);

  const getCalendarDays = () => {
    return calendarView === "30days" ? 30 : calendarView === "6months" ? 180 : 365;
  };


  const renderActivityHeatmap = () => {
    const today = new Date();
    const days = getCalendarDays();
    const cells = [];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


    const rowHeaders = daysOfWeek.map((day, index) => (
      <div key={`header-${day}`} className="flex items-center justify-end h-6 pr-2 text-xs text-gray-500 w-12">
        {day}
      </div>
    ));


    const weeksToShow = Math.ceil(days / 7);


    const calendarData = Array(7).fill(null).map(() => Array(weeksToShow).fill(null));


    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const date = new Date();
      date.setDate(today.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];



      let dayOfWeek = date.getDay() - 1;
      if (dayOfWeek < 0) dayOfWeek = 6;


      const weekIndex = Math.floor(dayOffset / 7);


      if (weekIndex < weeksToShow) {
        const activity = activityData[dateStr] || 0;
        calendarData[dayOfWeek][weekIndex] = {
          date,
          dateStr,
          activity
        };
      }
    }


    for (let row = 0; row < 7; row++) {
      const weekCells = [];


      for (let col = 0; col < weeksToShow; col++) {
        const cellData = calendarData[row][col];

        if (cellData) {

          let bgColor = "bg-zinc-800";
          if (cellData.activity === 1) bgColor = "bg-green-900/50";
          if (cellData.activity === 2) bgColor = "bg-green-700/60";
          if (cellData.activity === 3) bgColor = "bg-green-600/70";
          if (cellData.activity === 4) bgColor = "bg-green-500";

          weekCells.push(
            <div
              key={`cell-${row}-${col}`}
              className={`${bgColor} w-4 h-4 rounded-sm m-0.5 transition-colors hover:ring-1 hover:ring-blue-400 group relative`}
              title={`${cellData.dateStr}: Activity level ${cellData.activity}`}
            >
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 z-10">
                {cellData.dateStr} (Level: {cellData.activity})
              </div>
            </div>
          );
        } else {
          weekCells.push(
            <div key={`empty-${row}-${col}`} className="w-4 h-4 m-0.5" />
          );
        }
      }

      cells.push(
        <div key={`week-row-${row}`} className="flex items-center">
          {rowHeaders[row]}
          <div className="flex">{weekCells}</div>
        </div>
      );
    }


    const monthLabels = [];


    let monthsNeeded;
    if (calendarView === "30days") {
      monthsNeeded = 1;
    } else if (calendarView === "6months") {
      monthsNeeded = 6;
    } else {
      monthsNeeded = 12;
    }


    for (let i = 0; i < monthsNeeded; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);


      const monthName = date.toLocaleString('default', { month: 'short' });

      monthLabels.push(
        <div
          key={`month-${i}`}
          className="text-xs text-gray-500"
          style={{
            position: 'absolute',
            left: `${100 - (i * (100 / monthsNeeded))}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {monthName}
        </div>
      );
    }

    return (
      <div className="mt-4">
        {/* Month labels at top */}
        <div className="relative h-6 mb-2 ml-12">
          {monthLabels}
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-col">
            {cells}
          </div>
        </div>

        <div className="flex items-center mt-4 justify-end">
          <span className="text-xs text-gray-400 mr-2">Activity Level:</span>
          <div className="flex items-center gap-1">
            <div className="bg-zinc-800 w-3 h-3 rounded-sm"></div>
            <div className="bg-green-900/50 w-3 h-3 rounded-sm"></div>
            <div className="bg-green-700/60 w-3 h-3 rounded-sm"></div>
            <div className="bg-green-600/70 w-3 h-3 rounded-sm"></div>
            <div className="bg-green-500 w-3 h-3 rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your account and learning preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-medium">Basic Information</h2>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center bg-transparent text-blue-400 border border-blue-600 px-3 py-1.5 rounded-md text-sm hover:bg-blue-900/30 whitespace-nowrap"
              >
                {editing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:w-1/4 mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-400/70" />
                    </div>
                    {editing && (
                      <button
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 rounded-full border-2 border-black flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                    <div className="bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Finance Enthusiast
                    </div>
                    <div className="bg-green-900/30 text-green-400 border border-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Quick Learner
                    </div>
                  </div>
                </div>

                <div className="md:w-3/4 md:pl-8 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Name</div>
                        {editing ? (
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-white break-words">{name}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>
                        {editing ? (
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-white break-words">{email}</div>
                        )}
                      </div>

                      {/* Member Since */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Member Since</div>
                        <div className="text-white">April 15, 2025</div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Streak</div>
                        <div className="text-white">21 days</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
                        <div className="text-white">32 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Topics of Interest */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <LineChart className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Personalize Your Experience</h2>
            </div>

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
                <p className="text-gray-400 text-sm">Select your expertise level to help us tailor your learning journey.</p>

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
                    {userdata?.categories.map((category, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-md bg-blue-900/30 text-blue-300 font-medium border border-blue-800"
                      >
                        {category}
                      </div>
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
                    onClick={updatePreferences}
                    disabled={topics.length === 0}
                  >
                    Save Preferences
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProfilePage;