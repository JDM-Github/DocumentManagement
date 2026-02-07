

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
