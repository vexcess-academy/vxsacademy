// import dependencies
const http = require('http');
const fs = require('fs');

// it'd be very bad if these were publicly available
const secrets = require("../../secrets/secrets.js").getSecrets("../../secrets/");

function parseQuery(url) {
    let quesIdx = url.indexOf("?");
    if (quesIdx === -1) {
        return {};
    } else {
        let end = url.slice(quesIdx + 1);
        if (end.length > 2) {
            let vars = end.split("&");
            let keys = {};
            for (var i = 0; i < vars.length; i++) {
                var eqIdx = vars[i].indexOf("=");
                vars[i] = [
                    decodeURIComponent(vars[i].slice(0, eqIdx)),
                    decodeURIComponent(vars[i].slice(eqIdx + 1))
                ];
                var number = Number(vars[i][1]);
                if (!Number.isNaN(number)) {
                    vars[i][1] = number;
                }
                keys[vars[i][0]] = vars[i][1];
            }
            return keys;
        } else {
            return {};
        }
    }
}

let cache = {};

const blacklist = [
    "cloudflareworkers.com",
    "*.repl.co",
    "*.cyclic.app",
];

const server = http.createServer((req, res) => {
    try {
        let reqQuery = {};
        let quesIdx = req.url.indexOf("?");
        if (quesIdx !== -1) {
            reqQuery = parseQuery(req.url);
            req.url = req.url.slice(0, quesIdx);
        }

        let fetchPath = "./" + req.url.slice(1);

        if (fetchPath === "./clearCache") {
            cache = {};
            res.write("Cache Cleared");
            return res.end();
        }

        if (fetchPath.length > 2 && fs.existsSync(fetchPath)) {
            let dataType = fetchPath.split(".").reverse()[0];
            switch (dataType) {
                case "html": dataType = "text/html"; break;
                case "js": dataType = "text/javascript"; break;
                case "css": dataType = "text/css"; break;
                case "png": dataType = "image/png"; break;
            }
                
            let resHeaders = {
                "Content-Type": dataType,
                // "Cross-Origin-Opener-Policy": "same-origin",
                // "Cross-Origin-Embedder-Policy": "require-corp"
            };

            if (dataType === "text/html") {
                resHeaders["Origin-Agent-Cluster"] = "?1";
                
                if (!reqQuery.allowAll) {
                    reqQuery[Buffer.from("javac.vexcess.repl.co").toString('base64')] = true;
                    reqQuery[Buffer.from("sandbox.vexcess.repl.co").toString('base64')] = true;
                    reqQuery[Buffer.from("cdn.jsdelivr.net").toString('base64')] = true;
                    let domains = Object.keys(reqQuery);
                    
                    // remove blacklisted domains
                    for (let i = 0; i < domains.length; i++) {
                        let asciiDomain = Buffer.from(domains[i], 'base64').toString();
                        domains[i] = asciiDomain;
                        for (let j = 0; j < blacklist.length; j++) {
                            if (blacklist[j] === asciiDomain) {
                                domains.splice(i, 1);
                                i--;
                            } else if (blacklist[j][0] === "*" && asciiDomain.endsWith(blacklist[j].slice(2))) {
                                domains.splice(i, 1);
                                i--;
                            } 
                        }
                    }

                    resHeaders["Content-Security-Policy"] = "default-src data: blob: 'self' 'unsafe-inline' 'unsafe-eval' " + domains.join(" ") + ";";
                }
                
            }

            if (!cache[fetchPath]) {
                cache[fetchPath] = fs.readFileSync(fetchPath);
            }

            res.writeHead(200, resHeaders);
            res.write(cache[fetchPath]);
            return res.end();
        }
        
        res.write("404 Not Found");
        return res.end();
    } catch (e) {
        console.log(e)
        res.write("500 Internal Server Error");
        return res.end();
    }
});

server.listen(secrets.SANDBOX_PORT, function () {
    console.log("Sandbox online at http://127.0.0.1:" + secrets.SANDBOX_PORT);
});
