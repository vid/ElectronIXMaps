const path = require('path');

module.exports = {
  target: 'electron-renderer',
  entry: {
    main: './main.js',
  },
  output: {
    path: path.resolve('./build'),
    filename: '[name].js'
  },
  node: {
    __dirname: true
  },
  externals: [{
    'electron-reload': 'require(\'electron-reload\')'
  }],
  resolve: {
    modules: [
      path.resolve('./node_modules')
    ]
  }
};

