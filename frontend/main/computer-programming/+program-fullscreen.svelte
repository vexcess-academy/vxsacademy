<script>
    import { onMount } from "svelte";

    const sandboxURL =
        window.location.hostname === "vxsacademy.org"
            ? "https://sandbox.vxsacademy.org"
            : "http://127.0.0.1:3001";

    const PROGRAM_ID = window.location.pathname.split("/")[2];

    // https://stackoverflow.com/a/53146790/19194333
    const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;

    function getAllowedDomains(programData) {
        const domains = [];

        for (const fileName in programData.files) {
            if (fileName.endsWith(".html") || fileName.endsWith(".js")) {
                const found = programData.files[fileName].match(urlRegex);
                if (found !== null) {
                    for (let i = 0; i < found.length; i++) {
                        let domName = found[i];
                        domName = domName.replace("http://", "").replace("https://", "");
                        const slashIdx = domName.indexOf("/");
                        if (slashIdx !== -1) {
                            domName = domName.slice(0, slashIdx);
                        }
                        domains.push(domName);
                    }
                }
            }
        }

        if (programData.type === "pjs") {
            if (!domains.includes("*.kastatic.org")) {
                domains.push("*.kastatic.org");
            }
            if (!domains.includes("*.kasandbox.org")) {
                domains.push("*.kasandbox.org");
            }
        }

        return domains;
    }

    function getMainCode(programData) {
        switch (programData.type) {
            case "webpage":
                return programData.files["index.html"];
            case "pjs":
                return programData.files["index.js"];
            case "java":
                return programData.files["Main.java"];
            case "glsl":
                return programData.files["image.glsl"];
            case "c":
                return programData.files["main.c"];
            case "cpp":
                return programData.files["main.cpp"];
            case "python":
                return programData.files["main.py"];
            case "rust":
                return programData.files["main.rs"];
            default:
                return undefined;
        }
    }

    function runProgram(ifrWin, programData) {
        ifrWin.postMessage("ping", "*");

        const mainCode = getMainCode(programData);
        if (mainCode === undefined) return;

        ifrWin.postMessage({
            width: window.innerWidth,
            height: window.innerHeight,
            files: programData.files
        }, "*");
    }

    onMount(async () => {
        const response = await fetch(`/CDN/programs/${PROGRAM_ID}.json`);
        if (!response.ok) return;

        const programData = await response.json();
        const domains = getAllowedDomains(programData);

        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-pointer-lock allow-same-origin allow-scripts allow-popups allow-modals allow-forms");
        iframe.setAttribute("frameborder", "0");
        iframe.style.backgroundColor = "white";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        iframe.addEventListener("load", () => {
            const ifrWin = iframe.contentWindow;
            if (ifrWin) {
                runProgram(ifrWin, programData);
            }
        });

        iframe.src = sandboxURL + "/exec-" + programData.type + ".html?allowed=" + domains.map(btoa).join(",");

        document.getElementById("page-middle-container").replaceChild(iframe, document.getElementById("output-frame-placeholder"));
    });
</script>

<div id="output-frame-placeholder"></div>
