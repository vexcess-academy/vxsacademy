import "file-io.dart";

import 'utils.dart';

const int MAX_INT = 0x7FFFFFFFFFFFFFFF;

class FileCache {
    Map<String, String> files = new Map();
    Map<String, int> readTimestamps = new Map();
    Map<String, String> pathToFilePathMap = new Map();

    int cacheSize = 0;
    int maxCacheSize = 0;

    FileCache(Map<String, String> mappings, int maxCacheMB) {
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

    Future<String?> get(String path) async {
        if (readTimestamps.containsKey(path)) {
            // update cache
            readTimestamps[path] = millis();
            return files[path]!;
        } else {
            // read file
            String? fileContents;
            if (pathToFilePathMap[path] != null) {
                fileContents = await readFileAsString(pathToFilePathMap[path]!);
            } else {
                fileContents = await readFileAsString("./pages/${path}");
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

    void clear() {
        readTimestamps.clear();
        files.clear();
    }
}