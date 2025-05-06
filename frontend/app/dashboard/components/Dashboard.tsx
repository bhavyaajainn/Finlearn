"use client"

import { motion } from "framer-motion"
import { UserInfo } from "./UserInfo"
import { GlossaryCard } from "./GlossaryCard"
import MotivationCard from "./MotivationCard"

export function Dashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="h-full p-6 container mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome to your financial journey</p>
        </motion.div>


        <motion.div variants={item}>
          <UserInfo />
        </motion.div>
        <MotivationCard/>

        <motion.div variants={item}>
          <GlossaryCard />
        </motion.div>

      </motion.div>
    </div>
  )
}
