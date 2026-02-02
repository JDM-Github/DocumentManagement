import { CalendarDays, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function DateTimeDisplay() {
    const [currentTime, setCurrentTime] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-PH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const dateStr = now.toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            setCurrentTime(timeStr);
            setCurrentDate(dateStr);
        };
        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
            <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white">{currentDate}</span>
            </div>
            <div className="h-4 w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white tracking-wider">{currentTime}</span>
            </div>
        </div>
    );
}