
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
  Settings
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';

const TeacherDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [activeExams, setActiveExams] = useState([]);
  const [pendingGrading, setPendingGrading] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setPapers([
        {
          id: 1,
          title: 'Mathematics Midterm 2024',
          subject: 'Mathematics',
          questions: 50,
          duration: 120,
          students: 45,
          status: 'active',
          createdAt: '2024-02-01T10:00:00Z',
          deadline: '2024-02-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Algebra Quiz Chapter 5',
          subject: 'Mathematics',
          questions: 20,
          duration: 60,
          students: 42,
          status: 'draft',
          createdAt: '2024-02-05T14:30:00Z',
          deadline: '2024-02-20T14:00:00Z'
        }
      ]);

      setActiveExams([
        {
          id: 1,
          title: 'Physics Lab Test',
          studentsAttempted: 28,
          totalStudents: 35,
          averageScore: 78.5,
          timeLeft: '2 days',
          status: 'ongoing'
        }
      ]);

      setPendingGrading([
        {
          id: 1,
          studentName: 'John Doe',
          examTitle: 'Mathematics Midterm',
          submittedAt: '2024-02-12T15:30:00Z',
          timeSpent: 115,
          status: 'pending'
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          examTitle: 'Mathematics Midterm',
          submittedAt: '2024-02-12T16:45:00Z',
          timeSpent: 118,
          status: 'pending'
        }
      ]);

      setRecentActivity([
        {
          id: 1,
          type: 'submission',
          message: '5 new submissions for Mathematics Midterm',
          time: '2 hours ago'
        },
        {
          id: 2,
          type: 'completion',
          message: 'Physics Quiz grading completed',
          time: '1 day ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

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
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
                {paper.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{paper.subject}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.questions}</p>
            <p className="text-xs text-gray-400">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.duration}</p>
            <p className="text-xs text-gray-400">Minutes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{paper.students}</p>
            <p className="text-xs text-gray-400">Students</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due: {new Date(paper.deadline).toLocaleDateString()}
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

  const GradingCard = ({ item, onGrade }) => (
    <motion.div
      className="glass-card p-4 hover:border-orange-500/50"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium">{item.studentName}</h4>
          <p className="text-gray-400 text-sm">{item.examTitle}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            Submitted {new Date(item.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Time: {item.timeSpent}m</p>
          </div>
          <motion.button
            onClick={() => onGrade(item)}
            className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Grade
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const handleCreatePaper = () => {
    console.log('Creating new paper...');
  };

  const handleEditPaper = (paper) => {
    console.log('Editing paper:', paper);
  };

  const handleViewPaper = (paper) => {
    console.log('Viewing paper:', paper);
  };

  const handlePaperSettings = (paper) => {
    console.log('Paper settings:', paper);
  };

  const handleGradeSubmission = (item) => {
    console.log('Grading submission:', item);
  };

  if (loading) {
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
              Welcome back, {user?.name}!
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
          />
          <StatCard
            title="Active Exams"
            value={activeExams.length}
            subtitle="Currently running"
            icon={Clock}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Pending Grading"
            value={pendingGrading.length}
            subtitle="Need attention"
            icon={GraduationCap}
            color="from-orange-600 to-red-600"
          />
          <StatCard
            title="Total Students"
            value="124"
            subtitle="Across all papers"
            icon={Users}
            color="from-purple-600 to-pink-600"
            trend="8.1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Papers */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Papers</h2>
              <motion.button
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                View all
              </motion.button>
            </div>
            
            <div className="grid gap-6">
              <AnimatePresence>
                {papers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
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
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Pending Grading */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Pending Grading</h2>
              <div className="flex items-center text-orange-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">{pendingGrading.length} pending</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {pendingGrading.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GradingCard item={item} onGrade={handleGradeSubmission} />
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'submission' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
