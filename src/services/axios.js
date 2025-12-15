import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Créez une instance Axios
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        Accept: "Application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        key: process.env.NEXT_PUBLIC_API_KEY,
        app: process.env.NEXT_PUBLIC_API_CHANNEL,
    },
});

export default api;
