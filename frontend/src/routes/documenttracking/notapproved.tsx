import { useState } from "react";
import HigherUpRequest from "./higherup_request";
import { CheckCircle, XCircle } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";

export default function NotApprovedRequest({
    isDean,
    isPresident,
    userId
}: {
    userId: string,
    isDean: boolean;
    isPresident: boolean;
}) {
    const [toggleRefresh, setToggleRefresh] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [isDenyOpen, setIsDenyOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const completeFields = [
        {
            name: "remarks",
            label: "Approved Remarks",
            type: "textarea",
            rows: 3,
            placeholder: "Optional approved upon completion",
        },
    ];
    const denyFields = [
        {
            name: "remarks",
            label: "Reason for denial",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Please provide a reason for denying this request",
        },
    ];

    const renderActions = (row: any) => (
        <>
            <button
                onClick={() => {
                    setSelectedRow(row);
                    setIsCompleteOpen(true);
                }}
                className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                title="Approved"
            >
                <CheckCircle size={14} />
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
    );

    const handleFormSubmit = async (row: any, action: string, data: any) => {
        const idToast = showToast(`${action}ing request ${row.requestNo}...`, "loading");
        try {
            const action_type = action !== "deny" ? (isDean ? "dean_" : "president_") : ""; 
            const res = await RequestHandler.fetchData(
                "PUT",
                `request-letter/${action_type}action/${row.id}/${userId}/${action}`,
                data,
            );
            removeToast(idToast);
            if (res.success) {
                setIsCompleteOpen(false);
                setIsDenyOpen(false);
                showToast(`Request ${action} successfully.`, "success");
                setToggleRefresh(!toggleRefresh);
            } else {
                showToast(`Failed to ${action} request: ${res.message}`, "error");
            }
        } catch (error) {
            removeToast(idToast);
            showToast(`An error occurred: ${error}`, "error");
        }
    };

    return (
        <>
            <HigherUpRequest
                toggleRefresh={toggleRefresh}
                title="Not Approved"
                status="Not Approved"
                renderActions={renderActions}
                isDean={isDean}
                isPresident={isPresident}
            />
            {selectedRow && isCompleteOpen && (
                <DynamicForm
                    isModal={true}
                    isOpen={isCompleteOpen}
                    title={`Approved the request ${selectedRow.requestNo}`}
                    fields={completeFields}
                    initialData={{}}
                    onSubmit={(data: any) => handleFormSubmit(selectedRow, "approve", data)}
                    actionType="UPDATE"
                    onClose={() => setIsCompleteOpen(false)}
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
        </>
    );
}
