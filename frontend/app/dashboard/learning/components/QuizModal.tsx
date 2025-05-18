"use client"

import { useState } from 'react';
import { X, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { DailySummary } from '../mockData';

interface QuizModalProps {
  dailySummary: DailySummary;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ dailySummary, isOpen, onClose }: any) {
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  
  if (!isOpen) return null;
  
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!quizSubmitted) {
      setUserAnswers({
        ...userAnswers,
        [questionId]: optionIndex
      });
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const calculateQuizScore = () => {
    let score = 0;
    dailySummary.quiz.questions.forEach((question: { id: string; correctAnswerIndex: number }) => {
      if (userAnswers[question.id] === question.correctAnswerIndex) {
      score += 1;
      }
    });
    return score;
  };
  
  const getOptionClasses = (questionId: string, optionIndex: number, correctIndex: number) => {
    const baseClasses = "p-3 rounded-lg border cursor-pointer transition-colors";
    
    if (!quizSubmitted) {
      return `${baseClasses} ${
        userAnswers[questionId] === optionIndex 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
          : 'bg-zinc-700 border-zinc-600 text-gray-300 hover:bg-zinc-600'
      }`;
    } else {
      if (optionIndex === correctIndex) {
        return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-400`;
      } else if (userAnswers[questionId] === optionIndex) {
        return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-400`;
      } else {
        return `${baseClasses} bg-zinc-700 border-zinc-600 text-gray-300`;
      }
    }
  };
  
  const closeQuiz = () => {
    onClose();
    resetQuiz();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6 flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-semibold text-white">Daily Quiz</h3>
          <button 
            onClick={closeQuiz}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 mb-6 space-y-8" style={{ height: '60vh', overflowY: 'scroll' }}>
            {dailySummary.quiz.questions.map((question: { id: string; question: string; options: string[]; correctAnswerIndex: number }, index: number) => (
            <div key={question.id} className="p-4 bg-zinc-800 rounded-lg">
              <h4 className="text-white font-medium mb-4">
              {index + 1}. {question.question}
              </h4>
              
              <div className="space-y-2">
              {question.options.map((option: string, optionIndex: number) => (
                <div 
                key={optionIndex}
                className={getOptionClasses(question.id, optionIndex, question.correctAnswerIndex)}
                onClick={() => handleAnswerSelect(question.id, optionIndex)}
                >
                <div className="flex items-center">
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-3 ${
                  quizSubmitted && optionIndex === question.correctAnswerIndex 
                    ? 'bg-green-500 text-white' 
                    : quizSubmitted && userAnswers[question.id] === optionIndex 
                    ? 'bg-red-500 text-white'
                    : userAnswers[question.id] === optionIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-600 text-gray-300'
                  }`}>
                  {String.fromCharCode(65 + optionIndex)}
                  </div>
                  <div className="flex-grow">{option}</div>
                  {quizSubmitted && optionIndex === question.correctAnswerIndex && (
                  <CheckCircle className="h-5 w-5 text-green-400 ml-2" />
                  )}
                </div>
                </div>
              ))}
              </div>
              
              {quizSubmitted && userAnswers[question.id] !== question.correctAnswerIndex && (
              <div className="mt-3 text-sm text-green-400">
                <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswerIndex]}
              </div>
              )}
            </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800 flex-shrink-0">
          {quizSubmitted && (
            <div className="text-lg font-medium">
              Your score: <span className="text-blue-400">{calculateQuizScore()}/{dailySummary.quiz.questions.length}</span>
            </div>
          )}
          
          {!quizSubmitted && (
            <div className="text-gray-400 text-sm">
              {Object.keys(userAnswers).length}/{dailySummary.quiz.questions.length} questions answered
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={closeQuiz}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              Close
            </button>
            
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                disabled={Object.keys(userAnswers).length < dailySummary.quiz.questions.length}
              >
                Submit Answers
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}