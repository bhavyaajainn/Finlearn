"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, AlertTriangle, Users, BookOpen, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PriceChart from "../components/price-chart"
import NewsSection from "../components/news-item"
import RisksAnalysis from "../components/risk-analysis"
import ManagementOverview from "../components/management-overview"
import PerplexitySummary from "../components/Summary"

const mockAssets = {
  "1": {
    id: "1",
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 187.32,
    change: 1.24,
    marketCap: "2.94T",
    peRatio: 30.8,
    volume: "52.3M",
    sentiment: "positive",
    description:
      "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.",
    sector: "Technology",
    industry: "Consumer Electronics",
    yearFounded: 1976,
    ceo: "Tim Cook",
    headquarters: "Cupertino, California, USA",
  },
  "2": {
    id: "2",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: 246.53,
    change: -2.15,
    marketCap: "782.1B",
    peRatio: 70.2,
    volume: "108.7M",
    sentiment: "neutral",
    description:
      "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. The company operates in two segments, Automotive, and Energy Generation and Storage.",
    sector: "Automotive",
    industry: "Auto Manufacturers",
    yearFounded: 2003,
    ceo: "Elon Musk",
    headquarters: "Austin, Texas, USA",
  },
  "3": {
    id: "3",
    name: "Bitcoin",
    ticker: "BTC",
    price: 68423.12,
    change: 3.78,
    marketCap: "1.34T",
    peRatio: null,
    volume: "32.1B",
    sentiment: "positive",
    description:
      "Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.",
    sector: "Cryptocurrency",
    industry: "Digital Assets",
    yearFounded: 2009,
    ceo: "N/A (Decentralized)",
    headquarters: "N/A (Decentralized)",
  },
  "4": {
    id: "4",
    name: "Ethereum",
    ticker: "ETH",
    price: 3245.67,
    change: 2.34,
    marketCap: "389.7B",
    peRatio: null,
    volume: "18.5B",
    sentiment: "positive",
    description:
      "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin.",
    sector: "Cryptocurrency",
    industry: "Digital Assets",
    yearFounded: 2015,
    ceo: "N/A (Decentralized)",
    headquarters: "N/A (Decentralized)",
  },
  "5": {
    id: "5",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: 415.28,
    change: 0.87,
    marketCap: "3.09T",
    peRatio: 35.6,
    volume: "21.9M",
    sentiment: "positive",
    description:
      "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.",
    sector: "Technology",
    industry: "Software—Infrastructure",
    yearFounded: 1975,
    ceo: "Satya Nadella",
    headquarters: "Redmond, Washington, USA",
  },
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const asset = mockAssets[params.id as keyof typeof mockAssets]

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-500 mb-4">Asset Not Found</h1>
          <p className="text-gray-400 mb-6">The asset you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Return to Watchlist
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
          onClick={() => router.push("/dashboard/watchlist")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Watchlist
        </Button>

        {/* Hero section with asset overview */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 rounded-xl p-6 mb-8 shadow-lg border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
                  {asset.ticker.substring(0, 1)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
                  <div className="text-gray-400">
                    {asset.ticker} • {asset.sector} • {asset.industry}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4 max-w-3xl">{asset.description}</p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-3xl font-mono font-bold">${asset.price.toLocaleString()}</div>
              <div className={`text-xl ${asset.change >= 0 ? "text-green-500" : "text-red-500"} font-semibold`}>
                {asset.change >= 0 ? "+" : ""}
                {asset.change.toFixed(2)}%
              </div>
              <div className="mt-2">
                <Badge
                  className={`
                    ${asset.sentiment === "positive"
                      ? "bg-green-500/20 text-green-500"
                      : asset.sentiment === "negative"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    } 
                    border-none px-3 py-1 text-sm`}
                >
                  {asset.sentiment.toUpperCase()} SENTIMENT
                </Badge>
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 bg-gray-800/50 p-4 rounded-lg">
            <div>
              <div className="text-gray-400 text-sm">Market Cap</div>
              <div className="text-xl font-semibold">{asset.marketCap}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">{asset.peRatio ? "PE Ratio" : "24h Volume"}</div>
              <div className="text-xl font-semibold">{asset.peRatio ? asset.peRatio.toFixed(1) : asset.volume}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Founded</div>
              <div className="text-xl font-semibold">{asset.yearFounded}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">CEO</div>
              <div className="text-xl font-semibold">{asset.ceo}</div>
            </div>
          </div>
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="chart" className="w-full">
          <div className="bg-gray-900 rounded-t-xl p-2">
            <TabsList className="bg-gray-800 w-full grid grid-cols-5 gap-1">
              <TabsTrigger value="chart" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
                <TrendingUp className="mr-2 h-4 w-4" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
                <BookOpen className="mr-2 h-4 w-4" />
                News
              </TabsTrigger>
              <TabsTrigger value="risks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Risks
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
              >
                <Users className="mr-2 h-4 w-4" />
                Management
              </TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
                <Info className="mr-2 h-4 w-4" />
                AI Summary
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="border-t-0 rounded-t-none bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <TabsContent value="chart" className="mt-0">
                <PriceChart assetId={asset.id} />
              </TabsContent>

              <TabsContent value="news" className="mt-0">
                <NewsSection assetId={asset.id} />
              </TabsContent>

              <TabsContent value="risks" className="mt-0">
                <RisksAnalysis assetId={asset.id} />
              </TabsContent>

              <TabsContent value="management" className="mt-0">
                <ManagementOverview assetId={asset.id} />
              </TabsContent>

              <TabsContent value="summary" className="mt-0">
                <PerplexitySummary assetId={asset.id} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}
