import 'dart:io';

import '../secrets/secrets.dart';

const HOTRELOAD = false;

void main() async {
    if (secrets.USE_PROXY) {
        final ratholeProcess = await Process.start(
            "./rathole", ["./secrets/client.toml"],
            mode: ProcessStartMode.inheritStdio
        );
    }

    Process.start(
        "bun", "run buildscript.js".split(" "),
        workingDirectory: "./frontend",
        mode: ProcessStartMode.inheritStdio
    );

    final mainServerProcess = await Process.start(
        "dart", "run ${HOTRELOAD ? "-r " : ""}backend/main-server/main.dart".split(" "),
        mode: ProcessStartMode.inheritStdio
    );

    final sandboxServerProcess = await Process.start(
        "dart", "run backend/sandbox-server/main.dart".split(" "),
        mode: ProcessStartMode.inheritStdio
    );

}
