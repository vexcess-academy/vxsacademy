const sandboxURL = 
    window.location.hostname === "vxsacademy.org" ?
    "https://sandbox.vxsacademy.org" :
    "http://127.0.0.1:3003";

const PROGRAM_ID = window.location.pathname.split("/")[2];

let onProgramInfoReadyEvents = [];
let programInfoReady = false;
let programData = null;
function onProgramInfoReady(fxn) {
    if (programInfoReady) {
        fxn(programData);
    } else {
        onProgramInfoReadyEvents.push(fxn);
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
        fileNames: [],
        width: 400,
        height: 400,
        programType: window.location.pathname.split("/")[3]
    };

    // setup files
    switch (programData.programType) {
        case "webpage":
            programData.type = "html";
            programData.fileNames = ["index.html", "index.js", "style.css"];
            programData.files["index.html"] = boilerplate.html;
            programData.files["index.js"] = "// JavaScript";
            programData.files["style.css"] = "/* CSS */";
            break;
            
        case "pjs":
            programData.type = "pjs";
            programData.fileNames = ["index.js"];
            programData.files["index.js"] = "// Processing.js";
            break;

        case "python":
            programData.type = "python";
            programData.fileNames = ["main.py"];
            programData.files["main.py"] = "# Python";
            break;

        case "glsl":
            programData.type = "glsl";
            programData.fileNames = ["image.glsl"];
            programData.files["image.glsl"] = boilerplate.glsl;
            break;

        case "jitlang":
            programData.type = "jitlang";
            programData.fileNames = ["main.jitl"];
            programData.files["main.jitl"] = "// JITLang";
            break;

        case "cpp":
            programData.type = "cpp";
            programData.fileNames = ["main.cpp"];
            programData.files["main.cpp"] = boilerplate.cpp;
            break;

        case "zig":
            programData.type = "zig";
            programData.fileNames = ["main.zig"];
            programData.files["main.zig"] = boilerplate.zig;
            break;

        case "java":
            programData.type = "java";
            programData.fileNames = ["Main.java"];
            programData.files["Main.java"] = boilerplate.java;
            break;                    
    }

    setTimeout(() => {
        programInfoReady = true;
        console.log("Program Info Ready");
        for (let i = 0; i < onProgramInfoReadyEvents.length; i++) {
            onProgramInfoReadyEvents[i](programData);
        }
    }, 4);
} else {
    $.getJSON(`/CDN/programs/${PROGRAM_ID}.json`).then(data => {
        programData = data;
        programInfoReady = true;
        console.log("Program Info Ready");
        for (let i = 0; i < onProgramInfoReadyEvents.length; i++) {
            onProgramInfoReadyEvents[i](programData);
        }
    });
}

