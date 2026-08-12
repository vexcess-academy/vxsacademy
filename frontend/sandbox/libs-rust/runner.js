// Preload rustc.wasm + sysroot bundle (xz-compressed), then compile/run Rust in a Worker.

import { XzReadableStream } from "./vendor/xz-decompress/index.js";

let rustcModule = null;
let bundleBytes = null;
let worker = null;
let workerReady = null;

const BUNDLE_URL = new URL("./libs-rust/rustc/sysroot-wasip1.bundle", import.meta.url).href;
const BUNDLE_XZ = "./libs-rust/rustc/sysroot-wasip1.bundle.xz";
const RUSTC_WASM_XZ = "./libs-rust/rustc/rustc.wasm.xz";
const BUNDLE_CACHE = "minimal-toolchain-v1";

async function fetchCounted(url, onBytes) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${url}: ${resp.status}`);
  const reader = resp.body.getReader();
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      onBytes(value.byteLength);
      controller.enqueue(value);
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  return stream;
}

async function fetchAndDecompress(url, onBytes) {
  const compressed = new Response(await fetchCounted(url, onBytes));
  const decompressed = new Response(new XzReadableStream(compressed.body));
  return new Uint8Array(await decompressed.arrayBuffer());
}

let preloadPromise = null;
window.preloadRust = function (onProgress) {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    let total = 0;
    try {
      const meta = await (await fetch("./libs-rust/rustc/assets-meta.json")).json();
      total = (meta.rustcWasmXz | 0) + (meta.bundleXz | 0);
      if (!total) total = (meta.rustcWasm | 0) + (meta.bundle | 0);
    } catch { /* indeterminate progress */ }
    let received = 0;
    const onBytes = (n) => { received += n; onProgress && onProgress(received, total); };
    onProgress && onProgress(0, total);
    const [bundle, rustcBytes] = await Promise.all([
      fetchAndDecompress(BUNDLE_XZ, onBytes),
      fetchAndDecompress(RUSTC_WASM_XZ, onBytes),
    ]);
    rustcModule = await WebAssembly.compile(rustcBytes);
    try {
      const cache = await caches.open(BUNDLE_CACHE);
      await cache.put(BUNDLE_URL, new Response(bundle));
      bundleBytes = null;
    } catch {
      bundleBytes = bundle;
    }
    await ensureWorker();
  })();
  return preloadPromise;
};

function ensureWorker() {
  if (workerReady) return workerReady;
  workerReady = new Promise((resolve, reject) => {
    worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    const init = { type: "init", module: rustcModule, bundleUrl: BUNDLE_URL };
    if (bundleBytes) init.bundle = bundleBytes.buffer;
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "ready") resolve();
      else if (msg.type === "init-error") reject(new Error(msg.error));
    };
    worker.onerror = (e) => reject(new Error(e.message || "worker error"));
    worker.postMessage(init);
  });
  return workerReady;
}

window.compileAndRun = async function (source, onStatus) {
  if (!rustcModule) {
    onStatus && onStatus("Downloading toolchain...");
    try {
      await window.preloadRust();
    } catch {
      preloadPromise = null;
      workerReady = null;
      worker = null;
      await window.preloadRust();
    }
  } else {
    await ensureWorker();
  }
  return new Promise((resolve) => {
    const handler = (e) => {
      const msg = e.data;
      if (msg.type === "status") {
        onStatus && onStatus(msg.text);
        return;
      }
      if (msg.type === "result") {
        worker.removeEventListener("message", handler);
        resolve(msg.result);
      }
    };
    worker.addEventListener("message", handler);
    worker.postMessage({ type: "run", source });
  });
};
