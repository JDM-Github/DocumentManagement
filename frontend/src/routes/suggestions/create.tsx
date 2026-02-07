import { FileText, AlertCircle, Tag, AlertTriangle } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

export default function CreateSuggestionAndProblem() {
    const suggestionFields = [
        {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            icon: <Tag size={14} />,
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
            icon: <Tag size={14} />,
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
            icon: <AlertTriangle size={14} />,
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
            icon: <FileText size={14} />,
            placeholder: "Brief summary of your suggestion/problem...",
        },
        {
            name: "description",
            label: "Detailed Description",
            type: "textarea",
            required: true,
            icon: <FileText size={14} />,
            placeholder: "Provide detailed information about your suggestion or problem...",
            rows: 6,
        },
        {
            name: "attachedFile",
            label: "Attach Supporting Document (Optional)",
            type: "file",
            required: false,
            icon: <FileText size={14} />,
            accept: ".pdf,.doc,.docx,.jpg,.png",
        },
        {
            name: "isAnonymous",
            label: "Submit Anonymously",
            type: "checkbox",
            required: false,
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting your request...", "loading");

        try {
            const formData = new FormData();

            formData.append("type", data.type);
            formData.append("category", data.category);
            formData.append("priority", data.priority || "MEDIUM");
            formData.append("subject", data.subject);
            formData.append("description", data.description);
            formData.append("isAnonymous", String(Boolean(data.isAnonymous)));

            if (data.attachedFile && data.attachedFile[0]) {
                formData.append("attachedFile", data.attachedFile[0]);
            }

            const res = await RequestHandler.fetchData(
                "POST",
                "suggestion-problem/create",
                formData,
            );

            removeToast(toastId);

            if (res.success) {
                showToast(
                    `${data.type === "SUGGESTION" ? "Suggestion" : "Problem"} submitted successfully.`,
                    "success"
                );
            } else {
                showToast(res.message || "Failed to submit.", "error");
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
                    Submit Suggestion or Problem
                </h1>
                <p className="text-base text-slate-600">
                    Use the form below to submit suggestions or report problems. Please provide clear and concise information.
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
                    title="Submit Suggestion or Problem"
                    fields={suggestionFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    size="lg"
                />
            </motion.div>
        </motion.div>

    );
}