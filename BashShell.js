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

    send(data) {
        this.terminal.stdin.write(data + "\n");
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