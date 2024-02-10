$.createComponent("program-element", $.html`
    <div class="program">
        <a href="/computer-programming/\{id}" class="program_title program-link">\{title}</a>
        <a href="/computer-programming/\{id}" class="program_thumbnail-wrapper program-link">
            <img src="" alt="Program Thumbnail" class="program_thumbnail">
        </a>
        <div style="display: flex; padding-top: .4rem;">
            <img src="/CDN/images/language-icons/\{type}.png" height="45">
            <div style="margin-left: .3rem;">
                <div class="program_metadata-wrapper">
                    <span class="program_likes">\{likeCount}</span>
                    <span class="program_likes-title">Likes</span>
                    <span> · </span>
                    <span class="program_forks">\{forks.length}</span>
                    <span class="program_forks-title">Forks</span>
                </div>
                <div class="program_metadata-wrapper">
                    <a class="author-link" href="/profile/id_\{author.id}">\{author.nickname}</a>
                </div>
            </div>
        </div>
    </div>
`, function(program) {
    let loadIcon = loadIconManager.new(200).addClass("program_thumbnail");
    this.$(".program_thumbnail-wrapper program-link")[0].append(loadIcon);
    
    let img = this.$(".program_thumbnail")[0];
    img.dataset.failed = "false";
    img.css("display: none")
        .attr("src", `/CDN/programs/${program.id}.jpg`)
        .on("error", () => {
            if (img.dataset.failed === "false") {
                img.src = "/CDN/images/404_image.jpg";
            }
            img.dataset.failed = "true";
        })
        .on("load", () => {
            loadIconManager.delete(loadIcon);
            img.css("display: inline");
        });
});