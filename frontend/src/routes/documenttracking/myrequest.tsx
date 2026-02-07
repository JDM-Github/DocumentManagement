import { useEffect, useState } from "react";
import { Calendar, Edit, Eye, FileText, Trash2, User } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { DynamicForm } from "../../components/Form";
import { deleteRequestFields } from "../../lib/myRequestField";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    const [editDepartmentOptions, setEditDepartmentOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requestNo", label: "Request No", sortable: true },
        { key: "requesterName", label: "Requester", sortable: true },
        { key: "currentDepartmentName", label: "To Department", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "createdAt", label: "Date", sortable: true, icon: <Calendar size={14} /> },
    ];

    const editRequestFields = [
        {
            name: "currentDepartmentId",
            label: "Target Department",
            type: "select",
            required: true,
            icon: <User size={14} />,
            options: editDepartmentOptions,
        },
        {
            name: "purpose",
            label: "Purpose / Description",
            type: "textarea",
            required: true,
            icon: <FileText size={14} />,
            rows: 4,
        },
        {
            name: "requestUploadedDocuments",
            label: "Update Attachments",
            type: "file",
            accept: ".pdf,.doc,.docx,.jpg,.png",
            multiple: true,
        },
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

    const fetchDepartmentsNotSameDepartment = async () => {
        const toastId = showToast("Fetching departments...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "department/get-all",
                {}
            );

            if (res.success && res.departments) {
                const options = res.departments.map((d: any) => ({
                    value: String(d.id),
                    label: d.name,
                }));
                setEditDepartmentOptions(options);
            } else {
                showToast("Failed to fetch departments.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error fetching departments.", "error");
        } finally {
            removeToast(toastId);
        }
    };

    const fetchDepartments = async () => {
        const id = showToast("Fetching departments...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "department/get-all",
            {}
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
        if (Object.keys(departmentsMap).length) {
            console.log(departmentsMap);
            fetchRequests();
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
                            <span className="text-sm text-slate-600">To Department:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.currentDepartmentName}</span>
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

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Purpose</p>
                <p className="text-base text-blue-700">{row.purpose}</p>
            </div>
        </motion.div>
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
                            fetchDepartmentsNotSameDepartment();
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
                    My Request | {title}
                </h1>
                <p className="text-base text-slate-600">
                    View, edit, or delete your requests. Expand a row to see full details and perform the necessary actions for each entry.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
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
            </motion.div>
        </motion.div>
    );
}
