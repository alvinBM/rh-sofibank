import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUserSession, selectUserToken } from "./slices/userSlice";
import { removeCookie, setCookie } from "../services/cookie";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { signIn, signOut, getCurrentUser } from "../services/authService";
import { supabase } from "../lib/supabase-client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const notify = (message) =>
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
        });

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await getCurrentUser();
                if (response && response.user) {
                    setCookie("token", response.token);
                    dispatch(setUser({ user: response.user, token: response.token }));
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                removeCookie("token");
                dispatch(clearUserSession());
            } else if (event === 'SIGNED_IN' && session) {
                const response = await getCurrentUser();
                if (response && response.user) {
                    setCookie("token", response.token);
                    dispatch(setUser({ user: response.user, token: response.token }));
                }
            } else if (event === 'TOKEN_REFRESHED' && session) {
                setCookie("token", session.access_token);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [dispatch]);

    const login = async (emailOrPhone, password) => {
        try {
            const email = emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@temp.sofibanque.com`;

            const response = await signIn(email, password);

            if (response.status === 200) {
                const { user, token } = response;
                setCookie("token", token);
                dispatch(setUser({ user, token }));
            }

            return response;
        } catch (err) {
            console.error("Erreur login", err);
            const error = {
                status: 401,
                message: err.message || "Identifiants incorrects",
            };
            return error;
        }
    };

    const logout = async () => {
        try {
            await signOut();
            removeCookie("token");
            dispatch(clearUserSession());
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ login, logout, loading }}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
