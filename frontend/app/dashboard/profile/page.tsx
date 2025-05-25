"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  LineChart,
  User
} from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";
import { toast } from "sonner";
import { MultiSelect } from "@/components/multi-select";
import { topicOptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Streak, UserPreferences } from "./types/profiletypes";
import { fetchPreferences, fetchstreak, updatePreferences } from "@/lib/actions";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>("topics");
  const [userdata, setuserdata] = useState<UserPreferences>();
  const [expertiseLevel, setExpertiseLevel] = useState<string>("beginner");
  const [streak, setStreak] = useState<Streak>();
  const [topics, setTopics] = useState<string[]>([]);
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const handleExpertiseSelect = async (level: string) => {
    setExpertiseLevel(level);
    await updateUserPreferences();
    setActiveTab("topics");
  }

  const fetchUserPreferences = async () => {
    if (!user) return toast.error("No user found.");
    try {
      const data = await fetchPreferences(user.uid);
      setuserdata(data);
    } catch (err: any) {
      toast.error(err.message || "Error fetching preferences.");
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

  const updateUserPreferences = async () => {
    if (!user) return toast.error("No user found.");
    if (topics.length === 0) return toast.error("No topics added.");

    try {
      const updated = await updatePreferences(user.uid, expertiseLevel, topics, userdata!);
      setuserdata(updated);
      toast.success("Preferences updated!");
    } catch (err: any) {
      toast.error(err.message || "Error updating preferences.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
      fetchuserstreak();
    }
  }, [user]);


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
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:w-1/4 mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-400/70" />
                    </div>
                    <button
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 rounded-full border-2 border-black flex items-center justify-center"
                    >
                    </button>
                  </div>
                </div>

                <div className="md:w-3/4 md:pl-8 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Name</div>
                        <div
                          className="text-white"
                        />
                        <div className="text-white break-words">{user?.displayName ?? "Name not found!"}</div>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>

                        <div className="text-white break-words">{user?.email ?? "Email not found!"}</div>
                      </div>

                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Streak</div>
                        <div className="text-white">{streak ? streak?.current_streak : "0"} days</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
                        <div className="text-white">{streak ? streak?.longest_streak : "0"} days</div>
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
                    onClick={() => user && updatePreferences(user.uid, expertiseLevel, topics, userdata!)}
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