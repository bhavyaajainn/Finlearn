import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from '@/components/ui/button'

const Watchlist = () => {
    const watchlistItems = [
        { ticker: "AAPL", name: "Apple Inc.", price: 187.42, change: 1.24 },
        { ticker: "MSFT", name: "Microsoft Corp.", price: 328.79, change: 0.87 },
        { ticker: "BTC", name: "Bitcoin", price: 61245.32, change: 2.35 },
        { ticker: "TSLA", name: "Tesla Inc.", price: 242.68, change: -1.42 },
        { ticker: "ETH", name: "Ethereum", price: 3421.56, change: -0.78 },
      ]
  return (
    <Card className="bg-black border-blue-900 text-white w-2/6">
    <CardHeader className="pb-2">
      <CardTitle className="text-blue-400">Your Watchlist</CardTitle>
      <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {watchlistItems.map((item) => (
          <div key={item.ticker} className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-white">{item.ticker}</div>
              <div className="text-sm text-gray-400">{item.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">${item.price.toLocaleString()}</div>
              <div
                className={`text-sm flex items-center justify-end ${item.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
              >
                {item.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(item.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="ghost" className="w-full border-blue-900 bg-blue-700 text-white hover:bg-blue-600 hover:text-white cursor-pointer">
        View Full Watchlist
      </Button>
    </CardFooter>
  </Card>
  )
}

export default Watchlist