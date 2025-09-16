import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Plus,
  FileText,
  Edit,
  Eye,
  Trash2,
  Settings,
  Users,
  Clock,
  Calendar,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery, useDeletePaperMutation } from '../../features/papers/paperApi';

const PapersPage = () => {
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

  const [deletePaper] = useDeletePaperMutation();

  const papers = papersResponse?.papers || [];

  // Filter papers based on search and status
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const startTime = paper.settings?.startTime ? new Date(paper.settings.startTime) : null;
    const endTime = paper.settings?.endTime ? new Date(paper.settings.endTime) : null;

    switch (filterStatus) {
      case 'active':
        return startTime && endTime && now >= startTime && now <= endTime;
      case 'upcoming':
        return startTime && now < startTime;
      case 'completed':
        return endTime && now > endTime;
      case 'draft':
        return !paper.settings?.isPublished;
      default:
        return true;
    }
  });

  const getPaperStatus = (paper) => {
    if (!paper.settings?.isPublished) return { status: 'draft', color: 'gray' };
    
    const now = new Date();
    const startTime = paper.settings?.startTime ? new Date(paper.settings.startTime) : null;
    const endTime = paper.settings?.endTime ? new Date(paper.settings.endTime) : null;

    if (!startTime || !endTime) return { status: 'draft', color: 'gray' };

    if (now < startTime) return { status: 'upcoming', color: 'blue' };
    if (now >= startTime && now <= endTime) return { status: 'active', color: 'green' };
    return { status: 'completed', color: 'red' };
  };

  const handleCreatePaper = () => {
    navigate('/papers/create');
  };

  const handleEditPaper = (paper) => {
    navigate(`/papers/${paper._id}/edit`);
  };

  const handleViewPaper = (paper) => {
    navigate(`/papers/${paper._id}`);
  };

  const handleDeletePaper = async (paper) => {
    if (window.confirm(`Are you sure you want to delete "${paper.title}"?`)) {
      try {
        await deletePaper(paper._id).unwrap();
      } catch (error) {
        console.error('Error deleting paper:', error);
        alert('Failed to delete paper. Please try again.');
      }
    }
  };

  const handleAssignStudents = (paper) => {
    navigate(`/papers/${paper._id}/assign`);
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
          <p className="text-gray-400">Loading your papers...</p>
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
            Unable to load papers
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Papers</h1>
            <p className="text-gray-400">
              Create, manage, and track your examination papers
            </p>
          </div>
          <motion.button
            onClick={handleCreatePaper}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Paper</span>
          </motion.button>
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
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => {
              const paperStatus = getPaperStatus(paper);
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
                        paperStatus.color === 'green'
                          ? 'bg-green-600/20 text-green-400'
                          : paperStatus.color === 'blue'
                          ? 'bg-blue-600/20 text-blue-400'
                          : paperStatus.color === 'red'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {paperStatus.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300 text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Questions: {paper.questions?.length || 0}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: {paper.settings?.duration || 60} minutes
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      Assigned: {paper.assignedTo?.length || 0} students
                    </div>
                    {paper.settings?.startTime && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Start: {new Date(paper.settings.startTime).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(paper.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleViewPaper(paper)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Paper"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditPaper(paper)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-600/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Paper"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleAssignStudents(paper)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Assign Students"
                      >
                        <Users className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeletePaper(paper)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Paper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No papers found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first paper to get started'}
              </p>
              <motion.button
                onClick={handleCreatePaper}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Create Your First Paper
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PapersPage;