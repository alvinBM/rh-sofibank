// src/lib/react-query-client.js
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        // queries: {
        //     refetchOnWindowFocus: true,
        //     retry: 2,
        // },
    },
});

export default queryClient;
