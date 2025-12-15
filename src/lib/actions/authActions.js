"use server"
// import { signIn, signOut } from "../../../auth";

export const authenticate = async (formData) => {
    const { username, password } = Object.fromEntries(formData);
    try {
        await signIn("credentials", { username, password });
    } catch (err) {
        console.log("Error from authenticate Action", err);
        throw err;
    }
};

export const logout = async () => {
    await signOut();
}
