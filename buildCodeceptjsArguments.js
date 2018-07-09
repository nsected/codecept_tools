

module.exports = function buildCodeceptjsArguments(overrideArguments, configPath, specificTestFile, config) {
    if (!config.codeceptParams) config.codeceptParams = [];
    let isAsync = config.isAsync;

    let codeceptParams = [
        'codeceptjs',
        'run'
    ]
        .concat(config.codeceptParams);
    let baseArguments = {
        '--reporter': 'mocha-multi', //todo: разхардкодить опции моки
        '--config': configPath,
        '--override': {isAsync: !!isAsync, bootstrap: null, bootstrapSuite: config.bootstrap},
        '--verbose': '--verbose'
    };

    if (overrideArguments) {
        baseArguments['--override'] = JSON.parse(overrideArguments);
    }

    if (specificTestFile) {
        baseArguments['--override'].tests = specificTestFile;
    }

    baseArguments['--override'] = JSON.stringify(baseArguments['--override']);
    if (!!isAsync) baseArguments['--override'].bootstrap = null;
    let argumentsArray = [];
    for (let key in baseArguments) {
        argumentsArray.push(key);
        argumentsArray.push(baseArguments[key]);
    }
    
    return codeceptParams.concat(argumentsArray);
};