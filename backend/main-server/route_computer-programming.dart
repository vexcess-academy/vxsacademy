import 'route_.dart';
import 'hotlist.dart' show getKAProgram;
import 'main.dart' show programs;

final routeTree_computerprogramming = {
    "browse": (AP path, AO out, AD data) async {
        // browse projects
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("browse", data["userData"], DEFAULT_OG_TAGS));
        out.close();
    },
    "ka-browse": (AP path, AO out, AD data) async {
        // browse projects
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("browse", data["userData"], DEFAULT_OG_TAGS));
        out.close();
    },
    "javascript": (AP path, AO out, AD data) async {
        // return course page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("course", data["userData"], DEFAULT_OG_TAGS));
        out.close();
        return;
    },
    "javascript/": (AP path, AO out, AD data) async {
        // return course page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("course", data["userData"], DEFAULT_OG_TAGS));
        out.close();
        return;
    },
    "webgl": (AP path, AO out, AD data) async {
        // return course page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("course", data["userData"], DEFAULT_OG_TAGS));
        out.close();
        return;
    },
    "webgl/": (AP path, AO out, AD data) async {
        // return course page
        out.headers.add('Content-Type', 'text/html');
        out.write(await createHTMLPage("course", data["userData"], DEFAULT_OG_TAGS));
        out.close();
        return;
    },
    "new/": (AP path, AO out, AD data) async {
        // new program path
        final programType = path;
        if (["webpage", "pjs", "python", "glsl", "jitlang", "cpp", "java", "zig"].contains(programType)) {
            String webpageCode = await createHTMLPage("program", data["userData"], DEFAULT_OG_TAGS);

            out.headers.add('Content-Type', 'text/html');
            // "Cross-Origin-Opener-Policy": "same-origin",
            // "Cross-Origin-Embedder-Policy": "require-corp"
            out.write(webpageCode);
            out.close();
        }
    },
    "*": (AP path, AO out, AD data) async {
        try {
            // existing program path
            final splitPath = path.split("/");
            final programId = splitPath[0];
            final isFullScreen = splitPath.length > 1 && splitPath[1] == "fullscreen";

            final isKAProgram = programId.startsWith("KA_") && programId.length != 14;
            Map<String, dynamic>? programData = null;
            if (isKAProgram) {
                programData = await getKAProgram(programId);
            } else {
                programData = await programs.findOne({"id": programId}/*, {projection: {id: 1, _id: 0}}*/);
            }

            if (programData == null) {
                // exit if program not found
                out.statusCode = 404;
                out.write("Not Found");
                return out.close();
            } else {
                String lazySanitize(String str) {
                    const allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
                    String out = "";
                    for (int i = 0; i < str.length; i++) {
                        if (allowed.contains(str[i])) {
                            out += str[i];
                        }
                    }
                    return out;
                }

                String webpageCode;
                final thumbnailURL = isKAProgram ? "https://www.khanacademy.org/computer-programming/i/${programData["id"].substring(3)}/latest.png" : "/CDN/programs/${programData["id"]}.jpg";
                final openGraphInsert = """
                    <meta content="${lazySanitize(programData["title"])}" property="og:title" />
                    <meta content="Made by ${lazySanitize(programData["author"]["nickname"])}" property="og:description" />
                    <meta content="${thumbnailURL}" property="og:image" />
                """;
                
                if (isFullScreen) {
                    final programFullscreenCode = await fileCache.get("program-fullscreen");
                    webpageCode = programFullscreenCode!
                        .replaceFirst("<!-- OPEN GRAPH INSERT -->", openGraphInsert);
                        // .replace("<!-- USER DATA INSERT -->", `<script>\n\tvar userData = ${userData ? JSON.stringify(userData).replaceAll("</", "<\\/") : "null"}\n</script>`);
                } else {
                    webpageCode = await createHTMLPage("program", data["userData"], openGraphInsert);
                }
                
                out.headers.add('Content-Type', 'text/html');
                // "Cross-Origin-Opener-Policy": "same-origin",
                // "Cross-Origin-Embedder-Policy": "require-corp"
                out.write(webpageCode);
                out.close();
            }
        } catch (err) {
            print(err);
        }
    }
};
