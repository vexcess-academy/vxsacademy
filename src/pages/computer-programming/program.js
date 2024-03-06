let main1Complete = false;
let isKAProgram = false;

// set program title
let programTitleEl = $("#program-title").$("*span")[0];
let editTitleBtn = $("#edit-title-btn");
function setProgramTitle (title) {
    programData.title = title;
    programTitleEl.text(title);
}

editTitleBtn.on("click", () => {
    if (!main1Complete) { return; }
    let title = window.prompt("Enter a new title:", "New Program");
    if (title.length === 0) title = "New Program";
    setProgramTitle(title);
});

// the editor settings
let editorSettings = {
    width: 400,
    height: 400,
    indentSize: 4,
    fontSize: 13,
    theme: "vs-dark",
    wrap: true
};

// editor tabs container
let editorTabsContainer = $("#editor-tabs-container");
// the editor container
let editorContainer = $("#editor-container");
// the editor div itself
let editorDiv = $("#editor");
// create output frame
let outputFrame = $("iframe");
// the settings button
let settingsButtonEl = $("#editor-settings-button");
// the run button
let runButtonEL = $("#editor-run-button");
// the save button
let saveButtonEL = $("#editor-save-button");
// the delete button
let deleteButtonEL = $("#delete-program-button");
// new file tab button
let newTabBtn = $("#editor-newtab-btn");
// the settings element
let settingsEl = $("#editor-settings");
// the darkening element
let pageDarkenEl = $("#page-darken");
// auto refresh slider
let autoRefreshEl = $(".switch")[0].$("*input")[0];

let autoRefresh = localStorage.getItem("auto_refresh_editor") === "true" ? true : false;
autoRefreshEl.checked = autoRefresh;
autoRefreshEl.on("change", () => {
    autoRefresh = autoRefreshEl.checked;
    localStorage.setItem("auto_refresh_editor", autoRefresh.toString());
});

// models and stuff
const models = {};
let fileNames = null;
let currFileName, currModel;
let editor = null;



// setup output frame sandbox
outputFrame.attr({
    sandbox: "allow-pointer-lock allow-same-origin allow-scripts allow-popups allow-modals allow-forms",
    width: editorSettings.width,
    height: editorSettings.height
}).css({
    backgroundColor: "white",
    borderTop: "none",
    borderRight: "none",
    borderLeft: "1px solid var(--borders3)",
    borderBottom: "none",
    marginLeft: "auto",
    order: "2"
});
editorContainer.$("*div")[1].replaceChild(outputFrame, $("#output-frame"));

// display loading icon
let outputFrameBox = outputFrame.getBoundingClientRect();
let loadIcon = loadIconManager.new(200);
loadIcon.css({
    position: "absolute",
    left: (outputFrameBox.left + outputFrameBox.right) / 2 - loadIcon.width / 2 + "px",
    top: (outputFrameBox.bottom + outputFrameBox.top) / 2 - loadIcon.height / 2 + window.scrollY + "px"
});
editorContainer.append(loadIcon);

let localStorageKey = null;

let expectingSave = false;
function saveProgram() {
    if (isKAProgram) {
        alert("KA programs cannot be saved or forked from vxsacademy");
        return;
    }

    programData.files[currFileName] = editor.getValue();

    if (!userData) {
        alert("You must be logged in to save a program");
        return;
    }

    var check = validateProgramData(programData);
    if (check !== "OK") {
        alert(check);
        return;
    }

    window.removeEventListener('beforeunload', confirmLeavePageFxn);
    confirmLeavePageFxn = null;

    if (programData.id) {
        saveButtonEL.$("*span")[0].text("Saving...");
        saveButtonEL.disabled = true;

        if (programData.author.id === userData.id) {
            // saves
            fetch("/API/save_program", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: programData.id,
                    title: programData.title,
                    width: editorSettings.width,
                    height: editorSettings.height,
                    files: programData.files,
                    thumbnail: programData.thumbnail
                })
            }).then(res => res.text()).then(function (res) {
                if (res.includes("error")) {
                    alert(res);
                } else {
                    saveButtonEL.$("*span")[0].text("Saved!");
                }
            });
        } else {
            // forks
            fetch("/API/create_program", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: programData.title,
                    type: programData.type,
                    width: editorSettings.width,
                    height: editorSettings.height,
                    files: programData.files,
                    thumbnail: programData.thumbnail,
                    parent: programData.id
                })
            }).then(res => res.text()).then(function (res) {
                if (res.includes("error")) {
                    alert(res);
                } else {
                    window.location.href = "/computer-programming/" + res;
                }
            });

            // when you save the program it gets removed from localStorage
            localStorage.removeItem(localStorageKey);
        }
        
        setTimeout(() => {
            saveButtonEL.$("*span")[0].text("Save");
            saveButtonEL.disabled = false;
        }, 5000);
    } else {
        fetch("/API/create_program", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: programData.title,
                type: programData.type,
                width: editorSettings.width,
                height: editorSettings.height,
                files: programData.files,
                thumbnail: programData.thumbnail
            })
        }).then(res => res.text()).then(function (res) {
            if (res.includes("error")) {
                alert(res);
            } else {
                localStorage.removeItem(localStorageKey);
                window.location.href = "/computer-programming/" + res;
            }
        });
    }
}

// the output window
let ifrWin = outputFrame.contentWindow || outputFrame.window;

let debugConsole = null;
let evalResult;

// listen for sandbox messages
window.addEventListener("message", event => {
    let data = event.data;

    if (typeof data === "object" && data.sender === "sandbox") {
        if (loadIcon !== null) {
            loadIconManager.delete(loadIcon);
            loadIcon = null;
        }

        switch (data.event) {
            case "thumbnail":
                programData.thumbnail = data.thumbnail;

                if (expectingSave) {
                    saveProgram();
                    expectingSave = false;
                }
            break;
            case "stderr":
                debugConsole.out(data.data, Terminal.STDERR);
            break;
            case "stdout":
                debugConsole.out(data.data, Terminal.STDOUT);
            break;
            case "evalResult":
                evalResult = data.data;
            break;
        }
    }
});

// run the program once the environment loads
let outputFrameLoaded = false;
outputFrame.on("load", () => {
    outputFrameLoaded = true;
    loadIconManager.delete(loadIcon);
    loadIcon = null;
});

function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function calcStrSz(str) {
    var sz = 0;
    for (var i = 0; i < str.length; i++) {
        sz += str.charCodeAt(i) > 255 ? 2 : 1;
    }
    return sz;
}

function validateFileName(name) {
    var illegal = "/\\:*?\"<>|\n";
    if (name.length === 0) { // empty names are not allowed
        return "can't be empty";
    } else if (calcStrSz(name.length) >= 256) { // names can't be longer than 256 bytes
        return "must be less than 256 bytes";
    }
    if (name[0] === " " || name[0] === ".") { // names can't start with a period or space
        return "can't start with a period or space";
    }
    for (var i = 0; i < illegal.length; i++) {
        if (name.includes(illegal[i])) { // names can't contain illegal characters
            return "can't contain /\\:*?\"<>|";
        }
    }
    return "OK";
}

function validateProgramData(data) {
    let e = "error: ";
    if (
        typeof data.files === "object" &&
        typeof data.width === "number" &&
        typeof data.height === "number" &&
        typeof data.title === "string"
    ) {
        // check if program is a valid type
        if (!["html", "pjs", "python", "glsl", "jitlang", "cpp", "java"].includes(data.type)) {
            return e + "invalid project type";
        }

        // validate forks
        if (data.parent && data.parent !== null && typeof data.parent !== "string") {
            return e + "invalid parent";
        }
        
        // limit size
        if (data.width % 1 !== 0 || data.height % 1 !== 0) {
            return e + "project dimensions must be integers";
        }
        if (data.width < 400 || data.height < 400) {
            return e + "project dimensions can't be less than 400";
        }
        if (data.width > 16384 || data.height > 16384) {
            return e + "project dimensions can't be larger than 16384";
        }

        if (data.thumbnail === undefined) {
            // do nothing
        } else if (typeof data.thumbnail === "string") {
            // validate thumbnail type
            if (!(
                data.thumbnail.startsWith("data:image/jpg;base64,") ||
                data.thumbnail.startsWith("data:image/jpeg;base64,") ||
                data.thumbnail.startsWith("data:image/jfif;base64,")
            )) {
                return e + "project thumbnail must be a jpg/jpeg/jfif";
            }
            // validate thumbnail size to 128 KB
            if (data.thumbnail.length > 128 * 1024) {
                return e + "project thumbnail is too big; 128 KB allowed";
            }
        } else {
            return e + "project thumbnail is corrupted";
        }

        // validate title
        var checkTitle = validateFileName(data.title);
        if (checkTitle !== "OK") {
            return e + "project title " + checkTitle;
        }

        // 8 files allowed
        if (Object.keys(data.files).length > 8) {
            return e + "project has too many files; 8 allowed";
        }

        let projectSize = 0;
        for (var filename in data.files) {
            // validate file name
            var checkName = validateFileName(data.title);
            if (checkName !== "OK") {
                return e + "file name " + checkName;
            }

            // check if file data is valid
            var file = data.files[filename];
            if (typeof file !== "string") {
                return e + "project file data is corrupted";
            }

            // programs can't be bigger than 0.5 MB
            projectSize += calcStrSz(file.length);
            if (projectSize > 1024 * 512) {
                return e + "project is too big; 0.5 MB allowed";
            }
        }

        return "OK";
    } else {
        return e + "project metadata is corrupted";
    }
}

function getFile(name)  {
    return programData.files[name];
}
function setFile(name, data)  {
    return programData.files[name] = data;
}

let confirmLeavePageFxn = null;
function confirmLeavePage () {
    if (confirmLeavePageFxn === null) {
        confirmLeavePageFxn = e => {
            e.preventDefault();
            e.returnValue = '';
        };
        
        window.addEventListener('beforeunload', confirmLeavePageFxn);
    }
}

function runProgram() {
    ifrWin.postMessage("ping", "*");

    debugConsole.clear();
    
    var mainCode;
    switch (programData.type) {
        case "html":
            mainCode = getFile("index.html");
        break;
        case "pjs":
            mainCode = getFile("index.js");
        break;
        case "java":
            mainCode = getFile("Main.java");
        break;
        case "glsl":
            mainCode = getFile("image.glsl");
        break;
        case "c":
            mainCode = getFile("main.c");
        break;
        case "cpp":
            mainCode = getFile("main.cpp");
        break;
        case "python":
            mainCode = getFile("main.py");
        break;
        case "jitlang":
            mainCode = getFile("main.jitl");
        break;
    }

    if (mainCode === undefined) return;
    
    if (mainCode.includes("<title>") && mainCode.includes("<\/title>")) {
        setProgramTitle(mainCode.split("<title>")[1].split("<\/title>")[0]);
    }
    
    ifrWin.postMessage({
        width: editorSettings.width,
        height: editorSettings.height,
        files: programData.files
    }, "*");
}

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





let forksGrid = $("#forks-grid");
let forksCache = new Map();
let forksList = [];
let forksSort = "top";
let forksPage = 0;
let recentBtn = $("#recent-btn"),
    topBtn = $("#top-btn");

function displayForks(programs) {
    if (programs.length > 0) {
        console.log("LOADING", programs)
        forksGrid.innerHTML = "";
    }
    
    forksList.forEach(program => $("program-element", program).appendTo(forksGrid));
}

async function loadForks(page) {
    for (let i = page * 16; i < page * 16 + 16; i++) {
        if (i < programData.forks.length) {
            let id = programData.forks[i].id;
            if (forksCache.has(id)) {
                forksList.push(forksCache.get(id));
            } else {
                let program = await $.getJSON(`/CDN/programs/${id}.json`);
                if (program !== null) {
                    forksCache.set(id, program);
                    forksList.push(program);
                }
            }
        }
    }
    displayForks(forksList);
}

function changeForksSort(newSort) {
    // clear display
    if (forksList.length > 0) {
        forksGrid.innerHTML = "";
    }

    // reset variables
    forksList = [];
    forksPage = 0;
    forksSort = newSort;

    // sort forks
    switch (forksSort) {
        case "top": {
            recentBtn.css("text-decoration: none");
            topBtn.css("text-decoration: underline");
            programData.forks = programData.forks.sort((a, b) => b.likeCount - a.likeCount);
            break;
        }
        case "recent": {
            recentBtn.css("text-decoration: underline");
            topBtn.css("text-decoration: none");
            programData.forks = programData.forks.sort((a, b) => b.created - a.created);
            break;
        }
    }
    
    loadForks(forksPage++);
}

$("#load-more-forks-btn").on("click", () => {
    if (!main1Complete) { return; }
    loadForks(forksPage++);
});

recentBtn.on("click", e => {
    if (!main1Complete) { return; }
    if (forksSort !== "recent") {
        changeForksSort("recent");   
    }
});

topBtn.on("click", e => {
    if (!main1Complete) { return; }
    if (forksSort !== "top") {
        changeForksSort("top");   
    }
});

// to make the page responsive
function resizePage () {
    outputFrame.width = editorSettings.width;
    outputFrame.height = editorSettings.height;

    editorDiv.style.width = (window.innerWidth - (editorSettings.width + 41)) + "px";
    editorDiv.style.height = editorSettings.height + "px";
    const debugConsoleHeight = 150;
    editorContainer.style.height = editorSettings.height + 72 + debugConsoleHeight + "px";

    if (loadIcon) {
        outputFrameBox = outputFrame.getBoundingClientRect();
        loadIcon.css({
            left: (outputFrameBox.left + outputFrameBox.right) / 2 - loadIcon.width / 2 + "px",
            top: (outputFrameBox.bottom + outputFrameBox.top) / 2 - loadIcon.height / 2 + window.scrollY + "px"
        });
    }
}

// resize if the window size is changed
window.addEventListener('resize', resizePage, true);

function main() {
    if (programData.id) {
        isKAProgram = programData.id.startsWith("KA_") && programData.id.length !== 14;
    }

    const useRepl = ["html", "pjs", "python"].includes(programData.type);
    debugConsole = new Terminal($("#debug-console").el, useRepl);
    debugConsole.styles.background = "var(--themeColor)";
    debugConsole.useDarkStyles();
    debugConsole.eval = async function(code) {
        evalResult = undefined;

        return new Promise(resolve => {
            ifrWin.postMessage({
                event: "eval",
                data: code
            }, "*");

            function check() {
                if (evalResult !== undefined) {
                    resolve(evalResult);
                } else {
                    setTimeout(check, 4);
                }
            }
            check();
        });
    };

    setProgramTitle(programData.title);
    editorSettings.width = programData.width;
    editorSettings.height = programData.height;
    fileNames = programData.fileNames;
    localStorageKey = "cs-new-program-" + (userData === null ? "null" : userData.id) + "-" + programData.type;

    if (programData.id) {
        if (!userData) {
            saveButtonEL.css("display: none");
        }
        if (userData && programData.author.id !== userData.id) {
            saveButtonEL.$("*span")[0].innerText = "Fork";
        }
    
        if (typeof programData.parent === "string" && programData.parent.length > 0) {
            let parentLinkEl = $("#forked-from")
                .html("Forked From: ");
            $.getJSON(`/CDN/programs/${programData.parent}.json`)
                .then(res => {
                    parentLinkEl.append(
                        $("a")
                            .css({
                                textDecoration: "none",
                                color: "rgb(0, 140, 60)"
                            })
                            .text(res.title)
                            .attr({
                                href: "/computer-programming/" + res.id
                            })
                    );
                })
                .catch(() => {
                    parentLinkEl.textContent += "Deleted Program";
                })
        }
    
        let programAuthorEl = $("#program-author")
            .html("Created By: ")
            .append(
                $("a")
                    .css({
                        textDecoration: "none",
                        color: "rgb(0, 140, 60)"
                    })
                    .text(programData.author.nickname)
                    .attr({
                        target: "_blank",
                        href: (isKAProgram ? "https://www.khanacademy.org/profile/" : "/profile/id_") + programData.author.id
                    })
            );
        programAuthorEl.innerHTML += " (Updated " + timeSince(programData.lastSaved - 30 * 1000) + " ago)";
    
        $("#program-hidden").text("Hidden: No");
        $("#program-created").text("Created: " + new Date(programData.created).toLocaleString('en-US', { timeZone: 'UTC' }));
        $("#program-updated").text("Updated: " + new Date(programData.lastSaved).toLocaleString('en-US', { timeZone: 'UTC' }));
    }
    
    if (programData.author) {
        if (!userData || (programData.author.id !== userData.id)) {
            $("#delete-program-button").remove();
            editTitleBtn.remove();
        }
    
        // like button stuff
        let likeProgramBtn = $("#like-program-button");
        
        // set like button content
        likeProgramBtn.$("*span")[0].text(userData && programData.hasLiked ? "Liked!" : "Like");
        likeProgramBtn.$("*span")[1].text(" · " + programData.likeCount);
        
        // handle like button click
        likeProgramBtn.on("click", () => {
            if (isKAProgram) {
                alert("KA programs cannot be liked from vxsacademy");
                return;
            }

            if (!userData) {
                alert("You must be logged in to like a program");
                return;
            }
    
            if (programData.hasLiked) {
                likeProgramBtn.$("*span")[0].text("Unliking...");
            } else {
                likeProgramBtn.$("*span")[0].text("Liking...");
            }
            likeProgramBtn.disabled = true;
            
            fetch("/API/like_program", {
                method: "POST",
                body: window.location.href.split("/")[4]
            }).then(res => res.text()).then(function (res) {
                if (res.includes("error")) {
                    alert(res);
                } else if (res === "200") {
                    if (programData.hasLiked) {
                        programData.likeCount--; // unlike the program
                        programData.hasLiked = false;
                    } else {
                        programData.likeCount++; // like the program
                        programData.hasLiked = true;
                    }
                    
                    // set like button content
                    likeProgramBtn.$("*span")[0].text(userData && programData.hasLiked ? "Liked!" : "Like");
                    likeProgramBtn.$("*span")[1].text(" · " + programData.likeCount);
                }
            });
    
            setTimeout(() => {
                likeProgramBtn.disabled = false;
            }, 5000);
        });
    
        // handle delete button click
        deleteButtonEL.on("click", () => {
            if (confirm("Are you sure you want to delete this project? This cannot be undone!") === true) {
                fetch("/API/delete_program", {
                    method: "POST",
                    body: window.location.href.split("/")[4]
                }).then(res => res.text()).then(function (res) {
                    if (res.includes("error")) {
                        alert(res);
                    } else {
                        window.location.href = "/computer-programming/";
                    }
                });
            }
        });
    } else {
        $("#like-program-button").remove();
        $("#delete-program-button").remove();
        $("#report-program-button").remove();
    }

    // size the webpage
    resizePage();

    main1Complete = true;
}

function main2() {
    function createModel (fileName) {
        let type = fileName.split(".").reverse()[0];
        
        switch (type) {
            case "js":
                type = "javascript";
            break;
            case "py":
                type = "python";
            break;
            case "txt":
                type = "plain";
            break;
            case "c":
                type = "c";
            break;
            case "glsl":
                type = "c";
            break;
            case "cpp":
                type = "cpp";
            case "jitl":
                type = "go";
            break;
        }

        let code = programData.files[fileName];

        // unescape code
        if (!code.includes("\n")) {
            if (code.indexOf('"') > code.indexOf("'")) {
                code = Function("return '" + code + "'")();
            } else {
                code = Function('return "' + code + '"')();
            }
        }
        
        let model = monaco.editor.createModel(code, type);

        model.updateOptions({
            tabSize: "4",
            fontSize: editorSettings.fontSize + "px",
            wrap : editorSettings.wrap,
            language: type
        });

        model.name = fileName;
        models[fileName] = model;

        model.onDidChangeContent(event => {
            programData.files[model.name] = model.getValue();
        });
    }

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

    // so people don't accidentaly exit and lose all their code
    editorDiv.on("keyup", confirmLeavePage);

    // the editor
    editor = monaco.editor.create(editorDiv.el, {
        automaticLayout: true
    });

    function updateCurrModel () {
        currModel = models[currFileName];
        editor.setModel(currModel);
    }

    // customize editor
    monaco.editor.setTheme("vs-dark");

    // keep track of mouse presses for scrubber
    let mouseX = 0;
    let mouseY = 0;
    let mouseIsPressed = false;
    $(document.body)
        .on("mousemove", e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        })
        .on("mousedown", () => {
            mouseIsPressed = true;
        })
        .on("mouseup", () => {
            mouseIsPressed = false;
        });
    
    // self explanatory
    let currentScrubber = null;

    // Number Scrubber class
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
        
        constructor(x, y, rStart, cStart, rEnd, cEnd, textContent) {
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
                top: this.y + "px"
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
            return editor.getModel().getValueInRange(range);
        }

        update(amt) {
            let strBefore = this.value.toFixed(this.decimalPlaces);
            this.value += amt;
            let strAfter = this.value.toFixed(this.decimalPlaces);
            
            editor.executeEdits('number-scrubber', [
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

    // handle clicks to open number scrubber
    editorDiv.on("click", e => {
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
                        pos.x + (startPadding * charW) + (pos.width - startPadding * charW - endPadding * charW) / 2, 
                        pos.y, row, columnStart - (isNegative ? 1 : 0), row, columnEnd, (isNegative ? "-" : "") + tokenContent.trim()
                    );
                }
            }
        }
    });

    // remove number scrubber if you scroll too far
    editor.onDidScrollChange(e => {
        let yChange = e._oldScrollTop - e.scrollTop;
        if (currentScrubber) {
            currentScrubber.y += yChange;
            currentScrubber.element.css({
                top: currentScrubber.y + "px"
            });

            let editorArea = editorDiv.getBoundingClientRect();
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
    editor.onMouseDown(checkDestroyScrubber);
    editor.onKeyDown(checkDestroyScrubber);
    $(document.body).on("mousedown", e => {
        if (currentScrubber !== null && !currentScrubber.element.contains(e.target) && !editorDiv.el.contains(e.target)) {
            checkDestroyScrubber();
        }
    });

    // help make tabs draggable
    let dragTabPlaceholder = $("div").text("|").css(`
        background-color: gray;
        width: 2px;
        margin-left: 2px;
        display: inline-block;
        margin-right: 4px;
        color: transparent;
        padding-left: 1px;
        padding-right: 1px;
        padding-top: 4px;
        padding-bottom: 3px;
    `);
    editorTabsContainer.on("dragenter", e => e.preventDefault());
    editorTabsContainer.on("dragover", e => {
        e.preventDefault();
        
        let siblings = editorTabsContainer.$(".editor-tab")
            .filter(t => !t.classList.contains("dragging"))
            .sort((a, b) => a.offsetLeft - b.offsetLeft);

        let index = 0;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i].offsetLeft + siblings[i].offsetWidth / 2 < e.clientX) {
                index++;
            }
        }

        if (index < siblings.length) {
            editorTabsContainer.insertBefore(dragTabPlaceholder, siblings[index].el);
        } else {
            editorTabsContainer.insertBefore(dragTabPlaceholder, siblings[siblings.length - 1].el.nextSibling);
        }    
    });
    editorTabsContainer.on("dragend", e => {
        e.preventDefault();
        editorTabsContainer.replaceChild(e.target, dragTabPlaceholder);
    });

    // editor tab component
    let editorTabEls = [];
    const FileTab = $.createComponent("FileTab", $.html`
        <div class="editor-tab" draggable="true">
            <input class="editor-tab-input" type="text" value="\{filename}" data-filename="\{filename}" readonly="true" style="width: \{filename.length}ch">
            <span class="editor-tab-close">${String.fromCharCode(10006)}</span>
        </div>
    `, function() {
        let tabEl = this;

        tabEl.on("dragstart", () => {
            tabEl.classList.add("dragging");
        });

        tabEl.on("dragend", () => {
            tabEl.classList.remove("dragging");
        });

        // handle the tab being clicked
        tabEl.on("click", function() {
            let that = $(this);
            
            // save file
            programData.files[currFileName] = currModel.getValue();

            // change file
            currFileName = that.$(".editor-tab-input")[0].value;
            updateCurrModel();

            for (var i = 0; i < editorTabEls.length; i++) {
                editorTabEls[i].css("background-color: var(--fadedThemeColor)");
            }
            that.css("background-color: var(--themeColor)");
        });

        // the file name element
        tabEl.$(".editor-tab-input")[0]
            .on("input", function(e) {
                let that = $(this);
                
                let check = validateFileName(that.value);
                if (check !== "OK") {
                    e.preventDefault();
                    that.value = that.dataset.filename;
                    alert("file name " + check);
                } else {
                    let formerName = that.dataset.filename;
                    let newName = that.value;
                    
                    that.dataset.filename = newName;
    
                    // change file name/create new one if doesn't exist
                    var fileNameIdx = programData.fileNames.indexOf(formerName);
                    if (fileNameIdx === -1) fileNameIdx = programData.fileNames.length;
                    programData.fileNames[fileNameIdx] = newName;
                    
                    if (currFileName === formerName) currFileName = newName;
                    
                    programData.files[newName] = programData.files[formerName];
                    delete programData.files[formerName];
    
                    models[formerName].name = newName;
                    models[newName] = models[formerName];
                    delete models[formerName];
                }
                
                that.style.width = that.value.length + "ch";
            })
            .on("keyup", function(e) {
                if (e.key === "Enter") {
                    $(this).blur();
                }
            })
            .on("dblclick", function(e) {
                let that = $(this);
                if (that.readOnly === true) {
                    that.readOnly = false;
                    that.css("outline: 1px solid rgb(100, 100, 100)");
                }
            })
            .on("blur", function(e) {
                let that = $(this);
                that.readOnly = true;
                that.css("outline: none");
            });

        // the close button
        tabEl.$(".editor-tab-close")[0].on("click", function(e) {
            if (confirm("Are you sure you want to delete this file? This cannot be undone!") === true) {
                let fileName = tabEl.$(".editor-tab-input")[0].dataset.filename;
                
                let tabIdx = editorTabEls.indexOf(tabEl);
                editorTabEls.splice(tabIdx, 1);
                tabEl.remove();
    
                if (currFileName === fileName) {
                    var gotoIdx = tabIdx - 1 < 0 ? 0 : tabIdx - 1;
                    if (editorTabEls[gotoIdx]) {
                        editorTabEls[gotoIdx].click();
                    }
                }
    
                var fileNameIdx = programData.fileNames.indexOf(fileName);
                programData.fileNames.splice(fileNameIdx, 1);
                
                delete programData.files[fileName];
                delete models[fileName];
            }
    
            e.stopPropagation();
        });
    });
    
    
    function createFileTab(filename) {
        let tabEl = FileTab({ filename });

        // insert tab into editor
        newTabBtn.parentEl.insertBefore(tabEl, newTabBtn);
        editorTabEls.push(tabEl);

        if (isOverflown(editorTabsContainer)) {
            editorTabsContainer.css("margin-bottom: 0px");
        }

        return tabEl;
    }

    function startEditor() {
        // create models
        for (let fileName in programData.files) {
            createModel(fileName);
        }

        // create file tabs
        fileNames.sort();
        currFileName = fileNames[0];
        updateCurrModel();
        for (var f = 0; f < fileNames.length; f++) {
            let filename = fileNames[f];
            let file = getFile(filename);
            createFileTab(filename, file);
        }
        editorTabEls[0].css("background-color: var(--themeColor)");

        // set model value
        currModel.setValue(getFile(currFileName));

        updateCurrModel();

        // run code live
        editor.onDidChangeModelContent(() => {
            if (autoRefresh) {
                if (!["java", "cpp"].includes(programData.type)) {
                    runProgram();
                }
            }
        });

        // run shortcut
        editor.addAction({
            id: "run-shortcut",
            label: "Run Shortcut",
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: runProgram
        });

        // save shortcut
        editor.addAction({
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
                saveButtonEL.click();
            }
        });
    }

    // load program if it's not a new program
    if (programData.id) {
        $.getJSON(`/CDN/programs/${programData.id}.json`).then(json => {
            programData.files = json.files;

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
            
            outputFrame
                .attr("src", sandboxURL + "/exec-" + programData.type + ".html?" + domains.map(btoa).join("&"))
                .on("load", () => {
                    startEditor();
                    runProgram();
                    outputFrameLoaded = true;
                });
        });
    
    } else {
        // temporarily hide fullscreen button
        $("#fullscreen-program-button").css({ display: "none" });
        
        // get previous code and write it to the ace editor
        let programObject = null;
        try {
            let programFromStorage = JSON.parse(localStorage.getItem(localStorageKey) ?? "");
            programData.width = programFromStorage.width;
            programData.height = programFromStorage.height;
            for (let i = 0; i < programFromStorage.fileNames.length; i++) {
                let fileName = programFromStorage.fileNames[i];
                let content = programFromStorage.files[fileName];
                
                if (!programData.fileNames.includes(fileName)) {
                    programData.fileNames.push(fileName);
                    programData.files[fileName] = content;
                } else if (content && content.length > 0) {
                    programData.files[fileName] = content;
                }
            }
        } catch (e) {
            console.error("Failed to load scratchpad from local storage");
        }

        function saveToLocalStorage () {
            // save user code to local storage
            localStorage.setItem(localStorageKey, JSON.stringify({
                width: editorSettings.width,
                height: editorSettings.height,
                files: programData.files,
                fileNames: programData.fileNames
            }));
        }

        // save code when the user exits the page
        window.addEventListener("beforeunload", saveToLocalStorage);

        // save code every minute (if browser fails to save the code when the page is unloaded, this will ensure that all is not lost)
        setInterval(saveToLocalStorage, 1000 * 60);
        
        outputFrame
            .attr("src", sandboxURL + "/exec-" + programData.type + ".html?allowAll=true")
            .on("load", () => {
                startEditor();
                runProgram();
                outputFrameLoaded = true;
            });
    }

    // settings stuff
    {
        // store the settings elements
        let settingsELs = {
            width: $("#canvasWidth"),
            height: $("#canvasHeight"),
            indentSize: $("#indentSize"),
            theme: $("#editorTheme"),
            fontSize: $("#fontSize"),
        };
        
        // initialize the settings values
        settingsELs.width.value = editorSettings.width;
        settingsELs.height.value = editorSettings.height;
        settingsELs.indentSize.value = editorSettings.indentSize;
        settingsELs.theme.value = editorSettings.theme;
        settingsELs.fontSize.value = editorSettings.fontSize;
        
        let settingsButtons = settingsEl.$(".button");
        
        // cancel button
        settingsButtons[0].on("click", () => {
            pageDarkenEl.style.display = "none";
            settingsEl.style.display = "none";
        
            settingsELs.width.value = editorSettings.width;
            settingsELs.height.value = editorSettings.height;
            settingsELs.indentSize.value = editorSettings.indentSize;
            settingsELs.theme.value = editorSettings.theme;
            settingsELs.fontSize.value = editorSettings.fontSize;
        });
        
        // save and close button
        settingsButtons[1].on("click", () => {
            pageDarkenEl.style.display = "none";
            settingsEl.style.display = "none";

            // coerce canvas dimensions to be integers
            settingsELs.width.value = settingsELs.width.value | 0;
            settingsELs.height.value = settingsELs.height.value | 0;
        
            editorSettings.width = parseInt(settingsELs.width.value, 10);
            editorSettings.height = parseInt(settingsELs.height.value, 10);
            editorSettings.indentSize = parseInt(settingsELs.indentSize.value, 10);
            editorSettings.theme = settingsELs.theme.value;
            editorSettings.fontSize = parseInt(settingsELs.fontSize.value, 10);
        
            editor.getModel().updateOptions({
                tabSize: editorSettings.indentSize,
                fontSize: editorSettings.fontSize + "px",
            });
        
            monaco.editor.setTheme(editorSettings.theme);
            if (editorSettings.theme === "vs") {
                document.querySelector(':root').style.setProperty('--themeColor', 'rgb(230, 230, 230)');
                document.querySelector(':root').style.setProperty('--hoverThemeColor', 'rgb(220, 220, 220)');
                document.querySelector(':root').style.setProperty('--themeTextColor', 'rgb(0, 0, 0)');
            } else if (editorSettings.theme === "vs-dark") {
                document.querySelector(':root').style.setProperty('--themeColor', 'rgb(30, 30, 30)');
                document.querySelector(':root').style.setProperty('--hoverThemeColor', 'rgb(50, 50, 50)');
                document.querySelector(':root').style.setProperty('--themeTextColor', 'rgb(248, 248, 242)');
            }
        
            resizePage();
        
            runProgram();
        });
    }

    // handle editor button clicks
    settingsButtonEl.on("click", () => {
        pageDarkenEl.style.display = "block";
        settingsEl.style.display = "block";
    });
    
    runButtonEL.on("click", () => {
        runProgram();
    });
    
    saveButtonEL.on("click", () => {
        if (programData.author && userData && programData.author.id !== userData.id && userData.isAdmin) {
            let should = prompt("Type 'yes' to save as admin");
            if (should !== "yes") {
                return;
            }
        }
        ifrWin.postMessage("thumbnail", "*");
        expectingSave = true;
    });

    newTabBtn.on("click", () => {
        let fileName;
        let i = 0;
        while (programData.files["new (" + i + ").txt"]) {
            i++;
        }
        fileName = "new (" + i + ").txt";
        setFile(fileName, "");
        let tab = createFileTab(fileName);
        createModel(fileName);
        let nameEl = tab.$("*input")[0];
        nameEl.readOnly = false;
        nameEl.css("outline: 1px solid rgb(100, 100, 100)");
        nameEl.focus();
        nameEl.select();
    });
}

// about/forks/docs/help tabs
let selectedTab = 0;
let tabs = $(".tab-tab");
let tabPages = $("#tab-content").$(".tab-page");

tabs[selectedTab].style.borderBottom = "5px solid rgb(31, 171, 84)";
tabPages[selectedTab].style.display = "block";

for (let i = 0; i < tabs.length; i++) {
    tabs[i].on("mouseenter", () => {
        if (i !== selectedTab) {
            tabs[i].style.borderBottom = "5px solid rgb(230, 230, 230)";
        }
    });
    tabs[i].on("mouseleave", () => {
        if (i !== selectedTab) {
            tabs[i].style.borderBottom = "5px solid transparent";
        }
    });
    tabs[i].on("click", () => {
        selectedTab = i;
        for (let j = 0; j < tabs.length; j++) {
            tabs[j].style.borderBottom = "5px solid transparent";
            tabPages[j].style.display = "none";
        }
        tabs[i].style.borderBottom = "5px solid rgb(31, 171, 84)";
        tabPages[i].style.display = "block";

        switch (i) {
            case 1: {
                changeForksSort(forksSort);
            }
        }
    });
}

// Monaco setup
require.config({
   paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor/min/vs" }
});

onProgramInfoReady(main);

// Monaco init
require(["vs/editor/editor.main"], () => {
    console.log("Monaco Editor Loaded");
    function waitTillReady() {
        if (main1Complete) {
            main2();
        } else {
            setTimeout(waitTillReady, 100);
        }
    }
    waitTillReady();
});
