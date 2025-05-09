const KAProgramsCache = {};
async function getKAProgram(id) {
    // KA_ + originalProgramId
    if (!KAProgramsCache[id]) {
        let programRes, programJSON;
        try {
            programRes = await fetch("https://www.khanacademy.org/api/internal/graphql/programQuery", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    "x-ka-fkey": "0"
                },
                "body": "{\"operationName\":\"programQuery\",\"query\":\"query programQuery($programId: String!) {\\n  programById(id: $programId) {\\n    byChild\\n    category\\n    created\\n    creatorProfile: author {\\n      id\\n      nickname\\n      profileRoot\\n      profile {\\n        accessLevel\\n        __typename\\n      }\\n      __typename\\n    }\\n    deleted\\n    description\\n    spinoffCount: displayableSpinoffCount\\n    docsUrlPath\\n    flags\\n    flaggedBy: flaggedByKaids\\n    flaggedByUser: isFlaggedByCurrentUser\\n    height\\n    hideFromHotlist\\n    id\\n    imagePath\\n    isProjectOrFork: originIsProject\\n    isOwner\\n    kaid: authorKaid\\n    key\\n    newUrlPath\\n    originScratchpad: originProgram {\\n      deleted\\n      translatedTitle\\n      url\\n      __typename\\n    }\\n    restrictPosting\\n    revision: latestRevision {\\n      id\\n      code\\n      configVersion\\n      created\\n      editorType\\n      folds\\n      __typename\\n    }\\n    slug\\n    sumVotesIncremented\\n    title\\n    topic: parentCurationNode {\\n      id\\n      nodeSlug: slug\\n      relativeUrl\\n      slug\\n      translatedTitle\\n      __typename\\n    }\\n    translatedTitle\\n    url\\n    userAuthoredContentType\\n    upVoted\\n    width\\n    __typename\\n  }\\n}\",\"variables\":{\"programId\":\"" + id.slice(3) + "\"}}",
                "method": "POST"
            });
            programJSON = (await programRes.json()).data.programById;
            
            
        } catch (err) {
            console.error(err);
        }
        
        let programType = null;
        const KAprogramType = programJSON?.userAuthoredContentType;
        switch (KAprogramType) {
            case "WEBPAGE":
                programType = "webpage";
                break;
            case "PJS":
                programType = "pjs";
                break;
            case "PYTHON":
                programType = "python";
                break;
        }
        const profileRoot = programJSON?.creatorProfile?.profileRoot;
        const programCreated = new Date(programJSON?.created).getTime();
        const programUpdated = new Date(programJSON?.revision?.created).getTime();
        const authorUsername = typeof profileRoot === "string" ? profileRoot.split("/")[2] : undefined;
        let programFiles = {};
        switch (programType) {
            case "webpage":
                programFiles["index.html"] = programJSON?.revision?.code ?? "";
                break;
            case "pjs":
                programFiles["index.js"] = programJSON?.revision?.code ?? "";
                break;
            case "python":
                const pyFiles = JSON.parse(programJSON?.revision?.code ?? "{}").files;
                if (Array.isArray(pyFiles)) {
                    for (let i = 0; i < pyFiles.length; i++) {
                        const fileName = pyFiles[i].filename;
                        programFiles[fileName] = pyFiles[i].code;
                    }
                }
                break;
        }
        KAProgramsCache[id] = {
            "id": id,
            "title": programJSON?.title ?? "",
            "type": programType,
            "forks": [
                // {
                //     "id": "osjamxlmp81jfs",
                //     "created": 1695061820584,
                //     "likeCount": 0
                // },
                // {
                //     "id": "5Kjhm6lonohkkn",
                //     "created": 1699322074718,
                //     "likeCount": 0
                // }
            ],
            "created": programCreated,
            "lastSaved": programUpdated,
            "flags": [],
            "width": programType === "webpage" ? 600 : (programJSON?.width ?? 400),
            "height": programJSON?.height ?? 400,
            "author": {
                "username": authorUsername,
                "id": programJSON?.creatorProfile?.id,
                "nickname": programJSON?.creatorProfile?.nickname
            },
            "parent": null,
            "thumbnail": null,
            "files": programFiles,
            "discussions": [
                // "vbEyWelsp8ecx0",
                // "TvM9Bhlsp8h23w",
                // "gOZmUglspjox79"
            ],
            "likeCount": programJSON?.sumVotesIncremented,
            "forkCount": programJSON?.spinoffCount
        };
    }

    return KAProgramsCache[id];
}

class Hotlist {
    calcHotness;
    allPrograms = [];
    hotList = [];
    recentList = [];
    topList = [];

    constructor(config) {
        this.calcHotness = config.calcHotness;
        this.updatePrograms = config.updatePrograms.bind(this);
    }

    updateLists() {
        this.hotList = this.allPrograms.slice();
        this.recentList = this.allPrograms.slice();
        this.topList = this.allPrograms.slice();

        const self = this;
        this.hotList.sort((a, b) => self.calcHotness(b.likeCount + b.forkCount, b.created) - self.calcHotness(a.likeCount + a.forkCount, a.created));
        this.recentList.sort((a, b) => b.created - a.created);
        this.topList.sort((a, b) => b.likeCount - a.likeCount);
    }
}

function initializeLists(db) {
    const kaHotlist = new Hotlist({
        calcHotness(upvotes, uploadedOn) {
            // Constants for the Wilson Score Interval
            const z = 1.96; // 95% confidence interval
            
            // Calculate the fraction of upvotes
            const p = upvotes / (upvotes + 0.1); // Adding 0.1 to avoid division by zero
            
            // Calculate the "score"
            const score =
            (p + (z * z) / (2 * (upvotes + 0.1)) - z * Math.sqrt((p * (0.1 - p) + (z * z) / (4 * (upvotes + 0.1))) / (upvotes + 0.1))) /
            (0.1 + (z * z) / (upvotes + 0.1));
            
            // Calculate the hotness by considering the time elapsed
            const elapsedTime = (Date.now() - uploadedOn) / (1000 * 60 * 60); // Convert milliseconds to hours
            const hotness = score / elapsedTime;
            
            return hotness;
        },
        async updatePrograms() {
            const programs = [];
            this.allPrograms = [];
            
            try {

                async function getList(sortOrder, amt) {
                    let res = await fetch("https://www.khanacademy.org/api/internal/graphql/hotlist", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/json",
                            "x-ka-fkey": "0"
                        },
                        "body": "{\"operationName\":\"hotlist\",\"query\":\"query hotlist($curationNodeId: String, $onlyOfficialProjectSpinoffs: Boolean!, $sort: ListProgramSortOrder, $pageInfo: ListProgramsPageInfo, $userAuthoredContentTypes: [UserAuthoredContentType!]) {\\n  listTopPrograms(\\n    curationNodeId: $curationNodeId\\n    onlyOfficialProjectSpinoffs: $onlyOfficialProjectSpinoffs\\n    sort: $sort\\n    pageInfo: $pageInfo\\n    userAuthoredContentTypes: $userAuthoredContentTypes\\n  ) {\\n    complete\\n    cursor\\n    programs {\\n      id\\n      key\\n      authorKaid\\n      authorNickname\\n      displayableSpinoffCount\\n      imagePath\\n      sumVotesIncremented\\n      translatedTitle: title\\n      url\\n      userAuthoredContentType\\n      __typename\\n    }\\n    __typename\\n  }\\n}\",\"variables\":{\"onlyOfficialProjectSpinoffs\":false,\"curationNodeId\":\"x45aed616\",\"sort\":\"" + sortOrder + "\",\"userAuthoredContentTypes\":[\"PJS\",\"PYTHON\",\"SQL\",\"WEBPAGE\"],\"pageInfo\":{\"itemsPerPage\":" + amt + "}}}",
                        "method": "POST"
                    }).catch(err => {
                        // revisit
                        console.log("network err", err)
                    });
                    if (res) {
                        const json = await res.json();
                        return json?.data?.listTopPrograms?.programs;
                    } else {
                        return undefined;
                    }
                }
                
                const loadAmount = 1;
    
                let reqPrograms = await getList("HOT", loadAmount);
                if (reqPrograms) {
                    for (let i = 0; i < reqPrograms.length; i++) {
                        programs.push(reqPrograms[i]);
                    }
                }
    
                reqPrograms = await getList("RECENT", loadAmount);
                if (reqPrograms) {
                    for (let i = 0; i < reqPrograms.length; i++) {
                        programs.push(reqPrograms[i]);
                    }
                }
                
                reqPrograms = await getList("UPVOTE", loadAmount);
                if (reqPrograms) {
                    for (let i = 0; i < reqPrograms.length; i++) {
                        programs.push(reqPrograms[i]);
                    }
                }        
            } catch (err) {
                console.error(err);
                return null;
            }
            
            for (let i = 0; i < programs.length; i++) {
                const program = programs[i];
                const formattedProgram = await getKAProgram("KA_" + program.id);
                
                this.allPrograms.push({
                    "id": formattedProgram.id,
                    "title": formattedProgram.title,
                    "type": formattedProgram.type,
                    "forks": formattedProgram.forks,
                    "created": formattedProgram.created,
                    "author": {
                        "username": formattedProgram.author.username,
                        "id": formattedProgram.author.id,
                        "nickname": formattedProgram.author.nickname
                    },
                    "likeCount": formattedProgram.likeCount,
                    "forkCount": formattedProgram.forkCount,
                });
            }
        }
    });
    
    const vxsHotlist = new Hotlist({
        calcHotness(upvotes, uploadedOn) {
            // Constants for the Wilson Score Interval
            const z = 1.96; // 95% confidence interval
            
            // Calculate the fraction of upvotes
            const p = upvotes / (upvotes + 1); // Adding 0.1 to avoid division by zero
            
            // Calculate the "score"
            const score =
            (p + (z * z) / (2 * (upvotes + 1)) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * (upvotes + 1))) / (upvotes + 1))) /
            (1 + (z * z) / (upvotes + 1));
            
            // Calculate the hotness by considering the time elapsed
            const elapsedTime = (Date.now() - uploadedOn) / (1000 * 60 * 60); // Convert milliseconds to hours
            const hotness = score / elapsedTime;
            
            return hotness;
        },
        async updatePrograms() {
            this.allPrograms = await db.collection("programs").find({}).project({
                id: 1,
                type: 1,
                title: 1,
                likeCount: 1,
                forkCount: 1,
                created: 1,
                author: 1,
                code: 1,
                _id: 0
            }).toArray();
        }
    });

    return { kaHotlist, vxsHotlist };
}

// let KAAPIHashes = readJSON("./ka-api-hashes.json") ?? null;
// function updateKAAPIHashes() {
//     fetch("https://cdn.jsdelivr.net/gh/bhavjitChauhan/khan-api@safelist/hashes.json")
//         .then(res => res.json())
//         .then(json => {
//             KAAPIHashes = json;
//             fs.writeFileSync("./ka-api-hashes.json", JSON.stringify(json, "", "  "))
//         })
//         .catch(console.log);
// }
// if (KAAPIHashes === null) updateKAAPIHashes();

module.exports = {
    getKAProgram,
    initializeLists
};