const spawnProcess = require("./spawnProcess");

module.exports = function (testsQueue, processQueue, config, isVerbose) {
    return new Promise((resolve, reject) => {
        let errorsCount = 0;
        handleTestsQueue(testsQueue, processQueue, config, isVerbose);
        function handleTestsQueue(testsQueue, processQueue, config, isVerbose) {
            if (testsQueue === false) resolve(true);

            let testsQueueCount = testsQueue.length;
            let currentQueue = [];
            let threadsCount;
            let inProgressTestsCount = Object.keys(processQueue).length;
            let freeSlots = config.threadsLimit - inProgressTestsCount;

            if (testsQueueCount >= freeSlots) {
                threadsCount = freeSlots
            }
            else {
                threadsCount = testsQueueCount
            }

            if (threadsCount === 0 && testsQueueCount === 0) {
                console.log(`(i) Tests in progress: ${inProgressTestsCount} : ${Object.keys(processQueue)}`);
                if (isVerbose) console.log(`All tests spawned, still in progress ${inProgressTestsCount} tests`);
            }

            if (inProgressTestsCount === 0 && testsQueueCount === 0) {
                if (isVerbose) console.log(`All done`);
                resolve(errorsCount)
            }

            if (isVerbose) {
                console.log('----------------------------------threadsLimit ' + config.threadsLimit);
                console.log('----------------------------------inProgressTestsCount ' + inProgressTestsCount);
                console.log('----------------------------------testsQueueCount ' + testsQueueCount);
                console.log('----------------------------------freeSlots ' + freeSlots);
            }


            for (let i = 0; i < freeSlots; i++) {
                currentQueue.push(
                    testsQueue.splice(0, 1)[0]
                );
            }

            if (isVerbose) {
                console.log('Current queue:');
                console.log(currentQueue);
            }

            let spawnedProcesses = [];

            currentQueue.forEach(test => {
                spawnProcess(test, testsQueue, processQueue, config, isVerbose)
                    .then(() => {
                        if (threadsCount === 0 && testsQueueCount === 0) {
                            if (isVerbose) console.log(`All tests spawned, still in progress ${inProgressTestsCount} tests`);
                            // resolve(true)
                        }
                        else {
                            if (isVerbose) console.log('Spawn more tests');
                            handleTestsQueue(testsQueue, processQueue, config, isVerbose)
                        }

                    })
                    .catch(result => {
                        errorsCount+= 1;
                        if (result.test.testType === 'bootstrap') {
                            console.error('!!!!!!!! login scenario failed. Exiting');
                            process.exit(1)
                        }
                        else {
                            console.error(result.error);
                            if (isVerbose) console.log('Spawn more tests');
                            handleTestsQueue(testsQueue, processQueue, config, isVerbose)
                        }
                    })
            });
        }
    });
};