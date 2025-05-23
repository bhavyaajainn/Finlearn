"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/app/store/hooks"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface Asset {
  added_on: string
  asset_type: "stock" | "crypto"
  currency: string
  current_price: number
  exchange: string
  industry: string
  market_cap: number
  name: string
  notes: string
  price_change: number
  price_change_percent: number
  sector: string
  symbol: string
}

export default function SearchAssets() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [watchlist, setWatchlist] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const { user } = useAppSelector((state) => state.auth)
  const inputRef = useRef<HTMLInputElement>(null)

  const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/watchlist?user_id=${user?.uid}&include_similar=false`

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user?.uid) return

      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const data = await res.json()
        if (!Array.isArray(data.watchlist)) throw new Error("Malformed response")

        setWatchlist(data.watchlist)
      } catch (error) {
        console.error("Error fetching watchlist:", error)
        toast("Failed to fetch watchlist")
      }
    }

    fetchWatchlist()
  }, [user?.uid])

  // Group filtered assets by type
  const groupedAssets = {
    stock: filteredAssets.filter((item) => item.asset_type === "stock"),
    crypto: filteredAssets.filter((item) => item.asset_type === "crypto"),
  }

  const handleSelect = (symbol: string) => {
    console.log(`Selected asset with symbol: ${symbol}`)
    setOpen(false)
    setSearchQuery("")
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  const handleSearch = () => {
    // Only filter and show results when search button is clicked
    if (searchQuery.trim().length === 0) {
      setFilteredAssets([])
      return
    }

    const filtered = watchlist.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setFilteredAssets(filtered)
    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search your assets..."
              className="w-full pl-10 bg-gray-900 border-gray-800 focus-visible:ring-blue-600 focus-visible:border-blue-600 h-12 text-white rounded-l-lg rounded-r-none border-r-0"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Search assets"
            />
          </div>
          <PopoverTrigger asChild>
            <Button
              onClick={handleSearch}
              className="h-12 px-4 rounded-l-none rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          className="w-full p-0 border-gray-800 bg-gray-950 shadow-lg !rounded-lg"
          align="end"
          side="bottom"
          sideOffset={5}
        >
          <Command className="bg-gray-950 border-none !rounded-lg">
            <CommandList className="max-h-[300px] overflow-y-auto py-2 bg-gray-950">
              {filteredAssets.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-gray-400">
                  No assets found matching "{searchQuery}"
                </CommandEmpty>
              ) : (
                ["stock", "crypto"].map((type) => {
                  const assets = groupedAssets[type as keyof typeof groupedAssets]

                  if (assets.length === 0) return null

                  return (
                    <CommandGroup
                      key={type}
                      heading={type === "stock" ? "Stocks" : "Cryptocurrencies"}
                      className="px-2 [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                    >
                      {assets.map((item) => (
                        <CommandItem
                          key={item.symbol}
                          onSelect={() => handleSelect(item.symbol)}
                          className="cursor-pointer flex items-center justify-between px-3 py-2 my-1 rounded-md data-[highlighted=true]:bg-gray-800 data-[selected=true]:bg-gray-800 hover:!bg-gray-800 transition-colors"
                          value={`${item.symbol} ${item.name}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{item.name}</span>
                            <span className="text-sm text-gray-400">{item.symbol}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-white">{formatPrice(item.current_price)}</span>
                            <div
                              className={cn(
                                "flex items-center text-sm",
                                item.price_change_percent >= 0 ? "text-green-500" : "text-red-500",
                              )}
                            >
                              {item.price_change_percent >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              <span>
                                {item.price_change_percent >= 0 ? "+" : ""}
                                {item.price_change_percent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
