import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:http/http.dart' as HTTP;

import 'FileCache.dart';
import 'UserData.dart';
import 'cryptography.dart';
import 'file-io.dart';
import 'ProgramData.dart';
import 'hotlist.dart' show getKAProgram;
import 'utils.dart';

import 'route_computer-programming.dart';
import 'route_API.dart';
import 'route_CDN.dart';

import '../../secrets/secrets.dart';

var fileCache = new FileCache({
    "main": "./frontend/page-template.html",
    "computer-programming": "./frontend/pages/computer-programming/computer-programming.html",
    "program": "./frontend/pages/computer-programming/program.html",
    "program-fullscreen": "./frontend/pages/computer-programming/program-fullscreen.html",
    "course": "./frontend/pages/computer-programming/course.html",
    "browse": "./frontend/pages/computer-programming/browse.html",
    "home": "./frontend/pages/home/home.html",
    "login": "./frontend/pages/login/login.html",
    "profile": "./frontend/pages/profile/profile.html",
    "logs/dev": "./frontend/pages/logs/dev.html",
    "logs/finance": "./frontend/pages/logs/finance.html",
    "tos": "./frontend/pages/tos/tos.html",
    "privacy-policy": "./frontend/pages/privacy-policy/privacy-policy.html",
}, 16);

const DEFAULT_OG_TAGS = """
    <meta content="VExcess Academy" property="og:title" />
    <meta content="A website where anyone can learn to code and share their projects." property="og:description" />
    <meta content="/CDN/images/logo.png#a" property="og:image" />
""";

Future<String> createHTMLPage(String pg, UserData? userData, String openGraphTags) async {
    final stringifiedUserData = userData != null ? json.encode(userData) : "null";
    final userDataBytes = bytesOf(stringifiedUserData);
    final base64UserData = base64.encode(userDataBytes);

    String pageHTML = (await fileCache.get("main"))!;
    return pageHTML
        .replaceFirst("<!-- OPEN GRAPH INSERT -->", openGraphTags)
        .replaceFirst("<!-- USER DATA INSERT -->", "<script>\n\tlet userData = JSON.parse(new TextDecoder(\"utf-8\").decode(Base64.decode(\"${base64UserData}\")));\n</script>")
        .replaceFirst("<!-- PAGE CONTENT INSERT -->", await fileCache.get(pg) ?? "");
}

typedef AP = String;
typedef AO = HttpResponse;
typedef AD = Map<String, dynamic>;

final Map<String, dynamic> routeTree = {
    "/clearCache": (AP path, AO out, AD data) async {
        fileCache.clear();
        try {
            await HTTP.get(Uri.parse("http://127.0.0.1:${secrets.SANDBOX_PORT}/clearCache"));
        } catch (e) {
            // sandbox server must be offline
        }
        out.write("Cache Cleared");
        out.close();
    },
    "/": (AP path, AO out, AD data) async {
        // main path
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("home", data["userData"], DEFAULT_OG_TAGS));
        out.close();
    },
    "/login": (AP path, AO out, AD data) async {
        // login page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("login", data["userData"], DEFAULT_OG_TAGS));
    },
    "/profile/": (AP path, AO out, AD data) async {
        // profile page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("profile", data["userData"], DEFAULT_OG_TAGS));
    },
    "/logs/": (AP path, AO out, AD data) async {
        // logs path
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("logs/" + path, data["userData"], DEFAULT_OG_TAGS));
    },
    "/tos": (AP path, AO out, AD data) async {
        // tos path
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("tos" + path, data["userData"], DEFAULT_OG_TAGS));
    },
     "/privacy-policy": (AP path, AO out, AD data) async {
        // tos path
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("privacy-policy" + path, data["userData"], DEFAULT_OG_TAGS));
    },
    "/computer-programming": (AP path, AO out, AD data) async {
        // computer programming home
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("computer-programming", data["userData"], DEFAULT_OG_TAGS));
    },
    "/computer-programming/": routeTree_computerprogramming,
    "/API/": routeTree_API,
    "/CDN/": routeFn_CDN
};