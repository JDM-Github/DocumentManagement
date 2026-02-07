import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, User as UserIcon, Mail, Phone, MapPin, Briefcase, Shield } from "lucide-react";
import DataTable from "../../components/Table";
import { DynamicForm } from "../../components/Form";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../../components/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AdminUsersTableProps {
    filter: "ALL" | "USER" | "MISD" | "HEAD" | "DEAN" | "PRESIDENT" | "DEPARTMENT" | "HIGHERUP";
    title: string;
    isMISD: boolean;
    isDean: boolean;
    isPresident: boolean;
}

type Option = {
    value: string;
    label: string;
};

export default function AdminUsersTable({ filter, title, isMISD, isDean, isPresident }: AdminUsersTableProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);

    const fetchDepartments = async () => {
        const toastId = showToast("Fetching departments...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                "department/get-all",
                {}
            );
            if (res.success && res.departments) {
                const options = res.departments.map((d: any) => ({
                    value: String(d.id),
                    label: d.name,
                }));
                setDepartmentOptions(options);
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
    useEffect(() => { fetchDepartments(); }, []);

    const columns = [
        { key: "id", label: "ID" },
        { key: "employeeNo", label: "Employee No." },
        { key: "fullName", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "department", label: "Department" },
        { key: "employmentStatus", label: "Status" },
    ];

    const editFields = [
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            icon: <UserIcon size={14} />,
        },
        {
            name: "middleName",
            label: "Middle Name",
            type: "text",
            required: false,
            icon: <UserIcon size={14} />,
        },
        {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
            icon: <UserIcon size={14} />,
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            icon: <Mail size={14} />,
        },
        {
            name: "contactNumber",
            label: "Contact Number",
            type: "text",
            required: false,
            icon: <Phone size={14} />,
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
            label: "Department",
            type: "select",
            required: false,
            icon: <Briefcase size={14} />,
            options: departmentOptions,
        },
        {
            name: "jobTitle",
            label: "Job Title",
            type: "text",
            required: false,
            icon: <Briefcase size={14} />,
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
    ];

    const canEdit = isMISD;
    const canView = filter === "DEPARTMENT" || isMISD || isDean || isPresident;

    const fetchData = async () => {
        setLoading(true);
        const toastId = showToast(`Fetching ${title.toLowerCase()}...`, "loading");

        const endpoint = filter === "DEPARTMENT"
            ? "user/admin/get-by-department"
            : `user/admin/get-by-role/${filter}`;

        const res = await RequestHandler.fetchData("GET", endpoint, {});

        if (res.success && res.users) {
            const formatted = res.users.map((u: any) => ({
                id: u.id,
                employeeNo: u.employeeNo || "—",
                firstName: u.firstName,
                middleName: u.middleName || "",
                lastName: u.lastName,
                fullName: `${u.firstName} ${u.middleName ? u.middleName + " " : ""}${u.lastName}`,
                email: u.email,
                contactNumber: u.contactNumber || "—",
                role: u.role,
                roleDisplay: u.role,
                departmentId: u.departmentId || null,
                department: u.Department?.name || "—",
                jobTitle: u.jobTitle || "—",
                employmentStatus: u.employmentStatus,
                employmentStatusDisplay: u.employmentStatus.replace("_", " "),
                streetAddress: u.streetAddress || "—",
                barangay: u.barangay || "—",
                city: u.city || "—",
                province: u.province || "—",
                postalCode: u.postalCode || "—",
                dateOfBirth: u.dateOfBirth || "—",
                gender: u.gender || "—",
                dateHired: u.dateHired || "—",
                emergencyContactName: u.emergencyContactName || "—",
                emergencyContactNumber: u.emergencyContactNumber || "—",
                emergencyContactRelationship: u.emergencyContactRelationship || "—",
                profilePhoto: u.profilePhoto || "",
                lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-PH") : "Never",
                isActive: u.isActive,
                createdAt: new Date(u.createdAt).toLocaleString("en-PH"),
                updatedAt: new Date(u.updatedAt).toLocaleString("en-PH"),
            }));
            setData(formatted);
            showToast("Users loaded.", "success");
        } else {
            setData([]);
            showToast(res.message || "Failed to fetch users.", "error");
        }

        setLoading(false);
        removeToast(toastId);
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const handleEdit = (row: any) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (formData: any) => {
        if (!selectedRow) return;

        const toastId = showToast("Updating user...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                `user/admin/update/${selectedRow.id}`,
                formData
            );

            removeToast(toastId);

            if (res.success) {
                showToast("User updated successfully.", "success");
                setIsEditModalOpen(false);
                fetchData();
            } else {
                showToast(res.message || "Failed to update user.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const handleDelete = async (rowId: number) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        const toastId = showToast("Deleting user...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "DELETE",
                `user/admin/delete/${rowId}`,
                {}
            );

            removeToast(toastId);

            if (res.success) {
                showToast("User deleted successfully.", "success");
                fetchData();
            } else {
                showToast(res.message || "Failed to delete user.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "USER": return "text-slate-600";
            case "MISD": return "text-blue-600";
            case "HEAD": return "text-purple-600";
            case "DEAN": return "text-orange-600";
            case "PRESIDENT": return "text-red-600";
            default: return "text-slate-600";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "text-green-600";
            case "INACTIVE": return "text-red-600";
            case "ON_LEAVE": return "text-yellow-600";
            default: return "text-slate-600";
        }
    };

    const renderExpandedRow = (row: any) => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <UserIcon size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">{row.fullName}</h4>
                        <p className="text-sm text-slate-600">
                            {row.roleDisplay} • {row.department}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getRoleColor(row.role)}`}>
                        {row.roleDisplay}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${getStatusColor(row.employmentStatus)}`}>
                        {row.employmentStatusDisplay}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <UserIcon size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Personal Information</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Employee No:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.employeeNo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Email:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Contact:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.contactNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Gender:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.gender}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Date of Birth:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.dateOfBirth}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase size={16} className="text-blue-600" />
                        <h5 className="text-sm font-bold text-slate-800">Employment Details</h5>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Job Title:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.jobTitle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Department:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.department}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Date Hired:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.dateHired}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className={`text-sm font-semibold ${getStatusColor(row.employmentStatus)}`}>
                                {row.employmentStatusDisplay}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Last Login:</span>
                            <span className="text-sm font-semibold text-slate-800">{row.lastLoginAt}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-blue-600" />
                    <h5 className="text-sm font-bold text-slate-800">Address</h5>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Street:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.streetAddress}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Barangay:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.barangay}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">City:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.city}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Province:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.province}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Postal Code:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.postalCode}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                    <Phone size={16} className="text-blue-600" />
                    <h5 className="text-sm font-bold text-slate-800">Emergency Contact</h5>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Name:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.emergencyContactName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Number:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.emergencyContactNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Relationship:</span>
                        <span className="text-sm font-semibold text-slate-800">{row.emergencyContactRelationship}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-blue-900 font-semibold">Created:</span>
                        <span className="text-blue-700 ml-2">{row.createdAt}</span>
                    </div>
                    <div>
                        <span className="text-blue-900 font-semibold">Updated:</span>
                        <span className="text-blue-700 ml-2">{row.updatedAt}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderActions = (row: any) => {
        if (!canView) return null;

        if (!canEdit) {
            return (
                <div className="flex gap-1">
                    <button
                        onClick={() => navigate(`/users/${row.id}`)}
                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            );
        }

        return (
            <div className="flex gap-1">
                <button
                    onClick={() => navigate(`/users/${row.id}`)}
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                    title="View Details"
                >
                    <Eye size={14} />
                </button>
                {row.role !== "PRESIDENT" && row.role !== "DEAN" && (
                    <>
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-1.5 hover:bg-yellow-100 text-yellow-600 rounded"
                            title="Edit User"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                            title="Delete User"
                        >
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        );
    };

    if (!canView) {
        return (
            <div className="p-4 sm:p-6 min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
                    <p className="text-slate-600">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen"
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
                    {title}
                </h1>
                <p className="text-base text-slate-600">
                    View and manage user accounts. You can edit user details, update roles, or remove users from the system.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <DataTable
                    title={title}
                    columns={columns}
                    data={data}
                    loading={loading}
                    expandable
                    renderExpandedRow={renderExpandedRow}
                    renderActions={renderActions}
                />
            </motion.div>

            {isEditModalOpen && selectedRow && canEdit && (
                <DynamicForm
                    isModal
                    isOpen={isEditModalOpen}
                    title="Edit User"
                    fields={editFields}
                    initialData={selectedRow}
                    onSubmit={handleEditSubmit}
                    actionType="UPDATE"
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </motion.div>
    );
}