import { Clock, FileText, Send } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

export default function CreatePassSlip() {
    const passSlipFields = [
        {
            name: "timeOut",
            label: "Time Out",
            type: "datetime-local",
            required: true,
            icon: <Clock size={14} />,
        },
        {
            name: "timeIn",
            label: "Expected Time In",
            type: "datetime-local",
            required: false,
            icon: <Clock size={14} />,
        },
        {
            name: "purpose",
            label: "Purpose",
            type: "select",
            required: true,
            icon: <Send size={14} />,
            options: [
                { value: "PERSONAL", label: "Personal" },
                { value: "OFFICIAL", label: "Official" },
            ],
        },
        {
            name: "reason",
            label: "Reason",
            type: "textarea",
            required: true,
            icon: <FileText size={14} />,
            placeholder: "Provide a brief reason for requesting a pass slip...",
            rows: 4,
        },
        {
            name: "forwardToHR",
            label: "Forward to HR",
            type: "checkbox",
            required: false,
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting pass slip...", "loading");

        try {
            const payload = {
                timeOut: data.timeOut,
                timeIn: data.timeIn || null,
                purpose: data.purpose,
                reason: data.reason,
                forwardToHR: Boolean(data.forwardToHR),
            };

            const res = await RequestHandler.fetchData(
                "POST",
                "pass-slip/create",
                payload
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Pass slip created successfully.", "success");
            } else {
                showToast(res.message || "Failed to create pass slip.", "error");
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
                    Create Pass Slip
                </h1>
                <p className="text-base text-slate-600">
                    Fill out the form below to request a pass slip. Please ensure all required
                    fields are completed accurately before submitting.
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
                    title="Create Pass Slip"
                    fields={passSlipFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    size="lg"
                />
            </motion.div>
        </motion.div>
    );
}
