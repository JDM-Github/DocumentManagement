import { useEffect, useState } from "react";
import { Eye, Edit } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";

export default function MyPassSlips() {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const columns = [
        { key: "id", label: "ID" },
        { key: "purpose", label: "Purpose" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        { key: "timeOut", label: "Time Out" },
        { key: "timeIn", label: "Time In" },
        { key: "createdAt", label: "Created At" },
    ];

    const editPassSlipFields = [
        {
            name: "purpose",
            label: "Purpose",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Enter purpose of pass slip...",
        },
        {
            name: "reason",
            label: "Reason",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Enter reason for pass slip...",
        },
        {
            name: "timeOut",
            label: "Time Out",
            type: "datetime-local",
            required: true,
        },
        {
            name: "timeIn",
            label: "Time In",
            type: "datetime-local",
        },
        {
            name: "forwardToHR",
            label: "Forward to HR",
            type: "checkbox",
        },
    ];

    const fetchPassSlips = async () => {
        setLoading(true);
        const toastId = showToast("Fetching your pass slips...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "pass-slip/get-all",
            {}
        );

        if (res.success && res.passslips) {
            const formatted = res.passslips.map((p: any) => ({
                id: p.id,
                purpose: p.purpose,
                reason: p.reason,
                status: p.status,
                forwardToHR: p.forwardToHR,
                timeOut: new Date(p.timeOut).toLocaleString("en-PH"),
                timeIn: p.timeIn
                    ? new Date(p.timeIn).toLocaleString("en-PH")
                    : "—",
                createdAt: new Date(p.createdAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast("Pass slips loaded.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch pass slips.", "error");
            console.error(res);
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchPassSlips();
    }, []);

    const handleEditSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Updating pass slip...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `pass-slip/update/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Pass slip updated successfully.", "success");
                setIsEditOpen(false);
                fetchPassSlips();
            } else {
                showToast(res.message || "Failed to update pass slip.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const renderExpandedRow = (row: any) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
                Pass Slip Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-slate-600">Purpose:</span>
                    <span className="ml-2 font-medium">{row.purpose}</span>
                </div>

                <div>
                    <span className="text-slate-600">Status:</span>
                    <span
                        className={`ml-2 font-medium ${row.status === "PENDING"
                                ? "text-yellow-600"
                                : row.status === "APPROVED"
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                    >
                        {row.status}
                    </span>
                </div>

                <div>
                    <span className="text-slate-600">Forwarded to HR:</span>
                    <span className="ml-2 font-medium">
                        {row.forwardToHR ? "Yes" : "No"}
                    </span>
                </div>

                <div>
                    <span className="text-slate-600">Created At:</span>
                    <span className="ml-2 font-medium">{row.createdAt}</span>
                </div>

                <div className="sm:col-span-2">
                    <span className="text-slate-600">Reason:</span>
                    <p className="mt-1 text-slate-800 text-xs">{row.reason}</p>
                </div>
            </div>
        </div>
    );

    const renderActions = (row: any) => (
        <div className="flex gap-1">
            <button
                onClick={() => navigate(`/pass-slip/${row.id}`)}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                title="View Pass Slip"
            >
                <Eye size={14} />
            </button>

            {row.status === "PENDING" && (
                <button
                    onClick={() => {
                        const formattedSelectedRow = {
                            ...row,
                            timeOut: row.timeOut && row.timeOut !== "—"
                                ? new Date(row.timeOut)
                                : null,
                            timeIn: row.timeIn && row.timeIn !== "—"
                                ? new Date(row.timeIn)
                                : null,
                        };
                        setSelectedRow(formattedSelectedRow);
                        setIsEditOpen(true);
                    }}
                    className="p-1.5 hover:bg-amber-100 text-amber-600 rounded"
                    title="Edit Pass Slip"
                >
                    <Edit size={14} />
                </button>
            )}
        </div>
    );

    return (
        <div className="p-4 sm:p-6 min-h-[600px]">
            <DataTable
                title="My Pass Slips"
                columns={columns}
                data={data}
                loading={loading}
                expandable
                renderExpandedRow={renderExpandedRow}
                renderActions={renderActions}
            />

            {isEditOpen && selectedRow && (
                <DynamicForm
                    isModal={true}
                    isOpen={isEditOpen}
                    title="Edit Pass Slip"
                    fields={editPassSlipFields}
                    initialData={selectedRow}
                    onSubmit={handleEditSubmit}
                    actionType="UPDATE"
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </div>
    );
}
