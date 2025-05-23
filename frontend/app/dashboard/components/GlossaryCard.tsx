"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, AlertCircle } from "lucide-react"

interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
}

interface GlossaryCardProps {
  glossaryTerms: GlossaryTerm[];
  loading?: boolean;
  error?: string | null;
}

export function GlossaryCard({ glossaryTerms = [], loading = false, error = null }: GlossaryCardProps) {
  const fallbackTerms: GlossaryTerm[] = [
    {
      term: "Compound Interest",
      definition: "Interest calculated on both the initial principal and previously accumulated interest.",
      example: "A $1,000 investment earning 5% compounded annually becomes $1,276 after 5 years."
    },
    {
      term: "Risk Tolerance", 
      definition: "The degree of variability in investment returns that an investor is willing to withstand.",
      example: "A conservative investor might prefer bonds over volatile stocks."
    },
    {
      term: "Financial Literacy",
      definition: "The ability to understand and effectively use various financial skills.",
      example: "Understanding how investments work and managing a budget."
    }
  ]

  const displayTerms = glossaryTerms.length > 0 ? glossaryTerms : fallbackTerms;

  if (loading) {
    return (
      <Card className="bg-black border-blue-900/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Glossary of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse rounded-lg border border-blue-900/50 bg-[#0c1021] p-4">
              <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-black border-red-900/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Glossary of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>Unable to load glossary terms</span>
          </div>
          <div className="space-y-4">
            {fallbackTerms.slice(0, 2).map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-blue-900/50 bg-[#0c1021] overflow-hidden hover:border-blue-500/50 transition-colors"
              >
                <div className="p-4">
                  <p className="text-white mb-2 font-medium">{item.term}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.definition}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black border-blue-900/50 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Glossary of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayTerms.map((item, index) => (
          <motion.div
            key={item.term}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-blue-900/50 bg-[#0c1021] overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
          >
            <div className="p-4">
              <h3 className="text-white mb-2 font-semibold text-base group-hover:text-blue-400 transition-colors">
                {item.term}
              </h3>              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {item.definition}
              </p>
              {item.example && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-md p-2">
                  <p className="text-blue-300 text-xs">
                    <strong>Example:</strong> {item.example}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}