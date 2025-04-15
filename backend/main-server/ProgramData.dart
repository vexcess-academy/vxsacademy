import 'dart:typed_data';
import 'dart:convert';

class ProgramDataUserData {
    String id;
    String username;
    String nickname;

    ProgramDataUserData({
        required this.id,
        required this.username,
        required this.nickname,
    });

    String toJSONString() {
        return """{
"id": ${json.encode(id)}
"username": ${json.encode(username)}
"nickname": ${json.encode(nickname)}
}""";
    }
}

class ProgramData {
    String id;
    String title;
    String type;
    List<String> likes;
    List<String> forks;
    int created;
    int lastSaved;
    List<String> flags;
    int width;
    int height;
    List<String> fileNames;
    Map<String, String> files;
    ProgramDataUserData author;
    String? parent;
    Uint8List? thumbnail;
    List<String> discussions;
    int forkCount;
    int likeCount;
    bool hasLiked = false;

    ProgramData({
        required this.id,
        required this.title,
        required this.type,
        required this.likes,
        required this.forks,
        required this.created,
        required this.lastSaved,
        required this.flags,
        required this.width,
        required this.height,
        required this.fileNames,
        required this.files,
        required this.author,
        required this.parent,
        required this.thumbnail,
        required this.discussions,
        required this.forkCount,
        required this.likeCount,
    });

    ProgramData clone() {
        return new ProgramData(
            id: id,
            title: title,
            type: type,
            likes: likes,
            forks: forks,
            created: created,
            lastSaved: lastSaved,
            flags: flags,
            width: width,
            height: height,
            fileNames: fileNames,
            files: files,
            author: author,
            parent: parent,
            thumbnail: thumbnail,
            discussions: discussions,
            forkCount: forkCount,
            likeCount: likeCount,
        );
    }

    String toJSONString() {
        return """{
"id": ${json.encode(id)},
"title": ${json.encode(title)},
"type": ${json.encode(type)},
"likes": ${json.encode(likes)},
"forks": ${json.encode(forks)},
"created": ${json.encode(created)},
"lastSaved": ${json.encode(lastSaved)},
"flags": ${json.encode(flags)},
"width": ${json.encode(width)},
"height": ${json.encode(height)},
"fileNames": ${json.encode(fileNames)},
"files": ${json.encode(files)},
"author": ${author.toJSONString()},
"parent": ${json.encode(parent)},
"thumbnail": ${json.encode(thumbnail)},
"discussions": ${json.encode(discussions)},
"forkCount": ${json.encode(forkCount)},
"likeCount": ${json.encode(likeCount)},
}""";
    }
}