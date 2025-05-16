"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample asset data - in a real app, this would come from an API
const sampleAssets = [
    { id: 1, symbol: "BTC", name: "Bitcoin", type: "crypto", price: "$65,432.10", change: "+2.5%" },
    { id: 2, symbol: "ETH", name: "Ethereum", type: "crypto", price: "$3,521.45", change: "+1.8%" },
    { id: 3, symbol: "AAPL", name: "Apple Inc.", type: "stock", price: "$182.63", change: "-0.5%" },
    { id: 4, symbol: "MSFT", name: "Microsoft", type: "stock", price: "$415.32", change: "+0.7%" },
    { id: 5, symbol: "AMZN", name: "Amazon", type: "stock", price: "$178.25", change: "+1.2%" },
    { id: 6, symbol: "TSLA", name: "Tesla", type: "stock", price: "$177.86", change: "-2.1%" },
    { id: 7, symbol: "SOL", name: "Solana", type: "crypto", price: "$142.78", change: "+5.3%" },
    { id: 8, symbol: "GOOGL", name: "Alphabet", type: "stock", price: "$165.92", change: "+0.3%" },
    { id: 9, symbol: "XRP", name: "Ripple", type: "crypto", price: "$0.5231", change: "-0.8%" },
    { id: 10, symbol: "NVDA", name: "NVIDIA", type: "stock", price: "$924.73", change: "+3.1%" },
]

export default function AddAssetModal() {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")

    const filteredAssets = sampleAssets.filter((asset) => {
        const matchesSearch =
            asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.name.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeFilter === "all") return matchesSearch
        return matchesSearch && asset.type === activeFilter
    })

    const handleAddToWatchlist = (assetId: number) => {
        // In a real app, this would add the asset to the user's watchlist
        console.log(`Added asset ${assetId} to watchlist`)
        // You could also close the modal or show a success message
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-blue-400">Add Assets to Watchlist</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Browse and add assets to your personal watchlist.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by symbol or name..."
                        className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex space-x-2 mb-4">
                    <Badge
                        className={`cursor-pointer ${activeFilter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All
                    </Badge>
                    <Badge
                        className={`cursor-pointer ${activeFilter === "crypto" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                        onClick={() => setActiveFilter("crypto")}
                    >
                        Crypto
                    </Badge>
                    <Badge
                        className={`cursor-pointer ${activeFilter === "stock" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                        onClick={() => setActiveFilter("stock")}
                    >
                        Stocks
                    </Badge>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-1">
                    {filteredAssets.length > 0 ? (
                        <div className="space-y-2">
                            {filteredAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${asset.type === "crypto" ? "bg-blue-900/50" : "bg-green-900/50"
                                                }`}
                                        >
                                            <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{asset.symbol}</div>
                                            <div className="text-sm text-gray-400">{asset.name}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="text-right mr-4">
                                            <div>{asset.price}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                            onClick={() => handleAddToWatchlist(asset.id)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">No assets found matching your search.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
