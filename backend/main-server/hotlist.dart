import 'dart:convert';
import 'dart:math' as Math;

import 'package:mongo_dart/mongo_dart.dart' as Mongo;
import 'package:http/http.dart' as HTTP;

import '../lib/utils.dart';

const loadAmount = 1;

Map<String, Map<String, dynamic>> KAProgramsCache = {};
Future<Map<String, dynamic>?> getKAProgram(String id) async {
    // KA_ + originalProgramId
    if (KAProgramsCache[id] == null) {
        dynamic programJSON;
        try {
            final programRes = await HTTP.post(
                Uri.parse("https://www.khanacademy.org/api/internal/graphql/programQuery"),
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    "x-ka-fkey": "0"
                },
                body: "{\"operationName\":\"programQuery\",\"query\":\"query programQuery(\$programId: String!) {\\n  programById(id: \$programId) {\\n    byChild\\n    category\\n    created\\n    creatorProfile: author {\\n      id\\n      nickname\\n      profileRoot\\n      profile {\\n        accessLevel\\n        __typename\\n      }\\n      __typename\\n    }\\n    deleted\\n    description\\n    spinoffCount: displayableSpinoffCount\\n    docsUrlPath\\n    flags\\n    flaggedBy: flaggedByKaids\\n    flaggedByUser: isFlaggedByCurrentUser\\n    height\\n    hideFromHotlist\\n    id\\n    imagePath\\n    isProjectOrFork: originIsProject\\n    isOwner\\n    kaid: authorKaid\\n    key\\n    newUrlPath\\n    originScratchpad: originProgram {\\n      deleted\\n      translatedTitle\\n      url\\n      __typename\\n    }\\n    restrictPosting\\n    revision: latestRevision {\\n      id\\n      code\\n      configVersion\\n      created\\n      editorType\\n      folds\\n      __typename\\n    }\\n    slug\\n    sumVotesIncremented\\n    title\\n    topic: parentCurationNode {\\n      id\\n      nodeSlug: slug\\n      relativeUrl\\n      slug\\n      translatedTitle\\n      __typename\\n    }\\n    translatedTitle\\n    url\\n    userAuthoredContentType\\n    upVoted\\n    width\\n    __typename\\n  }\\n}\",\"variables\":{\"programId\":\"" + id.substring(3) + "\"}}",
            );
            programJSON = json.decode(programRes.body)["data"]["programById"];
        } catch (err) {
            print(err);
        }
        
        String? programType = null;
        final KAprogramType = programJSON["userAuthoredContentType"];
        switch (KAprogramType) {
            case "WEBPAGE":
                programType = "webpage";
                break;
            case "PJS":
                programType = "pjs";
                break;
            case "PYTHON":
                programType = "python";
                break;
        }

        final profileRoot = programJSON["creatorProfile"]["profileRoot"];
        final programCreated = DateTime.parse(programJSON["created"]).millisecondsSinceEpoch;
        final programUpdated = DateTime.parse(programJSON["revision"]["created"]).millisecondsSinceEpoch;
        final authorUsername = profileRoot is String ? profileRoot.split("/")[2] : null;
        
        List<String> fileNames = [];
        Map<String, String> programFiles = {};
        switch (programType) {
            case "webpage":
                fileNames.add("index.html");
                programFiles["index.html"] = programJSON["revision"]["code"] ?? "";
                break;
            case "pjs":
                fileNames.add("index.js");
                programFiles["index.js"] = programJSON["revision"]["code"] ?? "";
                break;
            case "python":
                final pyFiles = json.decode(programJSON["revision"]["code"] ?? "{}")["files"];
                if (pyFiles is List) {
                    for (int i = 0; i < pyFiles.length; i++) {
                        final fileName = pyFiles[i]["filename"];
                        fileNames.add(fileName);
                        programFiles[fileName] = pyFiles[i]["code"];
                    }
                }
                break;
        }

        // KAProgramsCache[id] = new ProgramData(
        //     id: id,
        //     title: programJSON?.title ?? "",
        //     type: programType as String,
        //     forks: [],
        //     created: programCreated,
        //     lastSaved: programUpdated,
        //     flags: [],
        //     width: programType == "webpage" ? 600 : (programJSON?.width ?? 400),
        //     height: programJSON?.height ?? 400,
        //     author: new ProgramDataUserData(
        //         username: authorUsername as String,
        //         id: programJSON?.creatorProfile?.id,
        //         nickname: programJSON?.creatorProfile?.nickname
        //     ),
        //     parent: null,
        //     thumbnail: null,
        //     fileNames: fileNames,
        //     files: programFiles,
        //     discussions: [],
        //     likes: [],
        //     likeCount: programJSON?.sumVotesIncremented,
        //     forkCount: programJSON?.spinoffCount
        // );

        KAProgramsCache[id] = {
            "id": id,
            "title": programJSON["title"] ?? "",
            "type": programType,
            "forks": [
                // {
                //     "id": "osjamxlmp81jfs",
                //     "created": 1695061820584,
                //     "likeCount": 0
                // },
                // {
                //     "id": "5Kjhm6lonohkkn",
                //     "created": 1699322074718,
                //     "likeCount": 0
                // }
            ],
            "created": programCreated,
            "lastSaved": programUpdated,
            "flags": [],
            "width": programType == "webpage" ? 600 : (programJSON["width"] ?? 400),
            "height": programJSON["height"] ?? 400,
            "author": {
                "username": authorUsername,
                "id": programJSON["creatorProfile"]["id"],
                "nickname": programJSON["creatorProfile"]["nickname"]
            },
            "parent": null,
            "thumbnail": null,
            "files": programFiles,
            "discussions": [
                // "vbEyWelsp8ecx0",
                // "TvM9Bhlsp8h23w",
                // "gOZmUglspjox79"
            ],
            "likeCount": programJSON["sumVotesIncremented"],
            "forkCount": programJSON["spinoffCount"]
        };
    }

    return KAProgramsCache[id];
}

class Hotlist {
    late double Function(int, int) calcHotness;
    late Future<void> Function(Hotlist) updatePrograms_;
    List<Map<String, dynamic>> allPrograms = [];
    List<Map<String, dynamic>> hotList = [];
    List<Map<String, dynamic>> recentList = [];
    List<Map<String, dynamic>> topList = [];

    Hotlist({
        required double Function(int, int) calcHotness,
        required Future<void> Function(Hotlist) updatePrograms
    }) {
        this.calcHotness = calcHotness;
        this.updatePrograms_ = updatePrograms;
    }

    void updateLists() {
        hotList = allPrograms.sublist(0);
        recentList = allPrograms.sublist(0);
        topList = allPrograms.sublist(0);

        final self = this;
        hotList.sort((a, b) {
            final bHotness = self.calcHotness(
                b["likeCount"].toInt() + b["forkCount"].toInt(), 
                b["created"].toInt()
            );
            final aHotness = self.calcHotness(
                a["likeCount"].toInt() + a["forkCount"].toInt(), 
                a["created"].toInt()
            );
            return ((bHotness - aHotness) * 1000).toInt();
        });
        recentList.sort((a, b) => b["created"].toInt() - a["created"].toInt());
        topList.sort((a, b) => b["likeCount"].toInt() - a["likeCount"].toInt());
    }

    Future<void> updatePrograms() async {
        await updatePrograms_(this);
    }
}

late Hotlist kaHotlist;
late Hotlist vxsHotlist;
bool listsInitialized = false;

void initLists(Mongo.Db db) {
    kaHotlist = new Hotlist(
        calcHotness: (int upvotes, int uploadedOn) {
            // Constants for the Wilson Score Interval
            const z = 1.96; // 95% confidence interval
            
            // Calculate the fraction of upvotes
            final p = upvotes / (upvotes + 0.1); // Adding 0.1 to avoid division by zero
            
            // Calculate the "score"
            final temp = (p * (0.1 - p) + (z * z) / (4 * (upvotes + 0.1))) / (upvotes + 0.1);
            final score =
                (p + (z * z) / (2 * (upvotes + 0.1)) - z * Math.sqrt(temp.abs())) /
                (0.1 + (z * z) / (upvotes + 0.1));
            
            // Calculate the hotness by considering the time elapsed
            final elapsedTime = (millis() - uploadedOn) / (1000 * 60 * 60); // Convert milliseconds to hours
            final hotness = score / elapsedTime;
            
            return hotness;
        },
        updatePrograms: (Hotlist hl) async {
            final programs = [];
            hl.allPrograms = [];
            
            try {

                dynamic getList(String sortOrder, int amt) async {
                    final res = await HTTP.post(
                        Uri.parse("https://www.khanacademy.org/api/internal/graphql/hotlist"),
                        headers: {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/json",
                            "x-ka-fkey": "0"
                        },
                        body: "{\"operationName\":\"hotlist\",\"query\":\"query hotlist(\$curationNodeId: String, \$onlyOfficialProjectSpinoffs: Boolean!, \$sort: ListProgramSortOrder, \$pageInfo: ListProgramsPageInfo, \$userAuthoredContentTypes: [UserAuthoredContentType!]) {\\n  listTopPrograms(\\n    curationNodeId: \$curationNodeId\\n    onlyOfficialProjectSpinoffs: \$onlyOfficialProjectSpinoffs\\n    sort: \$sort\\n    pageInfo: \$pageInfo\\n    userAuthoredContentTypes: \$userAuthoredContentTypes\\n  ) {\\n    complete\\n    cursor\\n    programs {\\n      id\\n      key\\n      authorKaid\\n      authorNickname\\n      displayableSpinoffCount\\n      imagePath\\n      sumVotesIncremented\\n      translatedTitle: title\\n      url\\n      userAuthoredContentType\\n      __typename\\n    }\\n    __typename\\n  }\\n}\",\"variables\":{\"onlyOfficialProjectSpinoffs\":false,\"curationNodeId\":\"x45aed616\",\"sort\":\"" + sortOrder + "\",\"userAuthoredContentTypes\":[\"PJS\",\"PYTHON\",\"SQL\",\"WEBPAGE\"],\"pageInfo\":{\"itemsPerPage\":${amt}}}}"
                    ); // TODO: handle failed requests
                    if (res.statusCode == 200) {
                        final jsonData = json.decode(res.body);
                        return jsonData["data"]["listTopPrograms"]["programs"];
                    } else {
                        return null;
                    }
                }
    
                var reqPrograms = await getList("HOT", loadAmount);
                if (reqPrograms != null) {
                    for (int i = 0; i < reqPrograms.length; i++) {
                        programs.add(reqPrograms[i]);
                    }
                }
    
                reqPrograms = await getList("RECENT", loadAmount);
                if (reqPrograms != null) {
                    for (int i = 0; i < reqPrograms.length; i++) {
                        programs.add(reqPrograms[i]);
                    }
                }
                
                reqPrograms = await getList("UPVOTE", loadAmount);
                if (reqPrograms != null) {
                    for (int i = 0; i < reqPrograms.length; i++) {
                        programs.add(reqPrograms[i]);
                    }
                }        
            } catch (err, trace) {
                print(err);
                print(trace);
                return;
            }
            
            for (int i = 0; i < programs.length; i++) {
                final program = programs[i];
                final formattedProgram = await getKAProgram("KA_" + program["id"]);
                
                hl.allPrograms.add(formattedProgram!);

                // {
                //     "id": formattedProgram.id,
                //     "title": formattedProgram.title,
                //     "type": formattedProgram.type,
                //     "forks": formattedProgram.forks,
                //     "created": formattedProgram.created,
                //     "author": {
                //         "username": formattedProgram.author.username,
                //         "id": formattedProgram.author.id,
                //         "nickname": formattedProgram.author.nickname
                //     },
                //     "likeCount": formattedProgram.likeCount,
                //     "forkCount": formattedProgram.forkCount,
                // }
            }
        }
    );
    
    vxsHotlist = new Hotlist(
        calcHotness: (int upvotes, int uploadedOn) {
            // Constants for the Wilson Score Interval
            const z = 1.96; // 95% confidence interval
            
            // Calculate the fraction of upvotes
            final p = upvotes / (upvotes + 1); // Adding 0.1 to avoid division by zero
            
            // Calculate the "score"
            final score =
                (p + (z * z) / (2 * (upvotes + 1)) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * (upvotes + 1))) / (upvotes + 1))) /
                (1 + (z * z) / (upvotes + 1));
            
            // Calculate the hotness by considering the time elapsed
            final elapsedTime = (millis() - uploadedOn) / (1000 * 60 * 60); // Convert milliseconds to hours
            final hotness = score / elapsedTime;
            
            return hotness;
        },
        updatePrograms: (Hotlist hl) async {
            final programs = db.collection("programs");
            hl.allPrograms = await project(
                programs.find(<String, dynamic>{}),
                {
                    "id": 1,
                    "type": 1,
                    "title": 1,
                    "likeCount": 1,
                    "forkCount": 1,
                    "created": 1,
                    "author": 1,
                    "code": 1,
                    "_id": 0
                }
            );
        }
    );

    listsInitialized = true;
}

// let KAAPIHashes = readJSON("./ka-api-hashes.json") ?? null;
// function updateKAAPIHashes() {
//     fetch("https://cdn.jsdelivr.net/gh/bhavjitChauhan/khan-api@safelist/hashes.json")
//         .then(res => res.json())
//         .then(json => {
//             KAAPIHashes = json;
//             fs.writeFileSync("./ka-api-hashes.json", JSON.stringify(json, "", "  "))
//         })
//         .catch(console.log);
// }
// if (KAAPIHashes === null) updateKAAPIHashes();

