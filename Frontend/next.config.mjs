/** Keep browser API traffic on the frontend origin so HttpOnly sessions also work in deployment. */
const nextConfig = {
    async rewrites() {
        const backend = (process.env.API_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
        return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
    },
};
export default nextConfig;
