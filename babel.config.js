// babel.config.js
// ---------------------------------------------------------
// Configuração do Babel para o projeto Expo/React Native.
// ---------------------------------------------------------

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'], // ← ajustado: combina com o baseUrl do tsconfig
          alias: {
            '@': './src', // agora o alias "@" aponta corretamente pra /src
          },
          extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.json',
          ],
        },
      ],

      // ⚠️ O plugin do Reanimated precisa SEMPRE ser o último
      'react-native-reanimated/plugin',
    ],
  };
};
