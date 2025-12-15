"use client";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectUserData, selectUserToken } from "./slices/userSlice";

const PublicRoute = ({ children }) => {
    const token = useSelector(selectUserToken);
    const userData = useSelector(selectUserData);
    const router = useRouter();

    useEffect(() => {
        if (token && userData?.account && userData?.account.status == 1) {
            router.push("/dashboard");
        } else if (token && userData?.account && userData?.account.status == 4) {
            router.push("/auth/setup?redirect=true");
        }
    }, [token]);

    // if (!token) {
    //     return (
    //         <div>
    //             <p>Loading...</p>
    //         </div>
    //     );
    // }

    return children;
};

export default PublicRoute;
