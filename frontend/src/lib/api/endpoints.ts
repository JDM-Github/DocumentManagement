
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: 'auth/login',
        LOGOUT: 'auth/logout',
        VERIFY: 'auth/verify',
    },

    USERS: {
        GET_ALL: 'users/get-all',
        GET_BY_ID: (id: string) => `users/get/${id}`,
        CREATE: 'users/create',
        UPDATE: (id: string) => `users/update/${id}`,
        DELETE: (id: string) => `users/delete/${id}`,
        CHANGE_PASSWORD: (id: string) => `users/change-password/${id}`,
    },

    DEPARTMENTS: {
        GET_ALL: 'departments/get-all',
        GET_BY_ID: (id: string) => `departments/get/${id}`,
    },

    REQUESTS: {
        GET_ALL: 'requests/get-all',
        GET_BY_ID: (id: string) => `requests/get/${id}`,
        CREATE: 'requests/create',
        UPDATE: (id: string) => `requests/update/${id}`,
    },
};
