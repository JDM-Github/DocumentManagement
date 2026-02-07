import { useEffect, useState } from "react";
import { FileText, User, Upload } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

type Option = {
    value: string;
    label: string;
};

export default function CreateRequest({ userId }: { userId: string }) {
    const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);

    const fetchDepartments = async () => {
        const toastId = showToast("Fetching departments...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "department/get-all-request",
                {}
            );
            if (res.success && res.departments) {
                const options = res.departments.map((d: any) => ({
                    value: String(d.id),
                    label: d.name,
                }));
                setDepartmentOptions(options);
            } else {
                showToast("Failed to fetch departments.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error fetching departments.", "error");
        } finally {
            removeToast(toastId);
        }
    };
    useEffect(() => {
        fetchDepartments();
    }, []);

    const requestFields = [
        {
            name: "currentDepartmentId",
            label: "Target Department",
            type: "select",
            required: true,
            icon: <User size={14} />,
            options: departmentOptions,
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
            formData.append("requesterId", userId);
            formData.append("createdBy", userId);
            formData.append("currentDepartmentId", data.currentDepartmentId);
            formData.append("purpose", data.purpose);

            const files = Array.isArray(data.requestUploadedDocuments)
                ? data.requestUploadedDocuments
                : data.requestUploadedDocuments
                    ? [data.requestUploadedDocuments]
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
                    Create New Document
                </h1>
                <p className="text-base text-slate-600">
                    Fill out the form below to create a new document request. Ensure all required details are completed accurately before submitting.
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
                    title="Create New Document"
                    fields={requestFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    size="lg"
                />
            </motion.div>
        </motion.div>

    );
}
