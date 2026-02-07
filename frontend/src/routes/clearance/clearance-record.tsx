import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Eye,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    UserCheck,
    AlertTriangle,
    Briefcase,
    DollarSign
} from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { useNavigate } from "react-router-dom";

export default function MyClearanceRequests() {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "clearanceNo", label: "Clearance No.", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
            key: "createdAt",
            label: "Requested On",
            sortable: true,
            icon: <Calendar size={14} />,
        },
    ];

    const fetchClearances = async () => {
        setLoading(true);
        const toastId = showToast("Fetching clearance requests...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "clearance/my", {});
            removeToast(toastId);

            if (res.success && res.data) {
                setData(
                    res.data.map((c: any) => ({
                        ...c,
                        clearanceNo: `CLR-${String(c.id).padStart(5, "0")}`,
                        createdAt: new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                    }))
                );
            } else {
                showToast("Failed to fetch clearance records.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClearances();
    }, []);

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
                            {row.position} • {row.employmentStatus}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 text-sm font-semibold rounded-lg border-2 bg-blue-50 text-blue-700 border-blue-300">
                        {row.employmentStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Employment Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Position:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.position}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Salary:</span>
                            <span className="text-sm font-bold text-green-700">
                                ₱{parseFloat(row.salary).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.employmentStatus}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-blue-600" />
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
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${row.isHaveDeanSignature ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <UserCheck size={18} className={row.isHaveDeanSignature ? 'text-green-600' : 'text-slate-400'} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">Dean Signature</p>
                                <p className="text-xs text-slate-600">
                                    {row.isHaveDeanSignature ? 'Approved & Signed' : 'Pending signature'}
                                </p>
                            </div>
                            {row.isHaveDeanSignature && (
                                <CheckCircle size={20} className="text-green-600" />
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
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${row.isHavePresidentSignature ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <UserCheck size={18} className={row.isHavePresidentSignature ? 'text-green-600' : 'text-slate-400'} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">President Signature</p>
                                <p className="text-xs text-slate-600">
                                    {row.isHavePresidentSignature ? 'Approved & Signed' : 'Pending signature'}
                                </p>
                            </div>
                            {row.isHavePresidentSignature && (
                                <CheckCircle size={20} className="text-green-600" />
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/clearance/${row.id}`)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                title="View Clearance"
            >
                <Eye size={16} />
            </motion.button>

            {row.status === "PENDING" && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelected(row); setIsEditOpen(true); }}
                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelected(row); setIsDeleteOpen(true); }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                </>
            )}
        </>
    );

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
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
                    My Clearance Requests
                </h1>
                <p className="text-base text-slate-600">
                    View all your clearance requests here. Expand a row to see details or take actions such as editing or deleting a request.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Clearance Requests"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            <AnimatePresence>
                {isEditOpen && selected && (
                    <DynamicForm
                        isModal
                        isOpen
                        title="Edit Clearance Purpose"
                        fields={[
                            {
                                name: "purpose",
                                label: "Purpose",
                                type: "textarea",
                                rows: 5,
                                required: true,
                            },
                        ]}
                        initialData={selected}
                        onSubmit={async (data) => {
                            const toastId = showToast("Updating clearance...", "loading");
                            try {
                                await RequestHandler.fetchData(
                                    "PUT",
                                    `clearance/update/${selected.id}`,
                                    data
                                );
                                removeToast(toastId);
                                showToast("Clearance updated.", "success");
                                setIsEditOpen(false);
                                fetchClearances();
                            } catch {
                                removeToast(toastId);
                                showToast("Update failed.", "error");
                            }
                        }}
                        actionType="UPDATE"
                        submitButtonText="Update"
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteOpen && selected && (
                    <DynamicForm
                        isModal
                        isOpen
                        title="Delete Clearance"
                        fields={[
                            {
                                name: "confirm",
                                label: "Type DELETE to confirm",
                                type: "text",
                                required: true,
                                validation: (v: string) =>
                                    v !== "DELETE" ? "Type DELETE to proceed" : undefined,
                                icon: <AlertTriangle size={16} />,
                            },
                        ]}
                        onSubmit={async () => {
                            const toastId = showToast("Deleting clearance...", "loading");
                            try {
                                await RequestHandler.fetchData(
                                    "DELETE",
                                    `clearance/delete/${selected.id}`,
                                    {}
                                );
                                removeToast(toastId);
                                showToast("Clearance deleted.", "success");
                                setIsDeleteOpen(false);
                                fetchClearances();
                            } catch {
                                removeToast(toastId);
                                showToast("Delete failed.", "error");
                            }
                        }}
                        actionType="DELETE"
                        submitButtonText="Delete"
                        onClose={() => setIsDeleteOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
