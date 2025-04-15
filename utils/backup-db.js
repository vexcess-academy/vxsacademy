const BashShell = require("./src/lib/BashShell.js");
const fs = require("fs");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const mainServer = new BashShell("BackupDB");
let busy = false;
mainServer.handler = function(event) {
    if (event.data) {
        console.log(event.data);
        if (event.data.includes("exported")) {
            busy = false;
        }
    }
};

async function exportCollection(collection) {
    const db = "vxsacademy";
    const outPath = `./db-backup/${db}.${collection}.json`;

    // use mongoexport to get data
    busy = true;
    mainServer.send(`mongoexport --collection=${collection} --db=${db} --out=${outPath}`);
    while (busy) {
        await wait(10);
    }
    
    // format data
    let writtenData = fs.readFileSync(outPath).toString().split("\n");
    for (let i = 0; i < writtenData.length; i++) {
        if (writtenData[i].length > 0) {
            let doc = JSON.parse(writtenData[i]);
            delete doc._id;
            writtenData[i] = JSON.stringify(doc);
        }
    }
    let newData = writtenData.join(",\n");
    newData = newData.slice(0, newData.length - 2);

    // write formatted data
    fs.writeFileSync(outPath, `[\n${newData}\n]`);
}

async function main() {
    await exportCollection("discussions");
    await exportCollection("programs");
    await exportCollection("salts");
    await exportCollection("users");
    mainServer.kill();
    console.log("Export Complete");
}

main();
