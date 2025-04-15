const fs = require("fs");
const childProcess = require("child_process");

class BashShell {
    name = null;
    terminal;
    handler;

    constructor(name) {
        this.name = name;
        this.terminal = childProcess.spawn("/bin/sh");
        this.handler = console.log;

        const that = this;

        // handle data
        this.terminal.stdout.on("data", buff => {
            that.handler({ process: that.name, type: "data", data: buff.toString() });
        });

        // handle errors
        this.terminal.stderr.on("data", buff => {
            that.handler({ process: that.name, type: "err", data: buff.toString() });
        });

        // handle closure
        this.terminal.on("close", () => {
            that.handler({ process: that.name, type: "close", data: null });
        });
    }

    async send(data, maxHold) {
        this.terminal.stdin.write(data + "\n");
        if (maxHold) {
            const id = Math.random().toString().replace(".", "");
            const that = this;

            return new Promise(resolve => {
                const oldHandler = that.handler;

                const timeOutTimeout = setTimeout(() => {
                    that.handler = oldHandler;
                    resolve();
                }, maxHold);

                that.handler = e => {
                    if (e.type === "data" && e.data.endsWith(id+"\n")) {
                        e.data = e.data.slice(0, e.data.length - (id.length + 1));
                        oldHandler(e);
                        that.handler = oldHandler;
                        clearTimeout(timeOutTimeout);
                        resolve(e);
                    } else {
                        oldHandler(e);
                    }
                };

                that.terminal.stdin.write(`echo ${id}\n`);
            });
        }
    }

    cwd() {
        let cwd = fs.readlinkSync(`/proc/${this.terminal.pid}/cwd`);
        this.handler({ type: "cwd", data: cwd });
    }

    kill() {
        this.terminal.kill();
    }
}

module.exports = BashShell;