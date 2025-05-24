"use client"

import { useEffect } from "react"
import { Dashboard } from "./components/Dashboard"

export default function Home() {
  
  useEffect(() => {
    window.scrollTo(0, 0)    
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <Dashboard />
}