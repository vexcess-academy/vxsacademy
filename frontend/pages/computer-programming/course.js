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
    let path = `/CDN/pages/computer-programming/${course}/${sectionNum}-${lessonNum}.md`;
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
$.getJSON("/CDN/pages/computer-programming/" + courseName + "/course.json", function (courseLayout) {
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
    let path = `/CDN/pages/computer-programming/${courseName}/${hash.join("-")}.md`;
    fetch(path)
        .then(res => res.text())
        .then(txt => {
            sectionCache[path] = txt;
            renderMD(txt);
        })
})
