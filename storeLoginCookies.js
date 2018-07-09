//логин для run.js со сценарием, определенным в конфиге
const fs = require('fs');
const path = require("path");
const rimraf = require('rimraf');
let config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

Feature('Preparation', {timeout: config.timeout, retries: config.retries});

Scenario('Login', async (I) => {
        try {
            config = require('codeceptjs').config.get();
            rimraf.sync(tmp, {}, function () {});
            fs.mkdirSync(tmp);
            let loginPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.login);
            let login = await require(loginPartition);

            console.log('Login with scenario: ' + config.login);
            await login(I, config);
            let cookies = await I.grabCookie();
            fs.writeFileSync(cookiePath, JSON.stringify(cookies), (err)=>{console.error(err)});
            console.log('Login done. Cookies grabbed: ' + cookies.length)
        }
        catch
            (err) {
            console.error(err)
        }
    }
);
