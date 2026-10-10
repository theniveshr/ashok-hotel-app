module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Enable the built-in import.meta polyfill so packages that use
          // import.meta (e.g. @react-native/debugger-frontend) don't crash
          // Metro when building for web.
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
