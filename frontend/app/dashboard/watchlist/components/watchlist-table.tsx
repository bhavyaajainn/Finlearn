'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";import { toast } from "sonner";

export default function WatchlistTable() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAppSelector((state) => state.auth);

  const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/watchlist?user_id=${user?.uid}&asset_type=crypto&include_similar=false`;

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user?.uid) return;

      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (!Array.isArray(data.watchlist)) {
          throw new Error("Malformed response: 'watchlist' is not an array");
        }

        setWatchlist(data.watchlist);
      } catch (error: any) {
        console.error("Error fetching watchlist:", error);
        toast("Failed to fetch watchlist");
      }
    };

    fetchWatchlist();
  }, [user?.uid]);

  const handleRowClick = (name: string) => {
    router.push(`/dashboard/watchlist/${name}`);
  };

  // const removeFromWatchlist = (e: React.MouseEvent, id: string) => {
  //   e.stopPropagation();
  //   setWatchlist((prev) => prev.filter((asset) => asset.id !== id));
  // };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-blue-400">Asset</TableHead>
            <TableHead className="text-blue-400 text-right">Price</TableHead>
            <TableHead className="text-blue-400 text-center">Insights</TableHead>
            <TableHead className="text-blue-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((asset: any) => (
            <TableRow
              key={asset.name}
              className="cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => handleRowClick(asset.name)}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-bold">{asset.name}</div>
                  <div className="text-gray-400 text-sm">{asset.symbol}</div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${Number(asset.current_price.toFixed(8))}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="link"
                  className="text-gray-400 text-sm hover:text-blue-400 cursor-pointer"
                  onClick={() => router.push(`/dashboard/watchlist/${asset.name}`)}
                >
                  View Details
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/watchlist/${asset.name}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    // onClick={(e) => removeFromWatchlist(e, asset.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {watchlist.length === 0 && (
        <p className="text-center text-gray-400 mt-6">No assets in watchlist.</p>
      )}
    </div>
  );
}
