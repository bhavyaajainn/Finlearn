import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, PlusCircle } from "lucide-react"
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"

const Watchlist = () => {
    const watchlistItems = [
        { ticker: "AAPL", name: "Apple Inc.", price: 187.42, change: 1.24 },
        { ticker: "MSFT", name: "Microsoft Corp.", price: 328.79, change: 0.87 },
        { ticker: "BTC", name: "Bitcoin", price: 61245.32, change: 2.35 },
        { ticker: "TSLA", name: "Tesla Inc.", price: 242.68, change: -1.42 },
        { ticker: "ETH", name: "Ethereum", price: 3421.56, change: -0.78 },
    ]
    
    return (
        <Card className="bg-black border-blue-900/50 text-white">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Your Watchlist</CardTitle>
                    <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 rounded-full">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Asset
                    </Button>
                </div>
                <CardDescription className="text-gray-400">Track your favorite assets</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div>
                    {watchlistItems.map((item,i) => (
                        <motion.div 
                            key={i} 
                            className="flex items-center justify-between py-3 px-4 border-b border-zinc-800 last:border-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div>
                                <div className="font-medium text-base">{item.ticker}</div>
                                <div className="text-sm text-gray-400">{item.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-base">${item.price.toLocaleString()}</div>
                                <div
                                    className={`text-sm flex items-center justify-end ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                    {item.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                    {Math.abs(item.change)}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-4">
                <Button variant="ghost" className="w-full mt-2 text-blue-400 hover:bg-blue-900/20">
                    View Full Watchlist
                </Button>
            </CardFooter>
        </Card>
    )
}

export default Watchlist