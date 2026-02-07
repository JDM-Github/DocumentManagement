import { useEffect, useState } from "react";
import { Calendar, Check, Clock, Download, Eye, FileText, X } from "lucide-react";
import DataTable from "../../components/Table";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type TravelOrdersHRProps = {
    isDean: boolean;
    isPresident: boolean;
};

export default function TravelOrdersHR({ isDean, isPresident }: TravelOrdersHRProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "id", label: "ID", sortable: true, width: "60px" },
        { key: "requesterName", label: "Employee", sortable: true },
        { key: "destination", label: "Destination", sortable: true },
        { key: "purposeType", label: "Purpose Type", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
            key: "dateOfDepartureFrom",
            label: "Date From",
            sortable: true,
            icon: <Calendar size={14} />,
        },
    ];

    const fetchTravelOrders = async () => {
        setLoading(true);
        const toastId = showToast("Fetching travel orders...", "loading");

        let res: any;
        if (isDean || isPresident) {
            res = await RequestHandler.fetchData(
                "GET",
                "travel-order/get-all-higherup",
                {}
            );
        } else {
            res = await RequestHandler.fetchData(
                "GET",
                "travel-order/get-all-department",
                {}
            );
        }

        if (res.success && res.travelOrders) {
            const formatted = res.travelOrders.map((t: any) => ({
                id: t.id,
                requesterName: `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`,
                transportationUsed: t.transportationUsed,
                destination: t.destination,
                purposeType: t.purposeType.replace("_", " "),
                purpose: t.purpose,
                status: t.status,
                forwardToHR: t.forwardToHR,
                dateOfDepartureFrom: new Date(t.dateOfDepartureFrom).toLocaleDateString("en-PH"),
                dateOfDepartureTo: new Date(t.dateOfDepartureTo).toLocaleDateString("en-PH"),
                timeOfDeparture: t.timeOfDeparture,
                timeOfArrival: t.timeOfArrival || "—",
                attachedFile: t.attachedFile,
                createdAt: new Date(t.createdAt).toLocaleString("en-PH"),
            }));

            setData(formatted);
            showToast("Travel orders loaded.", "success");
        } else {
            setData([]);
            showToast("Failed to fetch travel orders.", "error");
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchTravelOrders();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        const toastId = showToast("Updating status...", "loading");

        const res = await RequestHandler.fetchData(
            "PUT",
            `travel-order/update-status/${id}`,
            { status }
        );

        removeToast(toastId);

        if (res.success) {
            showToast(`Travel order ${status.toLowerCase()}.`, "success");
            fetchTravelOrders();
        } else {
            showToast("Failed to update status.", "error");
        }
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
                        <h4 className="text-base font-bold text-slate-800">Travel Order Details</h4>
                        <p className="text-sm text-slate-600">
                            {row.requesterName} • {row.purposeType}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${row.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                            : row.status.includes("APPROVED")
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
                            <span className="text-sm text-slate-600">Employee:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.requesterName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Purpose Type:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.purposeType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Transportation:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {row.transportationUsed.replace("_", " ")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Forwarded to HR:</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${row.forwardToHR
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-slate-100 text-slate-700 border border-slate-300"
                                }`}>
                                {row.forwardToHR ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Travel Schedule</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Date Range:</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {row.dateOfDepartureFrom} - {row.dateOfDepartureTo}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Departure Time:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.timeOfDeparture}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Arrival Time:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.timeOfArrival}</span>
                        </div>
                        {row.attachedFile && (
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                <span className="text-sm text-slate-600">Attached File:</span>
                                <a
                                    href={`/${row.attachedFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    <Download size={14} />
                                    View File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Destination</p>
                <p className="text-base text-blue-700">{row.destination}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Purpose of Travel</p>
                <p className="text-base text-blue-700">{row.purpose}</p>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => {
        if (!isDean && !isPresident) {
            return (
                <button
                    onClick={() => navigate(`/travel-order/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Travel Order"
                >
                    <Eye size={14} />
                </button>
            );
        }

        return (
            <>
                <button
                    onClick={() => navigate(`/travel-order/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Travel Order"
                >
                    <Eye size={14} />
                </button>
                {isDean && row.status === "PENDING" && (
                    <>
                        <button
                            onClick={() => updateStatus(row.id, "APPROVED BY DEAN")}
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
                )}
                {isPresident && row.status === "APPROVED BY DEAN" && (
                    <>
                        <button
                            onClick={() => updateStatus(row.id, "APPROVED BY PRESIDENT")}
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
                )}
            </>
        );
    };

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
                    Travel Orders Record
                </h1>
                <p className="text-base text-slate-600">
                    View and manage submitted travel orders.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title="Travel Orders Record"
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>
        </motion.div>

    );
}