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
    insight: "Strong buy signal due to robust earnings.",
    sentiment: "positive",
  },
  {
    id: "2",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: 246.53,
    insight: "Volatile performance; monitor closely.",
    sentiment: "neutral",
  },
  {
    id: "3",
    name: "Bitcoin",
    ticker: "BTC",
    price: 68423.12,
    insight: "Uptrend supported by institutional interest.",
    sentiment: "positive",
  },
  {
    id: "4",
    name: "Ethereum",
    ticker: "ETH",
    price: 3245.67,
    insight: "Growth driven by DeFi activity.",
    sentiment: "positive",
  },
  {
    id: "5",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: 415.28,
    insight: "Consistent performance; strong fundamentals.",
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
            <TableHead className="text-blue-400 text-center">Insights</TableHead>
            <TableHead className="text-blue-400 text-right">Sentiment</TableHead>
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
              <TableCell className="text-center">
                <span
                  className={
                    "text-gray-400 text-sm"
                  }
                >
                  {asset.insight}
                </span>
              </TableCell>
              <TableCell className="text-right">
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
