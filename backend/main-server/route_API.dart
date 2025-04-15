import 'dart:convert';
import 'dart:io';
import 'dart:math' as Math;

import 'package:http/http.dart' as HTTP;

import 'ProgramData.dart';
import 'route_.dart';
import 'utils.dart';
import 'hotlist.dart';
import 'main.dart';
import 'UserData.dart';

final routeTree_API = {
    ":ACTION": (AP path, AO out, AD data) {
        // check if token is valid
        bool hasPermission = data["userData"] != null;

        bool allowRequest = true;

        // ignore
        HttpRequest request = data["request"];
        final origin = request.headers.value("origin");
        final validOrigin = origin is String && (origin == "https://vxsacademy.org" || origin.startsWith("https://127.0.0.1") || origin.startsWith("http://127.0.0.1"));
        final sensitiveEndpoint = ["signup", "login", "create_program", "save_program", "delete_program", "like_program", "update_profile", "compile_cpp", "sign_out", "compile_zig"].contains(path.substring(5));
        // console.log(origin)
        if (sensitiveEndpoint && !validOrigin) {
            allowRequest = false;
        }

        if (allowRequest) {
            // yeet CORS :D
            out.headers.add("Access-Control-Allow-Origin", "*");
        } else {
            out.headers.add("Access-Control-Allow-Origin", "https://vxsacademy.org");
        }

        // Disable all auth because of data leak
        hasPermission = false;

        return { 
            "hasPermission": hasPermission,
            "allowRequest": allowRequest
        };
    },
    // ":POST:": {
    //     "signup": (AP path, AO out, AD data) async {
    //         if (!data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // create account endpoint
    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         // validate input
    //         if (validateUsername(json.username) == "OK" && validatePassword(json.password) == "OK" && typeof json.recaptchaRes == "string") {
    //             if (!IPMonitor[data["hashedUserIP"]].accounts) {
    //                 IPMonitor[data["hashedUserIP"]].accounts = [];
    //             }

    //             if (IPMonitor[data["hashedUserIP"]].accounts.length > 1024) {
    //                 out.write("error: too many accounts associated with IP");
    //                 return;
    //             }

    //             for (var id in userCache) {
    //                 if (userCache[id].username.toLowerCase() == json.username.toLowerCase()) {
    //                     out.write("error: that username is already taken");
    //                     return;
    //                 }
    //             }

    //             var userId = genRandomToken(4) + millis().toString(36);
    //             var userSalt = genRandomToken(16);
    //             var userTok = genRandomToken(32);
    //             /*
    //                 If the entire bitcoin community decided to try and focus all their computational
    //                 power into cracking a user token it would take 204528192898125370000 billion years
    //             */

    //             salts.insertOne({
    //                 id: userId,
    //                 salt: userSalt
    //             });

    //             var profile = {
    //                 nickname: json.username,
    //                 username: json.username,
    //                 avatar: "bobert",
    //                 password: SHA256(userSalt + json.password),
    //                 tokens: [millis(), AES_encrypt(userSalt + userTok, secrets.MASTER_KEY)],
    //                 id: userId,
    //                 bio: "",
    //                 created: millis(),
    //                 projects: [],
    //                 notifications: [],
    //                 discussions: [],
    //                 comments: [],
    //                 background: "blue"
    //             };

    //             var res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secrets.RECAPTCHA_KEY}&response=${json.recaptchaRes}`, {
    //                 method: "POST"
    //             });
    //             var captcha = await res.json();
    //             if (captcha.success) {
    //                 userCache[profile.id] = {
    //                     username: profile.username,
    //                     password: profile.password,
    //                     tokens: profile.tokens,
    //                     id: profile.id,
    //                     nickname: profile.nickname
    //                 };

    //                 IPMonitor[data["hashedUserIP"]].accounts.push(profile.id);

    //                 fs.writeFile("./ip-data.json", JSON.stringify(IPMonitor), err => {
    //                     if (err) {
    //                         console.log(err);
    //                     }
    //                 });

    //                 // log new user
    //                 print("ACCOUNT MADE", profile);

    //                 // save user to database
    //                 users.insertOne(profile);

    //                 // send user their auth token
    //                 out.write(userTok);
    //             } else {
    //                 out.write("error: recaptcha failed");
    //             }
    //         } else {
    //             out.write("error: 400");
    //             return;
    //         }
    //     },
    //     "login": (AP path, AO out, AD data) async {
    //         if (!data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // login endpoint
    //         if (data["userData"]) {
    //             out.write("error: already signed in");
    //             return;
    //         }

    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         if (validateUsername(json.username) == "OK" && validatePassword(json.password) == "OK") {
    //             for (var id in userCache) {
    //                 var user = userCache[id];
    //                 if (user.username == json.username) {
    //                     var salt = (await salts.findOne({ id: user.id })).salt;

    //                     if (user.password == SHA256(salt + json.password)) {
    //                         var profile = await users.findOne({ id });
                            
    //                         // generate new auth token on every sign in
    //                         var userTok = genRandomToken(32);

    //                         // delete old tokens
    //                         var currTime = millis();
    //                         for (var i = 0; i < profile.tokens.length; i += 2) {
    //                             if (currTime - profile.tokens[i] > 1000*60*60*24*7) {
    //                                 profile.tokens.splice(i, 2);
    //                                 userCache[id].tokens.splice(i, 2);
    //                                 i -= 2;
    //                             }
    //                         }

    //                         // update cache
    //                         userCache[id].tokens.push(millis(), AES_encrypt(salt + userTok, secrets.MASTER_KEY));
                            
    //                         // update profile in storage
    //                         profile.tokens.push(millis(), AES_encrypt(salt + userTok, secrets.MASTER_KEY));
    //                         users.updateOne({ id }, {$set: {
    //                             tokens: profile.tokens
    //                         }});
                                
    //                         out.write(userTok);
    //                         return;
    //                     } else {
    //                         out.write("error: password is incorrect");
    //                         return;
    //                     }
    //                 }
    //             }

    //             out.write("error: that username doesn't exist");
    //         } else {
    //             out.write("error: 400");
    //             return;
    //         }
    //     },
    //     "create_program": (AP path, AO out, AD data) async {
    //         // create program endpoint
    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         var programId;
    //         var creationError = false;

    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         if (data["userData"].projects.length > 32) {
    //             out.write("error: your storage is full");
    //             return;
    //         }

    //         // temp obj for program data
    //         var programData = {
    //             id: null,
    //             title: json.title,
    //             type: json.type,
    //             likes: [],
    //             forks: [],
    //             likeCount: 0,
    //             forkCount: 0,
    //             created: millis(),
    //             lastSaved: millis(),
    //             flags: [],
    //             width: json.width,
    //             height: json.height,
    //             fileNames: Object.keys(json.files),
    //             files: json.files,
    //             author: {
    //                 username: data["userData"].username,
    //                 id: data["userData"].id,
    //                 nickname: data["userData"].nickname
    //             },
    //             parent: json.parent ?? null,
    //             thumbnail: json.thumbnail ? new bson.Binary(Buffer.from(json.thumbnail.slice(json.thumbnail.indexOf(",") + 1), 'base64')) : null,
    //             discussions: []
    //         };

    //         // validate input
    //         var programCheck = validateProgramData(programData);
    //         if (programCheck != "OK") creationError = programCheck;

    //         // check if parent exists
    //         var parentProgram = null;
    //         if (programData.parent != null && programData.parent.length > 0) {
    //             parentProgram = await programs.findOne({id: programData.parent});
    //             if (parentProgram == null) creationError = "error: parent non-existent";
    //         }

    //         if (!creationError) {
    //             var directory;
    //             do {
    //                 // create program id
    //                 programId = genRandomToken(6) + millis().toString(36);
    //             } while (await programs.findOne({id: programId}) != null); // check if program already exists

    //             programData.id = programId;

    //             // update parent forks array
    //             if (parentProgram != null) {
    //                 programs.updateOne({ id: programData.parent }, {$push: {
    //                     forks: {
    //                         id: programData.id,
    //                         created: programData.created,
    //                         likeCount: programData.likeCount
    //                     }
    //                 }});
    //             }

    //             // add program to user's profile
    //             await users.updateOne({ id: programData.author.id }, {$push: {
    //                 projects: programData.id
    //             }});

    //             // save program to database
    //             await programs.insertOne(programData);
    //         }

    //         // send program id to user
    //         if (creationError != false) {
    //             out.write(creationError);
    //         } else {
    //             out.write(programId);
    //         }
    //     },
    //     "save_program": (AP path, AO out, AD data) async {
    //         // save program endpoint
    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         var creationError = false;

    //         if (!data["userData"] || (!data["userData"].projects.contains(json.id) && !data["userData"].isAdmin)) {
    //             data["hasPermission"] = false;
    //         }

    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // check if dir exists
    //         var programData = await programs.findOne({ id: json.id });
    //         if (programData == null) {
    //             creationError = "error: program non-existent";
    //         }

    //         // temp obj for program data
    //         programData.title = json.title;
    //         programData.lastSaved = millis();
    //         programData.width = json.width;
    //         programData.height = json.height;
    //         programData.fileNames = Object.keys(json.files);
    //         programData.files = json.files;
    //         programData.thumbnail = json.thumbnail;

    //         // validate input
    //         var programCheck = validateProgramData(programData);
    //         if (programCheck != "OK") creationError = programCheck;

    //         // update program in database
    //         if (!creationError) {
    //             programs.updateOne({ id: json.id }, {$set: {
    //                 title: json.title,
    //                 lastSaved: millis(),
    //                 width: json.width,
    //                 height: json.height,
    //                 fileNames: Object.keys(json.files),
    //                 files: json.files,
    //                 thumbnail: json.thumbnail ? new bson.Binary(Buffer.from(json.thumbnail.slice(json.thumbnail.indexOf(",") + 1), 'base64')) : null
    //             }});
    //         }

    //         // send program id to user
    //         if (creationError != false) {
    //             out.write(creationError);
    //         } else {
    //             out.write("OK");
    //         }
    //     },
    //     "delete_program": (AP path, AO out, AD data) async {
    //         // delete program endpoint

    //         var programData = await programs.findOne({ id: data["postData"] });

    //         // check if program exists
    //         if (programData == null) {
    //             out.write("error: program doesn't exist");
    //             return;
    //         }

    //         // check if has permission to delete data
    //         try {
    //             if (programData.author.id != data["userData"].id) {
    //                 data["hasPermission"] = false;
    //             }
    //         } catch (e) {
    //             out.write("error: error while deleting program");
    //             return;
    //         }

    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // remove from parent forks array
    //         if (programData.parent != null && programData.parent.length > 0) {
    //             var parentData = await programs.findOne({ id: programData.parent });
    //             if (parentData != null) {
    //                 programs.updateOne({ id: programData.parent }, {$pull: {
    //                     forks: programData.id
    //                 }});
    //             }
    //         }
            
    //         // remove program from user's profile
    //         users.updateOne({ id: data["userData"].id }, {$pull: {
    //             projects: data["postData"]
    //         }});

    //         // delete program from storage
    //         await programs.deleteOne({ id: data["postData"] });
    //         out.write("OK");
    //     },
    //     "like_program": (AP path, AO out, AD data) async {
    //         // like program endpoint
    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         try {
    //             // get program data
    //             var programData = await programs.findOne({ id: data["postData"] });

    //             // update program data
    //             if (!programData.likes.contains(data["userData"].id)) {
    //                 programs.updateOne({ id: data["postData"] }, {
    //                     $push: {
    //                         likes: data["userData"].id
    //                     },
    //                     $inc: {
    //                         likeCount: 1
    //                     }
    //                 });
    //             } else {
    //                 programs.updateOne({ id: data["postData"] }, {
    //                     $pull: {
    //                         likes: data["userData"].id
    //                     },
    //                     $inc: {
    //                         likeCount: -1
    //                     }
    //                 });
    //             }

    //             // update parent forks array
    //             if (programData.parent != null && programData.parent.length > 0) {
    //                 // parent directory path
    //                 var parentProgram = await programs.findOne({ id: programData.parent });
    //                 if (parentProgram != null) {
    //                     for (var i = 0; i < parentProgram.forks.length; i++) {
    //                         var fork = parentProgram.forks[i];
    //                         if (fork.id == programData.id) {
    //                             fork.likeCount = programData.likeCount;
    //                         }
    //                     }

    //                     programs.updateOne({ id: programData.parent }, {$set: {
    //                         forks: parentProgram.forks
    //                     }});
    //                 }
    //             }
    //             out.write("200");
    //             return;
    //         } catch (e) {
    //             out.write("error: error while liking program");
    //             return;
    //         }
    //     },
    //     "create_discussion": (AP path, AO out, AD data) async {
    //         // create program endpoint
    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         var creationError = false;
    //         try {
    //             var discussionData = {
    //                 id: genRandomToken(6) + millis().toString(36),
    //                 program: json.program,
    //                 created: millis(),
    //                 lastSaved: millis(),
    //                 type: json.type, // "Q" question | "C" comment
    //                 likes: [],
    //                 dislikes: [],
    //                 flags: [],
    //                 content: json.content,
    //                 author: {
    //                     id: data["userData"].id
    //                 },
    //                 thread: []
    //             };

    //             var discussionCheck = validateDiscussion(discussionData);
    //             if (discussionCheck != "OK") creationError = discussionCheck;

    //             var author = await users.findOne({
    //                 id: discussionData.author.id
    //             }, {
    //                 projection: { discussions: 1, _id: 0 }
    //             });
    //             if (!author) {
    //                 out.write("error: invalid user id");
    //                 return;
    //             }
    //             if (author.discussions.length > 100) {
    //                 out.write("error: discussion quota reached");
    //                 return;
    //             }

    //             if (!creationError) {
    //                 // add discussion to program
    //                 var hostProgram = await programs.findOne({ id: discussionData.program });
    //                 if (hostProgram != null) {
    //                     do {
    //                         // create id
    //                         discussionData.id = genRandomToken(6) + millis().toString(36);
    //                     } while (await discussions.findOne({id: discussionData.id}) != null); // check if already exists

    //                     // save discussion to database
    //                     discussions.insertOne(discussionData);
                        
    //                     // add discussion to program
    //                     programs.updateOne({ id: discussionData.program }, {$push: {
    //                         discussions: discussionData.id
    //                     }});

    //                     // add discussion to author profile
    //                     users.updateOne({ id: data["userData"].id }, {$push: {
    //                         discussions: discussionData.id
    //                     }});

    //                     // notify program author
    //                     users.updateOne({ id: hostProgram.author.id }, {
    //                         $push: {
    //                             notifications: discussionData.id
    //                         },
    //                         $inc: {
    //                             newNotifs: 1
    //                         }
    //                     });
    //                 }
    //             }

    //             // send status to client
    //             if (creationError != false) {
    //                 out.write(creationError);
    //             } else {
    //                 out.write(`${discussionData.id}`);
    //             }
    //             return;
    //         } catch (e) {
    //             console.log(e)
    //             out.write("error: error while creating discussion");
    //             return;
    //         }
    //     },
    //     "clear_notifs": (AP path, AO out, AD data) async {
    //         // mark notifs as read endpoint
    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // clear notifs
    //         users.updateOne({ id: data["userData"].id }, {$set: {
    //             newNotifs: 0
    //         }});

    //         out.write("OK");
    //     },
    //     "update_profile": (AP path, AO out, AD data) async {
    //         // change nickname endpoint
    //         var json = parseJSON(data["postData"]);
    //         if (json == null) {
    //             out.write("error");
    //             return;
    //         }

    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         final validAvatars = ["bobert-cool","bobert-pixelated","boberta","bobert-approved","bobert-chad","bobert-cringe","bobert-flexing","bobert-hacker","bobert-high","bobert-troll-nose","bobert-troll","bobert-wide","bobert","rock-thonk","floof1","floof2","floof3","floof4","floof5","pyro1","pyro2","pyro3","pyro4","pyro5"];
    //         final validBackgrounds = ["blue","bobert","cosmos","cyber","electric-blue","fbm","fractal-1","green","julia-rainbow","julia","magenta","photon-1","photon-2","transparent"];
            
    //         // validate input
    //         if (json.nickname && validateNickname(json.nickname) != "OK") {
    //             out.write("error: 400");
    //             return;
    //         }
    //         if (json.username && validateUsername(json.username) != "OK") {
    //             out.write("error: 400");
    //             return;
    //         }
    //         for (var id in userCache) {
    //             if (userCache[id].username.toLowerCase() == json.username.toLowerCase()) {
    //                 out.write("error: that username is already taken");
    //                 return;
    //             }
    //         }
    //         if (json.bio && validateBio(json.bio) != "OK") {
    //             out.write("error: 400");
    //             return;
    //         }
    //         if (json.avatar && !validAvatars.contains(json.avatar)) {
    //             out.write("error: 400");
    //             return;
    //         }
    //         if (json.background && !validBackgrounds.contains(json.background)) {
    //             out.write("error: 400");
    //             return;
    //         }

    //         final id = data["userData"].id;
    //         var updateQuery = {};

    //         // update info
    //         if (json.nickname) {
    //             updateQuery.nickname = json.nickname;
    //             userCache[id].nickname = json.nickname;
    //         }
    //         if (json.username) {
    //             updateQuery.username = json.username;
    //             userCache[id].username = json.username;
    //         }
    //         if (json.bio) {
    //             updateQuery.bio = json.bio;
    //         }
    //         if (json.avatar) {
    //             updateQuery.avatar = json.avatar;
    //         }
    //         if (json.background) {
    //             updateQuery.background = json.background;
    //         }

    //         await users.updateOne({ id }, {$set: updateQuery});

    //         out.write("OK");
    //     },
    //     // "compile_cpp": async (path, out, data) => {
    //     //     var escapedCode = encodeURIComponent(data["postData"]);
    //     //     var res = await fetch("https://wasmexplorer-service.herokuapp.com/service.php", {
    //     //         "headers": {
    //     //         "accept": "*/*",
    //     //         "accept-language": "en-US,en;q=0.9",
    //     //         "content-type": "application/x-www-form-urlencoded",
    //     //         "prefer": "safe",
    //     //         "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Microsoft Edge\";v=\"116\"",
    //     //         "sec-ch-ua-mobile": "?0",
    //     //         "sec-ch-ua-platform": "\"Windows\"",
    //     //         "sec-fetch-dest": "empty",
    //     //         "sec-fetch-mode": "cors",
    //     //         "sec-fetch-site": "cross-site"
    //     //         },
    //     //         "referrer": "https://mbebenita.github.io/",
    //     //         "referrerPolicy": "strict-origin-when-cross-origin",
    //     //         "body": "input=" + escapedCode + "&action=cpp2wast&options=-std%3Dc%2B%2B11%20-Os",
    //     //         "method": "POST",
    //     //         "mode": "cors",
    //     //         "credentials": "omit"
    //     //     });
    //     //     var body = await res.text();
    //     //     out.write(body);
    //     // },
    //     // "compile_zig": async (path, out, data) => {
    //     //     var sourceCode = parseJSON(data["postData"]);
    //     //     if (sourceCode && sourceCode["main.zig"]) {
    //     //         if (!fs.existsSync("./program-zig-out")) {
    //     //             fs.mkdirSync("./program-zig-out");
    //     //         }

    //     //         final id = Math.random().toString().replace(".", "");
    //     //         final path = `./program-zig-out/${id}`;
    //     //         fs.mkdirSync(path);

    //     //         var checkName = false;
    //     //         for (final fileName in sourceCode) {
    //     //             checkName = validateFileName(fileName);
    //     //             if (checkName == "OK") {
    //     //                 fs.writeFileSync(`${path}/${fileName}`, sourceCode[fileName]);
    //     //             } else {
    //     //                 break;
    //     //             }
    //     //         }

    //     //         if (checkName == "OK") {
    //     //             final zigCompiler = new BashShell("ZigCompiler");
    //     //             zigCompiler.handler = function(event) {
    //     //                 final printData = event.data.split("\n").map(ln => "    " + ln).join("\n");
    //     //                 if (event.type == "err") {
    //     //                     out.write(printData);
    //     //                 } else {
    //     //                     console.log(printData);
    //     //                 }
    //     //             };
    //     //             zigCompiler.send(`cd program-zig-out/${id}`);
    //     //             var res = await zigCompiler.send(`zig build-exe -fno-entry -rdynamic -O ReleaseSmall -target wasm32-freestanding --name ${id} main.zig`, 5000);
    //     //             console.log("MYRES", id, res)
                    
    //     //             var output;
    //     //             if (fs.existsSync(`${path}/${id}.wasm`)) {
    //     //                 console.log("SUCESS")
    //     //                 output = fs.readFileSync(`${path}/${id}.wasm`);
    //     //                 out.writeHead(200, { 'Content-Type': 'application/wasm' });
    //     //                 out.write(output);
    //     //                 console.log(output)
    //     //             }

    //     //             fs.rmSync(path, { recursive: true });
    //     //         } else {
    //     //             out.write(checkName);
    //     //         }                    
    //     //     } else {
    //     //         out.write("error: invalid source code");
    //     //     }
    //     // },
    //     "sign_out": (AP path, AO out, AD data) async {
    //         // sign out endpoint
    //         if (!data["hasPermission"] || !data["allowRequest"]) {
    //             out.write("error: access denied");
    //             return;
    //         }

    //         // invalidate token
    //         var token = data["userToken"];
    //         var id = data["userData"].id;
    //         var profile = await users.findOne({ id });
            
    //         // delete old tokens
    //         var currTime = millis();
    //         for (var i = 0; i < profile.tokens.length; i += 2) {
    //             var plainTok = AES_decrypt(profile.tokens[i + 1], secrets.MASTER_KEY).slice(16);
    //             if (currTime - profile.tokens[i] > 1000*60*60*24*7 || plainTok == token) {
    //                 profile.tokens.splice(i, 2);
    //                 userCache[id].tokens.splice(i, 2);
    //                 i -= 2;
    //             }
    //         }
            
    //         // update profile in storage
    //         users.updateOne({ id }, {$set: {
    //             tokens: profile.tokens
    //         }});

    //         out.write("OK");
    //     },
    // },
    ":GET:": {
        ":ACTION": (AP path, AO out, AD data) {
            out.headers.add("Content-Type", "application/json");
            return <String, dynamic>{};
        },
        "ka-projects?": (AP path, AO out, AD data) async {
            final query = parseQuery("?" + path);
            final sort = query["sort"] ?? "hot";
            var page = query["page"] ?? 0;

            List<Map<String, dynamic>> list = [];
            if (listsInitialized) {
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
            }

            page *= 16;

            final start = Math.min<int>(page, list.length);
            final end = Math.min<int>(page + 16, list.length);
            out.add(bytesOf(json.encode(list.sublist(start, end))));
        },
        "projects?": (AP path, AO out, AD data) async {
            final query = parseQuery("?" + path);
            final sort = query["sort"] ?? "hot";
            var page = query["page"] ?? 0;

            late List<Map<String, dynamic>> list = [];
            if (listsInitialized) {
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
            }

            page *= 16;

            // expensive and dirty way to hide data from front end. refine this later
            final start = Math.min<int>(page, list.length);
            final end = Math.min<int>(page + 16, list.length);
            List<dynamic> listClone = json.decode(json.encode(list.sublist(page, page + 16)));
            for (int i = 0; i < listClone.length; i++) {
                // hide sensitive data from front end
                Map<String, dynamic> item = listClone[i];
                item.remove("likes");
            }

            out.add(bytesOf(json.encode(listClone)));
        },
        "getUserData?": (AP path, AO out, AD data) async {
            var who = parseQuery("?" + path)["who"];
            UserData? foundUser = null;

            if (who is String) {
                final queryType = who.startsWith("id_") ? "id" : "username";

                Map<String, UserData> userCache = data["userCache"];
                for (final id in userCache.keys) {
                    final user = userCache[id]!;
                    if (
                        (queryType == "id" && "id_" + user.id == who) ||
                        (queryType == "username" && user.username == who)
                    ) {
                        foundUser = user;
                    }
                }
            }

            if (foundUser != null) {
                out.write(foundUser.toJSONString());
            } else {
                out.write("404 Not Found"); // user not found
            }
        },
        "getDiscussions?": (AP path, AO out, AD data) async {
            final query = parseQuery("?" + path);
            if (query["isKAProgram"]) {
                final res = await HTTP.post(
                    Uri.parse("https://www.khanacademy.org/api/internal/graphql/feedbackQuery"),
                    headers: {
                        "accept": "*/*",
                        "content-type": "application/json",
                    },
                    body: "{\"operationName\":\"feedbackQuery\",\"variables\":{\"topicId\":\"" + query["id"] + "\",\"feedbackType\":\"COMMENT\",\"currentSort\":1,\"focusKind\":\"scratchpad\"},\"query\":\"query feedbackQuery(\$topicId: String!, \$focusKind: String!, \$cursor: String, \$limit: Int, \$feedbackType: FeedbackType!, \$currentSort: Int, \$qaExpandKey: String) {\\n  feedback(\\n    focusId: \$topicId\\n    cursor: \$cursor\\n    limit: \$limit\\n    feedbackType: \$feedbackType\\n    focusKind: \$focusKind\\n    sort: \$currentSort\\n    qaExpandKey: \$qaExpandKey\\n    answersLimit: 1\\n  ) {\\n    feedback {\\n      isLocked\\n      isPinned\\n      replyCount\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      badges {\\n        name\\n        icons {\\n          smallUrl\\n          __typename\\n        }\\n        description\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flaggedByUser\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        relativeUrl\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on QuestionFeedback {\\n        hasAnswered\\n        answers {\\n          isLocked\\n          isPinned\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        isOld\\n        answerCount\\n        __typename\\n      }\\n      ... on AnswerFeedback {\\n        question {\\n          isLocked\\n          isPinned\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    cursor\\n    isComplete\\n    sortedByDate\\n    __typename\\n  }\\n}\"}"
                );
                final jsonData = json.decode(res.body);
                final discussions = jsonData.data.feedback.feedback;
                if (discussions != null) {
                    for (int i = 0; i < discussions.length; i++) {
                        final discussion = discussions[i];
                        discussions[i] = {
                            "id": 0,
                            "program": discussion.focus.id,
                            "created": DateTime.parse(discussion.date).millisecondsSinceEpoch,
                            "lastSaved": DateTime.parse(discussion.date).millisecondsSinceEpoch,
                            "type": discussion.feedbackType == "COMMENT" ? "C" : "",
                            "likeCount": discussion.sumVotesIncremented,
                            "flags": [],
                            "content": discussion.content,
                            "author": {
                                "id": discussion.author.kaid,
                                "username": "",
                                "nickname": discussion.author.nickname,
                                "avatar": discussion.author.avatar.imageSrc
                            },
                            "thread": []
                        };
                    };
                    out.add(bytesOf(json.encode(discussions)));
                } else {
                    out.add(bytesOf(json.encode([])));
                }
            } else {
                if (query["id"]) {
                    query["ids"] = [query["id"]];
                } else if (query["ids"] is String) {
                    query["ids"] = query["ids"].split(",");

                    var output = [];
                    for (int i = 0; i < query["ids"].length; i++) {
                        final id = query["ids"][i];
                        // var discussionData = await discussions.findOne({ id: id });
                
                        // if (discussionData != null) {
                        //     discussionData.likeCount = discussionData.likes.length - discussionData.dislikes.length;
                        //     delete discussionData.likes;
                        //     delete discussionData.dislikes;

                        //     var author = await users.findOne({
                        //         id: discussionData.author.id
                        //     }, {
                        //         projection: { id: 1, username: 1, nickname: 1, avatar: 1, _id: 0 }
                        //     });
                            
                        //     discussionData.author = author;

                        //     output.push(discussionData);
                        // }
                    }
                    
                    out.add(bytesOf(json.encode(output)));
                } else {
                    out.write("error: 400");
                }
            }
        },
    }
};    
