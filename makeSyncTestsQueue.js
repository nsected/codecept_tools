module.exports = function makeSyncTestsQueue(configPath, overrideArguments, config) {
    return [{
        name: config.name,
        status: 'waiting',
        overrideArguments: overrideArguments,
        configPath: configPath,
        specificTestFile: false
    }]
}