"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const searchResults = [
  { id: "aapl", name: "Apple Inc.", ticker: "AAPL", type: "stock" },
  { id: "tsla", name: "Tesla, Inc.", ticker: "TSLA", type: "stock" },
  { id: "msft", name: "Microsoft Corporation", ticker: "MSFT", type: "stock" },
  { id: "amzn", name: "Amazon.com, Inc.", ticker: "AMZN", type: "stock" },
  { id: "btc", name: "Bitcoin", ticker: "BTC", type: "crypto" },
  { id: "eth", name: "Ethereum", ticker: "ETH", type: "crypto" },
  { id: "spy", name: "SPDR S&P 500 ETF Trust", ticker: "SPY", type: "etf" },
];

export default function SearchAssets() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id: string) => {
    console.log(`Selected asset with ID: ${id}`);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for stocks, crypto, or ETFs..."
              className="w-full pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 h-12 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-lg p-0" align="start">
          <Command className="bg-gray-900 border border-gray-700 rounded-lg">
            <CommandInput
              placeholder="Search assets..."
              className="text-white"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-gray-400">
                No assets found.
              </CommandEmpty>

              <CommandGroup heading="Stocks">
                {searchResults
                  .filter(
                    (result) =>
                      result.type === "stock" &&
                      (result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        result.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id)}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm text-gray-400">{result.ticker}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandGroup heading="Cryptocurrencies">
                {searchResults
                  .filter(
                    (result) =>
                      result.type === "crypto" &&
                      (result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        result.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id)}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm text-gray-400">{result.ticker}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandGroup heading="ETFs">
                {searchResults
                  .filter(
                    (result) =>
                      result.type === "etf" &&
                      (result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        result.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id)}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm text-gray-400">{result.ticker}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
