"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"

interface RoadmapItemProps {
  title: string
  timeline: string
  description: string
  status: "completed" | "in-progress" | "planned"
}

export default function RoadmapItem({ title, timeline, description, status }: RoadmapItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative pl-6 sm:pl-8 border-l border-zinc-800"
    >
      <div className="absolute left-0 top-0 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
        {status === "completed" ? (
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
        ) : status === "in-progress" ? (
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        ) : (
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
        )}
      </div>

      <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
        <span className="sm:ml-3 text-xs sm:text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full w-fit">
          {timeline}
        </span>
      </div>

      <p className="text-xs sm:text-sm md:text-base text-gray-400">{description}</p>
    </motion.div>
  )
}