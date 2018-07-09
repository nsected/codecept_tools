const path = require("path");

module.exports = function makeAsyncTestsQueue(arguments) {
    let configPath = arguments.configPath;
    let testsList = arguments.testsList;

    if (!testsList) throw new Error('Must provide test scripts');

    let asyncTestsQueue = [];
    for (let i = 0; i < testsList.length; i++) {
        asyncTestsQueue[i] = {
            name: path.basename(testsList[i]),
            status: 'waiting',
            configDir: path.dirname(configPath),
            configPath: configPath,
            exclusiveTestFile: testsList[i],
        };
    }
    return asyncTestsQueue;
};