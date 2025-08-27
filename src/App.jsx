import React, { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { selectIsAuthenticated, selectUserRole } from './features/auth/authSlice'; // Fixed import

// Components
import LoadingScreen from './components/ui/Loader'
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ExamInterface from './components/ui/ExamInterface';
import PaperCreator from './components/ui/PaperCreator';

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

// Role-based Dashboard Router
const DashboardRouter = () => {
  const userRole = useSelector(selectUserRole);

  // For now, return the same dashboard for all roles
  // You can create separate components later
  return <Dashboard />;
};

// App Routes Component
const AppRoutes = () => {
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
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Student Exams</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
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
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">My Results</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/papers"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">My Papers</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
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
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Edit Paper</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/grading"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Grading</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">User Management</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Analytics</h1>
                  <p className="text-slate-300">Coming soon...</p>
                </div>
              </div>
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