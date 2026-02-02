import { useState } from "react";
import { CheckCircle, ArrowRight, XCircle, RefreshCw, Package, Truck } from "lucide-react";
import RequestStatus from "./requeststatus";
import { confirmToast, removeToast, showToast } from "../../components/toast";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { DynamicForm } from "../../components/Form";

export const completeFields = [
    {
        name: "remarks",
        label: "Completion Remarks",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks upon completion",
    },
];

export const forwardFields = [
    {
        name: "currentDepartmentId",
        label: "Target Department",
        type: "select",
        required: true,
        icon: <ArrowRight size={14} />,
        options: [
            { value: "1", label: "Records Office" },
            { value: "2", label: "Registrar" },
            { value: "3", label: "Finance" },
        ],
    },
    {
        name: "remarks",
        label: "Remarks",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks for forwarding",
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

export const massForwardFields = [
    {
        name: "currentDepartmentId",
        label: "Target Department (same for all requests)",
        type: "select",
        required: true,
        icon: <ArrowRight size={14} />,
        options: [
            { value: "1", label: "Records Office" },
            { value: "2", label: "Registrar" },
            { value: "3", label: "Finance" },
        ],
    },
    {
        name: "remarks",
        label: "Remarks (applies to all selected requests)",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks for forwarding all requests",
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
    userId
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

    const handleSelectionChange = (rows: any[]) => {
        setSelectedRows(rows);
    };

    const handleFormSubmit = async (row: any, action: "complete" | "forward" | "deny", data: any) => {
        const idToast = showToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ing request ${row.requestNo}...`, "loading");
        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `request-letter/action/${row.id}/${userId}/${action}`,
                data,
                { Authorization: "Bearer DocumentTrackingSystem" }
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
            showToast("Please select at least one request to complete.", "error");
            return;
        }

        confirmToast(`Are you sure you want to complete ${selectedRows.length} selected request(s)?`,
            async () => {
                const idToast = showToast(`Completing ${selectedRows.length} request(s)...`, "loading");
                try {
                    const promises = selectedRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/complete`,
                            { remarks: data.remarks },
                            { Authorization: "Bearer DocumentTrackingSystem" }
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        showToast(`Successfully completed ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to complete any requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass completion cancelled.", "info");
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
                            { Authorization: "Bearer DocumentTrackingSystem" }
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
                            { Authorization: "Bearer DocumentTrackingSystem" }
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
                        title="Complete Request"
                    >
                        <CheckCircle size={14} />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsForwardOpen(true);
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
            <RequestStatus
                toggleRefresh={toggleRefresh}
                title="To Release Requests"
                departmentId={departmentId}
                status="TO_RELEASE"
                renderActions={renderActions}
                additionalButtons={[
                    {
                        label: `Mass Complete (${selectedRows.length})`,
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

            {selectedRow && isCompleteOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isCompleteOpen}
                    title={`Complete Request ${selectedRow.requestNo}`}
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
                    title={`Mass Complete ${selectedRows.length} Request(s)`}
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