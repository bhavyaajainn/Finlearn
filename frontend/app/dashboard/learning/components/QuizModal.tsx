"use client"

import { useState } from 'react';
import { X, CheckCircle, ChevronRight, RefreshCw, Award, AlertTriangle } from 'lucide-react';

interface QuizModalProps {
  dailySummary: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ dailySummary, isOpen, onClose }: QuizModalProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  
  if (!isOpen || !dailySummary) return null;
  
  const quizQuestions = dailySummary.quiz_questions || [];
  
  const handleAnswerSelect = (questionIndex: number, optionLabel: string) => {
    if (!quizSubmitted) {
      setUserAnswers({
        ...userAnswers,
        [questionIndex]: optionLabel
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
    quizQuestions.forEach((question: any, index: number) => {
      if (userAnswers[index] === question.correct_answer) {
        score += 1;
      }
    });
    return score;
  };
  
  const getOptionClasses = (questionIndex: number, optionLabel: string, correctAnswer: string) => {
    const baseClasses = "p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors text-sm sm:text-base";
    
    if (!quizSubmitted) {
      return `${baseClasses} ${
        userAnswers[questionIndex] === optionLabel 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
          : 'bg-zinc-700 border-zinc-600 text-gray-300 hover:bg-zinc-600'
      }`;
    } else {
      if (optionLabel === correctAnswer) {
        return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-400`;
      } else if (userAnswers[questionIndex] === optionLabel) {
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
  
  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) {
      return "Excellent! You've mastered today's content.";
    } else if (percentage >= 70) {
      return "Great job! You have a good understanding of the material.";
    } else if (percentage >= 50) {
      return "Good effort! You're making progress.";
    } else {
      return "Keep learning! Consider reviewing the material again.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-3 sm:p-6 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-white">Daily Quiz</h3>
          <button 
            onClick={closeQuiz}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {quizSubmitted && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
            calculateQuizScore() >= quizQuestions.length * 0.7 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-amber-500/10 border border-amber-500/30'
          }`}>
            <div className="flex items-start">
              {calculateQuizScore() >= quizQuestions.length * 0.7 ? (
                <Award className="h-5 w-5 text-green-400 mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
              )}
              <div>
                <h4 className="text-white font-medium text-sm sm:text-base">
                  Score: {calculateQuizScore()}/{quizQuestions.length} ({Math.round((calculateQuizScore() / quizQuestions.length) * 100)}%)
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">
                  {getScoreMessage(calculateQuizScore(), quizQuestions.length)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 mb-4 sm:mb-6 space-y-4 sm:space-y-6">
          {quizQuestions.map((question: any, index: number) => (
            <div key={index} className="p-3 sm:p-4 bg-zinc-800/70 rounded-lg border border-zinc-700/50">
              <h4 className="text-white font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                {index + 1}. {question.question}
              </h4>
              
              <div className="space-y-2">
                {question.options.map((option: any) => (
                  <div 
                    key={option.label}
                    className={getOptionClasses(index, option.label, question.correct_answer)}
                    onClick={() => handleAnswerSelect(index, option.label)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mr-2 sm:mr-3 text-xs sm:text-sm ${
                        quizSubmitted && option.label === question.correct_answer 
                          ? 'bg-green-500 text-white' 
                          : quizSubmitted && userAnswers[index] === option.label 
                          ? 'bg-red-500 text-white'
                          : userAnswers[index] === option.label
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-600 text-gray-300'
                      }`}>
                        {option.label}
                      </div>
                      <div className="flex-grow text-xs sm:text-sm">{option.text}</div>
                      {quizSubmitted && option.label === question.correct_answer && (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 ml-1 sm:ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {quizSubmitted && userAnswers[index] !== question.correct_answer && (
                <div className="mt-3 text-xs sm:text-sm bg-zinc-700/50 p-2 sm:p-3 rounded-lg border border-zinc-600/30">
                  <div className="font-medium text-green-400 mb-1">Explanation:</div>
                  <div className="text-gray-300">{question.explanation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 sm:pt-4 border-t border-zinc-800 flex-shrink-0">
          {!quizSubmitted && (
            <div className="text-gray-400 text-xs sm:text-sm w-full sm:w-auto text-center sm:text-left">
              {Object.keys(userAnswers).length}/{quizQuestions.length} questions answered
            </div>
          )}
          
          {quizSubmitted && (
            <div className="text-gray-400 text-xs sm:text-sm w-full sm:w-auto text-center sm:text-left">
              <span>You've completed today's quiz!</span>
            </div>
          )}
          
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={closeQuiz}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              Close
            </button>
            
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors text-xs sm:text-sm ${
                  Object.keys(userAnswers).length < quizQuestions.length ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={Object.keys(userAnswers).length < quizQuestions.length}
              >
                Submit Answers
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors text-xs sm:text-sm"
              >
                <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}