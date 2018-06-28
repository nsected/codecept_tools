module.exports = function() {
    const config = require('codeceptjs').config.get();
    return config.vars;
};