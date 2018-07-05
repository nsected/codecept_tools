const path = require("path");
const buildCodeceptjsArguments = require("./buildCodeceptjsArguments");
const {spawn} = require('child_process');

module.exports = function spawnProcess(test, testsQueue, processQueue, config, isVerbose) {
    if (!test) {
        return  new Promise((resolve, reject) => {
            if (isVerbose) console.log('!!!спавнится отсутствющий тест');
            resolve(true)
        })
    }
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
                cwd: path.join(process.cwd(), test.configDir),
                env: process.env
            }
        );
        console.log('(i) ТЕСТ', test.name, 'ЗАПУСТИЛСЯ');
        if (isVerbose) {
            console.log('-ИН ТЕСТ. ЭТОТ ТЕСТ ЗАСПАВНЕН');
            console.log("multi='spec=- mocha-allure-reporter=-'" + processQueue[test.name].spawnargs.join(' '));
        }

        processQueue[test.name].stdout.on('data', (data) => {
            console.log(`[${test.name}]: ${data}`);
        });

        processQueue[test.name].stderr.on('data', (data) => {
            console.error(`[${test.name}]: ${data}`);
        });

        processQueue[test.name].on('close', (code) => {

            if (isVerbose) console.log(`${test.name} exited with code ${code}`);
            delete processQueue[test.name];
            if (code === 0) {
                console.log('(i) ТЕСТ', test.name, 'ЗАВЕРШИЛСЯ УСПЕШНО');
                resolve(true)
            }
            else {
                console.log('(i) ТЕСТ', test.name, 'ЗАВЕРШИЛСЯ С ОШИБКОЙ');
                reject({
                    error: new Error(`${test.name} exited with code ${code}`),
                    test: test
                })
            }
        });
    })
};