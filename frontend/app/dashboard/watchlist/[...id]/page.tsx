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
import { ResearchAssetData } from "../types/type"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { normalizeToken } from "@/lib/utils"

export default function WatchlistDetails() {
  const [details, setDetails] = useState<ResearchAssetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [relatedLoaded, setRelatedLoaded] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()
  const [selectedTerm, setSelectedTerm] = useState<{ word: string; tooltip: string } | null>(null);

  const renderTooltipContent = (content: string) => {
    if (!details?.tooltip_words?.length) return content;

    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at',
      'of', 'to', 'for', 'with', 'as', 'by', 'it', 'is', 'are',
      'was', 'were', 'be', 'been', 'being'
    ]);

    const tooltipMap = new Map(
      details.tooltip_words.map(t => [
        normalizeToken(t.word),
        t
      ])
    );

    const tokens = content.split(/(\s+|\p{P}+|[\n])/gu);

    return (
      <span className="whitespace-pre-wrap">
        {tokens.map((token, index) => {
          const cleanToken = normalizeToken(token);

          if (!cleanToken || stopWords.has(cleanToken)) {
            return <span key={index}>{token}</span>;
          }

          const tooltip = tooltipMap.get(cleanToken);
          if (!tooltip) return <span key={index}>{token}</span>;

          return (
            <button
              key={`${index}-${cleanToken}`}
              onClick={() => setSelectedTerm(tooltip)}
              className="border-b border-dashed border-blue-400 hover:border-blue-300 cursor-pointer bg-blue-400/10 px-1 mx-0.5 rounded-sm"
            >
              {token}
            </button>
          );
        })}
      </span>
    );
  };


  const fetchRelatedData = async () => {
    if (!params.id || params.id.length < 2 || !user?.uid || relatedLoaded) return;

    try {
      const [symbol, assetType] = params.id as string[];
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const userId = user.uid;

      const relatedUrl = `${baseUrl}/watchlist/related/${symbol}?user_id=${userId}&asset_type=${assetType}&include_comparison=true&refresh=false`;

      const relatedRes = await fetch(relatedUrl).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      });


      console.log(relatedRes);
      setDetails(prev => ({
        ...prev!,
        recent_news: relatedRes.recent_news || [],
        similar_assets: relatedRes.similar_assets || [],
      }));

      setRelatedLoaded(true);
    } catch (error) {
      console.error("Fetch related error:", error);
      toast.error("Failed to load related assets");
    }
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      if (!params.id || params.id.length < 2 || !user?.uid) return;

      setIsLoading(true);
      try {
        const [symbol, assetType] = params.id as string[];
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const userId = user.uid;

        const [assetRes, analysisRes] = await Promise.all([
          fetch(`${baseUrl}/watchlist/asset/${symbol}?user_id=${userId}&asset_type=${assetType}`),
          fetch(`${baseUrl}/watchlist/analysis/${symbol}?user_id=${userId}&asset_type=${assetType}&refresh=false`)
        ].map(url => url.then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })));

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
          recent_news: [],
          similar_assets: [],
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
        console.error("Fetch error:", error);
        toast.error("Failed to load asset details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
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
      {/* Header with back button */}
      <div className="container mx-auto py-3 sm:py-4 px-4">
        <Link href="/dashboard/watchlist" className="cursor-pointer">
          <Button variant="link" className="text-blue-400 p-0 flex items-center hover:text-blue-300">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm sm:text-base">Back to Watchlist</span>
          </Button>
        </Link>
      </div>

      {/* Term explanation dialog */}
      <Dialog open={!!selectedTerm} onOpenChange={() => setSelectedTerm(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-[500px] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 break-words text-lg">{selectedTerm?.word}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-100 text-base break-words leading-relaxed">{selectedTerm?.tooltip}</p>
            <div className="text-xs sm:text-sm text-gray-400">Click outside to close this explanation</div>
          </div>
        </DialogContent>
      </Dialog>

      {details ? (
        <>
          {/* Asset header section */}
          <div className="container mx-auto px-4 mb-4 sm:mb-6">
            <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
              {/* Mobile-first header layout */}
              <div className="space-y-4">
                {/* Asset name and info */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words leading-tight">
                      {details.name}
                    </h1>
                    <div className="text-gray-400 text-sm sm:text-base mt-1">
                      {details.symbol} • {details.asset_type}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="flex-shrink-0 mt-1">
                      <Info className="h-4 w-4 text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Asset ID: {details.symbol}</p>
                      <p>Type: {details.asset_type}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Price information */}
                <div className="flex items-center justify-between sm:justify-start sm:gap-8">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">${details.current_price?.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Current Price</div>
                  </div>
                  <div
                    className={`flex items-center ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {details.price_change_percent < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-lg sm:text-xl font-semibold">
                      {Math.abs(details.price_change_percent)?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics grid - responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                {[
                  { label: "Symbol", value: details.symbol },
                  { label: "Asset Type", value: details.asset_type },
                  { label: "Current Price", value: `$${details.current_price}` },
                ].map((stat, index) => (
                  <div key={index} className="bg-gray-800 p-3 sm:p-4 rounded-md">
                    <div className="text-gray-400 text-xs sm:text-sm mb-1">{stat.label}</div>
                    <div className="text-sm sm:text-lg font-bold break-words">{stat.value}</div>
                  </div>
                ))}
                <div className="bg-gray-800 p-3 sm:p-4 rounded-md">
                  <div className="text-gray-400 text-xs sm:text-sm mb-1">Price Change</div>
                  <div
                    className={`text-sm sm:text-lg font-bold ${details.price_change_percent < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {details.price_change_percent < 0 ? "" : "+"}
                    {details.price_change_percent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content tabs */}
          <div className="container mx-auto px-4">
            <TooltipProvider>
              <Tabs
                defaultValue="articles"
                onValueChange={(value) => {
                  if (value === "similar" && !relatedLoaded) {
                    fetchRelatedData()
                  }
                }}
              >
                {/* Mobile-optimized tabs */}
                <div className="mb-4 sm:mb-6">
                  <TabsList className="w-full bg-gray-900 h-auto p-1 grid grid-cols-2 gap-1">
                    <TabsTrigger
                      value="articles"
                      className="!text-white data-[state=active]:!text-black text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Research Articles</span>
                      <span className="sm:hidden">Research</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="similar"
                      className="!text-white data-[state=active]:!text-black text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                    >
                      <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Similar Assets</span>
                      <span className="sm:hidden">Similar</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="articles">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                        <span className="break-words">{details.title}</span>
                        <Badge className="bg-zinc-700 w-fit">{details.expertise_level}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      {/* Key summary */}
                      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-blue-400 mb-3 text-base sm:text-lg font-semibold">Key Summary</h3>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                          {renderTooltipContent(details.summary)}
                        </p>
                      </div>

                      {/* Content sections */}
                      {details.sections?.map((section, index) => (
                        <div key={index} className="mb-6 sm:mb-8">
                          <h3 className="text-lg sm:text-xl text-blue-400 mb-3 flex items-center gap-2">
                            <span className="break-words">{section.title}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Section {index + 1} of {details.sections?.length}
                              </TooltipContent>
                            </Tooltip>
                          </h3>
                          <div className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            {renderTooltipContent(section.content)}
                          </div>
                        </div>
                      ))}

                      {/* Final recommendation */}
                      <div className="mt-6 sm:mt-8 p-4 bg-gray-800 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                          <h3 className="text-lg sm:text-xl font-medium text-white">Final Recommendation</h3>
                          <Badge className="bg-yellow-600 w-fit">{details.recommendation.action}</Badge>
                        </div>
                        <p className="text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
                          {details.recommendation.reasoning}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-400">Risk:</span>
                            <Badge variant="outline" className="text-red-400 border-red-800 text-xs">
                              {details.recommendation.risk_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-400">Timeframe:</span>
                            <Badge variant="outline" className="text-blue-400 border-blue-800 text-xs">
                              {details.recommendation.time_horizon}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="similar">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Alternative Investments and Recent News
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {details.similar_assets.length} similar assets and {details.recent_news.length} news
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      {relatedLoaded ? (
                        <>
                          {/* Recent news section */}
                          {details.recent_news?.length > 0 && (
                            <div className="space-y-4 mb-8">
                              <h3 className="text-blue-400 text-base sm:text-lg font-semibold">Recent News</h3>
                              {details.recent_news.map((newsItem, idx) => (
                                <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                                  <h4 className="text-white font-medium text-sm sm:text-base mb-2 leading-tight break-words">
                                    {newsItem.headline}
                                  </h4>
                                  <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed break-words">
                                    {newsItem.summary}
                                  </p>
                                  <div className="text-gray-400 text-xs space-y-1 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                                    <span className="block break-words">
                                      {newsItem.source} — {newsItem.date}
                                    </span>
                                    {newsItem.url ? (
                                      <a
                                        href={newsItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline cursor-pointer inline-block break-words"
                                      >
                                        Read more
                                      </a>
                                    ) : (
                                      <div className="text-blue-400 break-words">{newsItem.citation}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Similar assets section */}
                          <div className="space-y-6">
                            <h3 className="text-blue-400 text-base sm:text-lg font-semibold">Similar Assets</h3>
                            {details.similar_assets.length > 0 ? (
                              details.similar_assets.map((asset, index) => (
                                <div key={index} className="border-b border-gray-800 pb-6 last:border-b-0">
                                  <div className="space-y-3">
                                    {/* Asset header - full width stack on mobile */}
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-base sm:text-lg text-white break-words leading-tight">
                                            {asset.name}
                                          </div>
                                          <div className="text-gray-400 text-sm">{asset.symbol}</div>
                                        </div>
                                        <div className="text-green-400 font-bold text-lg sm:text-xl flex-shrink-0">
                                          ${asset.current_price}
                                        </div>
                                      </div>
                                      <div className="text-xs sm:text-sm text-white break-words leading-relaxed">
                                        {asset.similarity_reason}
                                      </div>
                                    </div>

                                    {/* Comparison points with better mobile layout */}
                                    {asset.comparison_points?.length > 0 && (
                                      <div className="space-y-2">
                                        {asset.comparison_points.map((point: any, idx: number) => (
                                          <div key={idx} className="bg-gray-800 p-3 rounded-md">
                                            <div className="font-semibold text-white mb-1 text-xs sm:text-sm break-words">
                                              {point.metric}
                                            </div>
                                            <div className="text-gray-300 mb-1 text-xs sm:text-sm break-words leading-relaxed">
                                              {point.description}
                                            </div>
                                            <div className="text-green-400 text-xs sm:text-sm break-words">
                                              {point.comparison}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-white py-8">No similar assets found.</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <Skeleton className="h-6 w-1/4 bg-gray-800" />
                          <Skeleton className="h-6 w-1/2 bg-gray-800" />
                          <Skeleton className="h-6 w-1/3 bg-gray-800" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TooltipProvider>
          </div>
        </>
      ) : (
        <div className="container mx-auto px-4 text-center py-24 text-gray-400">
          <div className="text-base sm:text-lg">Failed to load asset details</div>
        </div>
      )}
    </div>

  )
}