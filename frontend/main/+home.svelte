<script>
    const languageButtons = [
        // endpoint, image, label
        ["webpage", "html", "Webpage"],
        ["pjs", "pjs", "Processing JS"],
        ["python", "python", "Python"],
        ["glsl", "glsl", "GLSL"],
        // ["zig", "zig", "Zig"],
        // ["jitlang", "jitlang", "JITLang"],
        // ["cpp", "cpp", "C++"],
        // ["java", "java", "Java"],
    ];

    const comparisonChart = [
        // thing, vxs, ka
        ["ES6+ JavaScript", "yes", "no"],
        ["IntelliSense", "yes", "no"],
        ["number of language environments", "8", "4"],
        ["allowed files per program", "8", "1"],
        ["max program size", "0.5 MB", "0.73 MB"],
        ["max thumbnail size", "128 KB", "Infinity"],
        ["subscriber system", "no", "no"],
        ["public API", "yes", "no"],
        ["profile backgrounds", "yes", "no"],
        ["uses 3rd party analytics", "no", "yes"],
        ["PJS image masking works", "yes", "no"],
        ["has the 100x100 canvas bug", "no", "yes"],
        ["locations", "no", "no"],
        ["streaks", "no", "no"],
        ["project evaluations", "no", "no"],
        ["notification counter", "yes", "no"],
        ["subject progress bar", "no", "no"],
        ["cool loading icon", "yes", "no"],
        ["thumbnail embeds", "partial", "no"],
        ["program search", "no", "no"],
        ["unlike and dislike feature", "no", "no"],
        ["can view program flags", "no", "no"],
    ];

    const contributors = [
        // name, profile, about
        ["VExcess",       "https://github.com/vExcess", "Founder; I wrote almost all of the code (~12,500 lines)"],
        ["Shipment",      "https://github.com/shipment22", "Wrote a lot of the CSS and created the Bobert avatar"],
        ["WKoA",          "https://github.com/Reginald-Gillespie", "Did pentesting and discovered bugs"],
        ["Dat",           "https://github.com/Dddatt/webgl-tutorial", "Wrote the WebGL tutorial"],
        ["CobraCoder",    "https://github.com/yu0bab/vxsacademy-course-s-", "Wrote the JS w/ Processing.js tutorial"],
        ["Archbirdplus",  "https://www.khanacademy.org/profile/kaid_142152517100107888031317", "Did pentesting and discovered bugs"],
        ["sikn",          "https://github.com/L1quidH2O", "Added ES6 support to PJS editor"],
        ["WalkWorthy",    "https://github.com/RandomLegoBrick", "Helped with the Java environment"],
        ["CylenceScythe", "https://khanacademy.org/profile/SharleyBoo", "Created Pyro avatar graphics"],
        ["Leslie",        "https://khanacademy.org/profile/ForeverFrostine", "Created Floof avatar graphics"],
        ["Elias Murcray", "https://github.com/eliasmurcray", "Debugging"],
    ];

    const envStatuses = [
        ["Webpage", "mostly functional; code preprocessor needs debugging"],
        ["Processing JS", "functional; ES6 support is extremely minimal"],
        ["Python", "functional; little to no support for importing libraries or multiple files"],
        ["GLSL", "functional;"],
        // <tr>
        //     <td>JITLang</td>
        //     <td>temporarily broken;</td>
        // </tr>
        // <tr>
        //     <td>C++</td>
        //     <td>unimplemented</td>
        // </tr>
        // <tr>
        //     <td>Java</td>
        //     <td>temporarily broken due to updating from Java 13 to Java 20;</td>
        // </tr>
    ];

    addEventListener("DOMContentLoaded", () => {
        Q$(".collapsible").forEach(el => {
            el.on("click", function() {
                this.classList.toggle("active");
                let content = this.nextElementSibling;
                if (content.style.maxHeight){
                    content.style.maxHeight = null;
                    content.style.padding = "0px";
                } else {
                    content.style.maxHeight = (content.scrollHeight + 18) + "px";
                    content.style.padding = "18px";
                } 
            });
        });
    });
</script>

<link rel="stylesheet" href="/CDN/pages/home/home.css" type="text/css">

<h2>Important</h2>
<div>Due to the recent data leak all API endpoints requiring authentication have been disabled until I get around to implementing a password reset and can re-encrypt all account data. Essentially the site is read only at the time. In addition, I rewrote the code editor from the ground up. Unfortunately, the new editor still needs a lot of debugging. Please let me know what bugs you encounter with it. I am aware that tab creation/deletion/reordering is buggy.</div>

<h2>Start a new project or <a href="/computer-programming/browse">Browse Projects</a> or <a href="/computer-programming/ka-browse">Browse KA Projects</a></h2>
<div id="program-showcase">
    {#each languageButtons as buttonInfo}
        <a class="program-display-box" href='/computer-programming/new/{buttonInfo[0]}'>
            <img class="lang-logo" src="/CDN/images/language-icons/{buttonInfo[1]}.png" height="100px" alt="{buttonInfo[1]}">
            <br>
            {buttonInfo[2]}
        </a>
    {/each}
</div>
<br><br>
<button class="collapsible">About</button>
<div class="content">
    <p>
        VExcess Academy is similiar to Khan Academy, however we mainly focus on computer science. Students can create programs using the online editor and share them with the community.
        <br><br>
        <strong>Also Important: This project is still under development so expect new features to show up, features to temporarily stop working, and some features to permanently disappear.</strong>
    </p>

    <h3>How we compare?</h3>
    <table>
        <thead>
            <tr>
                <th>Feature</th>
                <th>VExcess</th>
                <th>Khan</th>
            </tr>
        </thead>
        <tbody>
            {#each comparisonChart as row}
                <tr>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<br>

<button class="collapsible">Contributors</button>
<div class="content">
    <ul style="margin: auto; font-size: 18px;">
        {#each contributors as contributor}
            <li><a href="{contributor[1]}">{contributor[0]}</a> - {contributor[2]}</li>
        {/each}
    </ul>
</div>
<br>

<button class="collapsible">Environment Statuses</button>
<div class="content">
    <table>
        <thead>
            <tr>
                <th>Language</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {#each envStatuses as envInfo}
                <tr>
                    <td>{envInfo[0]}</td>
                    <td>{envInfo[1]}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<br><br>

<h2>Dev Logs: <a href="/logs/dev">Dev Logs</a></h2>
<div style="height: 1px;"><!-- spacer --></div>

<h2>Get Support</h2>
<div class="paragraph">
    The fastest way to get help and support from the community is at our Discord server: <a href="https://discord.gg/GGqwzp2rBr" target="_blank">https://discord.gg/GGqwzp2rBr</a>
    <br>
    In addition you can email us at support@vxsacademy.org
</div>
<br>

<h2>Support the Founder</h2>
<div class="paragraph">
    I (VExcess) have spent hundreds of hours working to provide this software to everyone free of charge. However, hosting a website isn't free (<a href="/logs/finance" target="_blank">Finance Logs</a>) and I also need to pay for college. If you have money to spare and my work has provided utility to you consider donating to me. You can donate Solana to my wallet address at <span style="background-color: rgba(0, 0, 0, 0.3); padding: 2px; border-radius: 4px;">4c83DZVr5wKfsWW62AvYamX6gjugCyuwQmST2meWnno2</span>. IMPORTANT: Only send Solana to my wallet; sending other crypto currencies (e.g. Bitcoin or Ethereum) to a Solana wallet will result in the coins being lost forever into the void of cyberspace.
</div>
<br>

<style>
    :global(#page-middle-container) {
        padding: 20px;
        margin-bottom: 50px;
        margin: auto;
        width: 75vw;
        min-width: 735px;
    }

    #program-showcase {
        width: 672px;
        margin: auto;
        background-color: var(--background2);
        border: 2px solid var(--borders2);
        border-radius: 5px;
        display: flex;
        flex-wrap: wrap;
        padding: 8px;
    }

    .program-display-box {
        overflow: hidden;
        width: 150px;
        border: 1px solid var(--borders3);
        border-radius: 15px;
        margin: 8px;
        padding-bottom: 8px;
        cursor: pointer;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        text-decoration: none;
        color: var(--text-color);
    }
    .program-display-box:hover {
        background-color: var(--transparent-background);
        transition: background-color 0.2s ease-in-out;
    }

    .lang-logo {
        margin: auto;
        margin-top: 16px;
        display: block;
        height: 100px;
    }

    tr {
        text-align: left;
    }

    td {
        border: 1px solid black;
        padding: 4px;
        min-width: 120px;
    }

    .collapsible {
        background-color: #777;
        color: white;
        cursor: pointer;
        padding: 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 22px;
    }

    .collapsible:global(.active), .collapsible:hover {
        background-color: #555;
    }

    .collapsible:after {
        content: '\002B';
        color: white;
        font-weight: bold;
        float: right;
        margin-left: 5px;
    }

    .collapsible:global(.active):after {
        content: "\2212";
    }

    .content {
        max-height: 0px;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
        background-color: var(--background2);
    }

    table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }

    td, th {
        border: 1px solid var(--borders4);
        text-align: left;
        padding: 8px;
    }

    tr:nth-child(even) {
        background-color: var(--background3);
    }

    .paragraph {
        line-height: 1.35em;
    }
</style>