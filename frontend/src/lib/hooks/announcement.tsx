import { useState, useEffect, useCallback } from 'react';
import RequestHandler from '../utilities/RequestHandler';
import { Announcement } from "../interface";

export const useAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await RequestHandler.fetchData('GET', 'announcement/get-all');

            if (response.success) {
                const announcementsData = response.announcements.map((announce: any) => ({
                    id: announce.id,
                    title: announce.title,
                    message: announce.message,
                    type: announce.type,
                    priority: announce.priority,
                    isActive: announce.isActive,
                    startDate: announce.startDate,
                    endDate: announce.endDate,
                    targetAudience: announce.targetAudience,
                    link: announce.link,
                    metadata: announce.metadata,
                    authorId: announce.authorId,
                    createdAt: announce.createdAt
                }));

                const activeAnnouncements = announcementsData.filter((announce: Announcement) => {
                    if (!announce.isActive) return false;

                    const now = new Date();
                    if (announce.startDate && new Date(announce.startDate) > now) return false;
                    if (announce.endDate && new Date(announce.endDate) < now) return false;

                    return true;
                });

                setAnnouncements(activeAnnouncements);
            } else {
                setError(response.message || 'Failed to fetch announcements');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();

        const interval = setInterval(() => {
            fetchAnnouncements();
        }, 300000);

        return () => clearInterval(interval);
    }, [fetchAnnouncements]);

    return {
        announcements,
        loading,
        error,
        fetchAnnouncements
    };
};