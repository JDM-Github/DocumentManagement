import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Eye,
    CheckCircle,
    Clock,
    FileText,
    UserCheck,
    AlertCircle,
    Download,
    Edit3,
    ChevronRight
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { useNavigate } from "react-router-dom";

export default function AccomplishmentRecord({ isHead }: { isHead: boolean }) {
    const navigate = useNavigate();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [isSignOpen, setIsSignOpen] = useState(false);

    const isReportComplete = (entries: any[]) =>
        entries.length > 0 && entries.every((e) => e.signedBy);

    const columns = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            width: "60px",
            render: (row: any) => (
                <span className="font-mono text-xs text-slate-600">#{row.id}</span>
            )
        },
        {
            key: "reportNo",
            label: "Report Number",
            sortable: true,
            render: (row: any) => (
                <span className="font-semibold text-slate-800">{row.reportNo}</span>
            )
        },
        {
            key: "createdAt",
            label: "Date Created",
            sortable: true,
            icon: <Calendar size={14} />,
            render: (row: any) => (
                <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-sm text-slate-600">{row.createdAt}</span>
                </div>
            )
        },
        {
            key: "entriesCount",
            label: "Entries",
            sortable: true,
            render: (row: any) => (
                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {row.entriesCount}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (row: any) =>
                isReportComplete(row.entries) ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                        <CheckCircle size={12} /> Completed
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200">
                        <AlertCircle size={12} /> Pending Review
                    </span>
                ),
        },
    ];

    const fetchRecords = async () => {
        setLoading(true);
        const toastId = showToast("Fetching accomplishment records...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "accomplishment/get-all-department",
                {}
            );
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
                    entriesCount: r.entries?.length || 0,
                    entries: r.entries || [],
                    uploadedUrl: r.uploadedUrl,
                    remarks: r.remarks,
                }));
                setData(formatted);
            } else {
                setData([]);
            }
        } catch (err) {
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Report Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.entriesCount} {row.entriesCount === 1 ? "entry" : "entries"} •{" "}
                            {isReportComplete(row.entries) ? "All signed" : "Awaiting signatures"}
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

            {/* Report Remarks */}
            {row.remarks && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Report Remarks</p>
                    <p className="text-base text-blue-700 italic">"{row.remarks}"</p>
                </div>
            )}

            {/* Entries */}
            <div className="space-y-3">
                <h5 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    Daily Entries
                </h5>

                <AnimatePresence>
                    {row.entries.map((entry: any, index: number) => (
                        <motion.div
                            key={entry.id}
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
                                {/* Date */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Calendar size={14} className="text-blue-600" />
                                    </div>
                                    <span className="text-base font-bold text-slate-800">
                                        {new Date(entry.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                {/* Activities */}
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-slate-600 mb-2">
                                        Activities:
                                    </p>
                                    <ul className="space-y-1.5">
                                        {entry.activities.map((act: string, i: number) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-base text-slate-700"
                                            >
                                                <ChevronRight
                                                    size={14}
                                                    className="text-blue-500 mt-0.5 flex-shrink-0"
                                                />
                                                <span>{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Entry Remarks */}
                                {entry.remarks && (
                                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 mb-3">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-semibold">Note: </span>
                                            <span className="italic">"{entry.remarks}"</span>
                                        </p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                    {entry.signedBy ? (
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-green-100 rounded">
                                                <UserCheck size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-sm text-green-700 font-medium">
                                                Signed by User #{entry.signedBy}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                Awaiting review
                                            </span>

                                            {isHead && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setSelectedEntry(entry);
                                                        setIsSignOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                                >
                                                    <Edit3 size={14} />
                                                    Review & Sign
                                                </motion.button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/accomplishment/${row.id}`)}
            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
            title="View Details"
        >
            <Eye size={16} />
        </motion.button>
    );

    return (
        <div className="p-4 sm:p-6 min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DataTable
                    title="Department Accomplishment Records"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isSignOpen && selectedEntry && (
                    <DynamicForm
                        isModal
                        isOpen={isSignOpen}
                        title="Review & Sign Entry"
                        fields={[
                            {
                                name: "date",
                                label: "Entry Date",
                                type: "text",
                                disabled: true,
                                icon: <Calendar size={14} />,
                                placeholder: new Date(selectedEntry.date).toLocaleDateString("en-US", {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }),
                            },
                            {
                                name: "remarks",
                                label: "Review Remarks (Optional)",
                                type: "textarea",
                                rows: 4,
                                required: false,
                                placeholder: "Add any comments or feedback about this entry...",
                            },
                        ]}
                        onSubmit={async (data) => {
                            const toastId = showToast("Signing entry...", "loading");
                            try {
                                await RequestHandler.fetchData(
                                    "PUT",
                                    `accomplishment/sign-entry/${selectedEntry.id}`,
                                    data
                                );
                                removeToast(toastId);
                                showToast("Entry signed successfully!", "success");
                                setIsSignOpen(false);
                                fetchRecords();
                            } catch (error) {
                                removeToast(toastId);
                                showToast("Failed to sign entry", "error");
                            }
                        }}
                        actionType="UPDATE"
                        submitButtonText="Sign Entry"
                        onClose={() => setIsSignOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}