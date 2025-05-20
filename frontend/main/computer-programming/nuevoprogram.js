function timeSince (date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    let intervalType;

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "minute";
                    } else {
                        interval = seconds;
                        intervalType = "second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
}

const sandboxURL = 
    window.location.hostname === "vxsacademy.org" ?
    "https://sandbox.vxsacademy.org" :
    "http://127.0.0.1:3001";

const PROGRAM_ID = window.location.pathname.split("/")[2];
let isKAProgram = PROGRAM_ID.startsWith("KA_");

let myEditor = null;
async function onProgramDataReady() {
    isKAProgram = isKAProgram && programData.id.length !== 14;

    myEditor = new VXSEditor($("#editor-placeholder"));
    await myEditor.init();

    updateProgramAbout();

    if (programData.id) {
        const isKAProgram = programData.id.startsWith("KA_") && programData.id.length !== 14;
        if (isKAProgram) {
            const discussionPostComponent = $.components["discussion-post"];
            discussionPostComponent.template = discussionPostComponent.template.replace("/CDN/images/avatars/\\{avatar}.png", "https://cdn.kastatic.org\\{avatar}");
        }
        loadDiscussions(0, isKAProgram);
    }
}

// load program info from server
if (PROGRAM_ID === "new") {
    // boilerplate code for new programs
    const boilerplate = {
        html: `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>New webpage</title>
                    <link rel="stylesheet" href="./style.css">
                </head>
                <body>

                    <script src="./index.js"></script>
                
                </body>
            </html>
        `,
        java: `
            class Main {
                public static void main(String[] args) {
                    
                }
            }
        `,
        cpp: `
            #include <iostream>
            using namespace std;
            
            int main() {

                return 0;
            }
        `,
        zig: `
            const std = @import("std");

            pub fn main() void {
                
            }
        `,
        glsl: `
            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                // Normalized pixel coordinates (from 0 to 1)
                vec2 uv = fragCoord / iResolution.xy;
            
                // Time varying pixel color
                vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0,2,4));
            
                // Output to screen
                fragColor = vec4(col,1.0);
            }
        `
    };

    // clean up boilerplates
    let boilerplateKeys = Object.keys(boilerplate);
    let b, i, j, key, code, minIndent, lines;
    for (b = 0; b < boilerplateKeys.length; b++) {
        key = boilerplateKeys[b];
        code = boilerplate[key];
        minIndent = Infinity;
        lines = code.split("\n");
        lines = lines.slice(1, lines.length - 1);
        for (i = 0; i < lines.length; i++) {
            if (lines[i].trim().length > 0) {
                j = 0;
                while (lines[i][j] === " " && j < lines[i].length) {
                    j++;
                }
                if (j < minIndent) {
                    minIndent = j;
                }
            }
        }
        for (i = 0; i < lines.length; i++) {
            lines[i] = lines[i].slice(minIndent);
        }
        boilerplate[key] = lines.join("\n");
    }

    programData = {
        title: "New Program",
        files: {},
        width: 400,
        height: 400,
        type: window.location.pathname.split("/")[3]
    };

    const savedProgram = localStorage.getItem("cs-new-program-" + programData.type);

    // setup files
    if (savedProgram) {
        const savedData = JSON.parse(savedProgram);
        programData.width = savedData.width;
        programData.height = savedData.height;
        programData.files = savedData.files;
    } else {
        switch (programData.type) {
            case "webpage":
                programData.files = {
                    "index.html": boilerplate.html,
                    "index.js": "// JavaScript",
                    "style.css": "/* CSS */"
                };
                break;
                
            case "pjs":
                programData.files = {
                    "index.js": "// Processing.js"
                };
                break;
    
            case "python":
                programData.files = {
                    "main.py": "# Python"
                };
                break;
    
            case "glsl":
                programData.files = {
                    "image.glsl": boilerplate.glsl
                };
                break;
    
            case "jitlang":
                programData.files = {
                    "main.jitl": "// JITLang"
                };
                break;
    
            case "cpp":
                programData.files = {
                    "main.cpp": boilerplate.cpp
                };
                break;
    
            case "zig":
                programData.files = {
                    "main.zig": boilerplate.zig
                };
                break;
    
            case "java":
                programData.files = {
                    "Main.java": boilerplate.java
                };
                break;                    
        }
    }

    onProgramDataReady();
} else {
    $.getJSON(`/CDN/programs/${PROGRAM_ID}.json`).then(data => {
        programData = data;
        onProgramDataReady();
    });
}

