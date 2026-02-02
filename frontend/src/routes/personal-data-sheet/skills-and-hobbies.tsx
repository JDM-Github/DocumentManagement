import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { CheckCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function SkillsAndHobbies() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const entryFields = [
        { name: "specialSkillsHobby", label: "Special Skill / Hobby", type: "text", required: true },
        { name: "distinction", label: "Distinction / Awards", type: "text" },
        { name: "membership", label: "Membership / Organization", type: "text" },
    ];

    // ----------------------------
    // Fetch existing entries
    // ----------------------------
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "skills-hobbies/find-or-create",
                    {}
                );
                if (res.success && res.skillsAndHobbies?.entries) {
                    setEntries(res.skillsAndHobbies.entries);
                }
            } catch (err) {
                showToast("Failed to load entries.", "error");
                console.error(err);
            }
        };
        fetchEntries();
    }, []);

    // ----------------------------
    // Modal handlers
    // ----------------------------
    const handleEntrySubmit = (data: any) => {
        if (selectedEntry) {
            setEntries(prev => prev.map(e => e === selectedEntry ? data : e));
            showToast("Entry updated successfully!", "success");
        } else {
            setEntries(prev => [...prev, data]);
            showToast("Entry added successfully!", "success");
        }
        setSelectedEntry(null);
        setIsModalOpen(false);
    };

    const handleEntryEdit = (entry: any) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const handleEntryDelete = (entry: any) => {
        setEntries(prev => prev.filter(e => e !== entry));
        showToast("Entry removed", "success");
    };

    // ----------------------------
    // Save to backend
    // ----------------------------
    const handleSubmit = async () => {
        if (entries.length === 0) {
            return showToast("Please add at least one skill or hobby entry.", "error");
        }

        const toastId = showToast("Saving entries...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "skills-hobbies/find-or-create",
                { entries }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Entries saved successfully!", "success");
                window.location.reload();
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
                        Skills & Hobbies
                    </h1>
                    <p className="text-base text-slate-600">
                        Add your special skills, distinctions, and memberships
                    </p>
                </div>

                <motion.div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Entries</h2>
                        <button
                            onClick={() => { setSelectedEntry(null); setIsModalOpen(true); }}
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
                                <p className="text-base font-medium text-slate-600 mb-1">No entries yet</p>
                                <p className="text-sm text-slate-500">Click "Add Entry" to start</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {entries.map((e, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-slate-800">{e.specialSkillsHobby}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEntryEdit(e)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleEntryDelete(e)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {e.distinction && <p className="text-sm text-slate-600">Distinction: {e.distinction}</p>}
                                        {e.membership && <p className="text-sm text-slate-600">Membership: {e.membership}</p>}
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

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isModalOpen}
                            title={selectedEntry ? "Edit Entry" : "Add New Entry"}
                            fields={entryFields}
                            initialData={selectedEntry || {}}
                            onSubmit={handleEntrySubmit}
                            actionType={selectedEntry ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedEntry ? "Update Entry" : "Add Entry"}
                            onClose={() => { setIsModalOpen(false); setSelectedEntry(null); }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
