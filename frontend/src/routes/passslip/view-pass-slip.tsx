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
} from "lucide-react";
import { useParams } from "react-router-dom";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function ViewPassSlip() {
    const { id } = useParams();
    const [passSlip, setPassSlip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPassSlip = async () => {
        setLoading(true);
        const toastId = showToast("Loading pass slip...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            `pass-slip/get/${id}`,
            {}
        );

        if (res.success) {
            setPassSlip(res.passSlip);
        }

        removeToast(toastId);
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchPassSlip();
    }, [id]);

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700 border-amber-200",
            APPROVED: "bg-green-100 text-green-700 border-green-200",
            REJECTED: "bg-red-100 text-red-700 border-red-200",
        };
        return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-slate-600">Loading pass slip...</p>
                </div>
            </div>
        );
    }

    if (!passSlip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <XCircle size={48} className="text-red-600 mx-auto" />
                    <p className="text-sm text-slate-600">Pass slip not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Pass Slip #{passSlip.id}
                        </h1>
                        <p className="text-xs text-slate-600 mt-1">
                            Created on{" "}
                            {new Date(passSlip.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border ${getStatusColor(
                            passSlip.status
                        )}`}
                    >
                        {getStatusIcon(passSlip.status)}
                        {passSlip.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Employee</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {passSlip.user
                                        ? `${passSlip.user.firstName} ${passSlip.user.lastName}`
                                        : passSlip.userId}
                                </p>
                                {passSlip.user?.email && (
                                    <p className="text-xs text-slate-500">{passSlip.user.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Building2 size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Department</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {passSlip.department.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        Time Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-600">Time Out:</span>
                            <span className="ml-2 font-medium">
                                {new Date(passSlip.timeOut).toLocaleString("en-PH")}
                            </span>
                        </div>

                        <div>
                            <span className="text-slate-600">Time In:</span>
                            <span className="ml-2 font-medium">
                                {passSlip.timeIn
                                    ? new Date(passSlip.timeIn).toLocaleString("en-PH")
                                    : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Purpose</h4>
                        <p className="text-sm text-slate-700">{passSlip.purpose}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Reason</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{passSlip.reason}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600">Forwarded to HR:</span>
                        <span className="font-semibold">{passSlip.forwardToHR ? "Yes" : "No"}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
