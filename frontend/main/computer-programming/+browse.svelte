<script>
    import ProjectIcon from "../ProjectIcon.svelte";


    addEventListener("DOMContentLoaded", () => {
        const $ = Q$;

        const isKA = window.location.href.split("/").reverse()[0].startsWith("ka-");

        if (isKA) {
            $("#hotlist-label").text("Browse KA Projects");
        }

        const grid = $(".programs-grid")[0];
        let allPrograms = [];
        let sort = "";
        let page = 0;

        function displayPrograms(programs) {
            programs.forEach(program => $("program-element", {
                // note order matters so that type overwrites the default type
                ...program,
                type: program.type === "webpage" ? "html" : program.type
            }).appendTo(grid));
        }

        function loadPrograms(sort, page) {
            $.getJSON(`/API/${isKA ? "ka-" : ""}projects?sort=${sort}&page=${page}`, programs => {
                for (var i = 0; i < programs.length; i++) {
                    if (isKA) {
                        programs[i].isKA = true;
                    }
                    allPrograms.push(programs[i]);
                }
                displayPrograms(programs);
            });
        }

        function changeSort(newSort) {
            grid.innerHTML = "";
            allPrograms = [];
            page = 0;
            sort = newSort;
            loadPrograms(sort, page++);
        }

        let hotBtn = $("#hot-btn"),
            recentBtn = $("#recent-btn"),
            topBtn = $("#top-btn");

        hotBtn.on("click", e => {
            if (sort !== "hot") {
                hotBtn.css("text-decoration: underline");
                recentBtn.css("text-decoration: none");
                topBtn.css("text-decoration: none");
                changeSort("hot");   
            }
        });

        recentBtn.on("click", e => {
            if (sort !== "recent") {
                hotBtn.css("text-decoration: none");
                recentBtn.css("text-decoration: underline");
                topBtn.css("text-decoration: none");
                changeSort("recent");   
            }
        });

        topBtn.on("click", e => {
            if (sort !== "top") {
                hotBtn.css("text-decoration: none");
                recentBtn.css("text-decoration: none");
                topBtn.css("text-decoration: underline");
                changeSort("top");   
            }
        });

        $("#load-more-btn").css(`
            display: block;
            margin: auto;
        `).on("click", () => {
            loadPrograms(sort, page++);
        });

        // load the hot list
        hotBtn.click();
    });
</script>

<h1 id="hotlist-label" style="margin-top: 32px;">Browse Projects</h1>

<div style="margin-top: -40px; text-align: right;">
    <span class="list-tab-btn" id="hot-btn">Hot</span>
    <span class="list-tab-btn" id="recent-btn">Recent</span>
    <span class="list-tab-btn" id="contests-btn"></span>
    <span class="list-tab-btn" id="top-btn">Top</span>
</div>

<div style="height: 2px; background-color: rgb(200, 200, 200); margin-bottom: 20px;  margin-top: 20px;"></div>

<div class="programs-grid"></div>

<br><br>
<button id="load-more-btn" class="button">Load More Projects</button>
<br><br>

<style>
    :global {
        html, body {
            background: var(--background);
            color: var(--text-color);
        }

        #page-middle-container {
            width: 90%;
            max-width: 1300px;
            margin-inline: auto;
            padding: .6rem;
        }

        #page-middle-container * {
            box-sizing: border-box;
        }

        .author-link {
            text-decoration: none;
            color: rgb(0, 140, 60);
        }
        .author-link:hover {
            text-decoration: underline;
        }
    }    

    .list-tab-btn {
        padding: 4px;
        font-weight: bold;
        color: rgb(21, 149, 69);
        cursor: pointer;
        user-select: none;
    }
    .list-tab-btn:hover {
        text-decoration: underline;
    }

    .button {
        background-color: rgb(13, 146, 63);
        border: 0px solid white;
        border-radius: 4px;
        margin-right: 8px;
        padding: 8px;
        padding-left: 14px;
        padding-right: 14px;
        color: white;
        font-size: 17px;
        font-weight: 400;
    }
    .button:hover {
        background-color: rgb(10, 130, 50);
        /*border: 2px rgb(0, 80, 0) solid;*/
        box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.9);
        cursor: pointer;
    }
</style>