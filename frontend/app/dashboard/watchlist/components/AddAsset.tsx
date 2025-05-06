"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, DollarSign, Search } from "lucide-react"

interface AddAssetDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddAssetDialog({ isOpen, onClose }: AddAssetDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const stockResults = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
  ]

  const cryptoResults = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "ADA", name: "Cardano" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-blue-900/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Add to Watchlist</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-950/20">
            <TabsTrigger value="stocks" className="data-[state=active]:bg-blue-600">
              <DollarSign className="mr-2 h-4 w-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-600">
              <Bitcoin className="mr-2 h-4 w-4" />
              Crypto
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for assets..."
                className="pl-10 bg-blue-950/20 border-blue-900/50 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <TabsContent value="stocks" className="mt-4 max-h-[300px] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Search Results</Label>
              <AnimatePresence>
                {stockResults.map((result, index) => (
                  <motion.div
                    key={result.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-md border border-blue-900/50 bg-blue-950/20 p-3 hover:bg-blue-950/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-950/50 p-1.5">
                        <DollarSign className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{result.symbol}</p>
                        <p className="text-xs text-gray-400">{result.name}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-950/50 hover:text-blue-300"
                    >
                      Add
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="mt-4 max-h-[300px] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Search Results</Label>
              <AnimatePresence>
                {cryptoResults.map((result, index) => (
                  <motion.div
                    key={result.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-md border border-blue-900/50 bg-blue-950/20 p-3 hover:bg-blue-950/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-950/50 p-1.5">
                        <Bitcoin className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{result.symbol}</p>
                        <p className="text-xs text-gray-400">{result.name}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-950/50 hover:text-blue-300"
                    >
                      Add
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
