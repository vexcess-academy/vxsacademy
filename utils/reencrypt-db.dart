/*
    Util for re-encrypting the database after I leaked the encryption key :nervous:

    dart run ./utils/re-encrypt-db.dart OLD_KEY NEW_KEY

    Output is in ./db-reencrypted

*/

import 'dart:io';
import 'dart:convert';
import 'dart:typed_data';
import '../backend/lib/cryptography.dart';

late Uint8List oldMasterKeyBytes;
late Uint8List newMasterKeyBytes;

const db = "vxsacademy";

dynamic salts;

void exportCollection(collection) {
    final outPath = "./db-reencrypted/${db}.${collection}.json";

    // use mongoexport to get data
    Process.runSync("mongoexport", "--collection=${collection} --db=${db} --out=${outPath}".split(" "));

    // format data
    var writtenData = File(outPath).readAsStringSync().split("\n");
    for (var i = 0; i < writtenData.length; i++) {
        if (writtenData[i].isNotEmpty) {
            Map doc = json.decode(writtenData[i]);
            doc.remove("_id");

            // DO THE REENCRYPTION
            if (collection == "users") {
                // check against all user tokens
                for (var j = 0; j < doc["tokens"].length; j++) {
                    final token = doc["tokens"][j];
                    const SALT_SIZE = 16;
                    final encryptedTokenBytes = base64.decode(token);
                    final decryptedTokenBytes = AESDecrypt(encryptedTokenBytes, oldMasterKeyBytes);
                    final oldDecryptedToken = utf8.decode(decryptedTokenBytes!).substring(SALT_SIZE);

                    var foundSalt = false;
                    for (final saltPair in salts) {
                        if (saltPair["id"] == doc["id"]) {
                            final salt = saltPair["salt"];
                            final newEncryptedToken = base64.encode(AESEncrypt(salt + oldDecryptedToken, newMasterKeyBytes));
                            doc["tokens"][j] = newEncryptedToken;
                            foundSalt = true;
                            break;
                        }
                    }

                    if (!foundSalt) {
                        print("AAAAAAAAAAAAAAAa");
                    }
                }
            }

            writtenData[i] = json.encode(doc);
        }
    }
    var newData = writtenData.join(",\n");
    newData = newData.substring(0, newData.length - 2);

    // write formatted data
    File(outPath).writeAsStringSync("[\n${newData}\n]");
}

void main(List<String> args) {
    oldMasterKeyBytes = base64.decode(args[0]);
    newMasterKeyBytes = base64.decode(args[1]);

    print(args);
    exportCollection("discussions");
    exportCollection("programs");
    exportCollection("salts");

    salts = json.decode(File("./db-reencrypted/${db}.${"salts"}.json").readAsStringSync());

    exportCollection("users");
    print("Reencryption Complete");
}
