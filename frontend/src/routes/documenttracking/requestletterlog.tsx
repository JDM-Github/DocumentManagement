import { useEffect, useState } from "react";
import { Calendar, Eye } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type RequestLogsTableProps = {
    title: string;
    departmentId: string;
    action: "REVIEWED" | "COMPLETED" | "DECLINED";
};

export default function RequestLogsTable({ title, departmentId, action }: RequestLogsTableProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [departmentsMap, setDepartmentsMap] = useState<Record<string, string>>({});

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requestNo", label: "Request No", sortable: true },
        { key: "action", label: "Action", sortable: true },
        { key: "requesterName", label: "Requester", sortable: true },
        { key: "actedByName", label: "Acted By", sortable: true },
        { key: "createdAt", label: "Date", sortable: true, icon: <Calendar size={14} /> },
    ];

    const fetchDepartments = async () => {
        const id = showToast("Fetching all departments...", "loading");
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

    const fetchLogs = async () => {
        setLoading(true);
        const id = showToast(`Fetching ${action.toLowerCase()} requests...`, "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            `request-letter/log/${action}/${departmentId}`,
            {},
        );

        if (res.success && res.logs) {
            const formatted = res.logs.map((log: any) => ({
                id: log.id,
                requestNo: log.requestNo,
                requestLetterId: log.requestLetterId,
                requesterName: log.requesterName,
                action: log.action,
                // departmentName: log.toDepartmentId ? departmentsMap[log.toDepartmentId] : "N/A",
                actedByName: log.actedByName || "System",
                remarks: log.remarks || "",
                createdAt: new Date(log.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast(`${action} requests fetched successfully.`, "success");
        } else {
            setData([]);
            showToast(`Failed to fetch ${action.toLowerCase()} requests.`, "error");
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
        <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Request Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-slate-600">Request No:</span>
                    <span className="ml-2 font-medium">{row.requestNo}</span>
                </div>
                <div>
                    <span className="text-slate-600">Requester:</span>
                    <span className="ml-2 font-medium">{row.requesterName}</span>
                </div>
                {/* <div>
                    <span className="text-slate-600">Department:</span>
                    <span className="ml-2 font-medium">{row.departmentName}</span>
                </div> */}
                <div>
                    <span className="text-slate-600">Acted By:</span>
                    <span className="ml-2 font-medium">{row.actedByName}</span>
                </div>
                {row.remarks && (
                    <div>
                        <span className="text-slate-600">Remarks:</span>
                        <span className="ml-2 font-medium">{row.remarks}</span>
                    </div>
                )}
            </div>
        </div>
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
                    {title}
                </h1>
                <p className="text-base text-slate-600">
                    View and manage the records in this table. Expand rows to see detailed information about each entry and perform actions as needed.
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
                    renderActions={renderActions}
                />
            </motion.div>
        </motion.div>
    );
}
