import { useEffect, useState } from "react";
import { Calendar, Clock, Download, Edit, FileText } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { AnimatePresence, motion } from "framer-motion";

export default function MyFlagCeremonyAttendance() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const columns = [
        { key: "id", label: "ID" },
        { key: "ceremonyDate", label: "Ceremony Date" },
        { key: "ceremonyType", label: "Type" },
        { key: "checkInTime", label: "Check-in Time" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Recorded At" },
    ];

    const editAttendanceFields = [
        {
            name: "ceremonyDate",
            label: "Ceremony Date",
            type: "date",
            required: true,
        },
        {
            name: "ceremonyType",
            label: "Ceremony Type",
            type: "select",
            required: true,
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
        },
        {
            name: "status",
            label: "Attendance Status",
            type: "select",
            required: true,
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
        },
        {
            name: "excuseReason",
            label: "Excuse Reason (if applicable)",
            type: "textarea",
            rows: 3,
            placeholder: "Provide reason for excuse...",
        },
        {
            name: "remarks",
            label: "Additional Remarks",
            type: "textarea",
            rows: 3,
            placeholder: "Any additional notes or remarks...",
        },
    ];

    const fetchAttendance = async () => {
        setLoading(true);
        const toastId = showToast("Fetching your attendance records...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "flag-ceremony-attendance/get-all",
            {}
        );

        if (res.success && res.flagceremonyattendances) {
            const formatted = res.flagceremonyattendances.map((a: any) => ({
                id: a.id,
                ceremonyDate: new Date(a.ceremonyDate).toLocaleDateString("en-PH"),
                ceremonyDateRaw: a.ceremonyDate,
                ceremonyType: a.ceremonyType.replace("_", " "),
                ceremonyTypeRaw: a.ceremonyType,
                checkInTime: a.checkInTime || "—",
                status: a.status,
                isExcused: a.isExcused,
                excuseReason: a.excuseReason || "—",
                remarks: a.remarks || "—",
                uploadedProof: a.uploadedProof,
                createdAt: new Date(a.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast("Attendance records loaded.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch attendance records.", "error");
            console.error(res);
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleEditSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Updating attendance...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `flag-ceremony-attendance/update/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Attendance updated successfully.", "success");
                setIsEditOpen(false);
                fetchAttendance();
            } else {
                showToast(res.message || "Failed to update attendance.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const renderExpandedRow = (row: any) => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Attendance Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.ceremonyType} • {row.ceremonyDate}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${row.status === "PRESENT"
                            ? "bg-green-50 text-green-700 border-green-300"
                            : row.status === "LATE"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                : row.status === "EXCUSED"
                                    ? "bg-blue-50 text-blue-700 border-blue-300"
                                    : "bg-red-50 text-red-700 border-red-300"
                        }`}>
                        {row.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Ceremony Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Ceremony Date:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.ceremonyDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Ceremony Type:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.ceremonyType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Check-in Time:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.checkInTime}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Status Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className={`text-sm font-semibold ${row.status === "PRESENT"
                                    ? "text-green-600"
                                    : row.status === "LATE"
                                        ? "text-yellow-600"
                                        : row.status === "EXCUSED"
                                            ? "text-blue-600"
                                            : "text-red-600"
                                }`}>
                                {row.status}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Is Excused:</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${row.isExcused
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-slate-100 text-slate-700 border border-slate-300"
                                }`}>
                                {row.isExcused ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Recorded At:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.createdAt}</span>
                        </div>
                        {row.uploadedProof && (
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                <span className="text-sm text-slate-600">Proof:</span>
                                <a
                                    href={row.uploadedProof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    <Download size={14} />
                                    View Image
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {row.excuseReason !== "—" && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Excuse Reason</p>
                    <p className="text-base text-blue-700">{row.excuseReason}</p>
                </div>
            )}

            {row.remarks !== "—" && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Remarks</p>
                    <p className="text-base text-blue-700">{row.remarks}</p>
                </div>
            )}
        </motion.div>
    );

    const renderActions = (row: any) => (
        <div className="flex gap-1">
            <button
                onClick={() => {
                    const editData = {
                        ...row,
                        ceremonyDate: row.ceremonyDateRaw,
                        ceremonyType: row.ceremonyTypeRaw,
                    };
                    setSelectedRow(editData);
                    setIsEditOpen(true);
                }}
                className="p-1.5 hover:bg-amber-100 text-amber-600 rounded"
                title="Edit Attendance"
            >
                <Edit size={14} />
            </button>
        </div>
    );

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen"
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
                    My Flag Ceremony Attendance
                </h1>
                <p className="text-base text-slate-600">
                    View and manage your attendance records. Expand each entry for details or update attendance as needed.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Flag Ceremony Attendance"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isEditOpen && selectedRow && (
                    <DynamicForm
                        isModal
                        isOpen
                        title="Edit Attendance"
                        fields={editAttendanceFields}
                        initialData={selectedRow}
                        onSubmit={handleEditSubmit}
                        actionType="UPDATE"
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>

    );
}