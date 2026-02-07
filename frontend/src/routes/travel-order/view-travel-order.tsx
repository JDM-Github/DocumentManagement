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
    MapPin,
    Car,
    Calendar,
    MessageSquare,
    Target,
    UserCheck,
    Paperclip,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { ViewSignatureStatus } from "../../components/view-signature-status";

export default function ViewTravelOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [travelOrder, setTravelOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchTravelOrder = async () => {
        setLoading(true);
        const toastId = showToast("Loading travel order...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", `travel-order/get/${id}`, {});
            if (res.success && res.travelOrder) {
                setTravelOrder(res.travelOrder);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load travel order", "error");
        } finally {
            removeToast(toastId);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTravelOrder();
    }, [id]);

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            PENDING: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200",
            "APPROVED BY DEAN": "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200",
            "APPROVED BY PRESIDENT": "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200",
            REJECTED: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200",
        };
        return map[status] || "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200";
    };

    const getStatusIcon = (status: string): JSX.Element => {
        const map: Record<string, JSX.Element> = {
            PENDING: <Circle size={14} className="animate-pulse" />,
            "APPROVED BY DEAN": <CheckCircle2 size={14} />,
            "APPROVED BY PRESIDENT": <CheckCircle2 size={14} />,
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
                        <p className="text-lg font-semibold text-slate-800">Loading Travel Order</p>
                        <p className="text-sm text-slate-600">Please wait while we fetch the details...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!travelOrder) {
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
                        <p className="text-lg font-semibold text-slate-800 mb-1">Travel Order Not Found</p>
                        <p className="text-sm text-slate-600 mb-4">
                            The travel order you're looking for doesn't exist or has been removed.
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

    const isApproved = travelOrder.status === "APPROVED BY PRESIDENT";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto space-y-6"
            >
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
                                        Travel Order Details
                                    </h1>
                                    <p className="text-base text-slate-600 flex items-center gap-2">
                                        <span className="font-mono font-semibold">
                                            TO-{String(travelOrder.id).padStart(5, "0")}
                                        </span>
                                        <span>•</span>
                                        <Clock size={14} />
                                        {new Date(travelOrder.createdAt).toLocaleDateString("en-US", {
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
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${isApproved
                                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                                        : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                                        }`}
                                >
                                    {isApproved ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Approved
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} />
                                            Pending
                                        </>
                                    )}
                                </motion.span>

                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(
                                        travelOrder.status
                                    )}`}
                                >
                                    {getStatusIcon(travelOrder.status)}
                                    {travelOrder.status}
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {travelOrder.transportationUsed?.replace("_", " ")}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Transportation</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {travelOrder.purposeType?.replace("_", " ")}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Purpose Type</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {travelOrder.forwardToHR ? "Yes" : "No"}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Forwarded to HR</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {travelOrder.attachedFile ? "✓" : "—"}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Attachment</p>
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
                                    {travelOrder.user
                                        ? `${travelOrder.user.firstName} ${travelOrder.user.lastName}`
                                        : `User ID: ${travelOrder.userId}`}
                                </p>
                                {travelOrder.user?.email && (
                                    <p className="text-sm text-slate-600 mt-1">{travelOrder.user.email}</p>
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
                                    {travelOrder.department?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Travel Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <MapPin size={18} className="text-blue-600" />
                            Travel Details
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Destination */}
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">Destination</p>
                                    <p className="text-base text-blue-700">{travelOrder.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Transportation */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Car size={14} />
                                    <span className="font-medium">Transportation</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.transportationUsed?.replace("_", " ")}
                                </p>
                            </div>

                            {/* Purpose Type */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Target size={14} />
                                    <span className="font-medium">Purpose Type</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.purposeType?.replace("_", " ")}
                                </p>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar size={14} />
                                    <span className="font-medium">Date From</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.dateOfDepartureFrom
                                        ? new Date(travelOrder.dateOfDepartureFrom).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </p>
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar size={14} />
                                    <span className="font-medium">Date To</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.dateOfDepartureTo
                                        ? new Date(travelOrder.dateOfDepartureTo).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </p>
                            </div>

                            {/* Time of Departure */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock size={14} />
                                    <span className="font-medium">Time of Departure</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.timeOfDeparture || "—"}
                                </p>
                            </div>

                            {/* Time of Arrival */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock size={14} />
                                    <span className="font-medium">Time of Arrival</span>
                                </div>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {travelOrder.timeOfArrival || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Purpose & Additional Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4"
                >
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Additional Information
                    </h3>

                    {/* Purpose */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2">
                            <MessageSquare size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900 mb-1">Purpose</p>
                                <p className="text-base text-slate-700 whitespace-pre-line">
                                    {travelOrder.purpose}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attached File */}
                    {travelOrder.attachedFile && (
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Paperclip size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-900 mb-1">Attached File</p>
                                    <a
                                        href={`/${travelOrder.attachedFile}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base text-orange-700 hover:text-orange-800 hover:underline"
                                    >
                                        View Attachment
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <UserCheck size={16} className="text-purple-600" />
                        <span className="text-sm text-slate-600">Forwarded to HR:</span>
                        <span
                            className={`text-sm font-semibold ${travelOrder.forwardToHR ? "text-purple-700" : "text-slate-700"
                                }`}
                        >
                            {travelOrder.forwardToHR ? "Yes" : "No"}
                        </span>
                    </div>
                </motion.div>

                <ViewSignatureStatus
                    isHaveDeanSignature={travelOrder.isHaveDeanSignature}
                    isHavePresidentSignature={travelOrder.isHavePresidentSignature}
                />
            </motion.div>
        </div >
    );
}