/**
 * Babel Configuration for NativeWind v4 + Expo SDK 54
 * Required for Tailwind CSS support in React Native
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // Required for react-native-reanimated - MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
