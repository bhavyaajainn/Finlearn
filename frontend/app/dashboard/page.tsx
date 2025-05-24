"use client"

import { useEffect } from "react"
import { Dashboard } from "./components/Dashboard"

export default function Home() {
  // Ensure scroll to top when dashboard page loads
  useEffect(() => {
    console.log('📍 Dashboard page mounted - scrolling to top')
    
    // Immediate scroll to top
    window.scrollTo(0, 0)
    
    // Additional smooth scroll as backup
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <Dashboard />
}