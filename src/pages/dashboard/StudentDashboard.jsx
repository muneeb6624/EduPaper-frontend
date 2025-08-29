import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Award,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetPapersQuery } from "../../features/papers/paperApi";
import { useGetStudentResultsQuery } from "../../features/results/resultApi";

const StudentDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls with error handling
  const {
    data: papersResponse,
    isLoading: papersLoading,
    error: papersError,
  } = useGetPapersQuery(user?._id, {
    skip: !user?._id, // Skip query if no user ID
  });

  const {
    data: resultsResponse,
    isLoading: resultsLoading,
    error: resultsError,
  } = useGetStudentResultsQuery(user?._id, {
    skip: !user?._id, // Skip query if no user ID
  });

  // Handle loading state
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

  // Handle API errors
  if (papersError || resultsError) {
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

  // Debug: Log API responses and errors
  console.log('User:', user);
  console.log('Papers Response:', papersResponse);
  console.log('Papers Error:', papersError);
  console.log('Results Response:', resultsResponse);
  console.log('Results Error:', resultsError);

  // Extract data from API responses (handle empty/null responses)
  const papers = papersResponse?.papers || [];
  const results = Array.isArray(resultsResponse) ? resultsResponse : (resultsResponse?.results || []);

  // Calculate statistics
  const availableExams = Array.isArray(papers) ? papers.filter((paper) => {
    const now = new Date();
    return (
      paper.settings?.startTime &&
      paper.settings?.endTime &&
      now >= new Date(paper.settings.startTime) &&
      now <= new Date(paper.settings.endTime)
    );
  }) : [];

  const completedExams = Array.isArray(results) ? results.length : 0;
  const averageScore = Array.isArray(results) && results.length > 0
    ? Math.round(
        results.reduce((sum, result) => sum + (result.percentage || 0), 0) /
          results.length
      )
    : 0;

  const recentResults = Array.isArray(results) ? results.slice(0, 3) : [];

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
            Welcome back, {user?.name || "Student"}!
          </h1>
          <p className="text-gray-400">
            Track your progress and take your exams
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Exams"
            value={availableExams.length}
            subtitle="Ready to take"
            icon={BookOpen}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Completed"
            value={completedExams}
            subtitle="Exams finished"
            icon={CheckCircle}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Average Score"
            value={`${averageScore}%`}
            subtitle="Overall performance"
            icon={Target}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="This Month"
            value={
              Array.isArray(results) ? results.filter(
                (r) =>
                  r.submittedAt && new Date(r.submittedAt) >
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length : 0
            }
            subtitle="Exams taken"
            icon={TrendingUp}
            color="from-orange-600 to-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Exams */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
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
                  availableExams.slice(0, 3).map((exam) => (
                    <motion.div
                      key={exam._id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white mb-1">
                            {exam.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{exam.subject}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {exam.settings?.duration || 60} minutes
                          </div>
                        </div>
                        <motion.button
                          onClick={() => navigate(`/exam/${exam._id}`)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Start
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">
                      No exams available at the moment
                    </p>
                    <p className="text-gray-500 text-sm">
                      Check back later for new exams
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Results & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Results */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Results
                </h3>
                <motion.button
                  onClick={() => navigate("/results")}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="space-y-3">
                {recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {result.paperTitle || 'Unknown Paper'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {result.submittedAt 
                            ? new Date(result.submittedAt).toLocaleDateString()
                            : 'Unknown date'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            (result.percentage || 0) >= 80
                              ? "text-green-400"
                              : (result.percentage || 0) >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {result.percentage || 0}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-1">No results yet</p>
                    <p className="text-gray-500 text-xs">
                      Complete an exam to see your results
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => navigate("/exams")}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Browse Exams</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/results")}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-white">View All Results</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/history")}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-white">Exam History</span>
                </motion.button>
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
      </div>
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default StudentDashboard;