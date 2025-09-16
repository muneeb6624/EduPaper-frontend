import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  User,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetPaperByIdQuery } from "../../features/papers/paperApi";
import {
  useGetPaperAttemptsQuery,
  useGradeAttemptMutation,
} from "../../features/attempts/attemptApi";

const ViewAttemptsPage = () => {
  const navigate = useNavigate();
  const { id: paperId } = useParams();
  const user = useSelector(selectCurrentUser);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [gradingMode, setGradingMode] = useState(false);
  const [grades, setGrades] = useState({});

  const {
    data: paperResponse,
    isLoading: paperLoading,
    error: paperError,
  } = useGetPaperByIdQuery(paperId);

  const {
    data: attemptsResponse,
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useGetPaperAttemptsQuery(paperId);

  const [gradeAttempt] = useGradeAttemptMutation();

  const paper = paperResponse?.paper;
  const attempts = attemptsResponse?.attempts || [];

  console.log("📊 Attempts data:", attemptsResponse);
  console.log("📋 Paper data:", paperResponse);
  console.log("🔍 Paper ID:", paperId);
  console.log("📝 Attempts loading:", attemptsLoading);
  console.log("❌ Attempts error:", attemptsError);

  const handleGradeChange = (questionId, marks) => {
    setGrades((prev) => ({
      ...prev,
      [questionId]: Math.max(0, Math.min(marks, getMaxMarks(questionId))),
    }));
  };

  const getMaxMarks = (questionId) => {
    const question = paper?.questions?.find((q) => q._id === questionId);
    return question?.marks || 0;
  };

  const handleSaveGrades = async () => {
    try {
      console.log("Saving grades:", grades);

      const gradedAnswers = Object.entries(grades).map(
        ([questionId, marks]) => ({
          questionId,
          marksObtained: marks,
          feedback: `Graded: ${marks}/${getMaxMarks(questionId)} marks`,
        })
      );

      await gradeAttempt({
        attemptId: selectedAttempt._id,
        gradedAnswers,
      }).unwrap();

      alert("Grades saved successfully!");
      setGradingMode(false);
      setGrades({});
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("Failed to save grades. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-orange-600/20 text-orange-400";
      case "auto_graded":
        return "bg-blue-600/20 text-blue-400";
      case "manually_graded":
        return "bg-green-600/20 text-green-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  if (paperLoading || attemptsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading attempts...</p>
        </motion.div>
      </div>
    );
  }

  if (paperError || attemptsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to load attempts
          </h2>
          <p className="text-gray-400 mb-4">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => navigate("/grading")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Grading
          </button>
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
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate("/grading")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Student Attempts
              </h1>
              <p className="text-gray-400">
                Paper: {paper?.title || "Unknown Paper"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attempts List */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Attempts ({attempts.length})
              </h3>

              <div className="space-y-3">
                {attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <motion.div
                      key={attempt._id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedAttempt?._id === attempt._id
                          ? "bg-blue-600/20 border-blue-500/50"
                          : "bg-gray-700/30 border-gray-600/30 hover:border-gray-500/50"
                      }`}
                      onClick={() => setSelectedAttempt(attempt)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {attempt.studentId.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {attempt.studentId?.name || "Unknown Student"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {attempt.studentId?.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            attempt.status
                          )}`}
                        >
                          {attempt.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Score: {attempt.scoring?.obtainedMarks || 0}/
                          {attempt.scoring?.totalMarks || 0}
                        </span>
                        <span>{attempt.timeSpent || 0} min</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No attempts yet</p>
                    <p className="text-gray-500 text-sm">
                      Students haven't submitted any attempts for this paper
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Attempt Details */}
          <div className="lg:col-span-2">
            {selectedAttempt ? (
              <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedAttempt.studentId?.name || "Unknown Student"}'s
                      Attempt
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {selectedAttempt.submitTime
                          ? new Date(
                              selectedAttempt.submitTime
                            ).toLocaleString()
                          : "Not submitted"}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedAttempt.timeSpent || 0} minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {selectedAttempt.status === "submitted" && (
                      <motion.button
                        onClick={() => setGradingMode(!gradingMode)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                        <span>
                          {gradingMode ? "Cancel Grading" : "Grade This Exam"}
                        </span>
                      </motion.button>
                    )}

                    {gradingMode && (
                      <motion.button
                        onClick={handleSaveGrades}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Grades</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Total Score</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedAttempt.scoring?.obtainedMarks || 0}/
                      {selectedAttempt.scoring?.totalMarks || 0}
                    </p>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400 text-sm">Percentage</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedAttempt.scoring?.percentage || 0}%
                    </p>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Time Taken</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedAttempt.timeSpent || 0} min
                    </p>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Answers</h4>

                  {selectedAttempt.answers?.map((answer, index) => {
                    const question = paper?.questions?.find(
                      (q) => q._id === answer.questionId
                    );
                    const currentGrade =
                      grades[answer.questionId] ?? answer.obtainedMarks;

                    return (
                      <div
                        key={answer.questionId}
                        className="bg-gray-700/30 p-4 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-white font-medium mb-2">
                              Q{index + 1}:{" "}
                              {question?.question || "Question not found"}
                            </p>
                            <p className="text-gray-300 text-sm mb-2">
                              <strong>Answer:</strong> {answer.answer}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            {question?.type === "mcq" ? (
                              <div className="flex items-center space-x-2">
                                {answer.isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className="text-white font-medium">
                                  {answer.obtainedMarks}/{answer.maxMarks}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                {gradingMode ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max={answer.maxMarks}
                                      value={currentGrade}
                                      onChange={(e) =>
                                        handleGradeChange(
                                          answer.questionId,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                                    />
                                    <span className="text-gray-400">
                                      / {answer.maxMarks}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-white font-medium">
                                    {answer.obtainedMarks}/{answer.maxMarks}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {question?.type === "mcq" && question.correctAnswer && (
                          <p className="text-gray-400 text-sm">
                            <strong>Correct Answer:</strong>{" "}
                            {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="glass-card p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select an Attempt
                </h3>
                <p className="text-gray-400">
                  Choose a student attempt from the list to view details and
                  grade
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewAttemptsPage;
