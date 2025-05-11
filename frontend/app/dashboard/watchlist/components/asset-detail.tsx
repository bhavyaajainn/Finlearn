"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PriceChart } from "./price-chart";
import { NewsItem } from "./news-item";
import { AiInsight } from "./ai-insight";
import { Asset } from "@/lib/types";
import { mockNews } from "@/lib/data";

interface AssetDetailProps {
  asset: Asset;
}

export function AssetDetail({ asset }: AssetDetailProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("7d");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            {asset.name}
            <span className="ml-2 text-sm text-gray-400">{asset.ticker}</span>
          </h2>
          <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${asset.price.toFixed(2)} ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-4 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">Price Chart</h3>
                <div className="flex space-x-1">
                  {(["7d", "30d", "1y"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs px-2 py-1 rounded ${
                        timeframe === tf
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <PriceChart asset={asset} timeframe={timeframe} />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Market Cap</div>
                  <div className="font-medium">${asset.marketCap.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Volume (24h)</div>
                  <div className="font-medium">${asset.volume.toLocaleString()}</div>
                </div>
                {asset.type === "Stock" && (
                  <>
                    <div>
                      <div className="text-xs text-gray-400">P/E Ratio</div>
                      <div className="font-medium">{asset.peRatio?.toFixed(2) || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Dividend Yield</div>
                      <div className="font-medium">{asset.dividendYield ? `${asset.dividendYield.toFixed(2)}%` : "N/A"}</div>
                    </div>
                  </>
                )}
                {asset.type === "Crypto" && (
                  <>
                    <div>
                      <div className="text-xs text-gray-400">Circulating Supply</div>
                      <div className="font-medium">{asset.circulatingSupply?.toLocaleString() || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">All-Time High</div>
                      <div className="font-medium">${asset.allTimeHigh?.toFixed(2) || "N/A"}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="p-4">
          <div className="space-y-4">
            {mockNews.filter(news => news.tickers.includes(asset.ticker)).map((news, index) => (
              <NewsItem key={index} news={news} />
            ))}
            {mockNews.filter(news => news.tickers.includes(asset.ticker)).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No recent news for {asset.ticker}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="p-4">
          <AiInsight asset={asset} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
