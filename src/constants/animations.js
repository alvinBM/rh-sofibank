export const modalDefaulMotionProps = {
    variants: {
        enter: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: "easeIn",
            },
        },
    },
};
