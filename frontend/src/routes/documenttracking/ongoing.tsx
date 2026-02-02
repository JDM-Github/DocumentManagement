import {
    PenLine,
    ArrowRight,
    PackageCheck,
    XCircle,
    User,
    XCircle as XCircleIcon,
    PenTool,
    RefreshCw,
} from "lucide-react";
import RequestStatus from "./requeststatus";
import { useState } from "react";
import { confirmToast, removeToast, showToast } from "../../components/toast";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { DynamicForm } from "../../components/Form";

export const signFields = [
    {
        name: "remarks",
        label: "Remarks",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Optional remarks",
    },
];

export const forwardFields = [
    {
        name: "currentDepartmentId",
        label: "Target Department",
        type: "select",
        required: true,
        icon: <User size={14} />,
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
        placeholder: "Optional remarks",
    },
];

export const releaseFields = [
    {
        name: "remarks",
        label: "Remarks",
        type: "textarea",
        rows: 3,
        placeholder: "Optional remarks",
    },
];

export const denyFields = [
    {
        name: "remarks",
        label: "Reason for denial",
        type: "textarea",
        required: true,
        rows: 3,
    },
];

export const massSignFields = [
    {
        name: "remarks",
        label: "Remarks (applies to all selected requests)",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Enter remarks for signing all selected requests",
    },
];

export const massForwardFields = [
    {
        name: "currentDepartmentId",
        label: "Target Department",
        type: "select",
        required: true,
        icon: <User size={14} />,
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

export default function OngoingRequest({
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
    const [isSignFieldOpen, setIsSignFieldOpen] = useState(false);
    const [isForwardOpen, setIsForwardOpen] = useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);
    const [isDenyOpen, setIsDenyOpen] = useState(false);
    const [isMassSignOpen, setIsMassSignOpen] = useState(false);
    const [isMassForwardOpen, setIsMassForwardOpen] = useState(false);
    const [isMassDenyOpen, setIsMassDenyOpen] = useState(false);

    const handleSelectionChange = (rows: any[]) => {
        setSelectedRows(rows);
    };

    const handleFormSubmit = async (row: any, action: "sign" | "forward" | "release" | "deny", data: any) => {
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
                setIsForwardOpen(false);
                setIsReleaseOpen(false);
                setIsDenyOpen(false);
                setIsSignFieldOpen(false);
                showToast(`Request ${row.requestNo} ${action}/ed successfully.`, "success");
                setToggleRefresh(!toggleRefresh);
            } else {
                showToast(`Failed to ${action} request: ${res.message}`, "error");
            }
        } catch (error) {
            removeToast(idToast);
            showToast(`An error occurred: ${error}`, "error");
        }
    };

    const handleMassSign = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to sign.", "error");
            return;
        }

        const signableRows = selectedRows.filter(row => !row.allSignature.includes(Number(userId)));
        if (signableRows.length === 0) {
            showToast("You have already signed all selected requests.", "error");
            return;
        }

        confirmToast(`Are you sure you want to sign ${signableRows.length} selected request(s)?`,
            async () => {
                const idToast = showToast(`Signing ${signableRows.length} request(s)...`, "loading");
                try {
                    const promises = signableRows.map(row =>
                        RequestHandler.fetchData(
                            "PUT",
                            `request-letter/action/${row.id}/${userId}/sign`,
                            { remarks: data.remarks },
                            { Authorization: "Bearer DocumentTrackingSystem" }
                        )
                    );

                    const results = await Promise.allSettled(promises);
                    removeToast(idToast);

                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    const failed = results.length - successful;

                    if (successful > 0) {
                        showToast(`Successfully signed ${successful} request(s)${failed > 0 ? `, ${failed} failed` : ''}.`, "success");
                        setToggleRefresh(!toggleRefresh);
                    } else {
                        showToast(`Failed to sign any requests.`, "error");
                    }
                } catch (error) {
                    removeToast(idToast);
                    showToast(`An error occurred: ${error}`, "error");
                }
            },
            () => {
                showToast("Mass signing cancelled.", "info");
            }
        );
    };

    const handleMassForward = async (data: any) => {
        if (selectedRows.length === 0) {
            showToast("Please select at least one request to forward.", "error");
            return;
        }

        const forwardableRows = selectedRows.filter(row => row.allSignature.includes(Number(userId)));
        if (forwardableRows.length === 0) {
            showToast("You need to sign the requests before forwarding them.", "error");
            return;
        }

        confirmToast(`Are you sure you want to forward ${forwardableRows.length} selected request(s) to the same department?`,
            async () => {
                const idToast = showToast(`Forwarding ${forwardableRows.length} request(s)...`, "loading");
                try {
                    const promises = forwardableRows.map(row =>
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
                    {!row.allSignature.includes(Number(userId)) && (
                        <button
                            onClick={() => {
                                setSelectedRow(row);
                                setIsSignFieldOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded"
                            title="Sign / Approve"
                        >
                            <PenLine size={14} />
                        </button>
                    )}
                    {row.allSignature.includes(Number(userId)) && (
                        <>
                            <button
                                onClick={() => {
                                    setSelectedRow(row);
                                    setIsForwardOpen(true);
                                }}
                                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                                title="Forward to another department"
                            >
                                <ArrowRight size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRow(row);
                                    setIsReleaseOpen(true);
                                }}
                                className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                                title="Release"
                            >
                                <PackageCheck size={14} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            setSelectedRow(row);
                            setIsDenyOpen(true);
                        }}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Deny"
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
                title="Ongoing Requests"
                departmentId={departmentId}
                status="ONGOING"
                renderActions={renderActions}
                additionalButtons={[
                    {
                        label: `Mass Sign (${selectedRows.length})`,
                        icon: <PenTool size={14} />,
                        onClick: () => setIsMassSignOpen(true),
                        bg: "bg-indigo-500",
                        hover: "hover:bg-indigo-600",
                        text: "text-white",
                        disabled: selectedRows.length === 0
                    },
                    {
                        label: `Mass Forward (${selectedRows.length})`,
                        icon: <ArrowRight size={14} />,
                        onClick: () => setIsMassForwardOpen(true),
                        bg: "bg-blue-500",
                        hover: "hover:bg-blue-600",
                        text: "text-white",
                        disabled: selectedRows.length === 0
                    },
                    {
                        label: `Mass Deny (${selectedRows.length})`,
                        icon: <XCircleIcon size={14} />,
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

            {selectedRow && isSignFieldOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isSignFieldOpen}
                    title={`Sign Request ${selectedRow.requestNo}`}
                    fields={signFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "sign", data)}
                    actionType="UPDATE"
                    onClose={() => setIsSignFieldOpen(false)}
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

            {selectedRow && isReleaseOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isReleaseOpen}
                    title={`Release Request ${selectedRow.requestNo}`}
                    fields={releaseFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "release", data)}
                    actionType="UPDATE"
                    onClose={() => setIsReleaseOpen(false)}
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

            {isMassSignOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isMassSignOpen}
                    title={`Mass Sign ${selectedRows.length} Request(s)`}
                    fields={massSignFields}
                    initialData={{}}
                    onSubmit={handleMassSign}
                    actionType="UPDATE"
                    onClose={() => setIsMassSignOpen(false)}
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