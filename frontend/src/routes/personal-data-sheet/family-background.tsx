import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Home, Calendar, Plus, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function FamilyBackground() {
    const [children, setChildren] = useState<any[]>([]);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const familyFields = [
        /* =========================
           SPOUSE INFORMATION
        ========================== */
        { name: "spouseSurname", label: "Spouse Surname", type: "text", section: "Spouse Information", icon: <User size={16} /> },
        { name: "spouseFirstName", label: "Spouse First Name", type: "text", section: "Spouse Information" },
        { name: "spouseMiddleName", label: "Spouse Middle Name", type: "text", section: "Spouse Information" },
        { name: "spouseNameExtension", label: "Name Extension", type: "text", placeholder: "Jr., Sr.", section: "Spouse Information" },
        { name: "spouseOccupation", label: "Occupation", type: "text", icon: <Briefcase size={16} />, section: "Spouse Information" },
        { name: "employerBusinessName", label: "Employer / Business Name", type: "text", section: "Spouse Information" },
        { name: "businessAddress", label: "Business Address", type: "text", section: "Spouse Information" },
        { name: "spouseTelephoneNo", label: "Telephone No.", type: "text", icon: <Home size={16} />, section: "Spouse Information" },

        /* =========================
           FATHER INFORMATION
        ========================== */
        { name: "fatherSurname", label: "Father Surname", type: "text", section: "Father Information", icon: <User size={16} /> },
        { name: "fatherFirstName", label: "Father First Name", type: "text", section: "Father Information" },
        { name: "fatherMiddleName", label: "Father Middle Name", type: "text", section: "Father Information" },
        { name: "fatherNameExtension", label: "Name Extension", type: "text", placeholder: "Jr., Sr.", section: "Father Information" },

        /* =========================
           MOTHER INFORMATION
        ========================== */
        { name: "motherMaidenName", label: "Mother Maiden Name", type: "text", section: "Mother Information", icon: <User size={16} /> },
        { name: "motherSurname", label: "Mother Surname", type: "text", section: "Mother Information" },
        { name: "motherFirstName", label: "Mother First Name", type: "text", section: "Mother Information" },
        { name: "motherMiddleName", label: "Mother Middle Name", type: "text", section: "Mother Information" },
    ];

    const childFields = [
        { name: "fullName", label: "Child Full Name", type: "text", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true, icon: <Calendar size={16} /> },
    ];

    // ----------------------------
    // Load family background from backend
    // ----------------------------
    useEffect(() => {
        const fetchFamilyBackground = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "family-background/find-or-create",
                    {}
                );
                if (res.success && res.familyBackground) {
                    setInitialValues(res.familyBackground);
                    setChildren(res.familyBackground.children || []);
                }
            } catch (err) {
                showToast("Failed to load family background.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFamilyBackground();
    }, []);

    // ----------------------------
    // Children CRUD
    // ----------------------------
    const handleChildSubmit = (data: any) => {
        if (selectedChild) {
            setChildren((prev) => prev.map((c) => (c === selectedChild ? data : c)));
            showToast("Child updated successfully!", "success");
        } else {
            setChildren((prev) => [...prev, data]);
            showToast("Child added successfully!", "success");
        }
        setSelectedChild(null);
        setIsChildModalOpen(false);
    };

    const handleChildEdit = (child: any) => {
        setSelectedChild(child);
        setIsChildModalOpen(true);
    };

    const handleChildDelete = (child: any) => {
        setChildren((prev) => prev.filter((c) => c !== child));
        showToast("Child removed", "success");
    };

    // ----------------------------
    // Form submit
    // ----------------------------
    const handleSubmit = async (data: any) => {
        const payload = {
            ...data,
            children,
        };

        const toastId = showToast("Saving family background...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "family-background/find-or-create",
                payload
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Family background saved successfully!", "success");
                window.location.reload();
            } else {
                showToast(res.message || "Failed to save information.", "error");
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
                        Family Background
                    </h1>
                    <p className="text-base text-slate-600">
                        Complete your family information below
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {!loading && (
                        <DynamicForm
                            isModal={false}
                            isOpen={true}
                            title="Family Background Form"
                            fields={familyFields}
                            initialData={initialValues || {}}
                            onSubmit={handleSubmit}
                            actionType="UPDATE"
                            submitButtonText="Save Family Background"
                            size="xl"
                        />
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-h-[500px]"
                    >
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Children</h2>
                            <button
                                onClick={() => { setSelectedChild(null); setIsChildModalOpen(true); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                <Plus size={16} /> Add Child
                            </button>
                        </div>

                        <div className="p-6 min-h-[400px] max-h-[400px] overflow-y-auto">
                            {children.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                        <AlertCircle size={32} className="text-slate-400" />
                                    </div>
                                    <p className="text-base font-medium text-slate-600 mb-1">No children added yet</p>
                                    <p className="text-sm text-slate-500">Click "Add Child" to start</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {children.map((child, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            layout
                                            className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-slate-800">{child.fullName}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleChildEdit(child)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleChildDelete(child)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">Born: {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {children.length > 0 && (
                            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-slate-700">
                                        <span className="font-semibold text-green-600">{children.length}</span> {children.length === 1 ? 'child' : 'children'} added
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isChildModalOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isChildModalOpen}
                            title={selectedChild ? "Edit Child" : "Add New Child"}
                            fields={childFields}
                            initialData={selectedChild || {}}
                            onSubmit={handleChildSubmit}
                            actionType={selectedChild ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedChild ? "Update Child" : "Add Child"}
                            onClose={() => { setIsChildModalOpen(false); setSelectedChild(null); }}
                            size="md"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
