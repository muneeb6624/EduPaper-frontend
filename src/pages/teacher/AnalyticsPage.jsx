import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Clock,
  Target,
  FileText,
  Calendar,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPapersQuery } from '../../features/papers/paperApi';

const AnalyticsPage = () => {
  const user = useSelector(selectCurrentUser);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const {
    data: papersResponse,
    isLoading,
  } = useGetPapersQuery(user?._id, {
    skip: !user?._id,
  });

  const papers = papersResponse?.papers || [];

  // Mock analytics data - in real app, fetch from API
  const analyticsData = {
    totalPapers: papers.length,
    totalStudents: papers.reduce((sum, paper) => sum + (paper.assignedTo?.length || 0), 0),
    totalAttempts: 45,
    averageScore: 78.5,
    completionRate: 92.3,
    topPerformers: [
      { name: 'Alice Johnson', score: 95, paper: 'Mathematics Quiz' },
      { name: 'Bob Smith', score: 92, paper: 'Physics Test' },
      { name: 'Carol Davis', score: 89, paper: 'Chemistry Exam' },
    ],
    recentActivity: [
      { action: 'Paper Created', item: 'Advanced Calculus', time: '2 hours ago' },
      { action: 'Student Assigned', item: 'Linear Algebra', time: '4 hours ago' },
      { action: 'Exam Completed', item: 'Statistics Quiz', time: '6 hours ago' },
    ],
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
          <p className="text-gray-400">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Track performance and insights across your papers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={analyticsData.totalPapers}
            subtitle="Created papers"
            icon={FileText}
            color="from-blue-600 to-cyan-600"
            trend="+12%"
          />
          <StatCard
            title="Total Students"
            value={analyticsData.totalStudents}
            subtitle="Enrolled students"
            icon={Users}
            color="from-green-600 to-emerald-600"
            trend="+8%"
          />
          <StatCard
            title="Total Attempts"
            value={analyticsData.totalAttempts}
            subtitle="Exam attempts"
            icon={Target}
            color="from-purple-600 to-pink-600"
            trend="+15%"
          />
          <StatCard
            title="Average Score"
            value={`${analyticsData.averageScore}%`}
            subtitle="Class average"
            icon={Award}
            color="from-orange-600 to-red-600"
            trend="+3%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Performance Overview</h3>
                <div className="flex items-center space-x-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+5.2% from last month</span>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Performance chart would go here</p>
                  <p className="text-gray-500 text-xs">Integration with chart library needed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Performers & Recent Activity */}
          <div className="space-y-6">
            {/* Top Performers */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
              <div className="space-y-3">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {performer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{performer.name}</p>
                        <p className="text-gray-400 text-xs">{performer.paper}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-sm">{performer.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 py-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.action}:</span> {activity.item}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData.completionRate}%`}
            description="Students completing exams"
            icon={Target}
            color="text-green-400"
          />
          <MetricCard
            title="Average Duration"
            value="42 min"
            description="Time spent per exam"
            icon={Clock}
            color="text-blue-400"
          />
          <MetricCard
            title="Pass Rate"
            value="87.5%"
            description="Students passing exams"
            icon={Award}
            color="text-purple-400"
          />
        </div>
      </motion.div>
    </div>
  );
};

// Stat Card Component with Trend
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
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
        <div className="flex items-center mt-1">
          <p className="text-gray-500 text-xs">{subtitle}</p>
          {trend && (
            <span className="ml-2 text-xs text-green-400 font-medium">{trend}</span>
          )}
        </div>
      </div>
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// Metric Card Component
const MetricCard = ({ title, value, description, icon: Icon, color }) => (
  <motion.div
    className="glass-card p-6"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-gray-700/50`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default AnalyticsPage;