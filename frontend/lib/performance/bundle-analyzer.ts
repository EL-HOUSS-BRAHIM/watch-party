import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"

export const bundleAnalyzerConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        }),
      )
    }
    return config
  },
}
