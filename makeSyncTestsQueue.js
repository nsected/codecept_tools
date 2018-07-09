const path = require("path");

module.exports = function makeSyncTestsQueue(configPath, config) {
    return [{
        name: config.name,
        status: 'waiting',
        configDir: path.dirname(configPath),
        configPath: configPath,
        exclusiveTestFile: false,
    }]
};