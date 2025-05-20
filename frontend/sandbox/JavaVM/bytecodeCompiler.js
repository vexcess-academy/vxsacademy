if (!window.JavaVM) {
    window.JavaVM = {};
    window.JavaVM.opcodes = "nop,aconst_null,iconst_m1,iconst_0,iconst_1,iconst_2,iconst_3,iconst_4,iconst_5,lconst_0,lconst_1,fconst_0,fconst_1,fconst_2,dconst_0,dconst_1,bipush,sipush,ldc,ldc_w,ldc2_2,iload,lload,fload,dload,aload,iload_0,iload_1,iload_2,iload_3,lload_0,lload_1,lload_2,lload_3,fload_0,fload_1,fload_2,fload_3,dload_0,dload_1,dload_2,dload_3,aload_0,aload_1,aload_2,aload_3,iaload,laload,faload,daload,aaload,baload,caload,saload,istore,lstore,fstore,dstore,astore,istore_0,istore_1,istore_2,istore_3,lstore_0,lstore_1,lstore_2,lstore_3,fstore_0,fstore_1,fstore_2,fstore_3,dstore_0,dstore_1,dstore_2,dstore_3,astore_0,astore_1,astore_2,astore_3,iastore,lastore,fastore,dastore,aastore,bastore,castore,sastore,pop,pop2,dup,dup_x1,dup_x2,dup2,dup2_x1,dup2_x2,swap,iadd,ladd,fadd,dadd,isub,lsub,fsub,dsub,imul,lmul,fmul,dmul,idiv,ldiv,fdiv,ddiv,irem,lrem,frem,drem,ineg,lneg,fneg,dneg,ishl,lshl,ishr,lshr,iushr,lushr,iand,land,ior,lor,ixor,lxor,iinc,i2l,i2f,i2d,l2i,l2f,l2d,f2i,f2l,f2d,d2i,d2l,d2f,i2b,i2c,i2s,lcmp,fcmpl,fcmpg,dcmpl,dcmpg,ifeq,ifne,iflt,ifge,ifgt,ifle,if_icmpeq,if_icmpne,if_icmplt,if_icmpge,if_icmpgt,if_icmple,if_acmpeq,if_acmpne,goto,jsr,ret,tableswitch,lookupswitch,ireturn,lreturn,freturn,dreturn,areturn,return,getstatic,putstatic,getfield,putfield,invokevirtual,invokespecial,invokestatic,invokeinterface,invokedynamic,new,newarray,anewarray,arraylength,athrow,checkcast,instanceof,monitorenter,monitorexit,wide,multianewarray,ifnull,ifnonnull,goto_w,jsr_w,breakpoint".split(",");
}

JavaVM.compileByteCode = function  (lines) {
    const opcodes = JavaVM.opcodes; // locally store opcodes for fast access
    let instructions = [];
    
    // parse lines of bytecode
    for (var l = 0; l < lines.length; l++) {
        // get line
        let line = lines[l];

        // split by instruction index and content
        let spl = line.split(":");

        let instructIdx, instructBody;
        
        // if instruction contains a body
        if (spl.length > 1) {
            // get instruction index as number
            instructIdx = Number(spl[0].trim());
            // get instruction body
            instructBody = spl[1];

            // remove comments from instructBody
            var j = 0;
            while (j < instructBody.length - 1 && instructBody.charAt(j) !== "/" && instructBody.charAt(j + 1) !== "/") {
                j++;
            }
            instructBody = instructBody.slice(0, j + 1).trim();
            
            // parse for operands
            let arrs = instructBody.split(" ");
            for (var i = 0; i < arrs.length; i++) {
                arrs[i] = arrs[i].replaceAll(",", "");

                if (arrs[i].length === 0) {
                    arrs.splice(i, 1);
                    i--;
                }
            }
            
            // process operands
            for (var i = 0; i < arrs.length; i++) {
                let val = arrs[i];
                
                // if operand is opcode
                if (Number.isNaN(Number(val))) {
                    var opMnemonic = val.split(" ")[0].trim();

                    // if is address
                    if (opMnemonic.charAt(0) === "#") {
                        // convert operand to number
                        opMnemonic = Number(opMnemonic.slice(1));

                        // split address into two bytes (big endian)
                        let indexbyte1 = (opMnemonic >> 8) & 0xFF;
                        let indexbyte2 = opMnemonic & 0xFF;

                        // store address' bytes in instructions
                        instructions[instructIdx] = indexbyte1;
                        instructions[instructIdx + 1] = indexbyte2;
                    } else {
                        // convert operation mnemonic to byte and store into instructions
                        let opcode = opcodes.indexOf(opMnemonic);
                        instructions[instructIdx] = opcode;
                    }
                } 

                // if operand is literal
                else {
                    // store operand as a number in instructions
                    instructions[instructIdx] = Number(val);
                }

                // go to next operand
                instructIdx++;
            }
        }
    };

    // convert instructions from standard Array to unsigned 32 bit integer typed array.
    // note: -1 becomes 4294967295 during conversion
    return new Uint32Array(instructions);
};
