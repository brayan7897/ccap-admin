import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundles only the files needed at runtime → lean Docker image
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      // Backend-generated action URLs → internal app routes
      {
        source: "/admin/users/pending",
        destination: "/users?access=PENDING",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
