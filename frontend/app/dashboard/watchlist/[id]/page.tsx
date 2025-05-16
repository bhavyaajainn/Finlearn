import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Newspaper,
  FileText,
  Layers,
  BrainCircuit,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function WatchlistDetails() {
  // Data from the provided JSON
  const assetData = {
    symbol: "BTC",
    name: "Grayscale Bitcoin Mini Trust (B",
    asset_type: "stock",
    current_price: 45.7,
    price_change_percent: -0.152938,
    expertise_level: "beginner",
  }

  const researchArticle = {
    title: "Exploring Bitcoin as a Beginner Investor: A Comprehensive Guide",
    summary:
      "Bitcoin, often considered a digital gold, has become a mainstream asset for investors. This guide provides an overview of Bitcoin's investment potential, risks, and recent market trends. It explains key financial concepts and compares Bitcoin to similar assets, helping beginners make informed investment decisions.",
    sections: [
      {
        title: "Business Analysis",
        content:
          "Bitcoin operates within the blockchain ecosystem, offering a secure and transparent way to transfer value. It's not a traditional company but a decentralized network. Investors can buy Bitcoin through various exchanges like Coinbase or Binance, which facilitate transactions and provide a market for buying and selling Bitcoin. The competitive position of Bitcoin is strong, given its widespread adoption and brand recognition as the first and largest cryptocurrency.",
      },
      {
        title: "Financial Analysis",
        content:
          "Bitcoin's price can be volatile, with significant fluctuations in value. The current price of the Grayscale Bitcoin Mini Trust (B) is $45.7, with a recent price change of -0.1529%. Investors should consider the volatility and potential for long-term growth when investing in Bitcoin. Financial metrics such as liquidity, market capitalization, and trading volume are important for assessing Bitcoin's financial health.",
      },
      {
        title: "Risk Assessment",
        content:
          "Investing in Bitcoin carries several risks, including market volatility, regulatory changes, and security threats. The lack of central authority means that Bitcoin is susceptible to market manipulation. Additionally, holding Bitcoin on exchanges can expose investors to counterparty risk. To mitigate these risks, investors should use secure wallets and stay informed about regulatory developments.",
      },
      {
        title: "Recent News Analysis",
        content:
          "Recent news suggests that Bitcoin's price may experience a correction due to a potential double top pattern, which could indicate waning momentum. This pattern often signals a reversal in price, potentially affecting Bitcoin's value negatively. However, analysts also predict future growth based on technical trends, providing a neutral outlook for Bitcoin's future price movements. As an investor, it's crucial to stay updated on these trends and consider their impact on your investment thesis.",
      },
    ],
    recommendation: {
      rating: "Hold",
      reasoning:
        "Given the current market trends and potential for price corrections, it may be wise to hold off on new investments until the market stabilizes. However, existing investors may choose to maintain their positions, depending on their long-term investment strategy.",
      risk_level: "High",
      time_horizon: "Long-term",
    },
  }

  const similarAssets = [
    {
      symbol: "COIN",
      name: "Coinbase Global, Inc.",
      price: 80,
      change: +1.2,
      reason: "Operates as a major cryptocurrency exchange facilitating Bitcoin transactions",
    },
    {
      symbol: "MSTR",
      name: "MicroStrategy Incorporated",
      price: 350,
      change: -0.5,
      reason: "Holds a significant amount of Bitcoin in its treasury, similar to a pure-play Bitcoin investment",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 500,
      change: +2.3,
      reason:
        "Manufacturer of graphics processing units (GPUs) widely used in cryptocurrency mining, including Bitcoin",
    },
  ]

  const recentNews = [
    {
      headline: "Bitcoin Price Analysis: On-Chain Metrics Point to Potential Double Top",
      date: "2025-05-14",
      source: "CoinDesk",
      summary:
        "Bitcoin's on-chain metrics suggest a potential double top, indicating waning momentum as it approaches its January record high. This could lead to a price correction.",
      impact: {
        direction: "negative",
        reason:
          "A double top pattern often indicates a potential reversal in price, which could negatively impact Bitcoin's value.",
      },
    },
    {
      headline: "Bitcoin Price Prediction 2025, 2026, 2030",
      date: "2025-05",
      source: "Finance Magnates",
      summary:
        "Bitcoin's price in May 2025 reflects a recovery and growth trend, with analysts predicting future price movements based on technical and on-chain trends.",
      impact: {
        direction: "neutral",
        reason:
          "The article provides a neutral outlook on Bitcoin's future price, highlighting both potential growth and challenges.",
      },
    },
  ]
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="container mx-auto py-4 px-4">
        <Link href={"/dashboard/watchlist"} className="cursor-pointer">
          <Button variant="link" className="text-blue-400 p-0 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Watchlist
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4">
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{assetData.name}</h1>
                <div className="text-gray-400">
                  {assetData.symbol} • {assetData.asset_type}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold">${assetData.current_price.toFixed(2)}</div>
              <div
                className={`flex items-center ${assetData.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}
              >
                {assetData.price_change_percent < 0 ? (
                  <ArrowDown className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(assetData.price_change_percent).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-6">
            Bitcoin operates as a decentralized digital currency without a central bank or administrator. Transactions
            are verified by network nodes through cryptography and recorded in a public distributed ledger called a
            blockchain.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Symbol</div>
              <div className="text-xl font-bold">{assetData.symbol}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Asset Type</div>
              <div className="text-xl font-bold">{assetData.asset_type}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Current Price</div>
              <div className="text-xl font-bold">${assetData.current_price}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Price Change</div>
              <div
                className={`text-xl font-bold ${assetData.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}
              >
                {assetData.price_change_percent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="w-full bg-gray-900 p-0 mb-6">
            <TabsTrigger value="news" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
              <Newspaper className="h-4 w-4 mr-2" />
              News
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="similar" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
              <Layers className="h-4 w-4 mr-2" />
              Similar Assets
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
              <BrainCircuit className="h-4 w-4 mr-2" />
              AI Summary
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news" className="mt-0">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent News</CardTitle>
                <CardDescription className="text-gray-400">Latest updates about Bitcoin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentNews.map((news, index) => (
                    <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-xl text-white">{news.headline}</h3>
                        <Badge
                          className={
                            news.impact.direction === "negative"
                              ? "bg-red-900/50 text-red-300 border-red-700"
                              : news.impact.direction === "positive"
                                ? "bg-green-900/50 text-green-300 border-green-700"
                                : "bg-blue-900/50 text-blue-300 border-blue-700"
                          }
                        >
                          {news.impact.direction}
                        </Badge>
                      </div>
                      <p className="text-gray-300 mb-3">{news.summary}</p>
                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>
                          {news.source} • {news.date}
                        </span>
                        <Button variant="link" className="text-blue-400 p-0 h-auto cursor-pointer">
                          Read more
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Additional dummy news item */}
                  <div className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-xl text-white">
                        New Regulatory Framework for Cryptocurrencies Proposed
                      </h3>
                      <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">neutral</Badge>
                    </div>
                    <p className="text-gray-300 mb-3">
                      Lawmakers have introduced a new bill that aims to provide regulatory clarity for cryptocurrencies,
                      potentially affecting how Bitcoin is traded and taxed in the future.
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Crypto News • 2025-05-08</span>
                      <Button variant="link" className="text-blue-400 p-0 h-auto">
                        Read more
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="mt-0">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">{researchArticle.title}</CardTitle>
                <CardDescription className="text-gray-400">Research and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">{researchArticle.summary}</p>
                </div>

                <div className="space-y-8">
                  {researchArticle.sections.map((section, index) => (
                    <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                      <h3 className="text-xl font-medium text-blue-400 mb-3">{section.title}</h3>
                      <p className="text-gray-300">{section.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-medium text-white">Recommendation</h3>
                    <Badge className="bg-yellow-600">{researchArticle.recommendation.rating}</Badge>
                  </div>
                  <p className="text-gray-300 mb-4">{researchArticle.recommendation.reasoning}</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Risk:</span>
                      <Badge variant="outline" className="text-red-400 border-red-800">
                        {researchArticle.recommendation.risk_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Horizon:</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-800">
                        {researchArticle.recommendation.time_horizon}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar Assets Tab */}
          <TabsContent value="similar" className="mt-0">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Similar Assets</CardTitle>
                <CardDescription className="text-gray-400">Related investment opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {similarAssets.map((asset, index) => (
                    <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-lg text-white">{asset.name}</div>
                            <div className="text-gray-400">{asset.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-white">${asset.price}</div>
                          <div className="flex justify-end mt-3">
                            <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Watchlist
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{asset.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Summary Tab */}
          <TabsContent value="ai" className="mt-0">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI Investment Summary</CardTitle>
                <CardDescription className="text-gray-400">AI-generated analysis and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                    <h3 className="text-lg font-medium text-blue-300 mb-2">Key Takeaways</h3>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      <li>Bitcoin shows signs of potential price correction based on technical analysis patterns.</li>
                      <li>Current market sentiment is cautious due to recent volatility and regulatory concerns.</li>
                      <li>Long-term outlook remains positive for Bitcoin as an inflation hedge and store of value.</li>
                      <li>Recommendation is to hold existing positions but exercise caution with new investments.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-blue-300 mb-3">Investment Strategy</h3>
                    <p className="text-gray-300 mb-4">
                      For beginner investors interested in Bitcoin, a dollar-cost averaging approach is recommended to
                      mitigate volatility risks. Consider allocating no more than 5% of your portfolio to cryptocurrency
                      assets, and ensure you have a secure wallet solution for storage.
                    </p>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Recommended Actions:</h4>
                      <ul className="list-disc pl-5 text-gray-300 space-y-1">
                        <li>Hold existing positions if you're already invested</li>
                        <li>Consider small, regular purchases if starting a new position</li>
                        <li>Set up alerts for significant price movements below $40 or above $50</li>
                        <li>Review your position monthly as market conditions evolve</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
