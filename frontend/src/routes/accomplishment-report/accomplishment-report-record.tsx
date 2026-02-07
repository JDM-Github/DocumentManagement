import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Eye,
    Edit,
    Trash2,
    FileText,
    Download,
    CheckCircle,
    ChevronRight,
    UserCheck,
    MessageSquare,
    AlertTriangle
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { useNavigate } from "react-router-dom";

export default function MyAccomplishmentRecord() {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const columns = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            width: "60px",
        },
        {
            key: "reportNo",
            label: "Report Number",
            sortable: true,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
        },
        {
            key: "createdAt",
            label: "Date Created",
            sortable: true,
            icon: <Calendar size={14} />,
        },
        {
            key: "entriesCount",
            label: "Entries",
            sortable: true,
        },
    ];

    const fetchRecords = async () => {
        setLoading(true);
        const toastId = showToast("Fetching accomplishment records...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "accomplishment/get-all", {});
            removeToast(toastId);

            if (res.success && res.reports) {
                const formatted = res.reports.map((r: any) => ({
                    id: r.id,
                    reportNo: `ACR-${String(r.id).padStart(4, '0')}`,
                    createdAt: new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: r.status,
                    entriesCount: r.entries?.length || 0,
                    entries: r.entries,
                    uploadedUrl: r.uploadedUrl,
                    remarks: r.remarks,
                }));
                setData(formatted);
            } else {
                setData([]);
                showToast("Failed to fetch records.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
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
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Report Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.entriesCount} {row.entriesCount === 1 ? 'entry' : 'entries'}
                        </p>
                    </div>
                </div>

                {row.uploadedUrl && (
                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={row.uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                    >
                        <Download size={16} />
                        Download PDF
                    </motion.a>
                )}
            </div>

            {row.remarks && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Report Remarks</p>
                            <p className="text-base text-blue-700 italic">"{row.remarks}"</p>
                        </div>
                    </div>
                </div>
            )}

            {row.entries?.length > 0 && (
                <div className="space-y-3">
                    <h5 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                        Daily Entries
                    </h5>

                    <AnimatePresence>
                        {row.entries.map((entry: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative overflow-hidden rounded-xl border-2 transition-all ${entry.signedBy
                                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                                    }`}
                            >
                                {entry.signedBy && (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                                            <CheckCircle size={12} />
                                            Signed
                                        </span>
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                            <Calendar size={14} className="text-blue-600" />
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

                                    <div className="mb-3">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">Activities:</p>
                                        <ul className="space-y-1.5">
                                            {entry.activities.map((act: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                                                    <ChevronRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>{act}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {entry.remarks && (
                                        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 mb-3">
                                            <p className="text-sm text-slate-600">
                                                <span className="font-semibold">Note: </span>
                                                <span className="italic">"{entry.remarks}"</span>
                                            </p>
                                        </div>
                                    )}

                                    {entry.signedBy && (
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                                            <div className="p-1 bg-green-100 rounded">
                                                <UserCheck size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-sm text-green-700 font-medium">
                                                Signed by User #{entry.signedBy}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );

    const renderActions = (row: any) => (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/accomplishment/${row.id}`)}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                title="View Report"
            >
                <Eye size={16} />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedRecord(row); setIsEditOpen(true); }}
                className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                title="Edit Report"
            >
                <Edit size={16} />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedRecord(row); setIsDeleteOpen(true); }}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Delete Report"
            >
                <Trash2 size={16} />
            </motion.button>
        </>
    );

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
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
                    My Accomplishment Records
                </h1>
                <p className="text-base text-slate-600">
                    Track and manage your submitted accomplishment reports. Expand a row to view details, edit remarks, or delete a report.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Accomplishment Records"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable={true}
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isEditOpen && selectedRecord && (
                    <DynamicForm
                        isModal
                        isOpen={isEditOpen}
                        title="✏️ Edit Accomplishment Report"
                        fields={[
                            {
                                name: "remarks",
                                label: "Report Remarks",
                                type: "textarea",
                                rows: 5,
                                required: false,
                                placeholder: "Add any comments or notes about this report...",
                                icon: <MessageSquare size={16} />,
                            }
                        ]}
                        initialData={selectedRecord}
                        onSubmit={async (data) => {
                            const toastId = showToast("Updating report...", "loading");
                            try {
                                await RequestHandler.fetchData("PUT", `accomplishment/update/${selectedRecord.id}`, data);
                                removeToast(toastId);
                                showToast("Report updated successfully!", "success");
                                setIsEditOpen(false);
                                fetchRecords();
                            } catch (error) {
                                removeToast(toastId);
                                showToast("Failed to update report", "error");
                            }
                        }}
                        actionType="UPDATE"
                        submitButtonText="Update Report"
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteOpen && selectedRecord && (
                    <DynamicForm
                        isModal
                        isOpen={isDeleteOpen}
                        title="🗑️ Delete Accomplishment Report"
                        fields={[
                            {
                                name: "confirm",
                                label: "Type DELETE to confirm",
                                type: "text",
                                required: true,
                                placeholder: "DELETE",
                                icon: <AlertTriangle size={16} />,
                                validation: (value: string) => {
                                    if (value !== "DELETE") return "Please type DELETE to confirm deletion";
                                },
                            }
                        ]}
                        onSubmit={async () => {
                            const toastId = showToast("Deleting report...", "loading");
                            try {
                                await RequestHandler.fetchData("DELETE", `accomplishment/delete/${selectedRecord.id}`, {});
                                removeToast(toastId);
                                showToast("Report deleted successfully!", "success");
                                setIsDeleteOpen(false);
                                fetchRecords();
                            } catch (error) {
                                removeToast(toastId);
                                showToast("Failed to delete report", "error");
                            }
                        }}
                        actionType="DELETE"
                        submitButtonText="Delete Report"
                        onClose={() => setIsDeleteOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}