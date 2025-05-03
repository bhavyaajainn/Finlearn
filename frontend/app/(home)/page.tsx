import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Award, Users, Zap, Brain, TrendingUp, Lightbulb, Github } from "lucide-react"
import Link from "next/link"
import FeatureCard from "./components/Feature"
import Navbar from "@/components/Navbar"
import TeamMember from "./components/Team"
import RoadmapItem from "./components/Plan"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="container max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 p-2">
            Built for Perplexity AI using Sonar
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Master Web3 Finance with <span className="text-blue-400">AI-Powered</span> Micro-Learning
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            FinLearn AI delivers personalized, bite-sized financial lessons powered by real-time data and adaptive AI to
            make you financially smarter every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              Try It Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" className="border-blue-500 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-whitef cursor-pointer">
              <Github className="mr-2 h-4 w-4" /> View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black" id="features">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Core Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How FinLearn AI <span className="text-blue-400">Transforms</span> Your Financial Journey
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform adapts to your learning style and financial goals, delivering personalized
              education that sticks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-blue-400" />}
              title="AI-Powered Micro-Lessons"
              description="Bite-sized, personalized daily lessons that adapt to your knowledge level and learning pace."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-blue-400" />}
              title="Real-Time Market Data"
              description="Track stocks, crypto, and financial trends with live data integrated into your learning experience."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-blue-400" />}
              title="Interactive Glossary"
              description="Master financial terminology with our AI-enhanced glossary that explains concepts in plain language."
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-blue-400" />}
              title="Gamified Learning"
              description="Earn badges, complete challenges, and track your progress to stay motivated and engaged."
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-blue-400" />}
              title="Daily Quizzes"
              description="Reinforce your knowledge with adaptive quizzes that focus on your growth areas."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-400" />}
              title="Community Insights"
              description="Learn alongside peers and get answers from financial experts in our moderated community."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-zinc-950" id="technology">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Powered By</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cutting-Edge <span className="text-blue-400">Technology</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We combine the latest AI models with real-time financial data to deliver an unmatched learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-white">Perplexity AI Integration</h3>
                <p className="text-gray-400 mb-6">Advanced natural language processing for personalized learning</p>
                <ul className="space-y-3">
                  {[
                    "Adaptive learning paths based on your progress",
                    "Natural language explanations of complex concepts",
                    "Personalized feedback on your financial decisions",
                    "Continuous improvement based on your interactions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        <span className="text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-white">Real-Time Financial APIs</h3>
                <p className="text-gray-400 mb-6">Live market data integrated into your learning experience</p>
                <ul className="space-y-3">
                  {[
                    "Live stock and cryptocurrency price tracking",
                    "Economic indicators and market trends analysis",
                    "Financial news filtered for relevance to your interests",
                    "Historical data visualization for deeper understanding",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        <span className="text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-black" id="team">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Our Team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet the <span className="text-blue-400">Hackers</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A passionate team of developers building the future of financial
              education.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember
              name="Bhavya Jain"
              role="Full Stack Developer"
              image="/placeholder.svg?height=300&width=300"
              github="https://github.com/alexchen"
              linkedin="https://linkedin.com/in/alexchen"
            />
            <TeamMember
              name="Athul"
              role="Backend Developer"
              image="/placeholder.svg?height=300&width=300"
              github="https://github.com/sarahjohnson"
              linkedin="https://linkedin.com/in/sarahjohnson"
            />
            <TeamMember
              name="Rohan Singla"
              role="Frontend and Web3 Dev"
              image="/placeholder.svg?height=300&width=300"
              github="https://github.com/michaelrodriguez"
              linkedin="https://linkedin.com/in/michaelrodriguez"
            />
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-zinc-950" id="roadmap">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Roadmap</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Upcoming <span className="text-blue-400">Plans</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our vision for the future of FinLearn AI and what we're building next.
            </p>
          </div>

          <div className="space-y-12">
            <RoadmapItem
              title="Mobile App Development"
              timeline="Q3 2023"
              description="Native iOS and Android applications with offline learning capabilities and push notifications for daily lessons."
              status="in-progress"
            />
            <RoadmapItem
              title="Advanced Portfolio Simulator"
              timeline="Q4 2023"
              description="Risk-free environment to practice investment strategies with historical and simulated market conditions."
              status="planned"
            />
            <RoadmapItem
              title="Personalized Learning Paths"
              timeline="Q1 2024"
              description="AI-generated curriculum tailored to your financial goals, knowledge gaps, and learning preferences."
              status="planned"
            />
            <RoadmapItem
              title="Expert Mentorship Integration"
              timeline="Q2 2024"
              description="Connect with financial advisors and educators for personalized guidance and feedback."
              status="planned"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white text-xl font-semibold mb-4 md:mb-0">
            FinLearn <span className="text-blue-400">AI</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-blue-400 transition-colors">Features</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} FinLearn AI. Powered by Perplexity AI.
        </div>
      </footer>

    </div>
  )
}
