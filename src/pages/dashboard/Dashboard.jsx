/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  User,
  Bell
} from 'lucide-react';
import { selectCurrentUser, selectUserRole, logout } from '../../features/auth/authSlice';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login'); 
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    ];

    switch (userRole) {
      case 'student':
        return [
          ...common,
          { id: 'exams', label: 'Available Exams', icon: FileText, path: '/exams' },
          { id: 'results', label: 'My Results', icon: Award, path: '/results' },
          { id: 'history', label: 'Exam History', icon: Clock, path: '/history' },
        ];

      case 'teacher':
        return [
          ...common,
          { id: 'papers', label: 'My Papers', icon: FileText, path: '/papers' },
          { id: 'create', label: 'Create Paper', icon: BookOpen, path: '/papers/create' },
          { id: 'grading', label: 'Grading', icon: GraduationCap, path: '/grading' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
        ];

      case 'admin':
        return [
          ...common,
          { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
          { id: 'papers', label: 'All Papers', icon: FileText, path: '/admin/papers' },
          { id: 'analytics', label: 'System Analytics', icon: BarChart3, path: '/admin/analytics' },
          { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
        ];

      default:
        return common;
    }
  };

  const navigationItems = getNavigationItems();

  const renderDashboardContent = () => {
    if (children) {
      return children;
    }

    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'admin':
        return <AdminDashboardContent />;
      default:
        return <DefaultDashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 z-50 w-72 h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 lg:translate-x-0 lg:static lg:z-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EduPaper
                </h1>
                <p className="text-xs text-gray-400 capitalize">{userRole} Portal</p>
              </div>
            </motion.div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <motion.button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                        // navigate(item.path);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-400">
                  Welcome back, {user?.name}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            {renderDashboardContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Admin Dashboard Content
const AdminDashboardContent = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="1,234"
            subtitle="Students & Teachers"
            icon={Users}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Total Papers"
            value="89"
            subtitle="All papers"
            icon={FileText}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Active Exams"
            value="12"
            subtitle="Currently running"
            icon={Clock}
            color="from-orange-600 to-red-600"
          />
          <StatCard
            title="System Health"
            value="98%"
            subtitle="Uptime"
            icon={BarChart3}
            color="from-purple-600 to-pink-600"
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4">System Overview</h4>
          <div className="text-center text-gray-400">
            <p>Admin dashboard content coming soon...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Default Dashboard Content
const DefaultDashboardContent = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-slate-300">Loading...</p>
      </div>
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

export default Dashboard;