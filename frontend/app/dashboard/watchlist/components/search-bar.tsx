"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon } from 'lucide-react';
import { searchAssets } from "@/lib/data";
import { Asset } from "@/lib/types";

interface SearchProps {
  onAddAsset: (asset: Asset) => void;
}

export function Search({ onAddAsset }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Asset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const searchResults = searchAssets(query);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddAsset = (asset: Asset) => {
    onAddAsset(asset);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative mb-6">
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search stocks, crypto, or ETFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <AnimatePresence>
          {isOpen && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-2 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <ul>
                {results.map((asset) => (
                  <li key={asset.ticker} className="border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() => handleAddAsset(asset)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-gray-400">{asset.ticker} • {asset.type}</div>
                      </div>
                      <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${asset.price.toFixed(2)} ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
