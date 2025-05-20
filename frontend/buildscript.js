// run from vxsacademy/frontend

import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import * as fs from "fs";

async function main() {
    console.log("Building frontend...");

    if (fs.existsSync("main/build")) fs.rmSync("main/build", { recursive: true });
    fs.mkdirSync("main/build", { recursive: true });

    function transverse(go, pageList) {
        fs.readdirSync(go).forEach(item => {
            if (item.includes(".")) {
                if (item.startsWith("+"))
                    pageList.push(`${go}/${item}`);
            } else {
                transverse(`${go}/${item}`, pageList);
            }
        })
        return pageList;
    }

    const pagePaths = transverse("main", []);
    let entryPoints = [];
    await Promise.all(pagePaths.map(pagePath => {
        const pageName = pagePath.split("/").reverse()[0].split(".")[0].slice(1);
        entryPoints.push(`${pageName}.js`);
        return fs.writeFile(`${pageName}.js`, `
            import { mount } from "svelte";
            import App from "./${pagePath}";
            mount(App, { target: document.getElementById("page-middle-container") });
        `, ()=>{});
    }));

    await esbuild.build({
        entryPoints: entryPoints,
        mainFields: ["svelte", "browser", "module", "main"],
        conditions: ["svelte", "browser"],
        bundle: true,
        format: "esm",
        splitting: true,
        outdir: "main/build",
        plugins: [sveltePlugin()],
        logLevel: "info",
        minify: true
    }).catch(() => process.exit(1));

    await Promise.all(pagePaths.map(pagePath => {
        const fileName = pagePath.split("/").reverse()[0].split(".")[0].slice(1) + ".js";
        return fs.unlinkSync(fileName);
    }));
}

main();
