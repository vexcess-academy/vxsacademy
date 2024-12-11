importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js");
importScripts("./sync-message.js");

var {readMessage, uuidv4} = syncMessage;

let channel = null;
function py_input(promptMsg) {
    // Generate a unique messageId string
    const messageId = uuidv4();

    postMessage({
        event: "stdin",
        messageId,
        data: promptMsg
    });

    let res = "FAILED";
    try {
        res = readMessage(channel, messageId);
    } catch (err) {
        console.log("READING ERR", err)
    }

    return res;
}

let pyodide = null;
async function initPyodide() {
    pyodide = await loadPyodide({
        stdin: () => {
            return "async input not supported";
        },
        stdout: str => {
            postMessage({
                event: "stdout",
                data: str
            });
        },
        stderr: str => {
            postMessage({
                event: "stderr",
                data: str
            });
        }
    });

    pyodide.runPython("import sys\nprint(sys.version)");
};
initPyodide();

self.addEventListener("message", e => {
    const msg = e.data;

    if (msg.channel) {
        channel = msg.channel;
    } else if (msg.event === "exec") {
        try {
            pyodide.globals.set("input", py_input);
            pyodide.runPython(msg.code);
        } catch (err) {
            postMessage({
                event: "stderr",
                data: err.toString()
            });
        }
    }
});
