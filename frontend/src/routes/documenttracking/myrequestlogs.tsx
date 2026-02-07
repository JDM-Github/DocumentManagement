import { useEffect, useState } from "react";
import { Calendar, Eye, FileText } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type RequestLogsTableProps = {
    userId: string;
};

export default function MyRequestLogsTable({ userId }: RequestLogsTableProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [departmentsMap, setDepartmentsMap] = useState<Record<string, string>>({});

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requestNo", label: "Request No", sortable: true },
        { key: "actedByName", label: "Acted By", sortable: true },
        { key: "action", label: "Action", sortable: true },
        { key: "departmentName", label: "Department", sortable: true },
        { key: "remarks", label: "Remarks", sortable: false },
        { key: "createdAt", label: "Date", sortable: true, icon: <Calendar size={14} /> },
    ];

    const fetchDepartments = async () => {
        const id = showToast("Fetching all departments...", "loading");
        const res = await RequestHandler.fetchData(
            "GET",
            "department/get-all",
            {},
            { Authorization: "Bearer DocumentTrackingSystem" }
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

    const fetchLogs = async () => {
        setLoading(true);
        const id = showToast(`Fetching request logs...`, "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            `request-letter/tracker/${userId}`,
            {},
            { Authorization: "Bearer DocumentTrackingSystem" }
        );

        if (res.success && res.logs) {
            const formatted = res.logs.map((log: any) => ({
                id: log.id,
                requestNo: log.requestNo,
                requestLetterId: log.requestLetterId,
                action: log.action,
                departmentName: log.toDepartmentId ? departmentsMap[log.toDepartmentId] : "N/A",
                actedByName: log.actedByName || "System",
                remarks: log.remarks || "",
                createdAt: new Date(log.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast(`Request logs fetched successfully.`, "success");
        } else {
            setData([]);
            showToast(`Failed to fetch request logs.`, "error");
            console.error("Failed to fetch logs", res);
        }

        setLoading(false);
        removeToast(id);
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (Object.keys(departmentsMap).length) fetchLogs();
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
                            {row.requestNo} • {row.action}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 text-sm font-semibold rounded-lg border-2 bg-blue-50 text-blue-700 border-blue-300">
                        {row.action}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-sm font-bold text-slate-800">Action Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Request No:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.requestNo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Acted By:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.actedByName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Action:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.action}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Department:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.departmentName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {row.remarks && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Remarks</p>
                    <p className="text-base text-blue-700">{row.remarks}</p>
                </div>
            )}
        </motion.div>
    );

    const renderActions = (row: any) => (
        <button
            onClick={() => navigate(`/requests/${row.requestLetterId}`)}
            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
            title="View Request"
        >
            <Eye size={14} />
        </button>
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
                    My Request Logs
                </h1>
                <p className="text-base text-slate-600">
                    Review the history of your submitted requests. Expand each row to see full details and track the progress or outcome of every entry.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="My Request Logs"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable={true}
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>
        </motion.div>
    );
}
