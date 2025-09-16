import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  FileText, 
  Users, 
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
import { useGetStudentsQuery } from '../../features/User/userApi';
import { useGetPaperAttemptsQuery } from '../../features/attempts/attemptApi';

const TeacherDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // API calls with error handling
  const { 
    data: papersResponse, 
    isLoading: papersLoading, 
    error: papersError 
  } = useGetPapersQuery(user?._id, {
    skip: !user?._id, // Skip query if no user ID
  });

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetStudentsQuery(user?._id, {
    skip: !user?._id,
  });

  const {
    data: attemptsResponse,
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useGetPaperAttemptsQuery(user?._id, {
    skip: !user?._id,
  });

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

  // Handle loading state
  if (papersLoading || studentsLoading || attemptsLoading) {
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
  if (papersError || studentsError || attemptsError) {
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
  console.log('Students Response:', studentsResponse);
  console.log('Students Error:', studentsError);
  console.log('Attempts Response:', attemptsResponse);
  console.log('Attempts Error:', attemptsError);

  // Extract data from API responses (handle empty/null responses)
  const papers = papersResponse?.papers || [];
  const students = Array.isArray(studentsResponse) ? studentsResponse : (studentsResponse?.students || []);
  const attempts = Array.isArray(attemptsResponse) ? attemptsResponse : (attemptsResponse?.attempts || []);

  // Calculate statistics
  const activeExams = Array.isArray(papers) ? papers.filter(paper => {
    const now = new Date();
    return paper.status === 'active' && paper.settings?.startTime && paper.settings?.endTime &&
           now >= new Date(paper.settings.startTime) && 
           now <= new Date(paper.settings.endTime);
  }) : [];

  const totalStudents = Array.isArray(students) ? students.length : 0;
  const totalAttempts = Array.isArray(attempts) ? attempts.filter(
    attempt => attempt.submittedAt &&
    new Date(attempt.submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length : 0;

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
            value={Array.isArray(papers) ? papers.length : 'Not Available'}
            subtitle="Created papers"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Active Exams"
            value={activeExams.length || 'Not Available'}
            subtitle="Currently running"
            icon={Clock}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Total Students"
            value={totalStudents || 'Not Available'}
            subtitle="Enrolled students"
            icon={Users}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="Recent Attempts"
            value={totalAttempts || 'Not Available'}
            subtitle="This month"
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
                {Array.isArray(papers) && papers.length > 0 ? (
                  papers.slice(0, 4).map((paper) => (
                    <motion.div
                      key={paper._id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-white">{paper.title || 'Untitled Paper'}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              paper.status === 'active' 
                                ? 'bg-green-600/20 text-green-400' 
                                : paper.status === 'draft'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-gray-600/20 text-gray-400'
                            }`}>
                              {paper.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{paper.subject || 'No subject'}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{(paper.questions && paper.questions.length) || 0} questions</span>
                            <span>Created {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : 'Unknown date'}</span>
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No papers created yet</p>
                    <p className="text-gray-500 text-sm mb-4">Create your first paper to get started</p>
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
                  onClick={() => navigate('/attempts')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-white">View Attempts</span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Active Exams</h3>
                {activeExams.length > 3 && (
                  <motion.button
                    onClick={() => navigate('/papers')}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    View All
                  </motion.button>
                )}
              </div>

              <div className="space-y-3">
                {activeExams.length > 0 ? (
                  activeExams.slice(0, 3).map((exam) => (
                    <div key={exam._id} className="p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{exam.title || 'Untitled Exam'}</p>
                          <p className="text-green-400 text-xs">Active now</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {exam.settings?.duration || 'No duration set'} minutes
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleViewPaper(exam)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-600/10 rounded-lg transition-colors"
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
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-1">No active exams</p>
                    <p className="text-gray-500 text-xs">
                      Schedule an exam to see it here
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