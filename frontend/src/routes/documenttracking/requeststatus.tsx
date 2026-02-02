import { JSX, useEffect, useState } from "react";
import { Calendar, Eye } from "lucide-react";
import DataTable, { AdditionalButton } from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";

export default function RequestStatus({
    title,
    departmentId,
    status,
    renderActions,
    toggleRefresh,
    additionalButtons = [],
    handleSelectionChange
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
        // { key: "currentDepartmentName", label: "Department", sortable: true },
        { key: "status", label: "Status", sortable: true },
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
                // currentDepartmentName: departmentsMap[r.currentDepartmentId] || r.currentDepartmentId,
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
                    <span className="text-slate-600">From Department:</span>
                    <span className="ml-2 font-medium">{row.currentDepartmentName}</span>
                </div> */}
                <div>
                    <span className="text-slate-600">Status:</span>
                    <span
                        className={`ml-2 font-medium ${row.status === "ONGOING" || row.status === "TO_RECEIVE"
                            ? "text-yellow-600"
                            : row.status === "COMPLETED"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {row.status}
                    </span>
                </div>
            </div>
        </div>
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
        <div className="p-4 sm:p-6 min-h-[600px]">
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
        </div>
    );
}
