const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle `.tflite` model files from `require(...)`.
config.resolver.assetExts = config.resolver.assetExts ?? [];
if (!config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

// Windows: avoid Watchman failures and use polling for file watching
config.watcher = {
  ...config.watcher,
  useWatchman: false,
  healthCheck: {
    ...config.watcher?.healthCheck,
    enabled: false,
  },
};

module.exports = config;
