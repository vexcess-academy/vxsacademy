console.log("Starting Server...");

// import dependencies
const http = require("node:https");
const fs = require("node:fs");

const { MongoClient } = require("mongodb");
const bson = require("bson");
const BashShell = require("./lib/BashShell.js");

// it'd be very bad if these were publicly available
const secrets = require("../secrets").getSecrets("../");

let myMongo;
if (secrets.MONGO_PASSWORD) {
    myMongo = new MongoClient(`mongodb://vxsacademyuser:${secrets.MONGO_PASSWORD}@${secrets.MONGO_IP}:${secrets.MONGO_PORT}/?authSource=vxsacademy`);
} else {
    console.log("WARNING: MongoDB is running without authentication");
    myMongo = new MongoClient(`mongodb://${secrets.MONGO_IP}:${secrets.MONGO_PORT}`);
}

let db = null;
let users = null;
let programs = null;
let salts = null;
let discussions = null;


// utility functions
const {
    SHA256,
    AES_encrypt,
    AES_decrypt,
    genRandomToken,
    parseJSON,
    readJSON,
    parseCookies,
    parseQuery
} = require("./utils.js");


// validating user input is essential
const {
    validateFileName,
    validateProgramData,
    validateNickname,
    validateBio,
    validateUsername,
    validatePassword,
    validateDiscussion
} = require("./validators.js");

let kaHotlist = null;
let vxsHotlist = null;
const {
    getKAProgram,
    initializeLists
 } = require("./hotlist.js");

// for spam detection
const IP_monitor = readJSON("./ip-data.json") ?? {};
for (const ip in IP_monitor) {
    IP_monitor[ip].requests = 0;
}
// reset spam detection for IPs every minute
setInterval(function() {
    for (const ip in IP_monitor) {
        IP_monitor[ip].requests = 0;
    }
}, 1000 * 60 * 1);


const FileCache = require("./filecache.js");

// file cache for fast file serving
const fileCache = new FileCache({
    "main": "./page-template.html",
    "computer-programming": "./pages/computer-programming/computer-programming.html",
    "program": "./pages/computer-programming/program.html",
    "program-fullscreen": "./pages/computer-programming/program-fullscreen.html",
    "course": "./pages/computer-programming/course.html",
    "browse": "./pages/computer-programming/browse.html",
    "home": "./pages/home/home.html",
    "login": "./pages/login/login.html",
    "profile": "./pages/profile/profile.html",
    "logs/dev": "./pages/logs/dev.html",
    "logs/finance": "./pages/logs/finance.html",
    "tos": "./pages/tos/tos.html",
    "privacy-policy": "./pages/privacy-policy/privacy-policy.html",
}, 10);


const DEFAULT_OG_TAGS = `
    <meta content="VExcess Academy" property="og:title" />
    <meta content="A website where anyone can learn to code and share their projects." property="og:description" />
    <meta content="/CDN/images/logo.png#a" property="og:image" />
`;

// page creation utility
function createHTMLPage(pg, userData, openGraphTags) {
    return fileCache.get("main")
        .replace("<!-- OPEN GRAPH INSERT -->", openGraphTags)
        .replace("<!-- USER DATA INSERT -->", `<script>\n\tlet userData = ${userData ? JSON.stringify(userData).replaceAll("</", "<\\/") : "null"}\n</script>`)
        .replace("<!-- PAGE CONTENT INSERT -->", fileCache.get(pg));
}


// cache user credentials for fast authentification
const userCredentials = {};


const Analytics = require("./analytics.js");
const myAnalytics = new Analytics("./analytics-data.json");


// tree specifying the routes for the project
const projectTree = {
    "/clearCache": async (path, out, data) => {
        fileCache.clear();
        await fetch("http://127.0.0.1:" + secrets.SANDBOX_PORT + "/clearCache");
        out.write("Cache Cleared");
    },
    "/": (path, out, data) => {
        // main path
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("home", data.userData, DEFAULT_OG_TAGS));
    },
    "/login": (path, out, data) => {
        // login page
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("login", data.userData, DEFAULT_OG_TAGS));
    },
    "/profile/": (path, out, data) => {
        // profile page
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("profile", data.userData, DEFAULT_OG_TAGS));
    },
    "/logs/": (path, out, data) => {
        // logs path
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("logs/" + path, data.userData, DEFAULT_OG_TAGS));
    },
    "/tos": (path, out, data) => {
        // tos path
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("tos" + path, data.userData, DEFAULT_OG_TAGS));
    },
     "/privacy-policy": (path, out, data) => {
        // tos path
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("privacy-policy" + path, data.userData, DEFAULT_OG_TAGS));
    },
    "/computer-programming": (path, out, data) => {
        // computer programming home
        out.writeHead(200, { 'Content-Type': 'text/html' });
        out.write(createHTMLPage("computer-programming", data.userData, DEFAULT_OG_TAGS));
    },
    "/computer-programming/": {
        "browse": (path, out, data) => {
            // browse projects
            out.writeHead(200, { "Content-Type": "text/html" });
            out.write(createHTMLPage("browse", data.userData, DEFAULT_OG_TAGS));
        },
        "ka-browse": (path, out, data) => {
            // browse projects
            out.writeHead(200, { "Content-Type": "text/html" });
            out.write(createHTMLPage("browse", data.userData, DEFAULT_OG_TAGS));
        },
        "javascript": (path, out, data) => {
            // return course page
            out.writeHead(200, { 'Content-Type': 'text/html' });
            out.write(createHTMLPage("course", data.userData, DEFAULT_OG_TAGS));
            return;
        },
        "javascript/": (path, out, data) => {
            // return course page
            out.writeHead(200, { 'Content-Type': 'text/html' });
            out.write(createHTMLPage("course", data.userData, DEFAULT_OG_TAGS));
            return;
        },
        "webgl": (path, out, data) => {
            // return course page
            out.writeHead(200, { 'Content-Type': 'text/html' });
            out.write(createHTMLPage("course", data.userData, DEFAULT_OG_TAGS));
            return;
        },
        "webgl/": (path, out, data) => {
            // return course page
            out.writeHead(200, { 'Content-Type': 'text/html' });
            out.write(createHTMLPage("course", data.userData, DEFAULT_OG_TAGS));
            return;
        },
        "new/": (path, out, data) => {
            // new program path
            let programType = path;
            if (["webpage", "pjs", "python", "glsl", "jitlang", "cpp", "java", "zig"].includes(programType)) {
                let webpageCode = createHTMLPage("program", data.userData, DEFAULT_OG_TAGS);

                out.writeHead(200, {
                    "Content-Type": "text/html",
                    // "Cross-Origin-Opener-Policy": "same-origin",
                    // "Cross-Origin-Embedder-Policy": "require-corp"
                });
                out.write(webpageCode);
            }
        },
        "*": async (path, out, data) => {
            try {
                // existing program path
                let splitPath = path.split("/");
                let programId = splitPath[0];
                let isFullScreen = splitPath.length > 1 && splitPath[1] === "fullscreen";

                const isKAProgram = programId.startsWith("KA_") && programId.length !== 14;
                let programData = null;
                if (isKAProgram) {
                    programData = await getKAProgram(programId);
                } else {
                    programData = await programs.findOne({id: programId}/*, {projection: {id: 1, _id: 0}}*/);
                }

                if (programData === null) {
                    // exit if program not found
                    return out.write("404");
                } else {
                    let webpageCode;
                    const thumbnailURL = isKAProgram ? `https://www.khanacademy.org/computer-programming/i/${programData.id.slice(3)}/latest.png` : `/CDN/programs/${programData.id}.jpg`;
                    const openGraphInsert = `
                        <meta content="${programData.title.replaceAll('"', '\\"')}" property="og:title" />
                        <meta content="Made by ${programData.author.nickname.replaceAll('"', '\\"')}" property="og:description" />
                        <meta content="${thumbnailURL}" property="og:image" />
                    `;
                    
                    if (isFullScreen) {
                        webpageCode = fileCache.get("program-fullscreen")
                            .replace("<!-- OPEN GRAPH INSERT -->", openGraphInsert)
                            // .replace("<!-- USER DATA INSERT -->", `<script>\n\tvar userData = ${userData ? JSON.stringify(userData).replaceAll("</", "<\\/") : "null"}\n</script>`);
                    } else {
                        webpageCode = createHTMLPage("program", data.userData, openGraphInsert);
                    }
                    
                    out.writeHead(200, {
                        "Content-Type": "text/html",
                        // "Cross-Origin-Opener-Policy": "same-origin",
                        // "Cross-Origin-Embedder-Policy": "require-corp"
                    });
                    out.write(webpageCode);
                }
            } catch (err) {
                console.log(err)
            }

        }
    },
    "/API/": {
        ":ACTION": (path, out, data) => {
            // check if token is valid
            let hasPermission = data.userData !== null;

            let allowRequest = true;

            // ignore
            const origin = data.request.headers.origin;
            const validOrigin = typeof origin === "string" && (origin === "https://vxsacademy.org" || origin.startsWith("https://127.0.0.1") || origin.startsWith("http://127.0.0.1"));
            const sensitiveEndpoint = ["signup", "login", "create_program", "save_program", "delete_program", "like_program", "update_profile", "compile_cpp", "sign_out", "compile_zig"].includes(path.slice(5));
            // console.log(origin)
            if (sensitiveEndpoint && !validOrigin) {
                allowRequest = false;
            }

            if (allowRequest) {
                // yeet CORS :D
                out.setHeader("Access-Control-Allow-Origin", "*");
            } else {
                out.setHeader("Access-Control-Allow-Origin", "https://vxsacademy.org");
            }

            // Disable all auth because of data leak
            hasPermission = false;

            return { hasPermission, allowRequest };
        },
        ":POST:": {
            "signup": async (path, out, data) => {
                if (!data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // create account endpoint
                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                // validate input
                if (validateUsername(json.username) === "OK" && validatePassword(json.password) === "OK" && typeof json.recaptchaRes === "string") {
                    if (!IP_monitor[data.hashedUserIP].accounts) {
                        IP_monitor[data.hashedUserIP].accounts = [];
                    }

                    if (IP_monitor[data.hashedUserIP].accounts.length > 1024) {
                        out.write("error: too many accounts associated with IP");
                        return;
                    }

                    for (let id in userCredentials) {
                        if (userCredentials[id].username.toLowerCase() === json.username.toLowerCase()) {
                            out.write("error: that username is already taken");
                            return;
                        }
                    }

                    let userId = genRandomToken(4) + Date.now().toString(36);
                    let userSalt = genRandomToken(16);
                    let userTok = genRandomToken(32);
                    /*
                        If the entire bitcoin community decided to try and focus all their computational
                        power into cracking a user token it would take 204528192898125370000 billion years
                    */

                    salts.insertOne({
                        id: userId,
                        salt: userSalt
                    });

                    let profile = {
                        nickname: json.username,
                        username: json.username,
                        avatar: "bobert",
                        password: SHA256(userSalt + json.password),
                        tokens: [Date.now(), AES_encrypt(userSalt + userTok, secrets.MASTER_KEY)],
                        id: userId,
                        bio: "",
                        created: Date.now(),
                        projects: [],
                        notifications: [],
                        discussions: [],
                        comments: [],
                        background: "blue"
                    };

                    let res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secrets.RECAPTCHA_KEY}&response=${json.recaptchaRes}`, {
                        method: "POST"
                    });
                    let captcha = await res.json();
                    if (captcha.success) {
                        userCredentials[profile.id] = {
                            username: profile.username,
                            password: profile.password,
                            tokens: profile.tokens,
                            id: profile.id,
                            nickname: profile.nickname
                        };

                        IP_monitor[data.hashedUserIP].accounts.push(profile.id);

                        fs.writeFile("./ip-data.json", JSON.stringify(IP_monitor), err => {
                            if (err) {
                                console.log(err);
                            }
                        });

                        // log new user
                        console.log("ACCOUNT MADE", profile);

                        // save user to database
                        users.insertOne(profile);

                        // send user their auth token
                        out.write(userTok);
                    } else {
                        out.write("error: recaptcha failed");
                    }
                } else {
                    out.write("error: 400");
                    return;
                }
            },
            "login": async (path, out, data) => {
                if (!data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // login endpoint
                if (data.userData) {
                    out.write("error: already signed in");
                    return;
                }

                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                if (validateUsername(json.username) === "OK" && validatePassword(json.password) === "OK") {
                    for (let id in userCredentials) {
                        let user = userCredentials[id];
                        if (user.username === json.username) {
                            let salt = (await salts.findOne({ id: user.id })).salt;

                            if (user.password === SHA256(salt + json.password)) {
                                let profile = await users.findOne({ id });
                                
                                // generate new auth token on every sign in
                                let userTok = genRandomToken(32);

                                // delete old tokens
                                let currTime = Date.now();
                                for (let i = 0; i < profile.tokens.length; i += 2) {
                                    if (currTime - profile.tokens[i] > 1000*60*60*24*7) {
                                        profile.tokens.splice(i, 2);
                                        userCredentials[id].tokens.splice(i, 2);
                                        i -= 2;
                                    }
                                }

                                // update cache
                                userCredentials[id].tokens.push(Date.now(), AES_encrypt(salt + userTok, secrets.MASTER_KEY));
                                
                                // update profile in storage
                                profile.tokens.push(Date.now(), AES_encrypt(salt + userTok, secrets.MASTER_KEY));
                                users.updateOne({ id }, {$set: {
                                    tokens: profile.tokens
                                }});
                                    
                                out.write(userTok);
                                return;
                            } else {
                                out.write("error: password is incorrect");
                                return;
                            }
                        }
                    }

                    out.write("error: that username doesn't exist");
                } else {
                    out.write("error: 400");
                    return;
                }
            },
            "create_program": async (path, out, data) => {
                // create program endpoint
                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                let programId;
                let creationError = false;

                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                if (data.userData.projects.length > 32) {
                    out.write("error: your storage is full");
                    return;
                }

                // temp obj for program data
                let programData = {
                    id: null,
                    title: json.title,
                    type: json.type,
                    likes: [],
                    forks: [],
                    likeCount: 0,
                    forkCount: 0,
                    created: Date.now(),
                    lastSaved: Date.now(),
                    flags: [],
                    width: json.width,
                    height: json.height,
                    fileNames: Object.keys(json.files),
                    files: json.files,
                    author: {
                        username: data.userData.username,
                        id: data.userData.id,
                        nickname: data.userData.nickname
                    },
                    parent: json.parent ?? null,
                    thumbnail: json.thumbnail ? new bson.Binary(Buffer.from(json.thumbnail.slice(json.thumbnail.indexOf(",") + 1), 'base64')) : null,
                    discussions: []
                };

                // validate input
                let programCheck = validateProgramData(programData);
                if (programCheck !== "OK") creationError = programCheck;

                // check if parent exists
                let parentProgram = null;
                if (programData.parent !== null && programData.parent.length > 0) {
                    parentProgram = await programs.findOne({id: programData.parent});
                    if (parentProgram === null) creationError = "error: parent non-existent";
                }

                if (!creationError) {
                    let directory;
                    do {
                        // create program id
                        programId = genRandomToken(6) + Date.now().toString(36);
                    } while (await programs.findOne({id: programId}) !== null); // check if program already exists

                    programData.id = programId;

                    // update parent forks array
                    if (parentProgram !== null) {
                        programs.updateOne({ id: programData.parent }, {$push: {
                            forks: {
                                id: programData.id,
                                created: programData.created,
                                likeCount: programData.likeCount
                            }
                        }});
                    }

                    // add program to user's profile
                    await users.updateOne({ id: programData.author.id }, {$push: {
                        projects: programData.id
                    }});

                    // save program to database
                    await programs.insertOne(programData);
                }

                // send program id to user
                if (creationError !== false) {
                    out.write(creationError);
                } else {
                    out.write(programId);
                }
            },
            "save_program": async (path, out, data) => {
                // save program endpoint
                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                let creationError = false;

                if (!data.userData || (!data.userData.projects.includes(json.id) && !data.userData.isAdmin)) {
                    data.hasPermission = false;
                }

                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // check if dir exists
                let programData = await programs.findOne({ id: json.id });
                if (programData === null) {
                    creationError = "error: program non-existent";
                }

                // temp obj for program data
                programData.title = json.title;
                programData.lastSaved = Date.now();
                programData.width = json.width;
                programData.height = json.height;
                programData.fileNames = Object.keys(json.files);
                programData.files = json.files;
                programData.thumbnail = json.thumbnail;

                // validate input
                let programCheck = validateProgramData(programData);
                if (programCheck !== "OK") creationError = programCheck;

                // update program in database
                if (!creationError) {
                    programs.updateOne({ id: json.id }, {$set: {
                        title: json.title,
                        lastSaved: Date.now(),
                        width: json.width,
                        height: json.height,
                        fileNames: Object.keys(json.files),
                        files: json.files,
                        thumbnail: json.thumbnail ? new bson.Binary(Buffer.from(json.thumbnail.slice(json.thumbnail.indexOf(",") + 1), 'base64')) : null
                    }});
                }

                // send program id to user
                if (creationError !== false) {
                    out.write(creationError);
                } else {
                    out.write("OK");
                }
            },
            "delete_program": async (path, out, data) => {
                // delete program endpoint

                let programData = await programs.findOne({ id: data.postData });

                // check if program exists
                if (programData === null) {
                    out.write("error: program doesn't exist");
                    return;
                }

                // check if has permission to delete data
                try {
                    if (programData.author.id !== data.userData.id) {
                        data.hasPermission = false;
                    }
                } catch (e) {
                    out.write("error: error while deleting program");
                    return;
                }

                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // remove from parent forks array
                if (programData.parent !== null && programData.parent.length > 0) {
                    let parentData = await programs.findOne({ id: programData.parent });
                    if (parentData !== null) {
                        programs.updateOne({ id: programData.parent }, {$pull: {
                            forks: programData.id
                        }});
                    }
                }
                
                // remove program from user's profile
                users.updateOne({ id: data.userData.id }, {$pull: {
                    projects: data.postData
                }});

                // delete program from storage
                await programs.deleteOne({ id: data.postData });
                out.write("OK");
            },
            "like_program": async (path, out, data) => {
                // like program endpoint
                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                try {
                    // get program data
                    let programData = await programs.findOne({ id: data.postData });

                    // update program data
                    if (!programData.likes.includes(data.userData.id)) {
                        programs.updateOne({ id: data.postData }, {
                            $push: {
                                likes: data.userData.id
                            },
                            $inc: {
                                likeCount: 1
                            }
                        });
                    } else {
                        programs.updateOne({ id: data.postData }, {
                            $pull: {
                                likes: data.userData.id
                            },
                            $inc: {
                                likeCount: -1
                            }
                        });
                    }

                    // update parent forks array
                    if (programData.parent !== null && programData.parent.length > 0) {
                        // parent directory path
                        let parentProgram = await programs.findOne({ id: programData.parent });
                        if (parentProgram !== null) {
                            for (let i = 0; i < parentProgram.forks.length; i++) {
                                let fork = parentProgram.forks[i];
                                if (fork.id === programData.id) {
                                    fork.likeCount = programData.likeCount;
                                }
                            }

                            programs.updateOne({ id: programData.parent }, {$set: {
                                forks: parentProgram.forks
                            }});
                        }
                    }
                    out.write("200");
                    return;
                } catch (e) {
                    out.write("error: error while liking program");
                    return;
                }
            },
            "create_discussion": async (path, out, data) => {
                // create program endpoint
                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                let creationError = false;
                try {
                    let discussionData = {
                        id: genRandomToken(6) + Date.now().toString(36),
                        program: json.program,
                        created: Date.now(),
                        lastSaved: Date.now(),
                        type: json.type, // "Q" question | "C" comment
                        likes: [],
                        dislikes: [],
                        flags: [],
                        content: json.content,
                        author: {
                            id: data.userData.id
                        },
                        thread: []
                    };

                    let discussionCheck = validateDiscussion(discussionData);
                    if (discussionCheck !== "OK") creationError = discussionCheck;

                    let author = await users.findOne({
                        id: discussionData.author.id
                    }, {
                        projection: { discussions: 1, _id: 0 }
                    });
                    if (!author) {
                        out.write("error: invalid user id");
                        return;
                    }
                    if (author.discussions.length > 100) {
                        out.write("error: discussion quota reached");
                        return;
                    }

                    if (!creationError) {
                        // add discussion to program
                        let hostProgram = await programs.findOne({ id: discussionData.program });
                        if (hostProgram !== null) {
                            do {
                                // create id
                                discussionData.id = genRandomToken(6) + Date.now().toString(36);
                            } while (await discussions.findOne({id: discussionData.id}) !== null); // check if already exists

                            // save discussion to database
                            discussions.insertOne(discussionData);
                            
                            // add discussion to program
                            programs.updateOne({ id: discussionData.program }, {$push: {
                                discussions: discussionData.id
                            }});

                            // add discussion to author profile
                            users.updateOne({ id: data.userData.id }, {$push: {
                                discussions: discussionData.id
                            }});

                            // notify program author
                            users.updateOne({ id: hostProgram.author.id }, {
                                $push: {
                                    notifications: discussionData.id
                                },
                                $inc: {
                                    newNotifs: 1
                                }
                            });
                        }
                    }

                    // send status to client
                    if (creationError !== false) {
                        out.write(creationError);
                    } else {
                        out.write(`${discussionData.id}`);
                    }
                    return;
                } catch (e) {
                    console.log(e)
                    out.write("error: error while creating discussion");
                    return;
                }
            },
            "clear_notifs": async (path, out, data) => {
                // mark notifs as read endpoint
                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // clear notifs
                users.updateOne({ id: data.userData.id }, {$set: {
                    newNotifs: 0
                }});
 
                out.write("OK");
            },
            "update_profile": async (path, out, data) => {
                // change nickname endpoint
                let json = parseJSON(data.postData);
                if (json === null) {
                    out.write("error");
                    return;
                }

                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                const validAvatars = ["bobert-cool","bobert-pixelated","boberta","bobert-approved","bobert-chad","bobert-cringe","bobert-flexing","bobert-hacker","bobert-high","bobert-troll-nose","bobert-troll","bobert-wide","bobert","rock-thonk","floof1","floof2","floof3","floof4","floof5","pyro1","pyro2","pyro3","pyro4","pyro5"];
                const validBackgrounds = ["blue","bobert","cosmos","cyber","electric-blue","fbm","fractal-1","green","julia-rainbow","julia","magenta","photon-1","photon-2","transparent"];
                
                // validate input
                if (json.nickname && validateNickname(json.nickname) !== "OK") {
                    out.write("error: 400");
                    return;
                }
                if (json.username && validateUsername(json.username) !== "OK") {
                    out.write("error: 400");
                    return;
                }
                for (let id in userCredentials) {
                    if (userCredentials[id].username.toLowerCase() === json.username.toLowerCase()) {
                        out.write("error: that username is already taken");
                        return;
                    }
                }
                if (json.bio && validateBio(json.bio) !== "OK") {
                    out.write("error: 400");
                    return;
                }
                if (json.avatar && !validAvatars.includes(json.avatar)) {
                    out.write("error: 400");
                    return;
                }
                if (json.background && !validBackgrounds.includes(json.background)) {
                    out.write("error: 400");
                    return;
                }

                const id = data.userData.id;
                let updateQuery = {};

                // update info
                if (json.nickname) {
                    updateQuery.nickname = json.nickname;
                    userCredentials[id].nickname = json.nickname;
                }
                if (json.username) {
                    updateQuery.username = json.username;
                    userCredentials[id].username = json.username;
                }
                if (json.bio) {
                    updateQuery.bio = json.bio;
                }
                if (json.avatar) {
                    updateQuery.avatar = json.avatar;
                }
                if (json.background) {
                    updateQuery.background = json.background;
                }

                await users.updateOne({ id }, {$set: updateQuery});

                out.write("OK");
            },
            // "compile_cpp": async (path, out, data) => {
            //     let escapedCode = encodeURIComponent(data.postData);
            //     let res = await fetch("https://wasmexplorer-service.herokuapp.com/service.php", {
            //         "headers": {
            //         "accept": "*/*",
            //         "accept-language": "en-US,en;q=0.9",
            //         "content-type": "application/x-www-form-urlencoded",
            //         "prefer": "safe",
            //         "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Microsoft Edge\";v=\"116\"",
            //         "sec-ch-ua-mobile": "?0",
            //         "sec-ch-ua-platform": "\"Windows\"",
            //         "sec-fetch-dest": "empty",
            //         "sec-fetch-mode": "cors",
            //         "sec-fetch-site": "cross-site"
            //         },
            //         "referrer": "https://mbebenita.github.io/",
            //         "referrerPolicy": "strict-origin-when-cross-origin",
            //         "body": "input=" + escapedCode + "&action=cpp2wast&options=-std%3Dc%2B%2B11%20-Os",
            //         "method": "POST",
            //         "mode": "cors",
            //         "credentials": "omit"
            //     });
            //     let body = await res.text();
            //     out.write(body);
            // },
            // "compile_zig": async (path, out, data) => {
            //     let sourceCode = parseJSON(data.postData);
            //     if (sourceCode && sourceCode["main.zig"]) {
            //         if (!fs.existsSync("./program-zig-out")) {
            //             fs.mkdirSync("./program-zig-out");
            //         }

            //         const id = Math.random().toString().replace(".", "");
            //         const path = `./program-zig-out/${id}`;
            //         fs.mkdirSync(path);

            //         let checkName = false;
            //         for (const fileName in sourceCode) {
            //             checkName = validateFileName(fileName);
            //             if (checkName === "OK") {
            //                 fs.writeFileSync(`${path}/${fileName}`, sourceCode[fileName]);
            //             } else {
            //                 break;
            //             }
            //         }

            //         if (checkName === "OK") {
            //             const zigCompiler = new BashShell("ZigCompiler");
            //             zigCompiler.handler = function(event) {
            //                 const printData = event.data.split("\n").map(ln => "    " + ln).join("\n");
            //                 if (event.type === "err") {
            //                     out.write(printData);
            //                 } else {
            //                     console.log(printData);
            //                 }
            //             };
            //             zigCompiler.send(`cd program-zig-out/${id}`);
            //             let res = await zigCompiler.send(`zig build-exe -fno-entry -rdynamic -O ReleaseSmall -target wasm32-freestanding --name ${id} main.zig`, 5000);
            //             console.log("MYRES", id, res)
                        
            //             let output;
            //             if (fs.existsSync(`${path}/${id}.wasm`)) {
            //                 console.log("SUCESS")
            //                 output = fs.readFileSync(`${path}/${id}.wasm`);
            //                 out.writeHead(200, { 'Content-Type': 'application/wasm' });
            //                 out.write(output);
            //                 console.log(output)
            //             }

            //             fs.rmSync(path, { recursive: true });
            //         } else {
            //             out.write(checkName);
            //         }                    
            //     } else {
            //         out.write("error: invalid source code");
            //     }
            // },
            "sign_out": async (path, out, data) => {
                // sign out endpoint
                if (!data.hasPermission || !data.allowRequest) {
                    out.write("error: access denied");
                    return;
                }

                // invalidate token
                let token = data.userToken;
                let id = data.userData.id;
                let profile = await users.findOne({ id });
                
                // delete old tokens
                let currTime = Date.now();
                for (let i = 0; i < profile.tokens.length; i += 2) {
                    let plainTok = AES_decrypt(profile.tokens[i + 1], secrets.MASTER_KEY).slice(16);
                    if (currTime - profile.tokens[i] > 1000*60*60*24*7 || plainTok === token) {
                        profile.tokens.splice(i, 2);
                        userCredentials[id].tokens.splice(i, 2);
                        i -= 2;
                    }
                }
                
                // update profile in storage
                users.updateOne({ id }, {$set: {
                    tokens: profile.tokens
                }});
 
                out.write("OK");
            },
        },
        ":GET:": {
            ":ACTION": (path, out, data) => {
                out.writeHead(200, { "Content-Type": "application/json" });
            },
            "ka-projects?": (path, out, data) => {
                let query = parseQuery("?" + path);
                let sort = query.sort ?? "hot";
                let page = query.page ?? 0;

                let list;
                switch (sort) {
                    case "hot":
                        list = kaHotlist.hotList;
                        break;
                    case "recent":
                        list = kaHotlist.recentList;
                        break;
                    case "top":
                        list = kaHotlist.topList;
                        break;
                }

                page *= 16;

                out.write(JSON.stringify(list.slice(page, page + 16)));
            },
            "projects?": (path, out, data) => {
                let query = parseQuery("?" + path);
                let sort = query.sort ?? "hot";
                let page = query.page ?? 0;

                let list;
                switch (sort) {
                    case "hot":
                        list = vxsHotlist.hotList;
                        break;
                    case "recent":
                        list = vxsHotlist.recentList;
                        break;
                    case "top":
                        list = vxsHotlist.topList;
                        break;
                }

                page *= 16;

                // expensive and dirty way to hide data from front end. refine this later
                let listClone = structuredClone(list.slice(page, page + 16));
                for (let i = 0; i < listClone.length; i++) {
                    // hide sensitive data from front end
                    delete listClone[i].likes;
                }

                out.write(JSON.stringify(listClone));
            },
            "getUserData?": async (path, out, data) => {
                let who = parseQuery("?" + path).who;
                let foundUser = false;

                if (typeof who === "string") {
                    let queryType = who.startsWith("id_") ? "id" : "username";

                    for (const id in userCredentials) {
                        let user = userCredentials[id];
                        if (
                            (queryType === "id" && "id_" + user.id === who) ||
                            (queryType === "username" && user.username === who)
                        ) {
                            who = user;
                            foundUser = true;
                        }
                    }
                }

                if (foundUser) {
                    out.write(JSON.stringify(await users.findOne({ id: who.id })));
                } else {
                    out.write("404 Not Found"); // user not found
                }
            },
            "getDiscussions?": async (path, out, data) => {
                const query = parseQuery("?" + path);
                if (query.isKAProgram) {
                    const res = await fetch("https://www.khanacademy.org/api/internal/graphql/feedbackQuery", {
                        "method": "POST",
                        "headers": {
                            "accept": "*/*",
                            "content-type": "application/json",
                        },
                        "body": "{\"operationName\":\"feedbackQuery\",\"variables\":{\"topicId\":\"" + query.id + "\",\"feedbackType\":\"COMMENT\",\"currentSort\":1,\"focusKind\":\"scratchpad\"},\"query\":\"query feedbackQuery($topicId: String!, $focusKind: String!, $cursor: String, $limit: Int, $feedbackType: FeedbackType!, $currentSort: Int, $qaExpandKey: String) {\\n  feedback(\\n    focusId: $topicId\\n    cursor: $cursor\\n    limit: $limit\\n    feedbackType: $feedbackType\\n    focusKind: $focusKind\\n    sort: $currentSort\\n    qaExpandKey: $qaExpandKey\\n    answersLimit: 1\\n  ) {\\n    feedback {\\n      isLocked\\n      isPinned\\n      replyCount\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      badges {\\n        name\\n        icons {\\n          smallUrl\\n          __typename\\n        }\\n        description\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flaggedByUser\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        relativeUrl\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on QuestionFeedback {\\n        hasAnswered\\n        answers {\\n          isLocked\\n          isPinned\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        isOld\\n        answerCount\\n        __typename\\n      }\\n      ... on AnswerFeedback {\\n        question {\\n          isLocked\\n          isPinned\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    cursor\\n    isComplete\\n    sortedByDate\\n    __typename\\n  }\\n}\"}"
                    });
                    const json = await res.json();
                    const discussions = json.data.feedback.feedback;
                    if (discussions !== null) {
                        for (let i = 0; i < discussions.length; i++) {
                            const discussion = discussions[i];
                            discussions[i] = {
                                id: 0,
                                program: discussion.focus.id,
                                created: new Date(discussion.date).valueOf(),
                                lastSaved: new Date(discussion.date).valueOf(),
                                type: discussion.feedbackType === "COMMENT" ? "C" : "",
                                likeCount: discussion.sumVotesIncremented,
                                flags: [],
                                content: discussion.content,
                                author: {
                                    id: discussion.author.kaid,
                                    username: "",
                                    nickname: discussion.author.nickname,
                                    avatar: discussion.author.avatar.imageSrc
                                },
                                thread: []
                            };
                        };
                        out.write(JSON.stringify(discussions));
                    } else {
                        out.write(JSON.stringify([]));
                    }
                } else {
                    if (query.id) {
                        query.ids = [query.id];
                    } else if (typeof query.ids === "string") {
                        query.ids = query.ids.split(",");

                        let output = [];
                        for (let i = 0; i < query.ids.length; i++) {
                            const id = query.ids[i];
                            let discussionData = await discussions.findOne({ id: id });
                    
                            if (discussionData !== null) {
                                discussionData.likeCount = discussionData.likes.length - discussionData.dislikes.length;
                                delete discussionData.likes;
                                delete discussionData.dislikes;

                                let author = await users.findOne({
                                    id: discussionData.author.id
                                }, {
                                    projection: { id: 1, username: 1, nickname: 1, avatar: 1, _id: 0 }
                                });
                                
                                discussionData.author = author;

                                output.push(discussionData);
                            }
                        }
                        
                        out.write(JSON.stringify(output));
                    } else {
                        out.write("error: 400");
                    }
                }
            },
        }
    },
    "/CDN/": async (path, out, data) => {
        // stop browsers from complaining about CORS issues
        out.setHeader("Access-Control-Allow-Origin", "*");

        // figure out the type of file
        let fileExt = path.split(".").reverse()[0];
        let fileType = "text";
        let fileSubType = "plain";

        if (["png", "ico", "svg", "jpg"].includes(fileExt)) fileType = "image";
        if (fileExt === "js") {
            fileSubType = "javascript";
        } else if (fileExt === "svg") {
            fileSubType = "svg+xml";
        } else {
            fileSubType = fileExt;
        }

        // tell client to cache stuff for 1 week
        if (path.includes("monaco-editor") || fileType === "image") {
            out.setHeader("Cache-Control", "public, max-age=" + (60 * 60 * 24 * 7));
        }

        let fetchPath = "./" + path;
        let dataOut = null;

        if (fetchPath.startsWith("./programs/")) {
            if (fetchPath.endsWith(".json")) {
                let id = fetchPath.slice("./programs/".length, fetchPath.length - ".json".length);
                
                const isKAProgram = id.startsWith("KA_") && id.length !== 14;
                let programData = null;
                if (isKAProgram) {
                    programData = await getKAProgram(id);
                } else {
                    programData = await programs.findOne({ id });
                }

                if (programData !== null) {
                    // hide sensitive data from front end
                    if (!isKAProgram) {
                        if (data.userData && programData.likes.includes(data.userData.id)) {
                            programData.hasLiked = true;
                        }
                        delete programData.likes;
                    }
                    dataOut = JSON.stringify(programData);
                }
            } else if (fetchPath.endsWith(".jpg")) {
                let id = fetchPath.slice("./programs/".length, fetchPath.length - ".jpg".length);
                let programData = await programs.findOne({ id });
                if (programData && typeof programData.thumbnail === "object" && programData.thumbnail !== null) {
                    dataOut = programData.thumbnail.buffer;
                }
            }
        } else {
            try {
                dataOut = fs.readFileSync(fetchPath);
            } catch (e) {
                // file doesn't exist
                dataOut = null;
            }
        }

        if (dataOut !== null) {
            // send file
            out.writeHead(200, { "Content-Type": fileType + "/" + fileSubType });
            out.write(dataOut);
        } else {
            out.write("404 Not Found");
        }
    }
};

async function useTree(path, tree, data, response) {
    let status = "404";
    try {
        for (let key in tree) {
            if (path === key || (key === "/" && path.length === 0)) {
                status = "200";
                await tree[key](path.slice(key.length), response, data);
                break;
            } else if (path.startsWith(key) && (key[key.length - 1] === "/" || key[key.length - 1] === "?") && key !== "/") {
                if (key === "/API/") {
                    if (tree[key][":ACTION"]) {
                        let newData = await tree[key][":ACTION"](path, response, data);
                        for (const prop in newData) {
                            data[prop] = newData[prop];
                        }
                    }
                    switch (data.request.method) {
                        case "POST": {
                            let postData = "";

                            data.request.on("data", chunk => {
                                postData += chunk;
                            });

                            data.request.on("end", async () => {
                                status = await useTree(path.slice(key.length), tree[key][":POST:"], {
                                    ...data,
                                    postData
                                }, response);
                                if (status === "404") response.write("404 Not Found");
                                response.end();
                            });

                            status = "pending";
                            break;
                        }
                        case "GET": {
                            status = useTree(path.slice(key.length), tree[key][":GET:"], data, response);
                            break;
                        }
                    }
                    break;
                } else if (typeof tree[key] === "function") {
                    status = "200";
                    await tree[key](path.slice(key.length), response, data);
                    break;
                } else {
                    status = useTree(path.slice(key.length), tree[key], data, response);
                    break;
                }
            } else if (key[key.length - 1] === "*" && path.startsWith(key.slice(0, key.length - 1))) {
                status = "200";
                await tree[key](path, response, data);
                break;
            } else if (key === ":ACTION") {
                let newData = await tree[key](path, response, data);
                for (const prop in newData) {
                    data[prop] = newData[prop];
                }
            }
        }
    } catch (err) {
        console.log(err);
        status = "500";
    }
    return status;
}

const server = http.createServer({key: secrets.KEY, cert: secrets.CERT}, async (request, response) => {
    // route the sandbox subdomain to the sandbox server
    if (request.headers["host"] && request.headers["host"].startsWith("sandbox.")) {
        try {
            const res = await fetch("http://127.0.0.1:" + secrets.SANDBOX_PORT + request.url);
            const buff = await res.arrayBuffer();
            const headers = Array.from(res.headers.entries());
            response.writeHead(200, headers);
            response.write(Buffer.from(buff));
            response.end();
            return;
        } catch (e) {
            response.write("500 Internal Server Error");
            response.end();
            return;
        }
    }

    // route the compile subdomain to the compiler server
    if (request.headers["host"] && request.headers["host"].startsWith("compile.")) {
        try {
            let res = await fetch("http://127.0.0.1:" + secrets.COMPILER_PORT + request.url);
            let buff = await res.arrayBuffer();
            response.writeHead(200, res.headers);
            response.write(Buffer.from(buff));
            response.end();
            return;
        } catch (e) {
            response.write("500 Internal Server Error");
            response.end();
            return;
        }
    }

    // detect spam
    let hashedUserIP;
    if (response.req.headers["x-forwarded-for"]) {
        hashedUserIP = SHA256(AES_encrypt(response.req.headers["x-forwarded-for"], secrets.MASTER_KEY));
    }
    if (!IP_monitor[hashedUserIP]) IP_monitor[hashedUserIP] = {};
    IP_monitor[hashedUserIP].requests++;
    if (IP_monitor[hashedUserIP] > 50) {
        response.write("You've been temporarily blocked from accessing this resource due to making too many requests");
        return response.end();
    }

    // do cookies stuff
    let cookies = request.headers.cookie,
        userToken = null,
        userData = null;
    if (cookies) {
        // get user token
        userToken = parseCookies(cookies).token;

        // find which user is making request
        for (let id in userCredentials) {
            let user = userCredentials[id];
            // check against all user tokens
            for (let i = 0; i < user.tokens.length; i += 2) {
                if (AES_decrypt(user.tokens[i + 1], secrets.MASTER_KEY).slice(16) === userToken) {
                    userData = await users.findOne({ id });
                }
            }
        }
    }

    try {
        // remove trailing slashes
        let url = request.url;
        if (url[url.length - 1] === "/") {
            url = url.slice(0, url.length - 1);
        }
        // prevent people from accessing upstream files
        url = url.replaceAll("../", "./").replaceAll("..\\", ".\\");

        // handle the request
        let status = await useTree(url, projectTree, { request, userData, userToken, hashedUserIP }, response);
        if (status === "404") response.write("404 Not Found");
        if (status === "500") response.write("500 Internal Server Error");
        if (status !== "pending") response.end();
    } catch (err) {
        console.log(request.url);
        console.log(err);
        response.write("500 Internal Server Error");
        response.end();
    }
});

async function main() {
    await myMongo.connect();
    
    db = myMongo.db("vxsacademy");
    
    users = db.collection("users");
    programs = db.collection("programs");
    salts = db.collection("salts");
    discussions = db.collection("discussions");

    console.log("Connected to MongoDB!");

    // load user credentials
    {
        const arr = await users.find({}).project({
            nickname: 1,
            username: 1,
            password: 1,
            tokens: 1,
            id: 1,
            _id: 0
        }).toArray();
    
        for (let i = 0; i < arr.length; i++) {
            let user = arr[i];
            userCredentials[user.id] = user;
        }
    }

    // !!! DANGER !!! for manually updating each item in a collection
    // {
    //     const useCollection = programs;
    //     (await useCollection.find({}).project({ id: 1, type: 1, _id: 0}).toArray()).forEach(item => {
    //         if (item.type === "html") {
    //             useCollection.updateOne({ id: item.id }, {$set: {
    //                 type: "webpage"
    //             }});
    //         }
    //     });
    // }

    const lists = initializeLists(db);
    vxsHotlist = lists.vxsHotlist;
    kaHotlist = lists.kaHotlist;
    
    // update browser projects the first time
    vxsHotlist.updatePrograms().then(() => {
        vxsHotlist.updateLists();
        console.log("Loaded VXS Hotlist");
    });
    kaHotlist.updatePrograms().then(() => {
        kaHotlist.updateLists();
        console.log("Loaded KA Hotlist");
    });

    // update browse projects every 10 minutes
    setInterval(() => {
        vxsHotlist.updatePrograms().then(() => {
            vxsHotlist.updateLists();
        });
        kaHotlist.updatePrograms().then(() => {
            kaHotlist.updateLists();
        });
    }, 1000 * 60 * 10);

    // lets light this candle!
    server.listen(secrets.PORT, function() {
        console.log("Main server online at https://127.0.0.1:" + secrets.PORT);
    });
}

main().catch(console.error);
