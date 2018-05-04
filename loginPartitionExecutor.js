//логин для теста
const path = require("path");
const config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

module.exports = function (I, vars) {
    return actor({
        login: async function (I, vars) {
            if (config.isAsync === false && !!config.loginScript) {
                console.log('Login with login script ' + config.loginScript);
                let loginPartition = path.join(process.cwd(), config.loginScript);
                let login = await require(loginPartition);
                await login(I, vars);
            }

            if (config.isAsync === true && !!config.loginScript) {
                cookies = await require(cookiePath);
                await console.log('Login with stored cookies ' + cookies.length);
                await I.amOnPage('/');
                await I.clearCookie();
                for (let cookie of cookies) {
                    await I.setCookie(cookie);
                }
            }
        },
    });
};
