// http server
import 'dart:io' as IO;

// for json
import 'dart:convert';

import 'dart:math' as Math;

import 'package:path/path.dart' as Path;

// http client
import 'package:http/http.dart' as HTTP;

// database
import 'package:mongo_dart/mongo_dart.dart' as Mongo;

// custom modules
import '../lib/file-io.dart';
import '../lib/http-utils.dart';
import '../lib/cryptography.dart';
import 'UserData.dart';
import 'hotlist.dart';

// the routing tree
import 'route_.dart' show routeTree;

// it'd be very bad if these were publicly available (again)
import '../../secrets/secrets.dart';

// --------------- IMPORTS END ---------------

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const ALPHANUMERIC = LETTERS + NUMBERS;

final PRNG = new Math.Random();

// for spam detection
Map<String, Map<String, dynamic>> IPMonitor = {};

// cache user credentials for fast authentification
Map<String, UserData> userCache = {};

String IPHashSalt = "";

Future<int> useTree(String path, Map<String, dynamic> tree, Map<String, dynamic> data, HttpResponse response) async {
    int status = 404;
    // print(path);
    try {
        for (final key in tree.keys) {
            // exact match
            if (path == key || (key == "/" && path.isEmpty)) {
                status = 200;
                await tree[key]("", response, data);
                break;
            } 
            // is on path
            else if (path.startsWith(key) && (key[key.length - 1] == "/" || key[key.length - 1] == "?") && key != "/") {
                if (key == "/API/") {
                    if (tree[key][":ACTION"] is Function) {
                        Map<String, dynamic> newData = await tree[key][":ACTION"](path, response, data);
                        for (final prop in newData.keys) {
                            data[prop] = newData[prop];
                        }
                    }
                    HttpRequest request = data["request"];
                    switch (request.method) {
                        case "POST": {
                            data["postBody"] = await utf8.decoder.bind(request).join();
                            status = await useTree(path.substring(key.length), tree[key][":POST:"], data, response);
                            if (status == 404) response.write("Not Found");
                            response.close();
                        }
                        case "GET": {
                            status = await useTree(path.substring(key.length), tree[key][":GET:"], data, response);
                        }
                    }
                    break;
                } else if (tree[key] is Function) {
                    response.statusCode = status = 200;
                    await tree[key](path.substring(key.length), response, data);
                    break;
                } else {
                    status = await useTree(path.substring(key.length), tree[key], data, response);
                    break;
                }
            }
            // matches wildcard
            else if (key[key.length - 1] == "*" && path.startsWith(key.substring(0, key.length - 1))) {
                status = 200;
                await tree[key](path, response, data);
                break;
            }
            // perform route action
            else if (key == ":ACTION") {
                Map<String, dynamic> newData = await tree[key](path, response, data);
                for (final prop in newData.keys) {
                    data[prop] = newData[prop];
                }
            }
        }
    } catch (err) {
        print(err);
        status = 500;
        rethrow;
    }
    return status;
}

void handleServerRequest(HttpRequest request, HttpResponse response) async {
    final headers = request.headers;

    // forward requests to subdomains
    final host = headers.value("host");
    if (host != null) {
        if (host.startsWith("sandbox.")) {
            // route the sandbox subdomain to the sandbox server
            forwardRequest("http://127.0.0.1:${secrets.SANDBOX_PORT}${request.uri}", request);
        } else if (host.startsWith("compile.")) {
            // route the compile subdomain to the compiler server
            forwardRequest("http://127.0.0.1:${secrets.COMPILER_PORT}${request.uri}", request);
        }
    }

    // detect spam
    final clientIPAddr = headers.value("x-forwarded-for");
    String? hashedUserIP = null;
    if (clientIPAddr != null) {
        hashedUserIP = SHA256(IPHashSalt + clientIPAddr);
        if (IPMonitor[hashedUserIP] == null) {
            IPMonitor[hashedUserIP] = {};
        }
        IPMonitor[hashedUserIP]!["requests"]++;
        if (IPMonitor[hashedUserIP]!["requests"] > 50) {
            response.statusCode = 429;
            response.write("You've been temporarily blocked due to making too many requests");
            response.close();
        }
    }

    // do cookies stuff
    final cookies = request.cookies;
    final userToken = getCookie(cookies, "token");
    UserData? userData = null;

    // find which user is making request
    if (userToken != null) {
        for (final id in userCache.keys) {
            final user = userCache[id]!;
            // check against all user tokens
            for (final token in user.tokens) {
                if (AESDecrypt(base64.decode(token), base64.decode(secrets.MASTER_KEY)) == userToken) {
                    userData = user;
                }
            }
        }
    }

    try {
        // normalize and remove trailing slashes
        String url = Path.normalize(request.uri.path);
        if (url.endsWith("/")) {
            url = url.substring(0, url.length - 1);
        }
        if (request.uri.query.isNotEmpty) {
            url += "?${request.uri.query}";
        }

        // handle the request
        var requestContext = {
            "request": request,
            "userData": userData,
            "userToken": userToken,
            "hashedUserIP": hashedUserIP,
            "userCache": userCache
        };
        int status = await useTree(url, routeTree, requestContext, response);
        if (status == 404) {
            response.statusCode = status;
            response.write("Not Found");
        }
        if (status == 500) {
            response.statusCode = status;
            response.write("Internal Server Error");
        }
        response.close();
    } catch (err, trace) {
        print(request.uri);
        print(err);
        print(trace);
        response.statusCode = 500;
        response.write("Internal Server Error");
        response.close();
        rethrow;
    }
}

late Mongo.Db db;
late Mongo.DbCollection  users;
late Mongo.DbCollection  programs;
late Mongo.DbCollection  salts;
late Mongo.DbCollection  discussions;

void main() async {
    print("Starting Web Server...");

    // connect to mongodb
    if (secrets.MONGO_PASSWORD != null) {
        db = Mongo.Db("mongodb://vxsacademyuser:${secrets.MONGO_PASSWORD}@${secrets.MONGO_IP}:${secrets.MONGO_PORT}/vxsacademy?authSource=vxsacademy");
        print(db);
    } else {
        print("WARNING: MongoDB is running without authentication");
        db = Mongo.Db("mongodb://${secrets.MONGO_IP}:${secrets.MONGO_PORT}/vxsacademy");
    }
    await db.open();
    users = db.collection("users");
    programs = db.collection("programs");
    salts = db.collection("salts");
    discussions = db.collection("discussions");
    print("Connected to MongoDB");

    // load user credentials
    {
        final arr = await users.find(<String, dynamic>{}).toList();
    
        for (final user in arr) {
            final userData = UserData.fromMap(user);
            userCache[userData.id] = userData;
        }
    }

    // initialize and load hotlists
    initLists(db);
    vxsHotlist.updatePrograms().then((_) {
        vxsHotlist.updateLists();
        print("Loaded VXS Hotlist");
        // print(vxsHotlist.allPrograms);
    });
    kaHotlist.updatePrograms().then((_) {
        kaHotlist.updateLists();
        print("Loaded KA Hotlist");
    });

    // update browse projects every 10 minutes
    Future.delayed(Duration(minutes: 10), () {
        vxsHotlist.updatePrograms().then((void _) {
            vxsHotlist.updateLists();
        });
        // kaHotlist.updatePrograms().then((void _) {
        //     kaHotlist.updateLists();
        // });
    });

    // init salt for ip hashing
    for (var i = 0; i < 16; i++) {
        IPHashSalt += ALPHANUMERIC[PRNG.nextInt(ALPHANUMERIC.length)];
    }

    // reset spam detection for IPs every minute
    Future.delayed(Duration(seconds: 60), () {
        for (final ip in IPMonitor.keys) {
            IPMonitor[ip]!["requests"] = 0;
        }
    });

    // create main web server
    final server = await createServer(
        CERT_PATH: secrets.CERT_PATH,
        KEY_PATH: secrets.KEY_PATH,
        PORT: secrets.PORT
    );
    print("Main server online at https://127.0.0.1:${secrets.PORT}");
    
    // listen for requests
    try {
        await for (HttpRequest request in server) {
            print("Request: ${request.method} ${request.uri.path}");
            handleServerRequest(request, request.response);
        }
    } catch (e) {
        print('Error starting server: $e');
    }

}