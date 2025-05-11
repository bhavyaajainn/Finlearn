"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Asset } from "@/lib/types";

interface WatchlistTableProps {
    assets: Asset[];
    onRemove: (ticker: string) => void;
    onSelect: (asset: Asset) => void;
    selectedAsset: Asset | null;
}

type SortField = "name" | "price" | "changePercent" | "marketCap" | "volume";
type SortDirection = "asc" | "desc";

export function WatchlistTable({ assets, onRemove, onSelect, selectedAsset }: WatchlistTableProps) {
    const [sortField, setSortField] = useState<SortField>("marketCap");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedAssets = [...assets].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="rounded-lg border border-blue-600/50 p-4 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Your Watchlist</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-900 text-gray-400 text-sm">
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort("name")}
                                    className="flex items-center space-x-1 hover:text-white transition-colors"
                                >
                                    <span>Asset</span>
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <button
                                    onClick={() => handleSort("price")}
                                    className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                                >
                                    <span>Price</span>
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <button
                                    onClick={() => handleSort("changePercent")}
                                    className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                                >
                                    <span>24h Change</span>
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right hidden md:table-cell">
                                <button
                                    onClick={() => handleSort("marketCap")}
                                    className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                                >
                                    <span>Market Cap</span>
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right hidden md:table-cell">
                                <button
                                    onClick={() => handleSort("volume")}
                                    className="flex items-center space-x-1 hover:text-white transition-colors ml-auto"
                                >
                                    <span>Volume (24h)</span>
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {sortedAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    Your watchlist is empty. Search for assets to add them.
                                </td>
                            </tr>
                        ) : (
                            sortedAssets.map((asset) => (
                                <motion.tr
                                    key={asset.ticker}
                                    variants={itemVariants}
                                    className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${selectedAsset?.ticker === asset.ticker ? 'bg-blue-900/20' : ''}`}
                                    onClick={() => onSelect(asset)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                                                <span className="text-xs font-bold">{asset.ticker.substring(0, 2)}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{asset.name}</div>
                                                <div className="text-sm text-gray-400">{asset.ticker}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">
                                        ${asset.price.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className={`flex items-center justify-end ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {asset.changePercent >= 0 ? (
                                                <TrendingUp size={16} className="mr-1" />
                                            ) : (
                                                <TrendingDown size={16} className="mr-1" />
                                            )}
                                            {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right hidden md:table-cell">
                                        ${asset.marketCap.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-right hidden md:table-cell">
                                        ${asset.volume.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(asset.ticker);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                        >
                                            <X size={16} className="text-gray-400 hover:text-white" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
}
