import { useEffect, useState } from "react";
import { Calendar, Check, Clock, Eye, FileText, X } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type PassSlipsHRProps = {
    isDean: boolean;
    isPresident: boolean;
};

export default function PassSlipsHR({ isDean, isPresident }: PassSlipsHRProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requesterName", label: "Employee", sortable: true },
        { key: "purpose", label: "Purpose", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
            key: "timeOut",
            label: "Time Out",
            sortable: true,
            icon: <Calendar size={14} />,
        },
    ];

    const fetchPassSlips = async () => {
        setLoading(true);
        const toastId = showToast("Fetching pass slips...", "loading");

        let res: any;
        if (isDean || isPresident) {
            res = await RequestHandler.fetchData(
                "GET",
                "pass-slip/get-all-higherup",
                {}
            );
        }
        else {
            res = await RequestHandler.fetchData(
                "GET",
                "pass-slip/get-all-department",
                {}
            );
        }

        if (res.success && res.passslips) {
            const formatted = res.passslips.map((p: any) => ({
                id: p.id,
                requesterName: `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`,
                purpose: p.purpose,
                reason: p.reason,
                status: p.status,
                forwardToHR: p.forwardToHR,
                timeOut: new Date(p.timeOut).toLocaleString("en-PH"),
                timeIn: p.timeIn
                    ? new Date(p.timeIn).toLocaleString("en-PH")
                    : "—",
                createdAt: new Date(p.createdAt).toLocaleString("en-PH"),
            }));

            setData(formatted);
            showToast("Pass slips loaded.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch pass slips.", "error");
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchPassSlips();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        const toastId = showToast("Updating status...", "loading");

        const res = await RequestHandler.fetchData(
            "PUT",
            `pass-slip/update-status/${id}`,
            { status }
        );

        removeToast(toastId);

        if (res.success) {
            showToast(`Pass slip ${status.toLowerCase()}.`, "success");
            fetchPassSlips();
        } else {
            showToast("Failed to update status.", "error");
        }
    };

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
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Pass Slip Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.requesterName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${row.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                            : row.status === "APPROVED"
                                ? "bg-green-50 text-green-700 border-green-300"
                                : "bg-red-50 text-red-700 border-red-300"
                        }`}>
                        {row.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-sm font-bold text-slate-800">Request Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Employee:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.requesterName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Forwarded to HR:</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${row.forwardToHR
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-slate-100 text-slate-700 border border-slate-300"
                                }`}>
                                {row.forwardToHR ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className={`text-sm font-semibold ${row.status === "PENDING"
                                    ? "text-yellow-600"
                                    : row.status === "APPROVED"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}>
                                {row.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Time Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Created:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {row.createdAt}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Reason for Pass Slip</p>
                <p className="text-base text-blue-700">{row.reason}</p>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => {
        if (!isDean && !isPresident) {
            return (
                <button
                    onClick={() => navigate(`/pass-slip/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Pass Slip"
                >
                    <Eye size={14} />
                </button>
            );
        }

        return (
            <>
                <button
                    onClick={() => navigate(`/pass-slip/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Pass Slip"
                >
                    <Eye size={14} />
                </button>
                {isDean && row.status === "PENDING" && <>
                    <button
                        onClick={() => updateStatus(row.id, "APPROVED BY DEAN")}
                        className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                        title="Approve"
                    >
                        <Check size={14} />
                    </button>

                    <button
                        onClick={() => updateStatus(row.id, "REJECTED")}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Reject"
                    >
                        <X size={14} />
                    </button></>
                }
                {isPresident && row.status === "APPROVED BY DEAN" && <>
                    <button
                        onClick={() => updateStatus(row.id, "APPROVED BY PRESIDENT")}
                        className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                        title="Approve"
                    >
                        <Check size={14} />
                    </button>

                    <button
                        onClick={() => updateStatus(row.id, "REJECTED")}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Reject"
                    >
                        <X size={14} />
                    </button></>
                }
            </>
        );
    };

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Pass Slips Record
                </h1>
                <p className="text-base text-slate-600">
                    Review, approve, or reject employee pass slip requests.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="Pass Slips Record"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>
        </motion.div>

    );
}
