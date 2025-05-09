import 'dart:typed_data';
import 'dart:convert';
import "package:pointycastle/export.dart";
import 'package:pointycastle/src/platform_check/platform_check.dart'
    show Platform;
import 'utils.dart';

final secureRandom = SecureRandom('Fortuna')
    ..seed(KeyParameter(Platform.instance.platformEntropySource().getBytes(32)));

String SHA256(Object input) {
    final inputBytes = bytesOf(input);
    final digest = SHA256Digest();
    final hashBytes = digest.process(Uint8List.fromList(inputBytes));
    return base64.encode(hashBytes);
}

Uint8List genAESKey() {
    return secureRandom.nextBytes(16); // create 128 bit key
}

const IV_LENGTH = 12;

Uint8List generateAESIV() {
    return secureRandom.nextBytes(IV_LENGTH); // create 96 bit IV
}

Uint8List AESEncrypt(Object plaintext_, Uint8List key) {
    /*
        Use AES GCM block cipher with 128 bit authentication tag

        getOutputSize returns the number of bytes required to encode the message
        and authentication tag as a multiple of the block size (128 bits)

        processBytes and doFinal writes the ciphertext to ciphertext and
        return the number of bytes written.

        ciphertext must be sliced because the bytes written can be smaller
        than the size given by getOutputSize

        The code still works if ciphertext is not a multiple of the block size,
        but there's probably a good reason to not do this. I just don't know
        what the reason it.
    */
    
    final plaintext = bytesOf(plaintext_);
    final Uint8List iv = generateAESIV();
    
    final cipher = GCMBlockCipher(AESEngine());
    final params = AEADParameters(KeyParameter(key), 128, iv, new Uint8List(0));
    cipher.init(true, params);

    final ciphertext = Uint8List(cipher.getOutputSize(plaintext.length));
    var length = cipher.processBytes(plaintext, 0, plaintext.length, ciphertext, 0);
    length += cipher.doFinal(ciphertext, length);

    BytesBuilder combined = new BytesBuilder();
    combined.add(iv);
    combined.add(Uint8List.view(ciphertext.buffer, 0, length));

    return combined.takeBytes();
}

Uint8List? AESDecrypt(Uint8List ciphertext_, Uint8List key) {
    final iv = Uint8List.view(ciphertext_.buffer, 0, IV_LENGTH);
    final ciphertext = Uint8List.view(ciphertext_.buffer, IV_LENGTH);

    final cipher = GCMBlockCipher(AESEngine()); // Use AESEngine instead
    final params = AEADParameters(KeyParameter(key), 128, iv, new Uint8List(0));
    cipher.init(false, params);

    final plaintext = Uint8List(cipher.getOutputSize(ciphertext.length));
    try {
        final length = cipher.processBytes(ciphertext, 0, ciphertext.length, plaintext, 0);
        cipher.doFinal(plaintext, length);
    } on InvalidCipherTextException catch (e) {
        return null;
    }

    return plaintext;
}





