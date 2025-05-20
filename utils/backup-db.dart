import 'dart:io';
import 'dart:convert';

void exportCollection(collection) {
    const db = "vxsacademy";
    final outPath = "./db-backup/${db}.${collection}.json";

    // use mongoexport to get data
    Process.runSync("mongoexport", "--collection=${collection} --db=${db} --out=${outPath}".split(" "));

    // format data
    var writtenData = File(outPath).readAsStringSync().split("\n");
    for (var i = 0; i < writtenData.length; i++) {
        if (writtenData[i].isNotEmpty) {
            Map doc = json.decode(writtenData[i]);
            doc.remove("_id");
            writtenData[i] = json.encode(doc);
        }
    }
    var newData = writtenData.join(",\n");
    newData = newData.substring(0, newData.length - 2);

    // write formatted data
    File(outPath).writeAsStringSync("[\n${newData}\n]");
}

void main() {
    exportCollection("discussions");
    exportCollection("programs");
    exportCollection("salts");
    exportCollection("users");
    print("Export Complete");
}
