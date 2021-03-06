//логин для run.js со сценарием, определенным в конфиге
const fs = require('fs');
const path = require("path");
const rimraf = require('rimraf');
const config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

Feature('login', {timeout: config.timeout, retries: config.retries});

Scenario('login', async (I, vars) => {
        try {
            if (!!config.loginScript) {
                rimraf.sync(tmp, {}, function () {});
                fs.mkdirSync(tmp);

                console.log('Login with scenario: ' + config.loginScript);
                let loginPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.loginScript);
                let login = await require(loginPartition);
                await login(I, vars);
                let cookies = await I.grabCookie();
                await fs.writeFileSync(cookiePath, JSON.stringify(cookies), function(err) {
                    if(err) {
                        console.error(err);
                    }
                });
                console.log('Login done. Cookies grabbed: ' + cookies.length)
            }
        }
        catch
            (e) {
            console.log(e)
        }
    }
);
