"use client"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
// import AssetChart from "./Assetchart"
import AssetNews from "./News"
import AssetRisks from "./Risks"
import AssetManagement from "./Management"
import AssetSummary from "./Summary"

interface AssetDetailProps {
  asset: {
    id: string
    name: string
    ticker: string
    type: string
    price: number
    change: number
    marketCap: string
    peRatio: number | null
    volume: string
    sentiment: string
  }
}

export default function AssetDetail({ asset }: AssetDetailProps) {
  return (
    <div className="p-4 bg-blue-950/10 border-t border-blue-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          {asset.name} ({asset.ticker})
          <Button variant="ghost" size="icon" className="ml-2">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </h3>
        <div className="text-xl font-bold">
          ${asset.type === "crypto" ? asset.price.toLocaleString() : asset.price.toFixed(2)}
          <span className={`ml-2 text-sm ${asset.change > 0 ? "text-green-500" : "text-red-500"}`}>
            {asset.change > 0 ? "+" : ""}
            {asset.change.toFixed(2)}%
          </span>
        </div>
      </div>

      <Tabs defaultValue="chart">
        <TabsList className="grid grid-cols-5 mb-4">
          {/* <TabsTrigger value="chart">Chart</TabsTrigger> */}
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="summary">AI Summary</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="chart">
          <Card className="border-blue-900/20 bg-black">
            <CardContent className="pt-6">
              <AssetChart asset={asset} />
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="news">
          <Card className="border-blue-900/20 bg-black">
            <CardContent className="pt-6">
              <AssetNews asset={asset} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="border-blue-900/20 bg-black">
            <CardContent className="pt-6">
              <AssetRisks asset={asset} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <Card className="border-blue-900/20 bg-black">
            <CardContent className="pt-6">
              <AssetManagement asset={asset} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="border-blue-900/20 bg-black">
            <CardContent className="pt-6">
              <AssetSummary asset={asset} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
