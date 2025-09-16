import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  Check,
  X,
  ArrowLeft,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetPaperByIdQuery } from '../../features/papers/paperApi';
import { useGetStudentsQuery } from '../../features/User/userApi';

const AssignStudentsPage = () => {
  const navigate = useNavigate();
  const { id: paperId } = useParams();
  const user = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const {
    data: paperResponse,
    isLoading: paperLoading,
    error: paperError,
  } = useGetPaperByIdQuery(paperId);

  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetStudentsQuery();

  const paper = paperResponse?.paper;
  const students = studentsResponse?.students || [];

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get currently assigned student IDs
  const assignedStudentIds = new Set(paper?.assignedTo?.map(s => s._id || s) || []);

  const handleStudentToggle = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)));
    }
  };

  const handleAssignStudents = async () => {
    try {
      console.log('Assigning students:', Array.from(selectedStudents));
      
      // Call the assign paper API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/papers/${paperId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign students');
      }

      const result = await response.json();
      console.log('Assignment successful:', result);
      
      alert(`Successfully assigned paper to ${selectedStudents.size} students!`);
      navigate('/papers');
    } catch (error) {
      console.error('Error assigning students:', error);
      alert('Failed to assign students. Please try again.');
    }
  };

  if (paperLoading || studentsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (paperError || studentsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to load data
          </h2>
          <p className="text-gray-400 mb-4">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => navigate('/papers')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Papers
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/papers')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Assign Students
              </h1>
              <p className="text-gray-400">
                Paper: {paper?.title || 'Unknown Paper'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleAssignStudents}
            disabled={selectedStudents.size === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              selectedStudents.size > 0
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={selectedStudents.size > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedStudents.size > 0 ? { scale: 0.95 } : {}}
          >
            <UserPlus className="w-5 h-5" />
            <span>Assign Selected ({selectedStudents.size})</span>
          </motion.button>
        </div>

        {/* Paper Info */}
        <motion.div
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Paper Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Subject:</span>
              <span className="text-white ml-2">{paper?.subject || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Questions:</span>
              <span className="text-white ml-2">{paper?.questions?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="text-white ml-2">{paper?.settings?.duration || 60} minutes</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-400">Currently Assigned:</span>
            <span className="text-white ml-2">{assignedStudentIds.size} students</span>
          </div>
        </motion.div>

        {/* Search and Select All */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <motion.button
            onClick={handleSelectAll}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
          </motion.button>
        </div>

        {/* Students List */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Available Students ({filteredStudents.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const isSelected = selectedStudents.has(student._id);
                const isAssigned = assignedStudentIds.has(student._id);
                
                return (
                  <motion.div
                    key={student._id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : isAssigned
                        ? 'bg-green-600/20 border-green-500/50'
                        : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-500/50'
                    }`}
                    onClick={() => !isAssigned && handleStudentToggle(student._id)}
                    whileHover={{ scale: isAssigned ? 1 : 1.01 }}
                    whileTap={{ scale: isAssigned ? 1 : 0.99 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{student.name}</h4>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                        {student.profile?.department && (
                          <p className="text-gray-500 text-xs">{student.profile.department}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAssigned && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                          Already Assigned
                        </span>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : isAssigned
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-400'
                        }`}
                      >
                        {(isSelected || isAssigned) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">
                  {searchTerm ? 'No students found matching your search' : 'No students available'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AssignStudentsPage;