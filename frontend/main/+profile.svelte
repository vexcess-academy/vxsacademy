<script>
    addEventListener("DOMContentLoaded", () => {
        var who = window.location.href.split("/")[4];
        if (who === "me") {
            if (userData !== null) {
                who = "id_" + userData.id;
            } else {
                who = undefined;
            }
        }

        const avatars = {
            "boberta": "Boberta",
            "bobert-cool": "Cool Bobert",
            "bobert-pixelated": "Pixel Bobert",
            "bobert-approved": "Bobert Approved",
            "bobert-chad": "Chad Bobert",
            "bobert-cringe": "Cringing Bobert",
            "bobert-flexing": "Flexing Bobert",
            "bobert-high": "High Bobert",
            "bobert-troll-nose": "Shipment's Troll Bobert",
            "bobert-troll": "Troll Bobert",
            "bobert-wide": "Wide Bobert",
            "bobert": "Bobert",
            "rock-thonk": "Rock Thonk",
            "floof1": "Infant Floof",
            "floof2": "Toddler Floof",
            "floof3": "Child Floof",
            "floof4": "Teen Floof",
            "floof5": "Adult Floof",
            "pyro1": "Infant Pyro",
            "pyro2": "Toddler Pyro",
            "pyro3": "Child Pyro",
            "pyro4": "Teen Pyro",
            "pyro5": "Adult Pyro",
        };    

        const backgrounds = {
            "blue": ["Blue", 0],
            "bobert":["Bobert", 0],
            "cosmos": ["Cosmos", 0],
            "cyber":["Cyber", 0],
            "electric-blue": ["Electric Blue", 0],
            "fbm": ["Fractal Brownian Motion", 1],
            "fractal-1": ["Fractal 1", 0],
            "green": ["Green", 0],
            "julia-rainbow": ["Rainbow Julia Set", 1],
            "julia": ["Julia Set", 0],
            "magenta": ["Magenta", 0],
            "photon-1": ["Photon 1", 0],
            "photon-2": ["Photon 2", 0],
            "transparent": ["None", 1],
        };

        let showcaseEl = Q$(".programs-grid")[0];
        let profileData;
        if (who !== undefined) {
            fetch("/API/getUserData?who=" + who).then(res => res.json()).then(res => {
                profileData = res;

                let pfp = Q$("#profile-img > *img")[0];
                pfp.src = `/CDN/images/avatars/${profileData.avatar}.png`;
                pfp.on("load", () => {
                    if (pfp.width > pfp.height) {
                        pfp.css({
                            width: "90px",
                            height: "unset",
                            position: "relative",
                            top: "50%",
                            transform: "translateY(-50%)"
                        });
                    } else {
                        pfp.css({
                            width: "unset",
                            height: "90px"
                        });
                    }
                });
                Q$("#background-container").css({
                    backgroundImage: `url("/CDN/images/backgrounds/${profileData.background}${profileData.background === "transparent" ? ".png" : ".jpg"}")`
                });
                let textClr = backgrounds[profileData.background][1] === 1 ? "black" : "white";
                let shadowClr = textClr === "white" ? "black" : "white";
                Q$("#profile-nickname")
                    .text(profileData.nickname)
                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                Q$("#profile-username")
                    .text(`@${profileData.username}`);
                Q$("#profile-id")
                    .text(`(${profileData.id})`)
                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                Q$("#profile-bio")
                    .text(profileData.bio)
                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                
                for (var i = 0; i < profileData.projects.length; i++) {
                    let projectId = profileData.projects[i];
            
                    fetch(`/CDN/programs/${projectId}.json`)
                        .then(res => res.json())
                        .then(data => {
                            Q$("program-element", {
                                ...data,
                                type: data.type === "webpage" ? "html" : data.type
                            }).appendTo(showcaseEl)
                        });
                }
            });
        }

        function validateNickname(nickname) {
            if (typeof nickname !== "string") {
                return "nickname must be a string";
            }
            if (nickname.length > 32) {
                return "nickname can't be longer than 32 characters";
            }
            if (nickname.length <= 0) {
                return "nickname can't be empty";
            }
            return "OK";
        }
        function validateUsername(username) {
            if (typeof username !== "string") {
                return "username must be a string";
            }
            if (username.length > 32) {
                return "username can't be longer than 32 characters";
            }
            if (!(/^[a-zA-Z0-9\_]+$/.test(username))) {
                return "username can only contain letters, numbers, and underscores";
            }
            if (username.length < 3) {
                return "username can't be shorter than 3 characters";
            }
            return "OK";
        }
        function validateBio(bio) {
            if (typeof bio !== "string") {
                return "bio must be a string";
            }
            if (bio.length > 160) {
                return "bio can't be longer than 160 characters";
            }
            return "OK";
        }

        if (userData !== null && (who === "id_" + userData.id || who === userData.username)) {
            const settingsEl = Q$("#profile-settings");
            const pageDarkenEl = Q$("#page-darken");
            
            const settingsCloseBtn = Q$("#profile-settings > *button")[0];
            const settingsSaveBtn = Q$("#profile-settings > *button")[1];

            let currSelectedImage = "";
            let settingsMode = "";

            Q$.createComponent("text-settings", Q$.html`
                <div>
                    <div style="display: flex;">
                        <div style="width: 100px; padding-top: 8px; color: gray;">
                            NICKNAME
                        </div>
                        <div style="width: calc(100% - 130px);">
                            <input id="nickname-input" type="text" style="width: 100%; padding: 8px; border-radius: 3px; border: 1px solid #ccc;">
                            <div style="font-size: 14px; color: gray; margin-top: 10px;">This is how your name will appear around Vexcess Academy.</div>
                        </div>
                    </div>
            
                    <br><br>
            
                    <div style="display: flex;">
                        <div style="width: 100px; padding-top: 8px; color: gray;">
                            USERNAME
                        </div>
                        <div style="width: calc(100% - 130px);">
                            <input id="username-input" type="text" style="width: 100%; padding: 8px; border-radius: 3px; border: 1px solid #ccc;">
                            <div style="font-size: 14px; color: gray; margin-top: 10px;">Your username will appear in your Vexcess Academy address.<br> http://vxsacademy.org/profile/YOUR_USERNAME</div>
                        </div>
                    </div>
            
                    <br><br>
            
                    <div style="display: flex;">
                        <div style="width: 100px; padding-top: 8px; color: gray;">
                            BIO
                        </div>
                        <div style="width: calc(100% - 130px);">
                            <textarea id="bio-input" type="text" style="width: 100%; padding: 8px; border-radius: 3px; border: 1px solid #ccc;"></textarea>
                            <div id="bio-chars-left" style="font-size: 14px; color: gray; margin-top: 10px;"></div>
                        </div>
                    </div>
                </div>
            `);

            // handle avatar settings
            Q$.createComponent("avatar-settings", Q$.html`
                <div>
                    <div class="avatars-grid"></div>
                </div>
            `, function() {
                Q$.createComponent("avatar", Q$.html`
                    <div class="avatar-box">
                        <img src="/CDN/images/avatars/\{name}.png" height="80">
                        <br>
                        <span>\{display_name}</span>
                    </div>
                `, function(info) {
                    let avatarBox = this;
                    this.on("click", () => {
                        Q$(".avatar-box").forEach(el => {
                            el.style.border = "2px solid rgba(0, 0, 0, 0.1)";
                        })
                        currSelectedImage = info.name;
                        avatarBox.style.border = "2px solid black";
                    });
                });        

                let grid = this.$(".avatars-grid")[0];
                for (let avatar in avatars) {
                    let el = Q$("avatar", {
                        name: avatar,
                        display_name: avatars[avatar]
                    }).appendTo(grid);
                    if (avatar === userData.avatar) {
                        el.style.border = "2px solid black";
                    }
                }

                Q$.deleteComponent("avatar");
            });

            // handle background settings
            Q$.createComponent("background-settings", Q$.html`
                <div>
                    <div class="backgrounds-grid"></div>
                </div>
            `, function() {
                Q$.createComponent("background", Q$.html`
                    <div class="background-box">
                        <img src="/CDN/images/backgrounds/\{name}\{ext}" style="width: 100%;">
                        <br>
                        <span>\{display_name}</span>
                    </div>
                `, function(info) {
                    let backgroundBox = this;
                    this.on("click", () => {
                        Q$(".background-box").forEach(el => {
                            el.style.border = "2px solid rgba(0, 0, 0, 0.1)";
                        })
                        currSelectedImage = info.name;
                        backgroundBox.style.border = "2px solid black";
                    });
                });

                let grid = this.$(".backgrounds-grid")[0];
                for (let background in backgrounds) {
                    let el = Q$("background", {
                        name: background,
                        display_name: backgrounds[background][0],
                        ext: background === "transparent" ? ".png" : ".jpg"
                    }).appendTo(grid);
                    if (background === userData.background) {
                        el.style.border = "2px solid black";
                    }
                }

                Q$.deleteComponent("background");
            });
            
            Q$("#profile-img")
                .css("cursor: pointer;")
                .on("mouseup", function() {
                    Q$("#settings-content").html("").append(Q$("avatar-settings"));
                    settingsMode = "avatar";
                    settingsEl.$("*h1")[0].text("Avatars");
                    
                    pageDarkenEl.css("display: block");
                    settingsEl.css("display: block");
                });

            Q$("#change-background-btn")
                .css("display: inline-block")
                .on("mouseup", function() {
                    Q$("#settings-content").html("").append(Q$("background-settings"));
                    settingsMode = "background";
                    settingsEl.$("*h1")[0].text("Backgrounds");
                    
                    pageDarkenEl.css("display: block");
                    settingsEl.css("display: block");
                });

            // handle text settings
            Q$("#profile-about-text-container")
                .css("cursor: pointer;")
                .on("mouseup", function() {
                    Q$("#settings-content").html("").append(Q$("text-settings"));
                    settingsMode = "text";
                    settingsEl.$("*h1")[0].text("Profile Information");
                    
                    const nicknameInput = Q$("#nickname-input");
                    const usernameInput = Q$("#username-input");
                    const bioInput = Q$("#bio-input");
                    const bioCharsLeftEl = Q$("#bio-chars-left");

                    bioInput.on("input", function() {
                        bioInput.value = bioInput.value.slice(0, 160);
                        bioCharsLeftEl.text(`${160 - bioInput.value.length} characters left`);
                    });
                    
                    nicknameInput.value = userData.nickname;
                    usernameInput.value = userData.username;
                    bioInput.value = userData.bio;

                    bioCharsLeftEl.text(`${160 - bioInput.value.length} characters left`);

                    pageDarkenEl.css("display: block");
                    settingsEl.css("display: block");
                });

            settingsCloseBtn.on("click", function() {
                pageDarkenEl.css("display: none");
                settingsEl.css("display: none");
            });

            settingsSaveBtn.on("click", function() {
                let hadError = false;
                let newNickname = "";
                let newUsername = "";
                let newBio = "";
            
                if (settingsMode === "text") {
                    const nicknameInput = Q$("#nickname-input");
                    const usernameInput = Q$("#username-input");
                    const bioInput = Q$("#bio-input");
                    const bioCharsLeftEl = Q$("#bio-chars-left");
                        
                    newNickname = nicknameInput.value;
                    newUsername = usernameInput.value;
                    newBio = bioInput.value;
                    
                    let checkNickname = validateNickname(newNickname);
                    let checkUsername = validateUsername(newUsername);
                    let checkBio = validateBio(newBio);
                
                    if (checkNickname !== "OK") {
                        alert(checkNickname);
                        hadError = true;
                    }
                    if (checkUsername !== "OK") {
                        alert(checkUsername);
                        hadError = true;
                    }
                    if (checkBio !== "OK") {
                        alert(checkBio);
                        hadError = true;
                    }
                }

                if (!hadError) {
                    let sendObj;
                    switch (settingsMode) {
                        case "text":
                            sendObj = {
                                nickname: newNickname,
                                username: newUsername,
                                bio: newBio
                            };
                            break;
                        case "avatar":
                            sendObj = {
                                avatar: currSelectedImage
                            };
                            break;
                        case "background":
                            sendObj = {
                                background: currSelectedImage
                            };
                            break;
                    }
                    
                    fetch("/API/update_profile", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(sendObj)
                    }).then(res => res.text()).then(function (res) {
                        if (res.includes("error")) {
                            alert(res);
                        } else {
                            if (settingsMode === "text") {
                                // update internal
                                userData.nickname = newNickname;
                                userData.username = newUsername;
                                userData.bio = newBio;
                                
                                // update display
                                Q$("#profile-nickname").text(newNickname);
                                Q$("#profile-username").text(`@${newUsername}`);
                                Q$("#profile-bio").text(newBio);
                                profileDropDownBtn.$("*span")[0].text(userData.nickname);                        
                            } else if (settingsMode === "avatar") {
                                // update pfp
                                userData.avatar = currSelectedImage;
                                let pfp = Q$("#profile-img > *img")[0];
                                pfp.src = `/CDN/images/avatars/${currSelectedImage}.png`;
                            } else if (settingsMode === "background") {
                                // update background
                                userData.background = currSelectedImage;
                                Q$("#background-container").css({
                                    backgroundImage: `url("/CDN/images/backgrounds/${userData.background}${userData.background === "transparent" ? ".png" : ".jpg"}")`
                                });

                                let textClr = backgrounds[userData.background][1] === 1 ? "black" : "white";
                                let shadowClr = textClr === "white" ? "black" : "white";
                                Q$("#profile-nickname")
                                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                                Q$("#profile-id")
                                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                                Q$("#profile-bio")
                                    .css(`color: ${textClr}; text-shadow: 0px 0px 8px ${shadowClr};`);
                            }

                            // close settings
                            pageDarkenEl.css("display: none");
                            settingsEl.css("display: none");
                        }
                    });
                }
            });
        }
    });
</script>

<link rel="stylesheet" href="/CDN/pages/profile/profile.css" type="text/css">

<!-- top background area -->
<div id="background-container">
    <div id="profile-about-container">
        <div id="profile-img">
            <img src="" alt="profile">
        </div>
        <div id="profile-about-text-container">
            <strong id="profile-nickname" style="cursor: pointer; font-size: 28px; display: block; margin-bottom: 6px;"></strong>
            <strong id="profile-username" style="font-size: 16px; color: black; background: rgba(255, 255, 255, 0.8); padding: 6px; border-radius: 100px; padding-top: 4px;"></strong>
            <span id="profile-id" style="font-size: 16px; opacity: 0.8;"></span>
            <div id="profile-bio" style="cursor: pointer; font-size: 16px; margin-top: 18px;"></div>
        </div>
        <div style="margin-left: auto; order: 2; opacity: 0.8;">
            <button id="change-background-btn" style="display: none;" class="button">Change Background</button>
        </div>
    </div>
</div>

<!-- main profile info area -->
<div style="padding: 20px;">
    <h2>User Statistics</h2>
    <div class="profile-content"></div>
</div>

<div style="padding: 20px;">
    <h2>Projects</h2>
    <div class="profile-content">
        <div class="programs-grid"></div>
    </div>
</div>

<div style="padding: 20px;">
    <h2>Discussion</h2>
    <div class="profile-content"></div>
</div>

<!-- Profile Settings Div -->
<div id="page-darken" style="display: none;"></div>
<div id="profile-settings">
    <h1>...</h1>
    
    <p></p>
        
    <div id="settings-content"></div>

    <p></p>
    
    <button class="button">Cancel</button>
    <button class="button">Save</button>
</div>

<style>
    :global(#page-middle-container) {
        padding: 0px;
        margin-bottom: 50px;
    }

    #background-container {
        background-position: center;
        background-size: cover;
        padding: 10px;
        color: var(--background);
    }

    #profile-about-container {
        width: 90%;
        margin: auto;
        display: flex;
    }

    #profile-about-text-container {
        margin: 0;
        position: relative;
        top: 50%;
        transform: translate(25px, 0px);
        border-radius: 9px;
        padding: 10px;
    }
    #profile-about-text-container:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    #profile-img {
        background-color: rgba(0, 0, 0, 0.5);
        width: 90px;
        height: 90px;
        border: 2px solid white;
        border-radius: 9px;
        padding: 10px;
        text-align: center;
        overflow: hidden;
    }
    #profile-img:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    /* #program-showcase {
        background-color: var(--background2);
        border: 2px solid var(--borders2);
        border-radius: 5px;
        display: flex;
        padding: 8px;
    } */

    :global(.avatars-grid), :global(.backgrounds-grid) {
        display: grid;
        padding: 10px;
        justify-content: center;
    }
    :global(.avatars-grid) {
        grid-template-columns: repeat(auto-fill, 225px);
    }
    :global(.backgrounds-grid) {
        grid-template-columns: repeat(auto-fill, 50%);
    }
    :global(.avatar-box), :global(.background-box) {
        border-radius: 5px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        margin: 10px;
        padding: 10px;
        font-size: 18px;
        text-align: center;
        cursor: pointer;
    }
    :global(.avatar-box:hover), :global(.background-box:hover) {
        background-color: rgba(0, 0, 0, 0.2);
    }

    .profile-content {
        background-color: var(--background2);
        border: 2px solid var(--borders2);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        padding: 8px;
        min-height: 100px;
    }
/* 
    .program-display-box {
        overflow: hidden;
        width: 200px;
        border: 1px solid gray;
        border-radius: 2px;
        margin: 8px;
        cursor: pointer;
        text-align: center;
        font-size: 14px;
    } */

    #profile-settings {
        background-color: var(--background);
        position: fixed;
        width: 75%;
        max-height: 90vh;
        left: 12.5%;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-color);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 20px;
        padding-top: 0px;
        font-size: 16px;
        overflow: auto;
        z-index: 1001;
        display: none;
    }
    #profile-settings p {
        background-color: rgb(100, 100, 100);
        height: 0.5px;
    }
    /* #profile-settings input, #profile-settings textarea {
        background-color: var(--background);
        color: var(--text-color);
    } */

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