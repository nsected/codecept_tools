//todo: Выложить хелперы как пакет npm.

//todo: завернуть проект в модуль NPM
//todo: навернуть классов
//todo: переименовать verbose в debug
//todo: отрефакторить обработку и мерджинг параметров для кодцепта
//todo: объеденить очередь тестов и очередь выполняемых потоков в одну
//todo: обсервить ошибки в консоли браузера и записывать их в отчет
//todo: вынести механизм обмена куками в хук кодцепта
//todo: после завершения тестов выдавать в консоль summary
//todo: поддержка мультибраузерности из асинхронной опции кодцепта
//todo: помечать шаги желтым, если при их выполнении в консоли ошибки
//todo: поддержка асинхронных тестов во вкладках одного инстанса браузера?
//todo: статистика по тестам?
//todo: запись видео?

const program = require('commander');
const path = require("path");
const makeAsyncTestsQueue = require("./makeAsyncTestsQueue");
const makeSyncTestsQueue = require("./makeSyncTestsQueue");
const handleTestsQueue = require("./handleTestsQueue");

let isVerbose;

if (process.argv.length <= 2) {
    console.log(`run test with command run and option --config `);
}

function splitList(values) {
    return values.split(',');
}

program
    .command('run')
    .option('-v, --verbose', 'verbose output')
    .option('-c, --config [file]', 'configuration file to be used')
    .option('-o, --override [value]', 'override provided config options')
    .option('-a, --async', 'run tests asynchronously')
    .option('-p, --params <items>', 'parameters passing to the codecept.js', splitList)
    .action(function (cmd) {
        run(cmd);
    });
program.parse(process.argv);

async function run(cmd) {
    let configPath = cmd.config;
    let overrideArguments = cmd.override;
    let isAsync = cmd.async;
    let codeceptParams = cmd.params;
    isVerbose = cmd.verbose;
    let config = require(path.join(process.cwd(), configPath));
    config.codeceptParams = codeceptParams;
    config.isAsync = isAsync;
    const loginScript = config.loginScript;
    if (!Number.isInteger(config.threadsLimit)) config.threadsLimit = 2;
    let processQueue = {};
    let loginTestQueue;
    let testsQueue;
    process.env.multi = 'spec=- mocha-allure-reporter=-'; //todo: разхардкодить опции моки






    if (isAsync) {
        loginTestQueue = makeAsyncTestsQueue(configPath, overrideArguments, config, 'login');
        testsQueue = makeAsyncTestsQueue(configPath, overrideArguments, config, 'regularTest')
    }
    else {
        loginTestQueue = false;
        testsQueue = makeSyncTestsQueue(configPath, overrideArguments, config);
    }

    await handleTestsQueue(loginTestQueue, processQueue, config, isVerbose);
    await handleTestsQueue(testsQueue, processQueue, config, isVerbose)


}
