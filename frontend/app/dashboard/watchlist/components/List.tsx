"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AssetDetail from "./Assetdetail"

// Mock data for watchlist
const initialWatchlist = [
  {
    id: "1",
    name: "Apple Inc.",
    ticker: "AAPL",
    type: "stock",
    price: 187.68,
    change: 1.23,
    marketCap: "2.94T",
    peRatio: 31.2,
    volume: "52.3M",
    sentiment: "positive",
  },
  {
    id: "2",
    name: "Bitcoin",
    ticker: "BTC",
    type: "crypto",
    price: 68423.12,
    change: -2.34,
    marketCap: "1.34T",
    peRatio: null,
    volume: "24.5B",
    sentiment: "neutral",
  },
  {
    id: "3",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    type: "stock",
    price: 175.34,
    change: 3.45,
    marketCap: "557.8B",
    peRatio: 47.8,
    volume: "104.2M",
    sentiment: "positive",
  },
  {
    id: "4",
    name: "Ethereum",
    ticker: "ETH",
    type: "crypto",
    price: 3245.67,
    change: -1.12,
    marketCap: "389.7B",
    peRatio: null,
    volume: "12.8B",
    sentiment: "neutral",
  },
  {
    id: "5",
    name: "SPDR S&P 500 ETF",
    ticker: "SPY",
    type: "etf",
    price: 504.12,
    change: 0.87,
    marketCap: "473.2B",
    peRatio: null,
    volume: "78.3M",
    sentiment: "positive",
  },
]

export default function WatchList() {
  const [watchlist, setWatchlist] = useState(initialWatchlist)
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (aValue === null) return 1
    if (bValue === null) return -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleRemove = (id: string) => {
    setWatchlist(watchlist.filter((asset) => asset.id !== id))
  }

  const handleAssetClick = (id: string) => {
    setSelectedAsset(id === selectedAsset ? null : id)
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-900/20 bg-black">
        <CardHeader>
          <CardTitle className="text-xl">Your WatchList</CardTitle>
          <CardDescription>Track your favorite stocks, crypto, and ETFs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-900/20">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-blue-950/30">
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    Asset
                    {sortField === "name" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 inline h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 inline h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("price")}>
                    Price
                    {sortField === "price" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 inline h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 inline h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("change")}>
                    24h Change
                    {sortField === "change" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 inline h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 inline h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />
                    )}
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">Market Cap</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    {/* PE Ratio / Volume */}
                    Metrics
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">Sentiment</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWatchlist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <p className="text-muted-foreground">
                        Your watchlist is empty. Use the search bar to add assets.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedWatchlist.map((asset,i) => (
                    <>
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-blue-950/30"
                        onClick={() => handleAssetClick(asset.id)}
                      >
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{asset.ticker}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {asset.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {asset.type === "crypto" ? `$${asset.price.toLocaleString()}` : `$${asset.price.toFixed(2)}`}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${asset.change > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {asset.change > 0 ? "+" : ""}
                          {asset.change.toFixed(2)}%
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right">{asset.marketCap}</TableCell>
                        <TableCell className="hidden md:table-cell text-right">
                          {asset.type === "stock" && asset.peRatio ? `PE: ${asset.peRatio}` : `Vol: ${asset.volume}`}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right">
                          <Badge
                            variant="outline"
                            className={`capitalize ${
                              asset.sentiment === "positive"
                                ? "text-green-500 border-green-500/20"
                                : asset.sentiment === "negative"
                                  ? "text-red-500 border-red-500/20"
                                  : "text-yellow-500 border-yellow-500/20"
                            }`}
                          >
                            {asset.sentiment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemove(asset.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {selectedAsset === asset.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <AssetDetail asset={asset} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
