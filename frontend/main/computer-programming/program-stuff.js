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
            console.log("LOAD", id)
            if (forksCache.has(id)) {
                forksList.push(forksCache.get(id));
            } else {
                let program = await $.getJSON(`/CDN/programs/${id}.json`);
                console.log("LOAD2", program)
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

function updateProgramAbout() {
    if (programData.id) {
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
            $("#edit-title-btn").remove();
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
                body: PROGRAM_ID
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
    
        // handle delete button click if not removed
        const deleteBtn = $("#delete-program-button");
        if (deleteBtn) {
            deleteBtn.on("click", () => {
                if (confirm("Are you sure you want to delete this project? This cannot be undone!") === true) {
                    fetch("/API/delete_program", {
                        method: "POST",
                        body: PROGRAM_ID
                    }).then(res => res.text()).then(function (res) {
                        if (res.includes("error")) {
                            alert(res);
                        } else {
                            window.location.href = "/computer-programming/";
                        }
                    });
                }
            });
        }
    } else {
        $("#like-program-button").remove();
        $("#delete-program-button").remove();
        $("#report-program-button").remove();
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



    // about/forks/docs/help tabs
    let selectedTab = 0;
    let tabs = $(".tab-tab");
    let tabPages = $("#tab-content").$(".tab-page");

    tabs[selectedTab].style.borderBottom = "5px solid rgb(31, 171, 84)";
    tabPages[selectedTab].style.display = "block";

    for (let i = 0; i < tabs.length; i++) {
        const tabBtn = tabs[i];
        tabBtn.on("mouseenter", () => {
            if (i !== selectedTab) {
                tabBtn.style.borderBottom = "5px solid rgb(230, 230, 230)";
            }
        });
        tabBtn.on("mouseleave", () => {
            if (i !== selectedTab) {
                tabBtn.style.borderBottom = "5px solid transparent";
            }
        });
        tabBtn.on("click", () => {
            selectedTab = i;
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].style.borderBottom = "5px solid transparent";
                tabPages[j].style.display = "none";
            }
            tabBtn.style.borderBottom = "5px solid rgb(31, 171, 84)";
            tabPages[i].style.display = "block";

            switch (i) {
                case 1: {
                    changeForksSort(forksSort);
                }
            }
        });
    }
}