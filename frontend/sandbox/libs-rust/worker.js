// Compile Rust source to WASM with rustc.wasm, then run the result under WASI.

import { Fd, File, Directory, PreopenDirectory, WASI } from "./vendor/browser_wasi_shim/index.js";

let rustcModule = null;
let stdSysroot = null;

function parseBundle(bytes) {
  const magic = new TextDecoder().decode(bytes.subarray(0, 6));
  if (magic !== "RIWB1\n") throw new Error("bad sysroot bundle magic");
  const ilen = new DataView(bytes.buffer, bytes.byteOffset + 6, 4).getUint32(0, true);
  const index = JSON.parse(new TextDecoder().decode(bytes.subarray(10, 10 + ilen)));
  const base = 10 + ilen;
  const files = new Map();
  for (const f of index.files) {
    if (f.p === "manifest.json") continue;
    files.set(f.p, new File(bytes.slice(base + f.o, base + f.o + f.l)));
  }
  return files;
}

function stdSysrootPreopen() {
  const root = new Map();
  const dirFor = (segs) => {
    let m = root;
    for (const seg of segs) {
      if (!m.has(seg)) m.set(seg, new Map());
      m = m.get(seg);
    }
    return m;
  };
  for (const [path, file] of stdSysroot) {
    const segs = path.split("/");
    const name = segs.pop();
    dirFor(segs).set(name, file);
  }
  const toDir = (m) =>
    new Directory([...m.entries()].map(([n, v]) => [n, v instanceof Map ? toDir(v) : v]));
  return new PreopenDirectory("/sysroot", [...root.entries()].map(
    ([n, v]) => [n, v instanceof Map ? toDir(v) : v]));
}

async function initEngine(msg) {
  rustcModule = msg.module;
  let bytes = msg.bundle ? new Uint8Array(msg.bundle) : null;
  if (!bytes && typeof caches !== "undefined") {
    try {
      const hit = await caches.match(msg.bundleUrl);
      if (hit) bytes = new Uint8Array(await hit.arrayBuffer());
    } catch { /* fall through */ }
  }
  if (!bytes) {
    const resp = await fetch(msg.bundleUrl);
    if (!resp.ok) throw new Error(`fetch sysroot bundle: ${resp.status}`);
    bytes = new Uint8Array(await resp.arrayBuffer());
  }
  stdSysroot = parseBundle(bytes);
}

async function runJob(source, status) {
  status("Compiling + linking...");
  const t0 = performance.now();
  let log = "";
  const dec = new TextDecoder();
  const CapErr = class extends Fd {
    fd_write(data) { log += dec.decode(data, { stream: true }); return { ret: 0, nwritten: data.byteLength }; }
  };
  const work = new PreopenDirectory("/work", [["prog.rs", new File(new TextEncoder().encode(source))]]);
  const args = [
    "rustc", "/work/prog.rs", "--sysroot", "/sysroot",
    "-Zunstable-options", "--target", "wasm32-wasip1",
    "--edition", "2024", "-O", "-Cpanic=abort",
    "-o", "/work/prog.wasm",
  ];
  const fds = [new CapErr(), new CapErr(), new CapErr(), new PreopenDirectory("/tmp", []), stdSysrootPreopen(), work];
  const w = new WASI(args, ["CLIF2WASM_OBJECT=1"], fds, { debug: false });
  const inst = await WebAssembly.instantiate(rustcModule, {
    wasi_snapshot_preview1: w.wasiImport,
  });
  let exit = 0;
  try {
    exit = w.start(inst);
  } catch (e) {
    if (!log.trim()) log += e && e.message ? e.message : String(e);
    exit = 1;
  }
  const compileMs = performance.now() - t0;

  const bin = work.dir.contents.get("prog.wasm");
  if (!bin || !bin.data || bin.data.length === 0) {
    return {
      ok: false,
      stdout: "",
      stderr: log.trim() || `rustc exited ${exit} without emitting a program`,
      exit,
      compileMs,
      execMs: 0,
    };
  }

  status("Running...");
  let progOut = "";
  let progErr = "";
  const decOut = new TextDecoder();
  const decErr = new TextDecoder();
  const CapOut = class extends Fd {
    fd_write(data) { progOut += decOut.decode(data, { stream: true }); return { ret: 0, nwritten: data.byteLength }; }
  };
  const CapErrStream = class extends Fd {
    fd_write(data) { progErr += decErr.decode(data, { stream: true }); return { ret: 0, nwritten: data.byteLength }; }
  };
  const t1 = performance.now();
  const pfds = [new CapOut(), new CapOut(), new CapErrStream(), new PreopenDirectory("/sandbox", [])];
  const pw = new WASI(["prog"], [], pfds, { debug: false });
  try {
    const { instance } = await WebAssembly.instantiate(bin.data.slice().buffer, {
      wasi_snapshot_preview1: pw.wasiImport,
    });
    const tRun = performance.now();
    const rc = pw.start(instance);
    const execMs = performance.now() - tRun;
    return {
      ok: rc === 0,
      stdout: progOut.trimEnd(),
      stderr: progErr.trim(),
      exit: rc,
      compileMs,
      execMs,
    };
  } catch (e) {
    return {
      ok: false,
      stdout: progOut.trimEnd(),
      stderr: progErr.trim() || String(e && e.message || e),
      exit: null,
      compileMs,
      execMs: performance.now() - t1,
    };
  }
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    try {
      await initEngine(msg);
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "init-error", error: String(err && err.message || err) });
    }
    return;
  }
  if (msg.type === "run") {
    const status = (text) => self.postMessage({ type: "status", text });
    let result;
    try {
      result = await runJob(msg.source, status);
    } catch (err) {
      result = { ok: false, stdout: "", stderr: "engine error: " + String(err && err.message || err), exit: null, compileMs: 0, execMs: 0 };
    }
    self.postMessage({ type: "result", result });
  }
};
