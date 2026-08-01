let liveOutputContainer = document.getElementById("live-output-container");
let warningsBox = document.getElementById("warnings-container");

let blobFiles = [];

const oldConsoleLog = console.log;
console.log = function(...args) {
    // print data
    oldConsoleLog(...args);

    // send data to console
    window.top.postMessage({
        sender: "sandbox",
        event: "stdout",
        data: serializeObject(args)
    }, "*");
};

const oldConsoleError = console.error;
console.error = function(...args) {
    // print data
    oldConsoleError(...args);

    // send data to console
    window.top.postMessage({
        sender: "sandbox",
        event: "stderr",
        data: serializeObject(args)
    }, "*");
};

let serializeCache = [];
let serializedLen = 0;
const maxDepth = 3;
function serializeObject(obj, depth=0) {
    if (depth === 0) {
        serializeCache = [obj];
    }

    const PLAIN = 0,
        NUMBER = 1,
        STRING = 2,
        BOOLEAN = 3,
        UNDEFINED = 4,
        FUNCTION = 5,
        OBJECT = 6,
        ERROR = 7,
        CIRCULAR = 8,
        TIMEOUT = 9;

    let newObj, typeObj;
    if (Array.isArray(obj)) {
        newObj = [];
        typeObj = [];
    } else {
        newObj = {};
        typeObj = {};
    }

    for (let prop in obj) {
        let value = obj[prop];

        switch (typeof value) {
            case "number":
                if (value === Infinity) {
                    newObj[prop] = "Infinity";
                } else if (value !== value) {
                    newObj[prop] = "NaN";
                } else {
                    newObj[prop] = "" + value;
                }
                typeObj[prop] = NUMBER;
                break;
            case "string":
                newObj[prop] = "" + value;
                typeObj[prop] = STRING;
                break;
            case "boolean":
                newObj[prop] = value ? "1" : "0";
                typeObj[prop] = BOOLEAN;
                break;
            case "undefined":
                typeObj[prop] = UNDEFINED;
                break;
            case "function":
                newObj[prop] = value.toString();
                typeObj[prop] = FUNCTION;
                break;
            case "object":
                if (value === null) {
                    newObj[prop] = "null";
                    typeObj[prop] = OBJECT;
                } else if (value instanceof Error) {
                    newObj[prop] = value.stack ?? value.toString();
                    typeObj[prop] = ERROR;
                } else {
                    // if not previously visited
                    if (serializeCache.indexOf(value) === -1) {
                        serializeCache.push(value);
                        if (depth < maxDepth) {
                            const subTree = serializeObject(value, depth+1);
                            newObj[prop] = subTree.obj;
                            typeObj[prop] = subTree.types;
                        } else {
                            typeObj[prop] = TIMEOUT;
                        }
                    } else {
                        typeObj[prop] = CIRCULAR;
                    }
                }
                break;
        }
    }

    return {
        obj: newObj,
        types: typeObj
    };
}

// warning
function createWarning(txt) {
    window.top.postMessage({
        sender: "sandbox",
        event: "stderr",
        data: serializeObject([txt])
    }, "*");
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

// Incomplete ES6 class to ES5 prototype converter for VExcess' exec env
// Not currently in use, sikn's khanpjs-next provides better support
function convertClassesToPrototypes(code) {
    function consumeString(str, startIdx) {
        const quote = str[startIdx];
        let i = startIdx + 1;
        let text = quote;
        while (i < str.length) {
            text += str[i];
            // Stop if matching quote is found and it's not escaped
            if (str[i] === quote && str[i - 1] !== '\\') {
                i++;
                break;
            }
            i++;
        }
        return { endIdx: i, text };
    }

    function consumeLineComment(str, startIdx) {
        let i = startIdx;
        let text = "";
        while (i < str.length && str[i] !== '\n') {
            text += str[i];
            i++;
        }
        return { endIdx: i, text };
    }

    function consumeMultiComment(str, startIdx) {
        let text = str[startIdx] + str[startIdx + 1]; // "/*"
        let i = startIdx + 2;
        while (i < str.length) {
            text += str[i];
            // Stop if closing tag is found
            if (str[i] === '/' && str[i - 1] === '*') {
                i++;
                break;
            }
            i++;
        }
        return { endIdx: i, text };
    }

    function findScopeEndSafe(str) {
        let i = 1, scopeLvl = 1;
        while (scopeLvl > 0 && i < str.length) {
            let char = str[i];
            if (char === '"' || char === "'" || char === "`") {
                i = consumeString(str, i).endIdx;
                continue;
            }
            if (char === '/' && str[i + 1] === '/') {
                i = consumeLineComment(str, i).endIdx;
                continue;
            }
            if (char === '/' && str[i + 1] === '*') {
                i = consumeMultiComment(str, i).endIdx;
                continue;
            }

            if (char === "{") scopeLvl++;
            else if (char === "}") scopeLvl--;

            if (scopeLvl > 0) i++;
        }
        return i + 1; // Return the full length of the block including {}
    }

    function parseMethods(bodyCode, className, superClass) {
        let i = 0, parenScope = 0;
        let constructorCode = null, methodsCode = "", buffer = "";

        while (i < bodyCode.length) {
            let char = bodyCode[i];

            // Skip strings and comments while searching for methods
            if (char === '"' || char === "'" || char === "`") {
                let res = consumeString(bodyCode, i);
                buffer += res.text; i = res.endIdx; continue;
            }
            if (char === '/' && bodyCode[i + 1] === '/') {
                let res = consumeLineComment(bodyCode, i);
                buffer += res.text; i = res.endIdx; continue;
            }
            if (char === '/' && bodyCode[i + 1] === '*') {
                let res = consumeMultiComment(bodyCode, i);
                buffer += res.text; i = res.endIdx; continue;
            }

            // Track parenthesis scope to avoid tripping on { inside default arguments
            if (char === '(') { parenScope++; buffer += char; i++; continue; }
            if (char === ')') { parenScope--; buffer += char; i++; continue; }

            // Method body found
            if (char === '{' && parenScope === 0) {
                let scopeLen = findScopeEndSafe(bodyCode.substring(i));
                let methodBody = bodyCode.substring(i, i + scopeLen);
                
                // Clean the signature of trailing spaces and stray comments
                let sig = buffer.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
                
                if (sig) {
                    let isStatic = false, isGet = false, isSet = false;
                    
                    if (sig.startsWith("static ")) { isStatic = true; sig = sig.substring(7).trim(); }
                    if (sig.startsWith("get ")) { isGet = true; sig = sig.substring(4).trim(); }
                    if (sig.startsWith("set ")) { isSet = true; sig = sig.substring(4).trim(); }

                    // Extract method name and arguments
                    let match = sig.match(/^([a-zA-Z0-9_$]+)\s*\(([\s\S]*)\)$/);
                    if (match) {
                        let name = match[1], args = match[2];
                        let target = isStatic ? className : `${className}.prototype`;

                        if (name === "constructor" && !isStatic) {
                            if (superClass) {
                                // Basic mapping of ES6 super() to ES5 call()
                                methodBody = methodBody.replace(/\bsuper\s*\(/g, `${superClass}.call(this, `);
                            }
                            constructorCode = `function ${className}(${args}) ${methodBody}`;
                        } else if (isGet || isSet) {
                            methodsCode += `Object.defineProperty(${target}, "${name}", { ${isGet ? 'get' : 'set'}: function(${args}) ${methodBody}, configurable: true });\n`;
                        } else {
                            methodsCode += `${target}.${name} = function(${args}) ${methodBody};\n`;
                        }
                    }
                }
                i += scopeLen; buffer = ""; continue;
            }
            
            if (char === ';') buffer = ""; // Clear buffer on semicolons (class properties)
            else buffer += char;
            
            i++;
        }
        return { constructorCode, methodsCode };
    }

    function parseClass(str, startIdx) {
        let j = startIdx + 5, headerCode = "";
        
        // Extract the class header (up to '{')
        while (j < str.length) {
            let char = str[j];
            if (char === '"' || char === "'" || char === "`") {
                let res = consumeString(str, j);
                headerCode += res.text; j = res.endIdx; continue;
            }
            if (char === '/' && str[j + 1] === '/') {
                let res = consumeLineComment(str, j);
                headerCode += res.text; j = res.endIdx; continue;
            }
            if (char === '/' && str[j + 1] === '*') {
                let res = consumeMultiComment(str, j);
                headerCode += res.text; j = res.endIdx; continue;
            }
            if (char === '{') break;
            headerCode += char; j++;
        }

        // remove comments from header
        let headerClean = headerCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
        let parts = headerClean.split(/\s+extends\s+/);
        let className = parts[0] ? parts[0].trim() : "AnonymousClass"; // Fallback for edge cases
        let superClass = parts[1] ? parts[1].trim() : null;

        let scopeLen = findScopeEndSafe(str.substring(j));
        let classBodyCode = str.substring(j + 1, j + scopeLen - 1); // Extract everything inside {}
        let methods = parseMethods(classBodyCode, className, superClass);

        let es5 = `\n`;
        
        // Setup Constructor
        if (methods.constructorCode) {
            es5 += methods.constructorCode + "\n";
        } else {
            if (superClass) {
                es5 += `function ${className}() {\n    if (${superClass}) return ${superClass}.apply(this, arguments) || this;\n}\n`;
            } else {
                es5 += `function ${className}() {}\n`;
            }
        }

        // Setup Inheritance
        if (superClass) {
            es5 += `${className}.prototype = Object.create(${superClass}.prototype);\n`;
            es5 += `${className}.prototype.constructor = ${className};\n`;
        }

        // Append Methods
        es5 += methods.methodsCode;

        return { endIdx: j + scopeLen, es5Code: es5 };
    }

    let i = 0, result = "";
    while (i < code.length) {
        let char = code[i];
        
        // Pass over strings and comments in the global scope
        if (char === '"' || char === "'" || char === "`") {
            let res = consumeString(code, i);
            result += res.text; i = res.endIdx; continue;
        }
        if (char === '/' && code[i + 1] === '/') {
            let res = consumeLineComment(code, i);
            result += res.text; i = res.endIdx; continue;
        }
        if (char === '/' && code[i + 1] === '*') {
            let res = consumeMultiComment(code, i);
            result += res.text; i = res.endIdx; continue;
        }
        
        // Detect "class " keyword (ensure it's not a prefix/suffix like `myclass`)
        if (code.substring(i, i + 5) === "class" && /\s/.test(code[i + 5]) && (i === 0 || !/[a-zA-Z0-9_$]/.test(code[i - 1]))) {
            let classParse = parseClass(code, i);
            result += classParse.es5Code; 
            i = classParse.endIdx; 
            continue;
        }
        
        result += char; 
        i++;
    }
    
    return result;
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

let serviceWorker;
async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            serviceWorker = await navigator.serviceWorker.register("/service-worker.js", {
                scope: "/",
            });
            if (serviceWorker.installing) {
                console.log("Service worker installing");
            } else if (serviceWorker.waiting) {
                console.log("Service worker installed");
            } else if (serviceWorker.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();

window.addEventListener("unhandledrejection", e => {
    createWarning(e.reason);
});
window.addEventListener("error", e => {
    createWarning(e.message);
});

