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
      <div className="h-full overflow-auto p-6">
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Watchlist</h1>
              <p className="text-gray-400">Track your favorite assets</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-black border-blue-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-400" />
                    Your Watchlist
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search assets..."
                      className="pl-8 bg-blue-950/20 border-blue-900/50 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stocks" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-950/20">
                    <TabsTrigger value="stocks" className="data-[state=active]:bg-blue-600">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Stocks
                    </TabsTrigger>
                    <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-600">
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Crypto
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="stocks" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {stockAssets.map((asset) => (
                        <AssetCard key={asset.symbol} asset={asset} type="stock" />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="crypto" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {cryptoAssets.map((asset) => (
                        <AssetCard key={asset.symbol} asset={asset} type="crypto" />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-black border-blue-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Market trend chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <AddAssetDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}
