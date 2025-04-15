if (!window.JavaVM) {
    window.JavaVM = {};
    window.JavaVM.opcodes = "nop,aconst_null,iconst_m1,iconst_0,iconst_1,iconst_2,iconst_3,iconst_4,iconst_5,lconst_0,lconst_1,fconst_0,fconst_1,fconst_2,dconst_0,dconst_1,bipush,sipush,ldc,ldc_w,ldc2_2,iload,lload,fload,dload,aload,iload_0,iload_1,iload_2,iload_3,lload_0,lload_1,lload_2,lload_3,fload_0,fload_1,fload_2,fload_3,dload_0,dload_1,dload_2,dload_3,aload_0,aload_1,aload_2,aload_3,iaload,laload,faload,daload,aaload,baload,caload,saload,istore,lstore,fstore,dstore,astore,istore_0,istore_1,istore_2,istore_3,lstore_0,lstore_1,lstore_2,lstore_3,fstore_0,fstore_1,fstore_2,fstore_3,dstore_0,dstore_1,dstore_2,dstore_3,astore_0,astore_1,astore_2,astore_3,iastore,lastore,fastore,dastore,aastore,bastore,castore,sastore,pop,pop2,dup,dup_x1,dup_x2,dup2,dup2_x1,dup2_x2,swap,iadd,ladd,fadd,dadd,isub,lsub,fsub,dsub,imul,lmul,fmul,dmul,idiv,ldiv,fdiv,ddiv,irem,lrem,frem,drem,ineg,lneg,fneg,dneg,ishl,lshl,ishr,lshr,iushr,lushr,iand,land,ior,lor,ixor,lxor,iinc,i2l,i2f,i2d,l2i,l2f,l2d,f2i,f2l,f2d,d2i,d2l,d2f,i2b,i2c,i2s,lcmp,fcmpl,fcmpg,dcmpl,dcmpg,ifeq,ifne,iflt,ifge,ifgt,ifle,if_icmpeq,if_icmpne,if_icmplt,if_icmpge,if_icmpgt,if_icmple,if_acmpeq,if_acmpne,goto,jsr,ret,tableswitch,lookupswitch,ireturn,lreturn,freturn,dreturn,areturn,return,getstatic,putstatic,getfield,putfield,invokevirtual,invokespecial,invokestatic,invokeinterface,invokedynamic,new,newarray,anewarray,arraylength,athrow,checkcast,instanceof,monitorenter,monitorexit,wide,multianewarray,ifnull,ifnonnull,goto_w,jsr_w,breakpoint".split(",");
}

// THE MEAT AND POTATOS!!!
JavaVM.VM = function () {
    var thisVM = this;

    // stores JS methods that can be invoked by the JVM
    this.nativeMethods = {
        println: _=>{},
        debug: _=>{},
        throwError: _=>{}
    };

    // finds a method given the method's name and a list of class components
    function findMethod (name, components) {
        for (var i = 0; i < components.length; i++) {
            var c = components[i];
            if (c.type === "method" && c.name === name) {
                return c;
            }
        }
    }

    // functions for doing 32 bit arithmetic in JS
    function add32 (a, b) {
        return (a | 0 + b | 0) | 0;
    }

    function sub32 (a, b) {
        return (a | 0 - b | 0) | 0;
    }

    const mul32 = Math.imul;

    function div32 (a, b) {
        return (a | 0 / b | 0) | 0;
    }

    function bitwiseAND (a, b) {
        return a & b;
    }

    function bitwiseOR (a, b) {
        return a | b;
    }

    // JVM Error
    class JVM_Error {
        constructor (msg, instruct, loc) {
            this.type = "error";
            this.msg = msg;
            this.instruction = instruct;
            this.code = JavaVM.opcodes[instruct];
            this.scope = loc;
        }

        toString () {
            return `JVM Error: ${this.msg} - ${this.code} (${this.instruction})`;
        }
    }

    // JVM Method
    class JVM_method {
        constructor (lines, parentClass, isConstructor) {
            this.parentClass = parentClass;
            this.type = "method";
            this.srcCode = lines;
            this.isConstructor = isConstructor;
            
            // find modifiers
            this.modifers = lines[0].slice(0, lines[0].indexOf("(")).split(" ");
            for (var i = 0; i < this.modifers.length; i++) {
                if (this.modifers[i].length === 0) {
                    this.modifers.splice(i, 1);
                    i--;
                }
            }

            // get method name
            this.name = this.modifers[this.modifers.length - 1];
            this.modifers.splice(this.modifers.length - 1, 1);

            // find the args
            this.args = lines[0].slice(lines[0].indexOf("(") + 1, lines[0].indexOf(")")).split(",");
            for (var i = 0; i < this.args.length; i++) {
                if (this.args[i].length === 0) {
                    this.args.splice(i, 1);
                    i--;
                }
            }

            // parse other properties
            var i = 1;
            while (lines[i].trim() !== "Code:" && i < lines.length) {
                var toks = lines[i].split(":");
                this[toks[0].trim()] = toks[1].trim();
                i++;
            }

            var instructionsStart = i + 2;

            // parse execution properties
            var execProps = lines[i + 1].split(",");
            for (var i = 0; i < execProps.length; i++) {
                execProps[i] = execProps[i].split("=");
                this[execProps[i][0].trim()] = execProps[i][1].trim();
            }
            
            // compile instructions
            var instructionsEnd = instructionsStart;
            while (!Number.isNaN(Number(lines[instructionsEnd].split(":")[0].trim())) && instructionsEnd < lines.length) {
                instructionsEnd++;
            }
            this.instructions = JavaVM.compileByteCode(lines.slice(instructionsStart, instructionsEnd));
        }

        run (...args) {
            // method name
            let name = this.name;

            // method instructions
            let instructions = this.instructions;

            // class constant pool
            let constantPool = this.parentClass.constantPool;

            // class components
            let classComponents = this.parentClass.components;

            let stack, locals; // stack and locals arrays
            let sIdx = 0; // stack index
            let lIdx = 0; // locals index
            let IP; // instruction pointer

            // load stack and locals arrays
            stack = new Array(Number(this.stack)).fill(undefined);
            locals = new Array(Number(this.locals)).fill(undefined);
            locals[0] = "this";
            for (var i = 0; i < args.length; i++) {
                locals[i] = args[i];
            }

            function constPoolAt (idx) {
                let splitRef = constantPool[idx].split(" ");

                let refType = splitRef[0];
                let refVal = [];
                for (var i = 1; i < splitRef.length; i++) {
                    if (splitRef[i] !== "") {
                        refVal = splitRef[i].split(".");
                        if (refVal.length === 1) {
                            refVal = refVal[0].split(":");
                        }
                        break;
                    }
                }

                return [refType, refVal];
            }

            function traceConstPool (arr) {
                // for each property in the constant pool
                for (let p in arr) {
                    // get it's value
                    let val = arr[p];

                    // if its a reference
                    if (typeof val === "string" && val.charAt(0) === "#") {
                        // get it's value as a number
                        let idx = Number(val.slice(1));

                        // get what it's refering too
                        let ref = constPoolAt(idx);
                        
                        // recursively follow 
                        arr[p] = [ref[0], traceConstPool(ref[1])];
                    }
                }

                return arr;
            }

            function cleanStack () {
                for (var i = sIdx; i < stack.length; i++) {
                    stack[i] = null;
                }
            }

            function execInstruction (instructionPointer) {
                // 206 possibles
                switch (instructions[instructionPointer]) {
                    case 0: // nop
                    break;

                    case 1: // aconst_null
                        stack[sIdx++] = null;
                    break;

                    case 2: // iconst_m1
                        stack[sIdx++] = -1;
                    break;

                    case 3: // iconst_0
                        stack[sIdx++] = 0;
                    break;

                    case 4: // iconst_1
                        stack[sIdx++] = 1;
                    break;

                    case 5: // iconst_2
                        stack[sIdx++] = 2;
                    break;

                    case 6: // iconst_3
                        stack[sIdx++] = 3;
                    break;

                    case 7: // iconst_4
                        stack[sIdx++] = 4;
                    break;

                    case 8: // iconst_5
                        stack[sIdx++] = 5;
                    break;

                    case 9: // lconst_0
                        stack[sIdx++] = (0 >> 8) & 0xFF;
                        stack[sIdx++] = 0 & 0xFF;
                    break;

                    case 10: // lconst_1
                        stack[sIdx++] = (1 >> 8) & 0xFF;
                        stack[sIdx++] = 1 & 0xFF;
                    break;

                    case 14: // dconst_0
                        var double = new Float64Array([0.0]);
                        var int = new Int32Array(double.buffer);
                        stack[sIdx++] = int[0];
                        stack[sIdx++] = int[1];
                    break;

                    case 15: // dconst_1
                        var numBytes = new Int32Array(new Float64Array([1.0]).buffer);
                        stack[sIdx++] = numBytes[0];
                        stack[sIdx++] = numBytes[1];
                    break;

                    case 16: // bipush
                        stack[sIdx++] = instructions[++IP];
                    break;

                    case 24: // dload
                        var idx = instructions[++IP];
                        stack[sIdx++] = locals[idx];
                        stack[sIdx++] = locals[idx + 1];
                    break;

                    case 26: // iload_0
                        stack[sIdx++] = locals[0];
                    break;

                    case 27: // iload_1
                        stack[sIdx++] = locals[1];
                    break;

                    case 28: // iload_2
                        stack[sIdx++] = locals[2];
                    break;

                    case 29: // iload_3
                        stack[sIdx++] = locals[3];
                    break;

                    case 38: // dload_0
                        stack[sIdx++] = locals[0];
                        stack[sIdx++] = locals[1];
                    break;

                    case 39: // dload_1
                        stack[sIdx++] = locals[1];
                        stack[sIdx++] = locals[2];
                    break;

                    case 40: // dload_2
                        stack[sIdx++] = locals[2];
                        stack[sIdx++] = locals[3];
                    break;

                    case 41: // dload_3
                        stack[sIdx++] = locals[3];
                        stack[sIdx++] = locals[4];
                    break;

                    case 57: // dstore
                        var idx = instructions[++IP];

                        locals[idx + 1] = stack[--sIdx];
                        locals[idx] = stack[--sIdx];
                        
                        stack[sIdx] = undefined;
                    break;

                    case 59: // istore_0
                        locals[1] = stack[--sIdx];
                    break;

                    case 60: // istore_1
                        locals[1] = stack[--sIdx];
                    break;

                    case 61: // istore_2
                        locals[2] = stack[--sIdx];
                    break;
                    
                    case 62: // istore_3
                        locals[2] = stack[--sIdx];
                    break;

                    case 87: // pop
                        sIdx--;
                    break;

                    case 88: // pop2
                        sIdx -= 2;
                    break;

                    case 96: // iadd
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = add32(a, b);
                    break;

                    case 100: // isub
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = sub32(a, b);
                    break;

                    case 104: // imul
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = mul32(a, b);
                    break;

                    case 107: // dmul
                        var b1 = stack[--sIdx];
                        var b2 = stack[--sIdx];

                        var a1 = stack[--sIdx];
                        var a2 = stack[--sIdx];

                        var d1 = new Float64Array(new Int32Array([a1, a2]).buffer)[0];
                        var d2 = new Float64Array(new Int32Array([b1, b2]).buffer)[0];

                        var resultBytes = new Int32Array(new Float64Array([d1 * d2]).buffer);

                        stack[sIdx++] = resultBytes[0];
                        stack[sIdx++] = resultBytes[1];
                    break;

                    case 108: // idiv
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = div32(a, b);
                    break;

                    case 111: // ddiv
                        var b1 = stack[--sIdx];
                        var b2 = stack[--sIdx];

                        var a1 = stack[--sIdx];
                        var a2 = stack[--sIdx];

                        var n1 = new Float64Array(new Int32Array([a1, a2]).buffer)[0];
                        var n2 = new Float64Array(new Int32Array([b1, b2]).buffer)[0];

                        var resultBytes = new Int32Array(new Float64Array([n1 / n2]).buffer);

                        stack[sIdx++] = resultBytes[0];
                        stack[sIdx++] = resultBytes[1];
                    break;

                    case 115: // drem
                        var b1 = stack[--sIdx];
                        var b2 = stack[--sIdx];

                        var a1 = stack[--sIdx];
                        var a2 = stack[--sIdx];

                        var n1 = new Float64Array(new Int32Array([a1, a2]).buffer)[0];
                        var n2 = new Float64Array(new Int32Array([b1, b2]).buffer)[0];

                        var resultBytes = new Int32Array(new Float64Array([n1 % n2]).buffer);

                        stack[sIdx++] = resultBytes[0];
                        stack[sIdx++] = resultBytes[1];
                    break;

                    case 116: // ineg
                        var a = stack[--sIdx];
                        stack[sIdx++] = -a;
                    break;

                    case 119: // dneg
                        var a1 = stack[--sIdx];
                        var a2 = stack[--sIdx];
                        
                        var resultBytes = new Int32Array(new Float64Array([-new Float64Array(new Int32Array([a1, a2]).buffer)[0]]).buffer);

                        stack[sIdx++] = resultBytes[0];
                        stack[sIdx++] = resultBytes[1];
                    break;

                    case 126: // iand
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = a.bitwiseAND(b);
                    break;

                    case 128: // ior
                        var a = stack[--sIdx];
                        var b = stack[--sIdx];
                        stack[sIdx++] = a.bitwiseOR(b);
                    break;
                    
                    case 132: // iinc
                        locals[instructions[++IP]] += instructions[++IP];
                    break;
                    
                    case 162: // if_icmpge
                        var branch = new Array(stack.length).fill(undefined);
                        var byte1 = instructions[++IP];
                        var byte2 = instructions[++IP];
                        
                        var b = stack[--sIdx];
                        var a = stack[--sIdx];

                        if (a >= b) {
                            IP = byte1 - 1;
                        }
                    break;
                        
                    case 167: // goto
                        IP = instructions[++IP] - 1;
                    break;

                    case 172: // ireturn
                        return stack[--sIdx];
                    break;

                    case 175: // dreturn
                        var a1 = stack[--sIdx];
                        var a2 = stack[--sIdx];

                        var n = new Float64Array(new Int32Array([a1, a2]).buffer)[0];

                        return n;
                    break;

                    case 177: // return
                        return void 0;
                    break;

                    case 178: // getstatic
                        var idx = (instructions[++IP] << 8) | instructions[++IP];
                        stack[sIdx++] = constantPool[idx];
                    break;

                    case 182: // invokevirtual
                        var idx = (instructions[++IP] << 8) | instructions[++IP];

                        // get data from constant pool
                        var constPoolData = constPoolAt(idx);

                        // recursively trace backwards all data
                        constPoolData[1] = traceConstPool(constPoolData[1]);

                        // find class name
                        var virtualClass = constPoolData[1][0];
                        while (virtualClass[0] !== "Class" && virtualClass[1]) {
                            virtualClass = virtualClass[1];
                        }
                        virtualClass = virtualClass[1][0][1][0];

                        // find method name and signature
                        var virtualNameAndSign = constPoolData[1][1];
                        while (virtualNameAndSign[0] !== "NameAndType" && virtualNameAndSign[1]) {
                            virtualNameAndSign = virtualNameAndSign[1];
                        }
                        virtualNameAndSign = virtualNameAndSign[1];

                        // get name and signature
                        var virtualMethodName = virtualNameAndSign[0][1][0];
                        var virtualMethodSignature = virtualNameAndSign[1][1][0];
                        var virtualMethodArgs = virtualMethodSignature.slice(virtualMethodSignature.indexOf("(") + 1, virtualMethodSignature.indexOf(")"));

                        console.log("invoke virtual")
                        console.log(stack)
                        console.log(sIdx + " " + virtualMethodArgs)

                        if (virtualClass === "java/io/PrintStream" && virtualMethodName === "println") {
                            thisVM.nativeMethods.println(...stack.slice(0, sIdx));
                            sIdx -= virtualMethodArgs.length + 1;
                        }
                    break;

                    case 184: // invokestatic
                        var idx = (instructions[++IP] << 8) | instructions[++IP];

                        // get data from constant pool
                        var constPoolData = constPoolAt(idx);

                        // recursively trace backwards all data
                        constPoolData[1] = traceConstPool(constPoolData[1]);

                        // find class name
                        var virtualClass = constPoolData[1][0];
                        while (virtualClass[0] !== "Class" && virtualClass[1]) {
                            virtualClass = virtualClass[1];
                        }
                        virtualClass = virtualClass[1][0][1][0];

                        // find method name and signature
                        var virtualNameAndSign = constPoolData[1][1];
                        while (virtualNameAndSign[0] !== "NameAndType" && virtualNameAndSign[1]) {
                            virtualNameAndSign = virtualNameAndSign[1];
                        }
                        virtualNameAndSign = virtualNameAndSign[1];

                        // get name and signature
                        var virtualMethodName = virtualNameAndSign[0][1][0];
                        var virtualMethodSignature = virtualNameAndSign[1][1][0];
                        var virtualMethodArgs = virtualMethodSignature.slice(virtualMethodSignature.indexOf("(") + 1, virtualMethodSignature.indexOf(")"));

                        console.log("invoke static")
                        console.log(stack)
                        console.log(sIdx)

                        var mthd = findMethod(virtualMethodName, classComponents);
                        var mthdRes = mthd.run(...stack.slice(stack.length - virtualMethodArgs.length));
                        sIdx -= virtualMethodArgs.length;
                        stack[sIdx++] = mthdRes;
                    break;

                    default:
                        return new JVM_Error("Unknown Instruction", instructions[instructionPointer], name);
                    break;
                }

                if (thisVM.debugMode) {
                    cleanStack();
                }

                return "ok - " + name;
            }

            IP = 0;
            var timer = Date.now();
            while (IP < instructions.length) {
                var cacheIP = IP + " - (" + instructions[IP] + ")" + JavaVM.opcodes[instructions[IP]];
                
                var res = execInstruction(IP);
                IP++;
                
                if (thisVM.debugMode) {
                    thisVM.nativeMethods.debug(
                        "instruction: " + cacheIP + 
                        "\nlocals: " + JSON.stringify(locals) + 
                        "\nstack: " + JSON.stringify(stack) + 
                        "\nresponse: " + res);
                }

                if (typeof res === "object" && res.type === "error") {
                    thisVM.nativeMethods.throwError(res.toString(), res.code, res.scope);
                    break;
                }

                if (res !== "ok - " + name) {
                    return res;
                }

                if (Date.now() - timer > 1000) {
                    thisVM.nativeMethods.throwError("Infinite Loop Error");
                    break;
                }
            }
            // setTimeout(function RUN_CODE () {
            //     var cacheIP = IP + " - " + instructions[IP] + " - " + JavaVM.opcodes[instructions[IP]];
                
            //     var res = execInstruction(IP);
            //     IP++;
                
            //     if (thisVM.debugMode) {
            //         thisVM.nativeMethods.debug("instruction: " + cacheIP + "\nlocals: " + JSON.stringify(locals) + "\nstack: " + JSON.stringify(stack) + "\nresponse: " + res);
            //     }

            //     if (typeof res === "object" && res.type === "error") {
            //         thisVM.nativeMethods.throwError(res.toString(), res.code, res.scope);
            //         return;
            //     }

            //     setTimeout(RUN_CODE, 1000);
            // }, 1000);

        }
    }

    // JVM Class
    class JVM_class {
        constructor (txt) {
            if (typeof txt !== "string") {
                txt = txt.join("\n");
            }
            this.srcTxt = txt;

            var lines = txt.split("\n");

            // parse classname
            this.className = lines[0].split(" ")[1].trim();
            
            // parse other properties
            for (var i = 1; i <= 6; i++) {
                var l = lines[i];
                var props = l.split(",");

                for (var k = 0; k < props.length; k++) {
                    var toks = props[k].split(":");
                    var val = toks[1];

                    // remove comments
                    var j = 0;
                    while (j < val.length - 1 && val.charAt(j) !== "/" && val.charAt(j + 1) !== "/") {
                        j++;
                    }

                    this[toks[0].trim()] = val.slice(0, j + 1).trim();
                }
            }

            // create the constant pool
            this.constantPool = {};
            var i = 8;
            while (i < lines.length && lines[i].trim() !== "{") {
                var toks = lines[i].split("=");
                var val = toks[1];

                // remove comments
                var j = 0;
                // while (j < val.length - 1 && val.charAt(j) !== "/" && val.charAt(j + 1) !== "/") {
                //     j++;
                // }
                j = val.length;

                this.constantPool[Number(toks[0].trim().slice(1))] = val.slice(0, j + 1).trim();

                i++;
            }

            // find the end of the class
            var classEnd = lines.length - 1;
            while (classEnd >= 0 && lines[classEnd].trim() !== "}") {
                classEnd--;
            }

            // calc start padding
            var startPad = Infinity;
            for (var j = i + 1; j < classEnd; j++) {
                var l = lines[j];

                if (l.trim().length > 0) {
                    var k = 0;

                    while (k < l.length && l.charAt(k) === " ") {
                        k++;
                    }

                    if (k < startPad) {
                        startPad = k;
                    }
                }
            }

            this.components = [];

            // find the individual components of the class
            for (var j = i + 1; j < classEnd; j++) {
                // found start of new component
                if (lines[j].charAt(startPad) !== " ") {
                    var cStart = j;

                    j++;
                    while (lines[j].charAt(startPad) === " ") {
                        j++;
                    }

                    this.components.push({
                        srcCode: lines.slice(cStart, j)
                    });

                    j--;
                }
            }

            // parse components
            for (var i = 0; i < this.components.length; i++) {
                var c = this.components[i];

                // constructor method
                if (c.srcCode[0].trim() === this.className + "();") {
                    this.components[i] = new JVM_method(c.srcCode, this, true);
                } 
                
                // normal method
                else if (c.srcCode[0].includes("(")) {
                    this.components[i] = new JVM_method(c.srcCode, this);
                }

                // other stuff
                else if (c.srcCode[0].includes("int ")) {
                    // c.type = "int";
                }
            }
        }
    }

    // JVM Classfile
    class JVM_Classfile {
        constructor (txt) {
            this.srcTxt = txt;
            
            // replace tabs with spaces
            txt = txt.replaceAll("\t", "    ");
            
            var lines = txt.split("\n");
            
            // find line start padding
            var smallestStartPad = Infinity;
            for (var i = 0; i < lines.length; i++) {
                var l = lines[i];

                if (l.trim().length === 0) {
                    lines.splice(i, 1);
                    i--;
                } else {
                    var j = 0;
                    
                    while (l.charAt(j) === " ") {
                        j++;
                    }
                    
                    if (j < smallestStartPad) {
                        smallestStartPad = j;
                    }
                }
            }

            // remove line start padding
            for (var i = 0; i < lines.length; i++) {
                lines[i] = lines[i].slice(smallestStartPad);
            }

            // parse some properties
            this.classFilePath = lines[0].split(" ")[1].trim();
            this.lastModified = lines[1].split(";")[0].slice(16).trim();
            this.size = lines[1].split(";")[1].slice(6).trim();
            this.checksum = lines[2].trim();
            this.compiledFrom = lines[3].slice(lines[3].indexOf('"') + 1).split('"')[0].trim();

            // create class
            this.class = new JVM_class(lines.slice(4));
        }
        
        toString () {
            return this.srcTxt;
        }
    }
    
    // the class file for the JVM
    this.classFile;

    // takes String bytecode, creates "classfile" object and stores it into classFile
    this.loadByteCode = function (bytecode) {
        this.classFile = new JVM_Classfile(bytecode);
    };

    // invokes the main method of the class file
    this.init = function () {
        findMethod("main", this.classFile.class.components).run();
    };

    // attaches a native method to the JVM
    this.attachMethod = function (name, fxn) {
        this.nativeMethods[name] = fxn;
    };
};
