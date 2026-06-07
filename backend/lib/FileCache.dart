import "file-io.dart";
import 'dart:convert';
import 'dart:typed_data';
import 'utils.dart';

const int MAX_INT = 0x7FFFFFFFFFFFFFFF;

class FileCache {
    Map<String, Uint8List> files = new Map();
    Map<String, int> readTimestamps = new Map();
    Map<String, String> pathToFilePathMap = new Map();
    String rootPath;

    int cacheSize = 0;
    int maxCacheSize = 0;

    FileCache(this.rootPath, Map<String, String> mappings, int maxCacheMB) {
        this.pathToFilePathMap = mappings;
        this.maxCacheSize = maxCacheMB * 1024 * 1024;
    }

    String? getOldestFilePath() {
        if (files.isEmpty) {
            return null;
        }

        int oldestTime = MAX_INT;
        late String oldestPath;
        for (String path in readTimestamps.keys) {
            if (readTimestamps[path]! < oldestTime) {
                oldestPath = path;
                oldestTime = oldestTime;
            }
        }

        return oldestPath;
    }

    Future<Uint8List?> getBytes(String path) async {
        if (readTimestamps.containsKey(path)) {
            // update cache
            readTimestamps[path] = millis();
            return files[path]!;
        } else {
            // read file
            Uint8List? fileContents;
            if (pathToFilePathMap[path] != null) {
                fileContents = await readFile(pathToFilePathMap[path]!);
            } else {
                fileContents = await readFile(this.rootPath + path);
            }

            // doesn't exist
            if (fileContents == null) {
                return null;
            }

            // update cache
            readTimestamps[path] = millis();
            files[path] = fileContents;

            // update cache size
            cacheSize += fileContents.length;

            // while the cache is too big
            while (cacheSize > maxCacheSize) {
                final oldestFilePath = getOldestFilePath();

                // update cache size
                cacheSize -= files[oldestFilePath]!.length;
                readTimestamps.remove(oldestFilePath);
                files.remove(oldestFilePath);
            }
            
            return fileContents;
        }
    }

    Future<String?> get(String path) async {
        final bytes = await getBytes(path);
        return bytes == null ? null : utf8.decode(bytes);
    }

    void clear() {
        readTimestamps.clear();
        files.clear();
    }
}