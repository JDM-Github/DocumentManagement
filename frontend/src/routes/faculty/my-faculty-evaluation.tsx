import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Eye,
    Edit,
    Trash2,
    Star,
    User,
    MessageSquare,
    AlertTriangle,
    BookOpen,
    Award
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";

export default function MyFacultyEvaluations() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
            key: "facultyName",
            label: "Faculty Member",
            sortable: true,
            icon: <User size={14} />,
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
            label: "Date Created",
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
        const toastId = showToast("Fetching evaluations...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "faculty-evaluation/get-my-evaluations", {});
            removeToast(toastId);

            if (res.success && res.evaluations) {
                const formatted = res.evaluations.map((eval2: any) => ({
                    id: eval2.id,
                    evaluationCode: eval2.uniqueCode,
                    facultyName: eval2.faculty ? `${eval2.faculty.firstName} ${eval2.faculty.lastName}` : "Unknown",
                    facultyId: eval2.facultyId,
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
                    departmentId: eval2.departmentId,
                }));
                setData(formatted);
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
            case 1: return "text-red-600 bg-red-100";
            case 2: return "text-orange-600 bg-orange-100";
            case 3: return "text-blue-600 bg-blue-100";
            case 4: return "text-green-600 bg-green-100";
            default: return "text-slate-600 bg-slate-100";
        }
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
                        <h4 className="text-base font-bold text-slate-800">Evaluation Details</h4>
                        <p className="text-sm text-slate-600">
                            Code: {row.evaluationCode}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getRatingColor(row.rating)}`}>
                        {row.rating}/4 - {row.ratingLabel}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <User size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Faculty Member</h5>
                    </div>
                    <p className="text-base font-semibold text-slate-800">{row.facultyName}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Academic Period</h5>
                    </div>
                    <p className="text-base font-semibold text-slate-800">{row.academicPeriod}</p>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Evaluation Message</p>
                <p className="text-base text-blue-700 leading-relaxed">{row.message}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-600" />
                    <div>
                        <span className="text-sm text-slate-600">Submitted on: </span>
                        <span className="text-sm font-semibold text-slate-800">{row.createdAt}</span>
                    </div>
                </div>
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
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedEvaluation(row); setIsEditOpen(true); }}
                className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                title="Edit Evaluation"
            >
                <Edit size={16} />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedEvaluation(row); setIsDeleteOpen(true); }}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Delete Evaluation"
            >
                <Trash2 size={16} />
            </motion.button>
        </>
    );

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen"
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
                    My Faculty Evaluations
                </h1>
                <p className="text-base text-slate-600">
                    View and manage your submitted faculty evaluations. Expand each entry to see detailed information, update your evaluation, or delete it if necessary.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Faculty Evaluations"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />

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
                                            className="text-slate-400 hover:text-slate-600"
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

                <AnimatePresence>
                    {isEditOpen && selectedEvaluation && (
                        <DynamicForm
                            isModal
                            isOpen
                            title="Edit Faculty Evaluation"
                            fields={[
                                {
                                    name: "rating",
                                    label: "Rating",
                                    type: "select",
                                    required: true,
                                    icon: <Star size={16} />,
                                    options: [
                                        { label: "1 - Poor", value: "1" },
                                        { label: "2 - Fair", value: "2" },
                                        { label: "3 - Good", value: "3" },
                                        { label: "4 - Excellent", value: "4" },
                                    ],
                                },
                                {
                                    name: "message",
                                    label: "Evaluation Message",
                                    type: "textarea",
                                    rows: 6,
                                    required: true,
                                    placeholder: "Provide detailed feedback on faculty performance...",
                                    icon: <MessageSquare size={16} />,
                                },
                            ]}
                            initialData={{
                                rating: selectedEvaluation.rating.toString(),
                                message: selectedEvaluation.message,
                            }}
                            onSubmit={async (data) => {
                                const toastId = showToast("Updating evaluation...", "loading");
                                try {
                                    const payload = { ...data, rating: parseInt(data.rating) };
                                    const res = await RequestHandler.fetchData(
                                        "PUT",
                                        `faculty-evaluation/update/${selectedEvaluation.id}`,
                                        payload
                                    );
                                    removeToast(toastId);
                                    if (res.success) {
                                        showToast("Evaluation updated successfully!", "success");
                                        setIsEditOpen(false);
                                        fetchEvaluations();
                                    } else {
                                        showToast(res.message || "Failed to update evaluation", "error");
                                    }
                                } catch {
                                    removeToast(toastId);
                                    showToast("Failed to update evaluation", "error");
                                }
                            }}
                            actionType="UPDATE"
                            submitButtonText="Update Evaluation"
                            onClose={() => setIsEditOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isDeleteOpen && selectedEvaluation && (
                        <DynamicForm
                            isModal
                            isOpen
                            title="Delete Faculty Evaluation"
                            fields={[
                                {
                                    name: "confirm",
                                    label: "Type DELETE to confirm",
                                    type: "text",
                                    required: true,
                                    placeholder: "DELETE",
                                    icon: <AlertTriangle size={16} />,
                                    validation: (value: string) =>
                                        value !== "DELETE" ? "Please type DELETE to confirm deletion" : undefined,
                                },
                            ]}
                            onSubmit={async () => {
                                const toastId = showToast("Deleting evaluation...", "loading");
                                try {
                                    const res = await RequestHandler.fetchData(
                                        "DELETE",
                                        `faculty-evaluation/delete/${selectedEvaluation.id}`,
                                        {}
                                    );
                                    removeToast(toastId);
                                    if (res.success) {
                                        showToast("Evaluation deleted successfully!", "success");
                                        setIsDeleteOpen(false);
                                        fetchEvaluations();
                                    } else {
                                        showToast(res.message || "Failed to delete evaluation", "error");
                                    }
                                } catch {
                                    removeToast(toastId);
                                    showToast("Failed to delete evaluation", "error");
                                }
                            }}
                            actionType="DELETE"
                            submitButtonText="Delete Evaluation"
                            onClose={() => setIsDeleteOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}