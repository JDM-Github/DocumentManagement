import { useState } from "react";
import { CheckCircle, ArrowRight, XCircle, RefreshCw, Package, Truck } from "lucide-react";
import RequestStatus from "./requeststatus";
import { confirmToast, removeToast, showToast } from "../../components/toast";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { DynamicForm } from "../../components/Form";

export const completeFields = [
    {
        name: "remarks",
        label: "Send to dean Remarks",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks upon sending",
    },
];

export const denyFields = [
    {
        name: "remarks",
        label: "Reason for denial",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Please provide a reason for denying this request",
    },
];

export const massCompleteFields = [
    {
        name: "remarks",
        label: "Completion Remarks (applies to all selected requests)",
        type: "textarea",
        rows: 3,
        placeholder: "Enter remarks for completing all selected requests",
    },
];

export const massDenyFields = [
    {
        name: "remarks",
        label: "Reason for denial (applies to all selected requests)",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Enter reason for denying all selected requests",
    },
];

export default function ToRelease({
    departmentId,
    isHead = false,
    userId,
}: {
    departmentId: string;
    isHead?: boolean;
    userId: string;
}) {
    const [toggleRefresh, setToggleRefresh] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [isForwardOpen, setIsForwardOpen] = useState(false);
    const [isDenyOpen, setIsDenyOpen] = useState(false);
    const [isMassCompleteOpen, setIsMassCompleteOpen] = useState(false);
    const [isMassForwardOpen, setIsMassForwardOpen] = useState(false);
    const [isMassDenyOpen, setIsMassDenyOpen] = useState(false);
    const [forwardDepartmentOptions, setforwardDepartmentOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const handleSelectionChange = (rows: any[]) => {
        setSelectedRows(rows);
    };

    const fetchDepartmentsNotSameDepartment = async () => {
        const toastId = showToast("Fetching departments...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "department/get-all-except-user-department",
                {}
            );

            if (res.success && res.departments) {
                const options = res.departments.map((d: any) => ({
                    value: String(d.id),
                    label: d.name,
                }));
                setforwardDepartmentOptions(options);
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

    const forwardFields = [
        {
            name: "currentDepartmentId",
            label: "Target Department",
            type: "select",
            required: true,
            icon: <ArrowRight size={14} />,
            options: forwardDepartmentOptions
        },
        {
            name: "remarks",
            label: "Remarks",
            type: "textarea",
            rows: 3,
            placeholder: "Optional remarks for forwarding",
        },
    ];
    const massForwardFields = [
        {
            name: "currentDepartmentId",
            label: "Target Department (same for all requests)",
            type: "select",
            required: true,
            icon: <ArrowRight size={14} />,
            options: forwardDepartmentOptions
        },
        {
            name: "remarks",
            label: "Remarks (applies to all selected requests)",
            type: "textarea",
            rows: 3,
            placeholder: "Optional remarks for forwarding all requests",
        },
    ];

    const handleFormSubmit = async (row: any, action: "complete" | "forward" | "deny", data: any) => {
        const idToast = showToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ing request ${row.requestNo}...`, "loading");
        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `request-letter/action/${row.id}/${userId}/${action}`,
                data,
            );
            removeToast(idToast);
            if (res.success) {
                setIsCompleteOpen(false);
                setIsForwardOpen(false);
                setIsDenyOpen(false);
                showToast(`Request ${row.requestNo} ${action}ed successfully.`, "success");
                setToggleRefresh(!toggleRefresh);
            } else {
                showToast(`Failed to ${action} request: ${res.message}`, "error");
            }
        } catch (error) {
            removeToast(idToast);
            showToast(`An error occurred: ${error}`, "error");
        }
    };

    const handleMassComplete = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to send to dean.", "error");
            return;
        }

        confirmToast(`Are you sure you want to send to dean ${selectedRows.length} selected request(s)?`,
            async () => {
                const idToast = showToast(`Sending to dean ${selectedRows.length} request(s)...`, "loading");
                try {
                    const promises = selectedRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/complete`,
                            { remarks: data.remarks },
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        showToast(`Successfully send to dean ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to send to dean the requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass send to dean cancelled.", "info");
            }
        );
    };

    const handleMassForward = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to forward.", "error");
            return;
        }

        confirmToast(`Are you sure you want to forward ${selectedRows.length} selected request(s) to the same department?`,
            async () => {
                const idToast = showToast(`Forwarding ${selectedRows.length} request(s)...`, "loading");
                try {
                    const promises = selectedRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/forward`,
                            data,
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        showToast(`Successfully forwarded ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to forward any requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass forwarding cancelled.", "info");
            }
        );
    };

    const handleMassDeny = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to deny.", "error");
            return;
        }

        confirmToast(`Are you sure you want to deny ${selectedRows.length} selected request(s)?`,
            async () => {
                const idToast = showToast(`Denying ${selectedRows.length} request(s)...`, "loading");
                try {
                    const promises = selectedRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/deny`,
                            { remarks: data.remarks },
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        showToast(`Successfully denied ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to deny any requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass denial cancelled.", "info");
            }
        );
    };

    const renderActions = (row: any) => (
        <>
            {isHead && (
                <>
                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsCompleteOpen(true);
                        }}
                        className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                        title="Send To Dean"
                    >
                        <CheckCircle size={14} />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsForwardOpen(true);
                            fetchDepartmentsNotSameDepartment();
                        }}
                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                        title="Forward Request"
                    >
                        <ArrowRight size={14} />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsDenyOpen(true);
                        }}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Deny Request"
                    >
                        <XCircle size={14} />
                    </button>
                </>
            )}
        </>
    );

    return (
        <>
            {!isHead ?
                <RequestStatus
                    toggleRefresh={toggleRefresh}
                    title="To Release Requests"
                    departmentId={departmentId}
                    status="TO_RELEASE"
                    renderActions={renderActions}
                />
                :
                <RequestStatus
                    toggleRefresh={toggleRefresh}
                    title="To Release Requests"
                    departmentId={departmentId}
                    status="TO_RELEASE"
                    renderActions={renderActions}
                    additionalButtons={[
                        {
                            label: `Mass Send To Dean (${selectedRows.length})`,
                            icon: <Package size={14} />,
                            onClick: () => setIsMassCompleteOpen(true),
                            bg: "bg-emerald-500",
                            hover: "hover:bg-emerald-600",
                            text: "text-white",
                            disabled: selectedRows.length === 0
                        },
                        {
                            label: `Mass Forward (${selectedRows.length})`,
                            icon: <Truck size={14} />,
                            onClick: () => setIsMassForwardOpen(true),
                            bg: "bg-blue-500",
                            hover: "hover:bg-blue-600",
                            text: "text-white",
                            disabled: selectedRows.length === 0
                        },
                        {
                            label: `Mass Deny (${selectedRows.length})`,
                            icon: <XCircle size={14} />,
                            onClick: () => setIsMassDenyOpen(true),
                            bg: "bg-rose-500",
                            hover: "hover:bg-rose-600",
                            text: "text-white",
                            disabled: selectedRows.length === 0
                        },
                        {
                            label: "Refresh",
                            icon: <RefreshCw size={14} />,
                            onClick: () => setToggleRefresh(!toggleRefresh),
                            bg: "bg-slate-200",
                            hover: "hover:bg-slate-300",
                            text: "text-slate-700"
                        },
                    ]}
                    handleSelectionChange={handleSelectionChange}
                />
            }

            {selectedRow && isCompleteOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isCompleteOpen}
                    title={`Send to dean the request ${selectedRow.requestNo}`}
                    fields={completeFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "complete", data)}
                    actionType="UPDATE"
                    onClose={() => setIsCompleteOpen(false)}
                />
            )}

            {selectedRow && isForwardOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isForwardOpen}
                    title={`Forward Request ${selectedRow.requestNo}`}
                    fields={forwardFields}
                    initialData={{ currentDepartmentId: selectedRow.currentDepartmentId }}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "forward", data)}
                    actionType="UPDATE"
                    onClose={() => setIsForwardOpen(false)}
                />
            )}

            {selectedRow && isDenyOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isDenyOpen}
                    title={`Deny Request ${selectedRow.requestNo}`}
                    fields={denyFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "deny", data)}
                    actionType="UPDATE"
                    onClose={() => setIsDenyOpen(false)}
                />
            )}

            {isMassCompleteOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassCompleteOpen}
                    title={`Mass Send To Dean ${selectedRows.length} Request(s)`}
                    fields={massCompleteFields}
                    initialData={{}}
                    onSubmit={handleMassComplete}
                    actionType="UPDATE"
                    onClose={() => setIsMassCompleteOpen(false)}
                />
            )}

            {isMassForwardOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassForwardOpen}
                    title={`Mass Forward ${selectedRows.length} Request(s)`}
                    fields={massForwardFields}
                    initialData={{}}
                    onSubmit={handleMassForward}
                    actionType="UPDATE"
                    onClose={() => setIsMassForwardOpen(false)}
                />
            )}

            {isMassDenyOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassDenyOpen}
                    title={`Mass Deny ${selectedRows.length} Request(s)`}
                    fields={massDenyFields}
                    initialData={{}}
                    onSubmit={handleMassDeny}
                    actionType="UPDATE"
                    onClose={() => setIsMassDenyOpen(false)}
                />
            )}
        </>
    );
}