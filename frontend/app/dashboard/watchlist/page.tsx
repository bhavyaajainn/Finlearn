"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { searchAssets, addToWatchlist, fetchWatchlist } from "@/lib/actions";
import { useTransition } from "react";
import {
  Eye,
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


  useEffect(() => {
    fetchUserWatchlist();
  }, [user?.uid]);

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

  const fetchUserWatchlist = async () => {
    if (!user) return toast("No user found.");
    try {

      const data = await fetchWatchlist(API_BASE_URL || `${process.env.NEXT_PUBLIC_BASE_URL}`, user.uid);

      if (data.length === 0) {
        setWatchlist([]);
      } else {
        setWatchlist(data);
      }

    } catch (err: any) {
      toast.error(err.message || "Error fetching preferences.");
    }
  };

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
      toast.error("Failed to add asset");
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
      toast.success(`${symbol} removed successfully`);
    } catch (error) {
      console.error("Removal error:", error);
      toast.error("Failed to remove asset");
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
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">Watchlist</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track & Analyze Your Assets</p>
        </header>

        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search watchlist..."
              className="pl-10 bg-gray-900 border-gray-800 focus:ring-blue-600 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-gray-900 border-gray-800 text-white">
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
                  <SelectContent className="bg-gray-900 border-gray-700 text-white cursor-pointer">
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

                <div className="max-h-[400px] overflow-y-auto">
                  {error ? (
                    <div className="text-red-400 text-center py-4">{error}</div>
                  ) : isSearching ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((asset) => (
                      <div
                        key={asset.symbol}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2"
                      >
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-gray-400">{asset.name}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddAsset(asset)}
                          disabled={addingAssetId === asset.symbol}
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
                    <div className="text-gray-400 text-center py-4">
                      {debouncedSearchTerm ? "No results found" : "Start typing to search"}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow>
                <TableHead className="text-blue-400">Asset</TableHead>
                <TableHead className="text-blue-400 text-right">Price</TableHead>
                <TableHead className="text-blue-400 text-right">Type</TableHead>
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
                    <div>{isNaN(asset.current_price) ? '--' : formatCurrency(asset.current_price)}</div>
                    <div className={cn(
                      "flex items-center justify-end",
                      asset.price_change_percent >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {asset.price_change_percent >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {isNaN(Math.abs(asset.price_change_percent).toFixed(2)) ? "--" : Math.abs(asset.price_change_percent).toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right capitalize">
                    {asset.asset_type}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToAssetDetails(asset.symbol, asset.asset_type);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAsset(asset.symbol, asset.asset_type);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredWatchlist.length === 0 && (
            <div className="text-center text-gray-400 py-6">
              {watchlist.length === 0 ? "Your watchlist is empty" : "No matching assets found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}