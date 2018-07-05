const path = require("path");

module.exports = function makeSyncTestsQueue(configPath, overrideArguments, config) {
    return [{
        name: config.name,
        status: 'waiting',
        configDir: path.dirname(configPath),
        overrideArguments: overrideArguments,
        configPath: configPath,
        specificTestFile: false
    }]
};