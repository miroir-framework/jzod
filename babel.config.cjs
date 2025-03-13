module.exports = api => {
  const isTest = api.env('test');
  // You can use isTest to determine what presets and plugins to use.
  console.log('########################################################')
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          corejs: "2",
          targets: { node: "current" },
        },
      ],
    ],
    env: {
      test: {
        plugins: [
          "@babel/plugin-transform-modules-commonjs",
          function () {
            return {
              visitor: {
                MetaProperty(path) {
                  path.replaceWithSourceString("process.env");
                  // if (path.node.source.value === 'uuid') {
                  //   path.node.source.value = 'uuid';
                  // }
                },
              },
            };
          },
        ],
      },
    },
  };
}
