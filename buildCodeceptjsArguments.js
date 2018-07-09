

module.exports = function buildCodeceptjsArguments(overrideArguments, configPath, specificTestFile, config) {
    if (!config.codeceptParams) config.codeceptParams = [];
    let bootstrap = config.bootstrap;
    let bootstrapSuite = config.bootstrap;
    let isAsync = !!config.isAsync;

    if (isAsync) {
        bootstrap = null;
    }

    let codeceptParams = [
        'codeceptjs',
        'run'
    ]
        .concat(config.codeceptParams);
    let baseArguments = {
        '--reporter': 'mocha-multi', //todo: разхардкодить опции моки
        '--config': configPath,
        '--override': {isAsync: isAsync, bootstrap: bootstrap, bootstrapSuite: bootstrapSuite},
        '--verbose': '--verbose'
    };

    if (overrideArguments) {
        baseArguments['--override'] = JSON.parse(overrideArguments);
    }

    if (specificTestFile) {
        baseArguments['--override'].tests = specificTestFile;
    }

    baseArguments['--override'] = JSON.stringify(baseArguments['--override']);
    let argumentsArray = [];
    for (let key in baseArguments) {
        argumentsArray.push(key);
        argumentsArray.push(baseArguments[key]);
    }
    
    return codeceptParams.concat(argumentsArray);
};