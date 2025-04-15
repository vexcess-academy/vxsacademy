function estimateStringSz(str) {
    var sz = 0;
    for (var i = 0; i < str.length; i++) {
        sz += str.charCodeAt(i) > 255 ? 2 : 1;
    }
    return sz;
}

function validateFileName(name) {
    var illegal = "/\\:*?\"<>|\n";
    if (name.length === 0) { // empty names are not allowed
        return "can't be empty";
    } else if (estimateStringSz(name.length) >= 256) { // names can't be longer than 256 bytes
        return "must be less than 256 bytes";
    }
    if (name[0] === " " || name[0] === ".") { // names can't start with a period or space
        return "can't start with a period or space";
    }
    for (var i = 0; i < illegal.length; i++) {
        if (name.includes(illegal[i])) { // names can't contain illegal characters
            return "can't contain /\\:*?\"<>| or newline";
        }
    }
    return "OK";
}

function validateProgramData(data) {
    let e = "error: ";
    if (
        typeof data.files === "object" &&
        typeof data.width === "number" &&
        typeof data.height === "number" &&
        typeof data.title === "string"
    ) {
        // check if program is a valid type
        if (!["webpage", "pjs", "python", "glsl", "jitlang", "cpp", "java", "zig"].includes(data.type)) {
            return e + "invalid project type";
        }

        // validate forks
        if (data.parent && data.parent !== null && typeof data.parent !== "string") {
            return e + "invalid parent";
        }

        // limit size
        if (data.width % 1 !== 0 || data.height % 1 !== 0) {
            return e + "project dimensions must be integers";
        }
        if (data.width < 400 || data.height < 400) {
            return e + "project dimensions can't be less than 400";
        }
        if (data.width > 16384 || data.height > 16384) {
            return e + "project dimensions can't be larger than 16384";
        }

        if (data.thumbnail === null) {
            // do nothing
        } else if (typeof data.thumbnail === "string") {
            // validate thumbnail type
            if (!(
                data.thumbnail.startsWith("data:image/jpg;base64,") ||
                data.thumbnail.startsWith("data:image/jpeg;base64,") ||
                data.thumbnail.startsWith("data:image/jfif;base64,")
            )) {
                return e + "project thumbnail must be a jpg/jpeg/jfif";
            }
            // validate thumbnail size to 128 KB
            if (data.thumbnail.length > 128 * 1024) {
                return e + "project thumbnail is too big; 128 KB allowed";
            }
        } else if (typeof data.thumbnail === "object") {
            // validate thumbnail type
            if (!(
                data.thumbnail.buffer[0] === 0xFF &&
                data.thumbnail.buffer[1] === 0xD8 &&
                data.thumbnail.buffer[2] === 0xFF
            )) {
                return e + "project thumbnail must be a jpg/jpeg/jfif";
            }
            // validate thumbnail size to 128 KB
            if (data.thumbnail.length > 128 * 1024) {
                return e + "project thumbnail is too big; 128 KB allowed";
            }
        } else {
            return e + "project thumbnail is corrupted";
        }

        // validate title
        var checkTitle = validateFileName(data.title);
        if (checkTitle !== "OK") {
            return e + "project title " + checkTitle;
        }

        // 8 files allowed
        if (Object.keys(data.files).length > 8) {
            return e + "project has too many files; 8 allowed";
        }

        let projectSize = 0;
        for (var filename in data.files) {
            // validate file name
            var checkName = validateFileName(data.title);
            if (checkName !== "OK") {
                return e + "file name " + checkName;
            }

            // check if file data is valid
            var file = data.files[filename];
            if (typeof file !== "string") {
                return e + "project file data is corrupted";
            }

            // programs can't be bigger than 0.5 MB
            projectSize += estimateStringSz(file.length);
            if (projectSize > 1024 * 512) {
                return e + "project is too big; 0.5 MB allowed";
            }
        }

        return "OK";
    } else {
        return e + "project metadata is corrupted";
    }
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

function validateBio(bio) {
    if (typeof bio !== "string") {
        return "bio must be a string";
    }
    if (bio.length > 160) {
        return "bio can't be longer than 160 characters";
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

function validatePassword(password) {
    if (typeof password !== "string") {
        return "password must be a string";
    }
    if (password.length > 64) {
        return "password can't be longer than 64 characters";
    }
    return "OK";
}

function validateDiscussion(data) {
    let e = "error: ";
    if (
        (data.type === "Q" || data.type === "C") &&
        typeof data.content === "string" &&
        typeof data.program === "string"
    ) {
        return "OK";
    } else {
        return e + "discussion metadata is corrupted";
    }
}

if (typeof window === "undefined") {
    module.exports = {
        validateFileName,
        validateProgramData,
        validateNickname,
        validateBio,
        validateUsername,
        validatePassword,
        validateDiscussion
    };
}
