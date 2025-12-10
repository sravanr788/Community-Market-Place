
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { storeUserSession, getUserSession, clearUserSession } from '../utils/session';
import { navigate } from 'expo-router/build/global-state/routing';

const AuthContext = createContext<any>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            const sessionUser = await getUserSession();
            if (sessionUser) {
                console.log('User session loaded', sessionUser);
                setUser(sessionUser);
                setLoading(false);
            }
        };
        loadSession();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                storeUserSession(user);
                setUser(user);
            } else {
                clearUserSession();
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            await clearUserSession();
        } catch (e) {
            console.error(e);
        }
    };

    const value = {
        user,
        loading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
