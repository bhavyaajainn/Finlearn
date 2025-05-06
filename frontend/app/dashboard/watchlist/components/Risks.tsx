"use client"

import { AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Mock risk data
const generateRiskData = (asset: { name: string; ticker: string; type: string }) => {
  // Different risk profiles based on asset type
  if (asset.type === "crypto") {
    return {
      volatility: 85,
      marketRisk: 75,
      regulatoryRisk: 80,
      liquidityRisk: 60,
      factors: [
        {
          id: "1",
          title: "High Market Volatility",
          description: `${asset.name} has shown significant price swings in the past, with daily movements often exceeding 5%.`,
          impact: "high",
        },
        {
          id: "2",
          title: "Regulatory Uncertainty",
          description: `Cryptocurrency regulations are evolving globally, which could impact ${asset.ticker}'s adoption and value.`,
          impact: "high",
        },
        {
          id: "3",
          title: "Technology Risks",
          description: `As a blockchain-based asset, ${asset.ticker} faces risks related to network security, scalability, and potential technical vulnerabilities.`,
          impact: "medium",
        },
      ],
    }
  } else if (asset.type === "stock") {
    return {
      volatility: 45,
      marketRisk: 50,
      regulatoryRisk: 35,
      liquidityRisk: 20,
      factors: [
        {
          id: "1",
          title: "Competitive Pressure",
          description: `${asset.name} faces increasing competition in its core markets, which could impact future growth and market share.`,
          impact: "medium",
        },
        {
          id: "2",
          title: "Supply Chain Disruptions",
          description: `Global supply chain issues could affect ${asset.name}'s production capacity and product availability.`,
          impact: "medium",
        },
        {
          id: "3",
          title: "Valuation Concerns",
          description: `Some analysts believe ${asset.ticker} is currently trading at a premium compared to industry peers.`,
          impact: "low",
        },
      ],
    }
  } else {
    // ETF
    return {
      volatility: 30,
      marketRisk: 40,
      regulatoryRisk: 20,
      liquidityRisk: 15,
      factors: [
        {
          id: "1",
          title: "Market Correlation",
          description: `As an ETF, ${asset.ticker} is highly correlated with broader market movements and may be impacted by macroeconomic factors.`,
          impact: "medium",
        },
        {
          id: "2",
          title: "Sector Concentration",
          description: `${asset.ticker} has significant exposure to certain sectors, which could lead to underperformance if those sectors face challenges.`,
          impact: "medium",
        },
        {
          id: "3",
          title: "Interest Rate Sensitivity",
          description: `Changes in interest rates could impact the performance of assets within the ${asset.ticker} portfolio.`,
          impact: "low",
        },
      ],
    }
  }
}

interface AssetRisksProps {
  asset: {
    name: string
    ticker: string
    type: string
  }
}

export default function AssetRisks({ asset }: AssetRisksProps) {
  const riskData = generateRiskData(asset)

  return (
    <div>
      <h3 className="font-medium mb-4">Risk Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Volatility</span>
              <span className="text-sm font-medium">{riskData.volatility}%</span>
            </div>
            <Progress value={riskData.volatility} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Market Risk</span>
              <span className="text-sm font-medium">{riskData.marketRisk}%</span>
            </div>
            <Progress value={riskData.marketRisk} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Regulatory Risk</span>
              <span className="text-sm font-medium">{riskData.regulatoryRisk}%</span>
            </div>
            <Progress value={riskData.regulatoryRisk} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Liquidity Risk</span>
              <span className="text-sm font-medium">{riskData.liquidityRisk}%</span>
            </div>
            <Progress value={riskData.liquidityRisk} className="h-2 bg-blue-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm">Key Risk Factors</h4>

          {riskData.factors.map((factor,i) => (
            <div key={i} className="border border-blue-900/20 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle
                  className={`h-5 w-5 mr-2 flex-shrink-0 ${
                    factor.impact === "high"
                      ? "text-red-500"
                      : factor.impact === "medium"
                        ? "text-yellow-500"
                        : "text-blue-500"
                  }`}
                />
                <div>
                  <h5 className="font-medium text-sm">{factor.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{factor.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
