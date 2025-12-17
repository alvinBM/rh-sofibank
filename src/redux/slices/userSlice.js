import { getCookieFromBrowser, removeCookie, setCookie } from "@/src/services/cookie";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData: null,
    isAuthenticated: !!getCookieFromBrowser("token"),
    token: getCookieFromBrowser("token") || null,
    currentPage: "Tabelau de bord",
    features: [],
    permissions: [],
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            const user = action.payload.user;
            state.userData = action.payload.user;
            state.isAuthenticated = true;
            state.token = action.payload.token;

            // Extraire features et permissions sans doublons
            const features = new Set();
            const permissions = new Set();

            if (user.main_roles && Array.isArray(user.main_roles)) {
                user.main_roles.forEach((role) => {
                    if (role.main_permissions && Array.isArray(role.main_permissions)) {
                        role.main_permissions.forEach((permission) => {
                            if (permission.feature) features.add(permission.feature);
                            if (permission.permission_name) permissions.add(permission.permission_name);
                            if (permission.code) permissions.add(permission.code);
                            if (permission.name) permissions.add(permission.name);
                        });
                    }
                });
            }

            state.features = Array.from(features);
            state.permissions = Array.from(permissions);

            setCookie("token", action.payload.token);
        },
        clearUserSession(state) {
            state.userData = null;
            state.isAuthenticated = false;
            state.token = null;
            state.features = [];
            state.permissions = [];
            removeCookie("token");
        },
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
        setUserData(state, action) {
            state.userData = action.payload;
        },
    },
});

export const { setUser, clearUserSession, setCurrentPage, setUserData } = userSlice.actions;

// Selectors
export const selectUserData = (state) => state.user.userData;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserToken = (state) => state.user.token;
export const selectCurrentPage = (state) => state.user.currentPage;
export const selectUserFeatures = (state) => state.user.features;
export const selectUserPermissions = (state) => state.user.permissions;

export default userSlice.reducer;
