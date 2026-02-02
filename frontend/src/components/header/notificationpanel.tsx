import { Bell, Trash2, CheckCircle, CheckCheck, Loader2 } from "lucide-react";
import { Notification } from "../../lib/interface";

export function NotificationPanel({
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onDeleteAllNotifications,
    loading = false
}: {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDeleteNotification: (id: string) => void;
    onDeleteAllNotifications: () => void;
    loading?: boolean;
}) {
    const unreadCount = notifications.filter(n => !n.read).length;
    const hasUnread = unreadCount > 0;
    const hasNotifications = notifications.length > 0;

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'document':
                return '📄';
            case 'request':
                return '📋';
            default:
                return 'ℹ️';
        }
    };

    const getTypeColorClasses = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'success':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'document':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'request':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            window.location.href = notification.link;
        }
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {hasUnread && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {hasNotifications && hasUnread && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Mark all as read"
                                disabled={loading}
                            >
                                <CheckCheck className="w-4 h-4" />
                            </button>
                        )}
                        {hasNotifications && (
                            <button
                                onClick={onDeleteAllNotifications}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete all notifications"
                                disabled={loading}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {hasNotifications && (
                    <div className="flex gap-2">
                        <button
                            onClick={onMarkAllAsRead}
                            disabled={!hasUnread || loading}
                            className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${hasUnread
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark all as read
                        </button>
                        <button
                            onClick={onDeleteAllNotifications}
                            disabled={loading}
                            className="flex-1 py-2 px-3 text-sm bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                        <p className="text-slate-500">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium text-slate-600 mb-1">No notifications</p>
                        <p className="text-sm text-slate-400">Notifications will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`group p-4 transition-all hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50 hover:bg-blue-100/50' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getTypeColorClasses(notification.type)}`}>
                                        <span className="text-sm">{getTypeIcon(notification.type)}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className={`font-medium truncate ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                {formatTimeAgo(notification.createdAt)}
                                            </span>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMarkAsRead(notification.id);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this notification?')) {
                                                            onDeleteNotification(notification.id);
                                                        }
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(notification.metadata).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800"
                                                        >
                                                            {key}: {String(value)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div> 
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}