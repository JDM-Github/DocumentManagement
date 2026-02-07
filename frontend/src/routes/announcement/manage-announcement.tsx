import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Edit,
    Trash2,
    Megaphone,
    AlertTriangle,
    Flag,
    Users,
    Link as LinkIcon,
    FileText,
    Power,
    PowerOff,
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";

export default function ManageAnnouncements() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "title", label: "Title", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "priority", label: "Priority", sortable: true },
        { key: "targetAudience", label: "Audience", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
            key: "createdAt",
            label: "Created On",
            sortable: true,
            icon: <Calendar size={14} />,
        },
    ];

    const fetchAnnouncements = async () => {
        setLoading(true);
        const toastId = showToast("Fetching announcements...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "announcement/get-all", {});
            removeToast(toastId);

            if (res.success && res.announcements) {
                setData(
                    res.announcements.map((a: any) => ({
                        ...a,
                        status: a.isActive ? "Active" : "Inactive",
                        createdAt: new Date(a.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                    }))
                );
            } else {
                showToast("Failed to fetch announcements.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'low':
                return 'bg-slate-100 text-slate-700 border-slate-300';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'urgent':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'maintenance':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'update':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'event':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-300';
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
                        <Megaphone size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">{row.title}</h4>
                        <p className="text-sm text-slate-600">
                            {row.type} • {row.targetAudience}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getPriorityColor(row.priority)}`}>
                        {row.priority}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getTypeColor(row.type)}`}>
                        {row.type}
                    </span>
                    {row.isActive ? (
                        <span className="px-3 py-1.5 text-sm font-semibold rounded-lg border-2 bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
                            <Power size={14} /> Active
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 text-sm font-semibold rounded-lg border-2 bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1">
                            <PowerOff size={14} /> Inactive
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Audience & Details</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Target:</span>
                            <span className="text-sm font-semibold text-slate-800 capitalize">{row.targetAudience}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Type:</span>
                            <span className="text-sm font-semibold text-slate-800 capitalize">{row.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Priority:</span>
                            <span className={`text-sm font-bold capitalize ${row.priority === 'critical' ? 'text-red-700' :
                                    row.priority === 'high' ? 'text-orange-700' :
                                        row.priority === 'medium' ? 'text-yellow-700' :
                                            'text-slate-700'
                                }`}>
                                {row.priority}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Active Period</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Start:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {row.startDate ? new Date(row.startDate).toLocaleDateString("en-US", {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Immediately'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">End:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {row.endDate ? new Date(row.endDate).toLocaleDateString("en-US", {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'No expiry'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Created:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.createdAt}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-blue-700" />
                    <p className="text-sm font-semibold text-blue-900">Message</p>
                </div>
                <p className="text-base text-blue-700 whitespace-pre-wrap">{row.message}</p>
            </div>

            {row.link && (
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                        <LinkIcon size={16} className="text-blue-600" />
                        <p className="text-sm font-semibold text-slate-800">Link:</p>
                        <a
                            href={row.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                        >
                            {row.link}
                        </a>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const announcementFields = [
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
            icon: <Megaphone size={16} />,
            placeholder: "Enter announcement title",
        },
        {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            icon: <FileText size={16} />,
            options: [
                { label: "General", value: "general" },
                { label: "Maintenance", value: "maintenance" },
                { label: "Update", value: "update" },
                { label: "Event", value: "event" },
                { label: "Urgent", value: "urgent" },
            ],
        },
        {
            name: "priority",
            label: "Priority",
            type: "select",
            required: true,
            icon: <Flag size={16} />,
            options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
            ],
        },
        {
            name: "targetAudience",
            label: "Target Audience",
            type: "select",
            required: true,
            icon: <Users size={16} />,
            options: [
                { label: "All Users", value: "all" },
                { label: "Students", value: "students" },
                { label: "Faculty", value: "faculty" },
                { label: "Staff", value: "staff" },
                { label: "Admins", value: "admins" },
            ],
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "datetime-local",
            required: false,
            icon: <Calendar size={16} />,
        },
        {
            name: "endDate",
            label: "End Date",
            type: "datetime-local",
            required: false,
            icon: <Calendar size={16} />,
        },
        {
            name: "link",
            label: "Link (Optional)",
            type: "text",
            required: false,
            icon: <LinkIcon size={16} />,
            placeholder: "https://example.com",
        },
        {
            name: "isActive",
            label: "Active Status",
            type: "select",
            required: true,
            icon: <Power size={16} />,
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
            ],
        },
        {
            name: "message",
            label: "Message",
            type: "textarea",
            required: true,
            rows: 6,
            icon: <FileText size={16} />,
            placeholder: "Enter the announcement message...",
            className: "col-span-2",
        },
    ];

    const renderActions = (row: any) => (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    setSelected({
                        ...row,
                        isActive: row.isActive ? "true" : "false"
                    });
                    setIsEditOpen(true);
                }}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                title="Edit"
            >
                <Edit size={16} />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelected(row); setIsDeleteOpen(true); }}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                title="Delete"
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
                    Manage Announcements
                </h1>
                <p className="text-base text-slate-600">
                    View, edit, and manage all system announcements. Expand a row to see full details.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="All Announcements"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isEditOpen && selected && (
                    <DynamicForm
                        isModal
                        isOpen
                        title="Edit Announcement"
                        fields={announcementFields}
                        initialData={selected}
                        onSubmit={async (data) => {
                            const toastId = showToast("Updating announcement...", "loading");
                            try {
                                const updateData = {
                                    ...data,
                                    isActive: data.isActive === "true"
                                };
                                await RequestHandler.fetchData(
                                    "PUT",
                                    `announcement/update/${selected.id}`,
                                    updateData
                                );
                                removeToast(toastId);
                                showToast("Announcement updated.", "success");
                                setIsEditOpen(false);
                                fetchAnnouncements();
                            } catch {
                                removeToast(toastId);
                                showToast("Update failed.", "error");
                            }
                        }}
                        actionType="UPDATE"
                        submitButtonText="Update Announcement"
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteOpen && selected && (
                    <DynamicForm
                        isModal
                        isOpen
                        title="Delete Announcement"
                        fields={[
                            {
                                name: "confirm",
                                label: "Type DELETE to confirm",
                                type: "text",
                                required: true,
                                validation: (v: string) =>
                                    v !== "DELETE" ? "Type DELETE to proceed" : undefined,
                                icon: <AlertTriangle size={16} />,
                            },
                        ]}
                        onSubmit={async () => {
                            const toastId = showToast("Deleting announcement...", "loading");
                            try {
                                await RequestHandler.fetchData(
                                    "DELETE",
                                    `announcement/delete/${selected.id}`,
                                    {}
                                );
                                removeToast(toastId);
                                showToast("Announcement deleted.", "success");
                                setIsDeleteOpen(false);
                                fetchAnnouncements();
                            } catch {
                                removeToast(toastId);
                                showToast("Delete failed.", "error");
                            }
                        }}
                        actionType="DELETE"
                        submitButtonText="Delete"
                        onClose={() => setIsDeleteOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}