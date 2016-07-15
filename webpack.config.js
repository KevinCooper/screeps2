module.exports = {
    entry: './src/boot/main.ts',
    output: {
        filename: './main.js',
        library: 'main',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.d.ts', '.tsx']
    },
    devtool: 'source-map', // if we want a source map
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
}