
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  Send
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPaperByIdQuery } from '../../features/papers/paperApi';
import { 
  useStartAttemptMutation,
  useSubmitAttemptMutation 
} from '../../features/attempts/attemptApi';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const { 
    data: paper, 
    isLoading: paperLoading, 
    error: paperError 
  } = useGetPaperByIdQuery(id);

  const [startAttempt] = useStartAttemptMutation();
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitAttemptMutation();

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const handleStartExam = async () => {
    try {
      await startAttempt(id).unwrap();
      setExamStarted(true);
      setTimeLeft((paper?.settings?.duration || 60) * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Failed to start exam:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFlagQuestion = (index) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      await submitAttempt({
        paperId: id,
        answers: formattedAnswers
      }).unwrap();

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit exam:', error);
    }
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

  if (paperError || !paper) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Exam not found</h2>
          <p className="text-gray-400 mb-4">This exam may not exist or you don't have access to it</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = paper.questions || [];
  const answeredQuestions = Object.keys(answers).length;
  const currentQ = questions[currentQuestion];

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          className="max-w-2xl w-full glass-card p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-6">{paper.title}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
              <span className="text-gray-400">Subject:</span>
              <span className="text-white font-medium">{paper.subject || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
              <span className="text-gray-400">Questions:</span>
              <span className="text-white font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white font-medium">{paper.settings?.duration || 60} minutes</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
              <span className="text-gray-400">Total Marks:</span>
              <span className="text-white font-medium">{paper.settings?.totalMarks || questions.length}</span>
            </div>
          </div>

          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-yellow-400 font-semibold">Instructions</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• You have {paper.settings?.duration || 60} minutes to complete this exam</li>
              <li>• You can navigate between questions and review your answers</li>
              <li>• You can flag questions for review</li>
              <li>• The exam will auto-submit when time runs out</li>
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>

          <motion.button
            onClick={handleStartExam}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Exam
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{paper.title}</h1>
              <p className="text-gray-400 text-sm">{paper.subject}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 sticky top-4">
              <h3 className="text-white font-semibold mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg border-2 transition-all ${
                      currentQuestion === index
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : answers[questions[index]?._id]
                        ? 'bg-green-600/20 border-green-500 text-green-400'
                        : flaggedQuestions.has(index)
                        ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400'
                        : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Answered:</span>
                  <span className="text-green-400">{answeredQuestions}/{questions.length}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Flagged:</span>
                  <span className="text-yellow-400">{flaggedQuestions.size}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            {currentQ && (
              <motion.div
                className="glass-card p-6"
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-400 font-semibold">
                        Question {currentQuestion + 1}
                      </span>
                      <span className="text-gray-400">of {questions.length}</span>
                      {currentQ.marks && (
                        <span className="text-gray-400">({currentQ.marks} marks)</span>
                      )}
                    </div>
                    <h2 className="text-lg text-white mb-4">{currentQ.question}</h2>
                  </div>
                  
                  <button
                    onClick={() => handleFlagQuestion(currentQuestion)}
                    className={`p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestion)
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'text-gray-400 hover:bg-gray-700/30'
                    }`}
                    title={flaggedQuestions.has(currentQuestion) ? 'Unflag question' : 'Flag for review'}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQ._id] === option
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        value={option}
                        checked={answers[currentQ._id] === option}
                        onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-600/30">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-gray-400 text-sm">
                    {currentQuestion + 1} of {questions.length}
                  </div>

                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Submit Exam</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Questions answered:</span>
                  <span className="text-white">{answeredQuestions}/{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time remaining:</span>
                  <span className="text-white">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {answeredQuestions < questions.length && (
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-400 text-sm">
                    You have {questions.length - answeredQuestions} unanswered questions.
                  </p>
                </div>
              )}

              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to submit your exam? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue Exam
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPage;
