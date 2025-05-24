'use client'

import { useEffect, useState } from "react"
import { useAppSelector } from "@/app/store/hooks"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  FileText,
  Layers,
} from "lucide-react"

export interface AssetInfo {
  name: string
  current_price: number
  price_change_percent: number
  symbol: string
  asset_type: string
}

export interface TooltipWord {
  word: string
  tooltip: string
}

export interface Section {
  title: string
  content: string
}

export interface Recommendation {
  time_horizon: string
  risk_level: string
  reasoning: string
  action: string
}

export interface AssetData {
  symbol: string
  name: string
  asset_type: string
  current_price: number
  price_change_percent: number
  expertise_level: string
  loading_status: {
    asset_loaded: boolean
    analysis_loaded: boolean
    related_loaded: boolean
  }
  asset_info: AssetInfo
  from_cache: boolean
  recent_news: any[] // Replace `any` with a specific `NewsItem` type if you have one
  similar_assets: any[] // Replace `any` with a specific `SimilarAsset` type if available
  title: string
  summary: string
  sections: Section[]
  references: string[]
  recommendation: Recommendation
  generated_at: string
  format: string
  conclusion: string
  tooltip_words: TooltipWord[]
  watchlist_relevance: string
}


export default function WatchlistDetails() {
  const [details, setDetails] = useState<AssetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()

  useEffect(() => {
    const fetchAllData = async () => {
      if (!params.id || params.id.length < 2 || !user?.uid) return

      setIsLoading(true)
      try {
        const [symbol, assetType] = params.id;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        const userId = user.uid

        const urls = [
          `${baseUrl}/watchlist/asset/${symbol}?user_id=${userId}&asset_type=${assetType}`,
          `${baseUrl}/watchlist/analysis/${symbol}?user_id=${userId}&asset_type=${assetType}&refresh=false`,
          `${baseUrl}/watchlist/related/${symbol}?user_id=${userId}&asset_type=${assetType}&include_comparison=true&refresh=false`
        ]

        const responses = await Promise.all(urls.map(url => fetch(url).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })));

        const basic_asset_data = responses[0];
        const articles_tooltips_data = responses[1]
        const similar_news_data = responses[2]

        setDetails({
          ...basic_asset_data,
          similar_assets: articles_tooltips_data.research_article || [],
          recent_news: similar_news_data || []
        })

      } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Failed to load asset details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [user?.uid, params]);

  console.log(details);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-4 px-4">
          <Skeleton className="h-6 w-[200px] bg-gray-800" />
        </div>

        <div className="container mx-auto px-4 space-y-8">
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-800" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 bg-gray-800 rounded-md" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 bg-gray-800" />
              ))}
            </div>

            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/3 bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-4 px-4">
        <Link href="/dashboard/watchlist" className="cursor-pointer">
          <Button variant="link" className="text-blue-400 p-0 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Watchlist
          </Button>
        </Link>
      </div>

      {details ? (
        <>
          <div className="container mx-auto px-4">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{details.name}</h1>
                    <div className="text-gray-400">
                      {details.symbol} • {details.asset_type}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-bold">
                    ${details.current_price.toFixed(2)}
                  </div>
                  <div className={`flex items-center ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}>
                    {details.price_change_percent < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    )}
                    <span>{Math.abs(details.price_change_percent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Symbol</div>
                  <div className="text-xl font-bold">{details.symbol}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Asset Type</div>
                  <div className="text-xl font-bold">{details.asset_type}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Current Price</div>
                  <div className="text-xl font-bold">${details.current_price.toFixed(2)}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Price Change</div>
                  <div className={`text-xl font-bold ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}>
                    {details.price_change_percent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="w-full bg-gray-900 p-0 mb-6">
                <TabsTrigger value="articles" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="similar" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200">
                  <Layers className="h-4 w-4 mr-2" />
                  Similar Assets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {details.research_article?.title || "Research Article"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">Detailed analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                      <p className="text-gray-300">
                        {details.research_article?.summary || "No summary available"}
                      </p>
                    </div>

                    <div className="space-y-8">
                      {details.research_article?.sections?.map((section, index) => (
                        <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                          <h3 className="text-xl font-medium text-blue-400 mb-3">{section.title}</h3>
                          <p className="text-gray-300">{section.content}</p>
                        </div>
                      ))}
                    </div>

                    {details.research_article?.recommendation && (
                      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-medium text-white">Recommendation</h3>
                          <Badge className="bg-yellow-600">
                            {details.research_article.recommendation.rating}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {details.research_article.recommendation.reasoning}
                        </p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">Risk:</span>
                            <Badge variant="outline" className="text-red-400 border-red-800">
                              {details.research_article.recommendation.risk_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">Horizon:</span>
                            <Badge variant="outline" className="text-blue-400 border-blue-800">
                              {details.research_article.recommendation.time_horizon}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="similar" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Similar Assets</CardTitle>
                    <CardDescription className="text-gray-400">Alternative investment options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {details.similar_assets.map((asset, index) => (
                        <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium text-lg text-white">{asset.name}</div>
                                <div className="text-gray-400">{asset.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-white">
                                ${asset.price.toFixed(2)}
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
            </Tabs>
          </div>
        </>
      ) : (
        <div className="container mx-auto px-4 text-center py-24 text-gray-400">
          Failed to load asset details
        </div>
      )}
    </div>
  )


}



