"use client";

import queryClient from "@/src/lib/react-query-client";
import { AuthProvider } from "@/src/redux/AuthContext";
import store from "@/src/redux/store";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider } from "react-redux";

export function Providers({ children }) {
    return (
        <Provider store={store}>
            <AuthProvider>
                <NextUIProvider>
                    <NextThemesProvider attribute="class" defaultTheme="light">
                        <QueryClientProvider client={queryClient}>
                            <div className="text-sm">{children}</div>
                            {/* <ReactQueryDevtools /> */}
                        </QueryClientProvider>
                    </NextThemesProvider>
                </NextUIProvider>
            </AuthProvider>
        </Provider>
    );
}
