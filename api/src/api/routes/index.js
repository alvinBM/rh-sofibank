import express from "express";
const router = express.Router();

// Import route modules
import authRoutes from "./authRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

// Mount routes
router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/leave", leaveRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);

// Health check route
router.get("/health", (req, res) => {
    res.status(200).json({
        status: 200,
        message: "API is running",
        timestamp: new Date().toISOString(),
    });
});

// Root route
router.get("/", (req, res) => {
    res.status(200).json({
        endpoints: {
            auth: "/api/auth",
            employees: "/api/employees",
            leave: "/api/leave",
            attendance: "/api/attendance",
            settings: "/api/settings",
            dashboard: "/api/dashboard",
            attendance: "/api/attendance",
            settings: "/api/settings",
        },
    });
});

export default router;
