module.exports = function(api) {
  api.cache(true);
  const presets = [
    '@babel/preset-env',
    // '@babel/react',
    '@babel/preset-flow'
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ];

  return {
    presets,
    plugins
  };
};