import { Clock, FileText, Send } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

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
        <div className="p-4 sm:p-6 max-w-3xl mx-auto min-h-[600px]">
            <DynamicForm
                isModal={false}
                isOpen={true}
                title="Create Pass Slip"
                fields={passSlipFields}
                onSubmit={handleSubmit}
                actionType="CREATE"
                size="lg"
            />
        </div>
    );
}
