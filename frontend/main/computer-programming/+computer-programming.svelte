<h2>Computer Programming</h2>

<h3>View community programs at <a href="/computer-programming/browse">Browse Projects</a> or <a href="/computer-programming/ka-browse">Browse KA Projects</a></h3>

<p>
    These programming courses aim to teach a person who has no programming 
    experience to be able to create complex programs. The recommended place
    to start for beginners is the "Introduction to JavaScript" course.
</p>

<script>
    addEventListener("DOMContentLoaded", () => {
        const $ = Q$;

        const pageBody = $("#page-middle-container")
        
        const courseCatalog = [
            {
                title: "JavaScript w/ Processing.js",
                author: "CobraCoder",
                endpoint: "javascript",
                about: "JavaScript is an imperative scripting language used mainly for adding functionality to websites and for creating backends using Node JS. Processing.js is an obsolete graphics library written in JavaScript.",
                sections: []
            },
            {
                title: "HTML/CSS",
                author: "",
                endpoint: "html-css",
                about: "HTML is a markup language used to define the structure and content of websites. CSS is a style sheet language used for describing the presentation and layout of websites",
                sections: []
            },
            {
                title: "WebGL",
                author: "Dat",
                endpoint: "webgl",
                about: "WebGL is a JavaScript API based on OpenGL for rendering GPU-accelerated graphics in web browsers",
                sections: []
            },
            {
                title: "Python",
                author: "",
                endpoint: "python",
                about: "Python is a high level general purpose programming language known for its use of significant indentation as opposed to code blocks designated by curly braces",
                sections: []
            },
            {
                title: "Java",
                author: "",
                endpoint: "java",
                about: "Java is a high level, general purpose, object oriented programing language known for it's ability to run virtually anywhere along with being extremely verbose and forcing you to use classes for everything",
                sections: []
            },
            {
                title: "C++",
                author: "",
                endpoint: "cpp",
                about: "C++, somtimes known as C with classes, is a statically typed compiled programming language used anywhere where efficiency is key such as operating systems, video games, and web browsers",
                sections: []
            },
            {
                title: "JITLang",
                author: "",
                endpoint: "jitlang",
                about: "JITLang is a new programming language that is still under development that aims to be an improved version of JavaScript that is both faster and more flexible",
                sections: []
            },
        ];
        
        $.createComponent("course", $.html`
            <div class="course-div">
                <h3>\{title}</h3>
                <div style="font-size: 14px; margin-top: -15px;">(written by: \{author})</div>
                <p>\{about}</p>
                <div class="sections-box" style="display: flex;">
                    <div style="width: 50%;"></div>
                    <div></div>    
                </div>
            </div>
        `)

        for (let i = 0; i < courseCatalog.length; i++) {
            let course = courseCatalog[i];
            let courseElement = $("course", course).appendTo(pageBody);
            let sectionBoxes = courseElement.$(".sections-box")[0].$("*div");

            $.getJSON(`/CDN/computer-programming/${course.endpoint}/course.json`, json => {
                if (json !== null) {
                    // add section titles to course info
                    for (let j = 0; j < json.sections.length; j++) {
                        let section = json.sections[j];
                        course.sections.push(section.title);
                    }

                    // render sections
                    const sections = course.sections;
                    for (let i = 0; i < sections.length; i++) {
                        const UrlName = sections[i].toLowerCase().split(" ").join("-");
                        const el = $("a")
                            .text(sections[i])
                            .attr({
                                href: `/computer-programming/${course.endpoint}#${i}-0`,
                                target: "_self"
                            })
                        if (i < sections.length / 2) {
                            el.appendTo(sectionBoxes[0]);
                            sectionBoxes[0].append($("div").css("height: 8px;"));
                        } else {
                            el.appendTo(sectionBoxes[1]);
                            sectionBoxes[1].append($("div").css("height: 8px;"));
                        }
                    }
                }
            });
        }
    })
</script>

<style>
    /* Main Page */
    :global(#page-middle-container) {
        padding: 20px;
        margin: auto;
        max-width: 80%;
    }

    :global(.course-div) {
        background-color: var(--background2);
        border: 2px solid var(--borders2);
        border-radius: 5px;
        padding: 16px;
        padding-top: 6px;
        margin-bottom: 25px;
    }
</style>