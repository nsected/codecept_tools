//логин для run.js со сценарием, определенным в конфиге
const fs = require('fs');
const path = require("path");
const rimraf = require('rimraf');
const config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

Feature('Preparation', {timeout: config.timeout, retries: config.retries});

Scenario('Preparation', async (I, vars) => {
        try {
            if (!!config.suiteBootstrap) {
                const bootstrapPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.suiteBootstrap);
                const bootstrap = await require(bootstrapPartition);
                await bootstrap(I, vars);
            }

            if (!!config.login && !!config.isAsync) {
                let loginPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.login);
                let login = await require(loginPartition);

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                } else if (path.existsSync(cookiePath)) {
                    rimraf.sync(cookiePath, {}, function () {});
                }

                console.log('Login with scenario: ' + config.login);
                await login(I, vars);
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
