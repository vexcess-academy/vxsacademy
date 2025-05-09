import 'dart:convert';
import '../lib/utils.dart';

class UserData {
    late String nickname;
    late String username;
    late String avatar;
    late String password;
    late List<int> tokenAges;
    late List<String> tokens;
    late String id;
    late String bio;
    late int created;
    late List<String> projects;
    late String background;
    late List<String> comments;
    late List<String> discussions;
    late List<String> notifications;
    late int newNotifs;

    UserData({
        required this.nickname,
        required this.username,
        required this.avatar,
        required this.password,
        required this.tokenAges,
        required this.tokens,
        required this.id,
        required this.bio,
        required this.created,
        required this.projects,
        required this.background,
        required this.comments,
        required this.discussions,
        required this.notifications,
        required this.newNotifs,
    });

    static UserData fromMap(Map<String, dynamic> data) {
        return new UserData(
            nickname: data["nickname"],
            username: data["username"],
            avatar: data["avatar"],
            password: data["password"],
            tokenAges: castList<int>(data["tokenAges"]),
            tokens: castList<String>(data["tokens"]),
            id: data["id"],
            bio: data["bio"],
            created: data["created"].toInt(),
            projects: castList<String>(data["projects"]),
            background: data["background"],
            comments: castList<String>(data["comments"]),
            discussions: castList<String>(data["discussions"]),
            notifications: castList<String>(data["notifications"]),
            newNotifs: data["newNotifs"],
        );
    }

    String toJSONString() {
        return json.encode({
            "nickname": nickname,
            "username": username,
            "avatar": avatar,
            "id": id,
            "bio": bio,
            "created": created,
            "projects": projects,
            "background": background,
            "comments": comments,
            "discussions": discussions,
        });
    }
}