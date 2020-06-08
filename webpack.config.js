const path = require('path');

const config = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  entry: path.join(__dirname, '/src/index.js'),
  output: {
    filename: 'index.js',
    path: __dirname,
    library: 'AnnotatorBase',
    libraryTarget: 'umd',
  },
};

module.exports = [
  config,
];
