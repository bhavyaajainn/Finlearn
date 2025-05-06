"use client"

import { ExternalLink, Lightbulb, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock AI summary data
const generateSummaryData = (asset: { name: string; ticker: string; type: string }) => {
  if (asset.type === "stock") {
    return {
      overview: `${asset.name} (${asset.ticker}) is a leading technology company specializing in consumer electronics, software, and online services. The company has shown consistent revenue growth over the past 5 years, with a strong focus on innovation and expanding its ecosystem of products and services.`,
      fundamentals: [
        "Strong balance sheet with over $200B in cash reserves",
        "Consistent revenue growth averaging 15% annually",
        "High profit margins compared to industry peers",
        "Increasing dividend payouts to shareholders",
      ],
      recentDevelopments: [
        "Launched new product line expected to drive significant revenue",
        "Expanded services division, now accounting for 20% of revenue",
        "Announced $50B stock buyback program",
        "Facing regulatory challenges in European markets",
      ],
      outlook: {
        bullish: [
          "Strong product pipeline and innovation roadmap",
          "Expanding market share in emerging markets",
          "Growing services revenue provides recurring income",
        ],
        bearish: [
          "Increasing competition in core markets",
          "Potential impact from global supply chain disruptions",
          "Regulatory risks could impact business model",
        ],
      },
      sources: [
        { name: "Q2 Earnings Report", url: "#" },
        { name: "Industry Analysis by Morgan Stanley", url: "#" },
        { name: "Regulatory Filing", url: "#" },
      ],
    }
  } else if (asset.type === "crypto") {
    return {
      overview: `${asset.name} (${asset.ticker}) is a decentralized cryptocurrency that utilizes blockchain technology to enable secure, peer-to-peer transactions without the need for intermediaries. It has gained significant adoption as both a store of value and a medium of exchange.`,
      fundamentals: [
        "Limited supply cap of 21 million tokens",
        "Decentralized network with strong security record",
        "Growing institutional adoption and investment",
        "Increasing integration with traditional financial systems",
      ],
      recentDevelopments: [
        "Major upgrade to improve transaction throughput",
        "Several countries adopting as legal tender",
        "Growing number of ETFs and investment products",
        "Increased focus on energy consumption concerns",
      ],
      outlook: {
        bullish: [
          "Continued institutional adoption as inflation hedge",
          "Technical improvements enhancing utility",
          "Growing acceptance as payment method",
        ],
        bearish: [
          "Regulatory uncertainty in major markets",
          "Competition from other cryptocurrencies",
          "Environmental concerns about energy usage",
        ],
      },
      sources: [
        { name: "Network Statistics Report", url: "#" },
        { name: "Crypto Market Analysis by Messari", url: "#" },
        { name: "Regulatory Updates", url: "#" },
      ],
    }
  } else {
    // ETF
    return {
      overview: `${asset.name} (${asset.ticker}) is an exchange-traded fund that tracks the performance of the S&P 500 index, providing investors with exposure to 500 of the largest U.S. publicly traded companies. It offers a diversified investment approach with low expense ratios.`,
      fundamentals: [
        "Assets under management of $450 billion",
        "Low expense ratio of 0.09%",
        "High liquidity with average daily volume of 70 million shares",
        "Dividend yield of approximately 1.5%",
      ],
      recentDevelopments: [
        "Rebalancing to include more technology companies",
        "Increased inflows during recent market volatility",
        "Dividend payout increased by 5% year-over-year",
        "New ESG-focused variant launched",
      ],
      outlook: {
        bullish: [
          "Continued investor preference for passive index funds",
          "Strong performance of large-cap U.S. equities",
          "Low-cost structure attractive in all market environments",
        ],
        bearish: [
          "Potential market correction after extended bull run",
          "Concentration risk in top holdings",
          "Rising interest rates may impact equity valuations",
        ],
      },
      sources: [
        { name: "Fund Prospectus", url: "#" },
        { name: "ETF Market Analysis by BlackRock", url: "#" },
        { name: "Quarterly Holdings Report", url: "#" },
      ],
    }
  }
}

interface AssetSummaryProps {
  asset: {
    name: string
    ticker: string
    type: string
  }
}

export default function AssetSummary({ asset }: AssetSummaryProps) {
  const summaryData = generateSummaryData(asset)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">AI-Powered Summary</h3>
        <Badge variant="outline" className="bg-blue-950/30">
          Powered by Perplexity AI
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="border border-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Overview</h4>
          <p className="text-sm">{summaryData.overview}</p>
        </div>

        <div className="border border-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Key Fundamentals</h4>
          <ul className="space-y-2">
            {summaryData.fundamentals.map((item, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Recent Developments</h4>
          <ul className="space-y-2">
            {summaryData.recentDevelopments.map((item, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              Bullish Factors
            </h4>
            <ul className="space-y-2">
              {summaryData.outlook.bullish.map((item, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
              Bearish Factors
            </h4>
            <ul className="space-y-2">
              {summaryData.outlook.bearish.map((item, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Lightbulb className="h-4 w-4 mr-2 text-blue-500" />
            <h4 className="font-medium text-sm">Sources & Citations</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summaryData.sources.map((source, index) => (
              <Button key={index} variant="outline" size="sm" className="text-xs" asChild>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {source.name}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
