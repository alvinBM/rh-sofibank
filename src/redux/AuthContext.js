// src/AuthContext.js
import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUserSession, selectUserToken } from "./slices/userSlice";
import axios from "axios";
import Cookies from "js-cookie";
import { removeCookie, setCookie } from "../services/cookie";
import api from "../services/axios";
import qs from "qs";
import { Bounce, toast, ToastContainer } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const token = useSelector(selectUserToken);

    const notify = (message) =>
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
        });

    useEffect(() => {
        async function loadUserFromCookie() {
            // console.log("get user form cookie **** ", token);
            if (token) {
                try {
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                    const { data: response } = await api.get("/user/profile");
                    // console.log("response auth", response);
                    if (response.status == 200 && response.user) {
                        let user_data = {
                            user: response.user,
                            token,
                        };
                        dispatch(setUser(user_data));
                    } else {
                        notify("Votre session a expiré. Veuillez vous reconnecter.");
                        setTimeout(() => {
                            logout();
                        }, 3000);
                    }
                } catch (err) {
                    console.log("Axios error Authprovider", err);
                    notify("Votre session a expiré. Veuillez vous reconnecter.");
                    setTimeout(() => {
                        logout();
                    }, 3000);
                }
            }
        }
        loadUserFromCookie();
    }, [token, dispatch]);

    const login = async (login, password) => {
        const requestBody = {
            login: login,
            password: password,
        };

        try {
            const { data: response } = await api.post("/user/login", qs.stringify(requestBody));

            if (response.status == 200) {
                const { user, token } = response;
                console.log("Response ****** ", user);
                setCookie("token", token);
                api.defaults.headers.Authorization = `Bearer ${token}`;
                dispatch(setUser({ user, token }));
            }
            console.log(response);
            return response;
        } catch (err) {
            console.log("Erreur login", err);
            const error = {
                status: 404,
                message: err.message,
            };
            return error;
        }
    };

    const logout = () => {
        removeCookie("token");
        dispatch(clearUserSession());
    };

    // Intercepter les réponses
    // api.interceptors.response.use(
    //     function (response) {
    //         // Status code 2xx
    //         console.log("Intercepted response *** ", response);
    //         if (response.data.status === 401) {
    //             notify("Votre session a expiré. Veuillez vous reconnecter.");
    //             setTimeout(() => {
    //                 logout();
    //             }, 3000);
    //         }

    //         if (response.data.status === 407) {
    //             notify("Vous n'avez pas les droits nécessaires pour accéder à cette ressource.");
    //             setTimeout(() => {
    //                 // window.location.href = "/dashboard";
    //             }, 3000);
    //         }
    //         return response;
    //     },
    //     function (error) {
    //         // Status code en dehors de 2xx
    //         console.log("Intercepted error *** ", error);

    //         return Promise.reject(error); // Propager l'erreur
    //     }
    // );

    return (
        <AuthContext.Provider value={{ login, logout }}>
            {children}
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" transition={Bounce} />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
