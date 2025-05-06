"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ExternalLink, Save, Store, ThumbsUp } from "lucide-react"

interface TermModalProps {
  isOpen: boolean
  onClose: () => void
  term: string
}

export function TermModal({ isOpen, onClose, term }: TermModalProps) {
  // Mock data - in a real app, this would come from an API call
  const termData = {
    term: term,
    definition: "A financial metric used to evaluate a company's stock price relative to its earnings per share (EPS).",
    explanation:
      "The P/E ratio helps investors determine if a stock is overvalued or undervalued. A high P/E ratio may suggest that investors expect higher growth in the future, while a low P/E ratio might indicate that the company is undervalued or that investors expect slower growth.",
    example: "If a company's stock price is $100 and its EPS is $5, the P/E ratio would be 20 ($100 ÷ $5 = 20).",
    relatedTerms: ["EPS", "Valuation Metrics", "Market Cap"],
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-blue-900/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <BookOpen className="h-5 w-5 text-blue-400" />
            {termData.term}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400">Definition</h4>
            <p className="mt-1 text-white">{termData.definition}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400">Explanation</h4>
            <p className="mt-1 text-white">{termData.explanation}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400">Example</h4>
            <div className="mt-1 rounded-md bg-blue-950/20 p-3 text-white">{termData.example}</div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400">Related Terms</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {termData.relatedTerms.map((relatedTerm,i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-blue-950/50 text-blue-300 border-blue-800 cursor-pointer hover:bg-blue-900/50"
                >
                  {relatedTerm}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" className="border-gray-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white cursor-pointer sm:w-auto w-full">
            <Save className="mr-2 h-4 w-4" />
            Add To My Glossary
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto w-full cursor-pointer">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
