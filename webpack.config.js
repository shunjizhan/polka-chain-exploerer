const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

/* --------------- options --------------- */
const devOptions = {
  mode: 'development',
  devtool: 'source-map',
  watchOptions: {
    aggregateTimeout: 0, // debounce time for re-compile
    ignored: ['node_modules/**'],
  },
};

const prodOptions = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: true,
    })],
  },
};
const options = isProd ? prodOptions : devOptions;

/* --------------- plugins --------------- */
const devPlugins = [];
const prodPlugins = [
  // new BundleAnalyzerPlugin(),
  new MiniCssExtractPlugin(),
];
const plugins = [
  new CleanTerminalPlugin(),
  new HtmlWebPackPlugin({
    template: path.resolve(__dirname, './public/index.html'),
    favicon: path.resolve(__dirname, './public/pokeball.ico'),
    filename: 'index.html',
  }),
  ...(isProd ? prodPlugins : devPlugins),
];

module.exports = {
  entry: path.resolve(__dirname, './src/index.tsx'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'polkadot-scanner.bundle.js',
  },
  resolve: {
    // our code can resolve 'xxx' instead of writing 'xxx.jsx'
    extensions: ['*', '.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      crypto: false,
    },
  },
  module: {
    // For every file that match regex in 'test', webpack pipes the code through to loaders
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',   // creates style nodes from JS strings
          'css-loader',     // translates CSS into CommonJS
          'sass-loader',    // compiles Sass to CSS, using Node Sass by default
        ],
      },
    ],
  },
  plugins,
  ...options,
};
