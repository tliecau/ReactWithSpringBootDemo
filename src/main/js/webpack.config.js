var path = require('path');

module.exports = {
    entry: './app.js',
    devtool: 'source-map',
    output: {
        path: __dirname,
        filename: './../resources/static/built/bundle.js'
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};