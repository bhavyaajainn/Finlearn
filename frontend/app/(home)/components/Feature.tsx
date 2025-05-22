"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  onClick?: () => void 
}

export default function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      onClick={onClick}
      className={`w-full ${onClick ? "cursor-pointer" : ""}`} 
    >
      <Card className="bg-zinc-900 border-zinc-800 h-full min-h-[200px] transition-all duration-300 hover:border-blue-500/50 hover:shadow-md">
        <CardContent className="pt-4 sm:pt-6 flex flex-col h-full">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 flex-shrink-0">{icon}</div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 flex-grow">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}