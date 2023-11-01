let liveOutputContainer = document.getElementById("live-output-container");
let warningsBox = document.getElementById("warnings-container");

let blobFiles = [];

// warning
function createWarning(txt) {
    let warning = document.createElement("div");
    warning.className = "process-warning";

    let warnImg = document.createElement("img");
    warnImg.src = "/warning_sign.png";
    warning.appendChild(warnImg);

    let warnTxt = document.createElement("div");
    warnTxt.innerText = txt;
    warning.appendChild(warnTxt);
    
    warningsBox.appendChild(warning);
}

// code pre-processor
function findScopeEnd(code) {
    let i = 1, 
        inStr = false,
        strType = "",
        cc = "",
        scopeLvl = 1;
        
    while (scopeLvl > 0 && i < code.length) {
        cc = code[i];

        // ignore strings
        if (!inStr && (cc === '"' || cc === "'" || cc === "`")) {
            inStr = true;
            strType = cc;
        } else if (inStr && cc === strType && code[i - 1] !== "\\") {
            inStr = false;
        }
        
        if (!inStr) {
            // single line comments
            if (cc === "/" && code.charAt(i + 1) === "/") {
                while (i < code.length && code[i] !== "\n") {
                    i++;
                }
            }
            
            // detect
            if (cc === "{") {
                scopeLvl++;
            } else if (cc === "}") {
                scopeLvl--;
            }
        }
        
        // next char
        i++;
    }
    
    return i;
}
function noStrOrCommIncludes(code, subcode) {
    let testStr = "";
    let i = 0, 
        inStr = false,
        strType = "",
        cc = "";
        
    while (i < code.length) {
        cc = code[i];

        // ignore strings
        if (!inStr && (cc === '"' || cc === "'" || cc === "`")) {
            inStr = true;
            strType = cc;
        } else if (inStr && cc === strType && code[i - 1] !== "\\") {
            inStr = false;
        }
        
        if (!inStr) {
            // single line comments
            if (cc === "/" && code.charAt(i + 1) === "/") {
                while (i < code.length && code[i] !== "\n") {
                    i++;
                }
            }
            
            testStr += code[i];
        }
        
        // next char
        i++;
    }
    
    return testStr.includes(subcode);
}
function numOfChar(str, char) {
    let i, count = 0;
    for (i = str.length - 1; i >= 0; i--) {
        if (str[i] === char) count++;
    }
    return count;
}
function preprocessJS(code, options) {
    let { PJS, loopProtect, topScope } = options;
    
    let i = 0,
        inStr = false,
        inMultiLnComment = false,
        strType = "",
        cc = "",
        scopeLvl = topScope ? 0 : 1,
        lineNum = 1,
        infinLoopStr1 = "\nProcess.loopTimer=Date.now();\n",
        infinLoopStr2 = "",
        catchStr1 = "\ntry{\n",
        catchStr2 = "\n} catch(err) {createWarning(err);console.error(err);}\n",
        PJSBind = ".bind(processingInstance)";
    
    while (i < code.length) {
        cc = code.charAt(i);

        // line breaks
        if (cc === "\n") {
            lineNum++;
        }

        // ignore strings
        if (!inMultiLnComment) {
            if (!inStr && (cc === '"' || cc === "'" || cc === "`")) {
                inStr = true;
                strType = cc;
            } else if (inStr && cc === strType && code[i - 1] !== "\\") {
                inStr = false;
            }
        }        
        
        if (!inStr && !inMultiLnComment) {
            // single line comments
            if (cc === "/" && code.charAt(i + 1) === "/") {
                while (i < code.length && code[i] !== "\n") {
                    i++;
                }
            }

            // edit loops and functions
            let prevC = code[i - 1];
            if ((cc === "f" || cc === "w") && " ;=".includes(prevC)) {
                let chunk = code.slice(i + 1, code.length);
                let openIdx = chunk.indexOf("{");
                let chunkSlice = chunk.slice(0, chunk.indexOf("(")).replaceAll(" ", "");
                if (loopProtect && ((chunk.startsWith("or") && chunkSlice === "or") || (chunk.startsWith("hile") && chunkSlice === "hile"))) {
                    if (cc === "f") {
                        infinLoopStr2 = " if(Date.now()-Process.loopTimer>1000){throw 'A for loop is taking too long to run on line " + lineNum + "';break;} ";
                    } else if (cc === "w") {
                        infinLoopStr2 = " if(Date.now()-Process.loopTimer>1000){throw 'A while loop is taking too long to run on line " + lineNum + "';break;} ";
                    }
                    
                    code = code.slice(0, i) + 
                        infinLoopStr1 + 
                        code.slice(i, i + openIdx + 2) + 
                        infinLoopStr2 + 
                        code.slice(i + openIdx + 2, code.length);
                    
                    i += infinLoopStr1.length + openIdx + infinLoopStr2.length + 2;
                }
                
                if (chunkSlice.slice(0, 7) === "unction" && (code[i+8] === " " || code[i+8] === "(")) {
                    let prevNonSpaceC = "", i2 = i-1;
                    while (i2 >= 0 && code[i2] === " ") {
                        i2--;
                        prevNonSpaceC = code[i2];
                    }

                    let identifier = "";
                    let i3 = i2;
                    while (i3 >= 0 && !";,\n".includes(code[i3])) {
                        i3--;
                    }
                    identifier = code.slice(i3, i).trim().replace("var ", "").replace("let ", "").replace("const", "");
                    identifier = identifier.slice(0, Math.min(identifier.indexOf(" "), identifier.indexOf("=")));
                    
                    chunk = chunk.slice(openIdx);
                    let end = findScopeEnd(chunk);
                    chunkSlice = chunk.slice(1, end-1);
                    let newBody = preprocessJS(chunkSlice, {
                        PJS: PJS,
                        loopProtect: loopProtect
                    });
                    
                    code = code.slice(0, i + openIdx + 2) + 
                    catchStr1 + 
                    newBody +
                    catchStr2 + "}" + (scopeLvl === 0 && PJS && !identifier.includes(".prototype.") && !noStrOrCommIncludes(chunkSlice, "this.") && prevNonSpaceC === "=" ? PJSBind : "") +
                    chunk.slice(end);
                    
                    i += catchStr1.length + openIdx + end + catchStr2.length + (newBody.length - chunkSlice.length) + 2;
                    if (scopeLvl === 0 && PJS && !identifier.includes(".prototype.") && !noStrOrCommIncludes(chunkSlice, "this.") && prevNonSpaceC === "=") {
                        i += PJSBind.length;
                    }
                    lineNum += numOfChar(newBody, "\n");
                }
            }
        }
        
        i++;
    }

    return topScope ? (catchStr1 + code + catchStr2) : code;
}

// thumbnail generator
function sendThumnailFromCanvas(canvas) {
    // get screenshot
    let imgCanvas = document.createElement("canvas");
    imgCanvas.width = 200;
    imgCanvas.height = 200;
    
    let ctx = imgCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 200, 200);
    ctx.drawImage(canvas, 0, 0, 200, 200);

    window.top.postMessage({
        sender: "sandbox",
        event: "thumbnail",
        thumbnail: imgCanvas.toDataURL("image/jpeg", 0.5)
    }, "*");
}

window.addEventListener("unhandledrejection", e => {
    createWarning(e.reason);
});
window.addEventListener("error", e => {
    createWarning(e.message);
});

