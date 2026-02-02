import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Upload,
    Plus,
    Edit,
    Trash2,
    Calendar,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Layers
} from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function CreateAccomplishmentReport() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isEntryOpen, setIsEntryOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const reportFields = [
        {
            name: "uploadedUrl",
            label: "Upload PDF Document",
            type: "file",
            required: true,
            icon: <Upload size={16} />,
            accept: ".pdf",
            className: "col-span-2",
        },
        {
            name: "remarks",
            label: "Report Remarks",
            type: "textarea",
            required: false,
            icon: <FileText size={16} />,
            placeholder: "Add any comments or notes about this report...",
            rows: 4,
            className: "col-span-2",
        },
    ];

    const entryFields = [
        {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
            icon: <Calendar size={16} />,
            className: "col-span-2",
        },
        {
            name: "activity1",
            label: "Activity 1",
            type: "text",
            required: true,
            placeholder: "Describe the first activity...",
        },
        {
            name: "activity2",
            label: "Activity 2",
            type: "text",
            placeholder: "Describe the second activity...",
        },
        {
            name: "activity3",
            label: "Activity 3",
            type: "text",
            placeholder: "Describe the third activity...",
        },
        {
            name: "activity4",
            label: "Activity 4",
            type: "text",
            placeholder: "Describe the fourth activity...",
        },
        {
            name: "activity5",
            label: "Activity 5",
            type: "text",
            placeholder: "Describe the fifth activity...",
        },
        {
            name: "remarks",
            label: "Entry Remarks",
            type: "textarea",
            rows: 3,
            placeholder: "Add any notes specific to this entry...",
            className: "col-span-2",
        },
    ];

    const handleEntrySubmit = (data: any) => {
        const activities = [
            data.activity1,
            data.activity2,
            data.activity3,
            data.activity4,
            data.activity5,
        ].filter(Boolean);

        const formattedEntry = {
            date: data.date,
            activities,
            remarks: data.remarks || "",
        };

        if (selectedEntry) {
            setEntries((prev) =>
                prev.map((e) => (e === selectedEntry ? formattedEntry : e))
            );
            showToast("Entry updated successfully!", "success");
        } else {
            setEntries((prev) => [...prev, formattedEntry]);
            showToast("Entry added successfully!", "success");
        }

        setSelectedEntry(null);
        setIsEntryOpen(false);
    };

    const handleEntryEdit = (entry: any) => {
        const initialData: any = { date: entry.date, remarks: entry.remarks || "" };
        entry.activities.forEach((act: string, idx: number) => {
            initialData[`activity${idx + 1}`] = act;
        });
        setSelectedEntry(initialData);
        setIsEntryOpen(true);
    };

    const handleEntryDelete = (entry: any) => {
        setEntries((prev) => prev.filter((e) => e !== entry));
        showToast("Entry removed", "success");
    };

    const handleSubmit = async (data: any) => {
        if (entries.length === 0) {
            return showToast("Please add at least one accomplishment entry.", "error");
        }

        const toastId = showToast("Submitting accomplishment report...", "loading");
        try {
            const file = data.uploadedUrl;
            if (!file) throw new Error("PDF file is required.");

            const formData = new FormData();
            formData.append("uploadedUrl", file);
            if (data.remarks) formData.append("remarks", data.remarks);
            formData.append("entries", JSON.stringify(entries));

            const res = await RequestHandler.fetchData(
                "POST",
                "accomplishment/create-report",
                formData
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Accomplishment report created successfully!", "success");
                setEntries([]);
            } else {
                showToast(res.message || "Failed to create report.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Create Accomplishment Report
                    </h1>
                    <p className="text-base text-slate-600">
                        Upload your report and add daily accomplishment entries
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Report Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <DynamicForm
                            isModal={false}
                            isOpen={true}
                            title="Report Information"
                            fields={reportFields}
                            onSubmit={handleSubmit}
                            actionType="CREATE"
                            submitButtonText="Submit Report"
                            size="lg"
                        />
                    </motion.div>

                    {/* Entries Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Layers size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Accomplishment Entries</h2>
                                        <p className="text-sm text-slate-600">
                                            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} added
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedEntry(null);
                                        setIsEntryOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                >
                                    <Plus size={16} />
                                    Add Entry
                                </motion.button>
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {entries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center py-12"
                                    >
                                        <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                            <AlertCircle size={32} className="text-slate-400" />
                                        </div>
                                        <p className="text-base font-medium text-slate-600 mb-1">No entries added yet</p>
                                        <p className="text-sm text-slate-500">
                                            Click "Add Entry" to start building your report
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {entries.map((entry, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                layout
                                                className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start gap-3 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                                            <Calendar size={14} className="text-blue-600" />
                                                        </div>
                                                        <span className="text-base font-bold text-slate-800">
                                                            {new Date(entry.date).toLocaleDateString("en-US", {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEntryEdit(entry)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                            title="Edit Entry"
                                                        >
                                                            <Edit size={16} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEntryDelete(entry)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 size={16} />
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-sm font-semibold text-slate-600 mb-2">Activities:</p>
                                                    <ul className="space-y-1.5">
                                                        {entry.activities.map((act: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                                                                <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                                <span>{act}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {entry.remarks && (
                                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                        <p className="text-sm text-slate-600">
                                                            <span className="font-semibold">Note: </span>
                                                            <span className="italic">"{entry.remarks}"</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer with entry count */}
                        {entries.length > 0 && (
                            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-slate-700">
                                        <span className="font-semibold text-green-600">{entries.length}</span>
                                        {' '}{entries.length === 1 ? 'entry' : 'entries'} ready to submit
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Entry Modal */}
                <AnimatePresence>
                    {isEntryOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isEntryOpen}
                            title={selectedEntry ? "Edit Entry" : "Add New Entry"}
                            fields={entryFields}
                            initialData={selectedEntry || {}}
                            onSubmit={handleEntrySubmit}
                            actionType={selectedEntry ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedEntry ? "Update Entry" : "Add Entry"}
                            onClose={() => {
                                setIsEntryOpen(false);
                                setSelectedEntry(null);
                            }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}