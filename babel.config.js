module.exports = function(api) {
  api.cache(true);
  const presets = [
    '@babel/preset-env',
    // '@babel/react',
    '@babel/preset-flow'
  ];
  const plugins = [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
  ];

  return {
    presets,
    plugins
  };
};