import { API_URL } from "./api-url.mjs";

export const nextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: { localPatterns: [{ pathname: "/api/media/**", search: "" }, { pathname: "/images/**", search: "" }] },
  rewrites: async () => [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }],
};
