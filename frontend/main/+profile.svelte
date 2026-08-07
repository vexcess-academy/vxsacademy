<script>
    import ProjectIcon from "./ProjectIcon.svelte";
    import { onMount } from 'svelte';

    const locations = [
        "undefined",
        "United States of America",
        "Alabama, U.S.A",
        "Alaska, U.S.A",
        "Arizona, U.S.A",
        "Arkansas, U.S.A",
        "California, U.S.A",
        "Colorado, U.S.A",
        "Connecticut, U.S.A",
        "Delaware, U.S.A",
        "Florida, U.S.A",
        "Georgia, U.S.A",
        "Hawaii, U.S.A",
        "Idaho, U.S.A",
        "Illinois, U.S.A",
        "Indiana, U.S.A",
        "Iowa, U.S.A",
        "Kansas, U.S.A",
        "Kentucky, U.S.A",
        "Louisiana, U.S.A",
        "Maine, U.S.A",
        "Maryland, U.S.A",
        "Massachusetts, U.S.A",
        "Michigan, U.S.A",
        "Minnesota, U.S.A",
        "Mississippi, U.S.A",
        "Missouri, U.S.A",
        "Montana, U.S.A",
        "Nebraska, U.S.A",
        "Nevada, U.S.A",
        "New Hampshire, U.S.A",
        "New Jersey, U.S.A",
        "New Mexico, U.S.A",
        "New York, U.S.A",
        "North Carolina, U.S.A",
        "North Dakota, U.S.A",
        "Ohio, U.S.A",
        "Oklahoma, U.S.A",
        "Oregon, U.S.A",
        "Pennsylvania, U.S.A",
        "Rhode Island, U.S.A",
        "South Carolina, U.S.A",
        "South Dakota, U.S.A",
        "Tennessee, U.S.A",
        "Texas, U.S.A",
        "Utah, U.S.A",
        "Vermont, U.S.A",
        "Virginia, U.S.A",
        "Washington, U.S.A",
        "West Virginia, U.S.A",
        "Wisconsin, U.S.A",
        "Wyoming, U.S.A",
        "Canada",
        "Alberta, Canada",
        "British Columbia, Canada",
        "Manitoba, Canada",
        "New Brunswick, Canada",
        "Newfoundland and Labrador, Canada",
        "Nova Scotia, Canada",
        "Ontario, Canada",
        "Prince Edward Island, Canada",
        "Quebec, Canada",
        "Saskatchewan, Canada",
        "Northwest Territories, Canada",
        "Nunavut, Canada",
        "Yukon, Canada",
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra",
        "Angola",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bhutan",
        "Bolivia",
        "Bosnia and Herzegovina",
        "Botswana",
        "Brazil",
        "Brunei",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Colombia",
        "Comoros",
        "Congo (Congo-Brazzaville)",
        "Costa Rica",
        "Côte d'Ivoire",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czechia (Czech Republic)",
        "Democratic Republic of the Congo",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Eswatini",
        "Ethiopia",
        "Fiji",
        "Finland",
        "France",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Greece",
        "Grenada",
        "Guatemala",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Honduras",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran",
        "Iraq",
        "Ireland",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Kuwait",
        "Kyrgyzstan",
        "Laos",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Mauritania",
        "Mauritius",
        "Mexico",
        "Micronesia",
        "Moldova",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "North Korea",
        "North Macedonia",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine State",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Poland",
        "Portugal",
        "Qatar",
        "Romania",
        "Russia",
        "Rwanda",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Korea",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Sweden",
        "Switzerland",
        "Syria",
        "Taiwan",
        "Tajikistan",
        "Tanzania",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Vatican City",
        "Venezuela",
        "Vietnam",
        "Yemen",
        "Zambia",
        "Zimbabwe",
        "Homeless",
    ];

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

    let profileData = null;
    let loadedProjects = [];
    let loadedDiscussions = [];
    let isOwner = false;

    // settings states
    let isSettingsOpen = false;
    let settingsMode = ""; // 'text', 'avatar', 'background'
    let currSelectedImage = "";
    
    // settings inputs
    let editNickname = "";
    let editUsername = "";
    let editBio = "";
    let editLocation = "undefined";

    // searchable dropdown state
    let isLocationDropdownOpen = false;
    let locationSearch = "";

    $: filteredLocations = locations.filter((loc) =>
        loc.toLowerCase().replaceAll(".", "").includes(locationSearch.toLowerCase().replaceAll(".", ""))
    );

    // dropdown navigation state
    let highlightedIndex = -1;

    // Reset highlight when filtering changes
    $: if (filteredLocations) {
        highlightedIndex = -1;
    }

    function selectLocation(loc) {
        editLocation = loc;
        locationSearch = loc;
        isLocationDropdownOpen = false;
        highlightedIndex = -1;
    }

    function handleKeydown(event) {
        if (!isLocationDropdownOpen) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                isLocationDropdownOpen = true;
                return;
            }
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (filteredLocations.length > 0) {
                highlightedIndex = (highlightedIndex + 1) % filteredLocations.length;
                scrollHighlightedIntoView();
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (filteredLocations.length > 0) {
                highlightedIndex =
                    (highlightedIndex - 1 + filteredLocations.length) % filteredLocations.length;
                scrollHighlightedIntoView();
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredLocations.length) {
                selectLocation(filteredLocations[highlightedIndex]);
            }
        } else if (event.key === "Escape") {
            isLocationDropdownOpen = false;
            highlightedIndex = -1;
        }
    }

    function scrollHighlightedIntoView() {
        setTimeout(() => {
            const activeEl = document.querySelector(".dropdown-list li.highlighted");
            if (activeEl) {
                activeEl.scrollIntoView({ block: "nearest" });
            }
        }, 0);
    }

    // reactive states
    $: isDarkText = profileData && backgrounds[profileData.background] && backgrounds[profileData.background][1] === 1;
    $: textClr = isDarkText ? "black" : "white";
    $: shadowClr = isDarkText ? "white" : "black";
    $: bgExtension = profileData?.background === "transparent" ? ".png" : ".jpg";

    function sumOf(arr, ofFn) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += ofFn(arr[i]);
        }
        return sum;
    }

    $: likesReceived = "...";
    $: forksReceived = "...";
    $: forksCount = "...";
    $: avgLikes = "...";
    $: avgForks = "...";

    async function loadProjects() {
        if (profileData?.projects?.length > 0) {
            const promises = profileData.projects.map(async (id) => {
                const res = await fetch(`/CDN/programs/${id}.json`);
                const data = await res.json();
                if (data["files"]) {
                    delete data["files"];
                }
                if (data["thumbnail"]) {
                    delete data["thumbnail"];
                }
                loadedProjects = [...loadedProjects, data];
                return data;
            });

            loadedProjects = await Promise.all(promises);

            likesReceived = sumOf(loadedProjects, (project) => project.likeCount);
            forksReceived = sumOf(loadedProjects, (project) => project.forkCount);
            forksCount = sumOf(loadedProjects, (project) => project.parent !== null ? 1 : 0);

            avgLikes = profileData.projects.length === 0 ? 0 : (likesReceived / profileData.projects.length).toFixed(1);
            avgForks = profileData.projects.length === 0 ? 0 : (forksReceived / profileData.projects.length).toFixed(1);
        }
    }

    async function loadDiscussions() {
        if (profileData?.discussions?.length > 0) {
            const promises = profileData.discussions.forEach(async (id) => {
                const res = await fetch(`/API/getDiscussions?ids=${id}`);
                const arr = await res.json();
                loadedDiscussions = [...loadedDiscussions, ...arr];
            });
        }
    }

    onMount(async () => {
        let who = window.location.href.split("/")[4];
        if (who === "me") {
            if (userData !== null) {
                who = "id_" + userData.id;
            } else {
                who = undefined;
            }
        }

        if (who !== undefined) {
            const res = await fetch("/API/getUserData?who=" + who);
            profileData = await res.json();
            
            // check if viewer is owner
            if (userData && (who === "id_" + userData.id || who === userData.username)) {
                isOwner = true;
            }

            loadProjects();
            loadDiscussions();
        }
    });

    // Validation Functions
    function validateNickname(nickname) {
        if (typeof nickname !== "string") return "nickname must be a string";
        if (nickname.length > 32) return "nickname can't be longer than 32 characters";
        if (nickname.length <= 0) return "nickname can't be empty";
        return "OK";
    }

    function validateUsername(username) {
        if (typeof username !== "string") return "username must be a string";
        if (username.length > 32) return "username can't be longer than 32 characters";
        if (!(/^[a-zA-Z0-9\_]+$/.test(username))) return "username can only contain letters, numbers, and underscores";
        if (username.length < 3) return "username can't be shorter than 3 characters";
        return "OK";
    }

    function validateBio(bio) {
        if (typeof bio !== "string") return "bio must be a string";
        if (bio.length > 160) return "bio can't be longer than 160 characters";
        return "OK";
    }

    function openSettings(mode) {
        settingsMode = mode;
        if (mode === 'text') {
            editNickname = profileData.nickname;
            editUsername = profileData.username;
            editBio = profileData.bio;
            editLocation = profileData.location || "undefined";
            locationSearch = editLocation;
            isLocationDropdownOpen = false;
        } else if (mode === 'avatar') {
            currSelectedImage = profileData.avatar;
        } else if (mode === 'background') {
            currSelectedImage = profileData.background;
        }
        isSettingsOpen = true;
    }

    async function saveSettings() {
        let sendObj = {};
        
        if (settingsMode === "text") {
            const checkNickname = validateNickname(editNickname);
            const checkUsername = validateUsername(editUsername);
            const checkBio = validateBio(editBio);

            if (checkNickname !== "OK") return alert(checkNickname);
            if (checkUsername !== "OK") return alert(checkUsername);
            if (checkBio !== "OK") return alert(checkBio);

            sendObj = { 
                nickname: editNickname, 
                username: editUsername, 
                bio: editBio,
                location: editLocation 
            };
        } else if (settingsMode === "avatar") {
            sendObj = { avatar: currSelectedImage };
        } else if (settingsMode === "background") {
            sendObj = { background: currSelectedImage };
        }

        const res = await fetch("/API/update_profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sendObj)
        });
        const resultText = await res.text();

        if (resultText.toLowerCase().includes("error")) {
            alert(resultText);
        } else {
            profileData = { ...profileData, ...sendObj };
            if (userData) {
                userData = { ...userData, ...sendObj };
            }
            isSettingsOpen = false;
        }
    }

    function handleThemeChange(event) {
        window.savedTheme = event.target.value;
        localStorage.setItem('theme', window.savedTheme);
        window.applyTheme(savedTheme);
    }

    function timeAgo(timestamp) {
        const now = Date.now();
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerMonth = msPerDay * 30.44; // Average days in a month
        const msPerYear = msPerDay * 365.25; // Account for leap years

        const elapsed = now - timestamp;
        if (elapsed < 0) {
            return "just now";
        }

        const units = [
            { max: msPerMinute, value: 1, name: 'second' },
            { max: msPerHour, value: msPerMinute, name: 'minute' },
            { max: msPerDay, value: msPerHour, name: 'hour' },
            { max: msPerMonth, value: msPerDay, name: 'day' },
            { max: msPerYear, value: msPerMonth, name: 'month' },
            { max: Infinity, value: msPerYear, name: 'year' }
        ];
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            if (elapsed < unit.max) {
                const count = Math.floor(elapsed / unit.value);
                return `${count} ${unit.name}${count === 1 ? '' : 's'} ago`;
            }
        }
    }
</script>

<!-- <link rel="stylesheet" href="/CDN/pages/profile/profile.css" type="text/css"> -->

{#if profileData}
    <div id="background-container" style="background-image: url('/CDN/images/backgrounds/{profileData.background}{bgExtension}')">
        <div id="profile-about-container">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div id="profile-img" on:click={() => isOwner && openSettings('avatar')} style="cursor: {isOwner ? 'pointer' : 'default'}">
                <img 
                    src="/CDN/images/avatars/{profileData.avatar}.png" 
                    alt="profile avatar"
                    on:load={(e) => {
                        const img = e.target;
                        if (img.naturalWidth > img.naturalHeight) {
                            img.style.width = '90px';
                            img.style.height = 'unset';
                            img.style.position = 'relative';
                            img.style.top = '50%';
                            img.style.transform = 'translateY(-50%)';
                        } else {
                            img.style.width = 'unset';
                            img.style.height = '90px';
                        }
                    }}
                >
            </div>
            
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div id="profile-about-text-container" on:click={() => isOwner && openSettings('text')} style="cursor: {isOwner ? 'pointer' : 'default'}">
                <strong id="profile-nickname" style="color: {textClr}; text-shadow: 0px 0px 8px {shadowClr};">{profileData.nickname}</strong>
                <strong id="profile-username">@{profileData.username}</strong>
                <span id="profile-id" style="color: {textClr}; text-shadow: 0px 0px 8px {shadowClr};">({profileData.id})</span>
                <div id="profile-bio" style="color: {textClr}; text-shadow: 0px 0px 4px {shadowClr}, 0px 0px 8px {shadowClr};">{profileData.bio}</div>
                {#if `${profileData?.location}` !== "undefined" && profileData?.location.length > 0}
                    <div id="profile-location" style="color: {textClr}; text-shadow: 0px 0px 4px {shadowClr};">Location: {profileData.location}</div>
                {/if}
            </div>

            <div class="header-controls">
                {#if isOwner}
                    <button class="button" on:click={() => openSettings('background')}>Change Background</button>

                    <div class="theme-selector">
                        <label for="theme-select">Theme:</label>
                        <select id="theme-select" bind:value={window.savedTheme} on:change={handleThemeChange}>
                            <option value="default">Default (System)</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="profile-layout-wrapper">
        <div class="section stats-section">
            <h2>User Statistics</h2>
            <div class="profile-content stats-grid">
                <div class="stat-box">
                    <h3>Joined</h3>
                    <p title="{new Date(profileData?.created).toDateString()}" style="text-decoration: underline dotted;">{profileData.created ? timeAgo(profileData.created) : 0}</p>
                </div>

                <div class="stat-box">
                    <h3>Projects</h3>
                    <p>{profileData.projects?.length || 0}</p>
                </div>

                <div class="stat-box">
                    <h3>Forks</h3>
                    <p>{forksCount || 0}</p>
                </div>

                <div class="stat-box">
                    <h3>Posts</h3>
                    <p>{profileData.discussions?.length || 0}</p>
                </div>

                <div class="stat-box">
                    <h3>Likes Received</h3>
                    <p>{likesReceived}</p>
                </div>

                <div class="stat-box">
                    <h3>Forks Received</h3>
                    <p>{forksReceived}</p>
                </div>

                <div class="stat-box">
                    <h3>Average Likes Received</h3>
                    <p>{avgLikes}</p>
                </div>

                <div class="stat-box">
                    <h3>Average Forks Received</h3>
                    <p>{avgForks}</p>
                </div>
            </div>
        </div>

        <div class="split-view">
            <div class="section column-projects">
                <h2>Projects</h2>
                <p>Project Storage Usage: {(profileData.programStorageUse / 1000 / 1000).toFixed(2)} MB of 10 MB</p>
                <div class="profile-content programs-grid">
                    {#if loadedProjects.length > 0}
                        {#each loadedProjects as project (project.id)}
                            <ProjectIcon {...project}/>
                        {/each}
                    {:else}
                        <p>No projects to display.</p>
                    {/if}
                </div>
            </div>

            <div class="section column-discussion">
                <h2>Discussion</h2>
                <div class="profile-content discussion-grid">
                    {#if loadedDiscussions.length > 0}
                        {#each loadedDiscussions as discussion (discussion.id)}
                            <div class="post">
                                <div class="dicussion-body">
                                    <div class="author-wrapper">
                                        <a href="/computer-programming/{discussion.program}" target="_blank" class="post-timestamp">{new Date(discussion.created).toDateString()}</a>
                                    </div>
                                    <div class="content">{discussion.content}</div>
                                    <div class="discussion-stats">
                                        <span><img src="/CDN/images/icons/like.svg" style="transform: translate(0px, 1px) scale(1.25);" alt="like"></span>
                                        <span>{discussion.likeCount}</span>
                                        <span><img src="/CDN/images/icons/like.svg" style="transform: translate(0px, 3px) scale(1.25, -1.25);" alt="dislike"></span>
                                        <span><img src="/CDN/images/icons/report.svg" style="transform: translate(3px, 2px) scale(1.25);" alt="flag"> Report</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <p>No discussion to display.</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

{#if isSettingsOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div id="page-darken" on:click={() => isSettingsOpen = false}></div>
    <div id="profile-settings">
        <h1>
            {#if settingsMode === 'text'}Profile Information
            {:else if settingsMode === 'avatar'}Avatars
            {:else if settingsMode === 'background'}Backgrounds{/if}
        </h1>
        <hr />

        <div id="settings-content">
            {#if settingsMode === 'text'}
                <div class="settings-row">
                    <div class="settings-label">NICKNAME</div>
                    <div class="settings-input-wrapper">
                        <input type="text" bind:value={editNickname}>
                        <div class="settings-hint">This is how your name will appear around Vexcess Academy.</div>
                    </div>
                </div>
                <div class="settings-row">
                    <div class="settings-label">USERNAME</div>
                    <div class="settings-input-wrapper">
                        <input type="text" bind:value={editUsername}>
                        <div class="settings-hint">Your username will appear in your address.<br> http://vxsacademy.org/profile/YOUR_USERNAME</div>
                    </div>
                </div>
                <div class="settings-row">
                    <div class="settings-label">BIO</div>
                    <div class="settings-input-wrapper">
                        <textarea bind:value={editBio} maxlength="160"></textarea>
                        <div class="settings-hint">{160 - editBio.length} characters left</div>
                    </div>
                </div>
                <div class="settings-row">
                    <div class="settings-label">LOCATION</div>
                    <div class="settings-input-wrapper dropdown-wrapper">
                        <input 
                            type="text" 
                            bind:value={locationSearch} 
                            on:focus={() => isLocationDropdownOpen = true}
                            on:input={() => isLocationDropdownOpen = true}
                            on:keydown={handleKeydown}
                            placeholder="Search location..."
                        />
                        {#if isLocationDropdownOpen}
                            <ul class="dropdown-list">
                                {#each filteredLocations as loc, i}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <li 
                                        class:selected={loc === editLocation}
                                        class:highlighted={i === highlightedIndex}
                                        on:mouseenter={() => highlightedIndex = i}
                                        on:click={() => selectLocation(loc)}
                                    >
                                        {loc}
                                    </li>
                                {:else}
                                    <li class="no-match">No matching location</li>
                                {/each}
                            </ul>
                        {/if}
                        <div class="settings-hint">Set to "undefined" to hide the location field on your profile.</div>
                    </div>
                </div>

            {:else if settingsMode === 'avatar'}
                <div class="avatars-grid">
                    {#each Object.entries(avatars) as [key, name]}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="avatar-box {currSelectedImage === key ? 'selected' : ''}" on:click={() => currSelectedImage = key}>
                            <img src="/CDN/images/avatars/{key}.png" height="80" alt="{name}">
                            <br><span>{name}</span>
                        </div>
                    {/each}
                </div>

            {:else if settingsMode === 'background'}
                <div class="backgrounds-grid">
                    {#each Object.entries(backgrounds) as [key, info]}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="background-box {currSelectedImage === key ? 'selected' : ''}" on:click={() => currSelectedImage = key}>
                            <img src="/CDN/images/backgrounds/{key}{key === 'transparent' ? '.png' : '.jpg'}" style="width: 100%;" alt="{info[0]}">
                            <br><span>{info[0]}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <hr />
        <div class="modal-actions">
            <button class="button" on:click={() => isSettingsOpen = false}>Cancel</button>
            <button class="button" on:click={saveSettings}>Save</button>
        </div>
    </div>
{/if}

<style>
    .post {
        display: flex;
        /* width: 60%; */
        margin: auto;
        margin-bottom: 28px;

        .dicussion-body {
            margin-left: 10px;
            width: 70%;
        }
        .author-wrapper {
            display: flex;
            gap: 1em;
            align-items: center;
        }
        /* .avatar-wrapper {
            display: inline-block;
            border: 2px solid gray;
            border-radius: 100px;
            padding: 10px;
            width: 40px;
            vertical-align: middle;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            vertical-align: middle;
        }
        .nickname {
            font-weight: 600;
        } */
        .post-timestamp {
            opacity: 0.8;
        }
        .discussion-stats {
            display: flex;
            gap: 1em;
            overflow: hidden;
        }
        .discussion-stats span {
            display: inline-block;
            margin-top: 8px;
        }
        .content {
            text-align: left;
            margin-bottom: 14px;
        }
    }

    /* Scope wrapper for page limits */
    .profile-layout-wrapper {
        padding: 20px;
        margin: 0 auto;
        box-sizing: border-box;
    }

    .section {
        margin-bottom: 30px;
    }

    /* Stat Box Styling */
    .stats-grid {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    .stat-box {
        background: rgba(0,0,0,0.05);
        padding: 15px;
        border-radius: 8px;
        min-width: 150px;
        text-align: center;
    }
    .stat-box h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: gray;
        text-transform: uppercase;
    }
    .stat-box p {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
    }

    /* Responsive Side-by-Side View */
    .split-view {
        display: flex;
        flex-direction: column; /* Stacks on mobile */
        gap: 20px;
    }

    /* Desktop View */
    @media (min-width: 768px) {
        .split-view {
            flex-direction: row; /* Side-by-side on desktop */
        }
        .column-projects, .column-discussion {
            flex: 1; /* Takes up 50% width each */
        }
    }

    /* Header Controls */
    .header-controls {
        margin-left: auto;
        order: 2;
        opacity: 0.9;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 15px;
    }

    .theme-selector {
        background-color: var(--background, #fff);
        color: var(--text-color, #000);
        padding: 6px;
        border-radius: 4px;
    }

    #background-container {
        background-position: center;
        background-size: cover;
        padding: 10px;
        color: var(--background);
        transition: background-image 0.3s ease;
    }

    #profile-about-container {
        width: 90%;
        margin: auto;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    #profile-about-text-container {
        margin: 0 20px;
        border-radius: 9px;
        padding: 10px;
        transition: background 0.2s;
    }
    #profile-about-text-container:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    #profile-nickname { font-size: 28px; display: block; margin-bottom: 6px; }
    #profile-username { font-size: 16px; color: black; background: rgba(255, 255, 255, 0.8); padding: 4px 6px; border-radius: 100px; }
    #profile-id { font-size: 16px; opacity: 0.8; margin-left: 5px; }
    #profile-bio { font-size: 16px; margin-top: 18px; }
    #profile-location { font-size: 16px; margin-top: 18px; }

    .dropdown-wrapper {
        position: relative;
    }
    .dropdown-list {
        position: absolute;
        top: 38px;
        left: 0;
        right: 0;
        max-height: 180px;
        overflow-y: auto;
        background-color: var(--background, #fff);
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        margin: 0;  
        padding: 0;
        list-style: none;
        z-index: 1002;
    }
    .dropdown-list li {
        padding: 8px 12px;
        cursor: pointer;
        transition: background 0.15s ease;
    }
    .dropdown-list li:hover {
        background-color: rgba(0, 0, 0, 0.08);
    }
    .dropdown-list li.selected {
        font-weight: bold;
        background-color: rgba(13, 146, 63, 0.15);
    }
    .dropdown-list li.no-match {
        color: gray;
        cursor: default;
        font-style: italic;
    }
    .dropdown-list li.highlighted {
        background-color: rgba(13, 146, 63, 0.25);
        outline: none;
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

    .profile-content {
        background-color: var(--background2, #f9f9f9);
        border: 2px solid var(--borders2, #ddd);
        border-radius: 5px;
        padding: 15px;
        min-height: 100px;
    }

    /* Settings Modal Styles */
    #page-darken {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    }

    #profile-settings {
        background-color: var(--background, #fff);
        color: var(--text-color, #000);
        position: fixed;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border: 1px solid var(--border, #ccc);
        border-radius: 10px;
        padding: 20px;
        overflow: auto;
        z-index: 1001;
    }

    .settings-row {
        display: flex;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .settings-label {
        width: 100px;
        padding-top: 8px;
        color: gray;
        font-weight: bold;
    }

    .settings-input-wrapper {
        flex: 1;
        min-width: 200px;
    }

    .settings-input-wrapper input, .settings-input-wrapper textarea {
        width: 100%;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #ccc;
        box-sizing: border-box;
    }
    .settings-hint {
        font-size: 14px;
        color: gray;
        margin-top: 5px;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
    }

    .avatars-grid, .backgrounds-grid {
        display: grid;
        gap: 15px;
        justify-content: center;
    }
    .avatars-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .backgrounds-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }

    .avatar-box, .background-box {
        border-radius: 5px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        padding: 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .avatar-box:hover, .background-box:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    .avatar-box.selected, .background-box.selected {
        border-color: black;
        box-shadow: 0 0 5px rgba(0,0,0,0.2);
    }

    .button {
        background-color: rgb(13, 146, 63);
        border: none;
        border-radius: 4px;
        margin-right: 8px;
        padding: 8px 14px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .button:hover {
        background-color: rgb(10, 130, 50);
        box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.3);
    }
</style>