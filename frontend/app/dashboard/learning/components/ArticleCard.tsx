"use client"

import { BookmarkCheck, Bookmark, Clock, ChevronRight, CheckCircle } from "lucide-react"

export default function ArticleCard() {
  const dummyTopic = {
    topic_id: "abc123",
    title: "Understanding Dogecoin: Meme to Mainstream",
    description:
      "DogeCoin started as a joke but has evolved into a legitimate digital currency. This article breaks down its history, technology, and cultural significance.",
    category: "DeFi",
    level: "Beginner",
  }

  const isBookmarked = true
  const isRead = true
  const readTime = Math.ceil(dummyTopic.description.length / 500)

  return (
    <div
      className="cursor-pointer bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-blue-500/10"
    >
      <div className="p-6 space-y-4">
        {/* Tags */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
              {dummyTopic.category.toLowerCase()} · {dummyTopic.level.toLowerCase()}
            </span>

            {isRead && (
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Read
              </span>
            )}
          </div>

          <button>
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-400" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-500 hover:text-blue-400 transition" />
            )}
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold text-white leading-snug">
          {dummyTopic.title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-3">
          {dummyTopic.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-gray-400 text-sm pt-2 border-t border-zinc-800 mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{readTime} min read</span>
          </div>
          <button className="flex items-center gap-1 text-blue-400 hover:underline text-sm font-medium">
            Start Reading <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
