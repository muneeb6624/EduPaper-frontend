
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Clock, 
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

const PaperCreator = ({ onSave, onCancel, existingPaper = null }) => {
  const [paperData, setPaperData] = useState({
    title: existingPaper?.title || '',
    subject: existingPaper?.subject || '',
    duration: existingPaper?.duration || 60,
    instructions: existingPaper?.instructions || '',
    questions: existingPaper?.questions || [],
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: true,
      allowReview: true,
      ...existingPaper?.settings
    }
  });

  const [showPreview, setShowPreview] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState('multiple_choice');

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: currentQuestionType,
      question: '',
      options: currentQuestionType === 'multiple_choice' ? ['', '', '', ''] : [],
      correctAnswer: '',
      points: 1,
      explanation: ''
    };

    setPaperData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setPaperData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
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
  };

  const handleSave = () => {
    if (!paperData.title.trim()) {
      alert('Please enter a paper title');
      return;
    }
    if (paperData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(paperData);
  };

  const QuestionEditor = ({ question, index }) => (
    <motion.div
      className="glass-card p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Question {index + 1}
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={question.type}
            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm border border-gray-600"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="short_answer">Short Answer</option>
          </select>
          <button
            onClick={() => removeQuestion(question.id)}
            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question Text
          </label>
          <textarea
            value={question.question}
            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
            placeholder="Enter your question here..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            rows={3}
          />
        </div>

        {question.type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === option}
                    onChange={() => updateQuestion(question.id, 'correctAnswer', option)}
                    className="text-blue-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Select the radio button next to the correct answer
            </p>
          </div>
        )}

        {question.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correct Answer
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  value="true"
                  checked={question.correctAnswer === 'true'}
                  onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                  className="text-blue-600 mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  value="false"
                  checked={question.correctAnswer === 'false'}
                  onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                  className="text-blue-600 mr-2"
                />
                False
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Points
            </label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation}
            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
            placeholder="Explain the correct answer..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {existingPaper ? 'Edit Paper' : 'Create New Paper'}
            </h1>
            <p className="text-gray-400">Design your examination paper</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
            </motion.button>
            <motion.button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              <span>Save Paper</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6 transition-all duration-300`}>
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Paper Settings */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Paper Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    value={paperData.title}
                    onChange={(e) => setPaperData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter paper title"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={paperData.subject}
                    onChange={(e) => setPaperData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={paperData.duration}
                    onChange={(e) => setPaperData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="1"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={paperData.instructions}
                  onChange={(e) => setPaperData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter exam instructions..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Questions ({paperData.questions.length})
                </h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={currentQuestionType}
                    onChange={(e) => setCurrentQuestionType(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                  <motion.button
                    onClick={addQuestion}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {paperData.questions.map((question, index) => (
                  <QuestionEditor 
                    key={question.id} 
                    question={question} 
                    index={index} 
                  />
                ))}
              </AnimatePresence>

              {paperData.questions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="w-1/2 bg-gray-900/50 border-l border-gray-800 p-6"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-xl font-bold text-white">{paperData.title || 'Untitled Paper'}</h4>
                  <p className="text-gray-400">{paperData.subject || 'No subject'}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {paperData.duration} minutes
                  </div>
                </div>
                
                {paperData.instructions && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">Instructions:</h5>
                    <p className="text-gray-300 text-sm">{paperData.instructions}</p>
                  </div>
                )}

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {paperData.questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-white font-medium mb-2">
                        {index + 1}. {question.question || 'Question text...'}
                      </p>
                      {question.type === 'multiple_choice' && question.options.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-gray-300 text-sm">
                              {String.fromCharCode(65 + optIndex)}. {option || `Option ${optIndex + 1}`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaperCreator;
