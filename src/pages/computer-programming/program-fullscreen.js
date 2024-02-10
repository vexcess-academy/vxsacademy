const sandboxURL = 
    window.location.hostname === "vxsacademy.org" ?
    "https://sandbox.vxsacademy.org" :
    "http://127.0.0.1:3003";

const PROGRAM_ID = window.location.pathname.split("/")[2];

// create output frame
let outputFrame = $("iframe");

// setup output frame sandbox
outputFrame.attr({
    sandbox: "allow-pointer-lock allow-same-origin allow-scripts allow-popups allow-modals allow-forms",
    frameBorder: 0,
    width: window.innerWidth,
    height: window.innerHeight
}).css({
    backgroundColor: "white"
});
$(document.body).replaceChild(outputFrame, $("#output-frame"));

// the output window
let ifrWin = outputFrame.contentWindow || outputFrame.window;

function getFile(name)  {
    return programData.files[name];
}

function runProgram() {
    ifrWin.postMessage("ping", "*");
    
    var mainCode;
    switch (programData.type) {
        case "html":
            mainCode = getFile("index.html");
        break;
        case "pjs":
            mainCode = getFile("index.js");
        break;
        case "java":
            mainCode = getFile("Main.java");
        break;
        case "glsl":
            mainCode = getFile("image.glsl");
        break;
        case "c":
            mainCode = getFile("main.c");
        break;
        case "cpp":
            mainCode = getFile("main.cpp");
        break;
        case "python":
            mainCode = getFile("main.py");
        break;
        case "jitlang":
            mainCode = getFile("main.jitl");
        break;
    }

    if (mainCode === undefined) return;
    
    ifrWin.postMessage({
        width: window.innerWidth,
        height: window.innerHeight,
        files: programData.files
    }, "*");
}

$.getJSON(`/CDN/programs/${PROGRAM_ID}.json`).then(data => {
    programData = data;

    const whitelist = [
        "cdn.jsdelivr.net",
        "cdnjs.cloudflare.com",
        "*.gstatic.com",
        "*.bootstrapcdn.com",
        "*.wikimedia.org",
        "*.kastatic.org",
        "*.khanacademy.org",
        "*.kasandbox.org",
        "github.com",
        "raw.githubusercontent.com",
    ];

    const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
    const domains = [];
    
    for (let fileName in programData.files) {
        if (fileName.endsWith(".html") || fileName.endsWith(".js")) {
            let found = programData.files[fileName].match(urlRegex);
            if (found !== null) {
                for (let i = 0; i < found.length; i++) {
                    let domName = found[i];
                    domName = domName.replace("http://", "").replace("https://", "");
                    let slashIdx = domName.indexOf("/");
                    if (slashIdx !== -1) {
                        domName = domName.slice(0, slashIdx);
                    }
                    domains.push(domName);
                }
            }
        }
    }

    if (programData.type === "pjs") {
        if (!domains.includes("*.kastatic.org")) {
            domains.push("*.kastatic.org");
        }
        if (!domains.includes("*.kasandbox.org")) {
            domains.push("*.kasandbox.org");
        }
    }
    
    outputFrame
        .attr("src", sandboxURL + "/exec-" + programData.type + ".html?" + domains.map(btoa).join("&"))
        .on("load", () => {
            runProgram();
            outputFrameLoaded = true;
        });

        console.log(outputFrame)
});