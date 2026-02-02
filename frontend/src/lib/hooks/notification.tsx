import { useState, useEffect, useCallback, useRef } from 'react';
import RequestHandler from '../utilities/RequestHandler';
import { Notification } from "../interface";

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastUnreadCountRef = useRef(0);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await RequestHandler.fetchData('GET', 'notification/get-all');

            if (response.success) {
                const notificationsData = response.notifications.map((notif: any) => ({
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    type: notif.type,
                    read: notif.read,
                    link: notif.link,
                    metadata: notif.metadata,
                    createdAt: notif.createdAt,
                    userId: notif.userId
                }));

                setNotifications(notificationsData);
                const newUnreadCount = notificationsData.filter((n: Notification) => !n.read).length;
                setUnreadCount(newUnreadCount);
                lastUnreadCountRef.current = newUnreadCount;
            } else {
                setError(response.message || 'Failed to fetch notifications');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await RequestHandler.fetchData('GET', 'notification/unread-count');

            if (response.success) {
                const newUnreadCount = response.count;
                if (newUnreadCount !== lastUnreadCountRef.current) {
                    fetchNotifications();
                } else {
                    setUnreadCount(newUnreadCount);
                }

                lastUnreadCountRef.current = newUnreadCount;
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const response = await RequestHandler.fetchData('PUT', `notification/${id}/mark-read`);

            if (response.success) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === id ? { ...notif, read: true } : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                lastUnreadCountRef.current = Math.max(0, lastUnreadCountRef.current - 1);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to mark as read:', err);
            return false;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await RequestHandler.fetchData('POST', 'notification/mark-all-read');

            if (response.success) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, read: true }))
                );
                setUnreadCount(0);
                lastUnreadCountRef.current = 0;
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            return false;
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const response = await RequestHandler.fetchData('DELETE', `notification/${id}`);

            if (response.success) {
                setNotifications(prev => {
                    const updated = prev.filter(notif => notif.id !== id);
                    const updatedCount = updated.filter(n => !n.read).length;
                    setUnreadCount(updatedCount);
                    lastUnreadCountRef.current = updatedCount;
                    return updated;
                });
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to delete notification:', err);
            return false;
        }
    }, []);

    const deleteAllNotifications = useCallback(async () => {
        try {
            const response = await RequestHandler.fetchData('DELETE', 'notification/delete-all');

            if (response.success) {
                setNotifications([]);
                setUnreadCount(0);
                lastUnreadCountRef.current = 0;
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        hasNewNotifications: unreadCount > lastUnreadCountRef.current
    };
};