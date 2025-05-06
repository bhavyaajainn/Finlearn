"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, BookMarked, Target, TrendingUp } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Learning Streak",
      value: "7 Days",
      change: "+2 from last week",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-950/30",
    },
    {
      title: "Concepts Mastered",
      value: "42",
      change: "+5 this week",
      icon: BookMarked,
      color: "text-green-500",
      bgColor: "bg-green-950/30",
    },
    {
      title: "Portfolio Growth",
      value: "+12.5%",
      change: "Since you started",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-950/30",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-black border-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-500" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
