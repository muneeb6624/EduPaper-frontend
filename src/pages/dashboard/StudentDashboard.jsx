import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  FileText, 
  Award, 
  Clock, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';
import { useGetStudentResultsQuery } from '../../features/results/resultApi';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls
  const { data: papersResponse, isLoading: papersLoading, error: papersError } = useGetPapersQuery();
  const { data: resultsResponse, isLoading: resultsLoading, error: resultsError } = useGetStudentResultsQuery(user?._id, {
    skip: !user?._id
  });

  const papers = papersResponse?.papers || [];
  const results = resultsResponse || [];

  // Calculate statistics
  const availableExams = papers.filter(paper => {
    const now = new Date();
    return paper.settings?.startTime && paper.settings?.endTime && 
           now >= new Date(paper.settings.startTime) && 
           now <= new Date(paper.settings.endTime);
  });

  const completedExams = results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
    : 0;

  const recentResults = results.slice(0, 3);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
      className="glass-card p-6"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-xs">+{trend}% this month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ExamCard = ({ exam, onStartExam }) => {
    const timeLeft = exam.settings?.endTime ? new Date(exam.settings.endTime) - new Date() : 0;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const isUrgent = hoursLeft < 24 && hoursLeft > 0;
    const isExpired = timeLeft <= 0;

    return (
      <motion.div
        className="glass-card p-6 hover:border-blue-500/50"
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{exam.title}</h3>
            <p className="text-gray-400 text-sm">{exam.subject}</p>
          </div>
          {isUrgent && (
            <div className="flex items-center text-orange-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">Urgent</span>
            </div>
          )}
          {isExpired && (
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">Expired</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">{exam.settings?.duration || 'N/A'} min</span>
          </div>
          <div className="flex items-center text-gray-400">
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-sm">{exam.questions?.length || 0} questions</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due: {exam.settings?.endTime ? new Date(exam.settings.endTime).toLocaleDateString() : 'N/A'}
          </div>
          <motion.button
            onClick={() => onStartExam(exam)}
            disabled={isExpired}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isExpired 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            }`}
            whileHover={{ scale: isExpired ? 1 : 1.05 }}
            whileTap={{ scale: isExpired ? 1 : 0.95 }}
          >
            <Play className="w-4 h-4" />
            <span>{isExpired ? 'Expired' : 'Start'}</span>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const ResultCard = ({ result }) => (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium">{result.paperId?.title || 'Exam'}</h4>
          <p className="text-gray-400 text-sm">
            {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-white font-bold">{result.obtainedMarks}/{result.totalMarks}</p>
            <p className={`text-sm font-medium ${
              result.percentage >= 90 ? 'text-green-400' : 
              result.percentage >= 80 ? 'text-blue-400' : 
              result.percentage >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {result.percentage}%
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
      </div>
    </motion.div>
  );

  const handleStartExam = (exam) => {
    navigate(`/exam/${exam._id}`);
  };

  if (papersLoading || resultsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (papersError || resultsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-400">Track your progress and take your exams</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Exams"
            value={availableExams.length}
            subtitle="Ready to take"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Completed Exams"
            value={completedExams}
            subtitle="This semester"
            icon={CheckCircle}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Average Score"
            value={`${averageScore}%`}
            subtitle="All time"
            icon={Target}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="Total Papers"
            value={papers.length}
            subtitle="Assigned to you"
            icon={Award}
            color="from-orange-600 to-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Exams */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Available Exams</h2>
              <motion.button
                onClick={() => navigate('/exams')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                View all
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {availableExams.length > 0 ? (
                  availableExams.map((exam, index) => (
                    <motion.div
                      key={exam._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ExamCard exam={exam} onStartExam={handleStartExam} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-8 text-center"
                  >
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Exams</h3>
                    <p className="text-gray-400">Check back later for new assignments</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Results</h2>
              <motion.button
                onClick={() => navigate('/results')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                View all
              </motion.button>
            </div>

            <div className="space-y-4">
              {recentResults.length > 0 ? (
                recentResults.map((result, index) => (
                  <motion.div
                    key={result._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ResultCard result={result} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-6 text-center"
                >
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No results yet</p>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              className="glass-card p-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => navigate('/exams')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Browse Exams</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/results')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-white">View All Results</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;