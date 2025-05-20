$.createComponent("discussion-post", $.html`
    <div class="post">
        <div>
            <span class="avatar-wrapper">
                <img src="/CDN/images/avatars/\{avatar}.png" alt="User avatar" class="avatar">
            </span>
        </div>
        <div class="dicussion-body">
            <div class="author-wrapper">
                <span class="nickname">\{nickname}</span>
                <span class="post-timestamp">\{time}</span>
            </div>
            <div class="content">\{content}</div>
            <div class="discussion-stats">
                <button class="button">Comment</button>
                
                <span><img src="/CDN/images/icons/like.svg" style="transform: translate(0px, 1px) scale(1.25);"></span>
                <span>\{likeCount}</span>
                <span><img src="/CDN/images/icons/like.svg" style="transform: translate(0px, 3px) scale(1.25, -1.25);"></span>
                <span><img src="/CDN/images/icons/report.svg" style="transform: translate(3px, 2px) scale(1.25);"> Report</span>
            </div>
        </div>
    </div>
`);

const discussionList = $("#discussion-list");
const PAGE_SIZE = 10;
let discussionsList = [];
function displayDiscussions(discussions) {
    if (discussions.length > 0) {
        forksGrid.innerHTML = "";
    }

    discussionsList.forEach(combo => {
        combo.el.appendTo(discussionList);
    });
}
async function loadDiscussions(page, isKAProgram) {
    if (isKAProgram) {
        $.getJSON(`/API/getDiscussions?id=${programData.id.slice(3)}&isKAProgram=${isKAProgram}`, discussions => {
            for (let i = 0; i < discussions.length; i++) {
                const discussion = discussions[i];
                let el = $("discussion-post", {
                    avatar: discussion.author.avatar,
                    nickname: discussion.author.nickname,
                    time: new Date(discussion.created).toDateString(),
                    content: discussion.content,
                    likeCount: discussion.likeCount
                });
                discussionsList.push({ discussion, el });
                displayDiscussions(discussionsList);
            }
        });
    } else {
        const discussionIds = programData.discussions;
        const pgStart = page * PAGE_SIZE;
        const pgEnd = pgStart + PAGE_SIZE;
        const idsSlice = discussionIds.slice(pgStart, pgEnd).join(",");
        if (idsSlice.length > 0) {
            $.getJSON(`/API/getDiscussions?ids=${idsSlice}`, discussions => {
                for (let i = 0; i < discussions.length; i++) {
                    const discussion = discussions[i];
                    let el = $("discussion-post", {
                        avatar: discussion.author.avatar,
                        nickname: discussion.author.nickname,
                        time: new Date(discussion.created).toDateString(),
                        content: discussion.content,
                        likeCount: discussion.likeCount
                    });
                    discussionsList.push({ discussion, el });
                    displayDiscussions(discussionsList);
                }
            });
        }
    }
}

let discussionInput = $(".discussion-input")[0];
let discussionParent = $(discussionInput.parentElement);
let commentBtn = $("#comment-btn");
let questionBtn = $("#question-btn");
function createDiscussion(type) {
    if (isKAProgram) {
        alert("Cannot comment on KA program from vxsacademy");
        return;
    }

    if (!programData.id) {
        alert("Cannot comment on a new program");
        return;
    }

    commentBtn.disabled = true;
    questionBtn.disabled = true;
    
    commentBtn.text("Sending...");
    questionBtn.css({ display: "none" });

    fetch("/API/create_discussion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: type,
            program: programData.id,
            content: discussionInput.value
        })
    }).then(res => res.text()).then(res => {
        if (res.includes("error")) {
            alert(res);
        } else {
            discussionInput.value = "";
            discussionInput.blur();

            commentBtn.text("Send As Comment");
            questionBtn.css({ display: "inline-block" });

            commentBtn.disabled = false;
            questionBtn.disabled = false;

            $.getJSON(`/API/getDiscussions?ids=${res}`, comments => {
                const json = comments[0];
                let el = $("discussion-post", {
                    avatar: json.author.avatar,
                    nickname: json.author.nickname,
                    time: new Date(json.created).toDateString(),
                    content: json.content,
                    likeCount: json.likeCount
                });
                discussionsList.push({ json, el });
                displayDiscussions(discussionsList);
            });
        }
    });
}
discussionParent.on("focusin", () => {
    discussionParent.$(".discussion-stats")[0].css({
        height: "auto"
    })
})
discussionParent.on("focusout", () => {
    discussionParent.$(".discussion-stats")[0].css({
        height: "0px"
    })
})
commentBtn.on("click", () => {
    createDiscussion("C");
    $("#comment-btn").text("Sending...");
})
questionBtn.on("click", () => {
    createDiscussion("Q");
    $("#question-btn").text("Sending...");
})