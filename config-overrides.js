const applyDevServerPolyfill = (devServerConfig) => {
  if (!devServerConfig) return devServerConfig;

  const originalSetupMiddlewares = devServerConfig.setupMiddlewares;
  const onBefore = devServerConfig.onBeforeSetupMiddleware;
  const onAfter = devServerConfig.onAfterSetupMiddleware;

  if (!originalSetupMiddlewares && (onBefore || onAfter)) {
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (typeof onBefore === "function") {
        onBefore(devServer);
      }

      const resolved = Array.isArray(middlewares) ? middlewares : [];

      if (typeof onAfter === "function") {
        onAfter(devServer);
      }

      return resolved;
    };
  } else if (typeof originalSetupMiddlewares === "function") {
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      const resolved = originalSetupMiddlewares(middlewares, devServer);

      if (typeof onBefore === "function") {
        onBefore(devServer);
      }
      if (typeof onAfter === "function") {
        onAfter(devServer);
      }

      return resolved;
    };
  }

  delete devServerConfig.onBeforeSetupMiddleware;
  delete devServerConfig.onAfterSetupMiddleware;

  return devServerConfig;
};

module.exports = {
  webpack: (config) => config,
  devServer: (configFunction) => {
    if (typeof configFunction !== "function") {
      return configFunction;
    }

    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      return applyDevServerPolyfill(config);
    };
  },
};
