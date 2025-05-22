"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Save, ThumbsUp, Lightbulb, BookMarked, Copy } from "lucide-react"

interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
}

interface TermModalProps {
  isOpen: boolean
  onClose: () => void
  term: GlossaryTerm | null
}

export function TermModal({ isOpen, onClose, term }: TermModalProps) {
  if (!term) return null;

  const handleCopyTerm = () => {
    const textToCopy = `${term.term}: ${term.definition}${term.example ? `\n\nExample: ${term.example}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    // You can add a toast notification here
  };

  const handleAddToGlossary = () => {
    // Implement add to personal glossary functionality
    console.log('Adding to glossary:', term.term);
    // You can add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-blue-900/50 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <BookOpen className="h-5 w-5 text-blue-400" />
            {term.term}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Financial Term
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Definition
            </h4>
            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4">
              <p className="text-white leading-relaxed">{term.definition}</p>
            </div>
          </div>

          {term.example && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1">
                <BookMarked className="h-4 w-4" />
                Example
              </h4>
              <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-4">
                <p className="text-green-100 leading-relaxed">{term.example}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="border-gray-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white flex-1 sm:flex-none"
              onClick={handleCopyTerm}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white flex-1 sm:flex-none"
              onClick={handleAddToGlossary}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={onClose}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Got It!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}