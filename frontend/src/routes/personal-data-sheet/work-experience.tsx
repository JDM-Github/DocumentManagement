import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { Calendar, Briefcase, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function WorkExperience() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState<any>(null);

    const experienceFields = [
        { name: "dateFrom", label: "From", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "dateTo", label: "To", type: "date", required: true, icon: <Calendar size={16} /> },
        { name: "positionTitle", label: "Position Title", type: "text", required: true, icon: <Briefcase size={16} /> },
        { name: "departmentAgency", label: "Department / Agency / Company", type: "text", required: true },
        { name: "monthlySalary", label: "Monthly Salary", type: "text" },
        { name: "salaryJobPayGrade", label: "Salary / Job / Pay Grade", type: "text" },
        { name: "statusOfAppointment", label: "Status of Appointment", type: "text" },
        { name: "governmentService", label: "Government Service?", type: "checkbox" },
    ];

    // ----------------------------
    // Fetch existing work experiences
    // ----------------------------
    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "work-experience/find-or-create",
                    {}
                );
                if (res.success && res.workExperience?.experiences) {
                    setExperiences(res.workExperience.experiences);
                }
            } catch (err) {
                showToast("Failed to load work experiences.", "error");
                console.error(err);
            }
        };
        fetchExperiences();
    }, []);


    const handleExperienceSubmit = (data: any) => {
        if (selectedExperience) {
            setExperiences(prev => prev.map(e => e === selectedExperience ? data : e));
            showToast("Work experience updated successfully!", "success");
        } else {
            setExperiences(prev => [...prev, data]);
            showToast("Work experience added successfully!", "success");
        }
        setSelectedExperience(null);
        setIsExperienceModalOpen(false);
    };

    const handleExperienceEdit = (experience: any) => {
        setSelectedExperience(experience);
        setIsExperienceModalOpen(true);
    };

    const handleExperienceDelete = (experience: any) => {
        setExperiences(prev => prev.filter(e => e !== experience));
        showToast("Work experience removed", "success");
    };

    const handleSubmit = async () => {
        if (experiences.length === 0) {
            return showToast("Please add at least one work experience entry.", "error");
        }

        const toastId = showToast("Saving work experiences...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "work-experience/find-or-create",
                { experiences }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Work experience saved successfully!", "success");
                window.location.reload();
            } else {
                showToast(res.message || "Failed to save work experiences.", "error");
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
                        Work Experience
                    </h1>
                    <p className="text-base text-slate-600">
                        Add your previous work experience entries
                    </p>
                </div>

                {/* Work Experience Section */}
                <motion.div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Experiences</h2>
                        <button
                            onClick={() => { setSelectedExperience(null); setIsExperienceModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Add Experience
                        </button>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        {experiences.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                                    <AlertCircle size={32} className="text-slate-400" />
                                </div>
                                <p className="text-base font-medium text-slate-600 mb-1">No work experiences added yet</p>
                                <p className="text-sm text-slate-500">Click "Add Experience" to start</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {experiences.map((exp, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="border-2 border-slate-200 p-4 rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-slate-800">{exp.positionTitle}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleExperienceEdit(exp)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleExperienceDelete(exp)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {exp.departmentAgency} | {new Date(exp.dateFrom).toLocaleDateString()} - {new Date(exp.dateTo).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Salary: {exp.monthlySalary || "N/A"} | Pay Grade: {exp.salaryJobPayGrade || "N/A"} | Status: {exp.statusOfAppointment || "N/A"} | Government Service: {exp.governmentService ? "Yes" : "No"}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {experiences.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-slate-700">
                                    <span className="font-semibold text-green-600">{experiences.length}</span> {experiences.length === 1 ? 'experience' : 'experiences'} ready
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                Save Work Experiences
                            </button>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {isExperienceModalOpen && (
                        <DynamicForm
                            isModal={true}
                            isOpen={isExperienceModalOpen}
                            title={selectedExperience ? "Edit Experience" : "Add New Experience"}
                            fields={experienceFields}
                            initialData={selectedExperience || {}}
                            onSubmit={handleExperienceSubmit}
                            actionType={selectedExperience ? "UPDATE" : "CREATE"}
                            submitButtonText={selectedExperience ? "Update Experience" : "Add Experience"}
                            onClose={() => { setIsExperienceModalOpen(false); setSelectedExperience(null); }}
                            size="lg"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
