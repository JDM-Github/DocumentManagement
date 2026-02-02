import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, User } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function References() {
    const [references, setReferences] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReference, setSelectedReference] = useState<any>(null);

    const referenceFields = [
        { name: "name", label: "Full Name", type: "text", required: true, icon: <User size={16} /> },
        { name: "address", label: "Address", type: "text", required: true },
        { name: "telephone", label: "Telephone / Mobile No.", type: "text", required: true },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "reference/find-or-create",
                    {}
                );
                if (res.success && res.reference?.references) {
                    setReferences(res.reference.references);
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to fetch references.", "error");
            }
        };
        fetchData();
    }, []);

    const handleReferenceSubmit = (data: any) => {
        if (selectedReference) {
            setReferences(prev =>
                prev.map(r => (r === selectedReference ? data : r))
            );
            showToast("Reference updated successfully!", "success");
        } else {
            setReferences(prev => [...prev, data]);
            showToast("Reference added successfully!", "success");
        }
        setSelectedReference(null);
        setIsModalOpen(false);
    };

    const handleEdit = (ref: any) => {
        setSelectedReference(ref);
        setIsModalOpen(true);
    };

    const handleDelete = (ref: any) => {
        setReferences(prev => prev.filter(r => r !== ref));
        showToast("Reference removed", "success");
    };

    const handleSubmit = async () => {
        // if (references.length < 3) {
        //     return showToast("Please add at least three (3) references.", "error");
        // }

        const toastId = showToast("Saving references...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "reference/find-or-create",
                { references }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("References saved successfully!", "success");
                window.location.reload();
            } else {
                showToast(res.message || "Failed to save references.", "error");
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
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">References</h1>
                    <p className="text-base text-slate-600">
                        Persons not related by consanguinity or affinity
                    </p>
                </div>

                <motion.div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Top Bar */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Reference List</h2>
                        <button
                            onClick={() => { setSelectedReference(null); setIsModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Add Reference
                        </button>
                    </div>

                    {/* List */}
                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        <AnimatePresence>
                            {references.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                    <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                        <AlertCircle size={32} className="text-slate-400" />
                                    </div>
                                    <p className="text-base font-medium text-slate-600 mb-1">No references added</p>
                                    <p className="text-sm text-slate-500">Please add at least three (3) references</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-3">
                                    {references.map((ref, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            layout
                                            className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-slate-800">{ref.name}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEdit(ref)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(ref)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">Address: {ref.address}</p>
                                            <p className="text-sm text-slate-600">Tel. No.: {ref.telephone}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    {references.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-slate-700">
                                    <span className="font-semibold text-green-600">{references.length}</span> reference(s) added
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                Save References
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
                            title={selectedReference ? "Edit Reference" : "Add Reference"}
                            fields={referenceFields}
                            initialData={selectedReference || {}}
                            onSubmit={handleReferenceSubmit}
                            actionType={selectedReference ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedReference ? "Update Reference" : "Add Reference"}
                            onClose={() => { setIsModalOpen(false); setSelectedReference(null); }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
