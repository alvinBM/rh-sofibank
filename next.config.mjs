/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["nextui.org", "gotabeat-web.herokuapp.com", "lh3.googleusercontent.com", "pbs.twimg.com", "s.gravatar.com", "nextuipro.nyc3.cdn.digitaloceanspaces.com", "gstockapp.s3.us-east-2.amazonaws.com"], //to be replaced
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

export default nextConfig;
