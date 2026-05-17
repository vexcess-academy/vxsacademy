import 'dart:io' as IO;
import 'package:http/http.dart' as HTTP;

typedef HttpServer = IO.HttpServer;
typedef SecurityContext = IO.SecurityContext;
typedef InternetAddress = IO.InternetAddress;
typedef HttpRequest = IO.HttpRequest;
typedef HttpResponse = IO.HttpResponse;
typedef HttpStatus = IO.HttpStatus;
typedef Cookie = IO.Cookie;

Future<HttpServer> createServer({
    String? CERT_PATH,
    String? KEY_PATH,
    required int PORT
}) async {
    late HttpServer server;
    if (CERT_PATH == null && KEY_PATH == null) {
        server = await HttpServer.bind(InternetAddress.anyIPv4, PORT);
    } else {
        final securityContext = getServerSecurityContext(CERT_PATH!, KEY_PATH!);
        server = await HttpServer.bindSecure(InternetAddress.anyIPv4, PORT, securityContext);
    }
    return server;
}

SecurityContext getServerSecurityContext(String certificatePath, String privateKeyPath) {
    final securityContext = SecurityContext();
    try {
        securityContext.useCertificateChain(certificatePath);
        securityContext.usePrivateKey(privateKeyPath);
        return securityContext;
    } catch (e) {
        print("Error loading certificates: $e");
        rethrow; // Rethrow to allow the caller to handle the error
    }
}

Future<void> forwardRequest(String destination, HttpRequest request) async {
    final response = request.response;

    if (request.protocolVersion == "1.0") {
        response.statusCode = HttpStatus.upgradeRequired; // 426
        await response.close();
        return;
    }

    final client = HTTP.Client();
    final remoteRequest = HTTP.Request(request.method, Uri.parse(destination));
    
    // copy incoming headers to proxy request
    request.headers.forEach((name, values) {
        remoteRequest.headers[name] = values.join(',');
    });

    final bodyBytes = await request.expand((chunk) => chunk).toList();
    remoteRequest.bodyBytes = bodyBytes;

    final streamedResponse = await client.send(remoteRequest);
    final remoteResponse = await HTTP.Response.fromStream(streamedResponse);

    // copy proxy request headers to outgoing response
    final headers = response.headers;
    remoteResponse.headers.forEach((key, value) {
        headers.set(key, value);
    });

    response.statusCode = remoteResponse.statusCode;
    response.add(remoteResponse.bodyBytes);

    client.close();
    await response.close();
}

String? getCookie(List<Cookie> cookies, String name) {
    for (Cookie cookie in cookies) {
        if (cookie.name == name) {
            return cookie.value;
        }
    }
    return null;
}