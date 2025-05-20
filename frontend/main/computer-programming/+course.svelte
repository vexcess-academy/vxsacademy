<!-- import Prism.js -->
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-okaidia.min.css">

<div id="page-flex" style="display: flex;">
    <script src="https://unpkg.com/commonmark@0.29.3/dist/commonmark.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/vExcess/libraries/prism_html_css_js.js"></script>
    <div id="left">
        <!-- Course Title -->
        <div style="font-size: 24px;"></div>
        <!-- Section Box -->
        <div id="section-box" class="section-div">
            <!-- Section Header -->
            <div id="section-header">
                <div class="section-button" style="margin-right: 8px;">&lt;</div>
                <div id="section-title"></div>
                <div class="section-button" style="margin-left: 8px;">&gt;</div>
            </div>
            <!-- Section Body -->
            <div id="section-body"></div>
        </div>
    </div>
    <div id="right"></div>

    <script>
        (async () => {
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            
            while (typeof commonmark === "undefined") {
                await wait(4);
            }

            const $ = Q$;
            
            const left = $("#left");
            const right = $("#right");

            const sectionCache = {};

            const courses = {
                "javascript": "JavaScript & Programming Fundamentals",
                "webgl": "WebGL"
            };

            const reader = new commonmark.Parser();
            const writer = new commonmark.HtmlRenderer();

            const courseName = window.location.href.split("/")[4].split("#")[0];
            let hash = window.location.hash.slice(1).split("-").map(Number);
            if (hash.length !== 2) hash = [0, 0];

            const sectionTitleDiv = left.$("*div")[0];
            const sectionBox = $("#section-box");

            // set course title
            sectionTitleDiv.html(`<h3 class="section-div" style="text-align: center;">${courses[courseName]}</h3>`);

            function urlify (txt) {
                return txt.toLowerCase().replaceAll(" ", "-").replaceAll(".", "-");
            }

            function renderMD(txt) {
                let parsed = reader.parse(txt);    
                right.innerHTML = writer.render(parsed);

                $(".language-js").forEach(el => {
                    el.classList.add("language-javascript");
                })

                Prism.highlightAllUnder(right.el);
            }

            let courseSections = null;
            function changeSection(sectionNum) {
                const title = "Section " + sectionNum + ": " + courseSections[sectionNum].title;
                
                // render title with buttons
                $("#section-title").text(title);

                // add all lessons
                const sectionBody = $("#section-body").html("");
                const lessons = courseSections[sectionNum].lessons;
                for (let i = 0; i < lessons.length; i++) {
                    $("span")
                        .html(lessons[i])
                        .css({
                            display: "inline-block",
                            marginBottom: "4px"
                        })
                        .addClass("lesson-link")
                        .on("click", () => {
                            changePage(courseName, sectionNum, i);
                        })
                        .appendTo(sectionBody)
                    $("br").appendTo(sectionBody)
                }
            }

            function changePage(course, sectionNum, lessonNum) {
                let path = `/CDN/computer-programming/${course}/${sectionNum}-${lessonNum}.md`;
                window.location.hash = "" + sectionNum + "-" + lessonNum;
                hash = [sectionNum, lessonNum];
                if (sectionCache[path]) {
                    renderMD(sectionCache[path]);
                } else {
                    fetch(path)
                        .then(res => res.text())
                        .then(txt => {
                            sectionCache[path] = txt;
                            renderMD(txt);
                            right.scroll(0, 0);
                        })
                }
            }

            // get all sections in course
            $.getJSON("/CDN/computer-programming/" + courseName + "/course.json", function (courseLayout) {
                // store sections
                courseSections = courseLayout.sections;

                // display current section
                changeSection(hash[0]);

                const sectionButtons = $(".section-button");
                // go to previous section
                sectionButtons[0].on("click", () => {
                    if (hash[0] > 0) {
                        const newSection = hash[0] - 1;
                        changeSection(newSection);
                        changePage(courseName, newSection, 0);
                    }
                });
                // go to next section
                sectionButtons[1].on("click", () => {
                    if (hash[0] < courseSections.length - 1) {
                        const newSection = hash[0] + 1;
                        changeSection(newSection);
                        changePage(courseName, newSection, 0);
                    }
                });

                // load initial page
                let path = `/CDN/computer-programming/${courseName}/${hash.join("-")}.md`;
                fetch(path)
                    .then(res => res.text())
                    .then(txt => {
                        sectionCache[path] = txt;
                        renderMD(txt);
                    })
            })
        })();
    </script>
</div>

<style>
    #page-flex {
        padding: 20px;
        display: flex;
        width: calc(100% - 30px);
    }

    #section-header {
        font-size: 22px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    #section-title {
        width: 100%;
        font-size: 22px;
        margin-top: 8px;
        min-height: 34px;
    }

    .section-button {
        user-select: none;
        transform: scale(1, 1.75);
        cursor: pointer;
    }
    .section-button:hover {
        color: #16803e;
    }

    .section-div {
        background-color: var(--background2);
        border: 2px solid var(--borders2);
        border-radius: 5px;
        padding: 14px;
        margin-bottom: 28px;
        width: 250px;
    }

    :global {
        .lesson-link {
            color: var(--link-color);
            text-decoration: none;
            cursor: pointer;
        }
        .lesson-link:hover {
            text-decoration: underline;
        }
    }

    #right {
        padding-left: 30px;
        padding-right: 30px;
        font-size: 16px;
        overflow: auto;
        height: calc(100vh - 185px);
        scroll-behavior: smooth;
    }
</style>
