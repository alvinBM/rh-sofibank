"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { selectUserData, selectUserToken } from "./slices/userSlice";

const ProtectedRoute = ({ children }) => {
    const token = useSelector(selectUserToken);
    const user = useSelector(selectUserData);
    const router = useRouter();

    useEffect(() => {
        console.log("Account ", user?.account);
        if (!token) {
            router.push("/auth/login");
        } else if (token && user?.account && user?.account?.status == 4) {
            router.push("/auth/setup?redirect=true");
        }
    }, [token, user]);

    if (!token) {
        return (
            <div className="h-screen w-full flex justify-center align-middle flex-col">
                <Spinner size="lg" aria-label="Loading" />
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
