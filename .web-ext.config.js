module.exports = {
    build: {
        overrideDest: true,
        ignoreFiles: [
            "node_modules",
            "web-ext-config.js",
            "package.json",
            "package-lock.json",
            "README.md"
        ]
    }
}