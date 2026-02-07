import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Camera } from "lucide-react";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";
import { motion } from "framer-motion";

export default function CreateUser() {
    const userFields = [
        {
            name: "employeeNo",
            label: "Employee Number",
            type: "text",
            required: false,
            icon: <Briefcase size={14} />,
            placeholder: "e.g., EMP-2024-001",
        },
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            icon: <User size={14} />,
            placeholder: "Enter first name",
        },
        {
            name: "middleName",
            label: "Middle Name",
            type: "text",
            required: false,
            icon: <User size={14} />,
            placeholder: "Enter middle name (optional)",
        },
        {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
            icon: <User size={14} />,
            placeholder: "Enter last name",
        },
        {
            name: "email",
            label: "Email Address",
            type: "email",
            required: true,
            icon: <Mail size={14} />,
            placeholder: "user@example.com",
        },
        {
            name: "contactNumber",
            label: "Contact Number",
            type: "text",
            required: false,
            icon: <Phone size={14} />,
            placeholder: "+63 912 345 6789",
        },
        {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: false,
            icon: <Calendar size={14} />,
        },
        {
            name: "gender",
            label: "Gender",
            type: "select",
            required: false,
            icon: <User size={14} />,
            options: [
                { value: "", label: "Select gender" },
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
            ],
        },
        {
            name: "streetAddress",
            label: "Street Address",
            type: "text",
            required: false,
            icon: <MapPin size={14} />,
            placeholder: "House/Building No., Street Name",
        },
        {
            name: "barangay",
            label: "Barangay",
            type: "text",
            required: false,
            icon: <MapPin size={14} />,
            placeholder: "Enter barangay",
        },
        {
            name: "city",
            label: "City/Municipality",
            type: "text",
            required: false,
            icon: <MapPin size={14} />,
            placeholder: "Enter city",
        },
        {
            name: "province",
            label: "Province",
            type: "text",
            required: false,
            icon: <MapPin size={14} />,
            placeholder: "Enter province",
        },
        {
            name: "postalCode",
            label: "Postal Code",
            type: "text",
            required: false,
            icon: <MapPin size={14} />,
            placeholder: "e.g., 4000",
        },
        {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            icon: <Shield size={14} />,
            options: [
                { value: "USER", label: "User" },
                { value: "MISD", label: "MISD" },
                { value: "HEAD", label: "Department Head" },
            ],
        },
        {
            name: "departmentId",
            label: "Department ID",
            type: "number",
            required: false,
            icon: <Briefcase size={14} />,
            placeholder: "Enter department ID (if applicable)",
        },
        {
            name: "jobTitle",
            label: "Job Title",
            type: "text",
            required: false,
            icon: <Briefcase size={14} />,
            placeholder: "e.g., Professor, IT Specialist",
        },
        {
            name: "dateHired",
            label: "Date Hired",
            type: "date",
            required: false,
            icon: <Calendar size={14} />,
        },
        {
            name: "employmentStatus",
            label: "Employment Status",
            type: "select",
            required: false,
            icon: <Briefcase size={14} />,
            options: [
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "ON_LEAVE", label: "On Leave" },
            ],
        },
        {
            name: "emergencyContactName",
            label: "Emergency Contact Name",
            type: "text",
            required: false,
            icon: <User size={14} />,
            placeholder: "Full name of emergency contact",
        },
        {
            name: "emergencyContactNumber",
            label: "Emergency Contact Number",
            type: "text",
            required: false,
            icon: <Phone size={14} />,
            placeholder: "Emergency contact phone number",
        },
        {
            name: "emergencyContactRelationship",
            label: "Emergency Contact Relationship",
            type: "text",
            required: false,
            icon: <User size={14} />,
            placeholder: "e.g., Spouse, Parent, Sibling",
        },
        {
            name: "profilePhoto",
            label: "Profile Photo (Optional)",
            type: "file",
            required: false,
            icon: <Camera size={14} />,
            accept: ".jpg,.jpeg,.png",
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            icon: <Shield size={14} />,
            placeholder: "Enter secure password",
        },
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            required: true,
            icon: <Shield size={14} />,
            placeholder: "Re-enter password",
        },
    ];

    const handleSubmit = async (data: any) => {
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        const toastId = showToast("Creating user account...", "loading");

        try {
            const formData = new FormData();

            // Required fields
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("email", data.email);
            formData.append("password", data.password);
            formData.append("role", data.role || "USER");

            // Optional fields - only append if they have values
            if (data.employeeNo) formData.append("employeeNo", data.employeeNo);
            if (data.middleName) formData.append("middleName", data.middleName);
            if (data.contactNumber) formData.append("contactNumber", data.contactNumber);
            if (data.streetAddress) formData.append("streetAddress", data.streetAddress);
            if (data.barangay) formData.append("barangay", data.barangay);
            if (data.city) formData.append("city", data.city);
            if (data.province) formData.append("province", data.province);
            if (data.postalCode) formData.append("postalCode", data.postalCode);
            if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
            if (data.gender) formData.append("gender", data.gender);
            if (data.departmentId) formData.append("departmentId", String(data.departmentId));
            if (data.jobTitle) formData.append("jobTitle", data.jobTitle);
            if (data.dateHired) formData.append("dateHired", data.dateHired);
            if (data.employmentStatus) formData.append("employmentStatus", data.employmentStatus);
            if (data.emergencyContactName) formData.append("emergencyContactName", data.emergencyContactName);
            if (data.emergencyContactNumber) formData.append("emergencyContactNumber", data.emergencyContactNumber);
            if (data.emergencyContactRelationship) formData.append("emergencyContactRelationship", data.emergencyContactRelationship);

            if (data.profilePhoto && data.profilePhoto[0]) {
                formData.append("profilePhoto", data.profilePhoto[0]);
            }

            const res = await RequestHandler.fetchData(
                "POST",
                "user/create",
                formData,
            );

            removeToast(toastId);

            if (res.success) {
                showToast("User account created successfully.", "success");
            } else {
                showToast(res.message || "Failed to create user.", "error");
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
                    Create New User
                </h1>
                <p className="text-base text-slate-600">
                    Fill out the form below to create a new user account. Fields marked with an asterisk (*) are required.
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
                    title="User Information"
                    fields={userFields}
                    onSubmit={handleSubmit}
                    actionType="CREATE"
                    size="lg"
                />
            </motion.div>
        </motion.div>
    );
}