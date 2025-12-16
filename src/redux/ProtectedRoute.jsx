"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { selectUserData, selectUserToken, selectIsAuthenticated } from "./slices/userSlice";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
    const token = useSelector(selectUserToken);
    const user = useSelector(selectUserData);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        setIsChecking(false);

        if (!token || !isAuthenticated) {
            router.push("/auth/login");
        } else if (token && user?.account && user?.account?.status == 4) {
            router.push("/auth/setup?redirect=true");
        }
    }, [token, user, isAuthenticated, loading, router]);

    if (loading || isChecking) {
        return (
            <div className="h-screen w-full flex justify-center align-middle flex-col">
                <Spinner size="lg" aria-label="Loading" />
            </div>
        );
    }

    if (!token || !isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
