import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
    User,
    Star,
    Send,
    CheckCircle,
    AlertCircle,
    GraduationCap
} from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function PublicStudentEvaluation() {
    const { uniqueCode } = useParams<{ uniqueCode: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [facultyInfo, setFacultyInfo] = useState<any>(null);
    const [formData, setFormData] = useState({
        studentId: "",
        rating: 0,
        courseCode: "",
        message: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        if (uniqueCode) {
            fetchFacultyInfo();
        }
    }, [uniqueCode]);

    const fetchFacultyInfo = async () => {
        setLoading(true);
        try {
            const res = await RequestHandler.fetchData(
                "GET",
                `get-faculty-info/${uniqueCode}`,
                {}
            );

            if (res.success) {
                setFacultyInfo(res.faculty);
            } else {
                showToast(res.message || "Invalid evaluation code.", "error");
            }
        } catch (err) {
            showToast("Failed to load evaluation form.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateStudentId = (id: string) => {
        const regex = /^\d{4}-\d{5}$/;
        return regex.test(id);
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.studentId.trim()) {
            newErrors.studentId = "Student ID is required";
        } else if (!validateStudentId(formData.studentId)) {
            newErrors.studentId = "Invalid format. Use: YYYY-XXXXX (e.g., 2022-10934)";
        }

        if (formData.rating === 0) {
            newErrors.rating = "Please select a rating";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Feedback message is required";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Please provide at least 10 characters of feedback";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Please fix the errors in the form", "error");
            return;
        }

        setSubmitting(true);
        const toastId = showToast("Submitting your evaluation...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "submit",
                {
                    uniqueCode,
                    ...formData,
                }
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Thank you for your feedback!", "success");
                setSubmitted(true);
            } else {
                showToast(res.message || "Failed to submit evaluation.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading evaluation form...</p>
                </div>
            </div>
        );
    }

    if (!facultyInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"
                >
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Code</h2>
                    <p className="text-slate-600">
                        This evaluation link is not valid or has expired.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Thank You!
                    </h2>
                    <p className="text-slate-600 mb-4">
                        Your feedback has been submitted successfully and will help improve teaching quality.
                    </p>
                    <p className="text-sm text-slate-500">
                        You can close this page now.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4"
                    >
                        <GraduationCap size={40} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                        Student Evaluation
                    </h1>
                    <p className="text-lg text-slate-600">
                        Your feedback helps improve teaching quality
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <User size={32} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Evaluating</p>
                            <h2 className="text-xl font-bold text-slate-900">
                                {facultyInfo.firstName} {facultyInfo.lastName}
                            </h2>
                            <p className="text-sm text-slate-600">{facultyInfo.academicPeriod}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <h3 className="text-xl font-bold">Share Your Feedback</h3>
                        <p className="text-blue-100 text-sm">All responses are anonymous</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Student ID *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 2015-10345"
                                value={formData.studentId}
                                onChange={(e) =>
                                    setFormData({ ...formData, studentId: e.target.value })
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.studentId
                                        ? "border-red-500 bg-red-50"
                                        : "border-slate-300"
                                    }`}
                            />
                            {errors.studentId && (
                                <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                Format: YYYY-XXXXX (e.g., 2015-10345)
                            </p>
                        </div>

                        {/* Course Code */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Course Code (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., CS101, MATH202"
                                value={formData.courseCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, courseCode: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Overall Rating *
                            </label>
                            <div className="flex items-center justify-center gap-3 py-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        type="button"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            size={48}
                                            className={`transition-all ${star <= (hoveredRating || formData.rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-slate-300"
                                                }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                            {formData.rating > 0 && (
                                <p className="text-center text-sm font-medium text-slate-700">
                                    {formData.rating === 1 && "Poor"}
                                    {formData.rating === 2 && "Fair"}
                                    {formData.rating === 3 && "Good"}
                                    {formData.rating === 4 && "Very Good"}
                                    {formData.rating === 5 && "Excellent"}
                                </p>
                            )}
                            {errors.rating && (
                                <p className="mt-2 text-center text-sm text-red-600">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Your Feedback *
                            </label>
                            <textarea
                                rows={6}
                                placeholder="Share your thoughts about the teaching quality, course content, and overall experience..."
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${errors.message
                                        ? "border-red-500 bg-red-50"
                                        : "border-slate-300"
                                    }`}
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                Minimum 10 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Evaluation
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                    <p className="text-sm text-blue-800 text-center">
                        🔒 Your feedback is anonymous. Only your Student ID is recorded to prevent duplicates.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}