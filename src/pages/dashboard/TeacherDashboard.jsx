import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  FileText,
  Users,
  BarChart3,
  Plus,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  TrendingUp,
  Calendar,
  Settings,
  BookOpen // Import BookOpen if it's used elsewhere and not already imported
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls
  const { data: papersResponse, isLoading: papersLoading, error: papersError } = useGetPapersQuery();

  const papers = papersResponse?.papers || [];

  // Calculate statistics
  const activeExams = papers.filter(paper => {
    const now = new Date();
    return paper.settings?.startTime && paper.settings?.endTime &&
           now >= new Date(paper.settings.startTime) &&
           now <= new Date(paper.settings.endTime);
  });

  const totalStudents = papers.reduce((sum, paper) => sum + (paper.assignedTo?.length || 0), 0);
  const draftPapers = papers.filter(paper => paper.status === 'draft');

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
    <motion.div
      className="glass-card p-6 cursor-pointer"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
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

  const PaperCard = ({ paper, onEdit, onView, onSettings }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'text-green-400 bg-green-400/10';
        case 'draft': return 'text-yellow-400 bg-yellow-400/10';
        case 'completed': return 'text-blue-400 bg-blue-400/10';
        default: return 'text-gray-400 bg-gray-400/10';
      }
    };

    const isActive = () => {
      if (!paper.settings?.startTime || !paper.settings?.endTime) return false;
      const now = new Date();
      return now >= new Date(paper.settings.startTime) && now <= new Date(paper.settings.endTime);
    };

    const status = isActive() ? 'active' : (paper.status || 'draft');

    return (
      <motion.div
        className="glass-card p-6 hover:border-blue-500/50"
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{paper.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{paper.subject}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.questions?.length || 0}</p>
            <p className="text-xs text-gray-400">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.settings?.duration || 'N/A'}</p>
            <p className="text-xs text-gray-400">Minutes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.assignedTo?.length || 0}</p>
            <p className="text-xs text-gray-400">Students</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            {paper.settings?.endTime
              ? `Due: ${new Date(paper.settings.endTime).toLocaleDateString()}`
              : 'No deadline set'
            }
          </div>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => onView(paper)}
              className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onEdit(paper)}
              className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onSettings(paper)}
              className="p-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
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

  const handlePaperSettings = (paper) => {
    navigate(`/papers/${paper._id}/settings`);
  };

  // Removed mock data and useEffect hook for API data fetching
  // const [papers, setPapers] = useState([]);
  // const [activeExams, setActiveExams] = useState([]);
  // const [pendingGrading, setPendingGrading] = useState([]);
  // const [recentActivity, setRecentActivity] = useState([]);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => { ... mock data ... }, []);

  if (papersLoading) {
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

  if (papersError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Removed pendingGrading and recentActivity mock data and rendering logic

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
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Teacher'}!
            </h1>
            <p className="text-gray-400">Manage your papers and track student progress</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Papers"
            value={papers.length}
            subtitle="Total created"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
            onClick={() => navigate('/papers')}
          />
          <StatCard
            title="Active Exams"
            value={activeExams.length}
            subtitle="Currently running"
            icon={Clock}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Draft Papers"
            value={draftPapers.length}
            subtitle="Need completion"
            icon={AlertCircle}
            color="from-orange-600 to-red-600"
          />
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtitle="Across all papers"
            icon={Users}
            color="from-purple-600 to-pink-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* My Papers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Papers</h2>
              <motion.button
                onClick={() => navigate('/papers')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                View all
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {papers.length > 0 ? (
                  papers.slice(0, 6).map((paper, index) => (
                    <motion.div
                      key={paper._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PaperCard
                        paper={paper}
                        onEdit={handleEditPaper}
                        onView={handleViewPaper}
                        onSettings={handlePaperSettings}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full glass-card p-12 text-center"
                  >
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Papers Created Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first paper to get started</p>
                    <motion.button
                      onClick={handleCreatePaper}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Your First Paper
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;