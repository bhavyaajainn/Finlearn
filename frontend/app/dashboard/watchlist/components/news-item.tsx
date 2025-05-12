"use client";

import { motion } from "framer-motion";
import { ExternalLink } from 'lucide-react';
import { News } from "@/lib/types";
import Image from "next/image";

interface NewsItemProps {
  news: News;
}

export function NewsItem({ news }: NewsItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium mb-2">{news.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{news.summary}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{news.source}</span>
              <span className="mx-2">•</span>
              <span>{news.date}</span>
              <div className="ml-2 flex space-x-1">
                {news.tickers.map(ticker => (
                  <span key={ticker} className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
                    {ticker}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {news.imageUrl && (
            <div className="ml-4 flex-shrink-0">
              <Image 
                src={news.imageUrl || "/placeholder.svg"} 
                alt={news.title} 
                width={20}
                height={20}
                className="w-20 h-20 object-cover rounded"
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <a 
            href="#" 
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center transition-colors"
          >
            Read more <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
