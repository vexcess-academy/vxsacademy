$.createComponent("editor-container", $.html`
    <div style="display: flex; flex-direction: column;">
        <!-- upper contents -->
        <div class="editor-upper-contents" style="display: flex; flex-direction: row; overflow-x: auto;">
            <!-- sidebar -->
            <div class="editor-side-bar" style="display: none;">
                <div>New Program</div>
                <div>
                    <div>
                        <img src="/CDN/images/language-icons/html.png">
                        <span>index.html</span>
                    </div>
                    <div>
                        <img src="/CDN/images/language-icons/javascript.png">
                        <span>index.js</span>
                    </div>
                    <div>
                        <img src="/CDN/images/language-icons/css.png">
                        <span>style.css</span>
                    </div>
                </div>
            </div>

            <!-- main editor contents NOTE: change 0px to 200px when adding sidebar-->
            <div style="display: flex; flex-direction: row; width: calc(100% - 0px);">
                <!-- editor body -->
                <div style="display: flex; flex-direction: column; width: 100%; min-width: 300px;">
                    <!-- editor tabs -->
                    <div class="editor-tabs-bar">
                        <span class="editor-new-tab-btn">+</span>
                    </div>
                    <!-- editor main -->
                    <div class="editor" style="height: 600px; border: none; background-color: yellow;"></div>
                </div>
                
                <!-- output -->
                <div style="display: flex; flex-direction: column-reverse; background-color: blue;">
                    <!-- GRAPHICAL OUTPUT -->
                    <div class="output-frame-placeholder" style="width: 400px; height: 400px; background-color: purple;"></div>
                    <!-- CONSOLE OUTPUT -->
                    <div class="debug-console"></div>
                </div>
            </div>
        </div>

        <!-- button bar -->
        <div class="editor-buttons">
            <button class="editor-settings-btn button">
                Settings
                <img src="/CDN/images/icons/settings.svg" style="transform: translate(2px, 2px) scale(1.3);">
            </button>
            <button class="editor-fullscreen-btn button" onclick="window.open(window.location.href + '/fullscreen', '_blank')">
                Fullscreen
                <img src="/CDN/images/icons/fullscreen.svg" style="transform: translate(3px, 2px) scale(1.1);">
            </button>
            <span style="display: inline-block;">Auto-Refresh: </span>
            <label class="switch">
                <input type="checkbox" checked>
                <span class="vxs-slider round"></span>
            </label>
            <span style="float: right;">
                <button class="editor-run-btn button">
                    Run
                    <img src="/CDN/images/icons/run.svg" style="transform: translate(7px, 2px) scale(1.1);">
                </button>
                <button class="editor-save-btn button">
                    <span>Save</span>
                    <img src="/CDN/images/icons/save.svg" style="transform: translate(5px, 2px) scale(1.2);">
                </button>
            </span>
        </div>
    </div>    
`)

$.createComponent("editor-tab", $.html`
    <div class="editor-tab" draggable="true">
        <input class="editor-tab-input" type="text" value="\{fileName}" readonly="true" style="width: \{fileName.length}ch">
        <svg viewBox="0 0 32 32" class="editor-tab-close" height="15">
            <path fill="var(--themeTextColor)" d="M 7.21875 5.78125 L 5.78125 7.21875 L 14.5625 16 L 5.78125 24.78125 L 7.21875 26.21875 L 16 17.4375 L 24.78125 26.21875 L 26.21875 24.78125 L 17.4375 16 L 26.21875 7.21875 L 24.78125 5.78125 L 16 14.5625 Z"></path>
        </svg>
    </div>
`);

function createFlattenedDirPaths(dir) {
    let paths = [];
    for (let prop in dir) {
        if (typeof dir[prop] === "string") {
            // is file
            paths.push("/" + prop);
        } else {
            // is directory
            const subPaths = createFilePaths(dir[prop]);
            for (var i = 0; i < subPaths.length; i++) {
                paths.push("/" + prop + subPaths[i]);
            }
        }
    }
    return paths;
}

function getFileContents(dir, path) {
    const segs = path.split("/");
    for (let i = 1; i < segs.length; i++) {
        dir = dir[segs[i]];
    }
    if (typeof dir === "string") {
        return dir;
    } else {
        return null;
    }
}

function getMainFilePath() {
    switch (programData.type) {
        case "webpage":
            return "/index.html";
        case "pjs":
            return "/index.js";
        case "java":
            return "/Main.java";
        case "glsl":
            return "/image.glsl";
        case "c":
            return "/main.c";
        case "cpp":
            return "/main.cpp";
        case "zig":
            return "/main.zig";
        case "python":
            return "/main.py";
        case "jitlang":
            return "/main.jitl";
    }
}

let isPreventingPageUnload = false;
function preventPageUnload(e) {
    e.preventDefault();
    e.returnValue = '';
}
function addBeforeUnloadListener() {
    if (!isPreventingPageUnload) {
        window.addEventListener("beforeunload", preventPageUnload);
        isPreventingPageUnload = true;
    }
}

let monacoReady = false;

class NumberScrubber {
    static newElement = $.createComponent("number-scrubber", $.html`
        <div class="number-scrubber">
            <span class="number-scrubber-left">
                <svg width="12px" height="12px" viewBox="-25, -25, 150, 150"><polygon points="0,50 100,0 100, 100" fill="white"></polygon></svg>
            </span>
            <span>
                <svg width="12px" height="12px" viewBox="-25, -25, 150, 150"><polygon points="50,0 100,50 50,100 0,50" fill="white"></polygon></svg>
            </span>
            <span class="number-scrubber-right">
                <svg width="12px" height="12px" viewBox="-25, -25, 150, 150"><polygon points="100,50 0,0 0, 100" fill="white"></polygon></svg>
            </span>
            <div class="number-scrubber-arrow"></div>
        </div>
    `);

    editor;
    originX;
    mouseOriginX;
    x;
    y;
    rStart = 0;
    rEnd = 0;
    cStart = 0;
    cEnd = 0;
    element;
    value = 0;
    decimalPlaces = 0;
    increment = 1;
    isPressed = false;
    isMoving = false;
    moveInterval = null;
    
    constructor(editor, x, y, rStart, cStart, rEnd, cEnd, textContent) {
        this.editor = editor;

        let self = this;
        
        this.rStart = rStart;
        this.cStart = cStart;
        this.rEnd = rEnd;
        this.cEnd = cEnd;

        {
            let spl = textContent.split(".");
            if (spl[1]) {
                this.decimalPlaces = spl[1].length;
                this.increment = 1 / (10 ** this.decimalPlaces);
            }
            
            let i = 0;
            while ("-.0123456789".includes(textContent[i])) {
                i++;
            }
            this.value = Number(textContent.slice(0, i));
        }
        
        this.element = NumberScrubber.newElement().appendTo(document.body);
        let size = this.element.getBoundingClientRect();
        this.originX = x;
        this.x = this.originX - size.width / 2;
        this.y = y - size.height - 14;
        this.element.css({
            left: this.x + "px",
            top: (window.scrollY + this.y) + "px"
        });

        this.element.on("mousedown", e => {
            self.isPressed = true;
            self.isMoving = false;
            self.mouseOriginX = e.clientX;
        });

        this.element.on("mousemove", () => {
            if (self.isPressed && !self.isMoving) {
                self.isMoving = true;
                self.moveInterval = setInterval(() => {
                    if (!mouseIsPressed) {
                        self.isPressed = false;
                        clearInterval(self.moveInterval);
                        self.moveInterval = null;
        
                        self.x = self.originX - size.width / 2;
                        self.element.css({
                            left: self.x + "px"
                        });
                    } else {
                        self.x = mouseX - size.width / 2;
                        self.element.css({
                            left: self.x + "px"
                        });
                        self.update(Math.round(mouseX - self.mouseOriginX) * self.increment);
                        self.mouseOriginX = mouseX;
                    }
                }, 1000 / 120);
            }
        });

        this.element.$(".number-scrubber-left")[0].on("click", () => {
            self.update(-self.increment);
        });

        this.element.$(".number-scrubber-right")[0].on("click", () => {
            self.update(self.increment);
        });
    }

    getEditorText() {
        let range = new monaco.Range(this.rStart, this.cStart, this.rEnd, this.cEnd);
        return this.editor.monacoEditor.getModel().getValueInRange(range);
    }

    update(amt) {
        let strBefore = this.value.toFixed(this.decimalPlaces);
        this.value += amt;
        let strAfter = this.value.toFixed(this.decimalPlaces);
        
        this.editor.monacoEditor.executeEdits('number-scrubber', [
            {
                range: new monaco.Range(this.rStart, this.cStart, this.rEnd, this.cEnd),
                text: strAfter
            }
        ]);

        this.cEnd += strAfter.length - strBefore.length;
    }

    free() {
        this.element.remove();
        if (this.moveInterval !== null) {
            clearInterval(this.moveInterval);
        }
    }
}

class Model {
    highlightingType;
    monacoModel;

    constructor(editor, filePath) {
        const self = this;

        const fileName = filePath.split("/").reverse()[0];

        const fileExt = fileName.split(".").reverse()[0];
        switch (fileExt) {
            case "js":
                this.highlightingType = "javascript";
            break;
            case "py":
                this.highlightingType = "python";
            break;
            case "txt":
                this.highlightingType = "plain";
            break;
            case "html":
                this.highlightingType = "html";
            break;
            case "css":
                this.highlightingType = "css";
            break;
            case "c":
                this.highlightingType = "c";
            break;
            case "glsl":
                this.highlightingType = "c";
            break;
            case "cpp":
                this.highlightingType = "cpp";
            case "zig":
                this.highlightingType = "rust";
            case "jitl":
                this.highlightingType = "go";
            break;
            case "json":
                this.highlightingType = "json";
            break;
        }

        let fileContent = getFileContents(programData.files, filePath);

        this.monacoModel = monaco.editor.createModel(fileContent, this.highlightingType);

        this.monacoModel.updateOptions({
            tabSize: "4",
            fontSize: editor.settings.fontSize + "px",
            wrap : editor.settings.wrap,
            language: this.highlightingType
        });

        this.monacoModel.name = fileName;

        this.monacoModel.onDidChangeContent(event => {
            programData.files[fileName] = self.monacoModel.getValue();
        });
    }
}

class Tab {
    editor;
    fileName;
    filePath;
    div;
    model;

    constructor(editor, filePath) {
        const self = this;

        this.editor = editor;

        this.filePath = filePath;
        this.fileName = filePath.split("/").reverse()[0];

        this.model = new Model(editor, filePath);

        this.div = $("editor-tab", { fileName: this.fileName });
        
        this.div.on("dragstart", () => {
            self.div.classList.add("dragging");
        });

        this.div.on("dragend", () => {
            self.div.classList.remove("dragging");
        });

        // handle the tab being clicked
        this.div.on("click", function() {
            self.editor.focusTab(self);
        });

        // the file name element
        let tabInput = this.div.$(".editor-tab-input")[0];
        tabInput
            .on("input", function(e) {
                tabInput.style.width = tabInput.value.length + "ch";
            })
            .on("keyup", function(e) {
                if (e.key === "Enter") {
                    tabInput.blur();
                }
            })
            .on("dblclick", function(e) {
                if (tabInput.readOnly === true) {
                    tabInput.readOnly = false;
                    tabInput.css("outline: 1px solid rgb(100, 100, 100)");
                }
            })
            .on("blur", function(e) {
                const formerName = self.fileName;
                const newName = tabInput.value;

                let check = validateFileName(newName);
                if (newName !== formerName && programData.files[newName] !== undefined) {
                    check = "error: file already exists";
                }
                
                if (check !== "OK") {
                    // revert name change
                    tabInput.value = formerName;
                    alert("file name " + check);
                } else {
                    // update name
                    self.fileName = newName;

                    // remove old file path
                    const pathIdx = editor.filePaths.indexOf(self.filePath);
                    editor.filePaths.splice(pathIdx, 1);

                    // add new file path
                    const temp = self.filePath.split("/");
                    self.filePath = temp.slice(0, temp.length - 1).join("/") + "/" + newName;
                    editor.filePaths.push(self.filePath);

                    // update file name in file tree
                    programData.files[newName] = programData.files[formerName];
                    delete programData.files[formerName];
                }

                tabInput.readOnly = true;
                tabInput.css("outline: none");
            });

        // the close button
        this.div.$(".editor-tab-close")[0].on("click", function(e) {
            if (confirm("Are you sure you want to delete this file? This cannot be undone!") === true) {
                self.delete();
            }

            e.stopPropagation();
        });

        // append to tab bar
        this.editor.tabsBar.insertBefore(this.div, this.editor.newTabBtn);
    }

    getFileName() {
        return this.model.monacoModel.name;
    }

    delete() {
        const editor = this.editor;
        const fileName = this.fileName;

        // remove from tabs array
        const tabIdx = editor.tabs.indexOf(this);
        editor.tabs.splice(tabIdx, 1);
        
        // remove tab element
        this.div.remove();

        // focus neighbor tab instead of this one
        if (editor.focusedTab.fileName === fileName) {
            const gotoIdx = tabIdx - 1 < 0 ? 0 : tabIdx - 1;
            if (editor.tabs[gotoIdx]) {
                this.editor.focusTab(editor.tabs[gotoIdx]);
            }
        }
        
        delete programData.files[fileName];
    }

    save() {
        programData.files[this.fileName] = this.model.monacoModel.getValue();
    }
}

class Sandbox {
    iframe;
    editor;
    loadIcon;
    ready = false;
    win;

    constructor(editor) {
        const self = this;

        this.editor = editor;

        this.iframe = $("iframe");

        // setup output frame sandbox
        this.iframe.attr({
            sandbox: "allow-pointer-lock allow-same-origin allow-scripts allow-popups allow-modals allow-forms",
            width: this.editor.settings.width,
            height: this.editor.settings.height
        }).css({
            backgroundColor: "white",
            borderTop: "none",
            borderRight: "none",
            borderBottom: "none",
            marginLeft: "auto",
            order: "2"
        });
        const placeholder =  $(".output-frame-placeholder")[0];
        placeholder.parentElement.replaceChild(this.iframe.el, placeholder.el);

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

        if (programData.id) {
            this.iframe.attr("src", sandboxURL + "/exec-" + programData.type + ".html?allowed=" + domains.map(btoa).join(","));
        } else {
            this.iframe.attr("src", sandboxURL + "/exec-" + programData.type + ".html?allowAll=true");
        }

        this.loadIcon = loadIconManager.new(200);
        this.updateLoadIcon();

        this.iframe.on("load", () => {
            loadIconManager.delete(self.loadIcon);
            self.loadIcon = null;

            self.editor.runProgram();

            self.ready = true;
        });

        this.win = this.iframe.contentWindow ?? outputFrame.window;
    }

    getUsedURLs() {
        
    }

    updateLoadIcon() {
        // display loading icon
        let outputFrameBox = this.iframe.getBoundingClientRect();
        if (this.loadIcon) {
            this.loadIcon.css({
                position: "absolute",
                left: (outputFrameBox.left + outputFrameBox.right) / 2 - this.loadIcon.width / 2 + "px",
                top: (outputFrameBox.bottom + outputFrameBox.top) / 2 - this.loadIcon.height / 2 + window.scrollY + "px"
            });
            this.editor.container.append(this.loadIcon);
        }
    }
}

class VXSEditor {
    static REPL_PROGRAM_TYPES = ["webpage", "pjs", "python"];
    static COMPILED_PROGRAM_TYPES = ["java", "cpp", "zig"];

    container;
    monacoEditor;
    editorDiv;
    upperContent;
    saveBtnEl;
    runBtnEl;
    sideBar;
    terminal;
    sandbox;
    settings;
    tabs = [];
    focusedTab;
    filePaths;
    tabsBar;
    newTabBtn;
    autoRefresh;
    awaitingThumbnail = false;
    settingsDialog;

    constructor(placeholder) {
        const self = this;

        // setup settings
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.settings = {
            width: programData.width,
            height: programData.height,
            indentSize: 4,
            fontSize: 13,
            theme: prefersDarkMode ? "vs-dark" : "vs",
            wrap: true
        };

        // create editor container
        this.container = $("editor-container").setId("editor-container");
        placeholder.parentElement.replaceChild(this.container.el, placeholder.el);

        this.settingsDialog = new SettingsDialog(this);
        this.settingsBtnEl = this.container.$(".editor-settings-btn")[0];
        this.settingsBtnEl.on("click", () => {
            self.settingsDialog.show();
        });

        this.saveBtnEl = this.container.$(".editor-save-btn")[0];
        this.saveBtnEl.on("click", () => {
            self.saveProgram();
        });
        if (!userData) {
            this.saveBtnEl.css("display: none");
        }
        if (userData && programData.author && programData.author.id !== userData.id) {
            this.saveBtnEl.$("*span")[0].innerText = "Fork";
        }

        this.runBtnEl = this.container.$(".editor-run-btn")[0];
        this.runBtnEl.on("click", () => {
            self.runProgram();
        });

        this.editorDiv = this.container.$(".editor")[0];

        this.sideBar = this.container.$(".editor-side-bar")[0];

        this.tabsBar = $(".editor-tabs-bar")[0];

        // help make tabs draggable
        const dragTabPlaceholder = $("div").text("|").css(`
            background-color: rgb(128, 128, 128);
            width: 2px;
            margin-left: 2px;
            display: inline-block;
            margin-right: 4px;
            color: transparent;
            padding-left: 0px;
            padding-right: 0px;
            padding-top: 4px;
            padding-bottom: 3px;
        `);
        this.tabsBar.on("dragenter", e => e.preventDefault());
        this.tabsBar.on("dragover", e => {
            e.preventDefault();
            
            let siblings = self.tabsBar.$(".editor-tab")
                .filter(t => !t.classList.contains("dragging"))
                .sort((a, b) => a.offsetLeft - b.offsetLeft);

            let index = 0;
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].offsetLeft + siblings[i].offsetWidth / 2 < e.clientX) {
                    index++;
                }
            }

            if (index < siblings.length) {
                self.tabsBar.insertBefore(dragTabPlaceholder, siblings[index].el);
            } else {
                self.tabsBar.insertBefore(dragTabPlaceholder, siblings[siblings.length - 1].el.nextSibling);
            }    
        });
        this.tabsBar.on("dragend", e => {
            e.preventDefault();
            self.tabsBar.replaceChild(e.target, dragTabPlaceholder);
        });

        this.newTabBtn = this.tabsBar.$(".editor-new-tab-btn")[0];
        this.newTabBtn.on("click", () => {
            // create file name
            let fileName;
            let i = 0;
            while (programData.files["new (" + i + ").txt"] !== undefined) {
                i++;
            }
            fileName = "new (" + i + ").txt";

            // create file
            programData.files[fileName] = "";

            // create editor tab
            const tab = new Tab(self, `/${fileName}`);
            self.tabs.push(tab);

            // focus tab input
            let nameEl = tab.div.$("*input")[0];
            nameEl.readOnly = false;
            nameEl.css("outline: 1px solid rgb(100, 100, 100)");
            nameEl.focus();
            nameEl.select();
        });

        this.upperContent = $(".editor-upper-contents")[0];

        this.filePaths = createFlattenedDirPaths(programData.files);

        // auto refresh slider
        this.autoRefresh = localStorage.getItem("auto_refresh_editor") === "1" ? true : false;
        const autoRefreshEl = this.container.$(".switch")[0].$("*input")[0];
        autoRefreshEl.checked = this.autoRefresh;
        autoRefreshEl.on("change", () => {
            self.autoRefresh = autoRefreshEl.checked;
            localStorage.setItem("auto_refresh_editor", self.autoRefresh ? "1" : "0");
        });

        // setup terminal
        const debugConsoleEl = this.container.$(".debug-console")[0];
        const useRepl = VXSEditor.REPL_PROGRAM_TYPES.includes(programData.type);
        this.terminal = new Terminal(debugConsoleEl.el, useRepl);
        this.terminal.styles.background = "var(--themeColor)";

        let evalResult;

        this.terminal.eval = async function(code) {
            evalResult = undefined;
    
            return new Promise(resolve => {
                self.sandbox.win.postMessage({
                    event: "eval",
                    data: code
                }, "*");
    
                const start = Date.now();
                function check() {
                    if (evalResult !== undefined) {
                        resolve(evalResult);
                    } else if (Date.now() - start < 3000) {
                        setTimeout(check, 4);
                    } else {
                        console.log("Console Eval Timed Out");
                    }
                }
                check();
            });
        };

        // create sandbox
        this.sandbox = new Sandbox(this);

        const editTitleBtn = $("#edit-title-btn");
        this.setTitle(programData.title);
        editTitleBtn.on("click", () => {
            let title = window.prompt("Enter a new title:", "New Program");
            if (title.length === 0) title = "New Program";
            self.setTitle(title);
        });

        // listen for sandbox messages
        window.addEventListener("message", event => {
            let data = event.data;

            if (typeof data === "object" && data.sender === "sandbox") {
                if (self.sandbox.loadIcon !== null) {
                    loadIconManager.delete(self.sandbox.loadIcon);
                    self.sandbox.loadIcon = null;
                }

                const values = data.data;
                switch (data.event) {
                    case "thumbnail":
                        programData.thumbnail = data.thumbnail;
                        if (self.awaitingThumbnail) {
                            self.awaitingThumbnail = false;
                        }
                    break;
                    case "stderr":
                        if (values !== null) {
                            try {
                                for (var i = 0; i < values.types.length; i++) {
                                    self.terminal.err(values.obj[i], values.types[i], Terminal.STDOUT);
                                }
                            } catch (er) {
                                console.log("OUTTERR", JSON.stringify(values))
                            }
                        }
                    break;
                    case "stdout":
                        if (values !== null) {
                            for (var i = 0; i < values.types.length; i++) {
                                self.terminal.out(values.obj[i], values.types[i], Terminal.STDOUT);
                            }
                        }
                    break;
                    case "evalResult":
                        evalResult = data.data;
                    break;
                }
            }
        });

        // // if not a new program
        // if (programData.id) {
        //     // non-logged in users can't save
        //     if (!userData) {
        //         this.saveBtnEl.css("display: none");
        //     }
            
        //     // non-owners can fork instead of save
        //     if (userData && programData.author.id !== userData.id) {
        //         this.saveBtnEl.$("*span")[0].innerText = "Fork";
        //     }
        
        //     // display spin-off info
        //     if (typeof programData.parent === "string" && programData.parent.length > 0) {
        //         let parentLinkEl = $("#forked-from")
        //             .html("Forked From: ");
                
        //         $.getJSON(`/CDN/programs/${programData.parent}.json`)
        //             .then(res => {
        //                 parentLinkEl.append(
        //                     $("a")
        //                         .css({
        //                             textDecoration: "none",
        //                             color: "rgb(0, 140, 60)"
        //                         })
        //                         .text(res.title)
        //                         .attr({
        //                             href: "/computer-programming/" + res.id
        //                         })
        //                 );
        //             })
        //             .catch(() => {
        //                 parentLinkEl.textContent += "Deleted Program";
        //             })
        //     }
        
        //     // display author stats
        //     let programAuthorEl = $("#program-author")
        //         .html("Created By: ")
        //         .append(
        //             $("a")
        //                 .css({
        //                     textDecoration: "none",
        //                     color: "rgb(0, 140, 60)"
        //                 })
        //                 .text(programData.author.nickname)
        //                 .attr({
        //                     target: "_blank",
        //                     href: (isKAProgram ? "https://www.khanacademy.org/profile/" : "/profile/id_") + programData.author.id
        //                 })
        //         );
        //     programAuthorEl.innerHTML += " (Updated " + timeSince(programData.lastSaved - 30 * 1000) + " ago)";
        
        //     // display other stats
        //     $("#program-hidden").text("Hidden: No");
        //     $("#program-created").text("Created: " + new Date(programData.created).toLocaleString('en-US', { timeZone: 'UTC' }));
        //     $("#program-updated").text("Updated: " + new Date(programData.lastSaved).toLocaleString('en-US', { timeZone: 'UTC' }));
        // }

        // if (programData.author) {
        //     // non-owner can't delete or change title
        //     if (!userData || (programData.author.id !== userData.id)) {
        //         $("#delete-program-button").remove();
        //         editTitleBtn.remove();
        //     }
        
        //     // like button stuff
        //     let likeProgramBtn = $("#like-program-button");
            
        //     // set like button content
        //     likeProgramBtn.$("*span")[0].text(userData && programData.hasLiked ? "Liked!" : "Like");
        //     likeProgramBtn.$("*span")[1].text(" · " + programData.likeCount);
            
        //     // handle like button click
        //     likeProgramBtn.on("click", () => {
        //         if (isKAProgram) {
        //             alert("KA programs cannot be liked from vxsacademy");
        //             return;
        //         }
    
        //         if (!userData) {
        //             alert("You must be logged in to like a program");
        //             return;
        //         }
        
        //         if (programData.hasLiked) {
        //             likeProgramBtn.$("*span")[0].text("Unliking...");
        //         } else {
        //             likeProgramBtn.$("*span")[0].text("Liking...");
        //         }
        //         likeProgramBtn.disabled = true;
                
        //         fetch("/API/like_program", {
        //             method: "POST",
        //             body: window.location.href.split("/")[4]
        //         }).then(res => res.text()).then(function (res) {
        //             if (res.includes("error")) {
        //                 alert(res);
        //             } else if (res === "200") {
        //                 if (programData.hasLiked) {
        //                     programData.likeCount--; // unlike the program
        //                     programData.hasLiked = false;
        //                 } else {
        //                     programData.likeCount++; // like the program
        //                     programData.hasLiked = true;
        //                 }
                        
        //                 // set like button content
        //                 likeProgramBtn.$("*span")[0].text(userData && programData.hasLiked ? "Liked!" : "Like");
        //                 likeProgramBtn.$("*span")[1].text(" · " + programData.likeCount);
        //             }
        //         });
        
        //         setTimeout(() => {
        //             likeProgramBtn.disabled = false;
        //         }, 5000);
        //     });
        
        //     // handle delete button click
        //     deleteButtonEL.on("click", () => {
        //         if (confirm("Are you sure you want to delete this project? This cannot be undone!") === true) {
        //             fetch("/API/delete_program", {
        //                 method: "POST",
        //                 body: window.location.href.split("/")[4]
        //             }).then(res => res.text()).then(function (res) {
        //                 if (res.includes("error")) {
        //                     alert(res);
        //                 } else {
        //                     window.location.href = "/computer-programming/";
        //                 }
        //             });
        //         }
        //     });
        // } else {
        //     $("#like-program-button").remove();
        //     $("#delete-program-button").remove();
        //     $("#report-program-button").remove();
        // }

        self.updateStyles();

        // resize if the window size is changed
        self.updateSize();
        window.addEventListener('resize', () => {
            self.updateSize();
        }, true);
    }

    async init() {
        const self = this;

        // console.log(monaco)

        function readyCallback() {
            // add auto completion to html
            monaco.languages.registerCompletionItemProvider('html', {
                triggerCharacters: ['>'],
                provideCompletionItems: (model, position) => {
                    const codePre = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });
            
                    const tag = codePre.match(/.*<(\w+)>$/)?.[1];
            
                    if (!tag) return;
            
                    const word = model.getWordUntilPosition(position);
            
                    return {
                        suggestions: [{
                            label: `</${tag}>`,
                            kind: monaco.languages.CompletionItemKind.EnumMember,
                            insertText: `$1</${tag}>`,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endColumn: word.endColumn
                            }
                        }]
                    };
                },
            });

            // so people don't accidentally exit and lose all their code
            self.editorDiv.on("keyup", e => {
                if (!e.ctrlKey && e.key !== "Control") {
                    addBeforeUnloadListener(e);
                }
            });

            if (PROGRAM_ID === "new") {
                // save code when the user exits the page
                window.addEventListener("beforeunload", () => {
                    self.saveLocally();
                })

                // save code every minute (if browser fails to save the code when the page is unloaded, this will ensure that all is not lost)
                setInterval(() => {
                    self.saveLocally();
                }, 1000 * 60);
            }

            // the editor
            self.monacoEditor = monaco.editor.create(self.editorDiv.el, {
                automaticLayout: true
            });

            let mainTab = null;
            const mainFilePath = getMainFilePath();
            for (let i = 0; i < self.filePaths.length; i++) {
                const path = self.filePaths[i];
                const tab = new Tab(self, path);
                self.tabs.push(tab);
                if (path === mainFilePath) {
                    mainTab = tab;
                }
            }
            if (mainTab) {
                self.focusTab(mainTab);
            }

            // run code live
            self.monacoEditor.onDidChangeModelContent(() => {
                if (self.autoRefresh) {
                    if (!VXSEditor.COMPILED_PROGRAM_TYPES.includes(programData.type)) {
                        self.runProgram();
                    }
                }
            });

            // run shortcut
            self.monacoEditor.addAction({
                id: "run-shortcut",
                label: "Run Shortcut",
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: "navigation",
                contextMenuOrder: 1.5,
                run: () => {
                    self.runProgram();
                }
            });

            // save shortcut
            self.monacoEditor.addAction({
                id: "save-shortcut",
                label: "Save Shortcut",
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
                ],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: "navigation",
                contextMenuOrder: 1.5,
                run: () => {
                    self.saveProgram();
                }
            });

            self.updateStyles();

            // self explanatory
            let currentScrubber = null;

            // handle clicks to open number scrubber
            self.editorDiv.on("click", e => {
                // get all touched elements
                let els = document.elementsFromPoint(e.clientX, e.clientY);
                for (let i = 0; i < els.length; i++) {
                    let el = els[i];
                    // find the innermost span
                    if (el.nodeName === "SPAN" && el.children.length === 0) {
                        // parse token to number
                        let tokenContent = el.textContent;
                        let res = parseFloat(tokenContent);
                        if (typeof res === "number" && !Number.isNaN(res)) {
                            // find padding
                            let startPadding = tokenContent.length - tokenContent.trimStart().length;
                            let endPadding = tokenContent.length - tokenContent.trimEnd().length;
                            
                            // get list of siblings plus self
                            let kids = Array.from(el.parentElement.getElementsByTagName("span"));
                            // get the row element of the token
                            let line = el.parentElement.parentElement;

                            // handle negative numbers
                            let isNegative = startPadding === 0 && kids.indexOf(el) > 0 && kids[kids.indexOf(el) - 1].textContent === "-";

                            // find start index of token
                            let columnStart = 1;
                            {
                                let j = 0;
                                while (kids[j] !== el && j < kids.length) {
                                    columnStart += kids[j].textContent.length;
                                    j++;
                                }
                            }

                            // find end index of token
                            let columnEnd = columnStart + tokenContent.length;
                            let lines = Array.from(line.parentElement.getElementsByClassName("view-line"));
                            lines = lines.sort((a, b) => parseInt(a.style.top) - parseInt(b.style.top));
                            let displayRow = 0;
                            for (let j = 0; j < lines.length; j++) {
                                if (lines[j] === line) {
                                    displayRow = j;
                                    break;
                                }
                            }

                            // adjust for padding
                            columnStart += startPadding;
                            columnEnd -= endPadding;

                            // find position
                            let lineNumbers = Array.from($(".margin-view-overlays")[0].children);
                            lineNumbers = lineNumbers.sort((a, b) => parseInt(a.textContent) - parseInt(b.textContent));
                            let row = parseInt(lineNumbers[displayRow].textContent);
                            let pos = el.getBoundingClientRect();
                            let charW = pos.width / tokenContent.length;

                            currentScrubber = new NumberScrubber(
                                self,
                                pos.x + (startPadding * charW) + (pos.width - startPadding * charW - endPadding * charW) / 2, 
                                pos.y, row, columnStart - (isNegative ? 1 : 0), row, columnEnd, (isNegative ? "-" : "") + tokenContent.trim()
                            );
                        }
                    }
                }
            });

            // remove number scrubber if you scroll too far
            self.monacoEditor.onDidScrollChange(e => {
                let yChange = e._oldScrollTop - e.scrollTop;
                if (currentScrubber) {
                    currentScrubber.y += yChange;
                    currentScrubber.element.css({
                        top: (window.scrollY + currentScrubber.y) + "px"
                    });

                    let editorArea = self.editorDiv.getBoundingClientRect();
                    if (currentScrubber.y + 40 < editorArea.y || currentScrubber.y + 40 > editorArea.y + editorArea.height) {
                        currentScrubber.free();
                        currentScrubber = null;
                    }
                }
            });

            // remove number scrubber on mouse and key presses
            function checkDestroyScrubber() {
                if (currentScrubber !== null) {
                    currentScrubber.free();
                    currentScrubber = null;
                }
            }
            self.monacoEditor.onMouseDown(checkDestroyScrubber);
            self.monacoEditor.onKeyDown(checkDestroyScrubber);
            $(document.body).on("mousedown", e => {
                if (currentScrubber !== null && !currentScrubber.element.contains(e.target) && !self.editorDiv.el.contains(e.target)) {
                    checkDestroyScrubber();
                }
            });

        }

        return new Promise(resolve => {
            function waitTillReady() {
                if (monacoReady) {
                    readyCallback();
                    resolve();
                } else {
                    setTimeout(waitTillReady, 100);
                }
            }
            waitTillReady();
        });
    }

    updateStyles() {
        const cssTag = $("link")
            .attr({
                rel: "stylesheet",
                type: "text/css"
            });
        // window.cssTag = cssTag;
        if (this,this.settings.theme === "vs-dark") {
            cssTag.attr("href", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-okaidia.min.css");
            if (typeof monaco !== "undefined" && monaco?.editor) {
                monaco.editor.setTheme("vs-dark");
            }
            document.querySelector(':root').style.setProperty('--themeColor', 'rgb(30, 30, 30)');
            document.querySelector(':root').style.setProperty('--fadedThemeColor', 'rgb(50, 50, 50)');
            // document.querySelector(':root').style.setProperty('--hoverThemeColor', 'rgb(50, 50, 50)');
            document.querySelector(':root').style.setProperty('--themeTextColor', 'rgb(248, 248, 242)');
            this.terminal.useDarkStyles();
            this.sandbox.iframe.css({
                borderLeft: "1px solid rgb(70, 70, 70)",
            });
            $(this.terminal.div).css({
                borderLeft: "1px solid rgb(70, 70, 70)",
            });
        } else {
            cssTag.attr("href", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.min.css");
            if (typeof monaco !== "undefined" && monaco?.editor) {
                monaco.editor.setTheme("vs");
            }
            document.querySelector(':root').style.setProperty('--themeColor', 'rgb(230, 230, 230)');
            document.querySelector(':root').style.setProperty('--fadedThemeColor', 'rgb(190, 190, 190)');
            // document.querySelector(':root').style.setProperty('--hoverThemeColor', 'rgb(220, 220, 220)');
            document.querySelector(':root').style.setProperty('--themeTextColor', 'rgb(50, 50, 50)');
            this.terminal.useLightStyles();
            this.sandbox.iframe.css({
                borderLeft: "1px solid rgb(207, 207, 207)",
            });
            $(this.terminal.div).css({
                borderLeft: "1px solid rgb(207, 207, 207)",
            });
        }
        cssTag.appendTo(document.body);
    }

    setTitle(title) {
        const programTitleEl = $("#program-title").$("*span")[0];
        programData.title = title;
        programTitleEl.text(title);
    }

    updateSize() {
        const upperEditorHeight = window.innerHeight - 220;

        // resize whole upper editor
        this.upperContent.style.height = upperEditorHeight + "px";

        // resize graphical output
        this.sandbox.iframe.width = this.settings.width;
        this.sandbox.iframe.height = this.settings.height;

        // resize terminal output
        this.terminal.div.style.width = this.settings.width + "px";
        this.terminal.div.style.height = (upperEditorHeight - this.settings.height) + "px";
        
        // resize sidebar
        this.sideBar.style.height = upperEditorHeight + "px";

        // resize monaco editor
        this.tabsBar.parentElement.style.width = `calc(100% - ${this.settings.width + 1}px)`;
        this.editorDiv.style.height = upperEditorHeight + "px";

        if (this.upperContent.scrollHeight > this.upperContent.clientHeight) {
            this.upperContent.css({
                height: this.upperContent.scrollHeight + (this.upperContent.scrollHeight - this.upperContent.clientHeight) + "px"
            });
        }

        this.sandbox.updateLoadIcon();
    }

    focusTab(tab) {
        // save previous tab
        if (this.focusedTab instanceof Tab) {
            this.focusedTab.save();
        }
        
        this.focusedTab = tab;
        this.monacoEditor.setModel(tab.model.monacoModel);

        const tabEls = this.tabsBar.$(".editor-tab");

        for (var i = 0; i < tabEls.length; i++) {
            tabEls[i].css("background-color: var(--fadedThemeColor)");
        }
        tab.div.css("background-color: var(--themeColor)");
    }

    async sandboxReady() {
        const ifrWin = this.sandbox.iframe.contentWindow || this.sandbox.iframe.window;

        ifrWin.postMessage("ping", "*");
    }

    runProgram() {
        const ifrWin = this.sandbox.iframe.contentWindow || this.sandbox.iframe.window;

        ifrWin.postMessage("ping", "*");

        this.terminal.clear();
        
        const entrypoint = getMainFilePath();
        var mainCode = getFileContents(programData.files, entrypoint);
        if (mainCode === null) {
            myEditor.terminal.err("Failed to locate entrypoint");
        } else {
            if (entrypoint === "/index.html" && mainCode.includes("<title>") && mainCode.includes("<\/title>")) {
                this.setTitle(mainCode.split("<title>")[1].split("<\/title>")[0]);
            }
            
            ifrWin.postMessage({
                width: this.settings.width,
                height: this.settings.height,
                files: programData.files
            }, "*");
        }
    }

    saveLocally() {
        // save user code to local storage
        if (typeof programData.width === "number" && 
            typeof programData.height === "number" &&
            typeof programData.files === "object"
        ) {
            localStorage.setItem("cs-new-program-" + programData.type, JSON.stringify({
                width: this.settings.width,
                height: this.settings.width,
                files: programData.files
            }));
        }
    }

    async saveProgram() {
        const self = this;

        if (isKAProgram) {
            alert("KA programs cannot be saved or forked from vxsacademy");
            return;
        }

        if (!userData) {
            alert("You must be logged in to save a program");
            return;
        }

        // request thumbnail
        this.sandbox.win.postMessage("thumbnail", "*");
        this.awaitingThumbnail = true;

        async function waitForThumbnail() {
            return new Promise(resolve => {
                function checkIfThumbnailRecieved() {
                    if (self.awaitingThumbnail) {
                        setTimeout(checkIfThumbnailRecieved, 16);
                    } else {
                        resolve();
                    }
                }
                checkIfThumbnailRecieved();
            });
        }

        await waitForThumbnail();
    
        // might not be necessary
        this.focusedTab.save();
    
        // validate program object
        const check = validateProgramData(programData);
        if (check !== "OK") {
            alert(check);
            return;
        }
    
        // allow page to unload
        window.removeEventListener("beforeunload", preventPageUnload);
        isPreventingPageUnload = false;

        async function createNewProgram(myProgramDataToSend) {
            const res = await fetch("/API/create_program", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(myProgramDataToSend)
            });
            const txt = await res.text();
            if (txt.includes("error")) {
                alert(txt);
            } else {
                // when you save the program it gets removed from localStorage
                localStorage.removeItem("cs-new-program-" + programData.type);
                window.location.href = "/computer-programming/" + txt;
            }
        }

        let programDataToSend = {
            title: programData.title,
            type: programData.type,
            width: self.settings.width,
            height: self.settings.height,
            files: programData.files,
            thumbnail: programData.thumbnail
        };

        self.saveBtnEl.$("*span")[0].text("Saving...");
        self.saveBtnEl.disabled = true;

        setTimeout(() => {
            self.saveBtnEl.$("*span")[0].text("Save");
            self.saveBtnEl.disabled = false;
        }, 5000);

        if (programData.id) {
            if (programData.author.id === userData.id) {
                // save existing program
                programDataToSend.id = programData.id;
                delete programDataToSend.type;
                fetch("/API/save_program", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(programDataToSend)
                }).then(res => res.text()).then(txt => {
                    if (txt.includes("error")) {
                        alert(txt);
                    } else {
                        self.saveBtnEl.$("*span")[0].text("Saved!");
                    }
                });
            } else {
                // forks
                programDataToSend.parent = programData.id;
                createNewProgram(programDataToSend);
            }
        } else {
            // create new program
            createNewProgram(programDataToSend);
        }
    }
}

// Monaco setup
require.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs" }
});

// Monaco init
require(["vs/editor/editor.main"], () => {
    console.log("Monaco Library Loaded");
    monacoReady = true;
});
