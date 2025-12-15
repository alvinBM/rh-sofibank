// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/userSlice";

const store = configureStore({
    reducer: {
        user: authReducer,
    },
});

export default store;
