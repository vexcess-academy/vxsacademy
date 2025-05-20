import "dart:convert";
import "dart:typed_data";

int millis() {
    return DateTime.now().millisecondsSinceEpoch;
}

Map<String, dynamic> parseQuery(String url) {
    final quesIdx = url.indexOf("?");
    if (quesIdx == -1) {
        return {};
    } else {
        final end = url.substring(quesIdx + 1);
        if (end.length > 2) {
            final vars = end.split("&");
            Map<String, dynamic> keys = {};
            for (var i = 0; i < vars.length; i++) {
                final eqIdx = vars[i].indexOf("=");
                if (eqIdx != -1) {
                    final temp = [
                        Uri.decodeComponent(vars[i].substring(0, eqIdx)),
                        Uri.decodeComponent(vars[i].substring(eqIdx + 1))
                    ];
                    final number = int.tryParse(temp[1]);
                    if (number != null) {
                        keys[temp[0]] = number;
                    } else {
                        keys[temp[0]] = temp[1];
                    }
                } else {
                    keys[vars[i]] = null;
                }
            }
            return keys;
        } else {
            return {};
        }
    }
}

dynamic parseJSON(String str) {
    try {
        return json.decode(str);
    } catch (err) {
        return null;
    }
}

List<T> castList<T>(List<dynamic> arr) {
    List<T> newArr = [];
    for (final item in arr) {
        if (item is double && T == int) {
            newArr.add(item.toInt() as T);
        } else {
            newArr.add(item as T);
        }
    }
    return newArr;
}

Future<List<Map<String, dynamic>>> project(Stream<Map<String, dynamic>> stream, Map<String, int> mask) async {
    final data = await stream.toList();
    for (final item in data) {
        List<String> keysToRemove = [];
        for (final key in item.keys) {
            if ((mask[key] == null && key != "_id") || mask[key] == 0) {
                keysToRemove.add(key);
            }
        }
        for (final key in keysToRemove) {
            item.remove(key);
        }
    }
    return data;
}

Map<String, dynamic> projectOne(Map<String, dynamic> item, Map<String, int> mask) {
    Map<String, dynamic> masked = {};
    for (String key in mask.keys) {
        bool include = mask[key] == 1;
        if (include) {
            masked[key] = item[key];
        }
    }
    return masked;
}

Uint8List bytesOf(Object obj) {
    if (obj is String) {
        return utf8.encode(obj);
    } else if (obj is Uint8List) {
        return obj;
    } else {
        throw "Invalid input to SHA256";
    }
}

String urlFileExt(String url) {
    int idx = url.lastIndexOf(".");
    if (idx == -1) {
        return "";
    }
    return url.substring(idx + 1);
}