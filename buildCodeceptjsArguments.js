const merge = require('deepmerge');

module.exports = function buildCodeceptjsArguments(configPath, exclusiveTestFile, config) {
    if (exclusiveTestFile) config.tests = exclusiveTestFile;

    let codeceptParams = [
        'codeceptjs',
        'run'
    ]
        .concat(config.codeceptParams)
        .concat([
            '--reporter',
            'mocha-multi',
            '--config',
            configPath,
            '--override',
            JSON.stringify(config),
    ]);
    
    return codeceptParams;
};