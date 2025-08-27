
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ExamInterface = ({ exam, onSubmit, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Mock questions data
  const questions = [
    {
      id: 1,
      type: 'multiple_choice',
      question: 'What is the derivative of x²?',
      options: ['2x', 'x²', '2', 'x'],
      correctAnswer: '2x'
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'What is the integral of 2x?',
      options: ['x²', 'x² + C', '2', '2x²'],
      correctAnswer: 'x² + C'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFlagQuestion = () => {
    const questionId = questions[currentQuestion].id;
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ answers, timeSpent: (exam.duration * 60) - timeLeft });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const getQuestionStatus = (index) => {
    const questionId = questions[index].id;
    const isAnswered = answers[questionId];
    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isAnswered && isFlagged) return 'answered-flagged';
    if (isAnswered) return 'answered';
    if (isFlagged) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'bg-blue-600 text-white';
      case 'answered-flagged': return 'bg-orange-600 text-white';
      case 'answered': return 'bg-green-600 text-white';
      case 'flagged': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white hover:bg-gray-500';
    }
  };

  const currentQ = questions[currentQuestion];
  const isTimeWarning = timeLeft < 300; // 5 minutes warning

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{exam.title}</h1>
            <p className="text-sm text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            
            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Exit Exam
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-gray-900/50 border-r border-gray-800 p-4">
          <h3 className="text-lg font-semibold mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  getStatusColor(getQuestionStatus(index))
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-600 rounded"></div>
              <span>Flagged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>Not answered</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Content */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="glass-card p-8">
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white pr-4">
                      {currentQ.question}
                    </h2>
                    <motion.button
                      onClick={handleFlagQuestion}
                      className={`p-2 rounded-lg transition-colors ${
                        flaggedQuestions.has(currentQ.id)
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Flag className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {currentQ.type === 'multiple_choice' && (
                    <div className="space-y-4">
                      {currentQ.options.map((option, index) => (
                        <motion.label
                          key={index}
                          className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            answers[currentQ.id] === option
                              ? 'border-blue-500 bg-blue-600/10'
                              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQ.id}`}
                            value={option}
                            checked={answers[currentQ.id] === option}
                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            answers[currentQ.id] === option
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-500'
                          }`}>
                            {answers[currentQ.id] === option && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-white text-lg">{option}</span>
                        </motion.label>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="bg-gray-900/50 border-t border-gray-800 p-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <motion.button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: currentQuestion === 0 ? 1 : 1.05 }}
                whileTap={{ scale: currentQuestion === 0 ? 1 : 0.95 }}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </motion.button>

              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => {/* Save progress */}}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Progress</span>
                </motion.button>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Exam'}</span>
                </motion.button>
              </div>

              <motion.button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: currentQuestion === questions.length - 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentQuestion === questions.length - 1 ? 1 : 0.95 }}
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
