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
    try {
        final response = request.response;
        final headers = response.headers;

        final remoteResponse = await HTTP.get(Uri.parse(destination));
        final remoteHeaders = remoteResponse.headers;

        response.statusCode = remoteResponse.statusCode;

        for (String header in remoteHeaders.keys) {
            headers.add(header, remoteHeaders[header]!);
        }

        response.add(remoteResponse.bodyBytes);

        await request.response.close();
    } catch (e) {
        request.response.statusCode = 500;
        request.response.write("Internal Server Error");
        await request.response.close();
    }
}

String? getCookie(List<Cookie> cookies, String name) {
    for (Cookie cookie in cookies) {
        if (cookie.name == name) {
            return cookie.value;
        }
    }
    return null;
}