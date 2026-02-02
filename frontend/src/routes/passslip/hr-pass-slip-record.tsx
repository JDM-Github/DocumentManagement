import { useEffect, useState } from "react";
import { Calendar, Check, Eye, X } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";

type PassSlipsHRProps = {
    isHead: boolean;
};

export default function PassSlipsHR({ isHead }: PassSlipsHRProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requesterName", label: "Employee", sortable: true },
        { key: "purpose", label: "Purpose", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
            key: "timeOut",
            label: "Time Out",
            sortable: true,
            icon: <Calendar size={14} />,
        },
    ];

    const fetchPassSlips = async () => {
        setLoading(true);
        const toastId = showToast("Fetching pass slips...", "loading");

        const res = await RequestHandler.fetchData(
            "GET",
            "pass-slip/get-all-department",
            {}
        );

        if (res.success && res.passslips) {
            const formatted = res.passslips.map((p: any) => ({
                id: p.id,
                requesterName: `${p.User?.firstName ?? ""} ${p.User?.lastName ?? ""}`,
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
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchPassSlips();
    }, []);

    const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
        const toastId = showToast("Updating status...", "loading");

        const res = await RequestHandler.fetchData(
            "PUT",
            `pass-slip/update-status/${id}`,
            { status }
        );

        removeToast(toastId);

        if (res.success) {
            showToast(`Pass slip ${status.toLowerCase()}.`, "success");
            fetchPassSlips();
        } else {
            showToast("Failed to update status.", "error");
        }
    };

    const renderExpandedRow = (row: any) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
                Pass Slip Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-slate-600">Employee:</span>
                    <span className="ml-2 font-medium">{row.requesterName}</span>
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

                <div className="sm:col-span-2">
                    <span className="text-slate-600">Reason:</span>
                    <p className="mt-1 text-slate-800 text-xs">
                        {row.reason}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderActions = (row: any) => {
        if (!isHead) {
            return (
                <button
                    onClick={() => navigate(`/pass-slip/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Pass Slip"
                >
                    <Eye size={14} />
                </button>
            );
        }

        if (row.status !== "PENDING") {
            return (
                <button
                    onClick={() => navigate(`/pass-slip/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Pass Slip"
                >
                    <Eye size={14} />
                </button>
            );
        }

        return (
            <>
                <button
                    onClick={() => updateStatus(row.id, "APPROVED")}
                    className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                    title="Approve"
                >
                    <Check size={14} />
                </button>

                <button
                    onClick={() => updateStatus(row.id, "REJECTED")}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                    title="Reject"
                >
                    <X size={14} />
                </button>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6 min-h-[600px]">
            <DataTable
                title="Pass Slips (HR)"
                columns={columns}
                data={data}
                loading={loading}
                expandable
                renderExpandedRow={renderExpandedRow}
                renderActions={renderActions}
            />
        </div>
    );
}
