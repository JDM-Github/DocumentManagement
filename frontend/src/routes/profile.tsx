import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    IdCard,
    Shield,
    Building,
    MapPin,
    Calendar,
    Briefcase,
    Edit,
    UserCircle,
    Upload,
    X,
} from "lucide-react";
import { DynamicForm } from "../components/Form";
import RequestHandler from "../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../components/toast";
import { useEffect, useState, useRef } from "react";

export default function UserProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await RequestHandler.fetchData("GET", "user/me", {});

            if (res.success && res.user) {
                setProfile(res.user);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load user profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showToast("Please select an image file", "error");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast("File size must be less than 5MB", "error");
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const profileFields = [
        {
            name: "employeeNo",
            label: "Employee No.",
            type: "text",
            icon: <IdCard size={16} />,
            section: "Basic Information",
        },
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            icon: <User size={16} />,
            section: "Basic Information",
        },
        {
            name: "middleName",
            label: "Middle Name",
            type: "text",
            section: "Basic Information",
        },
        {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
            icon: <User size={16} />,
            section: "Basic Information",
        },
        {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            icon: <Calendar size={16} />,
            section: "Basic Information",
        },
        {
            name: "gender",
            label: "Gender",
            type: "select",
            options: [
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
            ],
            section: "Basic Information",
        },
        {
            name: "contactNumber",
            label: "Contact Number",
            type: "text",
            icon: <Phone size={16} />,
            placeholder: "+63 XXX XXX XXXX",
            section: "Contact Information",
        },
        {
            name: "streetAddress",
            label: "Street Address",
            type: "text",
            icon: <MapPin size={16} />,
            section: "Address",
        },
        {
            name: "barangay",
            label: "Barangay",
            type: "text",
            section: "Address",
        },
        {
            name: "city",
            label: "City",
            type: "text",
            section: "Address",
        },
        {
            name: "province",
            label: "Province",
            type: "text",
            section: "Address",
        },
        {
            name: "postalCode",
            label: "Postal Code",
            type: "text",
            section: "Address",
        },
        {
            name: "jobTitle",
            label: "Job Title",
            type: "text",
            icon: <Briefcase size={16} />,
            section: "Employment Information",
        },
        {
            name: "dateHired",
            label: "Date Hired",
            type: "date",
            icon: <Calendar size={16} />,
            section: "Employment Information",
        },
        {
            name: "emergencyContactName",
            label: "Emergency Contact Name",
            type: "text",
            icon: <User size={16} />,
            section: "Emergency Contact",
        },
        {
            name: "emergencyContactNumber",
            label: "Emergency Contact Number",
            type: "text",
            icon: <Phone size={16} />,
            section: "Emergency Contact",
        },
        {
            name: "emergencyContactRelationship",
            label: "Relationship",
            type: "text",
            section: "Emergency Contact",
        },
    ];

    const handleSubmit = async (data: any) => {
        const toastId = showToast("Updating profile...", "loading");
        try {
            const formData = new FormData();

            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            if (selectedFile) {
                formData.append("profilePhoto", selectedFile);
            }

            const res = await RequestHandler.fetchData(
                "PUT",
                "user/update",
                formData
            );

            removeToast(toastId);
            if (res.success) {
                showToast("Profile updated successfully!", "success");
                setIsEditModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchProfile();
            } else {
                showToast(res.message || "Failed to update profile.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="text-slate-600">Loading user profile...</div>
            </div>
        );
    }

    const formatDate = (date: string) => {
        if (!date) return "Not set";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date: string) => {
        if (!date) return "Never";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getFullAddress = () => {
        const parts = [
            profile?.streetAddress,
            profile?.barangay,
            profile?.city,
            profile?.province,
            profile?.postalCode,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Not set";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Profile Header with Gradient */}
                    <div className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-6 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden ring-4 ring-white/30">
                                        {profile?.profilePhoto ? (
                                            <img
                                                src={profile.profilePhoto}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle size={48} className="text-[#1E40AF]" />
                                        )}
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                                        {profile?.firstName} {profile?.middleName}{" "}
                                        {profile?.lastName}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-blue-100">
                                        {profile?.employeeNo && (
                                            <>
                                                <span className="font-mono font-semibold bg-white/20 px-3 py-1 rounded-lg">
                                                    {profile.employeeNo}
                                                </span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <span>{profile?.jobTitle || "Employee"}</span>
                                        <span>•</span>
                                        <span>{profile?.role || "USER"}</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-[#0B1C3A] hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <Edit size={16} />
                                Edit Profile
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50">
                        <div className="px-6 py-6 text-center">
                            <p className="text-sm font-semibold text-slate-600 mb-1">Status</p>
                            <p className={`text-lg font-bold ${profile?.isActive ? "text-green-600" : "text-red-600"}`}>
                                {profile?.isActive ? "Active" : "Inactive"}
                            </p>
                        </div>
                        <div className="px-6 py-6 text-center">
                            <p className="text-sm font-semibold text-slate-600 mb-1">Department</p>
                            <p className="text-lg font-bold text-slate-900">
                                {profile?.departmentName || "N/A"}
                            </p>
                        </div>
                        <div className="px-6 py-6 text-center">
                            <p className="text-sm font-semibold text-slate-600 mb-1">Last Login</p>
                            <p className="text-lg font-bold text-slate-900">
                                {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : "Never"}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Basic Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <User size={20} className="text-[#1E40AF]" />
                            Basic Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem
                                icon={<IdCard size={18} />}
                                label="Employee No."
                                value={profile?.employeeNo || "Not assigned"}
                            />
                            <InfoItem
                                icon={<Calendar size={18} />}
                                label="Date of Birth"
                                value={formatDate(profile?.dateOfBirth)}
                            />
                            <InfoItem
                                icon={<User size={18} />}
                                label="Gender"
                                value={profile?.gender || "Not set"}
                            />
                            <InfoItem
                                icon={<Shield size={18} />}
                                label="Employment Status"
                                value={profile?.employmentStatus || "ACTIVE"}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Phone size={20} className="text-[#1E40AF]" />
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem
                                icon={<Mail size={18} />}
                                label="Email"
                                value={profile?.email}
                            />
                            <InfoItem
                                icon={<Phone size={18} />}
                                label="Contact Number"
                                value={profile?.contactNumber || "Not set"}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Address */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MapPin size={20} className="text-[#1E40AF]" />
                            Address
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-100">
                            <p className="text-slate-700 leading-relaxed">{getFullAddress()}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Employment Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#1E40AF]" />
                            Employment Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem
                                icon={<Briefcase size={18} />}
                                label="Job Title"
                                value={profile?.jobTitle || "Not set"}
                            />
                            {/* <InfoItem
                                icon={<Calendar size={18} />}
                                label="Date Hired"
                                value={formatDate(profile?.dateHired)}
                            /> */}
                            <InfoItem
                                icon={<Shield size={18} />}
                                label="Role"
                                value={profile?.role || "USER"}
                            />
                            <InfoItem
                                icon={<Building size={18} />}
                                label="Department"
                                value={profile?.departmentName || "Not assigned"}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Emergency Contact */}
                {(profile?.emergencyContactName || profile?.emergencyContactNumber) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Phone size={20} className="text-red-600" />
                                Emergency Contact
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    icon={<User size={18} />}
                                    label="Name"
                                    value={profile?.emergencyContactName || "Not set"}
                                />
                                <InfoItem
                                    icon={<Phone size={18} />}
                                    label="Contact Number"
                                    value={profile?.emergencyContactNumber || "Not set"}
                                />
                                <InfoItem
                                    icon={<User size={18} />}
                                    label="Relationship"
                                    value={profile?.emergencyContactRelationship || "Not set"}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* System Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Shield size={20} className="text-[#1E40AF]" />
                            System Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem
                                icon={<Calendar size={18} />}
                                label="Last Login"
                                value={formatDateTime(profile?.lastLoginAt)}
                            />
                            <InfoItem
                                icon={<Calendar size={18} />}
                                label="Account Created"
                                value={formatDateTime(profile?.createdAt)}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-6 py-5 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-white">
                                Edit Profile
                            </h2>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Profile Photo Upload Section */}
                            <div className="mb-6 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                                <label className="block text-sm font-semibold text-slate-900 mb-3">
                                    Profile Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden ring-4 ring-blue-100">
                                        {previewUrl || profile?.profilePhoto ? (
                                            <img
                                                src={previewUrl || profile.profilePhoto}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle size={48} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#0B1C3A] transition-colors shadow-sm font-medium"
                                        >
                                            <Upload size={18} />
                                            Upload Photo
                                        </button>
                                        <p className="text-xs text-slate-500 mt-2">
                                            JPG, PNG. Max 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DynamicForm
                                isModal={false}
                                isOpen={true}
                                title=""
                                fields={profileFields}
                                initialData={profile}
                                onSubmit={handleSubmit}
                                actionType="UPDATE"
                                submitButtonText="Save Changes"
                                size="lg"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: any;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-[#1E40AF] rounded-lg mt-0.5">
                <div className="text-white">{icon}</div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
                <p className="text-slate-900 font-medium break-words">
                    {value || "Not set"}
                </p>
            </div>
        </div>
    );
}