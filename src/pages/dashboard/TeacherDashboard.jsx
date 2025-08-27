
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  Eye,
  Edit,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';

const TeacherDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls
  const { 
    data: papersResponse, 
    isLoading: papersLoading, 
    error: papersError 
  } = useGetPapersQuery();

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

  // Use mock data if API fails or returns empty
  const papers = papersResponse?.papers || [
    {
      _id: '1',
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      questions: Array(20).fill({}),
      status: 'active',
      createdAt: new Date().toISOString(),
      settings: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 120
      }
    },
    {
      _id: '2',
      title: 'Science Quiz',
      subject: 'Science',
      questions: Array(15).fill({}),
      status: 'draft',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      settings: {
        duration: 60
      }
    }
  ];

  const activeExams = papers.filter(paper => {
    const now = new Date();
    return paper.status === 'active' && paper.settings?.startTime && paper.settings?.endTime &&
           now >= new Date(paper.settings.startTime) && 
           now <= new Date(paper.settings.endTime);
  });

  const totalStudents = 45; // Mock data
  const totalSubmissions = 23; // Mock data

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={papers.length}
            subtitle="Created papers"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Active Exams"
            value={activeExams.length}
            subtitle="Currently running"
            icon={Clock}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtitle="Enrolled students"
            icon={Users}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="Submissions"
            value={totalSubmissions}
            subtitle="Recent submissions"
            icon={CheckCircle}
            color="from-orange-600 to-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Papers */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">My Papers</h2>
                <motion.button
                  onClick={() => navigate('/papers')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="space-y-4">
                {papers.slice(0, 4).map((paper) => (
                  <motion.div
                    key={paper._id}
                    className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">{paper.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            paper.status === 'active' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {paper.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{paper.subject}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{paper.questions?.length || 0} questions</span>
                          <span>Created {new Date(paper.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => handleViewPaper(paper)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleEditPaper(paper)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-600/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handlePaperSettings(paper)}
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Settings className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {papers.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No papers created yet</p>
                    <motion.button
                      onClick={handleCreatePaper}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      Create Your First Paper
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={handleCreatePaper}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Paper</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/papers')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-white">Manage Papers</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/grading')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-white">Grade Submissions</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/analytics')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                  <span className="text-white">View Analytics</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Active Exams */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Active Exams</h3>
              <div className="space-y-3">
                {activeExams.slice(0, 3).map((exam) => (
                  <div key={exam._id} className="p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                    <p className="text-white text-sm font-medium">{exam.title}</p>
                    <p className="text-green-400 text-xs">Active now</p>
                  </div>
                ))}

                {activeExams.length === 0 && (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No active exams</p>
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
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default TeacherDashboard;
