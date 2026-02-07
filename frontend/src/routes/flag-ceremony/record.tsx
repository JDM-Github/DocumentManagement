import { Calendar, Clock, User, FileText, CheckCircle, Upload } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

export default function RecordFlagCeremonyAttendance() {
    const attendanceFields = [
        {
            name: "ceremonyDate",
            label: "Ceremony Date",
            type: "date",
            required: true,
            icon: <Calendar size={14} />,
        },
        {
            name: "ceremonyType",
            label: "Ceremony Type",
            type: "select",
            required: true,
            icon: <CheckCircle size={14} />,
            options: [
                { value: "MONDAY", label: "Monday Flag Ceremony" },
                { value: "SPECIAL_OCCASION", label: "Special Occasion" },
            ],
        },
        {
            name: "checkInTime",
            label: "Check-in Time",
            type: "time",
            required: true,
            icon: <Clock size={14} />,
        },
        {
            name: "status",
            label: "Attendance Status",
            type: "select",
            required: true,
            icon: <User size={14} />,
            options: [
                { value: "PRESENT", label: "Present" },
                { value: "LATE", label: "Late" },
                { value: "ABSENT", label: "Absent" },
                { value: "EXCUSED", label: "Excused" },
            ],
        },
        {
            name: "isExcused",
            label: "Is Excused",
            type: "checkbox",
            required: false,
        },
        {
            name: "excuseReason",
            label: "Excuse Reason (if applicable)",
            type: "textarea",
            required: false,
            icon: <FileText size={14} />,
            placeholder: "Provide reason for excuse...",
            rows: 3,
        },
        {
            name: "remarks",
            label: "Additional Remarks",
            type: "textarea",
            required: false,
            icon: <FileText size={14} />,
            placeholder: "Any additional notes or remarks...",
            rows: 3,
        },
        {
            name: "uploadedProof",
            label: "Upload Proof (Optional)",
            type: "file",
            required: false,
            icon: <Upload size={14} />,
            accept: ".jpg,.jpeg,.png",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Recording attendance...", "loading");

        try {
            const formData = new FormData();

            formData.append("ceremonyDate", data.ceremonyDate);
            formData.append("ceremonyType", data.ceremonyType);
            formData.append("checkInTime", data.checkInTime);
            formData.append("status", data.status);
            formData.append("isExcused", String(Boolean(data.isExcused)));
            formData.append("excuseReason", data.excuseReason || "");
            formData.append("remarks", data.remarks || "");

            if (data.uploadedProof && data.uploadedProof[0]) {
                formData.append("uploadedProof", data.uploadedProof[0]);
            }

            const res = await RequestHandler.fetchData(
                "POST",
                "flag-ceremony-attendance/record",
                formData,
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Attendance recorded successfully.", "success");
            } else {
                showToast(res.message || "Failed to record attendance.", "error");
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
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Record Flag Ceremony Attendance
                </h1>
                <p className="text-base text-slate-600">
                    Fill in the attendance details for the flag ceremony. Ensure all required fields are completed before submitting.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>Event Date: 2026</span>
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
                    title="Attendance Details"
                    fields={attendanceFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Submit Attendance"
                    size="lg"
                />
            </motion.div>
        </motion.div>

    );
}