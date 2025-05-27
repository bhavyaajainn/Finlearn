"use client"

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { searchAssets, addToWatchlist, fetchWatchlist } from "@/lib/actions";
import { useTransition } from "react";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debouce";
import { AssetData, WatchlistAsset } from "./types/type";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function WatchlistPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [watchlist, setWatchlist] = useState<WatchlistAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [activeAssetType, setActiveAssetType] = useState<string>("crypto");
  const [searchResults, setSearchResults] = useState<AssetData[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);
  const [addingAssetId, setAddingAssetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDialogOpen && debouncedSearchTerm.trim()) {
      setIsSearching(true);
      startTransition(async () => {
        try {
          const results = await searchAssets(debouncedSearchTerm, activeAssetType);
          setSearchResults(Array.isArray(results) ? results : []);
          setError(null);
        } catch (error) {
          console.error("Search error:", error);
          setError("Failed to fetch assets. Please try again.");
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      });
    }
  }, [debouncedSearchTerm, activeAssetType, isDialogOpen]);

  const fetchUserWatchlist = useCallback(async () => {
    if (!user) return toast("No user found.");
    try {
      const data = await fetchWatchlist(API_BASE_URL || `${process.env.NEXT_PUBLIC_BASE_URL}`, user.uid);
      setWatchlist(data.length === 0 ? [] : data);
      setIsLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Error fetching preferences.");
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchUserWatchlist();
  }, [user?.uid, fetchUserWatchlist]);

  const handleAddAsset = async (asset: AssetData) => {
    if (!user?.uid) {
      toast.error("Authentication required");
      return;
    }

    setAddingAssetId(asset.symbol);
    try {
      const type = asset.asset_type === "cryptocurrency" ? "crypto" : asset.asset_type;

      const newAsset = {
        symbol: asset.symbol,
        name: asset.name || asset.symbol,
        asset_type: type,
        current_price: asset.current_price || 0,
        price_change_percent: asset.change_percent || 0
      };

      setWatchlist(prev => [...prev, newAsset]);

      await addToWatchlist(
        asset.symbol,
        type,
        asset.description || asset.name || "",
        user.uid
      );

      await fetchUserWatchlist();

    } catch (error) {
      setWatchlist(prev => prev.filter(a => a.symbol !== asset.symbol));
      console.error("Addition error:", error);
      toast("Failed to add asset");
    } finally {
      setAddingAssetId(null);
    }
  };

  const handleRemoveAsset = async (symbol: string, assetType: string) => {
    if (!user?.uid) return;

    try {
      await fetch(
        `${API_BASE_URL}/watchlist/remove?user_id=${user.uid}&symbol=${symbol}&asset_type=${assetType}`,
        { method: "DELETE" }
      );

      setWatchlist(prev =>
        prev.filter(asset => asset.symbol !== symbol || asset.asset_type !== assetType)
      );
    } catch (error) {
      console.error("Removal error:", error);
      toast("Failed to remove asset");
    }
  };

  const navigateToAssetDetails = (symbol: string, assetType: string) => {
    router.push(`/dashboard/watchlist/${symbol}/${assetType}`);
  };

  const filteredWatchlist = watchlist.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Watchlist</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track & Analyze Your Assets</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div>
            {/* Controls */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search watchlist..."
                  className="pl-10 bg-gray-900 border-gray-800 focus:ring-blue-600 h-10 sm:h-12 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 sm:h-12 w-full sm:w-auto px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Asset
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-[95vw] max-w-md mx-auto bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-blue-400">Add New Asset</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Search for financial assets to monitor
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Select value={activeAssetType} onValueChange={setActiveAssetType}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Asset Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="stock">Stocks</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search assets..."
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                      {error ? (
                        <div className="text-red-400 text-center py-4 text-sm">{error}</div>
                      ) : isSearching ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((asset, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{asset.symbol}</div>
                              <div className="text-sm text-gray-400 truncate">{asset.name}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddAsset(asset)}
                              disabled={addingAssetId === asset.symbol}
                              className="ml-2 flex-shrink-0"
                            >
                              {addingAssetId === asset.symbol ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-4 text-sm">
                          {debouncedSearchTerm ? "No results found" : "Start typing to search"}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-zinc-900 rounded-lg p-6 shadow-lg">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-900">
                    <TableRow>
                      <TableHead className="text-blue-400">Asset</TableHead>
                      <TableHead className="text-blue-400 text-right">Price</TableHead>
                      <TableHead className="text-blue-400 text-right">Type</TableHead>
                      <TableHead className="text-blue-400 text-right">View</TableHead>
                      <TableHead className="text-blue-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWatchlist.map((asset) => (
                      <TableRow
                        key={`${asset.symbol}-${asset.asset_type}`}
                        className="hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => navigateToAssetDetails(asset.symbol, asset.asset_type)}
                      >
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-400">{asset.symbol}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>${isNaN(asset.current_price) ? "--" : asset.current_price.toLocaleString()}</div>
                          <div
                            className={cn(
                              "flex items-center justify-end",
                              asset.price_change_percent >= 0 ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {asset.price_change_percent >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {isNaN(asset.price_change_percent) ? "--" : Math.abs(asset.price_change_percent).toFixed(2)}
                            %
                          </div>
                        </TableCell>
                        <TableCell className="text-right capitalize">{asset.asset_type}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className="text-blue-400 cursor-pointer underline hover:text-blue-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigateToAssetDetails(asset.symbol, asset.asset_type)
                            }}
                          >
                            View Insights
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAsset(asset.symbol, asset.asset_type)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredWatchlist.length === 0 && (
                <div className="text-center text-gray-400 py-6">
                  {watchlist.length === 0 ? "Your watchlist is empty" : "No matching assets found"}
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredWatchlist.map((asset) => (
                <Card
                  key={`${asset.symbol}-${asset.asset_type}`}
                  className="bg-zinc-900 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => navigateToAssetDetails(asset.symbol, asset.asset_type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white truncate">{asset.name}</h3>
                        <p className="text-sm text-gray-400">{asset.symbol}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAsset(asset.symbol, asset.asset_type)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          ${isNaN(asset.current_price) ? "--" : asset.current_price.toLocaleString()}
                        </div>
                        <div
                          className={cn(
                            "flex items-center text-sm",
                            asset.price_change_percent >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {asset.price_change_percent >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {isNaN(asset.price_change_percent) ? "--" : Math.abs(asset.price_change_percent).toFixed(2)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Type</div>
                        <div className="text-sm capitalize text-white">{asset.asset_type}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-800">
                      <Button
                        variant="ghost"
                        className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 text-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateToAssetDetails(asset.symbol, asset.asset_type)
                        }}
                      >
                        View Insights
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredWatchlist.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  {watchlist.length === 0 ? "Your watchlist is empty" : "No matching assets found"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

  );
}