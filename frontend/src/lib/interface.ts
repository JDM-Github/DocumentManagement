
export interface NavItem {
    label: string;
    icon?: React.ComponentType<any>;
    hideInMyself?: boolean;
    showOnlyToSelf?: boolean;
    children?: NavItem[];
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'document' | 'request';
    read: boolean;
    metadata: Record<string, any>;
    link?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    date: string;
    priority: "low" | "medium" | "high";
}

export const sampleAnnouncements: Announcement[] = [
    {
        id: "1",
        title: "System Upgrade",
        message: "We're upgrading our servers for better performance.",
        date: "Dec 15, 2024",
        priority: "high"
    }
];