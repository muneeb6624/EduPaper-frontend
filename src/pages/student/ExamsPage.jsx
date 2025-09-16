import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Play,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';

const ExamsPage = () => {
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

  // Debug logging
  console.log('👤 Student User:', user);
  console.log('📋 Available Papers:', papersResponse);
  console.log('📝 Papers Array:', papers);
  console.log('❌ Papers Error:', error);

  // Filter papers based on search and status
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const startTime = paper.settings?.startTime ? new Date(paper.settings.startTime) : null;
    const endTime = paper.settings?.endTime ? new Date(paper.settings.endTime) : null;

    switch (filterStatus) {
      case 'available':
        return startTime && endTime && now >= startTime && now <= endTime;
      case 'upcoming':
        return startTime && now < startTime;
      case 'completed':
        return endTime && now > endTime;
      default:
        return true;
    }
  });

  const getExamStatus = (paper) => {
    const now = new Date();
    const startTime = paper.settings?.startTime ? new Date(paper.settings.startTime) : null;
    const endTime = paper.settings?.endTime ? new Date(paper.settings.endTime) : null;

    if (!startTime || !endTime) return { status: 'draft', color: 'gray' };

    if (now < startTime) return { status: 'upcoming', color: 'blue' };
    if (now >= startTime && now <= endTime) return { status: 'available', color: 'green' };
    return { status: 'completed', color: 'red' };
  };

  const handleStartExam = (paper) => {
    navigate(`/exam/${paper._id}`);
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
          <p className="text-gray-400">Loading exams...</p>
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
            Unable to load exams
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
          <h1 className="text-3xl font-bold text-white mb-2">Available Exams</h1>
          <p className="text-gray-400">
            Browse and take your assigned examinations
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exams..."
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
              <option value="all">All Exams</option>
              <option value="available">Available Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => {
              const examStatus = getExamStatus(paper);
              return (
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        examStatus.color === 'green'
                          ? 'bg-green-600/20 text-green-400'
                          : examStatus.color === 'blue'
                          ? 'bg-blue-600/20 text-blue-400'
                          : examStatus.color === 'red'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {examStatus.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: {paper.settings?.duration || 60} minutes
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Questions: {paper.questions?.length || 0}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      Total Marks: {paper.settings?.totalMarks || 0}
                    </div>
                    {paper.settings?.startTime && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Start: {new Date(paper.settings.startTime).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Max Attempts: {paper.settings?.maxAttempts || 1}
                    </div>
                    <motion.button
                      onClick={() => handleStartExam(paper)}
                      disabled={examStatus.status !== 'available'}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        examStatus.status === 'available'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={examStatus.status === 'available' ? { scale: 1.05 } : {}}
                      whileTap={examStatus.status === 'available' ? { scale: 0.95 } : {}}
                    >
                      {examStatus.status === 'available' ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Exam</span>
                        </>
                      ) : examStatus.status === 'upcoming' ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Upcoming</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No exams found
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No exams have been assigned to you yet'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ExamsPage;