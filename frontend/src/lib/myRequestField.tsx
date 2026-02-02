import { FileText, User } from "lucide-react";

export const editRequestFields = [
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
        label: "Purpose / Description",
        type: "textarea",
        required: true,
        icon: <FileText size={14} />,
        rows: 4,
    },
    {
        name: "requestUploadedDocuments",
        label: "Update Attachments",
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.png",
        multiple: true,
    },
];

export const deleteRequestFields = [
    {
        name: "reason",
        label: "Reason for Deletion",
        type: "textarea",
        required: true,
        placeholder: "Please explain why you are deleting this request...",
        rows: 3,
    },
    {
        name: "confirmation",
        label: "I understand this action cannot be undone",
        type: "checkbox",
        required: true,
    },
];
