"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock news data
const generateNewsData = (asset: { name: string; ticker: string }) => {
  return [
    {
      id: "1",
      title: `${asset.name} Reports Strong Q2 Earnings, Beats Expectations`,
      source: "Financial Times",
      date: "2023-08-15",
      summary: `${asset.name} (${asset.ticker}) reported quarterly earnings that exceeded analyst expectations, with revenue growing 15% year-over-year.`,
      sentiment: "positive",
      url: "#",
    },
    {
      id: "2",
      title: `Analysts Upgrade ${asset.ticker} Following Product Announcement`,
      source: "Bloomberg",
      date: "2023-08-10",
      summary: `Several Wall Street analysts have upgraded ${asset.name} following the company's latest product announcement, citing potential for market share growth.`,
      sentiment: "positive",
      url: "#",
    },
    {
      id: "3",
      title: `${asset.name} Faces Regulatory Scrutiny in European Markets`,
      source: "Reuters",
      date: "2023-08-05",
      summary: `Regulators in the European Union are investigating ${asset.name} over potential antitrust violations, which could result in significant fines.`,
      sentiment: "negative",
      url: "#",
    },
    {
      id: "4",
      title: `${asset.name} Expands Operations in Asian Markets`,
      source: "CNBC",
      date: "2023-07-28",
      summary: `${asset.name} announced plans to expand its presence in key Asian markets, with significant investments planned for the next fiscal year.`,
      sentiment: "positive",
      url: "#",
    },
  ]
}

interface AssetNewsProps {
  asset: {
    name: string
    ticker: string
  }
}

export default function AssetNews({ asset }: AssetNewsProps) {
  const newsData = generateNewsData(asset)

  return (
    <div>
      <h3 className="font-medium mb-4">Latest News</h3>

      <div className="space-y-4">
        {newsData.map((news,i) => (
          <div key={i} className="border border-blue-900/20 rounded-lg p-4 hover:bg-blue-950/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{news.title}</h4>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <span>{news.source}</span>
                  <span className="mx-2">•</span>
                  <span>{news.date}</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      news.sentiment === "positive"
                        ? "text-green-500 border-green-500/20"
                        : "text-red-500 border-red-500/20"
                    }`}
                  >
                    {news.sentiment}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm mt-2">{news.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
