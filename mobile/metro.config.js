const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'db' and 'mp3' to assetExts so Metro bundles SQLite database and audio recitation files
if (!config.resolver.assetExts.includes('db')) {
  config.resolver.assetExts.push('db');
}
if (!config.resolver.assetExts.includes('mp3')) {
  config.resolver.assetExts.push('mp3');
}

module.exports = config;
