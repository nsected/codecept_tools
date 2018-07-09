//логин для run.js со сценарием, определенным в конфиге
const fs = require('fs');
const path = require("path");
const rimraf = require('rimraf');
let config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

Feature('Preparation', {timeout: config.timeout, retries: config.retries});

Scenario('Preparation', async (I) => {
        try {
            require('codeceptjs').config.append({stage: 'runner'});
            config = require('codeceptjs').config.get();
            rimraf.sync(tmp, {}, function () {});
            fs.mkdirSync(tmp);

            if (!!config.bootstrapAll) {
                const bootstrapPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.bootstrapAll);
                const bootstrap = await require(bootstrapPartition);
                await bootstrap(I, config);
            }

            if (!!config.login) {
                let loginPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.login);
                let login = await require(loginPartition);

                console.log('Login with scenario: ' + config.login);
                await login(I, config);
                let cookies = await I.grabCookie();
                await fs.writeFileSync(cookiePath, JSON.stringify(cookies), (err)=>{console.error(err)});
                console.log('Login done. Cookies grabbed: ' + cookies.length)
            }
        }
        catch
            (err) {
            console.error(err)
        }
    }
);
