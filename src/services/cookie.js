import jsCookie from "js-cookie";

export const setCookie = (key, value, options = {}) => {
    if (typeof window !== "undefined") {
        jsCookie.set(key, value, { expires: 30, path: "/", ...options });
    }
};

export const removeCookie = (key) => {
    if (typeof window !== "undefined") {
        jsCookie.remove(key);
    }
};

export const getCookieFromBrowser = (key) => {
    if (typeof window !== "undefined") {
        return jsCookie.get(key);
    }
    return undefined;
};

export const getCookieFromServer = (key, req) => {
    if (!req || !req.headers || !req.headers.cookie) {
        return undefined;
    }

    const rawCookie = req.headers.cookie.split(";").find((c) => c.trim().startsWith(`${key}=`));
    if (!rawCookie) {
        return undefined;
    }

    return rawCookie.split("=")[1];
};
