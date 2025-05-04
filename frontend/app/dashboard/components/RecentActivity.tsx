"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, TrendingDown, TrendingUp } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      type: "learn",
      title: "Learned about Market Capitalization",
      time: "2 hours ago",
      icon: BookOpen,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-950/30",
    },
    {
      type: "watchlist",
      title: "AAPL increased by 2.5%",
      time: "4 hours ago",
      trend: "up",
      icon: TrendingUp,
      iconColor: "text-green-500",
      bgColor: "bg-green-950/30",
    },
    {
      type: "watchlist",
      title: "BTC decreased by 1.2%",
      time: "6 hours ago",
      trend: "down",
      icon: TrendingDown,
      iconColor: "text-red-500",
      bgColor: "bg-red-950/30",
    },
  ]

  return (
    <Card className="bg-black border-blue-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`mt-0.5 rounded-full p-1.5 ${activity.bgColor}`}>
                <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{activity.title}</p>
                  {activity.type === "watchlist" && (
                    <Badge
                      variant="outline"
                      className={
                        activity.trend === "up"
                          ? "bg-green-950/50 text-green-400 border-green-800"
                          : "bg-red-950/50 text-red-400 border-red-800"
                      }
                    >
                      {activity.trend === "up" ? "Increase" : "Decrease"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
