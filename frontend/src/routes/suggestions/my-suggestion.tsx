import { useEffect, useState } from "react";
import { Clock, Download, Edit, Eye, FileText, Trash2 } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MySuggestionsAndProblems() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const navigate = useNavigate();
    const columns = [
        { key: "id", label: "ID" },
        { key: "type", label: "Type" },
        { key: "category", label: "Category" },
        { key: "subject", label: "Subject" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Submitted" },
    ];

    const editFields = [
        {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            options: [
                { value: "SUGGESTION", label: "Suggestion" },
                { value: "PROBLEM", label: "Problem/Issue" },
            ],
        },
        {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: [
                { value: "FACILITIES", label: "Facilities" },
                { value: "ACADEMIC", label: "Academic" },
                { value: "ADMINISTRATIVE", label: "Administrative" },
                { value: "TECHNOLOGY", label: "Technology/IT" },
                { value: "SAFETY", label: "Safety & Security" },
                { value: "HR", label: "Human Resources" },
                { value: "OTHER", label: "Other" },
            ],
        },
        {
            name: "priority",
            label: "Priority Level",
            type: "select",
            required: true,
            options: [
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
            ],
        },
        {
            name: "subject",
            label: "Subject",
            type: "text",
            required: true,
            placeholder: "Brief summary...",
        },
        {
            name: "description",
            label: "Detailed Description",
            type: "textarea",
            required: true,
            rows: 6,
            placeholder: "Detailed information...",
        },
        {
            name: "isAnonymous",
            label: "Submit Anonymously",
            type: "checkbox",
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast("Fetching your records...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "suggestion-problem/get-all",
            {}
        );

        if (res.success && res.suggestions) {
            const formatted = res.suggestions.map((s: any) => ({
                id: s.id,
                type: s.type,
                typeRaw: s.type,
                category: s.category.replace("_", " "),
                categoryRaw: s.category,
                subject: s.subject,
                description: s.description,
                priority: s.priority,
                priorityRaw: s.priority,
                status: s.status.replace(/_/g, " "),
                statusRaw: s.status,
                isAnonymous: s.isAnonymous,
                attachedFile: s.attachedFile,
                adminResponse: s.adminResponse || "—",
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
    }, []);

    const handleEditSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Updating record...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `suggestion-problem/update/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Record updated successfully.", "success");
                setIsEditOpen(false);
                fetchData();
            } else {
                showToast(res.message || "Failed to update.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        const toastId = showToast("Deleting record...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "DELETE",
                `suggestion-problem/delete/${id}`,
                {}
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Record deleted successfully.", "success");
                fetchData();
            } else {
                showToast(res.message || "Failed to delete.", "error");
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "text-yellow-600";
            case "UNDER REVIEW": return "text-blue-600";
            case "IN PROGRESS": return "text-purple-600";
            case "RESOLVED": return "text-green-600";
            case "REJECTED": return "text-red-600";
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
                            {row.category} • {row.isAnonymous ? "Anonymous" : "Named"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getStatusColor(row.status)}`}>
                        {row.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-sm font-bold text-slate-800">Submission Information</h5>
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
                            <span className="text-sm text-slate-600">Priority:</span>
                            <span className={`text-sm font-semibold ${getPriorityColor(row.priority)}`}>
                                {row.priority}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Anonymous:</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${row.isAnonymous
                                    ? "bg-slate-100 text-slate-700 border border-slate-300"
                                    : "bg-blue-100 text-blue-700 border border-blue-300"
                                }`}>
                                {row.isAnonymous ? "Yes" : "No"}
                            </span>
                        </div>
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

    const renderActions = (row: any) => (
        <div className="flex gap-1">
            <button
                onClick={() => navigate(`/suggestion-problem/${row.id}`)}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                title="View Details"
            >
                <Eye size={14} />
            </button>
            {["PENDING", "UNDER_REVIEW"].includes(row.statusRaw) && (
                <>
                    <button
                        onClick={() => {
                            const editData = {
                                ...row,
                                type: row.typeRaw,
                                category: row.categoryRaw,
                                priority: row.priorityRaw,
                            };
                            setSelectedRow(editData);
                            setIsEditOpen(true);
                        }}
                        className="p-1.5 hover:bg-amber-100 text-amber-600 rounded"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>

                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
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
                    My Suggestions & Problems
                </h1>
                <p className="text-base text-slate-600">
                    View, manage, and edit your submitted suggestions or problem reports.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Suggestions & Problems"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            {isEditOpen && selectedRow && (
                <DynamicForm
                    isModal
                    isOpen={isEditOpen}
                    title="Edit Submission"
                    fields={editFields}
                    initialData={selectedRow}
                    onSubmit={handleEditSubmit}
                    actionType="UPDATE"
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </motion.div>

    );
}