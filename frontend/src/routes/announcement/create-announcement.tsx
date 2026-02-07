import { motion } from "framer-motion";
import {
    Megaphone,
    Calendar,
    FileText,
    AlertCircle,
    Users,
    Link as LinkIcon,
    Flag,
} from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function CreateAnnouncement() {
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
            name: "message",
            label: "Message",
            type: "textarea",
            required: true,
            rows: 6,
            icon: <AlertCircle size={16} />,
            placeholder: "Enter the announcement message...",
            className: "col-span-2",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Creating announcement...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "announcement/create",
                data
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Announcement created successfully!", "success");
            } else {
                showToast(res.message || "Failed to create announcement.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen"
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
                    Create Announcement
                </h1>
                <p className="text-base text-slate-600">
                    Broadcast important information to users across the system.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DynamicForm
                    isModal={false}
                    isOpen={true}
                    title="Create Announcement"
                    fields={announcementFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Create Announcement"
                    size="lg"
                />
            </motion.div>
        </motion.div>
    );
}