"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bitcoin, DollarSign, MoreVertical, TrendingDown, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Asset {
  name: string
  symbol: string
  price: number
  change: number
  changePercent: number
  trend: string
}

interface AssetCardProps {
  asset: Asset
  type: "stock" | "crypto"
}

export function AssetCard({ asset, type }: AssetCardProps) {
  const TrendIcon = asset.trend === "up" ? TrendingUp : TrendingDown
  const AssetIcon = type === "stock" ? DollarSign : Bitcoin

  const trendColor = asset.trend === "up" ? "text-green-500" : "text-red-500"

  const trendBgColor = asset.trend === "up" ? "bg-green-950/30" : "bg-red-950/30"

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-blue-950/10 border-blue-900/50 hover:bg-blue-950/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-950/50 p-1.5">
                <AssetIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">{asset.symbol}</p>
                <p className="text-xs text-gray-400">{asset.name}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Set Alert</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">${asset.price.toLocaleString()}</p>
              <div className="flex items-center gap-1">
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                <p className={`text-xs ${trendColor}`}>
                  {asset.trend === "up" ? "+" : ""}
                  {asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <div className={`rounded-full ${trendBgColor} p-1`}>
              <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-between text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
          >
            View Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
