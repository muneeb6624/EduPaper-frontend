
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetStudentsQuery } from '../../features/User/userApi';
import { useAssignPaperMutation } from '../../features/papers/paperApi';
import { CheckCircle, X, Users, Send } from 'lucide-react';

const PaperAssignment = ({ paper, onClose, onSuccess }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: students = [], isLoading } = useGetStudentsQuery();
  const [assignPaper] = useAssignPaperMutation();

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsAssigning(true);
    try {
      await assignPaper({ 
        paperId: paper._id, 
        studentIds: selectedStudents 
      }).unwrap();
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Assign Paper</h3>
            <p className="text-gray-400 text-sm mt-1">{paper?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white">Select Students</span>
            <span className="text-gray-400 text-sm">
              ({selectedStudents.length} of {students.length} selected)
            </span>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto mb-6 border border-gray-700 rounded-lg">
          <div className="space-y-0">
            {students.length > 0 ? (
              students.map((student) => (
                <motion.div
                  key={student._id}
                  className="flex items-center space-x-3 p-4 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => handleStudentToggle(student._id)}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{student.name}</p>
                    <p className="text-gray-400 text-sm truncate">{student.email}</p>
                  </div>
                  {selectedStudents.includes(student._id) && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No students found</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleAssign}
            disabled={selectedStudents.length === 0 || isAssigning}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: selectedStudents.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedStudents.length > 0 ? 0.98 : 1 }}
          >
            {isAssigning ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Assign to {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaperAssignment;
