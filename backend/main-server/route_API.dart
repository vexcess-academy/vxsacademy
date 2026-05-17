import 'dart:convert';
import 'dart:io';
import 'dart:math' as Math;

import 'package:http/http.dart' as HTTP;
import 'package:bson/bson.dart';
import 'package:fixnum/fixnum.dart';

import 'ProgramData.dart';
import 'route_.dart';
import '../lib/utils.dart';
import '../lib/cryptography.dart';
import '../lib/validators.dart';
import 'hotlist.dart';
import 'main.dart';
import 'UserData.dart';
import '../../secrets/secrets.dart';

void deleteOldUserTokens(dynamic profile, UserData user) {
    var currTime = millis();
    const week = 1000*60*60*24*7;
    for (var i = 0; i < profile["tokenAges"].length; i++) {
        // convert Int64 to int
        final tokenAge = profile["tokenAges"][i].toInt();
        if (currTime - tokenAge > week) {
            profile["tokenAges"].removeAt(i);
            profile["tokens"].removeAt(i);
            user.tokenAges.removeAt(i);
            user.tokens.removeAt(i);
            i--;
        }
    }
}

final routeTree_API = {
    ":ACTION": (AP path, AO out, AD data) {
        // check if token is valid
        bool hasPermission = data["userData"] != null;

        bool allowRequest = true;

        // ignore
        HttpRequest request = data["request"];
        final origin = request.headers.value("origin");
        final validOrigin = origin is String && (origin == "https://vxsacademy.org" || origin.startsWith("https://127.0.0.1") || origin.startsWith("http://127.0.0.1"));
        final sensitiveEndpoint = ["signup", "login", "create_program", "save_program", "delete_program", "like_program", "update_profile", "compile_cpp", "log_out", "compile_zig"].contains(path.substring(5));
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

        return { 
            "hasPermission": hasPermission,
            "allowRequest": allowRequest
        };
    },
    ":POST:": {
        "signup": (AP path, AO out, AD data) async {
            if (!data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // create account endpoint
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            // validate input
            if (validateUsername(requestJSON["username"]) == "OK" && validatePassword(requestJSON["password"]) == "OK" && requestJSON["recaptchaRes"] is String) {
                var userIpData = IPMonitor[data["hashedUserIP"]];
                if (userIpData != null) {
                    if (!userIpData["accounts"]) {
                        userIpData["accounts"] = [];
                    }

                    if (userIpData["accounts"].length > 1024) {
                        out.write("error: too many accounts associated with IP");
                        return;
                    }
                }

                String username = requestJSON["username"];
                String password = requestJSON["password"];

                for (final id in userCache.keys) {
                    if (userCache[id]!.username.toLowerCase() == username.toLowerCase()) {
                        out.write("error: that username is already taken");
                        return;
                    }
                }

                var userId = genRandomToken(4) + millis().toRadixString(36);
                var userSalt = genRandomToken(16);
                var userTok = genRandomToken(32);
                /*
                    If the entire bitcoin community decided to try and focus all their computational
                    power into cracking a user token it would take 204528192898125370000 billion years
                */

                salts.insertOne({
                    "id": userId,
                    "salt": userSalt
                });

                final newTokenAge = millis();
                final newEncryptedToken = base64.encode(AESEncrypt(userSalt + userTok, base64.decode(secrets.MASTER_KEY)));

                var profile = {
                    "nickname": username,
                    "username": username,
                    "avatar": "bobert",
                    "password": SHA256(userSalt + password),
                    "tokenAges": [newTokenAge],
                    "tokens": [newEncryptedToken],
                    "id": userId,
                    "bio": "",
                    "created": millis(),
                    "projects": [],
                    "notifications": [],
                    "discussions": [],
                    "comments": [],
                    "background": "blue",
                    "newNotifs": 0
                };

                final captchaRes = await HTTP.post(
                    Uri.parse("http://127.0.0.1:${secrets.CAPTCHA_PORT}/validateKey"),
                    headers: {},
                    body: "verifierKey=${secrets.CAPTCHA_KEY}&key=${requestJSON["recaptchaRes"]}"
                );
                if (captchaRes.body == "PASS") {
                    userCache[userId] = UserData.fromMap(profile);

                    if (userIpData != null) {
                        userIpData["accounts"].push(userId);
                    }

                    // fs.writeFile("./ip-data.json", JSON.stringify(IPMonitor), err => {
                    //     if (err) {
                    //         console.log(err);
                    //     }
                    // });

                    // log new user
                    print("ACCOUNT MADE:");
                    print(profile);

                    // save user to database
                    users.insertOne(profile);

                    // send user their auth token
                    out.write(userTok);
                } else {
                    out.write("error: captcha failed");
                }
            } else {
                out.write("error: 400");
                return;
            }
        },
        "login": (AP path, AO out, AD data) async {
            if (!data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // login endpoint
            if (data["userData"] != null) {
                out.write("error: already signed in");
                return;
            }

            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            if (validateUsername(requestJSON["username"]) == "OK" && validatePassword(requestJSON["password"]) == "OK") {
                for (final id in userCache.keys) {
                    final user = userCache[id]!;
                    if (user.username == requestJSON["username"]) {
                        final userSaltPair = await salts.findOne({ "id": id });
                        if (userSaltPair == null) {
                            out.write("error: userCache out of sync 1");
                            return;
                        }
                        final salt = userSaltPair["salt"];

                        if (user.password == SHA256(salt + requestJSON["password"])) {
                            var profile = await users.findOne({ "id": id });
                            if (profile == null) {
                                out.write("error: userCache out of sync 2");
                                return;
                            }
                            
                            // generate new auth token on every sign in
                            var userTok = genRandomToken(32);

                            // delete old tokens
                            deleteOldUserTokens(profile, user);

                            final newTokenAge = millis();
                            final newEncryptedToken = base64.encode(AESEncrypt(salt + userTok, base64.decode(secrets.MASTER_KEY)));

                            // update cache
                            user.tokenAges.add(newTokenAge);
                            user.tokens.add(newEncryptedToken);
                            
                            // update profile in storage
                            profile["tokenAges"].add(newTokenAge);
                            profile["tokens"].add(newEncryptedToken);
                            users.updateOne({ "id": id }, {"\$set": {
                                "tokenAges": profile["tokenAges"]!,
                                "tokens": profile["tokens"]!
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
        "change_password": (AP path, AO out, AD data) async {
            if (!data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // change_password endpoint
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            if (validateUsername(requestJSON["username"]) == "OK" && validatePassword(requestJSON["password"]) == "OK" && validatePassword(requestJSON["new_password"]) == "OK") {
                for (final id in userCache.keys) {
                    final user = userCache[id]!;
                    if (user.username == requestJSON["username"]) {
                        final userSaltPair = await salts.findOne({ "id": id });
                        if (userSaltPair == null) {
                            out.write("error: userCache out of sync 1");
                            return;
                        }
                        final salt = userSaltPair["salt"];

                        if (user.password == SHA256(salt + requestJSON["password"])) {
                            var profile = await users.findOne({ "id": id });
                            if (profile == null) {
                                out.write("error: userCache out of sync 2");
                                return;
                            }
                            
                            final newSalt = genRandomToken(16);
                            final newHashedPassword = SHA256(newSalt + requestJSON["new_password"]);

                            // update salt in storage
                            salts.updateOne({ "id": id }, {"\$set": {
                                "salt": newSalt
                            }});

                            // update cache
                            user.password = newHashedPassword;
                            
                            // update profile in storage
                            users.updateOne({ "id": id }, {"\$set": {
                                "password": newHashedPassword
                            }});
                                
                            out.write("OK");
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
        "create_program": (AP path, AO out, AD data) async {
            // create program endpoint
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            late String programId;
            String? creationError = null;

            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            final userData = data["userData"] as UserData;

            if (userData.projects.length > 64) {
                out.write("error: your storage is full");
                return;
            }

            // temp obj for program data
            var programData = {
                "id": null,
                "title": requestJSON["title"],
                "type": requestJSON["type"],
                "likes": [],
                "forks": [],
                "likeCount": 0,
                "forkCount": 0,
                "created": millis(),
                "lastSaved": millis(),
                "flags": [],
                "width": requestJSON["width"],
                "height": requestJSON["height"],
                "fileNames": requestJSON["files"].keys.toList(),
                "files": requestJSON["files"],
                "author": {
                    "username": userData.username,
                    "id": userData.id,
                    "nickname": userData.nickname
                },
                "parent": requestJSON.containsKey("parent") ? requestJSON["parent"] : null,
                "thumbnail": requestJSON["thumbnail"],
                "discussions": []
            };

            // validate input
            var programCheck = validateProgramData(programData);
            if (programCheck != "OK") creationError = programCheck;

            // check if parent exists
            var parentProgram = null;
            if (creationError == null) {
                if (programData["parent"] != null && programData["parent"].length > 0) {
                    parentProgram = await programs.findOne({ "id": programData["parent"] });
                    if (parentProgram == null) creationError = "error: parent non-existent";
                }
            }

            if (creationError == null) {
                do {
                    // create program id
                    programId = genRandomToken(6) + millis().toRadixString(36);
                } while (await programs.findOne({ "id": programId }) != null); // check if program already exists

                programData["id"] = programId;

                // convert base64 thumbnail to binary for better storage efficiency
                final thumbnailData = requestJSON["thumbnail"] is String 
                    ? BsonBinary.from(base64.decode(requestJSON["thumbnail"].substring(requestJSON["thumbnail"].indexOf(",") + 1))) 
                    : null;
                requestJSON["thumbnail"] = thumbnailData;

                // update parent forks array
                if (parentProgram != null) {
                    programs.updateOne({ "id": programData["parent"] }, {"\$push": {
                        "forks": {
                            "id": programData["id"],
                            "created": programData["created"],
                            "likeCount": programData["likeCount"]
                        }
                    }});
                }

                // add program to user's profile
                userCache[programData["author"]["id"]]!.projects.add(programData["id"]);
                await users.updateOne({ "id": programData["author"]["id"] }, {"\$push": {
                    "projects": programData["id"]
                }});

                // save program to database
                await programs.insertOne(programData);
            }

            // send program id to user
            if (creationError != null) {
                out.write(creationError);
            } else {
                out.write(programId);
            }
        },
        "save_program": (AP path, AO out, AD data) async {
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            String? creationError = null;

            final userData = data["userData"] as UserData?;
            if (
                (userData == null) ||
                (!userData.projects.contains(requestJSON["id"])/* && !userData.isAdmin*/)
            ) {
                data["hasPermission"] = false;
            }

            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // check if dir exists
            Map<String, dynamic>? programData = await programs.findOne({ "id": requestJSON["id"] });
            if (programData == null) {
                creationError = "error: program non-existent";
            } else {
                // temp obj for program data
                programData["title"] = requestJSON["title"];
                programData["lastSaved"] = millis();
                programData["width"] = requestJSON["width"];
                programData["height"] = requestJSON["height"];
                programData["fileNames"] = requestJSON["files"].keys.toList();
                programData["files"] = requestJSON["files"];
                programData["thumbnail"] = requestJSON["thumbnail"];

                // validate input
                var programCheck = validateProgramData(programData);
                if (programCheck != "OK") creationError = programCheck;
            }

            // update program in database
            if (creationError == null) {
                final thumbnailData = requestJSON["thumbnail"] is String 
                    ? BsonBinary.from(base64.decode(requestJSON["thumbnail"].substring(requestJSON["thumbnail"].indexOf(",") + 1))) 
                    : null;

                programs.updateOne({ "id": requestJSON["id"] }, {"\$set": {
                    "title": requestJSON["title"],
                    "lastSaved": millis(),
                    "width": requestJSON["width"],
                    "height": requestJSON["height"],
                    "fileNames": requestJSON["files"].keys.toList(),
                    "files": requestJSON["files"],
                    "thumbnail": thumbnailData
                }});
            }

            // send program id to user
            if (creationError != null) {
                out.write(creationError);
            } else {
                out.write("OK");
            }
        },
        "delete_program": (AP path, AO out, AD data) async {
            // delete program endpoint
            var idToDelete = data["postBody"];
            if (idToDelete is! String) {
                out.write("error: invalid id");
                return;
            }

            UserData? userData = data["userData"];
            if (userData == null) {
                out.write("error: access denied");
                return;
            }

            var programData = await programs.findOne({ "id": idToDelete });

            // check if program exists
            if (programData == null) {
                out.write("error: program doesn't exist");
                return;
            }

            // check if has permission to delete data
            try {
                if (programData["author"]["id"] != userData.id) {
                    data["hasPermission"] = false;
                }
            } catch (e) {
                out.write("error: error while deleting program");
                return;
            }

            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // remove from parent forks array
            if (programData["parent"] != null && programData["parent"].length > 0) {
                var parentData = await programs.findOne({ "id": programData["parent"] });
                if (parentData != null) {
                    programs.updateOne({ "id": programData["parent"] }, {"\$pull": {
                        "forks": programData["id"]
                    }});
                }
            }
            
            // remove program from user's profile
            userCache[userData.id]!.projects.firstWhere((projectId) {
                return projectId == idToDelete;
            });
            users.updateOne({ "id": userData.id }, {"\$pull": {
                "projects": idToDelete
            }});

            // delete program from storage
            await programs.deleteOne({ "id": idToDelete });
            out.write("OK");
        },
        "like_program": (AP path, AO out, AD data) async {
            // like program endpoint
            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            UserData? userData = data["userData"];
            if (userData == null) {
                out.write("error: access denied");
                return;
            }

            if (data["postBody"] is! String) {
                out.write("error: invalid data");
                return;
            }

            try {
                String targetProgramId = data["postBody"];

                // get program data
                var programData = await programs.findOne({ "id": targetProgramId });
                if (programData == null) {
                    out.write("error: program not found");
                    return;
                }

                // update program data
                if (!programData["likes"].contains(userData.id)) {
                    programs.updateOne({ "id": targetProgramId }, {
                        "\$push": {
                            "likes": data["userData"].id
                        },
                        "\$inc": {
                            "likeCount": 1
                        }
                    });
                } else {
                    programs.updateOne({ "id": targetProgramId }, {
                        "\$pull": {
                            "likes": data["userData"].id
                        },
                        "\$inc": {
                            "likeCount": -1
                        }
                    });
                }

                // update parent forks array
                final parentId = programData["parent"];
                if (parentId != null && parentId.length > 0) {
                    // parent directory path
                    var parentProgram = await programs.findOne({ "id": parentId });
                    if (parentProgram != null) {
                        for (var i = 0; i < parentProgram["forks"].length; i++) {
                            Map<String, dynamic> fork = parentProgram["forks"][i];
                            if (fork["id"] == programData["id"]) {
                                fork["likeCount"] = programData["likeCount"];
                            }
                        }

                        programs.updateOne({ "id": parentId }, {"\$set": {
                            "forks": parentProgram["forks"]
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
        "create_discussion": (AP path, AO out, AD data) async {
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            UserData? userData = data["userData"];
            if (userData == null) {
                out.write("error: access denied");
                return;
            }

            String? creationError = null;
            try {
                var discussionData = {
                    "id": genRandomToken(6) + millis().toRadixString(36),
                    "program": requestJSON["program"],
                    "created": millis(),
                    "lastSaved": millis(),
                    "type": requestJSON["type"], // "Q" question | "C" comment
                    "likes": [],
                    "dislikes": [],
                    "flags": [],
                    "content": requestJSON["content"],
                    "author": {
                        "id": userData.id
                    },
                    "thread": []
                };

                var discussionCheck = validateDiscussion(discussionData);
                if (discussionCheck != "OK") creationError = discussionCheck;

                var author = await users.findOne({
                    "id": discussionData["author"]["id"]
                }, /*{
                    projection: { discussions: 1, _id: 0 }
                }*/);
                if (author == null) {
                    out.write("error: invalid user id");
                    return;
                }
                if (author["discussions"].length > 100) {
                    out.write("error: discussion quota reached");
                    return;
                }

                if (creationError == null) {
                    String targetProgramId = discussionData["program"];

                    // add discussion to program
                    var hostProgram = await programs.findOne({ "id": targetProgramId });
                    if (hostProgram != null) {
                        do {
                            // create id
                            discussionData["id"] = genRandomToken(6) + millis().toRadixString(36);
                        } while (await discussions.findOne({"id": discussionData["id"]}) != null); // check if already exists

                        // save discussion to database
                        discussions.insertOne(discussionData);
                        
                        // add discussion to program
                        programs.updateOne({ "id": targetProgramId }, {"\$push": {
                            "discussions": discussionData["id"]
                        }});

                        // add discussion to author profile
                        users.updateOne({ "id": userData.id }, {"\$push": {
                            "discussions": discussionData["id"]
                        }});

                        // notify program author
                        users.updateOne({ "id": hostProgram["author"]["id"] }, {
                            "\$push": {
                                "notifications": discussionData["id"]
                            },
                            "\$inc": {
                                "newNotifs": 1
                            }
                        });
                    }
                }

                // send status to client
                if (creationError != null) {
                    out.write(creationError);
                } else {
                    out.write("${discussionData["id"]}");
                }
                return;
            } catch (e) {
                print(e);
                out.write("error: error while creating discussion");
                return;
            }
        },
        "clear_notifs": (AP path, AO out, AD data) async {
            // mark notifs as read endpoint
            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            final userId = data["userData"].id;

            userCache[userId]!.newNotifs = 0;
            users.updateOne({ "id": userId }, {"\$set": {
                "newNotifs": 0
            }});

            out.write("OK");
        },
        "update_profile": (AP path, AO out, AD data) async {
            var requestJSON = parseJSON(data["postBody"]!);
            if (requestJSON == null || requestJSON is! Map) {
                out.write("error: invalid json");
                return;
            }

            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            final validAvatars = ["bobert-cool","bobert-pixelated","boberta","bobert-approved","bobert-chad","bobert-cringe","bobert-flexing","bobert-hacker","bobert-high","bobert-troll-nose","bobert-troll","bobert-wide","bobert","rock-thonk","floof1","floof2","floof3","floof4","floof5","pyro1","pyro2","pyro3","pyro4","pyro5"];
            final validBackgrounds = ["blue","bobert","cosmos","cyber","electric-blue","fbm","fractal-1","green","julia-rainbow","julia","magenta","photon-1","photon-2","transparent"];
            
            final userData = data["userData"] as UserData?;

            // validate input
            if (requestJSON.containsKey("nickname") && validateNickname(requestJSON["nickname"]) != "OK") {
                out.write("error: invalid nickname");
                return;
            }
            
            if (requestJSON.containsKey("username") && validateUsername(requestJSON["username"]) != "OK") {
                out.write("error: invalid username");
                return;
            }

            // if new username is different from current
            if (requestJSON.containsKey("username") && requestJSON["username"].toLowerCase() != userData!.username.toLowerCase()) {
                // check if username is already in use
                for (var id in userCache.keys) {
                    if (userCache[id]!.username.toLowerCase() == requestJSON["username"].toLowerCase()) {
                        out.write("error: that username is already taken");
                        return;
                    }
                }
            }
            
            if (requestJSON.containsKey("bio") && validateBio(requestJSON["bio"]) != "OK") {
                out.write("error: invalid bio");
                return;
            }
            
            if (requestJSON.containsKey("avatar") && !validAvatars.contains(requestJSON["avatar"])) {
                out.write("error: invalid avatar");
                return;
            }

            if (requestJSON.containsKey("background") && !validBackgrounds.contains(requestJSON["background"])) {
                out.write("error: invalid background");
                return;
            }

            final id = userData!.id;
            var updateQuery = {};

            // generate update query
            if (requestJSON.containsKey("nickname")) {
                updateQuery["nickname"] = requestJSON["nickname"];
                userCache[id]!.nickname = requestJSON["nickname"];
            }

            if (requestJSON.containsKey("username")) {
                updateQuery["username"] = requestJSON["username"];
                userCache[id]!.username = requestJSON["username"];
            }

            if (requestJSON.containsKey("bio")) {
                updateQuery["bio"] = requestJSON["bio"];
            }

            if (requestJSON.containsKey("avatar")) {
                updateQuery["avatar"] = requestJSON["avatar"];
            }
            
            if (requestJSON.containsKey("background")) {
                updateQuery["background"] = requestJSON["background"];
            }

            // update
            await users.updateOne({ "id": id }, {"\$set": updateQuery});
            final newUserData = await users.findOne({ "id": id });
            userCache[id] = UserData.fromMap(newUserData!);

            out.write("OK");
        },
        // "compile_cpp": async (path, out, data) => {
        //     var escapedCode = encodeURIComponent(data["postData"]);
        //     var res = await fetch("https://wasmexplorer-service.herokuapp.com/service.php", {
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
        //     var body = await res.text();
        //     out.write(body);
        // },
        // "compile_zig": async (path, out, data) => {
        //     var sourceCode = parseJSON(data["postData"]);
        //     if (sourceCode && sourceCode["main.zig"]) {
        //         if (!fs.existsSync("./program-zig-out")) {
        //             fs.mkdirSync("./program-zig-out");
        //         }

        //         final id = Math.random().toString().replace(".", "");
        //         final path = `./program-zig-out/${id}`;
        //         fs.mkdirSync(path);

        //         var checkName = false;
        //         for (final fileName in sourceCode) {
        //             checkName = validateFileName(fileName);
        //             if (checkName == "OK") {
        //                 fs.writeFileSync(`${path}/${fileName}`, sourceCode[fileName]);
        //             } else {
        //                 break;
        //             }
        //         }

        //         if (checkName == "OK") {
        //             final zigCompiler = new BashShell("ZigCompiler");
        //             zigCompiler.handler = function(event) {
        //                 final printData = event.data.split("\n").map(ln => "    " + ln).join("\n");
        //                 if (event.type == "err") {
        //                     out.write(printData);
        //                 } else {
        //                     console.log(printData);
        //                 }
        //             };
        //             zigCompiler.send(`cd program-zig-out/${id}`);
        //             var res = await zigCompiler.send(`zig build-exe -fno-entry -rdynamic -O ReleaseSmall -target wasm32-freestanding --name ${id} main.zig`, 5000);
        //             console.log("MYRES", id, res)
                    
        //             var output;
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
        "log_out": (AP path, AO out, AD data) async {
            // sign out endpoint
            if (!data["hasPermission"] || !data["allowRequest"]) {
                out.write("error: access denied");
                return;
            }

            // invalidate token
            var userToken = data["userToken"];
            UserData user = data["userData"];
            var profile = await users.findOne({ "id": user.id });
            if (profile == null) {
                out.write("error: userCache out of sync 3");
                return;
            }
            
            deleteOldUserTokens(profile, user);

            // delete current token
            final masterKeyBytes = base64.decode(secrets.MASTER_KEY);
            for (var i = 0; i < user.tokens.length; i++) {
                final token = user.tokens[i];

                final encryptedTokenBytes = base64.decode(token);
                final decryptedTokenBytes = AESDecrypt(encryptedTokenBytes, masterKeyBytes);
                const SALT_SIZE = 16;
                if (decryptedTokenBytes != null && utf8.decode(decryptedTokenBytes).substring(SALT_SIZE) == userToken) {
                    profile["tokenAges"].removeAt(i);
                    profile["tokens"].removeAt(i);
                    user.tokenAges.removeAt(i);
                    user.tokens.removeAt(i);
                    break;
                }
            }
            
            // update profile in storage
            users.updateOne({ "id": user.id }, {"\$set": {
                "tokenAges": profile["tokenAges"]!,
                "tokens": profile["tokens"]!
            }});

            out.write("OK");
        },
    },
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

            const PROGRAMS_PER_PAGE = 20;

            page *= PROGRAMS_PER_PAGE;

            // expensive and dirty way to hide data from front end. refine this later
            final start = Math.min<int>(page, list.length);
            final end = Math.min<int>(page + PROGRAMS_PER_PAGE, list.length);
            List<dynamic> sublist = page >= list.length ? [] : list.sublist(page, Math.min(list.length, page + PROGRAMS_PER_PAGE));
            List<dynamic> sublistClone = json.decode(json.encode(sublist));
            for (int i = 0; i < sublistClone.length; i++) {
                // hide sensitive data from front end
                Map<String, dynamic> item = sublistClone[i];
                item.remove("likes");
            }

            out.add(bytesOf(json.encode(sublistClone)));
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
            if (query["isKAProgram"] != null) {
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
                if (query["id"] != null) {
                    query["ids"] = [query["id"]];
                } else if (query["ids"] is String) {
                    query["ids"] = query["ids"].split(",");

                    var output = [];
                    for (int i = 0; i < query["ids"].length; i++) {
                        final id = query["ids"][i];
                        Map<String, dynamic>? discussionData = await discussions.findOne({ "id": id });
                
                        if (discussionData != null) {
                            discussionData["likeCount"] = discussionData["likes"].length - discussionData["dislikes"].length;
                            discussionData.remove("likes");
                            discussionData.remove("dislikes");

                            Map<String, dynamic>? author = await users.findOne({
                                "id": discussionData["author"]["id"]
                            });
                            author = projectOne(author!, {
                                "id": 1,
                                "username": 1,
                                "nickname": 1,
                                "avatar": 1,
                                "_id": 0
                            });
                            
                            discussionData["author"] = author;

                            for (final prop in discussionData.keys) {
                                if (discussionData[prop] is Int64) {
                                    discussionData[prop] = discussionData[prop].toInt();
                                }
                            }

                            output.add(discussionData);
                        }
                    }
                    
                    out.add(bytesOf(json.encode(output)));
                } else {
                    out.write("error: 400");
                }
            }
        },
    }
};    

