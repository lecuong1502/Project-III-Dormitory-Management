import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore user from localStorage then refresh from server
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Refresh user data from server to get latest current_contract etc.
            authService.getMe()
                .then(res => {
                    const { account, student } = res.data.data;
                    const fresh = { ...account, student };
                    localStorage.setItem('user', JSON.stringify(fresh));
                    setUser(fresh);
                })
                .catch(() => {
                    // Token invalid — clear
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updated) => {
        const merged = { ...user, ...updated };
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
    };

    // Manually refresh user data from server (e.g. after room assignment)
    const refreshUser = async () => {
        try {
            const res = await authService.getMe();
            const { account, student } = res.data.data;
            const fresh = { ...account, student };
            localStorage.setItem('user', JSON.stringify(fresh));
            setUser(fresh);
        } catch (_) { }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);