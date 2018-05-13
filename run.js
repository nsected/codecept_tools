#!/usr/bin/env node

//todo: !!!оптимизация скорости тестов
//todo: реализовать содание пула сессий до тестов, и использовать его, что бы не перезапускать браузер
//todo: запуск тестов с существующей сессией браузера
//todo: нужна обработка упавших сессий


//todo: !!!функциональные доработки
//todo: обсервить ошибки в консоли браузера и записывать их в отчет
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
    let testsCount;
    process.env.multi = 'spec=- mocha-allure-reporter=-'; //todo: разхардкодить опции моки






    if (isAsync) {
        loginTestQueue = makeAsyncTestsQueue(configPath, overrideArguments, config, 'login');
        testsQueue = makeAsyncTestsQueue(configPath, overrideArguments, config, 'regularTest');
        testsCount = testsQueue.length;
        console.log(`(i) Загружено тестов: ${testsCount}`)

    }
    else {
        loginTestQueue = false;
        testsQueue = makeSyncTestsQueue(configPath, overrideArguments, config);
        testsCount = testsQueue.length;
        console.log(`(i) Загружено тестов: ${testsCount}`)
    }

    await handleTestsQueue(loginTestQueue, processQueue, config, isVerbose);
    console.log(`(i) ЛОГИН ЗАВЕРШИЛСЯ УСПЕШНО, ЗАПУСКАЕМ ТЕСТЫ`);
    let errorsCount = 0;
    errorsCount = await handleTestsQueue(testsQueue, processQueue, config, isVerbose);
    console.log(`(i) ВСЕ ТЕСТЫ ВЫПОЛНЕНЫ`);
    console.log(`(i) Выполнено тестов ${testsCount}`);
    console.log(`(i) успешных тестов: ${testsCount - errorsCount}`);
    console.log(`(i) ТЕСТОВ С ОШИБКОЙ ${errorsCount}`);
    process.exit(errorsCount);
}
