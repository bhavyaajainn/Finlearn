"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, TrendingUp, Calendar } from "lucide-react"

export function UserInfo() {
  return (
    <Card className="bg-black border-blue-900/50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-200">Days Visited Learning Hub</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">1,250</span>
              <Badge variant="outline" className="bg-green-950/50 text-green-400 border-green-800">
                <TrendingUp className="mr-1 h-3 w-3" />
                20 Days Steak
              </Badge>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`h-1.5 w-full rounded-full ${i < 5 ? "bg-blue-500" : "bg-blue-900"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">Keep Participating in Quizzes to earn more XP!</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-200">No. Quizzez you participated</span>
            </div>
            <motion.div
              className="flex items-baseline gap-2"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 1.5,
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">1,250</span>
              </div>
            </motion.div>
            <Progress value={65} className="h-2 bg-blue-500" />
            <span className="text-xs text-gray-400">650 XP until next level</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-200">Concepts Learned</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">42</span>
              <span className="text-sm text-gray-400">of 100</span>
            </div>
            <Progress value={42} className="h-2 bg-blue-500" />
            <span className="text-xs text-gray-400">58 more to master basics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}
