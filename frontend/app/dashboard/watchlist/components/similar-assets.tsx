"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Asset {
  symbol: string
  name: string
  price: number
  reason: string
}

export default function SimilarAssets({ assetId }: { assetId: string }) {
  const dummyAssets: Asset[] = [
    {
      symbol: "DOGE",
      name: "Dogecoin",
      price: 5,
      reason: "Gaining traction due to meme revival",
    },
    {
      symbol: "SHIB",
      name: "Shiba Inu",
      price: 0.000025,
      reason: "Community push and listings on new exchanges",
    },
    {
      symbol: "PEPE",
      name: "Pepe Coin",
      price: 0.0000012,
      reason: "Viral memes and speculative buying",
    },
  ]

  return (
    <Card className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-md">
      <CardContent className="space-y-4">
        {dummyAssets.map((asset) => (
          <Link href={`/assets/${asset.symbol.toLowerCase()}`} key={asset.symbol} className="block">
            <div className="bg-zinc-900 hover:bg-zinc-700/70 p-4 rounded-xl transition-colors">
              <div className="flex justify-between items-center">
                {/* Left: Symbol & Name */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-800/30 w-9 h-9 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{asset.symbol}</div>
                    <div className="text-sm text-gray-400 truncate max-w-[150px]">{asset.name}</div>
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="text-right">
                  <div className="font-medium text-white">${asset.price}</div>
                  <div className="text-gray-400 text-sm flex items-center justify-end">
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{asset.reason}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
