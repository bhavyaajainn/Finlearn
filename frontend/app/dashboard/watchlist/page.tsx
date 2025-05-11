"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "./components/search-bar";
import { WatchlistTable } from "./components/watchlist-table";
import { AssetDetail } from "./components/asset-detail";
import { mockAssets } from "@/lib/data";
import { Asset } from "@/lib/types";

export default function Home() {
  const [watchlist, setWatchlist] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const addToWatchlist = (asset: Asset) => {
    if (!watchlist.some((item) => item.ticker === asset.ticker)) {
      setWatchlist([...watchlist, asset]);
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter((asset) => asset.ticker !== ticker));
    if (selectedAsset?.ticker === ticker) {
      setSelectedAsset(null);
    }
  };

  return (
    <main className="min-h-screen text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <div className="mb-8">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            FinLearn
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Monitor your financial assets with AI-powered insights
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Search onAddAsset={addToWatchlist} />
          </div>

          <motion.div
            className="lg:col-span-3 xl:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <WatchlistTable
              assets={watchlist}
              onRemove={removeFromWatchlist}
              onSelect={setSelectedAsset}
              selectedAsset={selectedAsset}
            />
          </motion.div>

          <AnimatePresence>
            {selectedAsset && (
              <motion.div
                className="lg:col-span-3 xl:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AssetDetail asset={selectedAsset} />
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedAsset && (
            <motion.div
              className="lg:col-span-3 xl:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="mb-4 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"></path>
                    <path d="M21 12H3"></path>
                    <path d="M9 3v18"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Weekly Research Mailer</h3>
                <p className="text-gray-400 mb-4">
                  Get AI-powered insights on your watchlist delivered to your inbox every week.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
