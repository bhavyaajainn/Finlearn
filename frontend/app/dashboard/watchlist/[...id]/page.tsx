'use client'

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
import { useEffect, useState } from "react"
import { useAppSelector } from "@/app/store/hooks"
import { toast } from "sonner"
import { useParams } from "next/navigation"


export interface Asset {
  symbol: string;
  name: string;
  asset_type: string;
  current_price: number;
  price_change_percent: number;
  expertise_level: 'beginner' | 'intermediate' | 'advanced'; // assuming fixed levels
  research_article: ResearchArticle;
  similar_assets: SimilarAsset[];
  recent_news: RecentNews[];
  related_topics: string[];
}

export interface ResearchArticle {
  title: string;
  summary: string;
  introduction: string;
  sections: ArticleSection[];
  knowledge_connections: string;
  watchlist_relevance: string;
  comparison: string;
  conclusion: string;
  recommendation: Recommendation;
  connections: string; // "Missing connections section" implies a fallback string
}

export interface ArticleSection {
  title: string;
  content: string;
}

export interface Recommendation {
  rating: 'Buy' | 'Hold' | 'Sell';
  reasoning: string;
  risk_level: 'Low' | 'Medium' | 'High';
  time_horizon: 'Short-term' | 'Medium-term' | 'Long-term';
}

export interface SimilarAsset {
  symbol: string;
  name: string;
  price: number;
  reason: string;
}

export interface RecentNews {
  headline: string;
  date: string; // ISO format
  source: string;
  author: string;
  url: string;
  summary: string;
  impact: {
    direction: 'positive' | 'negative' | 'neutral';
    reason: string;
  };
  citation: string;
}


export default function WatchlistDetails() {
  const [details, setDetails] = useState<Asset>()
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()
  // const assetName = params?.id ? decodeURIComponent(params.id as string) : '';

  console.log(params);

  console.log(user?.uid);

  useEffect(() => {
    const isParamsReady = params.id && params?.id.length >= 2;
    const isUserReady = !!user?.uid;

    if (!isParamsReady || !isUserReady) return;

    const API_URL = params.id ? `${process.env.NEXT_PUBLIC_BASE_URL}/watchlist/research/${params.id[0]}?user_id=${user.uid}&asset_type=${params.id[1]}&include_comparison=true&include_news=true` : '';

    console.log(API_URL);

    const fetchWatchlist = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        setDetails(data);
      } catch (error: any) {
        console.error("Error fetching watchlist:", error);
        toast("Failed to fetch asset details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [user?.uid, params]);


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="container mx-auto py-4 px-4">
        <Link href="/dashboard/watchlist" className="cursor-pointer">
          <Button variant="link" className="text-blue-400 p-0 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Watchlist
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-160px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (

        <>
          {/* Header */}
          <div className="container mx-auto px-4">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{details?.name || "Unknown Asset"}</h1>
                    <div className="text-gray-400">
                      {details?.symbol || "N/A"} • {details?.asset_type || "Unknown Type"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-bold">
                    ${details?.current_price || "0.00"}
                  </div>
                  <div
                    className={`flex items-center ${(details?.price_change_percent || 0) < 0 ? "text-red-500" : "text-green-500"
                      }`}
                  >
                    {(details?.price_change_percent || 0) < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {Math.abs(details?.price_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Symbol</div>
                  <div className="text-xl font-bold">{details?.symbol || "N/A"}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Asset Type</div>
                  <div className="text-xl font-bold">{details?.asset_type || "N/A"}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Current Price</div>
                  <div className="text-xl font-bold">${details?.current_price || "0.00"}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="text-gray-400 text-sm">Price Change</div>
                  <div
                    className={`text-xl font-bold ${(details?.price_change_percent || 0) < 0 ? "text-red-500" : "text-green-500"
                      }`}
                  >
                    {(details?.price_change_percent || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="container mx-auto px-4">
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="w-full bg-gray-900 p-0 mb-6">
                {/* <TabsTrigger value="news" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
                  <Newspaper className="h-4 w-4 mr-2" />
                  News
                </TabsTrigger> */}
                <TabsTrigger value="articles" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="similar" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
                  <Layers className="h-4 w-4 mr-2" />
                  Similar Assets
                </TabsTrigger>
                {/* <TabsTrigger value="ai" className="flex-1 py-3 data-[state=active]:bg-blue-600 text-gray-200 cursor-pointer">
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  AI Summary
                </TabsTrigger> */}
              </TabsList>

              {/* News Tab */}
              {/* <TabsContent value="news" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Recent News</CardTitle>
                    <CardDescription className="text-gray-400">Latest updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {details?.news?.length ? (
                        details.news.map((news, index) => (
                          <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-xl text-white">{news?.headline || "Untitled"}</h3>
                              <Badge
                                className={
                                  news?.impact?.direction === "negative"
                                    ? "bg-red-900/50 text-red-300 border-red-700"
                                    : news?.impact?.direction === "positive"
                                      ? "bg-green-900/50 text-green-300 border-green-700"
                                      : "bg-blue-900/50 text-blue-300 border-blue-700"
                                }
                              >
                                {news?.impact?.direction || "neutral"}
                              </Badge>
                            </div>
                            <p className="text-gray-300 mb-3">{news?.summary || "No summary available."}</p>
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span>
                                {news?.source || "Unknown source"} • {news?.date || "Unknown date"}
                              </span>
                              <Button variant="link" className="text-blue-400 p-0 h-auto cursor-pointer">
                                Read more
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No news available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}

              {/* Articles Tab */}
              <TabsContent value="articles" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {details?.research_article?.title || "No Title"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">Research and analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                      <p className="text-gray-300">
                        {details?.research_article?.summary || "No summary available."}
                      </p>
                    </div>

                    <div className="space-y-8">
                      {details?.research_article?.sections?.map?.((section, index) => (
                        <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                          <h3 className="text-xl font-medium text-blue-400 mb-3">{section?.title || "Untitled"}</h3>
                          <p className="text-gray-300">{section?.content || "No content."}</p>
                        </div>
                      ))}
                    </div>

                    {details?.research_article?.recommendation && (
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

              {/* Similar Assets Tab */}
              <TabsContent value="similar" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Similar Assets</CardTitle>
                    <CardDescription className="text-gray-400">Related investment opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {details?.similar_assets?.length ? (
                        details.similar_assets.map((asset, index) => (
                          <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-lg text-white">{asset?.name || "Unnamed"}</div>
                                  <div className="text-gray-400">{asset?.symbol || "N/A"}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-white">
                                  ${asset?.price || "0.00"}
                                </div>
                                {/* <div className="flex justify-end mt-3">
                                  <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Watchlist
                                  </Button>
                                </div> */}
                              </div>
                            </div>
                            <p className="text-gray-300 mb-3">{asset?.reason || "No reason provided."}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No similar assets available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Summary Tab */}
              {/* <TabsContent value="ai" className="mt-0">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">AI Investment Summary</CardTitle>
                    <CardDescription className="text-gray-400">AI-generated insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                        <h3 className="text-lg font-medium text-blue-300 mb-2">Key Takeaways</h3>
                        <ul className="list-disc pl-5 text-gray-300 space-y-2">
                          {details?.ai_summary?.length ? (
                            details.ai_summary.map((point, i) => <li key={i}>{point}</li>)
                          ) : (
                            <li>No AI summary available.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>
        </>
      )}
    </div>

  )
}
