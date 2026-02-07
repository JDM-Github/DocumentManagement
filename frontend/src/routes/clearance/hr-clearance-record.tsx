import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Eye,
    CheckCircle,
    FileText,
    UserCheck,
    Edit3,
    DollarSign,
    User,
    Clock
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { useNavigate } from "react-router-dom";

export default function ClearanceRecord({
    isDean,
    isPresident
}: {
    isDean: boolean;
    isPresident: boolean;
}) {
    const navigate = useNavigate();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClearance, setSelectedClearance] = useState<any>(null);
    const [isSignOpen, setIsSignOpen] = useState(false);

    const columns = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            width: "60px",
        },
        {
            key: "clearanceNo",
            label: "Clearance Number",
            sortable: true,
        },
        {
            key: "employeeName",
            label: "Employee",
            sortable: true,
        },
        {
            key: "employmentStatus",
            label: "Employment Type",
            sortable: true,
        },
        {
            key: "createdAt",
            label: "Date Created",
            sortable: true,
            icon: <Calendar size={14} />,
        },
        {
            key: "status",
            label: "Status",
        },
        {
            key: "signatureStatus",
            label: "Signatures",
        },
    ];

    const fetchRecords = async () => {
        setLoading(true);
        const toastId = showToast("Fetching clearance records...", "loading");

        try {
            let res: any;
            if (isDean || isPresident) {
                res = await RequestHandler.fetchData(
                    "GET",
                    "clearance/get-all-higherup",
                    {}
                );
            } else {
                res = await RequestHandler.fetchData(
                    "GET",
                    "clearance/get-all-department",
                    {}
                );
            }
            removeToast(toastId);

            if (res.success && res.clearances) {
                const formatted = res.clearances.map((c: any) => ({
                    id: c.id,
                    clearanceNo: `CLR-${String(c.id).padStart(4, '0')}`,
                    userId: c.userId,
                    employeeName: c.user ? `${c.user.firstName} ${c.user.lastName}` : "N/A",
                    salary: c.salary,
                    position: c.position,
                    employmentStatus: c.employmentStatus,
                    purpose: c.purpose,
                    effectiveFrom: c.effectiveFrom,
                    effectiveTo: c.effectiveTo,
                    createdAt: new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    isInDean: c.isInDean,
                    isInPresident: c.isInPresident,
                    isHaveDeanSignature: c.isHaveDeanSignature,
                    isHavePresidentSignature: c.isHavePresidentSignature,
                    status: c.status,
                    signatureStatus: `${c.isHaveDeanSignature ? '✓' : '○'} Dean | ${c.isHavePresidentSignature ? '✓' : '○'} President`,
                    user: c.user,
                }));
                setData(formatted);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const getStatusBadge = (status: string) => {
        const badges: any = {
            "PENDING": "bg-amber-100 text-amber-700 border-amber-200",
            "APPROVED BY DEAN": "bg-blue-100 text-blue-700 border-blue-200",
            "APPROVED BY PRESIDENT": "bg-green-100 text-green-700 border-green-200",
            "REJECTED": "bg-red-100 text-red-700 border-red-200",
        };
        return badges[status] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    const getEmploymentBadge = (type: string) => {
        return type === "FACULTY"
            ? "bg-purple-100 text-purple-700 border-purple-200"
            : "bg-cyan-100 text-cyan-700 border-cyan-200";
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
                        <h4 className="text-base font-bold text-slate-800">Clearance Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.employeeName} • {row.position}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getStatusBadge(row.status)}`}>
                        {row.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-sm font-bold text-slate-800">Employee Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Name:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.employeeName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Position:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.position}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Employment Type:</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded border ${getEmploymentBadge(row.employmentStatus)}`}>
                                {row.employmentStatus}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Salary:</span>
                            <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                                ₱{parseFloat(row.salary).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Effective Period</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">From:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {new Date(row.effectiveFrom).toLocaleDateString("en-US", {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">To:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {new Date(row.effectiveTo).toLocaleDateString("en-US", {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-sm text-slate-600">Duration:</span>
                            <span className="text-sm font-bold text-blue-600">
                                {Math.ceil((new Date(row.effectiveTo).getTime() - new Date(row.effectiveFrom).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Purpose of Clearance</p>
                <p className="text-base text-blue-700">{row.purpose}</p>
            </div>

            <div className="space-y-3">
                <h5 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    Signature Status
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border-2 transition-all ${row.isHaveDeanSignature
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                            : "bg-white border-slate-200"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${row.isHaveDeanSignature ? 'bg-green-100' : 'bg-slate-100'}`}>
                                    <UserCheck size={18} className={row.isHaveDeanSignature ? 'text-green-600' : 'text-slate-400'} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Dean Signature</p>
                                    <p className="text-xs text-slate-600">
                                        {row.isHaveDeanSignature ? 'Approved & Signed' : 'Pending signature'}
                                    </p>
                                </div>
                            </div>
                            {row.isHaveDeanSignature && (
                                <CheckCircle size={20} className="text-green-600" />
                            )}
                            {!row.isHaveDeanSignature && isDean && row.isInDean && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedClearance(row);
                                        setIsSignOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                >
                                    <Edit3 size={12} />
                                    Sign
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`p-4 rounded-xl border-2 transition-all ${row.isHavePresidentSignature
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                            : "bg-white border-slate-200"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${row.isHavePresidentSignature ? 'bg-green-100' : 'bg-slate-100'}`}>
                                    <UserCheck size={18} className={row.isHavePresidentSignature ? 'text-green-600' : 'text-slate-400'} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">President Signature</p>
                                    <p className="text-xs text-slate-600">
                                        {row.isHavePresidentSignature ? 'Approved & Signed' : 'Pending signature'}
                                    </p>
                                </div>
                            </div>
                            {row.isHavePresidentSignature && (
                                <CheckCircle size={20} className="text-green-600" />
                            )}
                            {!row.isHavePresidentSignature && isPresident && row.isInPresident && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedClearance(row);
                                        setIsSignOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                >
                                    <Edit3 size={12} />
                                    Sign
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
    const updateStatus = async (id: number, status: string) => {
        const toastId = showToast("Updating status...", "loading");

        const res = await RequestHandler.fetchData(
            "PUT",
            `clearance/update-status/${id}`,
            { status }
        );
        removeToast(toastId);
        if (res.success) {
            showToast(`Clearance ${status.toLowerCase()}.`, "success");
            fetchRecords();
            setIsSignOpen(false);
        } else {
            showToast("Failed to update status.", "error");
        }
    };

    const canDeanAct = (row: any) =>
        isDean && row.isInDean && row.status === "PENDING";

    const canPresidentAct = (row: any) =>
        isPresident && row.isInPresident && row.status === "APPROVED BY DEAN";

    const renderActions = (row: any) => (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/clearance/${row.id}`)}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                title="View Details"
            >
                <Eye size={16} />
            </motion.button>

            {canDeanAct(row) && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(row.id, "APPROVED BY DEAN")}
                        className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                        title="Approve (Dean)"
                    >
                        ✔
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(row.id, "REJECTED")}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Reject"
                    >
                        ✖
                    </motion.button>
                </>
            )}

            {canPresidentAct(row) && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(row.id, "APPROVED BY PRESIDENT")}
                        className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                        title="Approve (President)"
                    >
                        ✔
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(row.id, "REJECTED")}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Reject"
                    >
                        ✖
                    </motion.button>
                </>
            )}
        </>
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
                    Employee Clearance Records
                </h1>
                <p className="text-base text-slate-600">
                    Review and sign employee clearance requests awaiting approval.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="Employee Clearance Records"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isSignOpen && selectedClearance && (
                    <DynamicForm
                        isModal
                        isOpen={isSignOpen}
                        title="Sign Clearance"
                        fields={[
                            {
                                name: "clearanceNo",
                                label: "Clearance Number",
                                type: "text",
                                disabled: true,
                                icon: <FileText size={14} />,
                                placeholder: selectedClearance.clearanceNo,
                            },
                            {
                                name: "employee",
                                label: "Employee",
                                type: "text",
                                disabled: true,
                                icon: <User size={14} />,
                                placeholder: selectedClearance.employeeName,
                            },
                        ]}
                        onSubmit={async () => {
                            await updateStatus(
                                selectedClearance.id,
                                isDean ? "APPROVED BY DEAN" : "APPROVED BY PRESIDENT"
                            );
                        }}
                        actionType="UPDATE"
                        submitButtonText="Sign Clearance"
                        onClose={() => setIsSignOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}