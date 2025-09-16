
import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { selectIsAuthenticated, selectUserRole } from './features/auth/authSlice';

// Components
import LoadingScreen from './components/ui/Loader'
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ExamInterface from './components/ui/ExamInterface';
import PaperCreator from './components/ui/PaperCreator';
import ExamsPage from './pages/student/ExamsPage';
import ResultsPage from './pages/student/ResultsPage';
import PapersPage from './pages/teacher/PapersPage';
import AssignStudentsPage from './pages/teacher/AssignStudentsPage';
import GradingPage from './pages/teacher/GradingPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';
import HistoryPage from './pages/student/HistoryPage';
import ViewAttemptsPage from './pages/teacher/ViewAttemptsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const userRole = useSelector(selectUserRole);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Dashboard>
                <ExamsPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/exam/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamInterface />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Dashboard>
                <ResultsPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Dashboard>
                <HistoryPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/papers"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <PapersPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/papers/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <PaperCreator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/papers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Edit Paper</h1>
                    <p className="text-slate-300">Edit your paper</p>
                  </div>
                </div>
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/papers/:id/assign"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <AssignStudentsPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/papers/:id/attempts"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <ViewAttemptsPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/grading"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <GradingPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Dashboard>
                <AnalyticsPage />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard>
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">User Management</h1>
                    <p className="text-slate-300">Manage system users</p>
                  </div>
                </div>
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard>
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">System Analytics</h1>
                    <p className="text-slate-300">View system analytics</p>
                  </div>
                </div>
              </Dashboard>
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-400 mb-4">Unauthorized</h1>
                <p className="text-slate-300">You don't have permission to access this page.</p>
              </div>
            </div>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component with Loading Screen
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <Provider store={store}>
      <div className="App">
        {isLoading ? (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        ) : (
          <AppRoutes />
        )}
      </div>
    </Provider>
  );
};

export default App;
