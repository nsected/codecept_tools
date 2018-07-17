const merge = require('deepmerge');
const path = require("path");

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
            path.join(process.cwd(),'/codeceptConfigStub.json'),
            '--override',
            JSON.stringify(config),
    ]);
};