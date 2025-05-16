"use client"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, Zap, BarChart3 } from "lucide-react"

// Mock risk data
const mockRisks = {
  "1": {
    // Apple
    volatility: 25,
    marketRisk: 30,
    competitionRisk: 45,
    regulatoryRisk: 40,
    risks: [
      {
        title: "Supply Chain Disruptions",
        description:
          "Apple's heavy reliance on Asian manufacturing makes it vulnerable to geopolitical tensions and supply chain disruptions.",
        severity: "medium",
      },
      {
        title: "Market Saturation",
        description:
          "The smartphone market is increasingly saturated, with longer replacement cycles potentially impacting iPhone sales growth.",
        severity: "medium",
      },
      {
        title: "Regulatory Pressure",
        description:
          "Increasing scrutiny from regulators worldwide regarding App Store policies and market dominance could impact revenue streams.",
        severity: "high",
      },
      {
        title: "Innovation Slowdown",
        description:
          "Concerns about Apple's ability to maintain its innovation edge in an increasingly competitive technology landscape.",
        severity: "low",
      },
    ],
  },
  "2": {
    // Tesla
    volatility: 75,
    marketRisk: 60,
    competitionRisk: 65,
    regulatoryRisk: 45,
    risks: [
      {
        title: "Production Challenges",
        description:
          "Tesla faces ongoing challenges in scaling production to meet demand while maintaining quality standards.",
        severity: "high",
      },
      {
        title: "Increasing Competition",
        description:
          "Traditional automakers and new EV startups are rapidly entering the market with competitive offerings.",
        severity: "high",
      },
      {
        title: "Regulatory Scrutiny",
        description:
          "Tesla's Autopilot and Full Self-Driving features face increasing regulatory oversight and potential restrictions.",
        severity: "medium",
      },
      {
        title: "Battery Supply Constraints",
        description:
          "Limited battery production capacity and raw material availability could impact Tesla's growth trajectory.",
        severity: "medium",
      },
    ],
  },
  "3": {
    // Bitcoin
    volatility: 90,
    marketRisk: 85,
    competitionRisk: 50,
    regulatoryRisk: 80,
    risks: [
      {
        title: "Extreme Price Volatility",
        description:
          "Bitcoin experiences significant price swings that can result in substantial losses for investors.",
        severity: "high",
      },
      {
        title: "Regulatory Crackdowns",
        description:
          "Governments worldwide are implementing or considering regulations that could restrict Bitcoin usage and trading.",
        severity: "high",
      },
      {
        title: "Security Vulnerabilities",
        description: "Exchange hacks, wallet vulnerabilities, and other security issues pose risks to Bitcoin holders.",
        severity: "medium",
      },
      {
        title: "Environmental Concerns",
        description:
          "Bitcoin's energy-intensive mining process faces increasing criticism and potential regulatory action due to environmental impact.",
        severity: "medium",
      },
    ],
  },
  "4": {
    // Ethereum
    volatility: 85,
    marketRisk: 80,
    competitionRisk: 60,
    regulatoryRisk: 75,
    risks: [
      {
        title: "Scaling Challenges",
        description:
          "Despite upgrades, Ethereum continues to face challenges in scaling to meet growing demand without compromising decentralization.",
        severity: "high",
      },
      {
        title: "Smart Contract Vulnerabilities",
        description:
          "Bugs or vulnerabilities in smart contracts can lead to significant financial losses, as demonstrated by past incidents.",
        severity: "high",
      },
      {
        title: "Regulatory Uncertainty",
        description:
          "Increasing regulatory focus on DeFi, NFTs, and other Ethereum-based applications creates uncertainty for the ecosystem.",
        severity: "medium",
      },
      {
        title: "Competition from Alternative Blockchains",
        description:
          "Other Layer 1 blockchains offering lower fees and higher throughput are gaining traction and market share.",
        severity: "medium",
      },
    ],
  },
  "5": {
    // Microsoft
    volatility: 30,
    marketRisk: 35,
    competitionRisk: 40,
    regulatoryRisk: 45,
    risks: [
      {
        title: "Cloud Competition",
        description:
          "Intense competition in the cloud computing space from AWS, Google Cloud, and others could pressure Azure's growth and margins.",
        severity: "medium",
      },
      {
        title: "Cybersecurity Threats",
        description:
          "As a major technology provider, Microsoft is a prime target for sophisticated cyberattacks that could damage reputation and operations.",
        severity: "high",
      },
      {
        title: "Antitrust Concerns",
        description:
          "Microsoft's size and market position in multiple segments could attract renewed antitrust scrutiny from regulators.",
        severity: "medium",
      },
      {
        title: "AI Ethics and Governance",
        description:
          "Microsoft's growing AI investments face potential regulatory and ethical challenges as AI governance frameworks evolve.",
        severity: "low",
      },
    ],
  },
}

export default function RisksAnalysis({ assetId }: { assetId: string }) {
  const riskData = mockRisks[assetId as keyof typeof mockRisks] || {
    volatility: 50,
    marketRisk: 50,
    competitionRisk: 50,
    regulatoryRisk: 50,
    risks: [],
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
    }
  }

  const getSentimentColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-400 mb-6">Risks & Volatility Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-gray-300">Volatility</span>
              </div>
              <span
                className={`${riskData.volatility > 70 ? "text-red-500" : riskData.volatility > 40 ? "text-yellow-500" : "text-green-500"}`}
              >
                {riskData.volatility}%
              </span>
            </div>
            <Progress
              value={riskData.volatility}
              className="h-2 bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-300">Market Risk</span>
              </div>
              <span
                className={`${riskData.marketRisk > 70 ? "text-red-500" : riskData.marketRisk > 40 ? "text-yellow-500" : "text-green-500"}`}
              >
                {riskData.marketRisk}%
              </span>
            </div>
            <Progress
              value={riskData.marketRisk}
              className="h-2 bg-gray-700"
            />
          </div>
        </div>

        <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-gray-300">Competition Risk</span>
              </div>
              <span
                className={`${riskData.competitionRisk > 70 ? "text-red-500" : riskData.competitionRisk > 40 ? "text-yellow-500" : "text-green-500"}`}
              >
                {riskData.competitionRisk}%
              </span>
            </div>
            <Progress
              value={riskData.competitionRisk}
              className="h-2 bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-gray-300">Regulatory Risk</span>
              </div>
              <span
                className={`${riskData.regulatoryRisk > 70 ? "text-red-500" : riskData.regulatoryRisk > 40 ? "text-yellow-500" : "text-green-500"}`}
              >
                {riskData.regulatoryRisk}%
              </span>
            </div>
            <Progress
              value={riskData.regulatoryRisk}
              className="h-2 bg-gray-700"
            />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-blue-400 mb-4">Key Risk Factors</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskData.risks.map((risk, index) => (
          <div key={index} className={`p-4 border rounded-lg ${getSentimentColor(risk.severity)}`}>
            <div className="flex items-start">
              <AlertTriangle
                className={`h-5 w-5 mr-2 mt-0.5 ${risk.severity === "high" ? "text-red-500" : risk.severity === "medium" ? "text-yellow-500" : "text-green-500"}`}
              />
              <div>
                <h4 className="font-semibold mb-1">{risk.title}</h4>
                <p className="text-gray-300 text-sm">{risk.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
