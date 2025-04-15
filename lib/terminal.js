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


// https://www.veryicon.com/icons/commerce-shopping/icon-of-lvshan-valley-mobile-terminal/right-arrow-18.html
let arrowSVG = document.createElement("div");
arrowSVG.innerHTML = `<svg style="margin-left: 3px; height: 1em; vertical-align: middle;" viewBox="0 0 1024 1024" version="1.1"><path d="M386.640017 196.405191 687.536947 487.723004c13.840827 13.408717 13.840827 35.135036 0 48.543753s-36.293132 13.408717-50.156485 0L336.483532 244.948944c-13.840827-13.408717-13.840827-35.135036 0-48.543753S372.777687 182.996474 386.640017 196.405191z"/><path d="M336.483532 779.073583l300.895906-291.351603c13.863354-13.408717 36.316683-13.408717 50.156485 0 13.840827 13.408717 13.840827 35.135036 0 48.543753L386.640017 827.617336c-13.863354 13.408717-36.316683 13.408717-50.156485 0S322.642705 792.437246 336.483532 779.073583z"/></svg>`;
arrowSVG = arrowSVG.children[0];

function parseFunctionNameFromString(str) {
    if (str.startsWith("async ")) {
        str = str.slice("async ".length);
    }
    let isArrowFunction = true;
    if (str.startsWith("function*")) {
        str = str.slice("function*".length);
        isArrowFunction = false;
    } else if (str.startsWith("function")) {
        str = str.slice("function".length);
        isArrowFunction = false;
    }
    if (isArrowFunction) {
        str = "anonymous";
    } else {
        str = str.slice(0, str.indexOf("(")).trim();
        if (str.length === 0) {
            str = "anonymous";
        }
    }
    return str;   
}

function deserializeObj(obj, types) {
    let newObj;
    if (Array.isArray(obj)) {
        newObj = [];
    } else {
        newObj = {};
    }

    for (let prop in types) {
        let value = obj[prop];
        const type = types[prop];

        if (typeof type === 'object') {
            newObj[prop] = deserializeObj(value, type);
        } else {
            switch (type) {
                case NUMBER:
                    if (value === "Infinity") {
                        newObj[prop] = Infinity;
                    } else if (value === "NaN") {
                        newObj[prop] = NaN;
                    } else {
                        newObj[prop] = Number(value);
                    }
                    break;
                case STRING:
                    newObj[prop] = "" + value;
                    break;
                case BOOLEAN:
                    newObj[prop] = value === "1" ? true : false;
                    break;
                case UNDEFINED:
                    newObj[prop] = undefined;
                    break;
                case FUNCTION:
                    newObj[prop] = Function(`return function $${parseFunctionNameFromString(value)}(){}`)();
                    break;
                case OBJECT:
                    if (value === "null") {
                        newObj[prop] = null;
                    } else {
                        console.log("SOMETHING IS BROKE")
                    }
                    break;
                case CIRCULAR:
                    newObj[prop] = "[Circular]";
                    break;
            }
        }
    }

    return newObj;
}

class Terminal {
    static STDOUT = 0;
    static STDBUG = 1;
    static STDERR = 2;

    darkMode = false;

    typeClrs = {
        light: [
            null, // PLAIN
            "blue", // NUMBER
            "green", // STRING
            "red", // BOOLEAN
            "rgb(202, 11, 105)", // UNDEFINED
            "#FF20ED", // FUNCTION
            "#855A00" // OBJECT
        ],
        dark: [
            null, // PLAIN
            "#66C2FF", // NUMBER
            "#31F031", // STRING
            "#EC4242", // BOOLEAN
            "rgb(239, 143, 190)", // UNDEFINED
            "#FD48CB", // FUNCTION
            "#EEC97D" // OBJECT
        ]
    }

    styles = {
        background: null,
        fontFamily: "monospace",
        fontSize: "14px",
        stdout: {
            backgroundColor: null,
            color: null
        },
        stdbug: {
            backgroundColor: null,
            color: null
        },
        stderr: {
            backgroundColor: null,
            color: null
        },
        borderBottom: null,
        arrow: {
            url: "/CDN/images/icons/terminal-arrow.png",
            filter: null,
            height: "10px",
            margin: "5px",
            marginVertical: "8px"
        }
    };

    eval = null;
    replEnabled;



    constructor(div, enableRepl) {
        this.div = div;

        this.history = [];
        this.currentHistory = "";
        this.historyIndex = 0;

        this.div.innerHTML = "";
        this.historyDiv = document.createElement("div");
        this.div.append(this.historyDiv);

        this.replEnabled = enableRepl;

        if (enableRepl) {
            this.userInputContainer = document.createElement("div");
            this.userInputContainer.style.display = "flex";
            // this.userInputContainer.style.position = "fixed";
            this.userInputContainer.style.bottom = "0px";
            this.userInputContainer.style.minHeight = "1em";
            this.div.append(this.userInputContainer);

            let arrow = this.#createArrow();
            this.userInputContainer.append(arrow);

            this.userInput = this.#createInput();
            this.userInput.style.fontFamily = this.styles.fontFamily;
            this.userInput.style.fontSize = this.styles.fontSize;
            this.userInput.style.display = "block";
            this.userInputContainer.append(this.userInput);

            const that = this;
            this.userInput.addEventListener("keydown", async e => {
                if (that.eval !== null) {
                    const code = that.userInput.value;

                    if (e.code === "ArrowUp") {
                        if (this.historyIndex === this.history.length) {
                            this.currentHistory = code;
                        }
                        if (this.historyIndex > 0) {
                            this.historyIndex--;
                        }
                        that.userInput.value = this.history[this.historyIndex];
                    } else if (e.code === "ArrowDown") {
                        if (this.historyIndex < this.history.length) {
                            this.historyIndex++;
                        }
                        if (this.historyIndex === this.history.length) {
                            that.userInput.value = this.currentHistory;
                        } else {
                            that.userInput.value = this.history[this.historyIndex];
                        }
                    } else if (code.length > 0 && e.code === "Enter") {
                        that.out(code, 0, true);

                        const lastChildWrapper = document.createElement("div");
                        let lastChild = this.historyDiv.getElementsByClassName('log-item');
                        lastChild = lastChild[lastChild.length - 1];
                        let txtEl = lastChild.getElementsByTagName("div")[0];
                        txtEl.classList.add("language-javascript");
                        Prism.highlightElement(txtEl);

                        const res = await that.eval(code);
                        if (res) {
                            that.out(res.obj[0], res.types[0], true);
                        }

                        this.history.push(code);
                        if (this.history.length > 8) {
                            this.history.shift();
                        }
                        this.historyIndex = this.history.length;

                        that.userInput.value = "";
                    }
                }
            });

            this.div.addEventListener("click", e => {
                if (e.target === this.div) {
                    this.userInput.focus();
                }
            });
        }

        this.useLightStyles();
    }

    #createArrow() {
        const styles = this.styles;
        const arrow = arrowSVG.cloneNode(true);
        arrow.style.margin = styles.margin;
        arrow.style.marginBottom = styles.arrow.marginVertical;
        arrow.style.marginTop = styles.arrow.marginVertical;
        arrow.style.filter = styles.arrow.filter;
        return arrow;
    }

    #createInput() {
        let inputEl = document.createElement("input");
        inputEl.style.whiteSpace = "pre";
        inputEl.className = "log-item";
        inputEl.style.background = "transparent";
        inputEl.style.border = "none";
        inputEl.style.outline = "none";
        inputEl.style.display = "inline";
        inputEl.style.color = this.styles.stdout.color;
        inputEl.style.fontFamily = "inherit";
        inputEl.style.fontSize = "inherit";
        inputEl.style.padding = "none";
        inputEl.style.width = "100%";
        inputEl.autocomplete = "off";
        inputEl.autocorrect = "off";
        inputEl.spellcheck = "false";
        return inputEl;
    }

    useLightStyles() {
        this.darkMode = false;

        this.styles.borderTop = "1px solid rgb(207, 207, 207)";
        this.styles.background = "rgb(255, 255, 255)";
        this.styles.borderBottom = "1px solid rgb(240, 240, 240)";
        this.styles.stdout = {
            backgroundColor: "transparent",
            color: "rgb(0, 0, 0)"
        };
        this.styles.stdbug = {
            backgroundColor: "rgb(255, 251, 229)",
            color: "rgb(92, 60, 0)"
        };
        this.styles.stderr = {
            backgroundColor: "rgb(255, 240, 240)",
            color: "rgb(196, 43, 28)"
        };
        this.styles.arrow.filter = "none";

        this.renderStyles();
    }
    
    useDarkStyles() {
        this.darkMode = true;
        
        this.styles.borderTop = "1px solid rgb(70, 70, 70)";
        this.styles.background = "rgb(30, 30, 30)";
        this.styles.borderBottom = "1px solid rgb(70, 70, 70)";
        this.styles.stdout = {
            backgroundColor: "transparent",
            color: "rgb(216, 216, 216)"
        };
        this.styles.stdbug = {
            backgroundColor: "rgb(65, 60, 38)",
            color: "rgb(250, 240, 168)"
        };
        this.styles.stderr = {
            backgroundColor: "rgb(78, 53, 52)",
            color: "rgb(196, 43, 28)"
        };
        this.styles.arrow.filter = "invert(1)";
        
        this.renderStyles();
    }

    renderStyles() {
        this.typeClrs.light[0] = this.styles.stdout.color;
        this.typeClrs.dark[0] = this.styles.stdout.color;
        this.div.style.background = this.styles.background;
        if (this.replEnabled) {
            this.userInputContainer.getElementsByTagName("svg")[0].style.filter = this.styles.arrow.filter;
            this.userInput.style.color = this.styles.stdout.color;
        }
        this.div.style.borderTop = this.styles.borderTop;
    }

    #appendContent(el) {
        const isAtBottom = Math.abs(this.div.scrollTop - this.div.scrollHeight) < 150;
        
        this.historyDiv.appendChild(el);

        // if (isAtBottom) {
            this.div.scrollTop = this.div.scrollHeight;
        // }

        while (this.div.scrollHeight > 2000) {
            this.historyDiv.children[0].remove();
        }
    }

    write(data, color, backgroundClr, showArrow) {
        const styles = this.styles;
        let el = document.createElement("div");
        
        el.style.display = "flex";
        el.style.borderBottom = styles.borderBottom;
        el.style.minHeight = "1em";
        el.style.overflowX = "auto";

        const outStyles = [styles.stdout, styles.stdbug, styles.stderr];
        el.style.backgroundColor = outStyles[backgroundClr].backgroundColor;
        
        el.className = "log-item";
        if (styles.arrow && showArrow) {
            el.append(this.#createArrow());
        }
        let txtEl = document.createElement("div");
        txtEl.style.whiteSpace = "pre";
        txtEl.style.paddingLeft = "4px";
        txtEl.style.paddingTop = "7px";
        txtEl.style.paddingBottom = "7px";
        txtEl.style.fontFamily = styles.fontFamily;
        txtEl.style.fontSize = styles.fontSize;
        txtEl.style.color = color;
        txtEl.textContent = data;
        el.append(txtEl);
        
        this.#appendContent(el);
    }

    in() {
        let inputEl = this.#createInput();

        this.historyDiv.appendChild(inputEl);
        
        inputEl.select();
        inputEl.focus();

        return new Promise(resolve => {
            function listenerCallback (e) {
                if (e.code === "Enter") {
                    e.currentTarget.removeEventListener(e.type, listenerCallback);
                    inputEl.readOnly = true;
                    resolve(inputEl.value);
                }
            }
            inputEl.addEventListener("keydown", listenerCallback);
        });
    }

    out(val, valType, showArrow, isErr) {
        let clr;
        const that = this;
        if (typeof valType === "object" && val !== null) {
            const keys = Object.keys(val);
            const tree = new JSONFormatter(deserializeObj(val, valType), keys.length > 16 ? 0 : 1, {
                theme: that.darkMode ? "dark" : "",
                useToJSON: false
            }).render();
            tree.style.paddingLeft = "10px";
            tree.style.paddingTop = "7px";
            tree.style.fontFamily = this.styles.fontFamily;
            tree.style.fontSize = this.styles.fontSize;
            this.#appendContent(tree);
        } else {
            if (valType === BOOLEAN) {
                val = val === "1" ? "true" : "false";
            } else if (valType === UNDEFINED) {
                val = "undefined";
            } else if (valType === UNDEFINED) {
                if (val.startsWith("function ")) {
                    val = "ƒ " + val.slice("function ".length);
                }
            }

            if (isErr) {
                valType = PLAIN;
            }
            if (this.darkMode) {
                clr = this.typeClrs.dark[valType];
            } else {
                clr = this.typeClrs.light[valType];
            }

            this.write(val, clr, isErr ? Terminal.STDERR : Terminal.STDOUT, showArrow);  
        } 
    }

    err(val, valType, showArrow) {
        this.out(val, valType, showArrow, true);
    }

    clear() {
        this.historyDiv.innerHTML = "";
    }
}
