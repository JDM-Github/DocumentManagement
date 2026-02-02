import { useEffect, useState } from "react";
import { Calendar, Edit, Eye, Trash2 } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { deleteRequestFields, editRequestFields } from "../../lib/myRequestField";
import { useNavigate } from "react-router-dom";

type MyRequestsProps = {
    title: string;
    userId: string; 
    status?: string;
};

export default function MyRequests({ title, userId, status }: MyRequestsProps) {
    const navigate = useNavigate();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [departmentsMap, setDepartmentsMap] = useState<Record<string, string>>({});

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requestNo", label: "Request No", sortable: true },
        { key: "requesterName", label: "Requester", sortable: true },
        { key: "currentDepartmentName", label: "To Department", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "createdAt", label: "Date", sortable: true, icon: <Calendar size={14} /> },
    ];

    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleEditSubmit = async (data: any) => {
        await RequestHandler.fetchData(
            "PUT",
            `request-letter/update/${selectedRow.id}`,
            data,
        );
        setIsEditOpen(false);
        fetchRequests();
    };

    const handleDeleteSubmit = async (data: any) => {
        await RequestHandler.fetchData(
            "DELETE",
            `request-letter/delete/${selectedRow.id}`,
            data,
        );
        setIsDeleteOpen(false);
        fetchRequests();
    };

    const fetchDepartments = async () => {
        const id = showToast("Fetching departments...", "loading");
        const res = await RequestHandler.fetchData(
            "GET",
            "department/get-all",
            {},
        );

        if (res.success && res.departments) {
            const map: Record<string, string> = {};
            res.departments.forEach((d: any) => (map[d.id] = d.name));
            setDepartmentsMap(map);
        } else {
            showToast("Failed to fetch departments.", "error");
        }
        removeToast(id);
    };

    const fetchRequests = async () => {
        setLoading(true);
        const id = showToast("Fetching your requests...", "loading");

        let link = `request-letter/user/${userId}`;
        if (status) link += `/${status}`;

        const res = await RequestHandler.fetchData(
            "GET",
            link,
            {},
        );

        if (res.success && res.requestLetters) {
            console.log(res.requestLetters);
            const formatted = res.requestLetters.map((r: any) => ({
                id: r.id,
                requestNo: r.requestNo,
                purpose: r.purpose,
                requesterName: r.requesterName,
                currentDepartmentName: departmentsMap[r.currentDepartmentId] || r.currentDepartmentId,
                status: r.status,
                createdAt: new Date(r.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast("Your requests fetched successfully.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch your requests.", "error");
            console.error("Failed to fetch requests", res);
        }

        setLoading(false);
        removeToast(id);
    };
    
    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (Object.keys(departmentsMap).length) fetchRequests();
    }, [departmentsMap]);

    const renderExpandedRow = (row: any) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Request Details </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-slate-600">Request No:</span>
                    <span className="ml-2 font-medium">{row.requestNo}</span>
                </div>
                <div>
                    <span className="text-slate-600">Requester:</span>
                    <span className="ml-2 font-medium">{row.requesterName}</span>
                </div>
                <div>
                    <span className="text-slate-600">To Department:</span>
                    <span className="ml-2 font-medium">{row.currentDepartmentName}</span>
                </div>
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
                <div>
                    <span className="text-slate-600">Purpose:</span>
                    <span className="ml-2 font-medium">{row.purpose}</span>
                </div>
            </div>
        </div>
    );

    const renderActions = (row: any) => (
        <>
            <button
                onClick={() => navigate(`/requests/${row.id}`)}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                title="View Request"
            >
                <Eye size={14} />
            </button>
            {row.status === "TO_RECEIVE" && (
                <>
                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsEditOpen(true);
                        }}
                        className="p-1.5 hover:bg-amber-100 text-amber-600 rounded"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsDeleteOpen(true);
                        }}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </>
    );

    return (
        <div className="p-4 sm:p-6 min-h-[600px]">
            <DataTable
                title={"My Request | " + title}
                columns={columns}
                data={data}
                loading={loading}
                expandable={true}
                renderExpandedRow={renderExpandedRow}
                renderActions={renderActions}
            />

            {isEditOpen && selectedRow && (
                <DynamicForm
                    isModal={true}
                    isOpen={isEditOpen}
                    title="Edit Request"
                    fields={editRequestFields}
                    initialData={selectedRow}
                    onSubmit={handleEditSubmit}
                    actionType="UPDATE"
                    onClose={() => setIsEditOpen(false)}
                />
            )}

            {isDeleteOpen && selectedRow && (
                <DynamicForm
                    isModal={true}
                    isOpen={isDeleteOpen}
                    title="Delete Request"
                    fields={deleteRequestFields}
                    onSubmit={handleDeleteSubmit}
                    actionType="DELETE"
                    onClose={() => setIsDeleteOpen(false)}
                />
            )}

        </div>
    );
}
