import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Star,
    MessageSquare,
    BookOpen,
    TrendingUp,
    Award,
    Eye,
    BarChart3,
    Users
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function MyEvaluationsReceived() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const columns = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            width: "60px",
        },
        {
            key: "evaluationCode",
            label: "Code",
            sortable: true,
        },
        {
            key: "rating",
            label: "Rating",
            sortable: true,
            icon: <Star size={14} />,
        },
        {
            key: "academicPeriod",
            label: "Academic Year",
            sortable: true,
            icon: <BookOpen size={14} />,
        },
        {
            key: "createdAt",
            label: "Date Received",
            sortable: true,
            icon: <Calendar size={14} />,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
        },
    ];

    const fetchEvaluations = async () => {
        setLoading(true);
        const toastId = showToast("Fetching your evaluations...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "faculty-evaluation/get-received", {});
            removeToast(toastId);

            if (res.success && res.evaluations) {
                const formatted = res.evaluations.map((eval2: any) => ({
                    id: eval2.id,
                    evaluationCode: eval2.uniqueCode,
                    rating: eval2.rating,
                    ratingLabel: getRatingLabel(eval2.rating),
                    message: eval2.message,
                    academicPeriod: eval2.academicPeriod,
                    createdAt: new Date(eval2.createdAt).toLocaleDateString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: eval2.status,
                }));
                setData(formatted);

                if (res.stats) {
                    setStats(res.stats);
                }
            } else {
                setData([]);
                showToast("Failed to fetch evaluations.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = (rating: number) => {
        switch (rating) {
            case 1: return "Poor";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Excellent";
            default: return "N/A";
        }
    };

    const getRatingColor = (rating: number) => {
        switch (rating) {
            case 1: return "text-red-600 bg-red-100 border-red-200";
            case 2: return "text-orange-600 bg-orange-100 border-orange-200";
            case 3: return "text-blue-600 bg-blue-100 border-blue-200";
            case 4: return "text-green-600 bg-green-100 border-green-200";
            default: return "text-slate-600 bg-slate-100 border-slate-200";
        }
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 4 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
            />
        ));
    };

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const renderExpandedRow = (row: any) => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Award size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Evaluation from Colleague</h4>
                        <p className="text-sm text-slate-600">
                            Code: {row.evaluationCode}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                        {getRatingStars(row.rating)}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-semibold text-sm border ${getRatingColor(row.rating)}`}>
                        {row.rating}/4 - {row.ratingLabel}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-blue-600" />
                        <p className="text-sm font-semibold text-slate-600">Evaluator</p>
                    </div>
                    <p className="text-base font-bold text-slate-800">Anonymous Colleague</p>
                    <p className="text-xs text-slate-500 mt-1">Identity hidden for honest feedback</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-blue-600" />
                        <p className="text-sm font-semibold text-slate-600">Academic Period</p>
                    </div>
                    <p className="text-base font-bold text-slate-800">{row.academicPeriod}</p>
                </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MessageSquare size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-3">Feedback Message</p>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                            <p className="text-base text-slate-700 leading-relaxed italic">"{row.message}"</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                <Calendar size={14} className="text-slate-600" />
                <span className="text-sm text-slate-600">
                    Received on: <span className="font-semibold">{row.createdAt}</span>
                </span>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedEvaluation(row); setIsViewOpen(true); }}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                title="View Evaluation"
            >
                <Eye size={16} />
            </motion.button>
        </>
    );

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Evaluations I Received
                </h1>
                <p className="text-base text-slate-600">
                    View and manage your received faculty evaluations. Expand each entry to see detailed information, update if needed, or delete entries.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-6"
            >
                {/* Statistics Cards */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <BarChart3 size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Evaluations</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.totalEvaluations}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Star size={24} className="text-yellow-600 fill-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Average Rating</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.averageRating.toFixed(2)}/4</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Performance Level</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {stats.averageRating >= 3.5 ? "Excellent" :
                                            stats.averageRating >= 2.5 ? "Good" :
                                                stats.averageRating >= 1.5 ? "Fair" : "Needs Improvement"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                    <div className="flex items-start gap-3">
                        <Users className="text-blue-600 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Anonymous Feedback</h3>
                            <p className="text-sm text-blue-800">
                                Evaluations are submitted anonymously to ensure honest and constructive feedback.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Data Table */}
                <DataTable
                    title="Evaluations I Received"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            {/* View Modal */}
            <AnimatePresence>
                {isViewOpen && selectedEvaluation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsViewOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">Evaluation Details</h3>
                                    <button
                                        onClick={() => setIsViewOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {renderExpandedRow(selectedEvaluation)}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

    );
}