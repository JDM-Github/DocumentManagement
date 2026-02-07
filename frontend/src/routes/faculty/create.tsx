import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    User,
    MessageSquare,
    Star,
    Calendar,
} from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function CreateFacultyEvaluation() {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacultyMembers();
    }, []);

    const fetchFacultyMembers = async () => {
        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "user/get-department"
            );

            if (res.success && res.users) {
                const facultyOptions = res.users
                    .filter((user: any) => user.role === "USER")
                    .map((user: any) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user.id.toString(),
                    }));
                setFacultyMembers(facultyOptions);
            }
        } catch (err) {
            console.error("Error fetching faculty members:", err);
            showToast("Failed to load faculty members.", "error");
        } finally {
            setLoading(false);
        }
    };

    const evaluationFields = [
        {
            name: "facultyId",
            label: "Faculty Member",
            type: "select",
            required: true,
            icon: <User size={16} />,
            options: facultyMembers,
            placeholder: "Select faculty to evaluate",
        },
        {
            name: "rating",
            label: "Rating",
            type: "select",
            required: true,
            icon: <Star size={16} />,
            options: [
                { label: "1 - Poor", value: "1" },
                { label: "2 - Fair", value: "2" },
                { label: "3 - Good", value: "3" },
                { label: "4 - Excellent", value: "4" },
            ],
        },
        {
            name: "message",
            label: "Evaluation Message",
            type: "textarea",
            required: true,
            rows: 6,
            icon: <MessageSquare size={16} />,
            placeholder: "Provide detailed feedback on faculty performance...",
            className: "col-span-2",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting evaluation...", "loading");

        try {
            const payload = {
                ...data,
                rating: parseInt(data.rating),
            };

            const res = await RequestHandler.fetchData(
                "POST",
                "faculty-evaluation/create",
                payload
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Evaluation submitted successfully!", "success");
            } else {
                showToast(res.message || "Failed to submit evaluation.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading faculty members...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Faculty Evaluation
                </h1>
                <p className="text-base text-slate-600">
                    Submit your annual evaluation for a faculty member. Fill in all required fields carefully before submitting.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>Academic Year: 2025-2026</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <DynamicForm
                    isModal={false}
                    isOpen={true}
                    title="Evaluation Details"
                    fields={evaluationFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Submit Evaluation"
                    size="lg"
                />
            </motion.div>
        </motion.div>
    );
}