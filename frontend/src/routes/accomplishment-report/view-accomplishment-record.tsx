import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Calendar,
    Loader2,
    XCircle,
    Download,
    CheckCircle,
    ArrowLeft,
    Clock,
    ChevronRight,
    UserCheck,
    AlertCircle,
    MessageSquare
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function ViewAccomplishmentReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        setLoading(true);
        const toastId = showToast("Loading accomplishment report...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", `accomplishment/get/${id}`, {});
            if (res.success && res.report) {
                setReport(res.report);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load report", "error");
        } finally {
            removeToast(toastId);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchReport();
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
                        <p className="text-lg font-semibold text-slate-800">Loading Report</p>
                        <p className="text-sm text-slate-600">Please wait while we fetch the details...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!report) {
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
                        <p className="text-lg font-semibold text-slate-800 mb-1">Report Not Found</p>
                        <p className="text-sm text-slate-600 mb-4">
                            The accomplishment report you're looking for doesn't exist or has been removed.
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

    const isReportComplete = report.entries?.length > 0 && report.entries.every((e: any) => e.signedBy);
    const signedCount = report.entries?.filter((e: any) => e.signedBy).length || 0;
    const totalEntries = report.entries?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-5xl mx-auto space-y-6"
            >
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ x: -4 }}
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-base text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Reports
                </motion.button>

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
                                        Accomplishment Report
                                    </h1>
                                    <p className="text-base text-slate-600 flex items-center gap-2">
                                        <span className="font-mono font-semibold">ACR-{String(report.id).padStart(4, '0')}</span>
                                        <span>•</span>
                                        <Clock size={14} />
                                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${isReportComplete
                                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                        : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                                    }`}
                            >
                                {isReportComplete ? (
                                    <>
                                        <CheckCircle size={14} />
                                        Completed
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={14} />
                                        Pending Review
                                    </>
                                )}
                            </motion.span>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-slate-50">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{totalEntries}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Entries</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">{signedCount}</p>
                            <p className="text-sm text-slate-600 mt-1">Signed</p>
                        </div>
                        <div className="text-center col-span-2 sm:col-span-1">
                            <p className="text-3xl font-bold text-amber-600">{totalEntries - signedCount}</p>
                            <p className="text-sm text-slate-600 mt-1">Pending</p>
                        </div>
                    </div>
                </motion.div>

                {/* PDF & Remarks Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4"
                >
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Report Details
                    </h3>

                    {report.uploadedUrl && (
                        <motion.a
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            href={report.uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-800">Report PDF Document</p>
                                    <p className="text-sm text-slate-600">Click to view or download</p>
                                </div>
                            </div>
                            <Download size={22} className="text-blue-600" />
                        </motion.a>
                    )}

                    {report.remarks && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <MessageSquare size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">Report Remarks</p>
                                    <p className="text-base text-blue-700 italic">"{report.remarks}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Entries Section */}
                {report.entries?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600" />
                                Daily Accomplishment Entries
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {report.entries.map((entry: any, index: number) => (
                                <motion.div
                                    key={entry.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
                                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${entry.signedBy
                                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                                        }`}
                                >
                                    {/* Signed Badge */}
                                    {entry.signedBy && (
                                        <div className="absolute top-4 right-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                                                <CheckCircle size={12} />
                                                Signed
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-5">
                                        {/* Date Header */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                                <Calendar size={18} className="text-blue-600" />
                                            </div>
                                            <span className="text-base font-bold text-slate-800">
                                                {new Date(entry.date).toLocaleDateString("en-US", {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Activities */}
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-slate-600 mb-2">Activities Accomplished:</p>
                                            <ul className="space-y-2">
                                                {entry.activities.map((act: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                                                        <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>{act}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Entry Remarks */}
                                        {entry.remarks && (
                                            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 mb-4">
                                                <p className="text-sm text-slate-600">
                                                    <span className="font-semibold">Note: </span>
                                                    <span className="italic">"{entry.remarks}"</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Signature Status */}
                                        {entry.signedBy && (
                                            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                                                <div className="p-1 bg-green-100 rounded">
                                                    <UserCheck size={16} className="text-green-600" />
                                                </div>
                                                <span className="text-sm text-green-700 font-medium">
                                                    Signed and approved by User #{entry.signedBy}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}