
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  UserPlus,
  Send
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetTeacherPapersQuery } from '../../features/papers/paperApi';
import { useGetStudentsQuery } from '../../features/User/userApi';
import { useGetPaperAttemptsQuery } from '../../features/attempts/attemptApi';

const TeacherDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // API calls with proper error handling
  const { 
    data: papersResponse, 
    isLoading: papersLoading, 
    error: papersError 
  } = useGetTeacherPapersQuery();

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetStudentsQuery();

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

  const handleAssignPaper = (paper) => {
    setSelectedPaper(paper);
    setShowAssignModal(true);
  };

  // Handle loading state
  if (papersLoading || studentsLoading) {
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
  if (papersError || studentsError) {
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
  const papers = papersResponse?.papers || [];
  const students = studentsData || [];

  // Calculate statistics
  const activeExams = papers.filter(paper => paper.status === 'active');
  const totalStudents = students.length;
  const recentAttempts = 0; // Will be calculated from attempts data

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Teacher'}!
            </h1>
            <p className="text-gray-400">Manage your papers and track student progress</p>
          </div>
          <motion.button
            onClick={handleCreatePaper}
            className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Paper</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
            subtitle="Available students"
            icon={Users}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="Recent Attempts"
            value={recentAttempts}
            subtitle="This month"
            icon={CheckCircle}
            color="from-orange-600 to-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* My Papers */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">My Papers</h2>
                <motion.button
                  onClick={() => navigate('/papers')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="space-y-4">
                {papers.length > 0 ? (
                  papers.slice(0, 4).map((paper) => (
                    <motion.div
                      key={paper._id}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className="font-medium text-white truncate">{paper.title || 'Untitled Paper'}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full self-start ${
                              paper.status === 'active' 
                                ? 'bg-green-600/20 text-green-400' 
                                : paper.status === 'draft'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-gray-600/20 text-gray-400'
                            }`}>
                              {paper.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2 truncate">{paper.subject || 'No subject'}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                            <span>{(paper.questions && paper.questions.length) || 0} questions</span>
                            <span>Created {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                            <span>{paper.assignedTo?.length || 0} students assigned</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <motion.button
                            onClick={() => handleAssignPaper(paper)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Assign to Students"
                          >
                            <UserPlus className="w-4 h-4" />
                          </motion.button>
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
                            onClick={() => handlePaperSettings(paper)}
                            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Paper Settings"
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

          {/* Quick Actions & Active Exams */}
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
                  onClick={handleCreatePaper}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span>Create New Paper</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/papers')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white">Manage Papers</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/attempts')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-white">View Attempts</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate('/analytics')}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-white">View Analytics</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Active Exams */}
            <motion.div
              className="glass-card p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Active Exams</h3>
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
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{exam.title || 'Untitled Exam'}</p>
                          <p className="text-green-400 text-xs">Active now</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {exam.settings?.duration || 'No duration set'} minutes
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleViewPaper(exam)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-600/10 rounded-lg transition-colors flex-shrink-0"
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

      {/* Assignment Modal */}
      <AssignmentModal 
        paper={selectedPaper}
        students={students}
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPaper(null);
        }}
      />
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ paper, students, isOpen, onClose }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsAssigning(true);
    try {
      // API call to assign paper to students
      console.log('Assigning paper', paper?._id, 'to students', selectedStudents);
      // await assignPaper({ paperId: paper._id, studentIds: selectedStudents });
      onClose();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Assign Paper: {paper?.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            <div className="space-y-2">
              {students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentToggle(student._id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{student.name}</p>
                      <p className="text-gray-400 text-xs">{student.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No students available</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedStudents.length === 0 || isAssigning}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAssigning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Assign ({selectedStudents.length})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

export default TeacherDashboard;
