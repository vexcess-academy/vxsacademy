/** Browser ESM re-export — load xz-decompress.js via <script> before runner.js. */
const lib = globalThis["xz-decompress"];
if (!lib?.XzReadableStream) {
  throw new Error("Load vendor/xz-decompress/xz-decompress.js before runner.js");
}
export const { XzReadableStream } = lib;
