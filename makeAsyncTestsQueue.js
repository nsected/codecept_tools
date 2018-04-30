const path = require("path");
const glob = require("glob");

module.exports = function makeAsyncTestsQueue(configPath, overrideArguments, config, testType) {
    let asyncTestsQueue = [];
    let testsList;
    if (testType === 'login') {
        if (!config.loginScript) {
            console.log('you not provide login script');
            return false
        }
        else {
            testsList = ['./codecept_tools/loginWithSpecifiedScenario.js'];
        }
    }
    else {
        if (!config.tests) throw new Error('must provide test scripts');
        testsList = glob.sync(config.tests, {});
    }

    for (let i = 0; i < testsList.length; i++) {
        asyncTestsQueue[i] = {
            name: path.basename(testsList[i]),
            status: 'waiting',
            overrideArguments: overrideArguments,
            configPath: configPath,
            specificTestFile: testsList[i],
            testType: testType
        };
    }
    return asyncTestsQueue;
}