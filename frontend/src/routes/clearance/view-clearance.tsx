import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Loader2,
    XCircle,
    CheckCircle,
    ArrowLeft,
    Clock,
    AlertCircle,
    Download,
    MessageSquare,
    Briefcase,
    DollarSign,
    Calendar,
    Target,
    User,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { ViewSignatureStatus } from "../../components/view-signature-status";

export default function ViewClearance() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clearance, setClearance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchClearance = async () => {
        setLoading(true);
        const toastId = showToast("Loading clearance details...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", `clearance/get/${id}`, {});
            if (res.success && res.clearance) {
                setClearance(res.clearance);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load clearance", "error");
        } finally {
            removeToast(toastId);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchClearance();
    }, [id]);

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
                        <p className="text-lg font-semibold text-slate-800">Loading Clearance</p>
                        <p className="text-sm text-slate-600">Please wait while we fetch the details...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!clearance) {
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
                        <p className="text-lg font-semibold text-slate-800 mb-1">Clearance Not Found</p>
                        <p className="text-sm text-slate-600 mb-4">
                            The clearance you're looking for doesn't exist or has been removed.
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

    const isClearanceComplete =
        clearance.isHaveDeanSignature &&
        clearance.isHavePresidentSignature &&
        clearance.status === "APPROVED BY PRESIDENT";

    const signatureCount = [
        clearance.isHaveDeanSignature,
        clearance.isHavePresidentSignature,
    ].filter(Boolean).length;

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
                                        Clearance Details
                                    </h1>
                                    <p className="text-base text-slate-600 flex items-center gap-2">
                                        <span className="font-mono font-semibold">
                                            {clearance.user.firstName} {clearance.user.lastName}
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono font-semibold">
                                            CLR-{String(clearance.id).padStart(5, "0")}
                                        </span>
                                        <span>•</span>
                                        <Clock size={14} />
                                        {new Date(clearance.createdAt).toLocaleDateString("en-US", {
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
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${isClearanceComplete
                                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                            : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                                        }`}
                                >
                                    {isClearanceComplete ? (
                                        <>
                                            <CheckCircle size={14} />
                                            Completed Review
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} />
                                            Pending Review
                                        </>
                                    )}
                                </motion.span>
                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${clearance.status === "APPROVED BY PRESIDENT"
                                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                            : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                                        }`}
                                >
                                    {clearance.status === "APPROVED BY PRESIDENT" ? (
                                        <>
                                            <CheckCircle size={14} />
                                            {clearance.status}
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} />
                                            {clearance.status}
                                        </>
                                    )}
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">{signatureCount}</p>
                            <p className="text-sm text-slate-600 mt-1">Signatures</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">{2 - signatureCount}</p>
                            <p className="text-sm text-slate-600 mt-1">Pending</p>
                        </div>
                    </div>
                </motion.div>

                {/* Employment Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Employment Information
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Position */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User size={14} />
                                    <span className="font-medium">Position</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {clearance.position}
                                </p>
                            </div>

                            {/* Employment Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle size={14} />
                                    <span className="font-medium">Employment Status</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {clearance.employmentStatus}
                                </p>
                            </div>

                            {/* Salary */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <DollarSign size={14} />
                                    <span className="font-medium">Salary</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    ${clearance.salary.toLocaleString()}
                                </p>
                            </div>

                            {/* Purpose */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Target size={14} />
                                    <span className="font-medium">Purpose</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {clearance.purpose}
                                </p>
                            </div>

                            {/* Effective From */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar size={14} />
                                    <span className="font-medium">Effective From</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {new Date(clearance.effectiveFrom).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            {/* Effective To */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar size={14} />
                                    <span className="font-medium">Effective To</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {new Date(clearance.effectiveTo).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Document & Remarks Card */}
                {(clearance.uploadedUrl || clearance.remarks) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4"
                    >
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                            Additional Details
                        </h3>

                        {clearance.uploadedUrl && (
                            <motion.a
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                href={clearance.uploadedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-slate-800">
                                            Clearance Document
                                        </p>
                                        <p className="text-sm text-slate-600">Click to view or download</p>
                                    </div>
                                </div>
                                <Download size={22} className="text-blue-600" />
                            </motion.a>
                        )}

                        {clearance.remarks && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-2">
                                    <MessageSquare
                                        size={18}
                                        className="text-blue-600 mt-0.5 flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">
                                            Clearance Remarks
                                        </p>
                                        <p className="text-base text-blue-700 italic">
                                            "{clearance.remarks}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
                <ViewSignatureStatus isHaveDeanSignature={clearance.isHaveDeanSignature} isHavePresidentSignature={clearance.isHavePresidentSignature} />
            </motion.div>
        </div>
    );
}