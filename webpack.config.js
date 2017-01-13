var path = require('path'),
	webpack = require('webpack'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	precss = require('precss'),
	autoprefixer = require('autoprefixer');

module.exports = {
	devtool: process.env.WEBPACK_ENV === 'dev' ? 'eval' : 'cheap-module-source-map',
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		path: path.resolve(__dirname, 'build/'),
		filename: 'bundle.js'
	},
	resolve: {
		modulesDirectories: [
			'node_modules'
		]
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel'
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/,
				exclude: /node_modules/,
				loaders: [
					'file?hash=sha512&digest=hex&name=[hash].[ext]',
					'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
				]
			},
			{
				test: /\.(sass|scss|css)$/,
				exclude: /node_modules/,
				loader: ExtractTextPlugin.extract('style?sourceMap', 'css?sourceMap!postcss?pack=cleaner!sass')
			}
		]
	},
	postcss: function() {
		return {
			defaults: [ precss, autoprefixer ],
			cleaner: [autoprefixer({
				browsers: ['last 2 versions']
			})]
		};
	},
	plugins: ([
		new webpack.NoErrorsPlugin(),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.CommonsChunkPlugin('shared.js'),
		new ExtractTextPlugin('./build.css')
	]).concat(process.env.WEBPACK_ENV === 'dev' ? [] : [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			output: { comments: false },
			exclude: [ /\.min\.js$/gi ]
		})
	]),
	stats: { colors: true },
	devServer: {
		port: process.env.PORT || 8080,
		contentBase: './',
		historyApiFallback: true
	}
};
