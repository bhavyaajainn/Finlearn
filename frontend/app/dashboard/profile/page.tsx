"use client";
import { useState, useEffect } from "react";
import {
  Award,
  BadgeCheck,
  Bitcoin,
  Briefcase,
  Calendar,
  Check,
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


const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [calendarView, setCalendarView] = useState("1year");
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("streak");
  const [newTopicName, setNewTopicName] = useState("");
  const [showAddTopic, setShowAddTopic] = useState(false);
  
  
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
  
  const handleSaveProfile = () => {
    setEditing(false);
  };
  
  const toggleInterest = (id: string) => {
    setInterests(
      interests.map((interest) =>
        interest.id === id
          ? { ...interest, selected: !interest.selected }
          : interest
      )
    );
  };
  
  const addNewTopic = () => {
    if (newTopicName.trim()) {
      const newTopic = {
        id: `custom-${Date.now()}`,
        name: newTopicName.trim(),
        icon: <DollarSign className="h-4 w-4" />,
        selected: true
      };
      
      setInterests([...interests, newTopic]);
      setNewTopicName("");
      setShowAddTopic(false);
    }
  };
  
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
      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-gray-400">Manage your account and learning preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-medium">Basic Information</h2>
              </div>
              <button 
                onClick={() => setEditing(!editing)} 
                className="flex items-center bg-transparent text-blue-400 border border-blue-600 px-3 py-1.5 rounded-md text-sm hover:bg-blue-900/30"
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
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col items-center md:w-1/4 mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
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
                  
                  <div className="flex gap-2 mt-4">
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
                
                <div className="md:w-3/4 md:pl-8">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                    {/* Left Column - User Information */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Name</div>
                        {editing ? (
                          <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-white">{name}</div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>
                        {editing ? (
                          <input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-white">{email}</div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Member Since</div>
                        <div className="text-white">April 15, 2025</div>
                      </div>
                    </div>
                    
                    {/* Right Column - Streak Information */}
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center mb-2">
                <LineChart className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-medium">Topics of Interest</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Select topics that interest you the most. This helps us personalize your learning experience.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${interest.selected 
                        ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
                        : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:bg-zinc-800'}
                    `}
                  >
                    <div className={`rounded-full p-1.5 ${interest.selected ? 'bg-blue-800/50' : 'bg-zinc-700'}`}>
                      {interest.icon}
                    </div>
                    <span className="font-medium">{interest.name}</span>
                    {interest.selected && <Check className="h-4 w-4 ml-auto" />}
                  </div>
                ))}
                
                {/* Add custom topic button */}
                {!showAddTopic ? (
                  <div
                    onClick={() => setShowAddTopic(true)}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-zinc-700 text-gray-400 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Custom Topic</span>
                  </div>
                ) : (
                  <div className="flex flex-col p-3 rounded-lg border border-blue-800 bg-blue-900/20">
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="Enter topic name"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addNewTopic}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                      >
                        Add Topic
                      </button>
                      <button
                        onClick={() => setShowAddTopic(false)}
                        className="bg-zinc-700 text-white px-3 py-1 rounded-md hover:bg-zinc-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Progress Card with improved tabs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-medium">Learning Progress</h2>
              </div>
              
              {/* Improved Tab Navigation */}
              <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 mt-4">
                <button 
                  onClick={() => setActiveTab("streak")}
                  className={`flex items-center justify-center flex-1 py-3 rounded-md transition-all duration-200 ${
                    activeTab === "streak" 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-400 hover:bg-zinc-700"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Learning Streak
                </button>
                <button 
                  onClick={() => setActiveTab("challenges")}
                  className={`flex items-center justify-center flex-1 py-3 rounded-md transition-all duration-200 ${
                    activeTab === "challenges" 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-400 hover:bg-zinc-700"
                  }`}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Challenges
                </button>
              </div>
              
              {/* Tab Content */}
              <div>
                {activeTab === "streak" ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Activity Calendar</h3>
                      <div className="flex bg-zinc-800 rounded-md overflow-hidden">
                        <button 
                          onClick={() => setCalendarView("30days")}
                          className={`px-3 py-1.5 text-sm ${calendarView === "30days" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                        >
                          30 Days
                        </button>
                        <button 
                          onClick={() => setCalendarView("6months")}
                          className={`px-3 py-1.5 text-sm ${calendarView === "6months" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                        >
                          6 Months
                        </button>
                        <button 
                          onClick={() => setCalendarView("1year")}
                          className={`px-3 py-1.5 text-sm ${calendarView === "1year" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                        >
                          1 Year
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-4 overflow-x-auto">
                      {renderActivityHeatmap()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {challengesData.map((challenge) => (
                      <div key={challenge.id} className="bg-zinc-800 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-full p-2.5 ${challenge.completed ? 'bg-green-900/30' : 'bg-blue-900/30'}`}>
                            {challenge.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  {challenge.name}
                                  {challenge.completed && (
                                    <BadgeCheck className="h-4 w-4 text-green-400 ml-2" />
                                  )}
                                </h4>
                                <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                              </div>
                              
                              {challenge.completed ? (
                                <div className="bg-green-900/30 text-green-400 border border-green-800 px-2 py-1 rounded-full text-xs">
                                  Completed
                                </div>
                              ) : (
                                <div className="bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-1 rounded-full text-xs">
                                  In Progress
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-gray-400">Progress</span>
                                <span className="text-sm">{challenge.progress}%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-blue-600'}`}
                                  style={{ width: `${challenge.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center text-sm">
                              <div className="text-gray-400">
                                Reward: <span className="text-blue-400">{challenge.reward}</span>
                              </div>
                              {!challenge.completed && (
                                <button className="text-blue-400 hover:text-blue-300 flex items-center">
                                  View Details
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;