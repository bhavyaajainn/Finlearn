"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Mock data for search results
const searchOptions = [
  { value: "aapl", label: "Apple Inc. (AAPL)", type: "stock" },
  { value: "msft", label: "Microsoft Corporation (MSFT)", type: "stock" },
  { value: "tsla", label: "Tesla, Inc. (TSLA)", type: "stock" },
  { value: "amzn", label: "Amazon.com, Inc. (AMZN)", type: "stock" },
  { value: "btc", label: "Bitcoin (BTC)", type: "crypto" },
  { value: "eth", label: "Ethereum (ETH)", type: "crypto" },
  { value: "sol", label: "Solana (SOL)", type: "crypto" },
  { value: "spy", label: "SPDR S&P 500 ETF Trust (SPY)", type: "etf" },
  { value: "qqq", label: "Invesco QQQ Trust (QQQ)", type: "etf" },
]

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const handleAddToWatchlist = (selectedValue: string, label: string) => {
    setValue("")
    setOpen(false)

  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[300px] justify-between">
          {value ? searchOptions.find((option) => option.value === value)?.label : "Search assets..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search stocks, crypto, ETFs..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {searchOptions.map((option,i) => (
                <CommandItem
                  key={i}
                  value={option.value}
                  onSelect={() => handleAddToWatchlist(option.value, option.label)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{option.type}</span>
                  </div>
                  <Plus className="ml-auto h-4 w-4 text-blue-500" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
