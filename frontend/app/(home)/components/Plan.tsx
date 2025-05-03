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
      className="relative pl-8 border-l border-zinc-800"
    >
      <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center">
        {status === "completed" ? (
          <CheckCircle className="h-6 w-6 text-green-400" />
        ) : status === "in-progress" ? (
          <Clock className="h-6 w-6 text-blue-400" />
        ) : (
          <ArrowRight className="h-6 w-6 text-gray-400" />
        )}
      </div>

      <div className="mb-2 flex items-center">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="ml-3 text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">{timeline}</span>
      </div>

      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
