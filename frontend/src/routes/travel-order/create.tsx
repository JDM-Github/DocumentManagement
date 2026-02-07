import { Clock, MapPin, Car, FileText, Calendar, Send } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

export default function CreateTravelOrder() {
    const travelOrderFields = [
        {
            name: "transportationUsed",
            label: "Transportation Used",
            type: "select",
            required: true,
            icon: <Car size={14} />,
            options: [
                { value: "PRIVATE_VEHICLE", label: "Private Vehicle" },
                { value: "COMMUTE", label: "Commute" },
                { value: "SCHOOL_VEHICLE", label: "School Vehicle" },
            ],
        },
        {
            name: "destination",
            label: "Destination",
            type: "text",
            required: true,
            icon: <MapPin size={14} />,
            placeholder: "Enter destination address or location...",
        },
        {
            name: "dateOfDepartureFrom",
            label: "Date of Departure (From)",
            type: "date",
            required: true,
            icon: <Calendar size={14} />,
        },
        {
            name: "dateOfDepartureTo",
            label: "Date of Departure (To)",
            type: "date",
            required: true,
            icon: <Calendar size={14} />,
        },
        {
            name: "timeOfDeparture",
            label: "Time of Departure",
            type: "time",
            required: true,
            icon: <Clock size={14} />,
        },
        {
            name: "timeOfArrival",
            label: "Expected Time of Arrival",
            type: "time",
            required: false,
            icon: <Clock size={14} />,
        },
        {
            name: "purposeType",
            label: "Purpose Type",
            type: "select",
            required: true,
            icon: <Send size={14} />,
            options: [
                { value: "OFFICIAL_BUSINESS", label: "Official Business" },
                { value: "OFFICIAL_TIME", label: "Official Time" },
            ],
        },
        {
            name: "purpose",
            label: "Purpose/Reason",
            type: "textarea",
            required: true,
            icon: <FileText size={14} />,
            placeholder: "Provide detailed purpose for travel...",
            rows: 4,
        },
        {
            name: "attachedFile",
            label: "Attached File (Optional)",
            type: "file",
            required: false,
            icon: <FileText size={14} />,
            accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        },
        {
            name: "forwardToHR",
            label: "Forward to HR",
            type: "checkbox",
            required: false,
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Submitting travel order...", "loading");

        try {
            const formData = new FormData();

            formData.append("transportationUsed", data.transportationUsed);
            formData.append("destination", data.destination);
            formData.append("dateOfDepartureFrom", data.dateOfDepartureFrom);
            formData.append("dateOfDepartureTo", data.dateOfDepartureTo);
            formData.append("timeOfDeparture", data.timeOfDeparture);
            formData.append("timeOfArrival", data.timeOfArrival || "");
            formData.append("purposeType", data.purposeType);
            formData.append("purpose", data.purpose);
            formData.append("forwardToHR", String(Boolean(data.forwardToHR)));

            if (data.attachedFile && data.attachedFile[0]) {
                formData.append("attachedFile", data.attachedFile[0]);
            }

            const res = await RequestHandler.fetchData(
                "POST",
                "travel-order/create",
                formData,
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Travel order created successfully.", "success");
            } else {
                showToast(res.message || "Failed to create travel order.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen"
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
                    Create Travel Order
                </h1>
                <p className="text-base text-slate-600">
                    Fill out the form below to create a travel order. Ensure all required
                    details are accurate before submitting.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DynamicForm
                    isModal={false}
                    isOpen={true}
                    title="Create Travel Order"
                    fields={travelOrderFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    size="lg"
                />
            </motion.div>
        </motion.div>

    );
}