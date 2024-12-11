const fs = require("node:fs");

class FileCache {
    files = new Map();
    readTimeStamps = new Map();
    mappings;
    cacheSize = 0;
    maxCacheSize;

    // cache size is in MB
    constructor(mappings, maxCacheSize) {
        this.mappings = mappings;
        this.maxCacheSize = maxCacheSize * 1024 * 1024;
    }

    get(name) {
        if (this.readTimeStamps.has(name)) {
            // update cache
            this.readTimeStamps.set(name, Date.now());
            return this.files.get(name);
        } else {
            let data = fs.readFileSync(this.mappings[name] ?? `./pages/${name}`, "utf8").toString();

            // update cache
            this.readTimeStamps.set(name, Date.now());
            this.files.set(name, data);

            // update cache size
            this.cacheSize += data.length;

            // while the cache is too big
            while (this.cacheSize > this.maxCacheSize) {
                const iterator = map1.entries();
                let oldestName;
                let oldestTimeStamp = Infinity;

                // find oldest file
                let entry;
                while (entry = iterator.next().value) {
                    if (entry[1] < oldestTimeStamp) {
                        oldestTimeStamp = entry[1];
                        oldestName = entry[0];
                    }
                }

                // update cache size
                this.cacheSize -= this.files.get(oldestName).length;
                
                this.readTimeStamps.delete(oldestName);
                this.files.delete(oldestName);
            }
            
            return data;
        }
    }

    clear() {
        this.readTimeStamps.clear();
        this.files.clear();
    }
}

module.exports = FileCache;