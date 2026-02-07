import { JSX, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    ArrowRight,
    Building2,
    User,
    Clock,
    Download,
    CheckCircle2,
    XCircle,
    Circle,
    Loader2,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { removeToast, showToast } from '../../components/toast';
import RequestHandler from '../../lib/utilities/RequestHandler';

export default function RequestView() {
    const { id } = useParams();

    const [request, setRequest] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast("Loading request details...", "loading");

        const [requestRes, logRes, signaturesRes] = await Promise.all([
            RequestHandler.fetchData("GET", `request-letter/get/${id}`),
            RequestHandler.fetchData("GET", `request-letter/logs/${id}`),
            RequestHandler.fetchData("GET", `signature/signatures/${id}`),
        ]);

        if (requestRes.success) setRequest(requestRes.requestLetter);
        if (logRes.success) setLogs(logRes.logs);
        if (signaturesRes.success) setSignatures(signaturesRes.signatures);

        console.log(requestRes.requestLetter )
        removeToast(toastId);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [id]);

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'TO_RECEIVE': 'bg-amber-100 text-amber-700 border-amber-200',
            'ONGOING': 'bg-blue-100 text-blue-700 border-blue-200',
            'TO_RELEASE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'DECLINED': 'bg-red-100 text-red-700 border-red-200',
            'COMPLETED': 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getStatusIcon = (status: string) => {
        const icons: { [key: string]: JSX.Element } = {
            'TO_RECEIVE': <Clock size={14} />,
            'ONGOING': <Circle size={14} className="animate-pulse" />,
            'TO_RELEASE': <CheckCircle2 size={14} />,
            'DECLINED': <XCircle size={14} />,
            'COMPLETED': <CheckCircle2 size={14} />,
        };
        return icons[status] || <Circle size={14} />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const timelineVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (custom: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: custom * 0.1,
                duration: 0.4,
                ease: "easeOut"
            }
        })
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center min-h-[600px] space-y-4"
                    >
                        <Loader2 size={48} className="text-blue-600 animate-spin" />
                        <div className="text-center">
                            <p className="text-lg font-semibold text-slate-800 mb-1">
                                Loading Request Details
                            </p>
                            <p className="text-sm text-slate-600">
                                Please wait while we fetch your request information...
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center min-h-[600px] space-y-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="p-4 bg-red-100 rounded-full"
                        >
                            <XCircle size={48} className="text-red-600" />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-slate-800 mb-1">
                                Request Not Found
                            </p>
                            <p className="text-sm text-slate-600">
                                The request you're looking for doesn't exist or has been removed.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto"
            >
                <motion.div variants={itemVariants} className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Request Details
                    </h1>
                    <p className="text-sm text-slate-600">
                        View and track your request status and timeline
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline Section */}
                    <motion.div
                        variants={cardVariants}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-5 py-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600" />
                                    Request Timeline
                                </h3>
                            </div>

                            <div className="p-5">
                                <AnimatePresence mode="wait">
                                    {logs.length > 0 ? (
                                        <motion.ol
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-5"
                                        >
                                            {logs.map((log, index) => (
                                                <motion.li
                                                    key={log.id}
                                                    custom={index}
                                                    variants={timelineVariants}
                                                    className="relative pl-7"
                                                >
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                                                        className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"
                                                    />

                                                    {index !== logs.length - 1 && (
                                                        <motion.span
                                                            initial={{ scaleY: 0 }}
                                                            animate={{ scaleY: 1 }}
                                                            transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                                                            style={{ originY: 0 }}
                                                            className="absolute left-[5px] top-5 h-full w-0.5 bg-gradient-to-b from-blue-200 to-transparent"
                                                        />
                                                    )}

                                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                        <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(log.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>

                                                        <div className={`font-semibold text-sm text-slate-800 mb-1`}>
                                                            {log.action}
                                                        </div>

                                                        {log.actedBy && (
                                                            <div className="text-xs text-slate-500 mb-2">
                                                                <span className="font-medium">By: </span>{log.actedByName}
                                                            </div>
                                                        )}

                                                        <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                                                            <Building2 size={12} className="text-slate-400" />
                                                            <span className="font-medium">
                                                                {log.fromDepartmentName || "System"}
                                                            </span>
                                                            {log.toDepartmentName && (
                                                                <>
                                                                    <ArrowRight size={12} className="text-slate-400" />
                                                                    <span className="font-medium">
                                                                        {log.toDepartmentName}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {log.remarks && (
                                                            <div className="text-xs text-slate-600 bg-white rounded px-2 py-1.5 border border-slate-200">
                                                                <span className="italic">"{log.remarks}"</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </motion.ol>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="text-center py-8"
                                        >
                                            <Clock size={32} className="mx-auto mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-600 font-medium">
                                                No timeline events yet
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Events will appear here as the request progresses
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content Section */}
                    <motion.div
                        variants={cardVariants}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-600" />
                                            Request #{request.requestNo}
                                        </h2>
                                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                            <Clock size={12} />
                                            Created on{" "}
                                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border ${getStatusColor(request.status)}`}
                                    >
                                        {getStatusIcon(request.status)}
                                        {request.status}
                                    </motion.span>
                                </div>
                            </div>

                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                                className="p-6 space-y-6"
                            >
                                {/* Info Cards */}
                                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <User size={18} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-600 mb-1">
                                                    Requester
                                                </p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {request.requesterName}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <Building2 size={18} className="text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-600 mb-1">
                                                    Current Department
                                                </p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {request.currentDepartmentName || request.currentDepartmentId}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Purpose Section */}
                                <motion.div variants={itemVariants}>
                                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Purpose
                                    </h4>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                                    >
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                            {request.purpose}
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* Signatures Section */}
                                <motion.div variants={itemVariants}>
                                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Signatures ({signatures.length})
                                    </h4>

                                    {signatures.length > 0 ? (
                                        <div className="space-y-3">
                                            {signatures.map((signature, index) => (
                                                <motion.div
                                                    key={signature.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.01 }}
                                                    className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                                <CheckCircle2 size={20} className="text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {signature.userInfo?.name || 'Unknown User'}
                                                                </p>
                                                                <p className="text-xs text-slate-600">
                                                                    {signature.userInfo?.email || 'No email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                                                                <Clock size={10} />
                                                                {new Date(signature.signedAt).toLocaleString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50"
                                        >
                                            <CheckCircle2 className="mx-auto mb-3 text-slate-400" size={32} />
                                            <p className="text-sm text-slate-600 font-medium mb-1">
                                                No signatures yet
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Signatures will appear here once the request is reviewed
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Documents Section */}
                                <motion.div variants={itemVariants}>
                                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Uploaded Documents 
                                    </h4>

                                    {request.requestUploadedDocuments ? (
                                        request.requestUploadedDocuments.split(",").map((fileUrl: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <FileText size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                Request Document {index + 1}
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                Uploaded {new Date(request.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <motion.a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        >
                                                            <Download size={18} className="text-blue-600" />
                                                        </motion.a>

                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50"
                                        >
                                            <FileText className="mx-auto mb-3 text-slate-400" size={32} />
                                            <p className="text-sm text-slate-600 font-medium mb-1">
                                                No documents uploaded
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                No files have been attached to this request
                                            </p>
                                        </motion.div>
                                    )}

                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}