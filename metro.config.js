// metro.config.js
// ---------------------------------------------------------
// Configuração do Metro (bundler do React Native).
// - Usa as defaults do Expo.
// - Define alias '@' -> 'src' para resolver caminhos nos imports.
// ---------------------------------------------------------

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Alias para manter consistência com Babel e TS
config.resolver.alias = {
  '@': path.resolve(projectRoot, 'src'),
};

module.exports = config;
