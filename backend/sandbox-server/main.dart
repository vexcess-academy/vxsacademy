import 'dart:convert';

import 'package:path/path.dart' as Path;

// custom modules
import '../lib/file-io.dart';
import '../lib/http-utils.dart';
import '../lib/FileCache.dart';
import '../lib/utils.dart';

import '../../secrets/secrets.dart';

var fileCache = new FileCache(
    "./frontend-sandbox/",
    {}, 16
);

const blacklist = [
    "cloudflareworkers.com",
    "*.repl.co",
    "*.cyclic.app",
];

String base64FromString(String data) {
    return base64.encode(utf8.encode(data));
}

void handleServerRequest(HttpRequest request, HttpResponse response) async {
    try {
        // normalize and remove trailing slashes
        String url = Path.normalize(request.uri.path);
        if (url.endsWith("/")) {
            url = url.substring(0, url.length - 1);
        }
        if (request.uri.query.isNotEmpty) {
            url += "?${request.uri.query}";
        }

        Map<String, dynamic> reqQuery = parseQuery(url);
        List<String> allowList = [];
        if (reqQuery.isNotEmpty) {
            if (reqQuery["allowed"] is String) {
                allowList = reqQuery["allowed"].split(",");
            }
            url = url.substring(0, url.indexOf("?"));
        }

        if (url.startsWith("/")) {
            url = url.substring(1);
        }
        final fetchPath = "./${url}";

        if (fetchPath == "./clearCache") {
            fileCache.clear();
            response.statusCode = 200;
            response.write("Cache Cleared");
            response.close();
            return;
        }

        if (fetchPath.length > 2) {
            var dataType = urlFileExt(fetchPath);
            switch (dataType) {
                case "html": dataType = "text/html"; break;
                case "js": dataType = "text/javascript"; break;
                case "css": dataType = "text/css"; break;
                case "png": dataType = "image/png"; break;
            }
            
            response.headers.add("Content-Type", dataType);
            response.headers.add("Access-Control-Allow-Origin", "*");
            response.headers.add("Access-Control-Allow-Origin", "*");
            response.headers.set("X-Frame-Options", "ALLOWALL");
            // "Cross-Origin-Opener-Policy": "same-origin",
            // "Cross-Origin-Embedder-Policy": "require-corp"

            if (dataType == "text/html") {
                response.headers.add("Origin-Agent-Cluster", "?1");
                
                if (reqQuery["allowAll"] != true) {
                    allowList.add(base64FromString("javac.vexcess.repl.co"));
                    allowList.add(base64FromString("sandbox.vexcess.repl.co"));
                    allowList.add(base64FromString("cdn.jsdelivr.net"));

                    // remove blacklisted domains
                    for (var i = 0; i < allowList.length; i++) {
                        final asciiDomain = utf8.decode(base64.decode(allowList[i]));
                        allowList[i] = asciiDomain;
                        for (var j = 0; j < blacklist.length; j++) {
                            if (blacklist[j] == asciiDomain) {
                                allowList.removeAt(i);
                                i--;
                            } else if (blacklist[j][0] == "*" && asciiDomain.endsWith(blacklist[j].substring(2))) {
                                allowList.removeAt(i);
                                i--;
                            } 
                        }
                    }

                    response.headers.add("Content-Security-Policy", "default-src data: blob: 'self' 'unsafe-inline' 'unsafe-eval' ${allowList   .join(" ")};");
                }
                
            }

            final fileContents = await fileCache.get(fetchPath);
            if (fileContents != null) {
                response.statusCode = 200;
                response.add(utf8.encode(fileContents));
            } else {
                response.statusCode = 404;
            }
            response.close();
            return;
        }
        
        response.statusCode = 404;
        response.write("Not Found");
        response.close();
    } catch (e, trace) {
        print(e);
        print(trace);
        response.statusCode = 500;
        response.write("Internal Server Error");
        response.close();
    }
}

void main() async {
    // create main web server
    final server = await createServer(
        PORT: secrets.SANDBOX_PORT
    );
    print("Sandbox server online at http://127.0.0.1:${secrets.SANDBOX_PORT}");
    
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
