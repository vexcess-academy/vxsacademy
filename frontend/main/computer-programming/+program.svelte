<script>
    import { onMount } from "svelte";

    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function loadDependencies(dependencies) {
        return new Promise(async (resolve) => {
            for (let i = 0; i < dependencies.length; i++) {
                await loadScript(dependencies[i]);
            }
            resolve();
        });
    }

    const loadPreDeps = loadDependencies([
        "/CDN/lib/json-formatter.js",
        "/CDN/lib/terminal.js",
        "https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs/loader.js",
        "/CDN/validators.js",
        "/CDN/computer-programming/settings-dialog.js",
        "/CDN/computer-programming/editor.js",
        "https://cdn.jsdelivr.net/gh/vExcess/libraries@main/prism.js",
    ]);

    onMount(async () => {
        await loadPreDeps;
        loadDependencies([
            "/CDN/computer-programming/program-stuff.js",
            "/CDN/computer-programming/discussions.js",
            "/CDN/computer-programming/nuevoprogram.js",
        ]);
    });
</script>

<link rel="stylesheet" href="/CDN/computer-programming/program.css" type="text/css">
<link rel="stylesheet" href="/CDN/computer-programming/editor.css" type="text/css">

<h2 id="program-title">
    <span>New Program</span>
    <span id="edit-title-btn">Edit Title</span>
</h2>

<!-- Editor Container -->
<div id="editor-placeholder"></div>

<!-- Editor Settings Div -->
<div id="page-darken" style="display: none;"></div>
<div id="settings-placeholder"></div>

<br><br>

<div style="text-align: center; margin-bottom: 40px;">
    <button class="button" id="delete-program-button">
        Delete
        <img src="/CDN/images/icons/delete.svg" style="transform: translate(2px, 2px) scale(1.2);" alt="delete">
    </button>
    <button class="button" id="like-program-button">
        <span>Like</span>
        <img src="/CDN/images/icons/like.svg" style="transform: translate(3px, 2px) scale(1.25);" alt="like">
        <span> · 0</span>
    </button>
    <button class="button" id="report-program-button">
        Report
        <img src="/CDN/images/icons/report.svg" style="transform: translate(3px, 2px) scale(1.25);" alt="report">
    </button>
</div>

<div id="tab-bar">
    <span class="tab-tab">About</span>
    <span class="tab-tab">Forks</span>
    <span class="tab-tab">Documentation</span>
    <span class="tab-tab">Help</span>
</div>
<div id="tab-content">
    <!-- ABOUT TAB -->
    <div class="tab-page" id="about-tab">
        <!-- svelte-ignore a11y_missing_content -->
        <h3 id="forked-from"></h3>
        <h3 id="program-author">Created By:</h3>
        <span id="program-hidden"></span>
        <span id="program-created"></span>
        <span id="program-updated"></span>

        <br><br>
        
        <!-- Discussion List -->
        <div id="discussion-list">
            <div class="post">
                <div>
                    <span class="avatar-wrapper">
                        <img src="/CDN/images/avatars/bobert-cool.png" alt="User avatar" class="avatar">
                    </span>
                </div>
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <div class="dicussion-body" tabindex="0">
                    <textarea class="content discussion-input" placeholder="type a message"></textarea>
                    <div style="height: 0px;" class="discussion-stats">
                        <button class="button" id="comment-btn">Send As Comment</button>
                        <button class="button" id="question-btn">Send As Question</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- FORKS TAB -->
    <div class="tab-page" id="forks-tab">
        <h1 style="margin-top: 32px;">Forks</h1>
        <div style="margin-top: -40px; text-align: right;">
            <span class="list-tab-btn" id="top-btn">Top</span>
            <span class="list-tab-btn" id="recent-btn">Recent</span>
        </div>

        <div style="height: 2px; background-color: rgb(200, 200, 200); margin-bottom: 20px;  margin-top: 20px;"></div>
        
        <div id="forks-grid" class="programs-grid"><h3 style="text-align: center;">This program currently has no forks.</h3></div>

        <br><br>
        <button id="load-more-forks-btn" class="button" style="display: block; margin: auto;">Load More Projects</button>
        <br><br>
    </div>

    <!-- DOCS TAB -->
    <div class="tab-page" id="docs-tab">
        
    </div>

    <!-- HELP TAB -->
    <div class="tab-page" id="help-tab">
        <h2>What can I not do?</h2>
        <div>
            <a href="/tos">Terms of Service & Community Rules</a>
        </div>
        <br><br>

        <h2>What is this?</h2>
        <div>
            This is VExcess Academy's IDE (integrated development environment) for programming.
            <br>
            Go here to learn programming: <a href="/computer-programming">Computer Programming</a>
        </div>
        <br><br>

        <h2>Other Editor Stuff</h2>
        <div>
            Click the plus button to create a new file.
            <br>
            Click the "X" button to delete a file.
            <br>
            Double click on an editor tab to rename the file.
        </div>
        <br><br>
        
        <h2>Editor Shortcuts</h2>
        <div>There are plenty of shortcuts that the editor supports, but here are the most commonly used ones.</div>
        <table>
            <thead>
                <tr>
                    <th>Shortcut</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>CTRL + Z</td>
                    <td>undo</td>
                </tr>
                <tr>
                    <td>CTRL + Y</td>
                    <td>redo</td>
                </tr>
                <tr>
                    <td>CTRL + C</td>
                    <td>copy</td>
                </tr>
                <tr>
                    <td>CTRL + X</td>
                    <td>cut</td>
                </tr>
                <tr>
                    <td>CTRL + V</td>
                    <td>paste</td>
                </tr>
                <tr>
                    <td>CTRL + A</td>
                    <td>select all</td>
                </tr>
                <tr>
                    <td>CTRL + F</td>
                    <td>search</td>
                </tr>
                <tr>
                    <td>CTRL + H</td>
                    <td>search & replace</td>
                </tr>
                <tr>
                    <td>CTRL + S</td>
                    <td>save</td>
                </tr>
                <tr>
                    <td>CTRL + ENTER</td>
                    <td>run code</td>
                </tr>
                <tr>
                    <td>CTRL + /</td>
                    <td>toggle line comment</td>
                </tr>
                <tr>
                    <td>TAB</td>
                    <td>increase indent</td>
                </tr>
                <tr>
                    <td>SHIFT + TAB</td>
                    <td>decrease indent</td>
                </tr>
                <tr>
                    <td>SHIFT + LEFT</td>
                    <td>select left</td>
                </tr>
                <tr>
                    <td>SHIFT + RIGHT</td>
                    <td>select right</td>
                </tr>
                <tr>
                    <td>SHIFT + UP</td>
                    <td>select up</td>
                </tr>
                <tr>
                    <td>SHIFT + DOWN</td>
                    <td>select down</td>
                </tr>
                <tr>
                    <td>CTRL + ALT + UP</td>
                    <td>add multi-cursor above on Windows</td>
                </tr>
                <tr>
                    <td>CTRL + ALT + DOWN</td>
                    <td>add multi-cursor below on Windows</td>
                </tr>
                <tr>
                    <td>CTRL + SHIFT + UP</td>
                    <td>add multi-cursor above on Linux</td>
                </tr>
                <tr>
                    <td>CTRL + SHIFT + DOWN</td>
                    <td>add multi-cursor below on Linux</td>
                </tr>
                <tr>
                    <td>CTRL + K + 0</td>
                    <td>collapse all code blocks</td>
                </tr>
                <tr>
                    <td>CTRL + K + J</td>
                    <td>uncollapse all code blocks</td>
                </tr>
                <tr>
                    <td>ESC</td>
                    <td>collapse multi-cursors</td>
                </tr>
                <tr>
                    <td>ALT + UP</td>
                    <td>move line up</td>
                </tr>
                <tr>
                    <td>ALT + DOWN</td>
                    <td>move line down</td>
                </tr>
                
            </tbody>
        </table>
    </div>
</div>

<!-- 
<script src="/CDN/computer-programming/program-init.js"></script>
<script src="/CDN/computer-programming/program.js"></script>
 -->

<style>
    :global(#DONOTOPTMIZEAWAY) {
        margin: auto;
    }
</style>