const {
    readJSON
} = require("./utils.js");

class Analytics {
    storagePath;
    data;
    hasUpdates = false;

    constructor(storagePath) {
        this.storagePath = storagePath;
        const data = readJSON(storagePath);
        if (data === null) {
            this.data = {
                __initialMinute__: Math.floor(Date.now() / 1000 / 60)
            };
        } else {
            this.data = data;
        }

        const self = this;
        setInterval(() => {
            if (self.hasUpdates) {
                fs.writeFileSync(self.storagePath, JSON.stringify(self.data));
                self.hasUpdates = false;
            }
        }, 1000);
    }

    track(route) {
        const routeData = this.data[route];
        const currMinute = Math.floor(Date.now() / 1000 / 60) - this.data.__initialMinute__;
        if (routeData) {
            routeData.push(currMinute - routeData[routeData.length - 1]);
        } else {
            this.data[route] = [currMinute];
        }
        this.hasUpdates = true;
    }

    getData(start, end) {
        const out = structuredClone(this.data);
        const initialMinute = out.__initialMinute__;
        for (let route in out) {
            if (route !== "__initialMinute__") {
                const routeData = out[route];
                let currTime = initialMinute;

                let startIdx = 0;
                while (currTime < start && startIdx < routeData.length) {
                    currTime += routeData[startIdx];
                    startIdx++;
                }
                const startTime = currTime;

                let endIdx = startIdx;
                while (currTime < end && endIdx < routeData.length) {
                    currTime += routeData[endIdx];
                    endIdx++;
                }

                out[route] = out[route].slice(startIdx, endIdx);
                out[route][0] = startTime - initialMinute;
            }
        }
        return out;
    }
}

module.exports = Analytics;