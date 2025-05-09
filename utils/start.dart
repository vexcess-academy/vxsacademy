import 'dart:io';

import '../secrets/secrets.dart';
void main() async {
    if (secrets.USE_PROXY) {
        final ratholeProcess = await Process.start(
            "./rathole", ["client.toml"],
            mode: ProcessStartMode.inheritStdio
        );
    }

    final mainServerProcess = await Process.start(
        "dart", ["run", "backend/main-server/main.dart"],
        mode: ProcessStartMode.inheritStdio
    );

    final sandboxServerProcess = await Process.start(
        "dart", ["run", "backend/sandbox-server/main.dart"],
        mode: ProcessStartMode.inheritStdio
    );

}
