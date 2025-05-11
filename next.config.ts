import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	external: ["libsql"]
};

export default nextConfig;
