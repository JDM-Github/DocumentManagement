import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import RequestHandler from '../utilities/RequestHandler';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    departmentId: string;
    departmentName: string;
    departmentCode: string | null;
    isHead: boolean;
    employeeNo: string | null;
    firstName: string;
    lastName: string;
    isActive: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('authToken');
            if (storedUser && storedToken) {
                try {
                    // // Parse stored user
                    // const parsedUser = JSON.parse(storedUser);
                    const response = await RequestHandler.fetchData(
                        'POST',
                        'auth/verify',
                        { token: storedToken }
                    );
                    if (response.success && response.user) {
                        setUser(response.user);
                    } else {
                        localStorage.removeItem('user');
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    console.error('Failed to verify session:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('authToken');
                }
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await RequestHandler.fetchData(
                'POST',
                'auth/login',
                { email, password }
            );

            if (response.success && response.user && response.token) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('authToken', response.token);

                localStorage.removeItem("targetMyself");
                localStorage.removeItem("currentPage");

                return { success: true };
            } else {
                return {
                    success: false,
                    error: response.message || 'Invalid email or password'
                };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'An error occurred during login'
            };
        }
    };

    const logout = async () => {
        try {
            await RequestHandler.fetchData('POST', 'auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentPage');
            localStorage.removeItem('targetMyself');
        }
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setUser(null);
            return;
        }
        try {
            const response = await RequestHandler.fetchData(
                'POST',
                'auth/verify',
                { token }
            );

            if (response.success && response.user) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
            } else {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};