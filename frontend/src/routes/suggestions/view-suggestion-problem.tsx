import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, FileText } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";

export default function SuggestionProblemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("");
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

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

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "";
        setUserRole(role);
        fetchData();
    }, [id]);

    const isMISD = userRole === "MISD";

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast("Loading details...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            `suggestion-problem/admin/get/${id}`,
            {}
        );

        if (res.success && res.suggestion) {
            const s = res.suggestion;
            setData({
                id: s.id,
                userId: s.userId,
                type: s.type,
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
                adminResponse: s.adminResponse || "",
                submittedBy: s.isAnonymous
                    ? "Anonymous"
                    : s.User
                        ? `${s.User.firstName} ${s.User.lastName}`
                        : "Unknown",
                submitterEmail: s.isAnonymous ? "—" : s.User?.email || "—",
                reviewedAt: s.reviewedAt ? new Date(s.reviewedAt).toLocaleString("en-PH") : "—",
                resolvedAt: s.resolvedAt ? new Date(s.resolvedAt).toLocaleString("en-PH") : "—",
                createdAt: new Date(s.createdAt).toLocaleString("en-PH"),
            });
            showToast("Details loaded.", "success");
        } else {
            showToast("Failed to load details.", "error");
        }

        setLoading(false);
        removeToast(toastId);
    };

    const handleStatusChange = async (newStatus: string) => {
        const toastId = showToast("Updating status...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `suggestion-problem/admin/update-status/${id}`,
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
        const toastId = showToast("Submitting response...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `suggestion-problem/admin/update-status/${id}`,
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
            case "LOW": return "bg-green-100 text-green-800";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800";
            case "HIGH": return "bg-orange-100 text-orange-800";
            case "URGENT": return "bg-red-100 text-red-800";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "UNDER REVIEW": return "bg-blue-100 text-blue-800";
            case "IN PROGRESS": return "bg-purple-100 text-purple-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "REJECTED": return "bg-red-100 text-red-800";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    const renderStatusActions = () => {
        if (!isMISD || !data) return null;

        switch (data.statusRaw) {
            case "PENDING":
                return (
                    <button
                        onClick={() => handleStatusChange("UNDER_REVIEW")}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                        Move to Under Review
                    </button>
                );
            case "UNDER_REVIEW":
                return (
                    <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                        Move to In Progress
                    </button>
                );
            case "IN_PROGRESS":
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleStatusChange("RESOLVED")}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            Mark as Resolved
                        </button>
                        <button
                            onClick={() => handleStatusChange("REJECTED")}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Reject
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen flex items-center justify-center">
                <div className="text-slate-600">Loading...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Not Found</h3>
                    <p className="text-slate-600 mb-4">The requested record could not be found.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen">
            <div className="mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {data.type} Details
                        </h1>
                        <div className="flex gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(data.priority)}`}>
                                {data.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>

                    {isMISD && (
                        <button
                            onClick={() => setIsResponseModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Add/Update Response
                        </button>
                    )}
                </div>
            </div>

            {/* Status Actions */}
            {renderStatusActions() && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Status Actions</h3>
                    {renderStatusActions()}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                {/* Subject */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Subject</h3>
                    <p className="text-slate-900 text-lg font-medium">{data.subject}</p>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Description</h3>
                    <p className="text-slate-900 whitespace-pre-wrap">{data.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div className="flex items-start gap-3">
                        <Tag className="text-slate-400 mt-1" size={18} />
                        <div>
                            <p className="text-xs text-slate-600">Category</p>
                            <p className="text-sm font-medium text-slate-900">{data.category}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <User className="text-slate-400 mt-1" size={18} />
                        <div>
                            <p className="text-xs text-slate-600">Submitted By</p>
                            <p className="text-sm font-medium text-slate-900">{data.submittedBy}</p>
                            {data.submitterEmail !== "—" && (
                                <p className="text-xs text-slate-600">{data.submitterEmail}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="text-slate-400 mt-1" size={18} />
                        <div>
                            <p className="text-xs text-slate-600">Submitted</p>
                            <p className="text-sm font-medium text-slate-900">{data.createdAt}</p>
                        </div>
                    </div>

                    {data.reviewedAt !== "—" && (
                        <div className="flex items-start gap-3">
                            <Calendar className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs text-slate-600">Reviewed</p>
                                <p className="text-sm font-medium text-slate-900">{data.reviewedAt}</p>
                            </div>
                        </div>
                    )}

                    {data.resolvedAt !== "—" && (
                        <div className="flex items-start gap-3">
                            <Calendar className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs text-slate-600">Resolved</p>
                                <p className="text-sm font-medium text-slate-900">{data.resolvedAt}</p>
                            </div>
                        </div>
                    )}

                    {data.attachedFile && (
                        <div className="flex items-start gap-3">
                            <FileText className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs text-slate-600">Attachment</p>
                                <a
                                    href={data.attachedFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                    View File
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {data.adminResponse && (
                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">Admin Response</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-slate-900 whitespace-pre-wrap">{data.adminResponse}</p>
                        </div>
                    </div>
                )}
            </div>

            {
                isResponseModalOpen && isMISD && (
                    <DynamicForm
                        isModal={true}
                        isOpen={isResponseModalOpen}
                        title="Admin Response"
                        fields={responseFields}
                        initialData={data}
                        onSubmit={handleResponseSubmit}
                        actionType="UPDATE"
                        onClose={() => setIsResponseModalOpen(false)}
                    />
                )
            }
        </div >
    );
}