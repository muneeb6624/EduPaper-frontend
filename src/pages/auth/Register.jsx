/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { User, Mail, Lock, GraduationCap, BookOpen } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);

    if (!validateForm()) return;

    try {
      const { confirmPassword, ...userData } = formData;
      const res = await registerUser(userData).unwrap();
      
      dispatch(setCredentials(res));
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center py-8 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              scale: 0 
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
          >
            Join EduPaper
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-slate-400"
          >
            Create your account to get started
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 flex justify-center align-middle content-center flex-col backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Error Message */}
          {showError && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-lg"
            >
              <p className="text-red-300 text-sm font-medium">Registration failed. Please try again.</p>
            </motion.div>
          )}

          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 text-sm">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 text-sm">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 text-sm">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Create a password"
              required
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 text-sm">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 text-sm">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === 'student'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <BookOpen className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-white font-medium">Student</span>
              </motion.label>

              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === 'teacher'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <GraduationCap className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-white font-medium">Teacher</span>
              </motion.label>
            </div>
          </div>

          {/* Institution Field */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2 text-sm">
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.institution ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your school/college/university"
              required
            />
            {errors.institution && <p className="text-red-400 text-xs mt-1">{errors.institution}</p>}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </motion.button>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 text-center text-gray-300"
          >
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register;