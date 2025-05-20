<script>
    import { onMount } from "svelte";

    const { 
        id, 
        title, 
        type, 
        likeCount, 
        forkCount,
        author,
        isKA
    } = $props();

    let programThumbnailWrapper;
    let thumbnailImage;
    let authorLink;

    onMount(() => {
        let loadIcon = loadIconManager.new(200).addClass("program_thumbnail");
        Q$(programThumbnailWrapper).append(loadIcon);
        
        let img = Q$(thumbnailImage);
        img.dataset.failed = "false";
        img.css("display: none");
        if (isKA) {
            img.attr("src", `https://www.khanacademy.org/computer-programming/i/${id.slice(3)}/latest.png`);
            Q$(authorLink).attr("href", "https://www.khanacademy.org/profile/" + author.id);
        } else {
            img.attr("src", `/CDN/programs/${id}.jpg`);
        }
        img.on("error", () => {
            if (img.dataset.failed === "false") {
                img.src = "/CDN/images/404_image.jpg";
            }
            img.dataset.failed = "true";
        }).on("load", () => {
            loadIconManager.delete(loadIcon);
            img.css("display: inline");
        });
    });
    
</script>

<div class="program">
    <a href="/computer-programming/{id}" class="program_title program-link">{title}</a>
    <a bind:this={programThumbnailWrapper} href="/computer-programming/{id}" class="program_thumbnail-wrapper program-link">
        <img bind:this={thumbnailImage} src="" alt="Program Thumbnail" class="program_thumbnail">
    </a>
    <div style="display: flex; padding-top: .4rem;">
        <img src="/CDN/images/language-icons/{type}.png" height="45" alt="language icon">
        <div style="margin-left: .3rem;">
            <div class="program_metadata-wrapper">
                <span class="program_likes">{likeCount}</span>
                <span class="program_likes-title">Likes</span>
                <span> · </span>
                <span class="program_forks">{forkCount}</span>
                <span class="program_forks-title">Forks</span>
            </div>
            <div class="program_metadata-wrapper">
                <a bind:this={authorLink} class="author-link" href="/profile/id_{author.id}">{author.nickname}</a>
            </div>
        </div>
    </div>
</div>

<style>
    .program-link {
        display: block;
        color: var(--text-color);
        text-decoration: none;
    }

    .program {
        border: 2px solid var(--borders);
        border-radius: 6px;
        padding: .5rem;
        background-color: var(--tile-background);
        text-align: center;
        overflow: hidden;
    }

    .program_thumbnail {
        width: 100%;
        height: auto;
        border-radius: .25rem;
    }

    .program_title {
        margin: 0px;
        margin-bottom: 6px;
        color: var(--text-color);
        text-align: center;
        font-family: sans-serif;
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
    }
    
    .program_metadata-wrapper {
        text-align: left;
        padding: 2px;
    }
</style>