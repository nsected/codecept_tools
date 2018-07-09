const merge = require('deepmerge');

module.exports = function buildCodeceptjsArguments(configPath, exclusiveTestFile, config) {
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

    if (exclusiveTestFile) {
        codeceptParams['--override'].tests = exclusiveTestFile;
    }
    
    return codeceptParams;
};