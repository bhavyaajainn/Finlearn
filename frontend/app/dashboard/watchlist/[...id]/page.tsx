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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  FileText,
  Info,
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

export interface NewsImpact {
  reason: string
  direction: 'positive' | 'negative' | 'neutral'
}

export interface NewsItem {
  author: string | null
  citation: string
  date: string
  headline: string
  impact: NewsImpact
  source: string
  summary: string
  url: string
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
  recent_news: NewsItem[]
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

  const renderTooltipContent = (content: string) => {
    if (!details?.tooltip_words?.length) return content;

    return content.split(' ').map((word, index) => {
      const tooltip = details.tooltip_words.find(t => t.word === word);
      return tooltip ? (
        <Tooltip key={index}>
          <TooltipTrigger className="border-b border-dashed border-blue-400">
            {word}{' '}
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 border-gray-700 text-white max-w-[300px]">
            <p>{tooltip.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span key={index}>{word} </span>
      );
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!params.id || params.id.length < 2 || !user?.uid) return

      setIsLoading(true)
      try {
        const [symbol, assetType] = params.id as string[];
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        const userId = user.uid

        const urls = [
          `${baseUrl}/watchlist/asset/${symbol}?user_id=${userId}&asset_type=${assetType}`,
          `${baseUrl}/watchlist/analysis/${symbol}?user_id=${userId}&asset_type=${assetType}&refresh=false`,
          `${baseUrl}/watchlist/related/${symbol}?user_id=${userId}&asset_type=${assetType}&include_comparison=true&refresh=false`
        ]

        const [assetRes, analysisRes, relatedRes] = await Promise.all(
          urls.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            return res.json()
          }))
        );

        // Data mapping with fallbacks
        setDetails({
          symbol: assetRes.symbol || 'N/A',
          name: assetRes.name || 'Unnamed Asset',
          asset_type: assetRes.asset_type || 'Unknown Type',
          current_price: assetRes.current_price || 0,
          price_change_percent: assetRes.price_change_percent || 0,
          expertise_level: assetRes.expertise_level || 'beginner',
          loading_status: assetRes.loading_status || {
            asset_loaded: true,
            analysis_loaded: false,
            related_loaded: false
          },
          asset_info: assetRes.asset_info || {
            name: '',
            current_price: 0,
            price_change_percent: 0,
            symbol: '',
            asset_type: ''
          },
          from_cache: analysisRes.from_cache || false,
          recent_news: relatedRes.recent_news || [],
          similar_assets: relatedRes.similar_assets || [],
          title: analysisRes.research_article.title || 'Research Report',
          summary: analysisRes.research_article.summary || 'No summary available',
          sections: analysisRes.research_article.sections?.map((s: any) => ({
            title: s.title || 'Untitled Section',
            content: s.content || 'Content not available'
          })) || [],
          references: analysisRes.research_article.references || [],
          recommendation: analysisRes.research_article.recommendation || {
            time_horizon: 'Medium-term',
            risk_level: 'Medium',
            reasoning: 'No reasoning provided',
            action: 'Hold'
          },
          generated_at: analysisRes.generated_at || new Date().toISOString(),
          format: analysisRes.format || 'standard',
          conclusion: analysisRes.conclusion || 'No conclusion available',
          tooltip_words: analysisRes.research_article.tooltip_words || [],
          watchlist_relevance: analysisRes.research_article.watchlist_relevance || 'Not specified'
        });

      } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Failed to load asset details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [user?.uid, params]);

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
          {/* Header Section */}
          <div className="container mx-auto px-4">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {details.name || 'Unnamed Asset'}
                      <Tooltip>
                        <TooltipTrigger className="ml-2">
                          <Info className="h-4 w-4 text-blue-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Asset ID: {details.symbol}</p>
                          <p>Type: {details.asset_type}</p>
                        </TooltipContent>
                      </Tooltip>
                    </h1>
                    <div className="text-gray-400">
                      {details.symbol || 'N/A'} • {details.asset_type || 'Unknown Type'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-bold">
                    ${details.current_price?.toFixed(2) || '0.00'}
                  </div>
                  <div className={`flex items-center ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}>
                    {details.price_change_percent < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    )}
                    <span>{(Math.abs(details.price_change_percent)?.toFixed(2) || '0.00')}%</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Symbol', value: details.symbol },
                  { label: 'Asset Type', value: details.asset_type },
                  { label: 'Current Price in $', value: details.current_price },
                ].map((stat, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-md">
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                    <div className="text-xl font-bold">
                      {stat.value || 'N/A'}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Price Change</div>
                  <div className={`text-xl font-bold ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}>
                    {details.price_change_percent < 0 ? "" : "+"}{details.price_change_percent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="container mx-auto px-4">
            <TooltipProvider>
              <Tabs defaultValue="articles">
                <TabsList className="w-full bg-gray-900">
                  <TabsTrigger value="articles" className="text-black" >
                    <FileText className="h-4 w-4 mr-2" />
                    Research Articles
                  </TabsTrigger>
                  <TabsTrigger value="similar" className="text-black">
                    <Layers className="h-4 w-4 mr-2" />
                    Similar Assets
                  </TabsTrigger>
                </TabsList>

                {/* Research Tab */}
                <TabsContent value="articles">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {details.title}
                        <Badge className="ml-2 bg-zinc-700">
                          {details.expertise_level}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-blue-400 mb-2">Key Summary</h3>
                        <p className="text-gray-300">
                          {renderTooltipContent(details.summary)}
                        </p>
                      </div>

                      {/* News Section */}
                      {details.recent_news?.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <h3 className="text-blue-400 text-lg font-semibold">Recent News</h3>
                          {details.recent_news.map((newsItem, idx) => (
                            <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                              <h4 className="text-white font-medium text-md mb-1">
                                {newsItem.headline}
                              </h4>
                              <p className="text-gray-300 text-sm mb-2">
                                {newsItem.summary}
                              </p>
                              <div className="text-gray-400 text-xs flex justify-between items-center">
                                <span>{newsItem.source} — {newsItem.date}</span>
                                <a
                                  href={newsItem.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  Read more
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}


                      {details.sections?.map((section, index) => (
                        <div key={index} className="mb-8 mt-10">
                          <h3 className="text-xl text-blue-400 mb-3">
                            {section.title}
                            <Tooltip>
                              <TooltipTrigger className="ml-2">
                                <Info className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Section {index + 1} of {details.sections?.length}
                              </TooltipContent>
                            </Tooltip>
                          </h3>
                          <div className="text-gray-300 space-y-2">
                            {renderTooltipContent(section.content)}
                          </div>
                        </div>
                      ))}

                      {/* Recommendation Section */}
                      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-medium text-white">
                            Final Recommendation
                          </h3>
                          <Badge className="bg-yellow-600">
                            {details.recommendation.action}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {details.recommendation.reasoning}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">Risk:</span>
                            <Badge variant="outline" className="text-red-400 border-red-800">
                              {details.recommendation.risk_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">Timeframe:</span>
                            <Badge variant="outline" className="text-blue-400 border-blue-800">
                              {details.recommendation.time_horizon}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Similar Assets Tab */}
                <TabsContent value="similar">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Alternative Investments
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {details.similar_assets.length} similar assets found
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {details.similar_assets.length > 0 ? (
                          details.similar_assets.map((asset, index) => (
                            <div key={index} className="border-b border-gray-800 pb-6">
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium text-lg text-white">
                                      {asset.name || 'Unknown Asset'}
                                    </div>
                                    <div className="text-gray-400">
                                      {asset.symbol || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg text-green-400">
                                    ${asset.current_price || '0.00'}
                                  </div>
                                  <Badge className="mt-1 text-sm">
                                    {asset.similarity_reason || 'Similar asset'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Render comparison points if available */}
                              {asset.comparison_points?.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {asset.comparison_points.map((point, idx) => (
                                    <div key={idx} className="bg-gray-800 p-3 rounded-md text-sm text-gray-300">
                                      <div className="font-semibold text-white">{point.metric}</div>
                                      <div>{point.description}</div>
                                      <div className="text-green-400">{point.comparison}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          ))
                        ) : (
                          <div className="text-center text-white">
                            No similar assets found.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TooltipProvider>
          </div>
        </>
      ) : (
        <div className="container mx-auto px-4 text-center py-24 text-gray-400">
          Failed to load asset details
        </div>
      )}
    </div>
  )


};