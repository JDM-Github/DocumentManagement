import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { Calendar, Users, CheckCircle, AlertCircle, Plus, Edit, Trash2, MapPin } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function VoluntaryWork() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const entryFields = [
        { name: "organizationName", label: "Organization Name", type: "text", required: true, icon: <Users size={16} /> },
        { name: "organizationAddress", label: "Organization Address", type: "text", icon: <MapPin size={16} /> },
        { name: "dateFrom", label: "From", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "dateTo", label: "To", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "numberOfHours", label: "Number of Hours", type: "number" },
        { name: "positionNatureOfWork", label: "Position / Nature of Work", type: "text" },
    ];

    const handleEntrySubmit = (data: any) => {
        if (selectedEntry) {
            setEntries(prev => prev.map(e => e === selectedEntry ? data : e));
            showToast("Voluntary work entry updated!", "success");
        } else {
            setEntries(prev => [...prev, data]);
            showToast("Voluntary work entry added!", "success");
        }
        setSelectedEntry(null);
        setIsEntryModalOpen(false);
    };

    const handleEntryEdit = (entry: any) => {
        setSelectedEntry(entry);
        setIsEntryModalOpen(true);
    };

    const handleEntryDelete = (entry: any) => {
        setEntries(prev => prev.filter(e => e !== entry));
        showToast("Voluntary work entry removed", "success");
    };

    const handleSubmit = async () => {
        if (entries.length === 0) {
            return showToast("Please add at least one voluntary work entry.", "error");
        }

        const toastId = showToast("Saving voluntary work entries...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "voluntary-work/create",
                { entries }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Voluntary work entries saved successfully!", "success");
            } else {
                showToast(res.message || "Failed to save entries.", "error");
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
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Voluntary Work
                    </h1>
                    <p className="text-base text-slate-600">
                        Add your voluntary work experiences
                    </p>
                </div>

                <motion.div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Entries</h2>
                        <button
                            onClick={() => { setSelectedEntry(null); setIsEntryModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Add Entry
                        </button>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        {entries.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                    <AlertCircle size={32} className="text-slate-400" />
                                </div>
                                <p className="text-base font-medium text-slate-600 mb-1">No entries added yet</p>
                                <p className="text-sm text-slate-500">Click "Add Entry" to start</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {entries.map((entry, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-slate-800">{entry.organizationName}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEntryEdit(entry)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleEntryDelete(entry)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Address: {entry.organizationAddress || "N/A"} | {new Date(entry.dateFrom).toLocaleDateString()} - {new Date(entry.dateTo).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Position / Nature of Work: {entry.positionNatureOfWork || "N/A"} | Hours: {entry.numberOfHours || "N/A"}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {entries.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-slate-700">
                                    <span className="font-semibold text-green-600">{entries.length}</span> {entries.length === 1 ? 'entry' : 'entries'} ready
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                Save Entries
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Entry Modal */}
                <AnimatePresence>
                    {isEntryModalOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isEntryModalOpen}
                            title={selectedEntry ? "Edit Voluntary Work Entry" : "Add New Entry"}
                            fields={entryFields}
                            initialData={selectedEntry || {}}
                            onSubmit={handleEntrySubmit}
                            actionType={selectedEntry ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedEntry ? "Update Entry" : "Add Entry"}
                            onClose={() => { setIsEntryModalOpen(false); setSelectedEntry(null); }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
