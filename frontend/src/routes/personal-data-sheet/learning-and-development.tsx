import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { Calendar, BookOpen, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function LearningAndDevelopment() {
    const [trainings, setTrainings] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<any>(null);

    const trainingFields = [
        { name: "title", label: "Training / Seminar Title", type: "text", required: true, icon: <BookOpen size={16} /> },
        { name: "dateFrom", label: "From", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "dateTo", label: "To", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "numberOfHours", label: "Number of Hours", type: "number" },
        { name: "type", label: "Type (Managerial / Technical / Others)", type: "text" },
        { name: "conductedBy", label: "Conducted By", type: "text" },
    ];

    // ----------------------------
    // Fetch existing trainings
    // ----------------------------
    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "learning-development/find-or-create",
                    {}
                );
                if (res.success && res.learningAndDevelopment?.trainings) {
                    setTrainings(res.learningAndDevelopment.trainings);
                }
            } catch (err) {
                showToast("Failed to load trainings.", "error");
                console.error(err);
            }
        };
        fetchTrainings();
    }, []);

    // ----------------------------
    // Modal handlers
    // ----------------------------
    const handleTrainingSubmit = (data: any) => {
        if (selectedTraining) {
            setTrainings(prev => prev.map(t => t === selectedTraining ? data : t));
            showToast("Training entry updated successfully!", "success");
        } else {
            setTrainings(prev => [...prev, data]);
            showToast("Training entry added successfully!", "success");
        }
        setSelectedTraining(null);
        setIsModalOpen(false);
    };

    const handleTrainingEdit = (training: any) => {
        setSelectedTraining(training);
        setIsModalOpen(true);
    };

    const handleTrainingDelete = (training: any) => {
        setTrainings(prev => prev.filter(t => t !== training));
        showToast("Training entry removed", "success");
    };

    // ----------------------------
    // Save to backend
    // ----------------------------
    const handleSubmit = async () => {
        if (trainings.length === 0) {
            return showToast("Please add at least one training entry.", "error");
        }

        const toastId = showToast("Saving training entries...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "learning-development/find-or-create",
                { trainings }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Training entries saved successfully!", "success");
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
                        Learning & Development
                    </h1>
                    <p className="text-base text-slate-600">
                        Add your training and seminar participation records
                    </p>
                </div>

                <motion.div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Training Entries</h2>
                        <button
                            onClick={() => { setSelectedTraining(null); setIsModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Add Training
                        </button>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        {trainings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                    <AlertCircle size={32} className="text-slate-400" />
                                </div>
                                <p className="text-base font-medium text-slate-600 mb-1">No training entries yet</p>
                                <p className="text-sm text-slate-500">Click "Add Training" to start</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {trainings.map((t, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-slate-800">{t.title}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleTrainingEdit(t)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleTrainingDelete(t)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {new Date(t.dateFrom).toLocaleDateString()} - {new Date(t.dateTo).toLocaleDateString()} | {t.numberOfHours || "N/A"} hours | Type: {t.type || "N/A"}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Conducted by: {t.conductedBy || "N/A"}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {trainings.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-slate-700">
                                    <span className="font-semibold text-green-600">{trainings.length}</span> {trainings.length === 1 ? 'training entry' : 'training entries'} ready
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                Save Trainings
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Training Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isModalOpen}
                            title={selectedTraining ? "Edit Training Entry" : "Add New Training"}
                            fields={trainingFields}
                            initialData={selectedTraining || {}}
                            onSubmit={handleTrainingSubmit}
                            actionType={selectedTraining ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedTraining ? "Update Entry" : "Add Entry"}
                            onClose={() => { setIsModalOpen(false); setSelectedTraining(null); }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
