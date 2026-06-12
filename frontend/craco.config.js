// craco.config.js
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

let webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

webpackConfig.devServer = (devServerConfig) => {
  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

// Wrap with visual edits (automatically adds babel plugin, dev server, and overlay in dev mode)
if (isDevServer) {
  try {
    const { withVisualEdits } = require("@emergentbase/visual-edits/craco");
    webpackConfig = withVisualEdits(webpackConfig);

    // React Three Fiber scene files use lowercase JSX elements (mesh, group, ...)
    // that reject the x-* attributes injected by the visual-edits babel plugin.
    // Wrap the plugin so it skips those files entirely.
    const R3F_FILES = /[\\/]src[\\/]components[\\/]gallery[\\/](Room|Exhibit|Player|GalleryExperience)\.jsx?$/;
    const shouldSkipFile = (state) => {
      const f =
        (state && state.filename) ||
        (state && state.file && state.file.opts && state.file.opts.filename) ||
        "";
      return R3F_FILES.test(f);
    };
    const wrapVisitor = (visitor) => {
      const out = {};
      for (const [key, val] of Object.entries(visitor || {})) {
        if (typeof val === "function") {
          out[key] = function (path, state) {
            if (shouldSkipFile(state)) return;
            return val.call(this, path, state);
          };
        } else if (val && typeof val === "object") {
          out[key] = {};
          for (const [phase, fn] of Object.entries(val)) {
            out[key][phase] = function (path, state) {
              if (shouldSkipFile(state)) return;
              return fn.call(this, path, state);
            };
          }
        } else {
          out[key] = val;
        }
      }
      return out;
    };
    try {
      const vePlugin = require("@emergentbase/visual-edits/babel-plugin").default;
      if (webpackConfig.babel && Array.isArray(webpackConfig.babel.plugins)) {
        webpackConfig.babel.plugins = webpackConfig.babel.plugins.map((p) => {
          if (p !== vePlugin) return p;
          return (...args) => {
            const inst = typeof p === "function" ? p(...args) : p;
            return { ...inst, visitor: wrapVisitor(inst.visitor) };
          };
        });
      }
    } catch (_e) {
      // If the babel plugin can't be resolved, leave config untouched.
    }
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('@emergentbase/visual-edits/craco')) {
      console.warn(
        "[visual-edits] @emergentbase/visual-edits not installed — visual editing disabled."
      );
    } else {
      throw err;
    }
  }
}

module.exports = webpackConfig;
