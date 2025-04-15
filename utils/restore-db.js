const fs = require('fs');
const bson = require("bson");
const { MongoClient } = require("mongodb");

const secrets = require("../secrets/secrets.js").getSecrets("./secrets/");

let myMongo;
if (secrets.MONGO_PASSWORD) {
    myMongo = new MongoClient(`mongodb://vxsacademyuser:${secrets.MONGO_PASSWORD}@${secrets.MONGO_IP}:${secrets.MONGO_PORT}/?authSource=vxsacademy`);
} else {
    console.log("WARNING: MongoDB is running without authentication");
    myMongo = new MongoClient(`mongodb://${secrets.MONGO_IP}:${secrets.MONGO_PORT}`);
}

async function restoreCollection(collection) {
    const coll = db.collection(collection);

    // delete collection
    coll.drop();

    // fill collection with backup values
    const docs = JSON.parse(fs.readFileSync(`./db-backup/vxsacademy.${collection}.json`).toString());
    for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        for (let prop in doc) {
            // handle binary values
            if (doc[prop] !== null && typeof doc[prop] === "object" && typeof doc[prop]["$binary"] === "object") {
                doc[prop] = new bson.Binary(Buffer.from(doc[prop]["$binary"].base64, 'base64'));
            }
        }
    }
    await coll.insertMany(docs);
}

async function main() {
    await myMongo.connect();
    db = myMongo.db("vxsacademy");
    if (secrets.MONGO_PASSWORD) {
        db.auth("vxsacademyuser", secrets.MONGO_PASSWORD);
    }
    console.log("Connected to MongoDB!");

    await restoreCollection("discussions");
    await restoreCollection("programs");
    await restoreCollection("salts");
    await restoreCollection("users");    

    myMongo.close();

    console.log("DB Restoration Complete");
}

main().catch(console.error);
