//логин для теста
const path = require("path");
const config = require('codeceptjs').config.get();
const tmp = path.join(process.cwd(), '/tmp');
const cookiePath = path.join(tmp, '/cookies.json');

module.exports = function (I, vars) {
    return actor({
        login: async function (I, vars) {
            if (!config.isAsync && !!config.loginScript) {
                console.log('Login with login script ' + config.loginScript);
                let loginPartition = path.join(process.cwd(), path.dirname( config.mocha.config), config.loginScript);
                let login = await require(loginPartition);
                await login(I, vars);
            }

            if (config.isAsync && !!config.loginScript) {
                let cookies = await require(cookiePath);
                console.log('Login with stored cookies ' + cookies.length);
                cookies = JSON.stringify(cookies);
                await I.amOnPage('/');
                await I.clearCookie();
                await I.executeScript(function (cookies) {
                    cookies = JSON.parse(cookies);
                    cookies.forEach(function (cookie) {
                        setCookie(cookie.name, cookie.value, {
                            domain: cookie.domain,
                            path: cookie.path,
                            secure: cookie.secure
                        })
                    });
                    function setCookie(name, value, options) {
                        options = options || {};

                        let expires = options.expires;

                        if (typeof expires == "number" && expires) {
                            let d = new Date();
                            d.setTime(d.getTime() + expires * 1000);
                            expires = options.expires = d;
                        }
                        if (expires && expires.toUTCString) {
                            options.expires = expires.toUTCString();
                        }

                        value = encodeURIComponent(value);

                        let updatedCookie = name + "=" + value;

                        for (let propName in options) {
                            updatedCookie += "; " + propName;
                            let propValue = options[propName];
                            if (propValue !== true) {
                                updatedCookie += "=" + propValue;
                            }
                        }
                        document.cookie = updatedCookie;
                    }
                }, cookies);
            }
        },
    });
};
