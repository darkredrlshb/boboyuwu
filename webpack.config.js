const path = require('path')
const merge = require('webpack-merge')

const baseConfig = {
  entry: {
    pageintro: './index.js'
  },
  context: path.join(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: 'PageIntro',
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-proposal-object-rest-spread"]
        }
      }
    ]
  },
  externals: {
    jquery: 'jQuery'
  }
}

module.exports = [
  merge(baseConfig, {
    output: { filename: '[name].common.js', libraryTarget: 'umd' },
    optimization: { minimize: false }
  }),
  merge(baseConfig, {
    output: { filename: '[name].js' },
    optimization: { minimize: false }
  }),
  merge(baseConfig, { output: { filename: '[name].min.js' } })
]
