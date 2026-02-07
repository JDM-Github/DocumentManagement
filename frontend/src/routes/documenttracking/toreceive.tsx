import { useState } from "react";
import RequestStatus from "./requeststatus";
import { Check, X, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { confirmToast, removeToast, showToast } from "../../components/toast";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { DynamicForm } from "../../components/Form";

export const acceptFields = [
    {
        name: "remarks",
        label: "Remarks",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks upon acceptance",
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

export const massApprovedFields = [
    {
        name: "remarks",
        label: "Remarks (applies to all selected requests)",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Enter remarks for the approved requests",
    },
];

export const massDeniedFields = [
    {
        name: "remarks",
        label: "Reason for denial (applies to all selected requests)",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Enter reason for denying all selected requests",
    },
];

export default function ToReceive({
    departmentId,
    isHead,
    userId,
}: {
    departmentId: string;
    isHead: boolean;
    userId: string;
}) {
    const [toggleRefresh, setToggleRefresh] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isDenyOpen, setIsDenyOpen] = useState(false);
    const [isMassApprovedOpen, setIsMassApprovedOpen] = useState(false);
    const [isMassDeniedOpen, setIsMassDeniedOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const handleSelectionChange = (rows: any[]) => {
        setSelectedRows(rows);
    };

    const handleFormSubmit = async (row: any, action: "accept" | "deny", data: any) => {
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
                setIsAcceptOpen(false);
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

    const handleMassApproved = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to approve.", "error");
            return;
        }

        confirmToast(`Are you sure you want to approve ${selectedRows.length} selected request(s)?`,
            async () => {
                const idToast = showToast(`Approving ${selectedRows.length} request(s)...`, "loading");
                try {
                    const promises = selectedRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/accept`,
                            { remarks: data.remarks },
                            { Authorization: "Bearer DocumentTrackingSystem" }
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        setIsMassApprovedOpen(false);
                        showToast(`Successfully approved ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to approve any requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass approval cancelled.", "info");
            }
        );
    };

    const handleMassDenied = async (data: any) => {
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
                        setIsMassDeniedOpen(false);
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
                            setIsAcceptOpen(true);
                        }}
                        className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                        title="Accept / Receive"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsDenyOpen(true);
                        }}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Deny"
                    >
                        <X size={14} />
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
                    title="To Receive Requests"
                    departmentId={departmentId}
                    status="TO_RECEIVE"
                    renderActions={renderActions}
                />
                :
                <RequestStatus
                    toggleRefresh={toggleRefresh}
                    title="To Receive Requests"
                    departmentId={departmentId}
                    status="TO_RECEIVE"
                    renderActions={renderActions}
                    additionalButtons={[
                        {
                            label: `Mass Approve (${selectedRows.length})`,
                            icon: <CheckCircle size={14} />,
                            onClick: () => setIsMassApprovedOpen(true),
                            bg: "bg-emerald-500",
                            hover: "hover:bg-emerald-600",
                            text: "text-white",
                            disabled: selectedRows.length === 0
                        },
                        {
                            label: `Mass Deny (${selectedRows.length})`,
                            icon: <XCircle size={14} />,
                            onClick: () => setIsMassDeniedOpen(true),
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

            {selectedRow && isAcceptOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isAcceptOpen}
                    title={`Accept Request ${selectedRow.requestNo}`}
                    fields={acceptFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "accept", data)}
                    actionType="UPDATE"
                    onClose={() => setIsAcceptOpen(false)}
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

            {isMassApprovedOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassApprovedOpen}
                    title={`Mass Approve ${selectedRows.length} Request(s)`}
                    fields={massApprovedFields}
                    initialData={{}}
                    onSubmit={handleMassApproved}
                    actionType="UPDATE"
                    onClose={() => setIsMassApprovedOpen(false)}
                />
            )}

            {isMassDeniedOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassDeniedOpen}
                    title={`Mass Deny ${selectedRows.length} Request(s)`}
                    fields={massDeniedFields}
                    initialData={{}}
                    onSubmit={handleMassDenied}
                    actionType="UPDATE"
                    onClose={() => setIsMassDeniedOpen(false)}
                />
            )}
        </>
    );
}