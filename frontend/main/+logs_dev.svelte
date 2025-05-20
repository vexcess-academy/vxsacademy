<script>
    addEventListener("DOMContentLoaded", () => {
        Q$("#page-middle-container").$("*p").forEach(element => {
            element.html(element.html().replaceAll(";", ";<br>"));
            element.css({
                marginLeft: "40px"
            })
        });
    });
</script>


<h1>Dev Logs</h1>

<h2>7/1/22</h2>
<p>Project started</p>

<h2>3/30/23</h2>
<p>
    Created dev log;
    Patched multiple XSS vulnerabilities;
    Improved input validation for projects; 
    Patched vulnerability where naming a file "../../../" makes it get saved outside of its project directory;
    Added error reporting;
    Switched to using srcdoc instead of the deprecated document.write();
    Fixed project titles not being displayed properly;
</p>

<h2>3/31/23</h2>
<p>
    Patched multiple XSS vulnerabilities; 
    Fixed a bunch of CSS issues;
    Improved input validation for projects;
    Started adding project thumbnails;
</p>

<h2>4/1/23</h2>
<p>
    Fixed bug that broke the editor;
    Fixed some CSS issues;
    Added the ability to rename files by double-clicking the file's tab
    Added the ability to delete files;
    Fixed path bug in backend;
    Cleaned up both backend and front end code;
    Added pages and sorting to hotlist;
    Improve Barbequery library to make my life easier;
    Display loading icons while images are loading;
    Fixed code editor;
</p>

<h2>4/2/23</h2>
<p>
    Re-wrote the entire server backend to fix a login bug;
    Cleaned AES encryption code;
    Improved project GUI;
</p>

<h2>4/3/23</h2>
<p>
    Fixed variable scoping bug;
</p>

<h2>4/14/23</h2>
<p>
    Updated Barbequery library and then fixed the entire frontend after the update broke it;
    Improved like button;
    Removed Applesoft Basic;
    Improved sandbox security;
    Fixed code pre-processor bugs;
</p>

<h2>4/16/23</h2>
<p>
    Started cleaning sandbox code;
    Worked on fixing environment error detection and loop protection;
</p>

<h2>4/23/23</h2>
<p>
    Updated Barbequery library;
    Improved code using new Barbequery features;
</p>

<h2>4/27/23</h2>
<p>
    Thumbnails work now;
    Did a bunch of debugging on the JS code preprocessor;
</p>

<h2>5/2/23</h2>
<p>
    Fixed CDN headers;
</p>

<h2>5/6/23</h2>
<p>
    Added JITLang environment;
    Fixed programs display on profile page;
    Added JavaScript linting;
</p>

<h2>5/9/23</h2>
<p>
    Did some JITLang patches;
    Fixed vulnerability that allowed attacker to crash the server by passing invalid data to JSON.parse;
</p>

<h2>5/21/23</h2>
<p>
    Wrote a junky patch for the Python environment;
    Did maintenence updates to the other execution environments;
</p>

<h2>6/10/23</h2>
<p>
    Make home page not look ugly
</p>

<h2>6/13/23</h2>
<p>
    Fix vulnerability of using cryptographically insecure PRNG for generating tokens;
</p>

<h2>6/14/23</h2>
<p>
    Make auth tokens expire after 7 days or after the user signs out;
</p>

<h2>7/1/23</h2>
<p>
    Fixed the file system got messed up from moving from Linux to Windows and then back to Linux due to Windows thinking that character number 67 and character number 97 are the same character (stupid Windows).
</p>

<h2>7/12/23</h2>
<p>
    Made stuff more responsively designed;
    Added functionality for users to update their profile info;
</p>

<h2>7/13/23</h2>
<p>
    Users can now change their profile background;
</p>

<h2>7/14/23</h2>
<p>
    Fix signup bug;
</p>

<h2>7/31/23</h2>
<p>
    Added Terms of Service;
</p>

<h2>8/28/23</h2>
<p>
    Started adding dark mode;
</p>

<h2>8/30/23</h2>
<p>
    Worked more on dark mode;
    Adding number scrubbing;
    Fixed fonts being messed up on Firefox;
    Started implemented C++;
</p>

<h2>9/4/23</h2>
<p>
    Made new programs get saved to localStorage;
    Made code editor tabs draggable;
</p>

<h2>9/17/23</h2>
<p>
    Fix vulnerability where programs can sign users out of their accounts;
    Made background of PJS logo transparent;
    Project output dimensions must now be integers;
    Adding project forks;
</p>

<h2>9/18/23</h2>
<p>
    Fixed several minor bugs;
</p>

<h2>9/19/23</h2>
<p>
    Fixed PJS environment (mostly);
</p>

<h2>9/20/23</h2>
<p>
    Migrated main website from Replit hosting to self hosting;
</p>

<h2>9/30/23</h2>
<p>
    Shut down server and started migratation to MongoDB;
</p>

<h2>10/1/23</h2>
<p>
    Finished migrating data to MongoDB and server is back online;
    Migrated execution environment sandbox from Replit to self hosted;
</p>

<h2>10/6/23</h2>
<p>
    Fix XSS vulnerability;
</p>

<h2>10/7/23</h2>
<p>
    Fix bug where programs run twice on startup;
</p>

<h2>10/27/23</h2>
<p>
    Fix 404 not found thumbnail bug;
    Improve internal error handling;
</p>

<h2>11/1/23</h2>
<p>
    Fixed vulnerability (for real this time) where programs can make POST requests for the user from the sandbox;
</p>

<h2>11/6/23</h2>
<p>
    Start implementing discussion features
</p>

<h2>11/16/23</h2>
<p>
    Increase account per IP limit;
    Temporarily remove sign up with Google;
    Fix can't read properties of undefined bugs;
</p>

<h2>12/30/23</h2>
<p>
    Continue work on the discussion front end;
</p>

<h2>12/31/23</h2>
<p>
    Continue work on the discussion front end;
    Create discussions backend;
</p>

<h2>2/10/24</h2>
<p>
    Create fullscreen button for saved programs;
    Continue work on discussions;
    Update to latest Barbequery version;
</p>

<h2>2/24/24</h2>
<p>
    Fix code editor not loading properly.
</p>

<h2>3/2/24</h2>
<p>
    Improve notification dropdown menu;
</p>

<h2>3/3/24</h2>
<p>
    Start integrating KA hotlist and project support;
    Work on discussion features;
    Start program visit tracking;
</p>

<h2>3/4/24</h2>
<p>
    Create database backup/restore scripts;
    Start adding JavaScript w/ Processing.js lessons;
</p>

<h2>3/5/24</h2>
<p>
    Finish JavaScript w/ Processing.js lessons;
    Fix notification drop down menu;
    Improve course learning page;
    Make dev logs easier to read;
    Add ES6+ support to PJS editor;
    Fix editor settings CSS;
    Added debug console to editor;
</p>

<h2>3/6/24</h2>
<p>
    Fix notifications CSS when in light mode;
    Add browse projects to computer programming courses page;
    Fix console logging circular references;
    Add syntax highlighting to console;
    Improve editor CSS;
    Fix all course links going to the intro page;
    Fix link of Modifying Objects lesson;
    Update JS w/ PJS intro;
    Fix KA programs title being undefined;
</p>

<h2>4/1/24</h2>
<p>
    Fix can't read property of undefined error;
</p>

<h2>5/15/24</h2>
<p>
    Refactor monolithic backend code into managable sub modules;
</p>

<h2>5/16/24</h2>
<p>
    Updated KA proxy;
    Accidentally broke the editor while adding KA Python support;
    Started rewriting the editor from scratch because it was written poorly the first time;
    Editor v2.0's code will be easier to follow and will support tree file systems;
</p>

<h2>5/17/24</h2>
<p>
    Merge Kestron's changes;
    Continue rewriting editor from scratch;
</p>

<h2>6/14/24</h2>
<p>
    Work on fixing Python sandbox;
</p>

<h2>6/15/24</h2>
<p>
    Work on fixing Python sandbox;
</p>

<h2>6/17/24</h2>
<p>
    Work on fixing Python sandbox;
    Continue rewriting editor from scratch;
</p>

<h2>6/18/24</h2>
<p>
    Continue rewriting editor from scratch;
    Realize revising the editor to not be spaghetti code requires rewriting everything else :sob:;
</p>

<h2>8/18/24</h2>
<p>
    Temporarily remove Zig, C++, JITLang, and Java because they aren't functional;
    Add execute and save editor shortcuts;
    Implement confirm on leave in new editor;
    Implement autosave in new editor;
    Make new program not have CSP origin retrictions;
    Implement tab creation in new editor;
    Implement tab deletion ability in new editor;
    Add forks display to new editor page;
</p>

<h2>8/20/24</h2>
<p>
    Add number scrubber to new editor;
    Add discussion features to new editor page;
    Add localStorage ability to new editor;
    Fix KA proxy;
    Make PJS support `function draw()&#123&#125` instead of just `draw = function()&#123&#125`;
    Fix XSS vulnerability;
    Fix buggy CSS;
</p>

<h2>12/11/24</h2>
<p>
    Disable all API endpoints requiring authentication;
    Put website back online;
</p>

<h2>3/1/25</h2>
<p>
    Fix multiple XSS vulnerabilities;
    Put website back online again;
</p>

<h2>4/1/25</h2>
<p>
    Fix multiple XSS vulnerabilities;
    Put website back online again;
</p>

<h2>4/4/25</h2>
<p>
    Create config to run in podman;
</p>

<h2>4/6/25</h2>
<p>
    Fix podman;
</p>

<h2>4/11/25</h2>
<p>
    Start rewriting the entire backend in Dart;
</p>

<h2>4/12/25</h2>
<p>
    Continue rewriting the entire backend in Dart;
</p>

<h2>5/8/25</h2>
<p>
    Continue rewriting the entire backend in Dart;
</p>

<h2>5/9/25</h2>
<p>
    Fix bugs in Dart implementation;
    Replace production with the new Dart backend;
</p>

<h2>5/10/25</h2>
<p>
    Fix bugs in Dart implementation;
</p>

<h2>5/13/25</h2>
<p>
    Start rewriting the frontend in Svelte;
    Fix bugs in Dart implementation;
</p>

<h2>5/14/25</h2>
<p>
    Continue rewriting the frontend in Svelte;
    Fix more bugs in Dart implementation;
</p>

<h2>5/19/25</h2>
<p>
    Fix a couple bugs in the Dart implementation that were causing server crashes;
    Replace production with the new Svelte frontend;
</p>

<h2>TODO</h2>
<p>
    TODO: Implement sandbox unload detection;
    TODO: Add color picker to new editor;
    TODO: Fix profile displays;
    TODO: Finish Discussion features;
</p>

<style>
    :global(#page-middle-container) {
        margin: 20px;
    }
</style>