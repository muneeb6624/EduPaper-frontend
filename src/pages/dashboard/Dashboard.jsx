
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const renderDashboardContent = () => {
    // If we have children (nested routes), render them
    if (children) {
      return children;
    }

    // Otherwise render role-specific dashboard
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
        }}
        className={`fixed left-0 top-0 z-50 h-full w-80 bg-gray-900/90 backdrop-blur-md border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EP</span>
              </div>
              <span className="text-xl font-bold text-white">EduPaper</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 mt-2 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {navigationItems.find(item => location.pathname === item.path)?.label || 'Dashboard'}
            </h1>
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value="1,234"
            subtitle="Active users"
            icon={Users}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Total Papers"
            value="567"
            subtitle="All papers"
            icon={FileText}
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            title="Active Exams"
            value="89"
            subtitle="Currently running"
            icon={Clock}
            color="from-purple-600 to-pink-600"
          />
          <StatCard
            title="System Health"
            value="99.9%"
            subtitle="Uptime"
            icon={BarChart3}
            color="from-orange-600 to-red-600"
          />
        </div>
      </div>
    </div>
  );
};

// Default Dashboard Content
const DefaultDashboardContent = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-slate-300">Please check your user role configuration</p>
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
