import { Megaphone, ExternalLink, AlertCircle, Info, Wrench, Sparkles, Calendar, AlertTriangle } from "lucide-react";
import { Announcement } from "../../lib/interface";

export function AnnouncementPanel({
    announcements,
    onClose
}: {
    announcements: Announcement[];
    onClose: () => void;
}) {
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
            case 'maintenance':
                return <Wrench className="w-4 h-4" />;
            case 'update':
                return <Sparkles className="w-4 h-4" />;
            case 'event':
                return <Calendar className="w-4 h-4" />;
            case 'urgent':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getTypeColorClasses = (type: string) => {
        switch (type) {
            case 'maintenance':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'update':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'event':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'urgent':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPriorityBadge = (priority: string) => {
        const badges = {
            critical: 'bg-red-500 text-white',
            high: 'bg-orange-500 text-white',
            medium: 'bg-yellow-500 text-white',
            low: 'bg-slate-400 text-white'
        };
        return badges[priority as keyof typeof badges] || badges.medium;
    };

    const handleAnnouncementClick = (announcement: Announcement) => {
        if (announcement.link) {
            window.location.href = announcement.link;
        }
        onClose();
    };

    // Sort by priority and date
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder];

        if (priorityDiff !== 0) return priorityDiff;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-slate-800">Announcements</h3>
                        {announcements.length > 0 && (
                            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {announcements.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium text-slate-600 mb-1">No announcements</p>
                        <p className="text-sm text-slate-400">Check back later for updates</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sortedAnnouncements.map(announcement => (
                            <div
                                key={announcement.id}
                                className={`group p-4 transition-all hover:bg-slate-50 ${announcement.link ? 'cursor-pointer' : ''
                                    }`}
                                onClick={() => announcement.link && handleAnnouncementClick(announcement)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getTypeColorClasses(announcement.type)}`}>
                                        {getTypeIcon(announcement.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1 gap-2">
                                            <h4 className="font-medium text-slate-900">
                                                {announcement.title}
                                            </h4>
                                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(announcement.priority)}`}>
                                                {announcement.priority}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-2 line-clamp-3">
                                            {announcement.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">
                                                    {formatTimeAgo(announcement.createdAt)}
                                                </span>
                                                {announcement.targetAudience !== 'all' && (
                                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                        {announcement.targetAudience}
                                                    </span>
                                                )}
                                            </div>

                                            {announcement.link && (
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            )}
                                        </div>

                                        {announcement.endDate && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                <AlertCircle className="w-3 h-3" />
                                                Valid until {new Date(announcement.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
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
                        {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
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