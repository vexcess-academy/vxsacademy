const BashShell = require("./src/lib/BashShell.js");
const secrets = require("./secrets").getSecrets("./");

function myHandler(event) {
    console.log("SUBSHELL " + event.process + "  " + event.type);
    const printData = event.data.split("\n").map(ln => "    " + ln).join("\n");
    if (event.type === "err") {
        console.error(printData);
    } else {
        console.log(printData);
    }
}

if (secrets.USE_PROXY) {
    const ratholeProxy = new BashShell("RatholeProxy");
    ratholeProxy.handler = myHandler;
    ratholeProxy.send("./rathole client.toml");
}

const mainServer = new BashShell("MainServer");
mainServer.handler = myHandler;
mainServer.send("cd src");
mainServer.send("node index.js");

const sandoxServer = new BashShell("SandboxServer");
sandoxServer.handler = myHandler;
sandoxServer.send("cd sandbox");
sandoxServer.send("node index.js");
