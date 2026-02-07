import { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Clock, MessageSquare, Download, User, FileText } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AdminSuggestionsTableProps {
    status: "PENDING" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
    title: string;
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean;
}

export default function AdminSuggestionsTable({ status, title, isDean, isPresident, isMISD }: AdminSuggestionsTableProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const columns = [
        { key: "id", label: "ID" },
        { key: "type", label: "Type" },
        { key: "category", label: "Category" },
        { key: "subject", label: "Subject" },
        { key: "priority", label: "Priority" },
        { key: "submittedBy", label: "Submitted By" },
        { key: "createdAt", label: "Submitted" },
    ];

    const responseFields = [
        {
            name: "adminResponse",
            label: "Admin Response",
            type: "textarea",
            required: true,
            rows: 6,
            placeholder: "Enter your response to the user...",
        },
    ];

    const canEdit = isMISD;
    const canView = isMISD || isDean || isPresident;

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast(`Fetching ${status.toLowerCase().replace("_", " ")} records...`, "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            `suggestion-problem/admin/get-by-status/${status}`,
            {}
        );

        if (res.success && res.suggestions) {
            const formatted = res.suggestions.map((s: any) => ({
                id: s.id,
                userId: s.userId,
                type: s.type,
                category: s.category.replace("_", " "),
                subject: s.subject,
                description: s.description,
                priority: s.priority,
                priorityRaw: s.priority,
                status: s.status.replace(/_/g, " "),
                statusRaw: s.status,
                isAnonymous: s.isAnonymous,
                attachedFile: s.attachedFile,
                adminResponse: s.adminResponse || "—",
                submittedBy: s.isAnonymous
                    ? "Anonymous"
                    : s.User
                        ? `${s.User.firstName} ${s.User.lastName}`
                        : "Unknown",
                submitterEmail: s.isAnonymous ? "—" : s.User?.email || "—",
                reviewedAt: s.reviewedAt ? new Date(s.reviewedAt).toLocaleString("en-PH") : "—",
                resolvedAt: s.resolvedAt ? new Date(s.resolvedAt).toLocaleString("en-PH") : "—",
                createdAt: new Date(s.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast("Records loaded.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch records.", "error");
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchData();
    }, [status]);

    const handleStatusChange = async (newStatus: string, rowId: number) => {
        const toastId = showToast("Updating status...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `suggestion-problem/admin/update-status/${rowId}`,
                { status: newStatus }
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Status updated successfully.", "success");
                fetchData();
            } else {
                showToast(res.message || "Failed to update status.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const handleResponseSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Submitting response...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `suggestion-problem/admin/update-status/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Response submitted successfully.", "success");
                setIsResponseModalOpen(false);
                fetchData();
            } else {
                showToast(res.message || "Failed to submit response.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW": return "text-green-600";
            case "MEDIUM": return "text-yellow-600";
            case "HIGH": return "text-orange-600";
            case "URGENT": return "text-red-600";
            default: return "text-slate-600";
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
                        <h4 className="text-base font-bold text-slate-800">{row.type} Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.category} • Submitted by {row.submittedBy}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getPriorityColor(row.priority)}`}>
                        {row.priority}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <User size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Submitter Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Type:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Category:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Submitted By:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.submittedBy}</span>
                        </div>
                        {row.submitterEmail !== "—" && (
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Email:</span>
                                <span className="text-sm font-semibold text-slate-800">{row.submitterEmail}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Timeline</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Submitted:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.createdAt}</span>
                        </div>
                        {row.reviewedAt !== "—" && (
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Reviewed:</span>
                                <span className="text-sm font-semibold text-slate-800">{row.reviewedAt}</span>
                            </div>
                        )}
                        {row.resolvedAt !== "—" && (
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Resolved:</span>
                                <span className="text-sm font-semibold text-slate-800">{row.resolvedAt}</span>
                            </div>
                        )}
                        {row.attachedFile && (
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                <span className="text-sm text-slate-600">Attachment:</span>
                                <a
                                    href={row.attachedFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    <Download size={14} />
                                    View File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Subject</p>
                <p className="text-base text-blue-700 font-medium">{row.subject}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Description</p>
                <p className="text-base text-blue-700 leading-relaxed">{row.description}</p>
            </div>

            {row.adminResponse !== "—" && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-1">Admin Response</p>
                    <p className="text-base text-green-700 leading-relaxed">{row.adminResponse}</p>
                </div>
            )}
        </motion.div>
    );

    const renderActions = (row: any) => {
        // Don't show any actions if user doesn't have permission
        if (!canView) return null;

        // Dean and President can only view
        if (!canEdit) {
            return (
                <div className="flex gap-1">
                    <button
                        onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            );
        }

        switch (status) {
            case "PENDING":
                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                            title="View Details"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={() => handleStatusChange("UNDER_REVIEW", row.id)}
                            className="p-1.5 hover:bg-purple-100 text-purple-600 rounded"
                            title="Move to Under Review"
                        >
                            <Clock size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRow(row);
                                setIsResponseModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded"
                            title="Add Response"
                        >
                            <MessageSquare size={14} />
                        </button>
                    </div>
                );

            case "UNDER_REVIEW":
                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                            title="View Details"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={() => handleStatusChange("IN_PROGRESS", row.id)}
                            className="p-1.5 hover:bg-yellow-100 text-yellow-600 rounded"
                            title="Move to In Progress"
                        >
                            <Clock size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRow(row);
                                setIsResponseModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded"
                            title="Add Response"
                        >
                            <MessageSquare size={14} />
                        </button>
                    </div>
                );

            case "IN_PROGRESS":
                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                            title="View Details"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={() => handleStatusChange("RESOLVED", row.id)}
                            className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                            title="Mark as Resolved"
                        >
                            <CheckCircle size={14} />
                        </button>
                        <button
                            onClick={() => handleStatusChange("REJECTED", row.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                            title="Reject"
                        >
                            <XCircle size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRow(row);
                                setIsResponseModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded"
                            title="Add Response"
                        >
                            <MessageSquare size={14} />
                        </button>
                    </div>
                );

            case "RESOLVED":
            case "REJECTED":
                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                            title="View Details"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRow(row);
                                setIsResponseModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded"
                            title="Update Response"
                        >
                            <MessageSquare size={14} />
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!canView) {
        return (
            <div className="p-4 sm:p-6 min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
                    <p className="text-slate-600">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

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
                    {title}
                </h1>
                <p className="text-base text-slate-600">
                    View and manage suggestions or problem reports based on their status.
                    You can respond, update status, or review submissions here.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title={title}
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            {isResponseModalOpen && selectedRow && canEdit && (
                <DynamicForm
                    isModal
                    isOpen={isResponseModalOpen}
                    title="Admin Response"
                    fields={responseFields}
                    initialData={selectedRow}
                    onSubmit={handleResponseSubmit}
                    actionType="UPDATE"
                    onClose={() => setIsResponseModalOpen(false)}
                />
            )}
        </motion.div>
    );
}