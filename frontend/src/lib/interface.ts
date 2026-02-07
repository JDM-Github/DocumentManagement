
export interface NavItem {
    label: string;
    icon?: React.ComponentType<any>;
    hideInMyself?: boolean;
    showOnlyToSelf?: boolean;
    showOnlyToHigherup?: boolean;
    isShownToDeanPresident?: boolean;
    hideToHead?: boolean;
    isShownToMISD?: boolean;
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
    type: 'general' | 'maintenance' | 'update' | 'event' | 'urgent';
    priority: 'low' | 'medium' | 'high' | 'critical';
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    targetAudience: 'all' | 'students' | 'faculty' | 'staff' | 'admins';
    link: string | null;
    metadata: Record<string, any>;
    authorId: string;
    createdAt: string;
}
