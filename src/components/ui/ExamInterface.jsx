
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  Send
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPaperByIdQuery } from '../../features/papers/paperApi';
import { useStartAttemptMutation, useSubmitAttemptMutation } from '../../features/attempts/attemptApi';

const ExamInterface = () => {
  const { id: paperId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  const { data: paperResponse, isLoading: paperLoading } = useGetPaperByIdQuery(paperId);
  const [startAttempt] = useStartAttemptMutation();
  const [submitAttempt] = useSubmitAttemptMutation();

  const paper = paperResponse?.paper;
  const questions = paper?.questions || [];

  // Initialize exam
  useEffect(() => {
    if (paper && !attemptId) {
      initializeExam();
    }
  }, [paper]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attemptId) {
      handleAutoSubmit();
    }
  }, [timeLeft, attemptId]);

  const initializeExam = async () => {
    try {
      const result = await startAttempt(paperId).unwrap();
      setAttemptId(result.attempt._id);
      setTimeLeft((paper.settings?.duration || 60) * 60); // Convert minutes to seconds
      
      // Initialize answers
      const initialAnswers = {};
      questions.forEach(q => {
        initialAnswers[q._id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to start exam:', error);
      navigate('/dashboard');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    try {
      const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      await submitAttempt({
        paperId,
        answers: submissionAnswers
      }).unwrap();

      navigate('/results', { 
        state: { message: 'Exam submitted successfully!' }
      });
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer.trim() !== '').length;
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question._id] || '';

    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.label
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentAnswer === option
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  className="mt-1 sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                  currentAnswer === option
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-400'
                }`} />
                <span className="text-white flex-1">{option}</span>
              </motion.label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        );

      case 'long_answer':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Type your detailed answer here..."
            className="w-full h-48 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        );

      default:
        return (
          <div className="text-gray-400">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  if (paperLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Exam Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">No Questions Available</h1>
          <p className="text-gray-400 mb-6">This exam has no questions configured.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{paper.title}</h1>
            <p className="text-gray-400 text-sm">{paper.subject}</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Progress */}
            <div className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentQuestion
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : answers[questions[index]._id]?.trim()
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Answered:</span>
                  <span className="text-green-400 font-medium">
                    {getAnsweredCount()}/{questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Remaining:</span>
                  <span className="text-orange-400 font-medium">
                    {questions.length - getAnsweredCount()}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={() => setShowSubmitDialog(true)}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                <span>Submit Exam</span>
              </motion.button>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-8"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                        Question {currentQuestion + 1}
                      </span>
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                        {questions[currentQuestion]?.marks || 0} marks
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {questions[currentQuestion]?.type?.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-medium text-white leading-relaxed">
                    {questions[currentQuestion]?.question}
                  </h2>
                </div>

                <div className="mb-8">
                  {renderQuestion(questions[currentQuestion])}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: currentQuestion === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: currentQuestion === 0 ? 1 : 0.98 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    {answers[questions[currentQuestion]._id]?.trim() && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <motion.button
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: currentQuestion === questions.length - 1 ? 1 : 1.02 }}
                    whileTap={{ scale: currentQuestion === questions.length - 1 ? 1 : 0.98 }}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AnimatePresence>
        {showSubmitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md w-full"
            >
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Submit Exam?</h3>
                <p className="text-gray-400 mb-6">
                  You have answered {getAnsweredCount()} out of {questions.length} questions.
                  Once submitted, you cannot make any changes.
                </p>
                
                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => setShowSubmitDialog(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue Exam
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamInterface;
