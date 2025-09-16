import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';

const GradingPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const {
    data: papersResponse,
    isLoading,
    error,
  } = useGetPapersQuery(user?._id, {
    skip: !user?._id,
  });

  const papers = papersResponse?.papers || [];

  // Filter papers that have attempts to grade
  const papersWithAttempts = papers.filter(paper => {
    // In a real app, you'd fetch attempt counts from API
    return paper.assignedTo && paper.assignedTo.length > 0;
  });

  const filteredPapers = papersWithAttempts.filter((paper) => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewAttempts = (paper) => {
    navigate(`/papers/${paper._id}/attempts`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading grading queue...</p>
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
            Unable to load grading queue
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
          <h1 className="text-3xl font-bold text-white mb-2">Grading Queue</h1>
          <p className="text-gray-400">
            Review and grade student submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Papers to Grade"
            value={filteredPapers.length}
            subtitle="Active papers"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Pending Reviews"
            value="12"
            subtitle="Awaiting grading"
            icon={Clock}
            color="from-orange-600 to-red-600"
          />
          <StatCard
            title="Completed Today"
            value="8"
            subtitle="Graded submissions"
            icon={CheckCircle}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Average Time"
            value="5 min"
            subtitle="Per submission"
            icon={GraduationCap}
            color="from-purple-600 to-pink-600"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Papers</option>
              <option value="pending">Pending Grading</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => (
              <motion.div
                key={paper._id}
                className="glass-card p-6 hover:border-gray-500/50 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {paper.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{paper.subject}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-orange-600/20 text-orange-400">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Students: {paper.assignedTo?.length || 0}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Questions: {paper.questions?.length || 0}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration: {paper.settings?.duration || 60} minutes
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Total Marks: {paper.settings?.totalMarks || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(paper.createdAt).toLocaleDateString()}
                  </div>
                  <motion.button
                    onClick={() => handleViewAttempts(paper)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Attempts</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No papers to grade
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? 'No papers match your search criteria'
                  : 'All submissions have been graded'}
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

export default GradingPage;