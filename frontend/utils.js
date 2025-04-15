const crypto = require("node:crypto");
const Crypto_AES = require("crypto-js/aes");
const Crypto_SHA256 = require("crypto-js/sha256");
const Crypto_Base64 = require("crypto-js/enc-base64");
const Crypto_Utf8 = require("crypto-js/enc-utf8");

function SHA256(str) {
    return Crypto_Base64.stringify(Crypto_SHA256(str));
}

function AES_encrypt(txt, key) {
    let obj = Crypto_AES.encrypt(txt, key);
    return Crypto_Base64.stringify(obj.ciphertext) + "," + Crypto_Base64.stringify(obj.iv) + "," + Crypto_Base64.stringify(obj.salt);
}

function AES_decrypt(ctxt, key) {
    ctxt = ctxt.split(",");
    for (var i = 0; i < 3; i++) {
        ctxt[i] = Crypto_Base64.parse(ctxt[i]);
    }
    return Crypto_Utf8.stringify(Crypto_AES.decrypt({
        ciphertext: ctxt[0],
        iv: ctxt[1],
        salt: ctxt[2]
    }, key));
}

// const dontEscapeChars = " !#$%&'()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
function genRandomToken(length) {
    const possibles = letters + numbers;
    const randVals = new Uint8Array(length);
    crypto.getRandomValues(randVals);
    
    let out = "";
    for (let i = 0; i < length; i++) {
        out += possibles[randVals[i] % possibles.length];
    }
    return out;
}

function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

function readJSON(path) {
    let data, res;
    try {
        data = fs.readFileSync(path, {
            encoding: "utf8"
        }).toString();

        res = JSON.parse(data);

        return res;
    } catch (err) {
        return null;
    }
}

function parseCookies(cookies) {
    return Object.fromEntries(cookies.split("; ").map(s => {
        var e = s.indexOf("=");
        return [s.slice(0, e), s.slice(e + 1, s.length)];
    }));
}

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

// function random(start, stop) {
//     if (!stop) {
//         stop = start;
//         start = 0;
//     }
//     return Math.random() * (stop - start) + start;
// }

// function sliceOut(str1, str2) {
//     var idx = str1.indexOf(str2);
//     return str1.slice(0, idx) + str1.slice(idx + str2.length, str1.length);
// }

// function unicodeEscape(str, allowedChars) {
//     allowedChars = allowedChars ?? "";
//     let newStr = "";

//     for (var i = 0; i < str.length; i++) {
//         var c = str.charAt(i);
//         newStr += allowedChars.includes(c) ? c : "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
//     }

//     return newStr;
// }

// function escapeHTML(text) {
//     var replacements = {
//         "<": "&lt;",
//         ">": "&gt;",
//         "&": "&amp;",
//         "\"": "&quot;"
//     };
//     return text.replace(/[<>&"]/g, function(character) {
//         return replacements[character];
//     });
// }

// function calcStrSz(str) {
//     var sz = 0;
//     for (var i = 0; i < str.length; i++) {
//         sz += str.charCodeAt(i) > 255 ? 2 : 1;
//     }
//     return sz;
// }

module.exports = {
    SHA256,
    AES_encrypt,
    AES_decrypt,
    genRandomToken,
    parseJSON,
    readJSON,
    parseCookies,
    parseQuery
};
