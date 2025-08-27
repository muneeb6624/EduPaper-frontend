
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Calendar,
  Clock,
  FileText,
  Users,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCreatePaperMutation } from '../../features/papers/paperApi';

const PaperCreator = () => {
  const navigate = useNavigate();
  const [createPaper, { isLoading }] = useCreatePaperMutation();

  const [paperData, setPaperData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'medium',
    tags: [],
    questions: [],
    settings: {
      duration: 60,
      totalMarks: 0,
      passingMarks: 0,
      maxAttempts: 1,
      shuffleQuestions: false,
      showResults: true,
      startTime: '',
      endTime: ''
    }
  });

  const [currentSection, setCurrentSection] = useState('basic');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    };

    setPaperData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId, field, value) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));

    // Update total marks
    if (field === 'marks') {
      updateTotalMarks();
    }
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    updateTotalMarks();
  };

  const updateTotalMarks = () => {
    const total = paperData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
    setPaperData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        totalMarks: total
      }
    }));
  };

  const handleSave = async (isDraft = false) => {
    try {
      // Validation
      if (!paperData.title.trim()) {
        alert('Please enter a paper title');
        return;
      }

      if (paperData.questions.length === 0) {
        alert('Please add at least one question');
        return;
      }

      // Prepare data for API
      const paperToSave = {
        ...paperData,
        status: isDraft ? 'draft' : 'active',
        questions: paperData.questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: parseInt(q.marks) || 1,
          explanation: q.explanation
        })),
        settings: {
          ...paperData.settings,
          totalMarks: paperData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0),
          startTime: paperData.settings.startTime ? new Date(paperData.settings.startTime) : null,
          endTime: paperData.settings.endTime ? new Date(paperData.settings.endTime) : null,
        }
      };

      await createPaper(paperToSave).unwrap();
      navigate('/papers', { 
        state: { message: `Paper ${isDraft ? 'saved as draft' : 'created'} successfully!` }
      });
    } catch (error) {
      console.error('Failed to save paper:', error);
      alert('Failed to save paper. Please try again.');
    }
  };

  const renderQuestionForm = (question) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Question {paperData.questions.findIndex(q => q.id === question.id) + 1}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpandedQuestion(
              expandedQuestion === question.id ? null : question.id
            )}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {expandedQuestion === question.id ? <ChevronUp /> : <ChevronDown />}
          </button>
          <button
            onClick={() => removeQuestion(question.id)}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expandedQuestion === question.id && (
        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-white font-medium mb-2">Question</label>
            <textarea
              value={question.question}
              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
              placeholder="Enter your question..."
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-white font-medium mb-2">Type</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="long_answer">Long Answer</option>
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block text-white font-medium mb-2">Marks</label>
              <input
                type="number"
                min="1"
                value={question.marks}
                onChange={(e) => updateQuestion(question.id, 'marks', e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Options (for MCQ) */}
          {question.type === 'mcq' && (
            <div>
              <label className="block text-white font-medium mb-2">Options</label>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-400 font-medium w-8">
                      {String.fromCharCode(65 + index)}:
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateQuestionOption(question.id, index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 p-2 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === option}
                      onChange={() => updateQuestion(question.id, 'correctAnswer', option)}
                      className="text-green-500"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Select the radio button next to the correct answer
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-white font-medium mb-2">Explanation (Optional)</label>
            <textarea
              value={question.explanation}
              onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
              placeholder="Explain the correct answer..."
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Paper</h1>
            <p className="text-gray-400">Design your exam paper with questions and settings</p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </motion.button>
            <motion.button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-4 h-4" />
              <span>Publish Paper</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 sticky top-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setCurrentSection('basic')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                    currentSection === 'basic'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Basic Info</span>
                </button>
                <button
                  onClick={() => setCurrentSection('questions')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                    currentSection === 'questions'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Questions ({paperData.questions.length})</span>
                </button>
                <button
                  onClick={() => setCurrentSection('settings')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                    currentSection === 'settings'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questions:</span>
                    <span className="text-white">{paperData.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Marks:</span>
                    <span className="text-white">{paperData.settings.totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{paperData.settings.duration}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentSection === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Paper Title</label>
                        <input
                          type="text"
                          value={paperData.title}
                          onChange={(e) => setPaperData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter paper title..."
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Description</label>
                        <textarea
                          value={paperData.description}
                          onChange={(e) => setPaperData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe this paper..."
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Subject</label>
                          <input
                            type="text"
                            value={paperData.subject}
                            onChange={(e) => setPaperData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="e.g., Mathematics, Physics"
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Difficulty</label>
                          <select
                            value={paperData.difficulty}
                            onChange={(e) => setPaperData(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === 'questions' && (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Questions</h2>
                    <motion.button
                      onClick={addQuestion}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                    </motion.button>
                  </div>

                  {paperData.questions.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No Questions Yet</h3>
                      <p className="text-gray-400 mb-6">Add your first question to get started</p>
                      <motion.button
                        onClick={addQuestion}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Add Question
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paperData.questions.map(question => renderQuestionForm(question))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentSection === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Exam Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Duration (minutes)</label>
                          <input
                            type="number"
                            min="1"
                            value={paperData.settings.duration}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, duration: parseInt(e.target.value) || 60 }
                            }))}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Max Attempts</label>
                          <input
                            type="number"
                            min="1"
                            value={paperData.settings.maxAttempts}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, maxAttempts: parseInt(e.target.value) || 1 }
                            }))}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            value={paperData.settings.startTime}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, startTime: e.target.value }
                            }))}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">End Date & Time</label>
                          <input
                            type="datetime-local"
                            value={paperData.settings.endTime}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, endTime: e.target.value }
                            }))}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="shuffleQuestions"
                            checked={paperData.settings.shuffleQuestions}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, shuffleQuestions: e.target.checked }
                            }))}
                            className="text-blue-600 focus:ring-blue-400"
                          />
                          <label htmlFor="shuffleQuestions" className="text-white font-medium">
                            Shuffle Questions
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="showResults"
                            checked={paperData.settings.showResults}
                            onChange={(e) => setPaperData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, showResults: e.target.checked }
                            }))}
                            className="text-blue-600 focus:ring-blue-400"
                          />
                          <label htmlFor="showResults" className="text-white font-medium">
                            Show Results After Submission
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperCreator;
