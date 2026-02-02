import { useState } from "react";
import { Menu, Bell, Megaphone, UserCheck, User, LogOut } from "lucide-react";
import { DateTimeDisplay } from "../components/header/datetimedisplay";
import { Announcement } from "../lib/interface";
import { AnnouncementPanel } from "../components/header/announcementpanel";
import { NotificationPanel } from "../components/header/notificationpanel";
import { useAuth } from "../lib/context/auth";
import { useNotifications } from "../lib/hooks/notification";

export default function Header({
    currentPage,
    targetMyself,
    setTargetMyself,
    setCurrentPage
}: {
    currentPage: string,
    targetMyself: boolean,
    setTargetMyself: (targetMyself: boolean) => void,
    setCurrentPage: (page: string) => void
}) {
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        fetchNotifications
    } = useNotifications();

    const [announcements, _] = useState<Announcement[]>([]);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        if (await markAllAsRead()) {
            fetchNotifications();
        }
    };

    const handleDeleteNotification = async (id: string) => {
        await deleteNotification(id);
    };

    const handleDeleteAllNotifications = async () => {
        if (confirm('Are you sure you want to delete all notifications?')) {
            await deleteAllNotifications();
        }
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const initials = user?.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AD';

    return (
        <header className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] shadow-lg border-b border-white/10 sticky top-0 z-20">
            <div className="px-4 sm:px-6 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="flex w-9 h-9 bg-white/10 rounded-lg items-center justify-center backdrop-blur-sm border border-white/20">
                            <Menu size={20} className="text-white" />
                        </div>
                        <h1 className="lg:text-xl font-bold text-white ml-3 text-md">Document Tracking System | {currentPage}</h1>
                    </div>

                    <div className="flex-1 max-w-xl mx-4 hidden sm:block">
                        <DateTimeDisplay />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* {user?.role !== "HEAD" && */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setTargetMyself(!targetMyself);
                                        if (targetMyself) {
                                            if (currentPage === "Request Logs")
                                                setCurrentPage("Reviewed");
                                        } else {
                                            if (currentPage === "Reviewed")
                                                setCurrentPage("Request Logs");
                                        }
                                    }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 group relative"
                                    title={targetMyself ? "Viewing My Requests" : "Viewing Department Requests"}
                                >
                                    {targetMyself ? (
                                        <UserCheck className="w-6 h-6 text-white" />
                                    ) : (
                                        <User className="w-6 h-6 text-white" />
                                    )}
                                </button>
                            </div>
                        {/* } */}

                        {/* Announcements */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowAnnouncements(!showAnnouncements);
                                    if (showNotifications) setShowNotifications(false);
                                    if (showUserMenu) setShowUserMenu(false);
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 group relative"
                            >
                                <Megaphone className="w-6 h-6 text-white" />
                                {announcements.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {announcements.length}
                                    </span>
                                )}
                            </button>
                            {showAnnouncements && (
                                <AnnouncementPanel
                                    announcements={announcements}
                                    onClose={() => setShowAnnouncements(false)}
                                />
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (showAnnouncements) setShowAnnouncements(false);
                                    if (showUserMenu) setShowUserMenu(false);
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 group relative"
                                disabled={loading}
                            >
                                <Bell className="w-5 h-5 text-white" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <NotificationPanel
                                    notifications={notifications}
                                    onClose={() => setShowNotifications(false)}
                                    onMarkAsRead={handleMarkAsRead}
                                    onMarkAllAsRead={handleMarkAllAsRead}
                                    onDeleteNotification={handleDeleteNotification}
                                    onDeleteAllNotifications={handleDeleteAllNotifications}
                                    loading={loading}
                                />
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative flex items-center gap-2 pl-2">
                            <button
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    if (showNotifications) setShowNotifications(false);
                                    if (showAnnouncements) setShowAnnouncements(false);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer hover:scale-105 group"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs transition-transform group-hover:scale-110">
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-white/70">{user?.role || 'Administrator'}</p>
                                </div>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-600">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}