import 'dart:typed_data';
import 'dart:convert';

import 'package:mongo_dart/mongo_dart.dart' as Mongo;

import 'route_.dart';
import 'ProgramData.dart';
import 'hotlist.dart' show getKAProgram;
import '../lib/file-io.dart';
import '../lib/utils.dart';
import 'main.dart';

import 'main.dart' show programs;

Map<String, dynamic> shallowClone(Map<String, dynamic> m) {
    Map<String, dynamic> newMap = {};
    for (String key in m.keys) {
        newMap[key] = m[key];
    }

    return newMap;
}

void routeFn_CDN(AP path, AO out, AD data) async {
    // stop browsers from complaining about CORS issues
    out.headers.add("Access-Control-Allow-Origin", "*");

    // figure out the type of file
    String fileExt = urlFileExt(path);
    String fileType = "text";
    String fileSubType = "plain";

    if (["png", "ico", "svg", "jpg"].contains(fileExt)) fileType = "image";
    if (fileExt == "js") {
        fileSubType = "javascript";
    } else if (fileExt == "svg") {
        fileSubType = "svg+xml";
    } else {
        fileSubType = fileExt;
    }

    // tell client to cache stuff for 1 week
    if (path.contains("monaco-editor") || fileType == "image") {
        out.headers.add("Cache-Control", "public, max-age=${60 * 60 * 24 * 7}");
    }

    String fetchPath = "./" + path;
    Object? dataOut = null;

    if (fetchPath.startsWith("./programs/")) {
        if (fetchPath.endsWith(".json")) {
            String id = fetchPath.substring("./programs/".length, fetchPath.length - ".json".length);
            
            final isKAProgram = id.startsWith("KA_") && id.length != 14;
            Map<String, dynamic>? programData = null;
            if (isKAProgram) {
                programData = await getKAProgram(id);
            } else {
                programData = await programs.findOne({ "id": id });
            }

            if (programData != null) {
                if (!isKAProgram) {
                    Map<String, dynamic> clonedProgram = shallowClone(programData);

                    // update user specific data on program
                    if (data["userData"] != null && clonedProgram["likes"].contains(data["userData"].id)) {
                        clonedProgram["hasLiked"] = true;
                    }

                    // hide sensitive data from front end
                    clonedProgram.remove("likes");

                    dynamic thumbnail = clonedProgram["thumbnail"];
                    if (thumbnail != null && thumbnail is Mongo.BsonBinary) {
                        clonedProgram["thumbnail"] = base64.encode(clonedProgram["thumbnail"].byteList);
                    }

                    programData = clonedProgram;
                }
                dataOut = utf8.encode(json.encode(programData));
            }
        } else if (fetchPath.endsWith(".jpg")) {
            var id = fetchPath.substring("./programs/".length, fetchPath.length - ".jpg".length);
            var programData = await programs.findOne({ "id": id });
            if (programData != null && programData["thumbnail"] != null) {
                Mongo.BsonBinary thumbnail = programData["thumbnail"];
                dataOut = thumbnail.byteList;
            }
        }
    } else {
        try {
            if (fetchPath.startsWith("./lib")) {
                dataOut = await readFile(fetchPath);
            } else {
                dataOut = await readFile("./frontend/main/" + fetchPath);
            }
        } catch (e) {
            // file doesn't exist
            dataOut = null;
        }
    }

    if (dataOut != null) {
        // send file
        out.statusCode = 200;
        out.headers.add("Content-Type", "${fileType}/${fileSubType}");
        if (dataOut is String) {
            out.write(dataOut);
        } else if (dataOut is Uint8List) {
            out.add(dataOut);
        } else {
            throw "unreachable";
        }
    } else {
        out.write("404 Not Found");
    }
    out.close();
}
