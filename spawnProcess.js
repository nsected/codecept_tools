const Container = require('codeceptjs').container;
const Codecept = require('codeceptjs').codecept;
const buildCodeceptjsArguments = require("./buildCodeceptjsArguments");
const path = require('path');
const actor = require('codeceptjs').actor;

module.exports = function spawnProcess(test, testsQueue, processQueue, config, isVerbose) {
    // console.log('спавнится отсутствющий тест');
    return new Promise(async (resolve, reject) => {

        if (!test) {
            if (isVerbose) console.log('!!!спавнится отсутствющий тест');
            resolve(true)
        } else {
            try {
                global.actor=actor;
                global.codecept_dir = path.join(process.cwd(), 'tests/publisher3');
                console.log('11111111');
                let opts = {
                    reporter: 'mocha-multi',
                    steps: true,
                    debug: true,
                    verbose: true
                };

                config.isAsync = true;
                let codecept = new Codecept(config, opts);
                console.log(config);
                console.log(opts);
                Container.create(config, opts);
                codecept.bootstrap();
                codecept.loadTests('/Users/d.mustaev/PhpstormProjects/publisher3_tests/tests/publisher3/scenarios/0payouts.js');
                console.log('2222222');

                console.log('33333333333');
                processQueue[test.name] = await codecept.run();
                await console.log(processQueue[test.name]);
                await console.log('(i) ТЕСТ', test.name, 'ЗАВЕРШИЛСЯ УСПЕШНО');
                await resolve(true)

            } catch(err) {
                console.error(err);
                console.log('(i) ТЕСТ', test.name, 'ЗАВЕРШИЛСЯ С ОШИБКОЙ');
                reject({
                    error: new Error(`${test.name} exited with error ${err.name}`),
                    test: test
                })
            }
        }

    })
};