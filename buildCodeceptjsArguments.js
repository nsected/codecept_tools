const merge = require('deepmerge');

module.exports = function buildCodeceptjsArguments(configPath, exclusiveTestFile, config) {
    if (exclusiveTestFile) config.tests = exclusiveTestFile;

    return [
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
};