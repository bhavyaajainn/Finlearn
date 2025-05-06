"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, DollarSign, LineChart, Plus, Search } from "lucide-react"
import { AddAssetDialog } from "./AddAsset"
import { AssetCard } from "./Assetcard"
import WatchList from "./List"
import Header from "./Header"
import WeeklyResearch from "./Research"

export function Watchlist() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const stockAssets = [
    {
      name: "Apple Inc.",
      symbol: "AAPL",
      price: 187.32,
      change: 1.25,
      changePercent: 0.67,
      trend: "up",
    },
    {
      name: "Microsoft Corp.",
      symbol: "MSFT",
      price: 378.85,
      change: 2.43,
      changePercent: 0.64,
      trend: "up",
    },
    {
      name: "Tesla Inc.",
      symbol: "TSLA",
      price: 175.21,
      change: -3.45,
      changePercent: -1.93,
      trend: "down",
    },
  ]

  const cryptoAssets = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: 43250.75,
      change: -850.25,
      changePercent: -1.93,
      trend: "down",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: 2345.67,
      change: 45.32,
      changePercent: 1.97,
      trend: "up",
    },
    {
      name: "Solana",
      symbol: "SOL",
      price: 145.32,
      change: 12.45,
      changePercent: 9.37,
      trend: "up",
    },
  ]

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
     <div className="container mx-auto px-4 py-6">
      <Header />

      <Tabs defaultValue="watchlist" className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="watchlist">WatchList</TabsTrigger>
          <TabsTrigger value="research">Weekly Research</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="space-y-6">
          <WatchList />
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <WeeklyResearch/>
        </TabsContent>
      </Tabs>
    </div>

    </>
  )
}
