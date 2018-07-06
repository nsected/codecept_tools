const path = require("path");

module.exports = function makeAsyncTestsQueue(arguments) {
    let configPath = arguments.configPath;
    let overrideArguments = arguments.overrideArguments;
    let testsList = arguments.testsList;
    let testType = arguments.testType;

    if (!testsList) throw new Error('Must provide test scripts');

    let asyncTestsQueue = [];
    for (let i = 0; i < testsList.length; i++) {
        asyncTestsQueue[i] = {
            name: path.basename(testsList[i]),
            status: 'waiting',
            overrideArguments: overrideArguments,
            configDir: path.dirname(configPath),
            configPath: configPath,
            specificTestFile: testsList[i],
            testType: testType
        };
    }
    return asyncTestsQueue;
};