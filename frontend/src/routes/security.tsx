import { motion } from "framer-motion";
import {
    Shield,
    Mail,
    Lock,
    Key,
    AlertCircle,
    CheckCircle,
    X,
} from "lucide-react";
import { DynamicForm } from "../components/Form";
import RequestHandler from "../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../components/toast";
import { useEffect, useState } from "react";

export default function SecuritySettings() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
    const [isVerifyEmailOpen, setIsVerifyEmailOpen] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");

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

    const passwordFields = [
        {
            name: "currentPassword",
            label: "Current Password",
            type: "password",
            required: true,
            icon: <Lock size={14} />,
            placeholder: "Enter your current password",
        },
        {
            name: "newPassword",
            label: "New Password",
            type: "password",
            required: true,
            icon: <Key size={14} />,
            placeholder: "Enter new password (min. 8 characters)",
        },
        {
            name: "confirmPassword",
            label: "Confirm New Password",
            type: "password",
            required: true,
            icon: <Key size={14} />,
            placeholder: "Re-enter new password",
        },
    ];

    const emailFields = [
        {
            name: "newEmail",
            label: "New Email Address",
            type: "email",
            required: true,
            icon: <Mail size={14} />,
            placeholder: "Enter new email address",
        },
        {
            name: "password",
            label: "Current Password",
            type: "password",
            required: true,
            icon: <Lock size={14} />,
            placeholder: "Enter password to confirm",
        },
    ];

    const verificationFields = [
        {
            name: "verificationCode",
            label: "Verification Code",
            type: "text",
            required: true,
            icon: <Key size={14} />,
            placeholder: "Enter 6-digit code from email",
        },
    ];

    const handleChangePassword = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        if (data.newPassword.length < 8) {
            showToast("Password must be at least 8 characters long.", "error");
            return;
        }

        const toastId = showToast("Changing password...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "PUT",
                "user/security/change-password",
                {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Password changed successfully!", "success");
                setIsChangePasswordOpen(false);
            } else {
                showToast(res.message || "Failed to change password.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const handleRequestEmailChange = async (data: any) => {
        const toastId = showToast("Requesting email change...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "user/security/request-email-change",
                {
                    newEmail: data.newEmail,
                    password: data.password,
                }
            );

            removeToast(toastId);

            if (res.success) {
                const needsVerification = ["USER", "HEAD"].includes(profile?.role);

                if (needsVerification) {
                    setPendingEmail(data.newEmail);
                    setIsChangeEmailOpen(false);
                    setIsVerifyEmailOpen(true);
                    showToast("Verification code sent to your new email!", "success");
                } else {
                    showToast("Email changed successfully!", "success");
                    setIsChangeEmailOpen(false);
                    fetchProfile();
                }
            } else {
                showToast(res.message || "Failed to request email change.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        }
    };

    const handleVerifyEmail = async (data: any) => {
        const toastId = showToast("Verifying email...", "loading");

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "user/security/verify-email-change",
                {
                    verificationCode: data.verificationCode,
                    newEmail: pendingEmail,
                }
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Email changed successfully!", "success");
                setIsVerifyEmailOpen(false);
                setPendingEmail("");
                fetchProfile();
            } else {
                showToast(res.message || "Invalid or expired verification code.", "error");
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
                <div className="text-slate-600">Loading security settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <Shield size={32} className="text-[#1E40AF]" />
                        Security Settings
                    </h1>
                    <p className="text-base text-slate-600">
                        Manage your account security, password, and email address.
                    </p>
                </motion.div>

                {/* Current Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <AlertCircle size={20} className="text-[#1E40AF]" />
                            Current Account Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Mail size={20} className="text-[#1E40AF]" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600">Email Address</p>
                                        <p className="text-slate-900 font-medium">{profile?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Shield size={20} className="text-[#1E40AF]" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600">Account Role</p>
                                        <p className="text-slate-900 font-medium">{profile?.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Password Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Lock size={20} className="text-[#1E40AF]" />
                            Password
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 mb-4">
                            Ensure your account is using a strong password to stay secure.
                        </p>
                        <button
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="px-5 py-2.5 bg-[#1E40AF] text-white rounded-lg hover:bg-[#0B1C3A] transition-colors font-semibold shadow-sm"
                        >
                            Change Password
                        </button>
                    </div>
                </motion.div>

                {/* Email Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Mail size={20} className="text-[#1E40AF]" />
                            Email Address
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 mb-4">
                            Change your email address.
                            {["USER", "HEAD"].includes(profile?.role) && (
                                <span className="text-orange-600 font-semibold"> Email verification required.</span>
                            )}
                        </p>
                        <button
                            onClick={() => setIsChangeEmailOpen(true)}
                            className="px-5 py-2.5 bg-[#1E40AF] text-white rounded-lg hover:bg-[#0B1C3A] transition-colors font-semibold shadow-sm"
                        >
                            Change Email
                        </button>
                    </div>
                </motion.div>

                {/* Security Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                Security Tips
                            </h3>
                            <ul className="space-y-2 text-slate-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                                    <span>Use a strong password with at least 8 characters</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                                    <span>Don't share your password with anyone</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                                    <span>Change your password regularly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                                    <span>Use a unique password for this account</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
                    >
                        <div className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-6 py-5 flex justify-between items-center rounded-t-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Lock size={20} />
                                Change Password
                            </h2>
                            <button
                                onClick={() => setIsChangePasswordOpen(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <DynamicForm
                                isModal={false}
                                isOpen={true}
                                title=""
                                fields={passwordFields}
                                onSubmit={handleChangePassword}
                                actionType="UPDATE"
                                submitButtonText="Change Password"
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Change Email Modal */}
            {isChangeEmailOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
                    >
                        <div className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-6 py-5 flex justify-between items-center rounded-t-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Mail size={20} />
                                Change Email
                            </h2>
                            <button
                                onClick={() => setIsChangeEmailOpen(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {["USER", "HEAD"].includes(profile?.role) && (
                                <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-orange-800">
                                            <p className="font-semibold mb-1">Verification Required</p>
                                            <p>A verification code will be sent to your new email address.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DynamicForm
                                isModal={false}
                                isOpen={true}
                                title=""
                                fields={emailFields}
                                onSubmit={handleRequestEmailChange}
                                actionType="UPDATE"
                                submitButtonText="Request Email Change"
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Verify Email Modal */}
            {isVerifyEmailOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
                    >
                        <div className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-6 py-5 flex justify-between items-center rounded-t-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Key size={20} />
                                Verify Email
                            </h2>
                            <button
                                onClick={() => {
                                    setIsVerifyEmailOpen(false);
                                    setPendingEmail("");
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Check Your Email</p>
                                        <p>We've sent a verification code to <strong>{pendingEmail}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <DynamicForm
                                isModal={false}
                                isOpen={true}
                                title=""
                                fields={verificationFields}
                                onSubmit={handleVerifyEmail}
                                actionType="UPDATE"
                                submitButtonText="Verify Email"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}