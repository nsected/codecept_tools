const buildCodeceptjsArguments = require("./buildCodeceptjsArguments");
const {spawn} = require('child_process');

module.exports = function spawnProcess(test, testsQueue, processQueue, config, isVerbose) {
    let commandLineArguments = buildCodeceptjsArguments(
        test.overrideArguments,
        test.configPath,
        test.specificTestFile,
        config
    );

    return new Promise((resolve, reject) => {
        processQueue[test.name] = spawn(
            `npx`,
            commandLineArguments,
            {
                cwd: process.cwd(),
                env: process.env
            }
        );

        if (isVerbose) {
            console.log("multi='spec=- mocha-allure-reporter=-'" + processQueue[test.name].spawnargs.join(' '));
        }

        processQueue[test.name].stdout.on('data', (data) => {
            console.log(`[${test.name}]: ${data}`);
        });

        processQueue[test.name].stderr.on('data', (data) => {
            console.error(`[${test.name}]: ${data}`);
        });

        processQueue[test.name].on('close', (code) => {
            console.log(`${test.name} exited with code ${code}`);
            delete processQueue[test.name];
            if (code === 0) {
                resolve(true)
            }
            else {
                reject({
                    error: new Error(`${test.name} exited with code ${code}`),
                    test: test
                })
            }
        });
    })
}