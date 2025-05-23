"use client"

import { useState, useEffect, useTransition } from "react"
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
import { PlusCircle, Search, Plus, Loader2 } from "lucide-react"
import { searchAssets, addToWatchlist } from "@/lib/actions"
import { useDebounce } from "@/hooks/use-debouce"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAppSelector } from "@/app/store/hooks"
import { toast } from "sonner"

type Asset = {
    asset_type: "cryptocurrency" | "stock" | string
    symbol: string
    name?: string
    description?: string
    current_price?: number | null
    change_percent?: number | null
    market_cap?: number | null
    volume?: number | null
    data_source?: string
    match_reason?: string
}

export default function AddAssetModal() {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounce(searchTerm, 500)
    const [activeFilter, setActiveFilter] = useState("cryptocurrency")
    const [assets, setAssets] = useState<Asset[]>([])
    const [isPending, startTransition] = useTransition()
    const [isSearching, setIsSearching] = useState(false)
    const [addingAssetId, setAddingAssetId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (open && debouncedSearchTerm.trim().length > 0) {
            setIsSearching(true)
            startTransition(async () => {
                try {
                    const results = await searchAssets(debouncedSearchTerm, activeFilter)
                    if (!Array.isArray(results)) throw new Error("Invalid response format.")
                    setAssets(results)
                    setError(null)

                    
                } catch (err: any) {
                    console.error("Error fetching assets:", err)
                    setError("Failed to fetch assets. Please try again.")
                    setAssets([])
                } finally {
                    setIsSearching(false)
                }
            })
        }
    }, [debouncedSearchTerm, activeFilter, open])

    const handleAdd = async (asset: Asset) => {
        if (!user?.uid) {
            toast.error("User not authenticated.")
            return
        }

        if (!asset.symbol || !asset.asset_type) {
            toast.error("Missing asset symbol or type.")
            return
        }

        setAddingAssetId(asset.symbol)
        try {
            const type = asset.asset_type === "cryptocurrency" ? "crypto" : asset.asset_type
            const desc = asset.description || asset.name || ""

            const result = await addToWatchlist(asset.symbol, type, desc, user.uid)

            if (!result || result.length === 0) {
                toast.error("Asset could not be added. Please try again.")
            } else {
                toast.success(`Asset ${asset.symbol} added to watchlist!`);

                window.location.reload();
            }
        } catch (err) {
            console.error("Add error:", err)
            toast.error("Failed to add asset. Please try again.")
        } finally {
            setAddingAssetId(null)
        }
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
                        Search for stocks or crypto assets to add to your personal watchlist.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-4">
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white border-gray-700">
                            <SelectItem value="stock">Stocks</SelectItem>
                            <SelectItem value="cryptocurrency">Crypto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by symbol or name..."
                        className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-1">
                    {error ? (
                        <div className="text-center py-8 text-red-400">{error}</div>
                    ) : isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-gray-400">Searching for assets...</p>
                        </div>
                    ) : assets.length > 0 ? (
                        <div className="space-y-2">
                            {assets.map((asset) => (
                                <div
                                    key={asset.symbol}
                                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{asset.symbol || "Unknown"}</span>
                                        <span className="text-sm text-gray-400">{asset.name || "No name"}</span>
                                        {asset.description && (
                                            <span className="text-sm text-gray-500 mt-1">
                                                {asset.description}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <div className="text-right mr-4">
                                            <div className="text-white font-semibold">
                                                {asset.current_price ? `$${asset.current_price}` : `--`}
                                            </div>
                                            {typeof asset.change_percent === "number" && (
                                                <div
                                                    className={
                                                        asset.change_percent >= 0
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }
                                                >
                                                    {asset.change_percent.toFixed(2)}%
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => handleAdd(asset)}
                                            disabled={addingAssetId === asset.symbol}
                                        >
                                            {addingAssetId === asset.symbol ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            {debouncedSearchTerm
                                ? "No assets found matching your search."
                                : "Start typing to search for assets."}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
