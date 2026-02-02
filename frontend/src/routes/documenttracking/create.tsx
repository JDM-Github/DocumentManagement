import { FileText, User, Upload } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function CreateRequest({
    userId,
}: {
    userId: string;
}) {
    const requestFields = [
        {
            name: "currentDepartmentId",
            label: "Target Department",
            type: "select",
            required: true,
            icon: <User size={14} />,
            options: [
                { value: "1", label: "Records Office" },
                { value: "2", label: "Registrar" },
                { value: "3", label: "Finance" },
            ],
        },
        {
            name: "purpose",
            label: "Purpose of Document",
            type: "textarea",
            required: true,
            icon: <FileText size={14} />,
            placeholder: "Describe your document clearly...",
            rows: 4,
        },
        {
            name: "requestUploadedDocuments",
            label: "Upload Supporting Documents",
            type: "file",
            icon: <Upload size={14} />,
            accept: ".pdf,.doc,.docx,.jpg,.png",
            multiple: true,
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting document...", "loading");

        try {
            const formData = new FormData();
            formData.append("requesterId", String(userId));
            formData.append("createdBy", String(userId));
            formData.append("currentDepartmentId", data.currentDepartmentId);
            formData.append("purpose", data.purpose);

            const files = data.requestUploadedDocuments
                ? Array.isArray(data.requestUploadedDocuments)
                    ? data.requestUploadedDocuments
                    : [data.requestUploadedDocuments] 
                : [];

            files.forEach((file: File) => {
                formData.append("documents", file); 
            });

            const res = await RequestHandler.fetchData(
                "POST",
                "request-letter/create",
                formData 
            );
            removeToast(toastId);
            if (res.success) {
                showToast("Document created successfully.", "success");
            } else {
                showToast(res.message || "Failed to create document.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };


    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-[600px]">
            <DynamicForm
                isModal={false}
                isOpen={true}
                title="Create New Document"
                fields={requestFields}
                onSubmit={handleSubmit}
                actionType="CREATE"
                size="lg"
            />
        </div>
    );
}
