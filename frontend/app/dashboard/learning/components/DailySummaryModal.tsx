"use client"

import { X, CheckCircle, ChevronRight } from 'lucide-react';
import { DailySummary } from '../mockData';

interface DailySummaryModalProps {
  dailySummary: DailySummary;
  isOpen: boolean;
  onClose: () => void;
  onQuizStart: () => void;
}

export default function DailySummaryModal({ 
  dailySummary, 
  isOpen, 
  onClose, 
  onQuizStart 
}: DailySummaryModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">Your Learning Summary</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">
            Articles You've Read
          </h4>
          {dailySummary.articlesRead.length > 0 ? (
            <ul className="space-y-2">
              {dailySummary.articlesRead.map((title, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300">{title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">You haven't read any articles today.</p>
          )}
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">
            Concepts You've Learned
          </h4>
          {dailySummary.conceptsLearned.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dailySummary.conceptsLearned.map((term, index) => (
                <span key={index} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
                  {term}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">You haven't learned any new concepts today.</p>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => {
              onClose();
              onQuizStart();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            Take Daily Quiz
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          
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