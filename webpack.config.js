module.exports = {
    entry: "./build.js",
    output: {
        path: "./build",
        filename: "dd.js"
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                query: {
                    presets: ["react", "es2015"]
                }
            }
        ]
    }
};
