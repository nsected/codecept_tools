module.exports = function() {
    const config = require('codeceptjs').config.get();
    const vars = config.vars;
    const browser = this.helpers['WebDriverIO'].browser;

    return actor({
        helpers: this,
        config: config,
        vars: vars,
        browser: browser,
    });
};