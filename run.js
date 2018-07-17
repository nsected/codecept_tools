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
const merge = require('deepmerge');
const glob = require("glob");

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
    let isVerbose = cmd.verbose;
    let configPath = cmd.config;
    cmd.override = cmd.override | '{}';
    let overrideConfig = JSON.parse(cmd.override);
    let config = require(path.join(process.cwd(), configPath));
    config = merge(config, overrideConfig);
    if (!cmd.params) cmd.params = [];
    config.codeceptParams = cmd.params;
    config.isAsync = cmd.async;
    config.isVerbose = cmd.verbose;
    if (!Number.isInteger(config.threadsLimit)) config.threadsLimit = 1;
    let processQueue = {};
    let bootstrapQueue;
    let bootstrap = [];
    if (!!config.login) bootstrap.push(path.join(__dirname, './storeLoginCookies.js'));
    let testsQueue;
    let testsCount;
    process.env.multi = 'spec=- mocha-allure-reporter=-'; //todo: разхардкодить опции моки
    let testsList = glob.sync(path.join(process.cwd(), path.dirname(configPath), config.tests), {});

    if (config.isAsync) {
        bootstrapQueue = makeAsyncTestsQueue({
            configPath: configPath,
            testsList: bootstrap
        });
        testsQueue = makeAsyncTestsQueue({
            configPath: configPath,
            testsList: testsList
        });
        testsCount = testsQueue.length;
        console.log(`(i) Loaded ${testsQueue.length} tests`)
    }
    else {
        bootstrapQueue = false;
        testsQueue = makeSyncTestsQueue(configPath, config);
        testsCount = testsQueue.length;
        console.log(`(i) Loaded ${testsQueue.length} tests`)
    }

    await handleTestsQueue(bootstrapQueue, processQueue, config, isVerbose);
    console.log(`(i) Preparations done. Running tests.`);
    let errorsCount = 0;
    errorsCount = await handleTestsQueue(testsQueue, processQueue, config, isVerbose);
    console.log(`(i) All tests done`);
    console.log(`(i) Tests count: ${testsCount}`);
    console.log(`(i) Success tests: ${testsCount - errorsCount}`);
    console.log(`(i) Error tests: ${errorsCount}`);
    process.exit(errorsCount);
}
