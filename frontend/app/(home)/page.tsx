"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Award, Users, Brain, TrendingUp, Lightbulb, Github } from "lucide-react"
import Link from "next/link"
import FeatureCard from "./components/Feature"
import Navbar from "@/components/Navbar"
import TeamMember from "./components/Team"
import RoadmapItem from "./components/Plan"
import { useState } from "react" 

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleAuthAction = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAuthModal(true);
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal} />
      <section className="relative min-h-[85vh] xs:min-h-[90vh] flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8">
        <div className="container max-w-6xl mx-auto text-center">
          <Badge className="mb-3 sm:mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 p-2 text-xs sm:text-sm">
            Built for Perplexity AI using Sonar
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            Master Finance with <span className="text-blue-400">AI-Powered</span> Micro-Learning
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
            FinLearn AI delivers personalized, bite-sized financial lessons powered by real-time data and adaptive AI to
            make you financially smarter every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 sm:py-3 flex items-center justify-center"
              onClick={handleAuthAction}
            >
              Try It Now 
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              className="w-full sm:w-auto min-w-[140px] border-blue-500 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white text-sm sm:text-base py-2 sm:py-3 flex items-center justify-center"
              onClick={() => window.open('https://github.com/bhavyaajainn/Finlearn', '_blank')}
            >
              <Github className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
              <span>View on GitHub</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-black" id="features">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm">Core Features</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              How FinLearn AI <span className="text-blue-400">Transforms</span> Your Financial Journey
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform adapts to your learning style and financial goals, delivering personalized
              education that sticks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<Brain className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="AI-Powered Micro-Lessons"
                description="Bite-sized, personalized daily lessons that adapt to your knowledge level and learning pace."
              />
            </div>
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="Real-Time Market Data"
                description="Track stocks, crypto, and financial trends with live data integrated into your learning experience."
              />
            </div>
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="Interactive Glossary"
                description="Master financial terminology with our AI-enhanced glossary that explains concepts in plain language."
              />
            </div>           
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="Daily Quizzes"
                description="Reinforce your knowledge with adaptive quizzes that focus on your growth areas."
              />
            </div>          
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="Daily Discipline"
                description="Track your learning streaks, monitor daily activities, and get personalized progress summaries to stay consistent."
              />
            </div>          
            <div onClick={handleAuthAction} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
              <FeatureCard
                icon={<Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
                title="Preference-Based Learning"
                description="Customize your experience by selecting topics of interest and your expertise level."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-zinc-950" id="technology">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm">Powered By</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              Cutting-Edge <span className="text-blue-400">Technology</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              We combine the latest AI models with real-time financial data to deliver an unmatched learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-stretch">
            <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
              <CardContent className="pt-6 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white">Perplexity AI Integration</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Advanced natural language processing for personalized learning</p>
                <ul className="space-y-2 sm:space-y-3 flex-grow">
                  {[
                    "Adaptive learning paths based on your progress",
                    "Natural language explanations of complex concepts",
                    "Personalized insights from real-time financial news and trends",
                    "Context-aware suggestions to improve your financial habits and literacy",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
                        <span className="text-xs sm:text-sm">✓</span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
              <CardContent className="pt-6 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white">Real-Time Financial APIs</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Live market data integrated into your learning experience</p>
                <ul className="space-y-2 sm:space-y-3 flex-grow">
                  {[
                    "Live stock and cryptocurrency price tracking",
                    "Economic indicators and market trends analysis",
                    "Financial news filtered for relevance to your interests",
                    "Historical data visualization for deeper understanding",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
                        <span className="text-xs sm:text-sm">✓</span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 md:py-24 bg-black" id="team">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm">Our Team</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              Meet the <span className="text-blue-400">Hackers</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              A passionate team of developers building the future of financial
              education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="h-full">
              <TeamMember
                name="Bhavya Jain"
                role="Full Stack Developer"
                image="/Bhavya.jpeg"
                github="https://github.com/bhavyaajainn"
                linkedin="https://www.linkedin.com/in/bhavya-jain-26552b159/"
              />
            </div>
            <div className="h-full">
              <TeamMember
                name="Athul"
                role="Backend Developer"
                image="/Athul.jpeg"
                github="https://github.com/ATHUL-B"
                linkedin="https://www.linkedin.com/in/athul-b-139009243/"
              />
            </div>
            <div className="h-full">
              <TeamMember
                name="Rohan Singla"
                role="Frontend and Web3 Dev"
                image="/Rohan.jpeg"
                github="https://github.com/Rohan-Singla"
                linkedin="https://www.linkedin.com/in/rohan-singla100/"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 md:py-24 bg-zinc-950" id="roadmap">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm">Roadmap</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              Upcoming <span className="text-blue-400">Plans</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              Our vision for the future of FinLearn AI and what we're building next.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            <RoadmapItem
              title="Mobile App Launch"
              timeline="Q3 2025"
              description="Cross-platform mobile app built with React Native to access FinLearn AI's features on the go with offline learning capabilities."
              status="in-progress"
            />
            <RoadmapItem
              title="Community Learning Hub"
              timeline="Q4 2025"
              description="Interactive challenges, peer learning groups, and community competitions to make financial education more engaging and collaborative."
              status="planned"
            />
            <RoadmapItem
              title="AI Finance Assistant"
              timeline="Q1 2026"
              description="Real-time chat-based AI assistant to answer your finance-related queries and provide personalized guidance instantly."
              status="planned"
            />
            <RoadmapItem
              title="Goal-Based Learning Tracks"
              timeline="Q2 2026"
              description="Specialized learning paths like 'Debt-Free Journey' and 'First-Time Investor' with milestone-based progression system."
              status="planned"
            />
            <RoadmapItem
              title="Financial Integration Hub"
              timeline="Q3 2026"
              description="Seamless integration with budgeting tools and real-time sync capabilities with bank accounts and UPI for practical learning."
              status="planned"
            />
          </div>
        </div>
      </section>
      <footer className="py-6 sm:py-8 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white text-lg sm:text-xl font-semibold mb-4 md:mb-0">
            FinLearn <span className="text-blue-400">AI</span>
          </div>
          <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400">
            <Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs sm:text-sm mt-4">
          © {new Date().getFullYear()} FinLearn AI. Powered by Perplexity AI.
        </div>
      </footer>
    </div>
  )
}