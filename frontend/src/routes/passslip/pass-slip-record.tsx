import { useEffect, useState } from "react";
import { Eye, Edit, FileText } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MyPassSlips() {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const columns = [
        { key: "id", label: "ID" },
        { key: "purpose", label: "Purpose" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        { key: "timeOut", label: "Time Out" },
        { key: "timeIn", label: "Time In" },
        { key: "createdAt", label: "Created At" },
    ];

    const editPassSlipFields = [
        {
            name: "purpose",
            label: "Purpose",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Enter purpose of pass slip...",
        },
        {
            name: "reason",
            label: "Reason",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Enter reason for pass slip...",
        },
        {
            name: "timeOut",
            label: "Time Out",
            type: "datetime-local",
            required: true,
        },
        {
            name: "timeIn",
            label: "Time In",
            type: "datetime-local",
        },
        {
            name: "forwardToHR",
            label: "Forward to HR",
            type: "checkbox",
        },
    ];

    const fetchPassSlips = async () => {
        setLoading(true);
        const toastId = showToast("Fetching your pass slips...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "pass-slip/get-all",
            {}
        );

        if (res.success && res.passslips) {
            const formatted = res.passslips.map((p: any) => ({
                id: p.id,
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
            console.error(res);
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchPassSlips();
    }, []);

    const handleEditSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Updating pass slip...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `pass-slip/update/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Pass slip updated successfully.", "success");
                setIsEditOpen(false);
                fetchPassSlips();
            } else {
                showToast(res.message || "Failed to update pass slip.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
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
                            {row.purpose}
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
                            <span className="text-sm text-slate-600">Purpose:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.purpose}</span>
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
                            <span className="text-sm text-slate-600">Created At:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.createdAt}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Reason</p>
                <p className="text-base text-blue-700">{row.reason}</p>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => (
        <div className="flex gap-1">
            <button
                onClick={() => navigate(`/pass-slip/${row.id}`)}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                title="View Pass Slip"
            >
                <Eye size={14} />
            </button>

            {row.status === "PENDING" && (
                <button
                    onClick={() => {
                        const formattedSelectedRow = {
                            ...row,
                            timeOut: row.timeOut && row.timeOut !== "—"
                                ? new Date(row.timeOut)
                                : null,
                            timeIn: row.timeIn && row.timeIn !== "—"
                                ? new Date(row.timeIn)
                                : null,
                        };
                        setSelectedRow(formattedSelectedRow);
                        setIsEditOpen(true);
                    }}
                    className="p-1.5 hover:bg-amber-100 text-amber-600 rounded"
                    title="Edit Pass Slip"
                >
                    <Edit size={14} />
                </button>
            )}
        </div>
    );

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
                    My Pass Slips
                </h1>
                <p className="text-base text-slate-600">
                    View and manage your submitted pass slips. Expand each entry to see detailed information and perform edits if necessary.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Pass Slips"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />

                {isEditOpen && selectedRow && (
                    <DynamicForm
                        isModal={true}
                        isOpen={isEditOpen}
                        title="Edit Pass Slip"
                        fields={editPassSlipFields}
                        initialData={selectedRow}
                        onSubmit={handleEditSubmit}
                        actionType="UPDATE"
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
