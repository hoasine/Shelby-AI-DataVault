import withPWAInit from "@ducanh2912/next-pwa";

// PWA caching caused production white-screens after deploys (stale chunks).
// Keep the plugin installed but disabled until we need offline support again.
const withPWA = withPWAInit({
  disable: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: export removed — project uses server-side API routes for Shelby integration.

  // Prevent webpack from bundling the Shelby SDK on the server side.
  // clay.wasm is loaded via `new URL("./clay.wasm", import.meta.url)` inside
  // @shelby-protocol/clay-codes. When webpack bundles it, the .wasm file is
  // not included in the serverless function output, causing WASM init to fail
  // on Vercel. Marking it external lets Node.js load it natively from node_modules.
  experimental: {
    serverComponentsExternalPackages: [
      "@shelby-protocol/sdk",
      "@shelby-protocol/clay-codes",
    ],
    // Vercel's file tracer doesn't automatically follow .wasm references.
    // Explicitly include clay.wasm so it's bundled into the upload serverless function.
    outputFileTracingIncludes: {
      "/api/datasets/upload": [
        "./node_modules/@shelby-protocol/clay-codes/dist/*.wasm",
      ],
    },
  },

  webpack(config) {
    // Required for @shelby-protocol/clay-codes which loads clay.wasm via
    // `new URL("./clay.wasm", import.meta.url)`. Without asyncWebAssembly,
    // webpack never registers __webpack_require__.U (the WASM chunk loader),
    // causing a "is not a constructor" runtime error in the browser.
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default withPWA(nextConfig);
