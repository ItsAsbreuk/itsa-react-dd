module.exports = {
    entry: "./app-example.js",
    output: {
        path: "./examples",
        filename: "app.js" // Template based on keys in entry above
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
