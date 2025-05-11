"use client"

import { X } from 'lucide-react';
import { Concept } from '../mockData';

interface ConceptModalProps {
  concept: Concept | null;
  onClose: () => void;
}

export default function ConceptModal({ concept, onClose }: ConceptModalProps) {
  if (!concept) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{concept.term}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
            {concept.category}
          </span>
        </div>
        
        <p className="text-gray-300">{concept.definition}</p>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}