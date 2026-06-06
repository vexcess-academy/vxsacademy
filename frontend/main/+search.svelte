<script>
    addEventListener("DOMContentLoaded", () => {
        const $ = Q$;

        const search2 = $("#search2");

        search2.value = decodeURIComponent(window.location.search.split("=").slice(1).join("="));

        search2.on("keyup", e => {
            if (e.code === "Enter") {
                submitSearch(search2.value);
            }
        });
        $("#search-submit2").on("mouseup", e => {
            submitSearch(search2.value);
        });

        $.getJSON(`/API/search?query=${search2.value}`, data => {
                const results = data.results;
                $("#results").text(`Found ${results.length} results in ${(data.time / 1000).toFixed(2)} seconds`);
                const grid = $(".programs-grid")[0];
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (typeof result?.title === "string") {
                        $("program-element", {
                            // note order matters so that type overwrites the default type
                            ...result,
                            type: result.type === "webpage" ? "html" : result.type
                        }).appendTo(grid)
                    } else if (result?.isArticleResult === true) {
                        $("#article-results").append(
                            $("div")
                                .css({
                                    "border": "1px solid black",
                                    "padding": "4px"
                                })
                                .append(
                                    $("a").attr({
                                        href: result.url,
                                        target: "_blank"
                                    }).text(result.url),
                                    $("div").text(result.snippet)
                                )
                        );
                    }
                }
            });
    });
</script>

<h1>Search</h1>
<input id="search2" placeholder="Search" type="text" autocomplete="off">
<button id="search-submit2">Submit</button>

<br><br>
<div id="results"></div>

<h2>Programs</h2>
<div class="programs-grid"></div>

<h2>Articles</h2>
<div id="article-results"></div>

<style>
    :global(#page-middle-container) {
        width: 75%;
        line-height: 1.5em;
        margin: auto;
        margin-top: 60px;
    }
</style>