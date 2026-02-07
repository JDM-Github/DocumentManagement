import { motion } from "framer-motion";
import {
    Briefcase,
    Calendar,
    FileText,
    DollarSign,
    UserCheck,
} from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function CreateClearance() {
    const clearanceFields = [
        {
            name: "salary",
            label: "Salary",
            type: "number",
            required: true,
            icon: <DollarSign size={16} />,
            placeholder: "Enter current salary",
        },
        {
            name: "position",
            label: "Position",
            type: "text",
            required: true,
            icon: <Briefcase size={16} />,
            placeholder: "Enter position",
        },
        {
            name: "employmentStatus",
            label: "Employment Status",
            type: "select",
            required: true,
            icon: <UserCheck size={16} />,
            options: [
                { label: "Employee", value: "EMPLOYEE" },
                { label: "Faculty", value: "FACULTY" },
            ],
        },
        {
            name: "effectiveFrom",
            label: "Effective From",
            type: "date",
            required: true,
            icon: <Calendar size={16} />,
        },
        {
            name: "effectiveTo",
            label: "Effective To",
            type: "date",
            required: true,
            icon: <Calendar size={16} />,
        },
        {
            name: "purpose",
            label: "Purpose of Clearance",
            type: "textarea",
            required: true,
            rows: 4,
            icon: <FileText size={16} />,
            placeholder: "State the reason for requesting clearance...",
            className: "col-span-2",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting clearance request...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "clearance/create",
                data
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Clearance request submitted successfully!", "success");
            } else {
                showToast(res.message || "Failed to submit clearance.", "error");
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
                    Create Clearance Request
                </h1>
                <p className="text-base text-slate-600">
                    Fill out the form below to request an official clearance.
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
                    title="Create Clearance Request"
                    fields={clearanceFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Submit Clearance"
                    size="lg"
                />
            </motion.div>
        </motion.div>
    );
}
