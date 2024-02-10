class Terminal {
    colors = {
        debug: ["rgb(255, 251, 229)", "rgb(92, 60, 0)"],
        error: ["rgb(255, 240, 240)", "rgb(196, 43, 28)"],
    };
    
    constructor(div) {
        this.div = div;
    }

    out(val, options) {
        let el = document.createElement("div");
        el.style.whiteSpace = "pre";
        el.className = "log-item";
        el.textContent = val;

        for (let prop in options) {
            el.style[prop] = options[prop];
        }
        
        this.div.appendChild(el);
    }

    in() {
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

        this.div.appendChild(inputEl);
        
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
        this.out(val, {
            backgroundColor: this.colors.error[0],
            color: this.colors.error[1],
        });
    }    
}
