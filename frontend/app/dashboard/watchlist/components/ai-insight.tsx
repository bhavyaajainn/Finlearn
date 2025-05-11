"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Link, AlertTriangle, TrendingUp, Users } from "lucide-react"
import type { Asset } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface AiInsightProps {
  asset: Asset
}

export function AiInsight({ asset }: AiInsightProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading AI insights
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [asset])

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-400 text-sm">Generating AI insights...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <Brain className="text-blue-400 mr-2" size={18} />
            <h3 className="text-sm font-medium text-gray-300">Perplexity AI Summary</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            {asset.type === "Stock" ? (
              <>
                {asset.name} ({asset.ticker}) has shown {asset.changePercent > 0 ? "positive" : "negative"} momentum
                recently, with a {Math.abs(asset.changePercent).toFixed(2)}% {asset.changePercent > 0 ? "gain" : "loss"}{" "}
                in the last 24 hours. The company's market capitalization stands at ${asset.marketCap.toLocaleString()},
                placing it among the{" "}
                {asset.marketCap > 100000000000 ? "largest" : asset.marketCap > 10000000000 ? "mid-sized" : "smaller"}{" "}
                companies in its sector.
              </>
            ) : (
              <>
                {asset.name} ({asset.ticker}) has experienced {asset.changePercent > 0 ? "upward" : "downward"} price
                action recently, with a {Math.abs(asset.changePercent).toFixed(2)}%{" "}
                {asset.changePercent > 0 ? "increase" : "decrease"} in the last 24 hours. With a market cap of $
                {asset.marketCap.toLocaleString()}, it ranks among the{" "}
                {asset.marketCap > 50000000000 ? "top" : asset.marketCap > 5000000000 ? "mid-tier" : "emerging"}{" "}
                cryptocurrencies by market value.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {["Technical Analysis", "Fundamental Data", "Market Sentiment"].map((source) => (
              <div key={source} className="flex items-center text-xs text-blue-400">
                <Link size={12} className="mr-1" />
                <span>{source}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="text-yellow-500 mr-2" size={18} />
            <h3 className="text-sm font-medium text-gray-300">Risks & Volatility</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            {asset.type === "Stock" ? (
              <>
                {asset.name} has a beta of {(Math.random() * 2).toFixed(2)}, indicating{" "}
                {Math.random() > 0.5 ? "higher" : "lower"} volatility compared to the overall market. Key risks include{" "}
                {Math.random() > 0.5 ? "competitive pressures" : "regulatory challenges"} and potential{" "}
                {Math.random() > 0.5 ? "margin compression" : "supply chain disruptions"}.
              </>
            ) : (
              <>
                {asset.name} has shown {Math.random() > 0.5 ? "high" : "moderate"} volatility with a 30-day average of{" "}
                {(Math.random() * 5 + 2).toFixed(2)}%. Investors should be aware of risks including{" "}
                {Math.random() > 0.5 ? "regulatory uncertainty" : "technological vulnerabilities"} and{" "}
                {Math.random() > 0.5 ? "market manipulation concerns" : "liquidity constraints"}.
              </>
            )}
          </p>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <div className="p-4">
          <div className="flex items-center mb-3">
            {asset.type === "Stock" ? (
              <Users className="text-purple-400 mr-2" size={18} />
            ) : (
              <TrendingUp className="text-green-400 mr-2" size={18} />
            )}
            <h3 className="text-sm font-medium text-gray-300">
              {asset.type === "Stock" ? "Management Overview" : "Project Development"}
            </h3>
          </div>
          <p className="text-sm text-gray-300">
            {asset.type === "Stock" ? (
              <>
                Led by {Math.random() > 0.5 ? "an experienced" : "a visionary"} CEO with a background in{" "}
                {Math.random() > 0.5 ? "technology" : "finance"}. The management team has been focused on{" "}
                {Math.random() > 0.5 ? "expanding market share" : "improving operational efficiency"} and{" "}
                {Math.random() > 0.5 ? "developing new product lines" : "strategic acquisitions"}.
              </>
            ) : (
              <>
                The {asset.name} development team has been {Math.random() > 0.5 ? "actively" : "steadily"} working on{" "}
                {Math.random() > 0.5 ? "protocol upgrades" : "scaling solutions"} and{" "}
                {Math.random() > 0.5 ? "new partnerships" : "ecosystem expansion"}. Recent milestones include{" "}
                {Math.random() > 0.5 ? "improved transaction throughput" : "enhanced security features"}.
              </>
            )}
          </p>
        </div>
      </Card>
    </div>
  )
}
