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