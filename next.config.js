/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
    allowedDevOrigins: [
        '192.168.178.139',
        '192.168.178.0/24', // Allow entire local subnet
    ],
}

module.exports = nextConfig
