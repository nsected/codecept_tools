//логин для run.js со сценарием, определенным в конфиге
const fs = require('fs');
const path = require("path");
const config = require('codeceptjs').config.get();
const tmp = './tmp';
const rimraf = require('rimraf');

Feature('login');

Scenario('login', async (I) => {
        try {
            if (!!config.loginScript) {
                rimraf.sync(tmp, {}, function () {});
                fs.mkdirSync(tmp);

                console.log('Login with scenario: ' + config.loginScript);
                let loginPartition = path.join(process.cwd(), config.loginScript);
                let login = await require(loginPartition);
                await login(I);
                let cookies = await I.grabCookie();
                await fs.writeFileSync(tmp + "/cookies.json", JSON.stringify(cookies), function(err) {
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
