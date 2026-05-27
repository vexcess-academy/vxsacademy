import 'dart:io';
import 'dart:convert';
import 'package:mongo_dart/mongo_dart.dart';
import '../secrets/secrets.dart';

Future<void> restoreCollection(Db db, String collectionName, String location) async {
    final collection = db.collection(collectionName);

    await collection.drop();

    final file = File('./$location/vxsacademy.$collectionName.json');
    if (!file.existsSync()) {
        print('Warning: Backup file for $collectionName not found at ${file.path}');
        return;
    }

    final String content = file.readAsStringSync();
    final List<dynamic> docs = json.decode(content);

    for (var doc in docs) {
        if (doc is Map<String, dynamic>) {
            doc.forEach((key, value) {
                // Handle binary values matching the JS logic: 
                // { "$binary": { "base64": "...", "subType": "..." } }
                if (value is Map && value.containsKey(r'$binary')) {
                    final binaryData = value[r'$binary'];
                    if (binaryData is Map && binaryData.containsKey('base64')) {
                        final b64Data = binaryData['base64'] as String;
                        doc[key] = BsonBinary.from(base64.decode(b64Data));
                    }
                }
            });
        }
    }

    if (docs.isNotEmpty) {
        await collection.insertMany(docs.cast<Map<String, dynamic>>());
        print('Restored $collectionName (${docs.length} documents)');
    }
}

late Db db;

void main() async {
    const String location = "db-backup";
    
    if (secrets.MONGO_PASSWORD != null) {
        db = Db("mongodb://vxsacademyuser:${secrets.MONGO_PASSWORD}@${secrets.MONGO_IP}:${secrets.MONGO_PORT}/vxsacademy?authSource=vxsacademy");
        print(db);
    } else {
        print("WARNING: MongoDB is running without authentication");
        db = Db("mongodb://${secrets.MONGO_IP}:${secrets.MONGO_PORT}/vxsacademy");
    }

    try {
        await db.open();
        print("Connected to MongoDB!");

        final collections = ["discussions", "programs", "salts", "users"];
        for (final col in collections) {
            await restoreCollection(db, col, location);
        }

        print("DB Restoration Complete");
    } catch (e) {
        print("Error during restoration: $e");
    } finally {
        await db.close();
    }
}