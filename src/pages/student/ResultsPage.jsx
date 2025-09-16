import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetStudentResultsQuery } from '../../features/results/resultApi';

const ResultsPage = () => {
  const user = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  const {
    data: resultsResponse,
    isLoading,
    error,
  } = useGetStudentResultsQuery(user?._id, {
    skip: !user?._id,
  });

  const results = Array.isArray(resultsResponse) ? resultsResponse : (resultsResponse?.results || []);
  
  // Filter results based on search and grade
  const filteredResults = results.filter((result) => {
    const paperTitle = result.paperId?.title || result.paperTitle || '';
    const paperSubject = result.paperId?.subject || result.subject || '';
    
    const matchesSearch = searchTerm === '' || 
                         paperTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paperSubject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterGrade) {
      case 'excellent':
        return result.percentage >= 90;
      case 'good':
        return result.percentage >= 70 && result.percentage < 90;
      case 'average':
        return result.percentage >= 50 && result.percentage < 70;
      case 'poor':
        return result.percentage < 50;
      default:
        return true;
    }
  });

  // Debug logging (after filteredResults is defined)
  console.log('🏆 Results API Response:', resultsResponse);
  console.log('📊 Processed Results:', results);
  console.log('👤 Current User:', user);
  console.log('🔍 Search Term:', searchTerm);
  console.log('📋 Filtered Results:', filteredResults);
  console.log('📝 Filter Grade:', filterGrade);

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400', bgColor: 'bg-green-600/20' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400', bgColor: 'bg-green-600/20' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-400', bgColor: 'bg-blue-600/20' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-400', bgColor: 'bg-orange-600/20' };
    return { grade: 'F', color: 'text-red-400', bgColor: 'bg-red-600/20' };
  };

  const calculateStats = () => {
    if (results.length === 0) return { average: 0, highest: 0, lowest: 0, passed: 0 };
    
    const scores = results.map(r => r.percentage || 0);
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = results.filter(r => r.isPassed).length;
    
    return { average, highest, lowest, passed };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your results...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to load results
          </h2>
          <p className="text-gray-400 mb-4">
            Please check your connection and try again.
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
          <h1 className="text-3xl font-bold text-white mb-2">My Results</h1>
          <p className="text-gray-400">
            Track your exam performance and progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Average Score"
            value={`${stats.average}%`}
            subtitle="Overall performance"
            icon={Target}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Highest Score"
            value={`${stats.highest}%`}
            subtitle="Best performance"
            icon={TrendingUp}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Exams Passed"
            value={`${stats.passed}/${results.length}`}
            subtitle="Success rate"
            icon={CheckCircle}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="Total Exams"
            value={results.length}
            subtitle="Completed"
            icon={BookOpen}
            color="from-orange-600 to-red-600"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (70-89%)</option>
              <option value="average">Average (50-69%)</option>
              <option value="poor">Poor (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => {
              const gradeInfo = getGradeInfo(result.percentage || 0);
              return (
                <motion.div
                  key={result._id || index}
                  className="glass-card p-6 hover:border-gray-500/50 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {result.paperId?.title || result.paperTitle || 'Unknown Paper'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {result.paperId?.subject || result.subject || 'No subject'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                            {gradeInfo.grade}
                          </span>
                          {result.isPassed ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-300">
                          <Target className="w-4 h-4 mr-2" />
                          Score: {result.obtainedMarks || 0}/{result.totalMarks || 0}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Award className="w-4 h-4 mr-2" />
                          Percentage: {result.percentage || 0}%
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          Date: {result.attemptId?.submitTime ? new Date(result.attemptId.submitTime).toLocaleDateString() : 
                                result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          Time: {result.attemptId?.timeSpent || result.timeSpent || 0} min
                        </div>
                      </div>

                      {result.feedback && (
                        <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            <strong>Feedback:</strong> {result.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${gradeInfo.color}`}>
                          {result.percentage || 0}%
                        </div>
                        <div className="text-gray-400 text-sm">
                          {result.isPassed ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                      
                      {result.rank && (
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Rank</div>
                          <div className="text-lg font-semibold text-yellow-400">
                            #{result.rank}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterGrade !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Complete some exams to see your results here'}
              </p>
            </div>
          )}
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

export default ResultsPage;