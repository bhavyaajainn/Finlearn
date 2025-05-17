"use client"

import { motion } from "framer-motion"
import { UserInfo } from "./UserInfo"
import { GlossaryCard } from "./GlossaryCard"
import MotivationCard from "./MotivationCard"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"
import UserPreferencesDialog from "./UserPreferencesDialog"

export function Dashboard() {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { preferences, loading } = useAppSelector((state) => state.preferences);

  // Check if we need to show the preferences dialog
  useEffect(() => {
    if (user) {
      dispatch(fetchUserPreferences(user.uid))
        .unwrap()
        .then((data) => {
          // If no preferences are set, show the dialog
          if (!data || !data.expertise_level || !data.categories || data.categories.length === 0) {
            setShowPreferencesDialog(true);
          }
        })
        .catch(() => {
          // If there's an error fetching preferences, show the dialog
          setShowPreferencesDialog(true);
        });
    }
  }, [user, dispatch]);

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
    <>
      <UserPreferencesDialog 
        open={showPreferencesDialog} 
        onOpenChange={setShowPreferencesDialog} 
      />
    
      <div className="h-full p-6 container mx-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome to your financial journey</p>
          </motion.div>

          <motion.div variants={item}>
            <UserInfo />
          </motion.div>
          
          <MotivationCard />

          <motion.div variants={item}>
            <GlossaryCard />
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}