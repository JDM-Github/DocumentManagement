import { JSX, useEffect, useState } from "react";
import { Calendar, Eye, FileText } from "lucide-react";
import DataTable, { AdditionalButton } from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RequestStatus({
    title,
    departmentId,
    status,
    renderActions,
    toggleRefresh,
    additionalButtons = [],
    handleSelectionChange,
}: {
    title: string;
    departmentId: string,
    status: string,
    toggleRefresh?: boolean,
    renderActions?: (row: any) => JSX.Element,
    additionalButtons?: AdditionalButton[];
    handleSelectionChange?: (rows: any[]) => void;
}) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [departmentsMap, setDepartmentsMap] = useState<Record<string, string>>({});

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requestNo", label: "Request No", sortable: true },
        { key: "requesterName", label: "Requester", sortable: true },
        { key: "lastDepartmentId", label: "From Department", sortable: true },
        { key: "createdAt", label: "Date", sortable: true, icon: <Calendar size={14} /> },
        { key: "updatedAt", label: "Updated Date", sortable: true, icon: <Calendar size={14} /> },
    ];

    const fetchDepartments = async () => {
        const id = showToast(`Fetching all departments requests...`, "loading");
        const res = await RequestHandler.fetchData(
            "GET",
            "department/get-all",
            {},
        );
        if (res.success && res.departments) {
            const map: Record<string, string> = {};
            res.departments.forEach((d: any) => (map[d.id] = d.name));
            setDepartmentsMap(map);
            removeToast(id);
        } else {
            removeToast(id);
            showToast("Failed to fetch departments.", "error");
        }
    };

    const fetchRequests = async (status: string, showT: boolean = true) => {
        setLoading(true);
        const id = showToast(`Fetching ${status.toLowerCase()} requests...`, "loading");
        const res = await RequestHandler.fetchData(
            "GET",
            `request-letter/department/${departmentId}/${status}`,
            {},
        );

        if (res.success && res.requestLetters) {
            const formatted = res.requestLetters.map((r: any) => ({
                id: r.id,
                allSignature: r.allSignature,
                requestNo: r.requestNo,
                requesterName: r.requesterName,
                lastDepartmentId: departmentsMap[r.lastDepartmentId] || r.lastDepartmentId || "N/A",
                currentDepartmentName: departmentsMap[r.currentDepartmentId] || r.currentDepartmentId,
                status: r.status,
                createdAt: new Date(r.createdAt).toLocaleString("en-PH"),
                updatedAt: new Date(r.updatedAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            if (showT) showToast(`${status} requests fetched successfully.`, "success");
        } else {
            setData([]);
            showToast(`Failed to fetch ${status} requests.`, "error");
            console.error("Failed to fetch requests", res);
        }

        setLoading(false);
        removeToast(id);
    };

    useEffect(() => { fetchDepartments(); }, []);
    useEffect(() => { if (initialized) fetchRequests(status, false); }, [toggleRefresh]);
    useEffect(() => {
        if (Object.keys(departmentsMap).length) {
            setInitialized(true);
            fetchRequests(status);
        }
    }, [departmentsMap]);

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
                        <h4 className="text-base font-bold text-slate-800">Request Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.requestNo} • {row.requesterName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${row.status === "ONGOING" || row.status === "TO_RECEIVE"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                            : row.status === "COMPLETED"
                                ? "bg-green-50 text-green-700 border-green-300"
                                : "bg-red-50 text-red-700 border-red-300"
                        }`}>
                        {row.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-sm font-bold text-slate-800">Request Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Request No:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.requestNo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Requester:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.requesterName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">From Department:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.lastDepartmentId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className={`text-sm font-semibold ${row.status === "ONGOING" || row.status === "TO_RECEIVE"
                                    ? "text-yellow-600"
                                    : row.status === "COMPLETED"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}>
                                {row.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderAllActions = (row: any) => (
        <>
            <button
                onClick={() => {
                    navigate(`/requests/${row.id}`);
                    window.location.reload();
                }}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                title="View Request"
            >
                <Eye size={14} />
            </button>
            {renderActions && renderActions(row)}
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
                    {title}
                </h1>
                <p className="text-base text-slate-600">
                    Track and manage all submitted documents. You can view details, monitor their current status,
                    and perform actions such as forwarding, releasing, or signing as appropriate.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title={title}
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable={true}
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderAllActions}
                    additionalButtons={additionalButtons}
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                />
            </motion.div>
        </motion.div>
    );
}
