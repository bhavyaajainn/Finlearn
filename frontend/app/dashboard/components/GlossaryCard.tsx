"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronRight, Plus } from "lucide-react"
import { TermModal } from "./TermModal"
import Watchlist from "./Watchlist"

export function GlossaryCard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState("")

  const glossaryTerms = [
    {
      term: "P/E Ratio",
      definition:
        "Price-to-Earnings Ratio: A valuation metric comparing a company's stock price to its earnings per share.",
      category: "Stocks",
    },
    {
      term: "Market Cap",
      definition:
        "The total value of a company's outstanding shares, calculated by multiplying share price by total shares.",
      category: "Stocks",
    },
    {
      term: "Liquidity",
      definition: "How easily an asset can be bought or sold without affecting its price.",
      category: "Trading",
    },
  ]

  const handleTermClick = (term: string) => {
    setSelectedTerm(term)
    setIsModalOpen(true)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-black border-blue-900/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Glossary of the Day
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            className="text-blue-400 hover:text-blue-300"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {glossaryTerms.map((item, index) => (
            <motion.div
              key={item.term}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-blue-900/50 bg-[#0c1021] overflow-hidden"
            >
              <div className="p-4">
                <div className="mb-2">
                  <Badge className="bg-[#1d274a] text-white border-none">
                    {item.category}
                  </Badge>
                </div>
                
                <p className="text-white mb-2">{item.term}</p>
                
                <p className="text-gray-400 text-sm">{item.definition}</p>
                
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0"
                  >
                    Add to My Glossary <Plus className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
      
      <TermModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} term={selectedTerm} />
      <Watchlist />
    </div>
  )
}