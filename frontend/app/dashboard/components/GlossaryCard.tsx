"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronRight, Info, Plus } from "lucide-react"
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
    <>
      <div className="flex justify-between">
        <Card className="bg-black border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Glossary of the Day
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {glossaryTerms.map((item, index) => (
                <motion.div
                  key={item.term}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div
                    className="flex flex-col gap-1.5 rounded-lg border border-blue-900/50 bg-blue-950/20 p-3 transition-colors hover:bg-blue-950/40 cursor-pointer"
                    onClick={() => handleTermClick(item.term)}
                  >
                    <div className="flex justify-between p-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{item.term}</span>
                          <Badge variant="outline" className="bg-blue-950/50 text-blue-300 border-blue-800">
                            {item.category}
                          </Badge>
                          <Info className="h-4 w-4 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 py-3">{item.definition}</p>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 cursor-pointer"
                        >
                          Add to My Glossary
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

              ))}
            </div>
          </CardContent>
        </Card>
        <TermModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} term={selectedTerm} />
        <Watchlist />
      </div>


    </>
  )
}
