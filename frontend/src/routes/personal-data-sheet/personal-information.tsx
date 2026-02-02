import { motion } from "framer-motion";
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    IdCard,
    Home,
    Flag,
    Users,
    Ruler,
    Weight,
    Droplet
} from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { useEffect, useState } from "react";

export default function PersonalInformation() {
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                const res = await RequestHandler.fetchData(
                    "POST",
                    "personal-information/find-or-create",
                    {}
                );

                if (res.success && res.personalinformation) {
                    setInitialValues(res.personalinformation);
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to load personal information.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalInfo();
    }, []);
    
    const personalInfoFields = [
        /* =========================
           BASIC NAME INFORMATION
        ========================== */
        
        {
            name: "surname",
            label: "Surname",
            type: "text",
            required: true,
            icon: <User size={16} />,
            section: "Personal Details",
        },
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            icon: <User size={16} />,
            section: "Personal Details",
        },
        {
            name: "middleName",
            label: "Middle Name",
            type: "text",
            section: "Personal Details",
        },
        {
            name: "nameExtension",
            label: "Name Extension",
            type: "text",
            placeholder: "Jr., Sr., III",
            section: "Personal Details",
        },

        /* =========================
           BIRTH & PHYSICAL DETAILS
        ========================== */
        {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: true,
            icon: <Calendar size={16} />,
            section: "Birth Information",
        },
        {
            name: "placeOfBirth",
            label: "Place of Birth",
            type: "text",
            required: true,
            icon: <MapPin size={16} />,
            section: "Birth Information",
        },
        {
            name: "sex",
            label: "Sex",
            type: "select",
            required: true,
            icon: <Users size={16} />,
            options: [
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
            ],
            section: "Birth Information",
        },

        /* =========================
           PHYSICAL CHARACTERISTICS
        ========================== */
        {
            name: "height",
            label: "Height (cm)",
            type: "text",
            placeholder: "e.g. 170",
            icon: <Ruler size={16} />,
            section: "Physical Characteristics",
        },
        {
            name: "weight",
            label: "Weight (kg)",
            type: "text",
            placeholder: "e.g. 65",
            icon: <Weight size={16} />,
            section: "Physical Characteristics",
        },
        {
            name: "bloodType",
            label: "Blood Type",
            type: "text",
            placeholder: "A+, O-, B+, AB-, etc.",
            icon: <Droplet size={16} />,
            section: "Physical Characteristics",
        },

        /* =========================
           CIVIL STATUS
        ========================== */
        {
            name: "civilStatus",
            label: "Civil Status",
            type: "select",
            required: true,
            options: [
                { value: "Single", label: "Single" },
                { value: "Married", label: "Married" },
                { value: "Widowed", label: "Widowed" },
                { value: "Separated", label: "Separated" },
                { value: "Others", label: "Others" },
            ],
            section: "Civil Status",
        },
        {
            name: "civilStatusOther",
            label: "If Others, specify",
            type: "text",
            placeholder: "Please specify",
            section: "Civil Status",
        },

        /* =========================
           CITIZENSHIP
        ========================== */
        {
            name: "citizenship",
            label: "Citizenship",
            type: "select",
            required: true,
            icon: <Flag size={16} />,
            options: [
                { value: "Filipino", label: "Filipino" },
                { value: "Dual Citizenship", label: "Dual Citizenship" },
            ],
            section: "Citizenship Information",
        },
        {
            name: "dualCitizenshipType",
            label: "Dual Citizenship Type",
            type: "select",
            options: [
                { value: "By Birth", label: "By Birth" },
                { value: "By Naturalization", label: "By Naturalization" },
            ],
            section: "Citizenship Information",
        },
        {
            name: "dualCitizenshipDetails",
            label: "Dual Citizenship Country",
            type: "text",
            placeholder: "e.g. USA, Canada, etc.",
            section: "Citizenship Information",
        },

        /* =========================
           CONTACT INFORMATION
        ========================== */
        {
            name: "mobileNo",
            label: "Mobile No.",
            type: "text",
            required: true,
            icon: <Phone size={16} />,
            placeholder: "+63 XXX XXX XXXX",
            section: "Contact Information",
        },
        {
            name: "telephoneNo",
            label: "Telephone No.",
            type: "text",
            icon: <Phone size={16} />,
            placeholder: "(02) XXXX XXXX",
            section: "Contact Information",
        },
        {
            name: "emailAddress",
            label: "Email Address",
            type: "email",
            icon: <Mail size={16} />,
            placeholder: "your.email@example.com",
            section: "Contact Information",
        },

        /* =========================
           GOVERNMENT IDS
        ========================== */
        {
            name: "gsisIdNo",
            label: "GSIS ID No.",
            type: "text",
            icon: <IdCard size={16} />,
            placeholder: "XXXX-XXXX-XXXX",
            section: "Government IDs",
        },
        {
            name: "pagibigIdNo",
            label: "Pag-IBIG ID No.",
            type: "text",
            icon: <IdCard size={16} />,
            placeholder: "XXXX-XXXX-XXXX",
            section: "Government IDs",
        },
        {
            name: "philhealthNo",
            label: "PhilHealth No.",
            type: "text",
            icon: <IdCard size={16} />,
            placeholder: "XX-XXXXXXXXX-X",
            section: "Government IDs",
        },
        {
            name: "sssNo",
            label: "SSS No.",
            type: "text",
            icon: <IdCard size={16} />,
            placeholder: "XX-XXXXXXX-X",
            section: "Government IDs",
        },
        {
            name: "tinNo",
            label: "TIN No.",
            type: "text",
            icon: <IdCard size={16} />,
            placeholder: "XXX-XXX-XXX-XXX",
            section: "Government IDs",
        },
        {
            name: "agencyEmployeeNo",
            label: "Agency Employee No.",
            type: "text",
            icon: <IdCard size={16} />,
            section: "Government IDs",
        },

        /* =========================
           RESIDENTIAL ADDRESS
        ========================== */
        {
            name: "houseBlockLotNo",
            label: "House / Block / Lot No.",
            type: "text",
            icon: <Home size={16} />,
            placeholder: "e.g. Block 1 Lot 2",
            section: "Residential Address",
        },
        {
            name: "street",
            label: "Street",
            type: "text",
            placeholder: "Street name",
            section: "Residential Address",
        },
        {
            name: "subdivisionVillage",
            label: "Subdivision / Village",
            type: "text",
            placeholder: "Subdivision or Village name",
            section: "Residential Address",
        },
        {
            name: "barangay",
            label: "Barangay",
            type: "text",
            placeholder: "Barangay name",
            section: "Residential Address",
        },
        {
            name: "cityMunicipality",
            label: "City / Municipality",
            type: "text",
            placeholder: "City or Municipality",
            section: "Residential Address",
        },
        {
            name: "province",
            label: "Province",
            type: "text",
            placeholder: "Province name",
            section: "Residential Address",
        },
        {
            name: "zipCode",
            label: "ZIP Code",
            type: "text",
            placeholder: "XXXX",
            section: "Residential Address",
        },

        /* =========================
           PERMANENT ADDRESS
        ========================== */
        {
            name: "permanentHouseBlockLotNo",
            label: "House / Block / Lot No.",
            type: "text",
            icon: <Home size={16} />,
            placeholder: "e.g. Block 1 Lot 2",
            section: "Permanent Address",
        },
        {
            name: "permanentStreet",
            label: "Street",
            type: "text",
            placeholder: "Street name",
            section: "Permanent Address",
        },
        {
            name: "permanentSubdivisionVillage",
            label: "Subdivision / Village",
            type: "text",
            placeholder: "Subdivision or Village name",
            section: "Permanent Address",
        },
        {
            name: "permanentBarangay",
            label: "Barangay",
            type: "text",
            placeholder: "Barangay name",
            section: "Permanent Address",
        },
        {
            name: "permanentCityMunicipality",
            label: "City / Municipality",
            type: "text",
            placeholder: "City or Municipality",
            section: "Permanent Address",
        },
        {
            name: "permanentProvince",
            label: "Province",
            type: "text",
            placeholder: "Province name",
            section: "Permanent Address",
        },
        {
            name: "permanentZipCode",
            label: "ZIP Code",
            type: "text",
            placeholder: "XXXX",
            section: "Permanent Address",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Saving personal information...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "personal-information/find-or-create",
                data
            );
            removeToast(toastId);
            if (res.success) {
                showToast("Personal information saved successfully!", "success");
                window.location.reload();
            } else {
                showToast(res.message || "Failed to save information.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading personal information...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Personal Information
                    </h1>
                    <p className="text-base text-slate-600">
                        Please fill out your complete personal details
                    </p>
                </div>
                <DynamicForm
                    isModal={false}
                    isOpen={true}
                    title="Personal Data Sheet"
                    fields={personalInfoFields}
                    initialData={initialValues}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    submitButtonText="Save Information"
                    size="xl"
                />
            </motion.div>
        </div>
    );
}