import { nextui } from "@nextui-org/react";
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [
        nextui({
            themes: {
                light: {
                    colors: {
                        danger: {
                            DEFAULT: "#ed1c24",
                            background: "#ed1c24",
                        },
                        focus: "#ed1c24",
                    },
                },
                dark: {
                    colors: {
                        danger: {
                            DEFAULT: "#ed1c24",
                            foreground: "#000000",
                            background: "#ed1c24",
                        },
                        focus: "#ed1c24",
                        background: "#111111",
                    },
                },
            },
        }),
    ],
};
