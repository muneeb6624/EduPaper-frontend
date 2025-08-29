
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Clock, 
  TrendingUp, 
  Award,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetAssignedPapersQuery } from '../../features/papers/paperApi';
import { useGetStudentAttemptsQuery } from '../../features/attempts/attemptApi';

const StudentDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls with proper error handling
  const { 
    data: papersResponse, 
    isLoading: papersLoading, 
    error: papersError 
  } = useGetAssignedPapersQuery(user?._id, {
    skip: !user?._id,
  });

  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useGetStudentAttemptsQuery(user?._id, {
    skip: !user?._id,
  });

  const handleStartExam = (paper) => {
    navigate(`/exam/${paper._id}`);
  };

  const handleViewResult = (attempt) => {
    navigate(`/results/${attempt._id}`);
  };

  // Handle loading state
  if (papersLoading || attemptsLoading) {
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

  // Handle API errors
  if (papersError || attemptsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-4">
            Unable to load dashboard data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // Extract data from API responses
  const assignedPapers = papersResponse?.papers || [];
  const attempts = attemptsData || [];

  // Filter papers by status
  const availableExams = assignedPapers.filter(paper => {
    const now = new Date();
    const startTime = new Date(paper.settings?.startTime);
    const endTime = new Date(paper.settings?.endTime);
    
    return paper.status === 'active' && 
           now >= startTime && 
           now <= endTime &&
           !attempts.some(attempt => attempt.paperId === paper._id && attempt.status === 'completed');
  });

  const upcomingExams = assignedPapers.filter(paper => {
    const now = new Date();
    const startTime = new Date(paper.settings?.startTime);
    
    return paper.status === 'active' && now < startTime;
  });

  const completedAttempts = attempts.filter(attempt => attempt.status === 'completed');
  const averageScore = completedAttempts.length > 0 
    ? (completedAttempts.reduce((sum, attempt) => sum + (attempt.scoring?.percentage || 0), 0) / completedAttempts.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-400">Track your progress and take your exams</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Available Exams"
            value={availableExams.length}
            subtitle="Ready to take"
            icon={BookOpen}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Upcoming Exams"
            value={upcomingExams.length}
            subtitle="Scheduled"
            icon={Clock}
            color="from-orange-600 to-red-600"
          />
          <StatCard
            title="Completed"
            value={completedAttempts.length}
            subtitle="Exams taken"
            icon={CheckCircle}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Average Score"
            value={`${averageScore}%`}
            subtitle="Overall performance"
            icon={Award}
            color="from-purple-600 to-pink-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Available Exams */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Available Exams
                </h2>
                <motion.button
                  onClick={() => navigate("/exams")}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="space-y-4">
                {availableExams.length > 0 ? (
                  availableExams.slice(0, 4).map((paper) => (
                    <motion.div
                      key={paper._id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className="font-medium text-white truncate">{paper.title || 'Untitled Exam'}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-600/20 text-green-400 self-start">
                              Available
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2 truncate">{paper.subject || 'No subject'}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                            <span>{(paper.questions && paper.questions.length) || 0} questions</span>
                            <span>{paper.settings?.duration || 0} minutes</span>
                            <span>{paper.settings?.totalMarks || 0} marks</span>
                            {paper.settings?.endTime && (
                              <span>Ends {new Date(paper.settings.endTime).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <motion.button
                            onClick={() => handleStartExam(paper)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-4 h-4" />
                            <span className="hidden sm:inline">Start</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No exams available</p>
                    <p className="text-gray-500 text-sm">
                      Check back later for new assignments
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => navigate("/exams")}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span>Browse Exams</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/results")}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Award className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-white">View Results</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/history")}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white">Exam History</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Upcoming Exams */}
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Upcoming Exams</h3>
                {upcomingExams.length > 3 && (
                  <motion.button
                    onClick={() => navigate('/exams')}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    View All
                  </motion.button>
                )}
              </div>

              <div className="space-y-3">
                {upcomingExams.length > 0 ? (
                  upcomingExams.slice(0, 3).map((exam) => (
                    <div key={exam._id} className="p-3 bg-orange-600/10 rounded-lg border border-orange-600/20">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{exam.title || 'Untitled Exam'}</p>
                          <p className="text-orange-400 text-xs">
                            Starts {exam.settings?.startTime ? new Date(exam.settings.startTime).toLocaleDateString() : 'TBD'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {exam.settings?.duration || 'No duration set'} minutes
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-1">No upcoming exams</p>
                    <p className="text-gray-500 text-xs">
                      All caught up for now
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Results */}
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Recent Results</h3>
                {completedAttempts.length > 3 && (
                  <motion.button
                    onClick={() => navigate('/results')}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    View All
                  </motion.button>
                )}
              </div>

              <div className="space-y-3">
                {completedAttempts.length > 0 ? (
                  completedAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt._id} className="p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">
                            {attempt.paperTitle || 'Exam Result'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'Recently'}
                          </p>
                          <p className={`text-xs mt-1 ${
                            (attempt.scoring?.percentage || 0) >= 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            Score: {attempt.scoring?.percentage || 0}%
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleViewResult(attempt)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <BarChart3 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-1">No results yet</p>
                    <p className="text-gray-500 text-xs">
                      Take an exam to see your results
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div
    className="glass-card p-4 sm:p-6"
    whileHover={{ scale: 1.02, y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-gray-500 text-xs mt-1 truncate">{subtitle}</p>
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 ml-3`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default StudentDashboard;
