import { motion } from "framer-motion";
import { DynamicForm } from "../../components/Form";
import { CheckCircle } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function OtherInformation() {

    const otherInfoFields = [
        /* =========================
           QUESTION 1 – RELATIONSHIP
        ========================== */
        { name: "q1_thirdDegree", label: "Related within third degree?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Relationship to Authority" },
        { name: "q1_thirdDegreeDetails", label: "Details (if YES)", type: "textarea", section: "Relationship to Authority" },

        { name: "q1_fourthDegree", label: "Related within fourth degree (LGU)?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Relationship to Authority" },
        { name: "q1_fourthDegreeDetails", label: "Details (if YES)", type: "textarea", section: "Relationship to Authority" },

        /* =========================
           QUESTION 2 – OFFENSES
        ========================== */
        { name: "q2_adminOffense", label: "Found guilty of administrative offense?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Administrative / Criminal Records" },
        { name: "q2_adminDetails", label: "Details (if YES)", type: "textarea", section: "Administrative / Criminal Records" },

        { name: "q2_criminalCharge", label: "Criminally charged before any court?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Administrative / Criminal Records" },
        { name: "q2_criminalDetails", label: "Details (if YES)", type: "textarea", section: "Administrative / Criminal Records" },
        { name: "q2_dateFiled", label: "Date Filed", type: "date", section: "Administrative / Criminal Records" },
        { name: "q2_caseStatus", label: "Status of Case", type: "text", section: "Administrative / Criminal Records" },

        /* =========================
           QUESTION 3 – CONVICTION
        ========================== */
        { name: "q3_convicted", label: "Ever convicted of a crime?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Convictions" },
        { name: "q3_details", label: "Details (if YES)", type: "textarea", section: "Convictions" },

        /* =========================
           QUESTION 4 – SEPARATION
        ========================== */
        { name: "q4_separated", label: "Separated from service?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Service Record" },
        { name: "q4_details", label: "Details (if YES)", type: "textarea", section: "Service Record" },

        /* =========================
           QUESTION 5 – ELECTION
        ========================== */
        { name: "q5_candidate", label: "Candidate in last election?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Election History" },
        { name: "q5_candidateDetails", label: "Details (if YES)", type: "textarea", section: "Election History" },

        { name: "q5_resigned", label: "Resigned to campaign?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Election History" },
        { name: "q5_resignedDetails", label: "Details (if YES)", type: "textarea", section: "Election History" },

        /* =========================
           QUESTION 6 – IMMIGRATION
        ========================== */
        { name: "q6_immigrant", label: "Immigrant or permanent resident of another country?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Immigration Status" },
        { name: "q6_country", label: "Country (if YES)", type: "text", section: "Immigration Status" },

        /* =========================
           QUESTION 7 – SPECIAL STATUS
        ========================== */
        { name: "q7_indigenous", label: "Member of Indigenous Group?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Special Status" },
        { name: "q7_indigenousDetails", label: "Specify (if YES)", type: "text", section: "Special Status" },

        { name: "q7_pwd", label: "Person with Disability?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Special Status" },
        { name: "q7_pwdId", label: "PWD ID No.", type: "text", section: "Special Status" },

        { name: "q7_soloParent", label: "Solo Parent?", type: "radio", options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }], section: "Special Status" },
        { name: "q7_soloParentId", label: "Solo Parent ID No.", type: "text", section: "Special Status" },

        /* =========================
           GOVERNMENT ID
        ========================== */
        { name: "govIdType", label: "Government Issued ID", type: "text", section: "Government Issued ID" },
        { name: "govIdNumber", label: "ID Number", type: "text", section: "Government Issued ID" },
        { name: "govIdDate", label: "Date of Issuance", type: "date", section: "Government Issued ID" },
        { name: "govIdPlace", label: "Place of Issuance", type: "text", section: "Government Issued ID" },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Saving other information...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "other-information/create",
                { details: data }
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Other information saved successfully!", "success");
            } else {
                showToast(res.message || "Failed to save information.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
            >
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Other Information
                    </h1>
                    <p className="text-base text-slate-600">
                        Please answer all questions truthfully
                    </p>
                </div>

                <DynamicForm
                    isModal={false}
                    isOpen={true}
                    title="Other Information (CSC PDS)"
                    fields={otherInfoFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Save Information"
                    size="xl"
                />

                <div className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>
                        Declaration: Information provided is true and correct
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
