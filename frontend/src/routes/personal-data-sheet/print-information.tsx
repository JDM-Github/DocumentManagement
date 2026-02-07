import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Printer,
    Download,
    Copy,
    Filter,
    ChevronDown,
    ChevronUp,
    User,
    Users,
    GraduationCap,
    Award,
    Briefcase,
    Heart,
    BookOpen,
    Lightbulb,
    Info,
    MapPin,
    Loader2,
} from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function ViewPersonalDataSheet() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSections, setSelectedSections] = useState<string[]>([
        "personalInformation",
        "familyBackground",
        "educationalBackground",
        "civilServiceEligibility",
        "workExperience",
        "voluntaryWork",
        "learningAndDevelopment",
        "skillsAndHobbies",
        "otherInformation",
        "references",
    ]);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [showFilter, setShowFilter] = useState(false);

    const sections = [
        { id: "personalInformation", label: "Personal Information", icon: <User size={18} /> },
        { id: "familyBackground", label: "Family Background", icon: <Users size={18} /> },
        { id: "educationalBackground", label: "Educational Background", icon: <GraduationCap size={18} /> },
        { id: "civilServiceEligibility", label: "Civil Service Eligibility", icon: <Award size={18} /> },
        { id: "workExperience", label: "Work Experience", icon: <Briefcase size={18} /> },
        { id: "voluntaryWork", label: "Voluntary Work", icon: <Heart size={18} /> },
        { id: "learningAndDevelopment", label: "Learning & Development", icon: <BookOpen size={18} /> },
        { id: "skillsAndHobbies", label: "Skills & Hobbies", icon: <Lightbulb size={18} /> },
        { id: "otherInformation", label: "Other Information", icon: <Info size={18} /> },
        { id: "references", label: "References", icon: <MapPin size={18} /> },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast("Loading personal data sheet...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "personal-data-sheet/get", {});
            removeToast(toastId);

            if (res.success) {
                setData(res.data);
                // Expand all sections by default
                setExpandedSections(sections.map(s => s.id));
            } else {
                showToast("Failed to load data", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Error loading data", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId: string) => {
        setSelectedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleExpanded = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const selectAll = () => {
        setSelectedSections(sections.map((s) => s.id));
    };

    const deselectAll = () => {
        setSelectedSections([]);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = async () => {
        const text = generateTextContent();
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    };

    const handleDownloadCSV = () => {
        const csv = generateCSV();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Personal_Data_Sheet_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("CSV downloaded!", "success");
    };

    const generateTextContent = () => {
        let text = "PERSONAL DATA SHEET\n\n";

        selectedSections.forEach((sectionId) => {
            const section = sections.find((s) => s.id === sectionId);
            if (!section || !data?.[sectionId]) return;

            text += `\n${"=".repeat(50)}\n`;
            text += `${section.label.toUpperCase()}\n`;
            text += `${"=".repeat(50)}\n\n`;

            const sectionData = data[sectionId];
            text += JSON.stringify(sectionData, null, 2);
            text += "\n";
        });

        return text;
    };

    const generateCSV = () => {
        let csv = "\uFEFF"; // UTF-8 BOM for proper Excel encoding

        selectedSections.forEach((sectionId) => {
            const section = sections.find((s) => s.id === sectionId);
            if (!section || !data?.[sectionId]) return;

            const sectionData = data[sectionId];

            // Add section header
            csv += `\n"${section.label.toUpperCase()}"\n`;
            csv += `${"=".repeat(50)}\n`;

            if (sectionId === "personalInformation") {
                csv += generatePersonalInfoCSV(sectionData);
            } else if (sectionId === "familyBackground") {
                csv += generateFamilyBackgroundCSV(sectionData);
            } else if (sectionId === "educationalBackground") {
                csv += generateEducationalBackgroundCSV(sectionData);
            } else if (sectionId === "civilServiceEligibility") {
                csv += generateArrayCSV(sectionData.eligibilities || [], "Eligibility");
            } else if (sectionId === "workExperience") {
                csv += generateArrayCSV(sectionData.experiences || [], "Experience");
            } else if (sectionId === "voluntaryWork") {
                csv += generateArrayCSV(sectionData.entries || [], "Voluntary Work");
            } else if (sectionId === "learningAndDevelopment") {
                csv += generateArrayCSV(sectionData.trainings || [], "Training");
            } else if (sectionId === "skillsAndHobbies") {
                csv += generateArrayCSV(sectionData.entries || [], "Skills/Hobbies");
            } else if (sectionId === "otherInformation") {
                csv += generateOtherInfoCSV(sectionData);
            } else if (sectionId === "references") {
                csv += generateArrayCSV(sectionData.references || [], "Reference");
            }

            csv += "\n\n";
        });

        return csv;
    };

    const generatePersonalInfoCSV = (data: any) => {
        let csv = "Field,Value\n";
        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt") return;
            csv += `"${formatKey(key)}","${value || ""}"\n`;
        });
        return csv;
    };

    const generateFamilyBackgroundCSV = (data: any) => {
        let csv = "Category,Field,Value\n";

        // Spouse info
        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt" || key === "children") return;
            const category = key.toLowerCase().includes("spouse") || key.toLowerCase().includes("employer") || key.toLowerCase().includes("business")
                ? "Spouse"
                : key.toLowerCase().includes("father")
                    ? "Father"
                    : "Mother";
            csv += `"${category}","${formatKey(key)}","${value || ""}"\n`;
        });

        // Children
        if (data.children && data.children.length > 0) {
            data.children.forEach((child: any, index: number) => {
                csv += `"Child ${index + 1}","Full Name","${child.fullName || ""}"\n`;
                csv += `"Child ${index + 1}","Date of Birth","${child.dateOfBirth || ""}"\n`;
            });
        }

        return csv;
    };

    const generateEducationalBackgroundCSV = (data: any) => {
        let csv = "Level,Field,Value\n";
        const levels = ["elementary", "secondary", "vocational", "college", "graduate"];

        levels.forEach((level) => {
            Object.entries(data).forEach(([key, value]: [string, any]) => {
                if (key.toLowerCase().startsWith(level)) {
                    const fieldName = key.replace(level, "").replace(/^./, str => str.toLowerCase());
                    csv += `"${level.charAt(0).toUpperCase() + level.slice(1)}","${formatKey(fieldName)}","${value || ""}"\n`;
                }
            });
        });

        return csv;
    };

    const generateArrayCSV = (items: any[], category: string) => {
        if (!items || items.length === 0) return `"No ${category} entries"\n`;

        let csv = "";
        items.forEach((item, index) => {
            csv += `\n"${category} #${index + 1}"\n`;
            Object.entries(item).forEach(([key, value]: [string, any]) => {
                csv += `"${formatKey(key)}","${value || ""}"\n`;
            });
        });

        return csv;
    };

    const generateOtherInfoCSV = (data: any) => {
        return `"JSON Data"\n"${JSON.stringify(data.details, null, 2).replace(/"/g, '""')}"\n`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-semibold text-slate-800">Loading Personal Data Sheet</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <FileText size={28} className="text-blue-600" />
                                Personal Data Sheet
                            </h1>
                            <p className="text-base text-slate-600">
                                View, print, or export your complete information
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFilter(!showFilter)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <Filter size={16} />
                                Filter Sections
                                {selectedSections.length < sections.length && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        {selectedSections.length}/{sections.length}
                                    </span>
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCopy}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors print:hidden"
                            >
                                <Copy size={16} />
                                Copy
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDownloadCSV}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors print:hidden"
                            >
                                <Download size={16} />
                                CSV
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors print:hidden"
                            >
                                <Printer size={16} />
                                Print
                            </motion.button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilter && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-slate-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-slate-700">Select Sections to Display</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            onClick={deselectAll}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {sections.map((section) => (
                                        <label
                                            key={section.id}
                                            className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSections.includes(section.id)}
                                                onChange={() => toggleSection(section.id)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-blue-600">{section.icon}</span>
                                            <span className="text-sm font-medium text-slate-700">{section.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Sections */}
                <div className="space-y-4">
                    {sections.map((section) => {
                        if (!selectedSections.includes(section.id)) return null;
                        const sectionData = data?.[section.id];
                        const isExpanded = expandedSections.includes(section.id);

                        return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden page-break"
                            >
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleExpanded(section.id)}
                                    className="w-full bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors print:bg-white print:cursor-default"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            {section.icon}
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900">{section.label}</h2>
                                    </div>
                                    <span className="print:hidden">
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </button>

                                {/* Section Content */}
                                <div className={`${isExpanded ? '' : 'hidden'} print:block`}>
                                    <div className="p-6">
                                        {renderSectionContent(section.id, sectionData)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        background: white !important;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    .page-break {
                        page-break-inside: avoid;
                        page-break-after: auto;
                        margin-bottom: 20px;
                    }
                    
                    /* Remove gradients for print */
                    .bg-gradient-to-br,
                    .bg-gradient-to-r {
                        background: white !important;
                    }
                    
                    /* Better borders for print */
                    .border-slate-200 {
                        border-color: #000 !important;
                        border-width: 1px !important;
                    }
                    
                    .border-2 {
                        border-width: 2px !important;
                    }
                    
                    /* Section headers */
                    h1, h2, h3 {
                        color: #000 !important;
                        page-break-after: avoid;
                    }
                    
                    /* Keep card backgrounds subtle */
                    .bg-slate-50,
                    .from-slate-50,
                    .to-blue-50,
                    .from-green-50,
                    .to-emerald-50 {
                        background: #f8f8f8 !important;
                    }
                    
                    /* Text colors */
                    .text-slate-600,
                    .text-slate-700,
                    .text-slate-800,
                    .text-slate-900 {
                        color: #000 !important;
                    }
                    
                    .text-blue-600,
                    .text-blue-900 {
                        color: #1e40af !important;
                    }
                    
                    /* Badges and numbers */
                    .bg-blue-600 {
                        background: #1e40af !important;
                        color: white !important;
                    }
                    
                    .bg-green-600 {
                        background: #16a34a !important;
                        color: white !important;
                    }
                    
                    /* Hide interactive elements */
                    button:not(.print\\:block) {
                        display: none !important;
                    }
                    
                    /* Expand all sections */
                    .motion\\.div {
                        display: block !important;
                        opacity: 1 !important;
                        height: auto !important;
                    }
                    
                    /* Better spacing */
                    .space-y-6 > * + * {
                        margin-top: 1.5rem !important;
                    }
                    
                    .space-y-4 > * + * {
                        margin-top: 1rem !important;
                    }
                    
                    /* Font sizes */
                    .text-lg {
                        font-size: 14pt !important;
                    }
                    
                    .text-base {
                        font-size: 12pt !important;
                    }
                    
                    .text-sm {
                        font-size: 10pt !important;
                    }
                    
                    /* Title */
                    h1 {
                        font-size: 20pt !important;
                        margin-bottom: 10pt !important;
                    }
                    
                    /* Hide shadows */
                    .shadow-sm,
                    .shadow-md,
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    
                    /* Force expand sections */
                    [class*="AnimatePresence"] > div {
                        display: block !important;
                        height: auto !important;
                    }
                }
            `}</style>
        </div>
    );

    function renderSectionContent(sectionId: string, sectionData: any) {
        if (!sectionData) {
            return (
                <div className="text-center py-8 text-slate-500">
                    <p>No data available for this section</p>
                </div>
            );
        }

        // Render based on section type
        switch (sectionId) {
            case "personalInformation":
                return renderPersonalInformation(sectionData);
            case "familyBackground":
                return renderFamilyBackground(sectionData);
            case "educationalBackground":
                return renderEducationalBackground(sectionData);
            case "civilServiceEligibility":
                return renderCivilServiceEligibility(sectionData);
            case "workExperience":
                return renderWorkExperience(sectionData);
            case "voluntaryWork":
                return renderVoluntaryWork(sectionData);
            case "learningAndDevelopment":
                return renderLearningAndDevelopment(sectionData);
            case "skillsAndHobbies":
                return renderSkillsAndHobbies(sectionData);
            case "otherInformation":
                return renderOtherInformation(sectionData);
            case "references":
                return renderReferences(sectionData);
            default:
                return renderGeneric(sectionData);
        }
    }

    function renderPersonalInformation(data: any) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(data).map(([key, value]: [string, any]) => {
                    if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt") return null;
                    return (
                        <div key={key} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                            <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{formatKey(key)}</p>
                            <p className="text-lg text-slate-900 font-medium">{value || "—"}</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderFamilyBackground(data: any) {
        return (
            <div className="space-y-8">
                {/* Spouse Section */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        Spouse Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data).map(([key, value]: [string, any]) => {
                            if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt" || key === "children" || !key.toLowerCase().includes("spouse") && !key.toLowerCase().includes("employer") && !key.toLowerCase().includes("business")) return null;
                            return (
                                <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-600 mb-1">{formatKey(key)}</p>
                                    <p className="text-base text-slate-900">{value || "—"}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Parents Section */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        Parents Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data).map(([key, value]: [string, any]) => {
                            if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt" || key === "children" || !key.toLowerCase().includes("father") && !key.toLowerCase().includes("mother")) return null;
                            return (
                                <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-600 mb-1">{formatKey(key)}</p>
                                    <p className="text-base text-slate-900">{value || "—"}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Children Section */}
                {data.children && data.children.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                            Children
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.children.map((child: any, index: number) => (
                                <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{child.fullName || "—"}</p>
                                    </div>
                                    <p className="text-base text-slate-700 ml-10">
                                        <span className="font-semibold">Born:</span> {child.dateOfBirth || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function renderEducationalBackground(data: any) {
        const levels = ["elementary", "secondary", "vocational", "college", "graduate"];
        const levelLabels: any = {
            elementary: "Elementary",
            secondary: "Secondary",
            vocational: "Vocational / Trade Course",
            college: "College",
            graduate: "Graduate Studies"
        };

        return (
            <div className="space-y-6">
                {levels.map((level) => {
                    const levelData: any = {};
                    Object.entries(data).forEach(([key, value]) => {
                        if (key.toLowerCase().startsWith(level)) {
                            levelData[key.replace(level, "").replace(/^./, str => str.toLowerCase())] = value;
                        }
                    });

                    if (Object.keys(levelData).length === 0 || !levelData.schoolName) return null;

                    return (
                        <div key={level} className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <GraduationCap size={20} className="text-blue-600" />
                                {levelLabels[level]}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(levelData).map(([key, value]: [string, any]) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-600">{formatKey(key)}</p>
                                        <p className="text-base text-slate-900">{value || "—"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderCivilServiceEligibility(data: any) {
        if (!data.eligibilities || data.eligibilities.length === 0) {
            return <p className="text-slate-500 text-center py-8">No eligibility entries</p>;
        }
        return renderArray(data.eligibilities, "Eligibility");
    }

    function renderWorkExperience(data: any) {
        if (!data.experiences || data.experiences.length === 0) {
            return <p className="text-slate-500 text-center py-8">No work experience entries</p>;
        }
        return renderArray(data.experiences, "Experience");
    }

    function renderVoluntaryWork(data: any) {
        if (!data.entries || data.entries.length === 0) {
            return <p className="text-slate-500 text-center py-8">No voluntary work entries</p>;
        }
        return renderArray(data.entries, "Voluntary Work");
    }

    function renderLearningAndDevelopment(data: any) {
        if (!data.trainings || data.trainings.length === 0) {
            return <p className="text-slate-500 text-center py-8">No training entries</p>;
        }
        return renderArray(data.trainings, "Training");
    }

    function renderSkillsAndHobbies(data: any) {
        if (!data.entries || data.entries.length === 0) {
            return <p className="text-slate-500 text-center py-8">No skills or hobbies entries</p>;
        }
        return renderArray(data.entries, "Entry");
    }

    function renderReferences(data: any) {
        if (!data.references || data.references.length === 0) {
            return <p className="text-slate-500 text-center py-8">No reference entries</p>;
        }
        return renderArray(data.references, "Reference");
    }

    function renderArray(items: any[], itemLabel: string) {
        if (!items || items.length === 0) {
            return <p className="text-slate-500 text-center py-8">No {itemLabel.toLowerCase()} entries</p>;
        }

        return (
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-200">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-base shadow-sm">
                                {index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{itemLabel}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(item).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-600 mb-1 uppercase tracking-wide">{formatKey(key)}</p>
                                    <p className="text-base text-slate-900 font-medium">{String(value) || "—"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function renderOtherInformation(data: any) {
        const details = data?.details ? Object.entries(data.details) : [];

        if (!details || details.length === 0) {
            return (
                <p className="text-slate-500 text-center py-8">
                    No other information entries
                </p>
            );
        }

        return (
            <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-200">
                        <h3 className="text-lg font-bold text-slate-900">
                            Other Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {details.map(([key, value]) => (
                            <div
                                key={key}
                                className="p-3 bg-white rounded-lg border border-slate-200"
                            >
                                <p className="text-sm font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                                    {formatKey(key)}
                                </p>
                                <p className="text-base text-slate-900 font-medium">
                                    {value !== null && value !== "" ? String(value) : "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }


    function renderGeneric(data: any) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data).map(([key, value]: [string, any]) => {
                    if (key === "id" || key === "userId" || key === "createdAt" || key === "updatedAt" || key === "deletedAt") return null;
                    return (
                        <div key={key} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                            <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{formatKey(key)}</p>
                            <p className="text-base text-slate-900 font-medium">{typeof value === "object" ? JSON.stringify(value) : (value || "—")}</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    function formatKey(key: string) {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }
}