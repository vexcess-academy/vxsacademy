// be careful to write this dart in a "javascripty" way
// this dart gets transpiled to JS using a regex

String validateUsername(dynamic username) {
    if (username is! String) {
        return "username must be a string";
    }
    if (username.length > 32) {
        return "username can't be longer than 32 characters";
    }
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(username)) {
        return "username can only contain letters, numbers, and underscores";
    }
    if (username.length < 3) {
        return "username can't be shorter than 3 characters";
    }
    return "OK";
}

String validatePassword(dynamic password) {
    if (password is! String) {
        return "password must be a string";
    }
    if (password.length > 64) {
        return "password can't be longer than 64 characters";
    }
    return "OK";
}

int estimateStringSz(String str) {
    var bytes = 0;
    for (var i = 0; i < str.length; i++) {
        var value = str.codeUnitAt(i);
        if (value <= 0x007F) {
            bytes += 1;
        } else if (value <= 0x07FF) {
            bytes += 2;
        } else if (value >= 0xD800 && value <= 0xDBFF) {
            // High surrogate: pair encodes to a 4-byte UTF-8 sequence
            bytes += 4;
            i++; // Skip next code unit (low surrogate)
        } else {
            bytes += 3;
        }
    }
    return bytes;
}

String validateFileName(String name) {
    var illegal = "/\\:*?\"<>|\n";

    if (name.length == 0) {
        return "can't be empty";
    } 
    
    // Note: Fixed logic to pass the string 'name' instead of 'name.length'
    if (estimateStringSz(name) >= 256) {
        return "must be less than 256 bytes";
    }

    if (name.startsWith(' ') || name.startsWith('.')) {
        return "can't start with a period or space";
    }

    // Check for any illegal characters
    for (var i = 0; i < illegal.length; i++) {
        if (name.contains(illegal[i])) {
            return "can't contain /\\:*?\"<>| or newline";
        }
    }

    return "OK";
}

String validateProgramData(Map<String, dynamic> data) {
    var e = "error: ";

    // Check basic metadata types
    if (data['files'] is Map &&
        data['width'] is num &&
        data['height'] is num &&
        data['title'] is String) {
        
        // Check if program is a valid type
        var validTypes = ["webpage", "pjs", "python", "glsl", "jitlang", "cpp", "java", "zig", "rust"];
        if (!validTypes.contains(data['type'])) {
            return e + "invalid project type";
        }

        // Validate forks
        if (data.containsKey('parent') && data['parent'] != null && data['parent'] is! String) {
            return e + "invalid parent";
        }

        // Limit size and ensure integers
        var width = data['width'] as num;
        var height = data['height'] as num;

        if (width % 1 != 0 || height % 1 != 0) {
            return e + "project dimensions must be integers";
        }
        if (width < 400 || height < 400) {
            return e + "project dimensions can't be less than 400";
        }
        if (width > 16384 || height > 16384) {
            return e + "project dimensions can't be larger than 16384";
        }

        // Validate thumbnail
        var thumbnail = data['thumbnail'];
        if (thumbnail == null) {
            // do nothing
        } else if (thumbnail is String) {
            // validate thumbnail type (Base64 string)
            var isValidJpg = thumbnail.startsWith("data:image/jpg;base64,") ||
                                thumbnail.startsWith("data:image/jpeg;base64,") ||
                                thumbnail.startsWith("data:image/jfif;base64,");
            if (!isValidJpg) {
                return e + "project thumbnail must be a jpg/jpeg/jfif";
            }
            // validate size (128 KB)
            if (thumbnail.length > 128 * 1024) {
                return e + "project thumbnail is too big; 128 KB allowed";
            }
        } else {
            return e + "project thumbnail is corrupted";
        }

        // validate title (assumes validateFileName is defined elsewhere)
        var checkTitle = validateFileName(data['title']);
        if (checkTitle != "OK") {
            return e + "project title " + checkTitle;
        }

        // 8 files allowed
        var files = data['files'] as Map;
        if (files.keys.length > 8) {
            return e + "project has too many files; 8 allowed";
        }

        var projectSize = 0;
        for (var filename in files.keys) {
            // validate file name
            var checkName = validateFileName(filename);
            if (checkName != "OK") {
                return e + "file name " + checkName;
            }

            // check if file data is valid
            var fileContent = files[filename];
            if (fileContent is! String) {
                return e + "project file data is corrupted";
            }

            // programs can't be bigger than 1 MB
            // (assumes estimateStringSz is defined elsewhere)
            projectSize += estimateStringSz(fileContent);
            if (projectSize > 1024 * 1000) {
                return e + "project is too big; 1 MB allowed";
            }
        }

        return "OK";
    } else {
        return e + "project metadata is corrupted";
    }
}

String validateNickname(dynamic nickname) {
    if (nickname is! String) {
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

String validateBio(dynamic bio) {
    if (bio is! String) {
        return "bio must be a string";
    }
    if (bio.length > 160) {
        return "bio can't be longer than 160 characters";
    }
    return "OK";
}

String validateDiscussion(dynamic data) {
    var e = "error: ";
    if (
        (data["type"] == "Q" || data["type"] == "C") &&
        data["content"] is String &&
        data["program"] is String
    ) {
        return "OK";
    } else {
        return e + "discussion metadata is corrupted";
    }
}