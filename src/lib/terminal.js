
class Terminal {
    static STDOUT = 0;
    static STDBUG = 1;
    static STDERR = 2;

    styles = {
        background: null,
        fontFamily: '"Droid Sans Mono", "monospace", monospace',
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

        this.div.innerHTML = "";
        this.history = document.createElement("div");
        this.div.append(this.history);

        this.replEnabled = enableRepl;

        if (enableRepl) {
            this.userInputContainer = document.createElement("div");
            this.userInputContainer.style.display = "flex";
            // this.userInputContainer.style.position = "fixed";
            this.userInputContainer.style.bottom = "0px";
            this.userInputContainer.style.minHeight = "1em";
            this.div.append(this.userInputContainer);

            let arrow = this.#createArrow();
            arrow.style.margin = this.styles.margin;
            arrow.style.marginBottom = this.styles.arrow.marginVertical;
            arrow.style.marginTop = this.styles.arrow.marginVertical;
            this.userInputContainer.append(arrow);

            this.userInput = this.#createInput();
            this.userInput.style.fontSize = this.styles.fontSize;
            this.userInput.style.display = "block";
            this.userInputContainer.append(this.userInput);

            const that = this;
            this.userInput.addEventListener("keydown", async e => {
                if (that.eval !== null && e.code === "Enter") {
                    const code = that.userInput.value;
                    that.out(code, Terminal.STDOUT, true);
                    const res = await that.eval(code);
                    that.userInput.value = "";
                    that.out(res, Terminal.STDOUT, true);
                }
            });

            this.div.addEventListener("click", () => {
                this.userInput.focus();
            });
        }

        this.useLightStyles();
    }

    #createArrow() {
        const styles = this.styles;
        let img = document.createElement("img");
        img.src = styles.arrow.url;
        img.style.display = "block";
        img.style.height = styles.arrow.height;
        img.style.margin = styles.arrow.margin;
        img.style.marginBottom = styles.arrow.marginVertical;
        img.style.marginTop = styles.arrow.marginVertical;
        img.style.filter = styles.arrow.filter;
        return img;
    }

    #createInput() {
        let inputEl = document.createElement("input");
        inputEl.style.whiteSpace = "pre";
        inputEl.className = "log-item";
        inputEl.style.background = "transparent";
        inputEl.style.border = "none";
        inputEl.style.outline = "none";
        inputEl.style.display = "inline";
        inputEl.style.color = "inherit";
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
        this.div.style.background = this.styles.background;
        if (this.replEnabled) {
            this.userInputContainer.getElementsByTagName("img")[0].style.filter = this.styles.arrow.filter;
        }
    }

    out(val, outputType, showArrow) {
        const styles = this.styles;
        let el = document.createElement("div");
        
        el.style.display = "flex";
        el.style.borderBottom = styles.borderBottom;
        el.style.minHeight = "1em";

        const outStyles = [styles.stdout, styles.stdbug, styles.stderr];
        el.style.backgroundColor = outStyles[outputType].backgroundColor;
        
        el.className = "log-item";
        if (styles.arrow && showArrow) {
            el.append(this.#createArrow());
        }
        let txtEl = document.createElement("div");
        txtEl.style.whiteSpace = "pre";
        txtEl.style.padding = "5px";
        txtEl.style.fontFamily = styles.fontFamily;
        txtEl.style.fontSize = styles.fontSize;
        txtEl.style.color = styles.color;
        txtEl.textContent = val;
        el.append(txtEl);
        
        const isAtBottom = Math.abs(this.div.scrollTop - this.div.scrollHeight) < 150;
        
        this.history.appendChild(el);

        // if (isAtBottom) {
            this.div.scrollTop = this.div.scrollHeight;
        // }

        while (this.div.scrollHeight > 2000) {
            this.history.children[0].remove();
        }
    }

    in() {
        let inputEl = this.#createInput();

        this.history.appendChild(inputEl);
        
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

    err(val) {
        this.out(val, Terminal.STDERR);
    }

    clear() {
        this.history.innerHTML = "";
    }
}
