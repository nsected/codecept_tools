#!/usr/bin/env node

//todo: !!!функциональные доработки
//todo: починить процедуру загрузки куков при использовании опции оверрайда
//todo: сделать таймаут для тестов

//todo: !!!рефактор
//todo: навернуть классов
//todo: переименовать verbose в debug
//todo: отрефакторить обработку и мерджинг параметров для кодцепта
//todo: объеденить очередь тестов и очередь выполняемых потоков в одну
//todo: вынести механизм обмена куками в хук кодцепта

//todo: ???
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
    const glob = require("glob");
    let configPath = cmd.config;
    let overrideArguments = cmd.override;
    let isAsync = cmd.async;
    let codeceptParams = cmd.params;
    isVerbose = cmd.verbose;
    let config = require(path.join(process.cwd(), configPath));
    config.codeceptParams = codeceptParams;
    config.isAsync = isAsync;
    const loginScript = config.login;
    if (!Number.isInteger(config.threadsLimit)) config.threadsLimit = 2;
    let processQueue = {};
    let bootstrapQueue;
    let bootstrapList = [];
    if (!!config.login)  bootstrapList.push(path.join(__dirname, './storeLoginCookies.js'));
    if (!!config.suiteBootstrap) bootstrapList.push(path.join(process.cwd(), path.dirname(configPath), config.suiteBootstrap));
    let testsQueue;
    let testsCount;
    process.env.multi = 'spec=- mocha-allure-reporter=-'; //todo: разхардкодить опции моки
    let testsList = glob.sync(path.join(process.cwd(), path.dirname(configPath), config.tests), {});

    if (isAsync) {
        bootstrapQueue = makeAsyncTestsQueue({
            configPath: configPath,
            overrideArguments: overrideArguments,
            testsList: bootstrapList,
            testType: 'bootstrap'
        });

        testsQueue = makeAsyncTestsQueue({
            configPath: configPath,
            overrideArguments: overrideArguments,
            testsList: testsList,
            testType: 'regular'
        });
        testsCount = testsQueue.length;
        console.log(`(i) Loaded ${testsQueue.length} tests`)
    }
    else {
        bootstrapQueue = false;
        testsQueue = makeSyncTestsQueue(configPath, overrideArguments, config);
        testsCount = testsQueue.length;
        console.log(`(i) Loaded ${testsQueue.length} tests`)
    }

    await handleTestsQueue(bootstrapQueue, processQueue, config, isVerbose);
    console.log(`(i) Login done. Running tests.`);
    let errorsCount = 0;
    errorsCount = await handleTestsQueue(testsQueue, processQueue, config, isVerbose);
    console.log(`(i) All tests done`);
    console.log(`(i) Tests count: ${testsCount}`);
    console.log(`(i) Success tests: ${testsCount - errorsCount}`);
    console.log(`(i) Error tests: ${errorsCount}`);
    process.exit(errorsCount);
}
