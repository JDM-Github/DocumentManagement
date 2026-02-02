import { CalendarDays, Megaphone } from "lucide-react";
import { Announcement } from "../../lib/interface";

export function AnnouncementPanel({
    announcements,
    onClose
}: {
    announcements: Announcement[];
    onClose: () => void;
}) {
    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center gap-2">
                    <Megaphone className="text-blue-600" />
                    <h3 className="font-bold text-slate-800">Announcements</h3>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No announcements yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {announcements.map(announcement => (
                            <div key={announcement.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${announcement.priority === 'high' ? 'bg-red-100' :
                                        announcement.priority === 'medium' ? 'bg-amber-100' :
                                            'bg-emerald-100'
                                        }`}>
                                        <Megaphone size={16} className={
                                            announcement.priority === 'high' ? 'text-red-600' :
                                                announcement.priority === 'medium' ? 'text-amber-600' :
                                                    'text-emerald-600'
                                        } />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-slate-800">{announcement.title}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                announcement.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {announcement.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{announcement.message}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <CalendarDays size={12} />
                                            <span>{announcement.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}