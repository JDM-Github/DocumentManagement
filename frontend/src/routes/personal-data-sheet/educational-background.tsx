import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { BookOpen, Calendar } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function EducationalBackground() {
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const educationFields = [
        /* =========================
           ELEMENTARY
        ========================== */
        { name: "elementarySchoolName", label: "School Name", type: "text", section: "Elementary", icon: <BookOpen size={16} /> },
        { name: "elementaryBasicEducation", label: "Basic Education", type: "text", section: "Elementary" },
        { name: "elementaryPeriodFrom", label: "Period From", type: "date", section: "Elementary", icon: <Calendar size={16} /> },
        { name: "elementaryPeriodTo", label: "Period To", type: "date", section: "Elementary", icon: <Calendar size={16} /> },
        { name: "elementaryHighestLevelUnitEarned", label: "Highest Level / Units Earned", type: "text", section: "Elementary" },
        { name: "elementaryYearGraduated", label: "Year Graduated", type: "text", section: "Elementary" },
        { name: "elementaryScholarHonors", label: "Scholar / Honors", type: "text", section: "Elementary" },

        /* =========================
           SECONDARY
        ========================== */
        { name: "secondarySchoolName", label: "School Name", type: "text", section: "Secondary", icon: <BookOpen size={16} /> },
        { name: "secondaryBasicEducation", label: "Basic Education", type: "text", section: "Secondary" },
        { name: "secondaryPeriodFrom", label: "Period From", type: "date", section: "Secondary", icon: <Calendar size={16} /> },
        { name: "secondaryPeriodTo", label: "Period To", type: "date", section: "Secondary", icon: <Calendar size={16} /> },
        { name: "secondaryHighestLevelUnitEarned", label: "Highest Level / Units Earned", type: "text", section: "Secondary" },
        { name: "secondaryYearGraduated", label: "Year Graduated", type: "text", section: "Secondary" },
        { name: "secondaryScholarHonors", label: "Scholar / Honors", type: "text", section: "Secondary" },

        /* =========================
           VOCATIONAL / TRADE
        ========================== */
        { name: "vocationalSchoolName", label: "School Name", type: "text", section: "Vocational / Trade", icon: <BookOpen size={16} /> },
        { name: "vocationalBasicEducation", label: "Basic Education", type: "text", section: "Vocational / Trade" },
        { name: "vocationalPeriodFrom", label: "Period From", type: "date", section: "Vocational / Trade", icon: <Calendar size={16} /> },
        { name: "vocationalPeriodTo", label: "Period To", type: "date", section: "Vocational / Trade", icon: <Calendar size={16} /> },
        { name: "vocationalHighestLevelUnitEarned", label: "Highest Level / Units Earned", type: "text", section: "Vocational / Trade" },
        { name: "vocationalYearGraduated", label: "Year Graduated", type: "text", section: "Vocational / Trade" },
        { name: "vocationalScholarHonors", label: "Scholar / Honors", type: "text", section: "Vocational / Trade" },

        /* =========================
           COLLEGE
        ========================== */
        { name: "collegeSchoolName", label: "School Name", type: "text", section: "College", icon: <BookOpen size={16} /> },
        { name: "collegeDegreeCourse", label: "Degree / Course", type: "text", section: "College" },
        { name: "collegePeriodFrom", label: "Period From", type: "date", section: "College", icon: <Calendar size={16} /> },
        { name: "collegePeriodTo", label: "Period To", type: "date", section: "College", icon: <Calendar size={16} /> },
        { name: "collegeHighestLevelUnitEarned", label: "Highest Level / Units Earned", type: "text", section: "College" },
        { name: "collegeYearGraduated", label: "Year Graduated", type: "text", section: "College" },
        { name: "collegeScholarHonors", label: "Scholar / Honors", type: "text", section: "College" },

        /* =========================
           GRADUATE STUDIES
        ========================== */
        { name: "graduateSchoolName", label: "School Name", type: "text", section: "Graduate Studies", icon: <BookOpen size={16} /> },
        { name: "graduateDegreeCourse", label: "Degree / Course", type: "text", section: "Graduate Studies" },
        { name: "graduatePeriodFrom", label: "Period From", type: "date", section: "Graduate Studies", icon: <Calendar size={16} /> },
        { name: "graduatePeriodTo", label: "Period To", type: "date", section: "Graduate Studies", icon: <Calendar size={16} /> },
        { name: "graduateHighestLevelUnitEarned", label: "Highest Level / Units Earned", type: "text", section: "Graduate Studies" },
        { name: "graduateYearGraduated", label: "Year Graduated", type: "text", section: "Graduate Studies" },
        { name: "graduateScholarHonors", label: "Scholar / Honors", type: "text", section: "Graduate Studies" },
    ];

    useEffect(() => {
        const fetchEducationalBackground = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "educational-background/find-or-create",
                    {}
                );
                if (res.success && res.educationalBackground) {
                    setInitialValues(res.educationalBackground);
                }
            } catch (err) {
                showToast("Failed to load educational background.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEducationalBackground();
    }, []);

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Saving educational background...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "educational-background/find-or-create",
                data
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Educational background saved successfully!", "success");
                window.location.reload();
            } else {
                showToast(res.message || "Failed to save educational background.", "error");
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
                        Educational Background
                    </h1>
                    <p className="text-base text-slate-600">
                        Fill out your educational history from elementary to graduate studies
                    </p>
                </div>

                {!loading && (
                    <DynamicForm
                        isModal={false}
                        isOpen={true}
                        title="Educational Background Form"
                        fields={educationFields}
                        initialData={initialValues || {}}
                        onSubmit={handleSubmit}
                        actionType="UPDATE"
                        submitButtonText="Save Educational Background"
                        size="xl"
                    />
                )}
            </motion.div>
        </div>
    );
}
