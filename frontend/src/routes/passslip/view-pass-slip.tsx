import { useEffect, useState, JSX } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    Circle,
    Loader2,
    Building2,
    ArrowLeft,
    AlertCircle,
    LogOut,
    LogIn,
    MessageSquare,
    Target,
    UserCheck,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { ViewSignatureStatus } from "../../components/view-signature-status";

export default function ViewPassSlip() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [passSlip, setPassSlip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPassSlip = async () => {
        setLoading(true);
        const toastId = showToast("Loading pass slip...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", `pass-slip/get/${id}`, {});
            if (res.success && res.passSlip) {
                setPassSlip(res.passSlip);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load pass slip", "error");
        } finally {
            removeToast(toastId);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchPassSlip();
    }, [id]);

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            PENDING: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200",
            APPROVED: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200",
            REJECTED: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200",
        };
        return map[status] || "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200";
    };

    const getStatusIcon = (status: string): JSX.Element => {
        const map: Record<string, JSX.Element> = {
            PENDING: <Circle size={14} className="animate-pulse" />,
            APPROVED: <CheckCircle2 size={14} />,
            REJECTED: <XCircle size={14} />,
        };
        return map[status] || <Circle size={14} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                >
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
                    <div>
                        <p className="text-lg font-semibold text-slate-800">Loading Pass Slip</p>
                        <p className="text-sm text-slate-600">Please wait while we fetch the details...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!passSlip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="p-4 bg-red-100 rounded-full inline-block"
                    >
                        <XCircle size={48} className="text-red-600" />
                    </motion.div>
                    <div>
                        <p className="text-lg font-semibold text-slate-800 mb-1">Pass Slip Not Found</p>
                        <p className="text-sm text-slate-600 mb-4">
                            The pass slip you're looking for doesn't exist or has been removed.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const isCompleted = passSlip.status === "APPROVED" && passSlip.timeIn;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                                        Pass Slip Details
                                    </h1>
                                    <p className="text-base text-slate-600 flex items-center gap-2">
                                        <span className="font-mono font-semibold">
                                            PS-{String(passSlip.id).padStart(5, "0")}
                                        </span>
                                        <span>•</span>
                                        <Clock size={14} />
                                        {new Date(passSlip.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${isCompleted
                                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                        : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} />
                                            In Progress
                                        </>
                                    )}
                                </motion.span>

                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(
                                        passSlip.status
                                    )}`}
                                >
                                    {getStatusIcon(passSlip.status)}
                                    {passSlip.status}
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-slate-50">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">
                                {passSlip.timeOut ? "✓" : "—"}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Time Out</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {passSlip.timeIn ? "✓" : "—"}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Time In</p>
                        </div>
                        <div className="text-center col-span-2 sm:col-span-1">
                            <p className="text-3xl font-bold text-purple-600">
                                {passSlip.forwardToHR ? "Yes" : "No"}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Forwarded to HR</p>
                        </div>
                    </div>
                </motion.div>

                {/* Employee & Department Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 mb-1">Employee</p>
                                <p className="text-base font-bold text-slate-900">
                                    {passSlip.user
                                        ? `${passSlip.user.firstName} ${passSlip.user.lastName}`
                                        : `User ID: ${passSlip.userId}`}
                                </p>
                                {passSlip.user?.email && (
                                    <p className="text-sm text-slate-600 mt-1">{passSlip.user.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Building2 size={20} className="text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 mb-1">Department</p>
                                <p className="text-base font-bold text-slate-900">
                                    {passSlip.department?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Time Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={18} className="text-blue-600" />
                            Time Details
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Time Out */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <LogOut size={14} />
                                    <span className="font-medium">Time Out</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {passSlip.timeOut
                                        ? new Date(passSlip.timeOut).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "—"}
                                </p>
                            </div>

                            {/* Time In */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <LogIn size={14} />
                                    <span className="font-medium">Time In</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {passSlip.timeIn
                                        ? new Date(passSlip.timeIn).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Purpose & Reason Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4"
                >
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Pass Slip Details
                    </h3>

                    {/* Purpose */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Target size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900 mb-1">Purpose</p>
                                <p className="text-base text-blue-700">{passSlip.purpose}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2">
                            <MessageSquare size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900 mb-1">Reason</p>
                                <p className="text-base text-slate-700 whitespace-pre-line">
                                    {passSlip.reason}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <UserCheck size={16} className="text-purple-600" />
                        <span className="text-sm text-slate-600">Forwarded to HR:</span>
                        <span
                            className={`text-sm font-semibold ${passSlip.forwardToHR ? "text-purple-700" : "text-slate-700"
                                }`}
                        >
                            {passSlip.forwardToHR ? "Yes" : "No"}
                        </span>
                    </div>
                </motion.div>
                <ViewSignatureStatus isHaveDeanSignature={passSlip.isHaveDeanSignature} isHavePresidentSignature={passSlip.isHavePresidentSignature} />
            </motion.div>
        </div>
    );
}