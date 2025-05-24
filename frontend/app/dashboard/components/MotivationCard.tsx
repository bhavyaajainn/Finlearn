import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Quote {
  text: string;
  author: string;
}

interface MotivationCardProps {
  quote?: Quote;
  loading?: boolean;
  error?: string | null;
}

const MotivationCard: React.FC<MotivationCardProps> = ({ quote, loading = false, error = null }) => {
  const fallbackQuote = {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin"
  };

  const displayQuote = quote || fallbackQuote;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black border-blue-900/50 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Quote className="h-4 w-4 text-blue-400" />
              Daily Inspiration
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="animate-pulse">
              <div className="border-l-4 border-blue-600 pl-4 mb-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black border-red-900/50 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Daily Inspiration
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
              <AlertCircle className="h-4 w-4" />
              <span>Unable to load daily quote</span>
            </div>
            <blockquote className="border-l-4 border-blue-600 pl-4 italic text-base text-gray-200 mb-2">
              "{fallbackQuote.text}"
            </blockquote>
            <p className="text-gray-400 text-sm">— {fallbackQuote.author}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Clean the quote text by removing extra quotes and formatting
  const cleanQuoteText = displayQuote.text
    .replace(/^["'"']|["'"']$/g, '') // Remove quotes at start/end
    .replace(/\[.*?\]/g, '') // Remove reference numbers like [5]
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="bg-black border-blue-900/50 text-white hover:border-blue-500/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-base group-hover:text-blue-400 transition-colors">
            <Quote className="h-4 w-4 text-blue-400" />
            Daily Inspiration
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <blockquote className="border-l-4 border-blue-600 pl-4 italic text-base text-gray-200 mb-3 leading-relaxed">
            "{cleanQuoteText}"
          </blockquote>
          <p className="text-gray-400 text-sm font-medium">— {displayQuote.author || 'Anonymous'}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MotivationCard