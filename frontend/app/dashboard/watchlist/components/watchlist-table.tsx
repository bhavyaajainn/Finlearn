"use client";

import { useState } from "react";
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
import { Eye, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

// Mock data for the watchlist
const mockWatchlist = [
  {
    id: "1",
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 187.32,
    change: 1.24,
    marketCap: "2.94T",
    peRatio: 30.8,
    volume: "52.3M",
    sentiment: "positive",
  },
  {
    id: "2",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: 246.53,
    change: -2.15,
    marketCap: "782.1B",
    peRatio: 70.2,
    volume: "108.7M",
    sentiment: "neutral",
  },
  {
    id: "3",
    name: "Bitcoin",
    ticker: "BTC",
    price: 68423.12,
    change: 3.78,
    marketCap: "1.34T",
    peRatio: null,
    volume: "32.1B",
    sentiment: "positive",
  },
  {
    id: "4",
    name: "Ethereum",
    ticker: "ETH",
    price: 3245.67,
    change: 2.34,
    marketCap: "389.7B",
    peRatio: null,
    volume: "18.5B",
    sentiment: "positive",
  },
  {
    id: "5",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: 415.28,
    change: 0.87,
    marketCap: "3.09T",
    peRatio: 35.6,
    volume: "21.9M",
    sentiment: "positive",
  },
];

export default function WatchlistTable() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState(mockWatchlist);

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/watchlist/${id}`);
  };

  const removeFromWatchlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWatchlist(watchlist.filter((asset) => asset.id !== id));
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30";
      case "negative":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-blue-400">Asset</TableHead>
            <TableHead className="text-blue-400 text-right">Price</TableHead>
            <TableHead className="text-blue-400 text-right">Change</TableHead>
            <TableHead className="text-blue-400 text-right">Market Cap</TableHead>
            <TableHead className="text-blue-400 text-right">PE Ratio</TableHead>
            <TableHead className="text-blue-400 text-right">Volume</TableHead>
            <TableHead className="text-blue-400 text-center">Sentiment</TableHead>
            <TableHead className="text-blue-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((asset) => (
            <TableRow
              key={asset.id}
              className="cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => handleRowClick(asset.id)}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-bold">{asset.name}</div>
                  <div className="text-gray-400 text-sm">{asset.ticker}</div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${asset.price.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    asset.change >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change.toFixed(2)}%
                </span>
              </TableCell>
              <TableCell className="text-right">{asset.marketCap}</TableCell>
              <TableCell className="text-right">
                {asset.peRatio ? asset.peRatio.toFixed(1) : "N/A"}
              </TableCell>
              <TableCell className="text-right">{asset.volume}</TableCell>
              <TableCell className="text-center">
                <Badge
                  className={`${getSentimentColor(
                    asset.sentiment
                  )} border-none`}
                >
                  {asset.sentiment}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/watchlist/${asset.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    onClick={(e) => removeFromWatchlist(e, asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
