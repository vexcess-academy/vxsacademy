import 'dart:io' as IO;
import 'dart:typed_data';
import 'package:path/path.dart' as Path;
import 'dart:convert';

Future<Uint8List?> readFile(String path, {bool elevatedPermissions=false}) async {
    final absProjectPath = Path.normalize(IO.Directory.current.absolute.path);
    
    final file = IO.File(path);
    String absFilePath = Path.normalize(file.absolute.path);
    print("Reading: $absFilePath");

    final whitelist = [
        "/frontend/main/",
        "/frontend/sandbox/",
        "/frontend/build/",
        "/lib/",
    ];

    if (absFilePath.startsWith(absProjectPath)) {
        bool approved = false;
        if (elevatedPermissions) {
            approved = true;
        } else {
            final subFilePath = absFilePath.substring(absProjectPath.length);
            for (String pattern in whitelist) {
                if (subFilePath.startsWith(pattern)) {
                    approved = true;
                    break;
                }
            }
        }
        
        if (approved) {
            if (file.existsSync()) {
                return await file.readAsBytesSync();
            }
            return null;
        }
        
        throw "Permission denied while reading ${absFilePath}";
    }

    throw "Refused to read file outside of project directory";
}

Future<String?> readFileAsString(String path, {bool elevatedPermissions=false}) async {
    final content = await readFile(path, elevatedPermissions: elevatedPermissions);
    return content != null ? utf8.decode(content) : null;
}

Future<dynamic> readJSON(String path, {bool elevatedPermissions=false}) async {
    final content = await readFileAsString(path, elevatedPermissions: elevatedPermissions);
    return content == null ? null : json.decode(content);
}