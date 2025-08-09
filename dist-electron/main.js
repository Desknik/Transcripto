var ep = Object.defineProperty;
var Il = (t) => {
  throw TypeError(t);
};
var tp = (t, e, r) => e in t ? ep(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var pr = (t, e, r) => tp(t, typeof e != "symbol" ? e + "" : e, r), Ol = (t, e, r) => e.has(t) || Il("Cannot " + r);
var be = (t, e, r) => (Ol(t, e, "read from private field"), r ? r.call(t) : e.get(t)), gn = (t, e, r) => e.has(t) ? Il("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), _n = (t, e, r, n) => (Ol(t, e, "write to private field"), n ? n.call(t, r) : e.set(t, r), r);
import Md, { app as na, BrowserWindow as Ld, ipcMain as Dt, dialog as rp } from "electron";
import { fileURLToPath as np } from "node:url";
import he from "node:path";
import le from "node:fs";
import sn from "node:os";
import Fd from "fluent-ffmpeg";
import Nl from "ffmpeg-static";
import Vd from "fs";
import sp from "path";
import ap from "os";
import op from "crypto";
import Ce from "node:process";
import { promisify as Be, isDeepStrictEqual as ip } from "node:util";
import vn from "node:crypto";
import cp from "node:assert";
function ni(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Xt = { exports: {} };
const lp = "17.2.1", up = {
  version: lp
}, Eo = Vd, sa = sp, dp = ap, fp = op, hp = up, si = hp.version, Al = [
  "🔐 encrypt with Dotenvx: https://dotenvx.com",
  "🔐 prevent committing .env to code: https://dotenvx.com/precommit",
  "🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
  "📡 observe env with Radar: https://dotenvx.com/radar",
  "📡 auto-backup env with Radar: https://dotenvx.com/radar",
  "📡 version env with Radar: https://dotenvx.com/radar",
  "🛠️  run anywhere with `dotenvx run -- yourcommand`",
  "⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
  "⚙️  enable debug logging with { debug: true }",
  "⚙️  override existing env vars with { override: true }",
  "⚙️  suppress all logs with { quiet: true }",
  "⚙️  write to custom object with { processEnv: myObject }",
  "⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
];
function mp() {
  return Al[Math.floor(Math.random() * Al.length)];
}
function Wr(t) {
  return typeof t == "string" ? !["false", "0", "no", "off", ""].includes(t.toLowerCase()) : !!t;
}
function pp() {
  return process.stdout.isTTY;
}
function yp(t) {
  return pp() ? `\x1B[2m${t}\x1B[0m` : t;
}
const $p = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function gp(t) {
  const e = {};
  let r = t.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let n;
  for (; (n = $p.exec(r)) != null; ) {
    const s = n[1];
    let a = n[2] || "";
    a = a.trim();
    const o = a[0];
    a = a.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), o === '"' && (a = a.replace(/\\n/g, `
`), a = a.replace(/\\r/g, "\r")), e[s] = a;
  }
  return e;
}
function _p(t) {
  t = t || {};
  const e = xd(t);
  t.path = e;
  const r = je.configDotenv(t);
  if (!r.parsed) {
    const o = new Error(`MISSING_DATA: Cannot parse ${e} for an unknown reason`);
    throw o.code = "MISSING_DATA", o;
  }
  const n = qd(t).split(","), s = n.length;
  let a;
  for (let o = 0; o < s; o++)
    try {
      const i = n[o].trim(), c = wp(r, i);
      a = je.decrypt(c.ciphertext, c.key);
      break;
    } catch (i) {
      if (o + 1 >= s)
        throw i;
    }
  return je.parse(a);
}
function vp(t) {
  console.error(`[dotenv@${si}][WARN] ${t}`);
}
function Vn(t) {
  console.log(`[dotenv@${si}][DEBUG] ${t}`);
}
function Ud(t) {
  console.log(`[dotenv@${si}] ${t}`);
}
function qd(t) {
  return t && t.DOTENV_KEY && t.DOTENV_KEY.length > 0 ? t.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function wp(t, e) {
  let r;
  try {
    r = new URL(e);
  } catch (i) {
    if (i.code === "ERR_INVALID_URL") {
      const c = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw c.code = "INVALID_DOTENV_KEY", c;
    }
    throw i;
  }
  const n = r.password;
  if (!n) {
    const i = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const s = r.searchParams.get("environment");
  if (!s) {
    const i = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const a = `DOTENV_VAULT_${s.toUpperCase()}`, o = t.parsed[a];
  if (!o) {
    const i = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${a} in your .env.vault file.`);
    throw i.code = "NOT_FOUND_DOTENV_ENVIRONMENT", i;
  }
  return { ciphertext: o, key: n };
}
function xd(t) {
  let e = null;
  if (t && t.path && t.path.length > 0)
    if (Array.isArray(t.path))
      for (const r of t.path)
        Eo.existsSync(r) && (e = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      e = t.path.endsWith(".vault") ? t.path : `${t.path}.vault`;
  else
    e = sa.resolve(process.cwd(), ".env.vault");
  return Eo.existsSync(e) ? e : null;
}
function Tl(t) {
  return t[0] === "~" ? sa.join(dp.homedir(), t.slice(1)) : t;
}
function bp(t) {
  const e = Wr(process.env.DOTENV_CONFIG_DEBUG || t && t.debug), r = Wr(process.env.DOTENV_CONFIG_QUIET || t && t.quiet);
  (e || !r) && Ud("Loading env from encrypted .env.vault");
  const n = je._parseVault(t);
  let s = process.env;
  return t && t.processEnv != null && (s = t.processEnv), je.populate(s, n, t), { parsed: n };
}
function Ep(t) {
  const e = sa.resolve(process.cwd(), ".env");
  let r = "utf8", n = process.env;
  t && t.processEnv != null && (n = t.processEnv);
  let s = Wr(n.DOTENV_CONFIG_DEBUG || t && t.debug), a = Wr(n.DOTENV_CONFIG_QUIET || t && t.quiet);
  t && t.encoding ? r = t.encoding : s && Vn("No encoding is specified. UTF-8 is used by default");
  let o = [e];
  if (t && t.path)
    if (!Array.isArray(t.path))
      o = [Tl(t.path)];
    else {
      o = [];
      for (const l of t.path)
        o.push(Tl(l));
    }
  let i;
  const c = {};
  for (const l of o)
    try {
      const f = je.parse(Eo.readFileSync(l, { encoding: r }));
      je.populate(c, f, t);
    } catch (f) {
      s && Vn(`Failed to load ${l} ${f.message}`), i = f;
    }
  const d = je.populate(n, c, t);
  if (s = Wr(n.DOTENV_CONFIG_DEBUG || s), a = Wr(n.DOTENV_CONFIG_QUIET || a), s || !a) {
    const l = Object.keys(d).length, f = [];
    for (const _ of o)
      try {
        const m = sa.relative(process.cwd(), _);
        f.push(m);
      } catch (m) {
        s && Vn(`Failed to load ${_} ${m.message}`), i = m;
      }
    Ud(`injecting env (${l}) from ${f.join(",")} ${yp(`-- tip: ${mp()}`)}`);
  }
  return i ? { parsed: c, error: i } : { parsed: c };
}
function Sp(t) {
  if (qd(t).length === 0)
    return je.configDotenv(t);
  const e = xd(t);
  return e ? je._configVault(t) : (vp(`You set DOTENV_KEY but you are missing a .env.vault file at ${e}. Did you forget to build it?`), je.configDotenv(t));
}
function Pp(t, e) {
  const r = Buffer.from(e.slice(-64), "hex");
  let n = Buffer.from(t, "base64");
  const s = n.subarray(0, 12), a = n.subarray(-16);
  n = n.subarray(12, -16);
  try {
    const o = fp.createDecipheriv("aes-256-gcm", r, s);
    return o.setAuthTag(a), `${o.update(n)}${o.final()}`;
  } catch (o) {
    const i = o instanceof RangeError, c = o.message === "Invalid key length", d = o.message === "Unsupported state or unable to authenticate data";
    if (i || c) {
      const l = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw l.code = "INVALID_DOTENV_KEY", l;
    } else if (d) {
      const l = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw l.code = "DECRYPTION_FAILED", l;
    } else
      throw o;
  }
}
function Rp(t, e, r = {}) {
  const n = !!(r && r.debug), s = !!(r && r.override), a = {};
  if (typeof e != "object") {
    const o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw o.code = "OBJECT_REQUIRED", o;
  }
  for (const o of Object.keys(e))
    Object.prototype.hasOwnProperty.call(t, o) ? (s === !0 && (t[o] = e[o], a[o] = e[o]), n && Vn(s === !0 ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : (t[o] = e[o], a[o] = e[o]);
  return a;
}
const je = {
  configDotenv: Ep,
  _configVault: bp,
  _parseVault: _p,
  config: Sp,
  decrypt: Pp,
  parse: gp,
  populate: Rp
};
Xt.exports.configDotenv = je.configDotenv;
Xt.exports._configVault = je._configVault;
Xt.exports._parseVault = je._parseVault;
Xt.exports.config = je.config;
Xt.exports.decrypt = je.decrypt;
Xt.exports.parse = je.parse;
Xt.exports.populate = je.populate;
Xt.exports = je;
var Ip = Xt.exports;
const Op = /* @__PURE__ */ ni(Ip), Nr = (t) => {
  const e = typeof t;
  return t !== null && (e === "object" || e === "function");
}, Ja = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Np = new Set("0123456789");
function wa(t) {
  const e = [];
  let r = "", n = "start", s = !1;
  for (const a of t)
    switch (a) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        s && (r += a), n = "property", s = !s;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (Ja.has(r))
          return [];
        e.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (n === "property") {
          if (Ja.has(r))
            return [];
          e.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          e.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !Np.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (Ja.has(r))
        return [];
      e.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      e.push("");
      break;
    }
  }
  return e;
}
function ai(t, e) {
  if (typeof e != "number" && Array.isArray(t)) {
    const r = Number.parseInt(e, 10);
    return Number.isInteger(r) && t[r] === t[e];
  }
  return !1;
}
function zd(t, e) {
  if (ai(t, e))
    throw new Error("Cannot use string index");
}
function Ap(t, e, r) {
  if (!Nr(t) || typeof e != "string")
    return r === void 0 ? t : r;
  const n = wa(e);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (ai(t, a) ? t = s === n.length - 1 ? void 0 : null : t = t[a], t == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return t === void 0 ? r : t;
}
function kl(t, e, r) {
  if (!Nr(t) || typeof e != "string")
    return t;
  const n = t, s = wa(e);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    zd(t, o), a === s.length - 1 ? t[o] = r : Nr(t[o]) || (t[o] = typeof s[a + 1] == "number" ? [] : {}), t = t[o];
  }
  return n;
}
function Tp(t, e) {
  if (!Nr(t) || typeof e != "string")
    return !1;
  const r = wa(e);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (zd(t, s), n === r.length - 1)
      return delete t[s], !0;
    if (t = t[s], !Nr(t))
      return !1;
  }
}
function kp(t, e) {
  if (!Nr(t) || typeof e != "string")
    return !1;
  const r = wa(e);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Nr(t) || !(n in t) || ai(t, n))
      return !1;
    t = t[n];
  }
  return !0;
}
const ir = sn.homedir(), oi = sn.tmpdir(), { env: Jr } = Ce, Cp = (t) => {
  const e = he.join(ir, "Library");
  return {
    data: he.join(e, "Application Support", t),
    config: he.join(e, "Preferences", t),
    cache: he.join(e, "Caches", t),
    log: he.join(e, "Logs", t),
    temp: he.join(oi, t)
  };
}, jp = (t) => {
  const e = Jr.APPDATA || he.join(ir, "AppData", "Roaming"), r = Jr.LOCALAPPDATA || he.join(ir, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: he.join(r, t, "Data"),
    config: he.join(e, t, "Config"),
    cache: he.join(r, t, "Cache"),
    log: he.join(r, t, "Log"),
    temp: he.join(oi, t)
  };
}, Dp = (t) => {
  const e = he.basename(ir);
  return {
    data: he.join(Jr.XDG_DATA_HOME || he.join(ir, ".local", "share"), t),
    config: he.join(Jr.XDG_CONFIG_HOME || he.join(ir, ".config"), t),
    cache: he.join(Jr.XDG_CACHE_HOME || he.join(ir, ".cache"), t),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: he.join(Jr.XDG_STATE_HOME || he.join(ir, ".local", "state"), t),
    temp: he.join(oi, e, t)
  };
};
function Mp(t, { suffix: e = "nodejs" } = {}) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  return e && (t += `-${e}`), Ce.platform === "darwin" ? Cp(t) : Ce.platform === "win32" ? jp(t) : Dp(t);
}
const Yt = (t, e) => function(...n) {
  return t.apply(void 0, n).catch(e);
}, Lt = (t, e) => function(...n) {
  try {
    return t.apply(void 0, n);
  } catch (s) {
    return e(s);
  }
}, Lp = Ce.getuid ? !Ce.getuid() : !1, Fp = 1e4, ot = () => {
}, Ee = {
  /* API */
  isChangeErrorOk: (t) => {
    if (!Ee.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "ENOSYS" || !Lp && (e === "EINVAL" || e === "EPERM");
  },
  isNodeError: (t) => t instanceof Error,
  isRetriableError: (t) => {
    if (!Ee.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "EMFILE" || e === "ENFILE" || e === "EAGAIN" || e === "EBUSY" || e === "EACCESS" || e === "EACCES" || e === "EACCS" || e === "EPERM";
  },
  onChangeError: (t) => {
    if (!Ee.isNodeError(t))
      throw t;
    if (!Ee.isChangeErrorOk(t))
      throw t;
  }
};
class Vp {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Fp, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (e) => {
      this.queueWaiting.add(e), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (e) => {
      this.queueWaiting.delete(e), this.queueActive.delete(e);
    }, this.schedule = () => new Promise((e) => {
      const r = () => this.remove(n), n = () => e(r);
      this.add(n);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const e of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(e), this.queueActive.add(e), e();
        }
      }
    };
  }
}
const Up = new Vp(), Qt = (t, e) => function(n) {
  return function s(...a) {
    return Up.schedule().then((o) => {
      const i = (d) => (o(), d), c = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (e(d)) {
          const l = Math.round(100 * Math.random());
          return new Promise((_) => setTimeout(_, l)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return t.apply(void 0, a).then(i, c);
    });
  };
}, Zt = (t, e) => function(n) {
  return function s(...a) {
    try {
      return t.apply(void 0, a);
    } catch (o) {
      if (Date.now() > n)
        throw o;
      if (e(o))
        return s.apply(void 0, a);
      throw o;
    }
  };
}, Je = {
  attempt: {
    /* ASYNC */
    chmod: Yt(Be(le.chmod), Ee.onChangeError),
    chown: Yt(Be(le.chown), Ee.onChangeError),
    close: Yt(Be(le.close), ot),
    fsync: Yt(Be(le.fsync), ot),
    mkdir: Yt(Be(le.mkdir), ot),
    realpath: Yt(Be(le.realpath), ot),
    stat: Yt(Be(le.stat), ot),
    unlink: Yt(Be(le.unlink), ot),
    /* SYNC */
    chmodSync: Lt(le.chmodSync, Ee.onChangeError),
    chownSync: Lt(le.chownSync, Ee.onChangeError),
    closeSync: Lt(le.closeSync, ot),
    existsSync: Lt(le.existsSync, ot),
    fsyncSync: Lt(le.fsync, ot),
    mkdirSync: Lt(le.mkdirSync, ot),
    realpathSync: Lt(le.realpathSync, ot),
    statSync: Lt(le.statSync, ot),
    unlinkSync: Lt(le.unlinkSync, ot)
  },
  retry: {
    /* ASYNC */
    close: Qt(Be(le.close), Ee.isRetriableError),
    fsync: Qt(Be(le.fsync), Ee.isRetriableError),
    open: Qt(Be(le.open), Ee.isRetriableError),
    readFile: Qt(Be(le.readFile), Ee.isRetriableError),
    rename: Qt(Be(le.rename), Ee.isRetriableError),
    stat: Qt(Be(le.stat), Ee.isRetriableError),
    write: Qt(Be(le.write), Ee.isRetriableError),
    writeFile: Qt(Be(le.writeFile), Ee.isRetriableError),
    /* SYNC */
    closeSync: Zt(le.closeSync, Ee.isRetriableError),
    fsyncSync: Zt(le.fsyncSync, Ee.isRetriableError),
    openSync: Zt(le.openSync, Ee.isRetriableError),
    readFileSync: Zt(le.readFileSync, Ee.isRetriableError),
    renameSync: Zt(le.renameSync, Ee.isRetriableError),
    statSync: Zt(le.statSync, Ee.isRetriableError),
    writeSync: Zt(le.writeSync, Ee.isRetriableError),
    writeFileSync: Zt(le.writeFileSync, Ee.isRetriableError)
  }
}, qp = "utf8", Cl = 438, xp = 511, zp = {}, Kp = sn.userInfo().uid, Gp = sn.userInfo().gid, Bp = 1e3, Hp = !!Ce.getuid;
Ce.getuid && Ce.getuid();
const jl = 128, Wp = (t) => t instanceof Error && "code" in t, Dl = (t) => typeof t == "string", Xa = (t) => t === void 0, Jp = Ce.platform === "linux", Kd = Ce.platform === "win32", ii = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Kd || ii.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Jp && ii.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Xp {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (e) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        e && (Kd && e !== "SIGINT" && e !== "SIGTERM" && e !== "SIGKILL" ? Ce.kill(Ce.pid, "SIGTERM") : Ce.kill(Ce.pid, e));
      }
    }, this.hook = () => {
      Ce.once("exit", () => this.exit());
      for (const e of ii)
        try {
          Ce.once(e, () => this.exit(e));
        } catch {
        }
    }, this.register = (e) => (this.callbacks.add(e), () => {
      this.callbacks.delete(e);
    }), this.hook();
  }
}
const Yp = new Xp(), Qp = Yp.register, Xe = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (t) => {
    const e = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${e}`;
    return `${t}${s}`;
  },
  get: (t, e, r = !0) => {
    const n = Xe.truncate(e(t));
    return n in Xe.store ? Xe.get(t, e, r) : (Xe.store[n] = r, [n, () => delete Xe.store[n]]);
  },
  purge: (t) => {
    Xe.store[t] && (delete Xe.store[t], Je.attempt.unlink(t));
  },
  purgeSync: (t) => {
    Xe.store[t] && (delete Xe.store[t], Je.attempt.unlinkSync(t));
  },
  purgeSyncAll: () => {
    for (const t in Xe.store)
      Xe.purgeSync(t);
  },
  truncate: (t) => {
    const e = he.basename(t);
    if (e.length <= jl)
      return t;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(e);
    if (!r)
      return t;
    const n = e.length - jl;
    return `${t.slice(0, -e.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Qp(Xe.purgeSyncAll);
function Gd(t, e, r = zp) {
  if (Dl(r))
    return Gd(t, e, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Bp) || -1);
  let s = null, a = null, o = null;
  try {
    const i = Je.attempt.realpathSync(t), c = !!i;
    t = i || t, [a, s] = Xe.get(t, r.tmpCreate || Xe.create, r.tmpPurge !== !1);
    const d = Hp && Xa(r.chown), l = Xa(r.mode);
    if (c && (d || l)) {
      const f = Je.attempt.statSync(t);
      f && (r = { ...r }, d && (r.chown = { uid: f.uid, gid: f.gid }), l && (r.mode = f.mode));
    }
    if (!c) {
      const f = he.dirname(t);
      Je.attempt.mkdirSync(f, {
        mode: xp,
        recursive: !0
      });
    }
    o = Je.retry.openSync(n)(a, "w", r.mode || Cl), r.tmpCreated && r.tmpCreated(a), Dl(e) ? Je.retry.writeSync(n)(o, e, 0, r.encoding || qp) : Xa(e) || Je.retry.writeSync(n)(o, e, 0, e.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Je.retry.fsyncSync(n)(o) : Je.attempt.fsync(o)), Je.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== Kp || r.chown.gid !== Gp) && Je.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== Cl && Je.attempt.chmodSync(a, r.mode);
    try {
      Je.retry.renameSync(n)(a, t);
    } catch (f) {
      if (!Wp(f) || f.code !== "ENAMETOOLONG")
        throw f;
      Je.retry.renameSync(n)(a, Xe.truncate(t));
    }
    s(), a = null;
  } finally {
    o && Je.attempt.closeSync(o), a && Xe.purge(a);
  }
}
var So = { exports: {} }, Bd = {}, St = {}, tn = {}, ts = {}, ue = {}, Qn = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
  class e {
  }
  t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends e {
    constructor(w) {
      if (super(), !t.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = r;
  class n extends e {
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((S, R) => `${S}${R}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((S, R) => (R instanceof r && (S[R.str] = (S[R.str] || 0) + 1), S), {});
    }
  }
  t._Code = n, t.nil = new n("");
  function s(p, ...w) {
    const S = [p[0]];
    let R = 0;
    for (; R < w.length; )
      i(S, w[R]), S.push(p[++R]);
    return new n(S);
  }
  t._ = s;
  const a = new n("+");
  function o(p, ...w) {
    const S = [m(p[0])];
    let R = 0;
    for (; R < w.length; )
      S.push(a), i(S, w[R]), S.push(a, m(p[++R]));
    return c(S), new n(S);
  }
  t.str = o;
  function i(p, w) {
    w instanceof n ? p.push(...w._items) : w instanceof r ? p.push(w) : p.push(f(w));
  }
  t.addCodeArg = i;
  function c(p) {
    let w = 1;
    for (; w < p.length - 1; ) {
      if (p[w] === a) {
        const S = d(p[w - 1], p[w + 1]);
        if (S !== void 0) {
          p.splice(w - 1, 3, S);
          continue;
        }
        p[w++] = "+";
      }
      w++;
    }
  }
  function d(p, w) {
    if (w === '""')
      return p;
    if (p === '""')
      return w;
    if (typeof p == "string")
      return w instanceof r || p[p.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${p.slice(0, -1)}${w}"` : w[0] === '"' ? p.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(p instanceof r))
      return `"${p}${w.slice(1)}`;
  }
  function l(p, w) {
    return w.emptyStr() ? p : p.emptyStr() ? w : o`${p}${w}`;
  }
  t.strConcat = l;
  function f(p) {
    return typeof p == "number" || typeof p == "boolean" || p === null ? p : m(Array.isArray(p) ? p.join(",") : p);
  }
  function _(p) {
    return new n(m(p));
  }
  t.stringify = _;
  function m(p) {
    return JSON.stringify(p).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  t.safeStringify = m;
  function g(p) {
    return typeof p == "string" && t.IDENTIFIER.test(p) ? new n(`.${p}`) : s`[${p}]`;
  }
  t.getProperty = g;
  function y(p) {
    if (typeof p == "string" && t.IDENTIFIER.test(p))
      return new n(`${p}`);
    throw new Error(`CodeGen: invalid export name: ${p}, use explicit $id name mapping`);
  }
  t.getEsmExportName = y;
  function $(p) {
    return new n(p.toString());
  }
  t.regexpCode = $;
})(Qn);
var Po = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
  const e = Qn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (t.UsedValueState = n = {})), t.varKinds = {
    const: new e.Name("const"),
    let: new e.Name("let"),
    var: new e.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: l } = {}) {
      this._names = {}, this._prefixes = d, this._parent = l;
    }
    toName(d) {
      return d instanceof e.Name ? d : this.name(d);
    }
    name(d) {
      return new e.Name(this._newName(d));
    }
    _newName(d) {
      const l = this._names[d] || this._nameGroup(d);
      return `${d}${l.index++}`;
    }
    _nameGroup(d) {
      var l, f;
      if (!((f = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || f === void 0) && f.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  t.Scope = s;
  class a extends e.Name {
    constructor(d, l) {
      super(l), this.prefix = d;
    }
    setValue(d, { property: l, itemIndex: f }) {
      this.value = d, this.scopePath = (0, e._)`.${new e.Name(l)}[${f}]`;
    }
  }
  t.ValueScopeName = a;
  const o = (0, e._)`\n`;
  class i extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : e.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, l) {
      var f;
      if (l.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const _ = this.toName(d), { prefix: m } = _, g = (f = l.key) !== null && f !== void 0 ? f : l.ref;
      let y = this._values[m];
      if (y) {
        const w = y.get(g);
        if (w)
          return w;
      } else
        y = this._values[m] = /* @__PURE__ */ new Map();
      y.set(g, _);
      const $ = this._scope[m] || (this._scope[m] = []), p = $.length;
      return $[p] = l.ref, _.setValue(l, { property: m, itemIndex: p }), _;
    }
    getValue(d, l) {
      const f = this._values[d];
      if (f)
        return f.get(l);
    }
    scopeRefs(d, l = this._values) {
      return this._reduceValues(l, (f) => {
        if (f.scopePath === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return (0, e._)`${d}${f.scopePath}`;
      });
    }
    scopeCode(d = this._values, l, f) {
      return this._reduceValues(d, (_) => {
        if (_.value === void 0)
          throw new Error(`CodeGen: name "${_}" has no value`);
        return _.value.code;
      }, l, f);
    }
    _reduceValues(d, l, f = {}, _) {
      let m = e.nil;
      for (const g in d) {
        const y = d[g];
        if (!y)
          continue;
        const $ = f[g] = f[g] || /* @__PURE__ */ new Map();
        y.forEach((p) => {
          if ($.has(p))
            return;
          $.set(p, n.Started);
          let w = l(p);
          if (w) {
            const S = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
            m = (0, e._)`${m}${S} ${p} = ${w};${this.opts._n}`;
          } else if (w = _ == null ? void 0 : _(p))
            m = (0, e._)`${m}${w}${this.opts._n}`;
          else
            throw new r(p);
          $.set(p, n.Completed);
        });
      }
      return m;
    }
  }
  t.ValueScope = i;
})(Po);
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
  const e = Qn, r = Po;
  var n = Qn;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Po;
  Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), t.operators = {
    GT: new e._Code(">"),
    GTE: new e._Code(">="),
    LT: new e._Code("<"),
    LTE: new e._Code("<="),
    EQ: new e._Code("==="),
    NEQ: new e._Code("!=="),
    NOT: new e._Code("!"),
    OR: new e._Code("||"),
    AND: new e._Code("&&"),
    ADD: new e._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(u, h) {
      return this;
    }
  }
  class o extends a {
    constructor(u, h, E) {
      super(), this.varKind = u, this.name = h, this.rhs = E;
    }
    render({ es5: u, _n: h }) {
      const E = u ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${C};` + h;
    }
    optimizeNames(u, h) {
      if (u[this.name.str])
        return this.rhs && (this.rhs = k(this.rhs, u, h)), this;
    }
    get names() {
      return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
    }
  }
  class i extends a {
    constructor(u, h, E) {
      super(), this.lhs = u, this.rhs = h, this.sideEffects = E;
    }
    render({ _n: u }) {
      return `${this.lhs} = ${this.rhs};` + u;
    }
    optimizeNames(u, h) {
      if (!(this.lhs instanceof e.Name && !u[this.lhs.str] && !this.sideEffects))
        return this.rhs = k(this.rhs, u, h), this;
    }
    get names() {
      const u = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
      return ee(u, this.rhs);
    }
  }
  class c extends i {
    constructor(u, h, E, C) {
      super(u, E, C), this.op = h;
    }
    render({ _n: u }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + u;
    }
  }
  class d extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `${this.label}:` + u;
    }
  }
  class l extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `break${this.label ? ` ${this.label}` : ""};` + u;
    }
  }
  class f extends a {
    constructor(u) {
      super(), this.error = u;
    }
    render({ _n: u }) {
      return `throw ${this.error};` + u;
    }
    get names() {
      return this.error.names;
    }
  }
  class _ extends a {
    constructor(u) {
      super(), this.code = u;
    }
    render({ _n: u }) {
      return `${this.code};` + u;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(u, h) {
      return this.code = k(this.code, u, h), this;
    }
    get names() {
      return this.code instanceof e._CodeOrName ? this.code.names : {};
    }
  }
  class m extends a {
    constructor(u = []) {
      super(), this.nodes = u;
    }
    render(u) {
      return this.nodes.reduce((h, E) => h + E.render(u), "");
    }
    optimizeNodes() {
      const { nodes: u } = this;
      let h = u.length;
      for (; h--; ) {
        const E = u[h].optimizeNodes();
        Array.isArray(E) ? u.splice(h, 1, ...E) : E ? u[h] = E : u.splice(h, 1);
      }
      return u.length > 0 ? this : void 0;
    }
    optimizeNames(u, h) {
      const { nodes: E } = this;
      let C = E.length;
      for (; C--; ) {
        const j = E[C];
        j.optimizeNames(u, h) || (M(u, j.names), E.splice(C, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((u, h) => W(u, h.names), {});
    }
  }
  class g extends m {
    render(u) {
      return "{" + u._n + super.render(u) + "}" + u._n;
    }
  }
  class y extends m {
  }
  class $ extends g {
  }
  $.kind = "else";
  class p extends g {
    constructor(u, h) {
      super(h), this.condition = u;
    }
    render(u) {
      let h = `if(${this.condition})` + super.render(u);
      return this.else && (h += "else " + this.else.render(u)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const u = this.condition;
      if (u === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const E = h.optimizeNodes();
        h = this.else = Array.isArray(E) ? new $(E) : E;
      }
      if (h)
        return u === !1 ? h instanceof p ? h : h.nodes : this.nodes.length ? this : new p(B(u), h instanceof p ? [h] : h.nodes);
      if (!(u === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(u, h) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(u, h), !!(super.optimizeNames(u, h) || this.else))
        return this.condition = k(this.condition, u, h), this;
    }
    get names() {
      const u = super.names;
      return ee(u, this.condition), this.else && W(u, this.else.names), u;
    }
  }
  p.kind = "if";
  class w extends g {
  }
  w.kind = "for";
  class S extends w {
    constructor(u) {
      super(), this.iteration = u;
    }
    render(u) {
      return `for(${this.iteration})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iteration = k(this.iteration, u, h), this;
    }
    get names() {
      return W(super.names, this.iteration.names);
    }
  }
  class R extends w {
    constructor(u, h, E, C) {
      super(), this.varKind = u, this.name = h, this.from = E, this.to = C;
    }
    render(u) {
      const h = u.es5 ? r.varKinds.var : this.varKind, { name: E, from: C, to: j } = this;
      return `for(${h} ${E}=${C}; ${E}<${j}; ${E}++)` + super.render(u);
    }
    get names() {
      const u = ee(super.names, this.from);
      return ee(u, this.to);
    }
  }
  class A extends w {
    constructor(u, h, E, C) {
      super(), this.loop = u, this.varKind = h, this.name = E, this.iterable = C;
    }
    render(u) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iterable = k(this.iterable, u, h), this;
    }
    get names() {
      return W(super.names, this.iterable.names);
    }
  }
  class F extends g {
    constructor(u, h, E) {
      super(), this.name = u, this.args = h, this.async = E;
    }
    render(u) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(u);
    }
  }
  F.kind = "func";
  class V extends m {
    render(u) {
      return "return " + super.render(u);
    }
  }
  V.kind = "return";
  class ie extends g {
    render(u) {
      let h = "try" + super.render(u);
      return this.catch && (h += this.catch.render(u)), this.finally && (h += this.finally.render(u)), h;
    }
    optimizeNodes() {
      var u, h;
      return super.optimizeNodes(), (u = this.catch) === null || u === void 0 || u.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(u, h) {
      var E, C;
      return super.optimizeNames(u, h), (E = this.catch) === null || E === void 0 || E.optimizeNames(u, h), (C = this.finally) === null || C === void 0 || C.optimizeNames(u, h), this;
    }
    get names() {
      const u = super.names;
      return this.catch && W(u, this.catch.names), this.finally && W(u, this.finally.names), u;
    }
  }
  class te extends g {
    constructor(u) {
      super(), this.error = u;
    }
    render(u) {
      return `catch(${this.error})` + super.render(u);
    }
  }
  te.kind = "catch";
  class ae extends g {
    render(u) {
      return "finally" + super.render(u);
    }
  }
  ae.kind = "finally";
  class L {
    constructor(u, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = u, this._scope = new r.Scope({ parent: u }), this._nodes = [new y()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(u) {
      return this._scope.name(u);
    }
    // reserves unique name in the external scope
    scopeName(u) {
      return this._extScope.name(u);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(u, h) {
      const E = this._extScope.value(u, h);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(u, h) {
      return this._extScope.getValue(u, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(u) {
      return this._extScope.scopeRefs(u, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(u, h, E, C) {
      const j = this._scope.toName(h);
      return E !== void 0 && C && (this._constants[j.str] = E), this._leafNode(new o(u, j, E)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(u, h, E) {
      return this._def(r.varKinds.const, u, h, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(u, h, E) {
      return this._def(r.varKinds.let, u, h, E);
    }
    // `var` declaration with optional assignment
    var(u, h, E) {
      return this._def(r.varKinds.var, u, h, E);
    }
    // assignment code
    assign(u, h, E) {
      return this._leafNode(new i(u, h, E));
    }
    // `+=` code
    add(u, h) {
      return this._leafNode(new c(u, t.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(u) {
      return typeof u == "function" ? u() : u !== e.nil && this._leafNode(new _(u)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...u) {
      const h = ["{"];
      for (const [E, C] of u)
        h.length > 1 && h.push(","), h.push(E), (E !== C || this.opts.es5) && (h.push(":"), (0, e.addCodeArg)(h, C));
      return h.push("}"), new e._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(u, h, E) {
      if (this._blockNode(new p(u)), h && E)
        this.code(h).else().code(E).endIf();
      else if (h)
        this.code(h).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(u) {
      return this._elseNode(new p(u));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(p, $);
    }
    _for(u, h) {
      return this._blockNode(u), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(u, h) {
      return this._for(new S(u), h);
    }
    // `for` statement for a range of values
    forRange(u, h, E, C, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const J = this._scope.toName(u);
      return this._for(new R(j, J, h, E), () => C(J));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(u, h, E, C = r.varKinds.const) {
      const j = this._scope.toName(u);
      if (this.opts.es5) {
        const J = h instanceof e.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, e._)`${J}.length`, (H) => {
          this.var(j, (0, e._)`${J}[${H}]`), E(j);
        });
      }
      return this._for(new A("of", C, j, h), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(u, h, E, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(u, (0, e._)`Object.keys(${h})`, E);
      const j = this._scope.toName(u);
      return this._for(new A("in", C, j, h), () => E(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(u) {
      return this._leafNode(new d(u));
    }
    // `break` statement
    break(u) {
      return this._leafNode(new l(u));
    }
    // `return` statement
    return(u) {
      const h = new V();
      if (this._blockNode(h), this.code(u), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(V);
    }
    // `try` statement
    try(u, h, E) {
      if (!h && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new ie();
      if (this._blockNode(C), this.code(u), h) {
        const j = this.name("e");
        this._currNode = C.catch = new te(j), h(j);
      }
      return E && (this._currNode = C.finally = new ae(), this.code(E)), this._endBlockNode(te, ae);
    }
    // `throw` statement
    throw(u) {
      return this._leafNode(new f(u));
    }
    // start self-balancing block
    block(u, h) {
      return this._blockStarts.push(this._nodes.length), u && this.code(u).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(u) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - h;
      if (E < 0 || u !== void 0 && E !== u)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${u} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(u, h = e.nil, E, C) {
      return this._blockNode(new F(u, h, E)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(F);
    }
    optimize(u = 1) {
      for (; u-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(u) {
      return this._currNode.nodes.push(u), this;
    }
    _blockNode(u) {
      this._currNode.nodes.push(u), this._nodes.push(u);
    }
    _endBlockNode(u, h) {
      const E = this._currNode;
      if (E instanceof u || h && E instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${u.kind}/${h.kind}` : u.kind}"`);
    }
    _elseNode(u) {
      const h = this._currNode;
      if (!(h instanceof p))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = u, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const u = this._nodes;
      return u[u.length - 1];
    }
    set _currNode(u) {
      const h = this._nodes;
      h[h.length - 1] = u;
    }
  }
  t.CodeGen = L;
  function W(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) + (u[h] || 0);
    return b;
  }
  function ee(b, u) {
    return u instanceof e._CodeOrName ? W(b, u.names) : b;
  }
  function k(b, u, h) {
    if (b instanceof e.Name)
      return E(b);
    if (!C(b))
      return b;
    return new e._Code(b._items.reduce((j, J) => (J instanceof e.Name && (J = E(J)), J instanceof e._Code ? j.push(...J._items) : j.push(J), j), []));
    function E(j) {
      const J = h[j.str];
      return J === void 0 || u[j.str] !== 1 ? j : (delete u[j.str], J);
    }
    function C(j) {
      return j instanceof e._Code && j._items.some((J) => J instanceof e.Name && u[J.str] === 1 && h[J.str] !== void 0);
    }
  }
  function M(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) - (u[h] || 0);
  }
  function B(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, e._)`!${P(b)}`;
  }
  t.not = B;
  const z = v(t.operators.AND);
  function Y(...b) {
    return b.reduce(z);
  }
  t.and = Y;
  const G = v(t.operators.OR);
  function I(...b) {
    return b.reduce(G);
  }
  t.or = I;
  function v(b) {
    return (u, h) => u === e.nil ? h : h === e.nil ? u : (0, e._)`${P(u)} ${b} ${P(h)}`;
  }
  function P(b) {
    return b instanceof e.Name ? b : (0, e._)`(${b})`;
  }
})(ue);
var x = {};
Object.defineProperty(x, "__esModule", { value: !0 });
x.checkStrictMode = x.getErrorPath = x.Type = x.useFunc = x.setEvaluated = x.evaluatedPropsToName = x.mergeEvaluated = x.eachItem = x.unescapeJsonPointer = x.escapeJsonPointer = x.escapeFragment = x.unescapeFragment = x.schemaRefOrVal = x.schemaHasRulesButRef = x.schemaHasRules = x.checkUnknownRules = x.alwaysValidSchema = x.toHash = void 0;
const ge = ue, Zp = Qn;
function ey(t) {
  const e = {};
  for (const r of t)
    e[r] = !0;
  return e;
}
x.toHash = ey;
function ty(t, e) {
  return typeof e == "boolean" ? e : Object.keys(e).length === 0 ? !0 : (Hd(t, e), !Wd(e, t.self.RULES.all));
}
x.alwaysValidSchema = ty;
function Hd(t, e = t.schema) {
  const { opts: r, self: n } = t;
  if (!r.strictSchema || typeof e == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in e)
    s[a] || Yd(t, `unknown keyword: "${a}"`);
}
x.checkUnknownRules = Hd;
function Wd(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e[r])
      return !0;
  return !1;
}
x.schemaHasRules = Wd;
function ry(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (r !== "$ref" && e.all[r])
      return !0;
  return !1;
}
x.schemaHasRulesButRef = ry;
function ny({ topSchemaRef: t, schemaPath: e }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ge._)`${r}`;
  }
  return (0, ge._)`${t}${e}${(0, ge.getProperty)(n)}`;
}
x.schemaRefOrVal = ny;
function sy(t) {
  return Jd(decodeURIComponent(t));
}
x.unescapeFragment = sy;
function ay(t) {
  return encodeURIComponent(ci(t));
}
x.escapeFragment = ay;
function ci(t) {
  return typeof t == "number" ? `${t}` : t.replace(/~/g, "~0").replace(/\//g, "~1");
}
x.escapeJsonPointer = ci;
function Jd(t) {
  return t.replace(/~1/g, "/").replace(/~0/g, "~");
}
x.unescapeJsonPointer = Jd;
function oy(t, e) {
  if (Array.isArray(t))
    for (const r of t)
      e(r);
  else
    e(t);
}
x.eachItem = oy;
function Ml({ mergeNames: t, mergeToName: e, mergeValues: r, resultToName: n }) {
  return (s, a, o, i) => {
    const c = o === void 0 ? a : o instanceof ge.Name ? (a instanceof ge.Name ? t(s, a, o) : e(s, a, o), o) : a instanceof ge.Name ? (e(s, o, a), a) : r(a, o);
    return i === ge.Name && !(c instanceof ge.Name) ? n(s, c) : c;
  };
}
x.mergeEvaluated = {
  props: Ml({
    mergeNames: (t, e, r) => t.if((0, ge._)`${r} !== true && ${e} !== undefined`, () => {
      t.if((0, ge._)`${e} === true`, () => t.assign(r, !0), () => t.assign(r, (0, ge._)`${r} || {}`).code((0, ge._)`Object.assign(${r}, ${e})`));
    }),
    mergeToName: (t, e, r) => t.if((0, ge._)`${r} !== true`, () => {
      e === !0 ? t.assign(r, !0) : (t.assign(r, (0, ge._)`${r} || {}`), li(t, r, e));
    }),
    mergeValues: (t, e) => t === !0 ? !0 : { ...t, ...e },
    resultToName: Xd
  }),
  items: Ml({
    mergeNames: (t, e, r) => t.if((0, ge._)`${r} !== true && ${e} !== undefined`, () => t.assign(r, (0, ge._)`${e} === true ? true : ${r} > ${e} ? ${r} : ${e}`)),
    mergeToName: (t, e, r) => t.if((0, ge._)`${r} !== true`, () => t.assign(r, e === !0 ? !0 : (0, ge._)`${r} > ${e} ? ${r} : ${e}`)),
    mergeValues: (t, e) => t === !0 ? !0 : Math.max(t, e),
    resultToName: (t, e) => t.var("items", e)
  })
};
function Xd(t, e) {
  if (e === !0)
    return t.var("props", !0);
  const r = t.var("props", (0, ge._)`{}`);
  return e !== void 0 && li(t, r, e), r;
}
x.evaluatedPropsToName = Xd;
function li(t, e, r) {
  Object.keys(r).forEach((n) => t.assign((0, ge._)`${e}${(0, ge.getProperty)(n)}`, !0));
}
x.setEvaluated = li;
const Ll = {};
function iy(t, e) {
  return t.scopeValue("func", {
    ref: e,
    code: Ll[e.code] || (Ll[e.code] = new Zp._Code(e.code))
  });
}
x.useFunc = iy;
var Ro;
(function(t) {
  t[t.Num = 0] = "Num", t[t.Str = 1] = "Str";
})(Ro || (x.Type = Ro = {}));
function cy(t, e, r) {
  if (t instanceof ge.Name) {
    const n = e === Ro.Num;
    return r ? n ? (0, ge._)`"[" + ${t} + "]"` : (0, ge._)`"['" + ${t} + "']"` : n ? (0, ge._)`"/" + ${t}` : (0, ge._)`"/" + ${t}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ge.getProperty)(t).toString() : "/" + ci(t);
}
x.getErrorPath = cy;
function Yd(t, e, r = t.opts.strictSchema) {
  if (r) {
    if (e = `strict mode: ${e}`, r === !0)
      throw new Error(e);
    t.self.logger.warn(e);
  }
}
x.checkStrictMode = Yd;
var dt = {};
Object.defineProperty(dt, "__esModule", { value: !0 });
const He = ue, ly = {
  // validation function arguments
  data: new He.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new He.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new He.Name("instancePath"),
  parentData: new He.Name("parentData"),
  parentDataProperty: new He.Name("parentDataProperty"),
  rootData: new He.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new He.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new He.Name("vErrors"),
  // null or array of validation errors
  errors: new He.Name("errors"),
  // counter of validation errors
  this: new He.Name("this"),
  // "globals"
  self: new He.Name("self"),
  scope: new He.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new He.Name("json"),
  jsonPos: new He.Name("jsonPos"),
  jsonLen: new He.Name("jsonLen"),
  jsonPart: new He.Name("jsonPart")
};
dt.default = ly;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
  const e = ue, r = x, n = dt;
  t.keywordError = {
    message: ({ keyword: $ }) => (0, e.str)`must pass "${$}" keyword validation`
  }, t.keyword$DataError = {
    message: ({ keyword: $, schemaType: p }) => p ? (0, e.str)`"${$}" keyword must be ${p} ($data)` : (0, e.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, p = t.keywordError, w, S) {
    const { it: R } = $, { gen: A, compositeRule: F, allErrors: V } = R, ie = f($, p, w);
    S ?? (F || V) ? c(A, ie) : d(R, (0, e._)`[${ie}]`);
  }
  t.reportError = s;
  function a($, p = t.keywordError, w) {
    const { it: S } = $, { gen: R, compositeRule: A, allErrors: F } = S, V = f($, p, w);
    c(R, V), A || F || d(S, n.default.vErrors);
  }
  t.reportExtraError = a;
  function o($, p) {
    $.assign(n.default.errors, p), $.if((0, e._)`${n.default.vErrors} !== null`, () => $.if(p, () => $.assign((0, e._)`${n.default.vErrors}.length`, p), () => $.assign(n.default.vErrors, null)));
  }
  t.resetErrorsCount = o;
  function i({ gen: $, keyword: p, schemaValue: w, data: S, errsCount: R, it: A }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const F = $.name("err");
    $.forRange("i", R, n.default.errors, (V) => {
      $.const(F, (0, e._)`${n.default.vErrors}[${V}]`), $.if((0, e._)`${F}.instancePath === undefined`, () => $.assign((0, e._)`${F}.instancePath`, (0, e.strConcat)(n.default.instancePath, A.errorPath))), $.assign((0, e._)`${F}.schemaPath`, (0, e.str)`${A.errSchemaPath}/${p}`), A.opts.verbose && ($.assign((0, e._)`${F}.schema`, w), $.assign((0, e._)`${F}.data`, S));
    });
  }
  t.extendErrors = i;
  function c($, p) {
    const w = $.const("err", p);
    $.if((0, e._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, e._)`[${w}]`), (0, e._)`${n.default.vErrors}.push(${w})`), $.code((0, e._)`${n.default.errors}++`);
  }
  function d($, p) {
    const { gen: w, validateName: S, schemaEnv: R } = $;
    R.$async ? w.throw((0, e._)`new ${$.ValidationError}(${p})`) : (w.assign((0, e._)`${S}.errors`, p), w.return(!1));
  }
  const l = {
    keyword: new e.Name("keyword"),
    schemaPath: new e.Name("schemaPath"),
    // also used in JTD errors
    params: new e.Name("params"),
    propertyName: new e.Name("propertyName"),
    message: new e.Name("message"),
    schema: new e.Name("schema"),
    parentSchema: new e.Name("parentSchema")
  };
  function f($, p, w) {
    const { createErrors: S } = $.it;
    return S === !1 ? (0, e._)`{}` : _($, p, w);
  }
  function _($, p, w = {}) {
    const { gen: S, it: R } = $, A = [
      m(R, w),
      g($, w)
    ];
    return y($, p, A), S.object(...A);
  }
  function m({ errorPath: $ }, { instancePath: p }) {
    const w = p ? (0, e.str)`${$}${(0, r.getErrorPath)(p, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, w)];
  }
  function g({ keyword: $, it: { errSchemaPath: p } }, { schemaPath: w, parentSchema: S }) {
    let R = S ? p : (0, e.str)`${p}/${$}`;
    return w && (R = (0, e.str)`${R}${(0, r.getErrorPath)(w, r.Type.Str)}`), [l.schemaPath, R];
  }
  function y($, { params: p, message: w }, S) {
    const { keyword: R, data: A, schemaValue: F, it: V } = $, { opts: ie, propertyName: te, topSchemaRef: ae, schemaPath: L } = V;
    S.push([l.keyword, R], [l.params, typeof p == "function" ? p($) : p || (0, e._)`{}`]), ie.messages && S.push([l.message, typeof w == "function" ? w($) : w]), ie.verbose && S.push([l.schema, F], [l.parentSchema, (0, e._)`${ae}${L}`], [n.default.data, A]), te && S.push([l.propertyName, te]);
  }
})(ts);
Object.defineProperty(tn, "__esModule", { value: !0 });
tn.boolOrEmptySchema = tn.topBoolOrEmptySchema = void 0;
const uy = ts, dy = ue, fy = dt, hy = {
  message: "boolean schema is false"
};
function my(t) {
  const { gen: e, schema: r, validateName: n } = t;
  r === !1 ? Qd(t, !1) : typeof r == "object" && r.$async === !0 ? e.return(fy.default.data) : (e.assign((0, dy._)`${n}.errors`, null), e.return(!0));
}
tn.topBoolOrEmptySchema = my;
function py(t, e) {
  const { gen: r, schema: n } = t;
  n === !1 ? (r.var(e, !1), Qd(t)) : r.var(e, !0);
}
tn.boolOrEmptySchema = py;
function Qd(t, e) {
  const { gen: r, data: n } = t, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: t
  };
  (0, uy.reportError)(s, hy, void 0, e);
}
var Te = {}, Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.getRules = Ar.isJSONType = void 0;
const yy = ["string", "number", "integer", "boolean", "null", "object", "array"], $y = new Set(yy);
function gy(t) {
  return typeof t == "string" && $y.has(t);
}
Ar.isJSONType = gy;
function _y() {
  const t = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...t, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, t.number, t.string, t.array, t.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Ar.getRules = _y;
var Bt = {};
Object.defineProperty(Bt, "__esModule", { value: !0 });
Bt.shouldUseRule = Bt.shouldUseGroup = Bt.schemaHasRulesForType = void 0;
function vy({ schema: t, self: e }, r) {
  const n = e.RULES.types[r];
  return n && n !== !0 && Zd(t, n);
}
Bt.schemaHasRulesForType = vy;
function Zd(t, e) {
  return e.rules.some((r) => ef(t, r));
}
Bt.shouldUseGroup = Zd;
function ef(t, e) {
  var r;
  return t[e.keyword] !== void 0 || ((r = e.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => t[n] !== void 0));
}
Bt.shouldUseRule = ef;
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.reportTypeError = Te.checkDataTypes = Te.checkDataType = Te.coerceAndCheckDataType = Te.getJSONTypes = Te.getSchemaTypes = Te.DataType = void 0;
const wy = Ar, by = Bt, Ey = ts, de = ue, tf = x;
var Yr;
(function(t) {
  t[t.Correct = 0] = "Correct", t[t.Wrong = 1] = "Wrong";
})(Yr || (Te.DataType = Yr = {}));
function Sy(t) {
  const e = rf(t.type);
  if (e.includes("null")) {
    if (t.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!e.length && t.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    t.nullable === !0 && e.push("null");
  }
  return e;
}
Te.getSchemaTypes = Sy;
function rf(t) {
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (e.every(wy.isJSONType))
    return e;
  throw new Error("type must be JSONType or JSONType[]: " + e.join(","));
}
Te.getJSONTypes = rf;
function Py(t, e) {
  const { gen: r, data: n, opts: s } = t, a = Ry(e, s.coerceTypes), o = e.length > 0 && !(a.length === 0 && e.length === 1 && (0, by.schemaHasRulesForType)(t, e[0]));
  if (o) {
    const i = ui(e, n, s.strictNumbers, Yr.Wrong);
    r.if(i, () => {
      a.length ? Iy(t, e, a) : di(t);
    });
  }
  return o;
}
Te.coerceAndCheckDataType = Py;
const nf = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Ry(t, e) {
  return e ? t.filter((r) => nf.has(r) || e === "array" && r === "array") : [];
}
function Iy(t, e, r) {
  const { gen: n, data: s, opts: a } = t, o = n.let("dataType", (0, de._)`typeof ${s}`), i = n.let("coerced", (0, de._)`undefined`);
  a.coerceTypes === "array" && n.if((0, de._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, de._)`${s}[0]`).assign(o, (0, de._)`typeof ${s}`).if(ui(e, s, a.strictNumbers), () => n.assign(i, s))), n.if((0, de._)`${i} !== undefined`);
  for (const d of r)
    (nf.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), di(t), n.endIf(), n.if((0, de._)`${i} !== undefined`, () => {
    n.assign(s, i), Oy(t, i);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, de._)`${o} == "number" || ${o} == "boolean"`).assign(i, (0, de._)`"" + ${s}`).elseIf((0, de._)`${s} === null`).assign(i, (0, de._)`""`);
        return;
      case "number":
        n.elseIf((0, de._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(i, (0, de._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, de._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(i, (0, de._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, de._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(i, !1).elseIf((0, de._)`${s} === "true" || ${s} === 1`).assign(i, !0);
        return;
      case "null":
        n.elseIf((0, de._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(i, null);
        return;
      case "array":
        n.elseIf((0, de._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(i, (0, de._)`[${s}]`);
    }
  }
}
function Oy({ gen: t, parentData: e, parentDataProperty: r }, n) {
  t.if((0, de._)`${e} !== undefined`, () => t.assign((0, de._)`${e}[${r}]`, n));
}
function Io(t, e, r, n = Yr.Correct) {
  const s = n === Yr.Correct ? de.operators.EQ : de.operators.NEQ;
  let a;
  switch (t) {
    case "null":
      return (0, de._)`${e} ${s} null`;
    case "array":
      a = (0, de._)`Array.isArray(${e})`;
      break;
    case "object":
      a = (0, de._)`${e} && typeof ${e} == "object" && !Array.isArray(${e})`;
      break;
    case "integer":
      a = o((0, de._)`!(${e} % 1) && !isNaN(${e})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, de._)`typeof ${e} ${s} ${t}`;
  }
  return n === Yr.Correct ? a : (0, de.not)(a);
  function o(i = de.nil) {
    return (0, de.and)((0, de._)`typeof ${e} == "number"`, i, r ? (0, de._)`isFinite(${e})` : de.nil);
  }
}
Te.checkDataType = Io;
function ui(t, e, r, n) {
  if (t.length === 1)
    return Io(t[0], e, r, n);
  let s;
  const a = (0, tf.toHash)(t);
  if (a.array && a.object) {
    const o = (0, de._)`typeof ${e} != "object"`;
    s = a.null ? o : (0, de._)`!${e} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = de.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, de.and)(s, Io(o, e, r, n));
  return s;
}
Te.checkDataTypes = ui;
const Ny = {
  message: ({ schema: t }) => `must be ${t}`,
  params: ({ schema: t, schemaValue: e }) => typeof t == "string" ? (0, de._)`{type: ${t}}` : (0, de._)`{type: ${e}}`
};
function di(t) {
  const e = Ay(t);
  (0, Ey.reportError)(e, Ny);
}
Te.reportTypeError = di;
function Ay(t) {
  const { gen: e, data: r, schema: n } = t, s = (0, tf.schemaRefOrVal)(t, n, "type");
  return {
    gen: e,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: t
  };
}
var ba = {};
Object.defineProperty(ba, "__esModule", { value: !0 });
ba.assignDefaults = void 0;
const jr = ue, Ty = x;
function ky(t, e) {
  const { properties: r, items: n } = t.schema;
  if (e === "object" && r)
    for (const s in r)
      Fl(t, s, r[s].default);
  else e === "array" && Array.isArray(n) && n.forEach((s, a) => Fl(t, a, s.default));
}
ba.assignDefaults = ky;
function Fl(t, e, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = t;
  if (r === void 0)
    return;
  const i = (0, jr._)`${a}${(0, jr.getProperty)(e)}`;
  if (s) {
    (0, Ty.checkStrictMode)(t, `default is ignored for: ${i}`);
    return;
  }
  let c = (0, jr._)`${i} === undefined`;
  o.useDefaults === "empty" && (c = (0, jr._)`${c} || ${i} === null || ${i} === ""`), n.if(c, (0, jr._)`${i} = ${(0, jr.stringify)(r)}`);
}
var kt = {}, pe = {};
Object.defineProperty(pe, "__esModule", { value: !0 });
pe.validateUnion = pe.validateArray = pe.usePattern = pe.callValidateCode = pe.schemaProperties = pe.allSchemaProperties = pe.noPropertyInData = pe.propertyInData = pe.isOwnProperty = pe.hasPropFunc = pe.reportMissingProp = pe.checkMissingProp = pe.checkReportMissingProp = void 0;
const ve = ue, fi = x, er = dt, Cy = x;
function jy(t, e) {
  const { gen: r, data: n, it: s } = t;
  r.if(mi(r, n, e, s.opts.ownProperties), () => {
    t.setParams({ missingProperty: (0, ve._)`${e}` }, !0), t.error();
  });
}
pe.checkReportMissingProp = jy;
function Dy({ gen: t, data: e, it: { opts: r } }, n, s) {
  return (0, ve.or)(...n.map((a) => (0, ve.and)(mi(t, e, a, r.ownProperties), (0, ve._)`${s} = ${a}`)));
}
pe.checkMissingProp = Dy;
function My(t, e) {
  t.setParams({ missingProperty: e }, !0), t.error();
}
pe.reportMissingProp = My;
function sf(t) {
  return t.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ve._)`Object.prototype.hasOwnProperty`
  });
}
pe.hasPropFunc = sf;
function hi(t, e, r) {
  return (0, ve._)`${sf(t)}.call(${e}, ${r})`;
}
pe.isOwnProperty = hi;
function Ly(t, e, r, n) {
  const s = (0, ve._)`${e}${(0, ve.getProperty)(r)} !== undefined`;
  return n ? (0, ve._)`${s} && ${hi(t, e, r)}` : s;
}
pe.propertyInData = Ly;
function mi(t, e, r, n) {
  const s = (0, ve._)`${e}${(0, ve.getProperty)(r)} === undefined`;
  return n ? (0, ve.or)(s, (0, ve.not)(hi(t, e, r))) : s;
}
pe.noPropertyInData = mi;
function af(t) {
  return t ? Object.keys(t).filter((e) => e !== "__proto__") : [];
}
pe.allSchemaProperties = af;
function Fy(t, e) {
  return af(e).filter((r) => !(0, fi.alwaysValidSchema)(t, e[r]));
}
pe.schemaProperties = Fy;
function Vy({ schemaCode: t, data: e, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, i, c, d) {
  const l = d ? (0, ve._)`${t}, ${e}, ${n}${s}` : e, f = [
    [er.default.instancePath, (0, ve.strConcat)(er.default.instancePath, a)],
    [er.default.parentData, o.parentData],
    [er.default.parentDataProperty, o.parentDataProperty],
    [er.default.rootData, er.default.rootData]
  ];
  o.opts.dynamicRef && f.push([er.default.dynamicAnchors, er.default.dynamicAnchors]);
  const _ = (0, ve._)`${l}, ${r.object(...f)}`;
  return c !== ve.nil ? (0, ve._)`${i}.call(${c}, ${_})` : (0, ve._)`${i}(${_})`;
}
pe.callValidateCode = Vy;
const Uy = (0, ve._)`new RegExp`;
function qy({ gen: t, it: { opts: e } }, r) {
  const n = e.unicodeRegExp ? "u" : "", { regExp: s } = e.code, a = s(r, n);
  return t.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ve._)`${s.code === "new RegExp" ? Uy : (0, Cy.useFunc)(t, s)}(${r}, ${n})`
  });
}
pe.usePattern = qy;
function xy(t) {
  const { gen: e, data: r, keyword: n, it: s } = t, a = e.name("valid");
  if (s.allErrors) {
    const i = e.let("valid", !0);
    return o(() => e.assign(i, !1)), i;
  }
  return e.var(a, !0), o(() => e.break()), a;
  function o(i) {
    const c = e.const("len", (0, ve._)`${r}.length`);
    e.forRange("i", 0, c, (d) => {
      t.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: fi.Type.Num
      }, a), e.if((0, ve.not)(a), i);
    });
  }
}
pe.validateArray = xy;
function zy(t) {
  const { gen: e, schema: r, keyword: n, it: s } = t;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, fi.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = e.let("valid", !1), i = e.name("_valid");
  e.block(() => r.forEach((c, d) => {
    const l = t.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, i);
    e.assign(o, (0, ve._)`${o} || ${i}`), t.mergeValidEvaluated(l, i) || e.if((0, ve.not)(o));
  })), t.result(o, () => t.reset(), () => t.error(!0));
}
pe.validateUnion = zy;
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.validateKeywordUsage = kt.validSchemaType = kt.funcKeywordCode = kt.macroKeywordCode = void 0;
const Ze = ue, vr = dt, Ky = pe, Gy = ts;
function By(t, e) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = t, i = e.macro.call(o.self, s, a, o), c = of(r, n, i);
  o.opts.validateSchema !== !1 && o.self.validateSchema(i, !0);
  const d = r.name("valid");
  t.subschema({
    schema: i,
    schemaPath: Ze.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), t.pass(d, () => t.error(!0));
}
kt.macroKeywordCode = By;
function Hy(t, e) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: i, it: c } = t;
  Jy(c, e);
  const d = !i && e.compile ? e.compile.call(c.self, a, o, c) : e.validate, l = of(n, s, d), f = n.let("valid");
  t.block$data(f, _), t.ok((r = e.valid) !== null && r !== void 0 ? r : f);
  function _() {
    if (e.errors === !1)
      y(), e.modifying && Vl(t), $(() => t.error());
    else {
      const p = e.async ? m() : g();
      e.modifying && Vl(t), $(() => Wy(t, p));
    }
  }
  function m() {
    const p = n.let("ruleErrs", null);
    return n.try(() => y((0, Ze._)`await `), (w) => n.assign(f, !1).if((0, Ze._)`${w} instanceof ${c.ValidationError}`, () => n.assign(p, (0, Ze._)`${w}.errors`), () => n.throw(w))), p;
  }
  function g() {
    const p = (0, Ze._)`${l}.errors`;
    return n.assign(p, null), y(Ze.nil), p;
  }
  function y(p = e.async ? (0, Ze._)`await ` : Ze.nil) {
    const w = c.opts.passContext ? vr.default.this : vr.default.self, S = !("compile" in e && !i || e.schema === !1);
    n.assign(f, (0, Ze._)`${p}${(0, Ky.callValidateCode)(t, l, w, S)}`, e.modifying);
  }
  function $(p) {
    var w;
    n.if((0, Ze.not)((w = e.valid) !== null && w !== void 0 ? w : f), p);
  }
}
kt.funcKeywordCode = Hy;
function Vl(t) {
  const { gen: e, data: r, it: n } = t;
  e.if(n.parentData, () => e.assign(r, (0, Ze._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Wy(t, e) {
  const { gen: r } = t;
  r.if((0, Ze._)`Array.isArray(${e})`, () => {
    r.assign(vr.default.vErrors, (0, Ze._)`${vr.default.vErrors} === null ? ${e} : ${vr.default.vErrors}.concat(${e})`).assign(vr.default.errors, (0, Ze._)`${vr.default.vErrors}.length`), (0, Gy.extendErrors)(t);
  }, () => t.error());
}
function Jy({ schemaEnv: t }, e) {
  if (e.async && !t.$async)
    throw new Error("async keyword in sync schema");
}
function of(t, e, r) {
  if (r === void 0)
    throw new Error(`keyword "${e}" failed to compile`);
  return t.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ze.stringify)(r) });
}
function Xy(t, e, r = !1) {
  return !e.length || e.some((n) => n === "array" ? Array.isArray(t) : n === "object" ? t && typeof t == "object" && !Array.isArray(t) : typeof t == n || r && typeof t > "u");
}
kt.validSchemaType = Xy;
function Yy({ schema: t, opts: e, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((i) => !Object.prototype.hasOwnProperty.call(t, i)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(t[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (e.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
kt.validateKeywordUsage = Yy;
var dr = {};
Object.defineProperty(dr, "__esModule", { value: !0 });
dr.extendSubschemaMode = dr.extendSubschemaData = dr.getSubschema = void 0;
const Tt = ue, cf = x;
function Qy(t, { keyword: e, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (e !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (e !== void 0) {
    const i = t.schema[e];
    return r === void 0 ? {
      schema: i,
      schemaPath: (0, Tt._)`${t.schemaPath}${(0, Tt.getProperty)(e)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}`
    } : {
      schema: i[r],
      schemaPath: (0, Tt._)`${t.schemaPath}${(0, Tt.getProperty)(e)}${(0, Tt.getProperty)(r)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}/${(0, cf.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
dr.getSubschema = Qy;
function Zy(t, e, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: i } = e;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: l, opts: f } = e, _ = i.let("data", (0, Tt._)`${e.data}${(0, Tt.getProperty)(r)}`, !0);
    c(_), t.errorPath = (0, Tt.str)`${d}${(0, cf.getErrorPath)(r, n, f.jsPropertySyntax)}`, t.parentDataProperty = (0, Tt._)`${r}`, t.dataPathArr = [...l, t.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof Tt.Name ? s : i.let("data", s, !0);
    c(d), o !== void 0 && (t.propertyName = o);
  }
  a && (t.dataTypes = a);
  function c(d) {
    t.data = d, t.dataLevel = e.dataLevel + 1, t.dataTypes = [], e.definedProperties = /* @__PURE__ */ new Set(), t.parentData = e.data, t.dataNames = [...e.dataNames, d];
  }
}
dr.extendSubschemaData = Zy;
function e$(t, { jtdDiscriminator: e, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (t.compositeRule = n), s !== void 0 && (t.createErrors = s), a !== void 0 && (t.allErrors = a), t.jtdDiscriminator = e, t.jtdMetadata = r;
}
dr.extendSubschemaMode = e$;
var xe = {}, Ea = function t(e, r) {
  if (e === r) return !0;
  if (e && r && typeof e == "object" && typeof r == "object") {
    if (e.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(e)) {
      if (n = e.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!t(e[s], r[s])) return !1;
      return !0;
    }
    if (e.constructor === RegExp) return e.source === r.source && e.flags === r.flags;
    if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === r.valueOf();
    if (e.toString !== Object.prototype.toString) return e.toString() === r.toString();
    if (a = Object.keys(e), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!t(e[o], r[o])) return !1;
    }
    return !0;
  }
  return e !== e && r !== r;
}, lf = { exports: {} }, lr = lf.exports = function(t, e, r) {
  typeof e == "function" && (r = e, e = {}), r = e.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Ls(e, n, s, t, "", t);
};
lr.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
lr.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
lr.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
lr.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Ls(t, e, r, n, s, a, o, i, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    e(n, s, a, o, i, c, d);
    for (var l in n) {
      var f = n[l];
      if (Array.isArray(f)) {
        if (l in lr.arrayKeywords)
          for (var _ = 0; _ < f.length; _++)
            Ls(t, e, r, f[_], s + "/" + l + "/" + _, a, s, l, n, _);
      } else if (l in lr.propsKeywords) {
        if (f && typeof f == "object")
          for (var m in f)
            Ls(t, e, r, f[m], s + "/" + l + "/" + t$(m), a, s, l, n, m);
      } else (l in lr.keywords || t.allKeys && !(l in lr.skipKeywords)) && Ls(t, e, r, f, s + "/" + l, a, s, l, n);
    }
    r(n, s, a, o, i, c, d);
  }
}
function t$(t) {
  return t.replace(/~/g, "~0").replace(/\//g, "~1");
}
var r$ = lf.exports;
Object.defineProperty(xe, "__esModule", { value: !0 });
xe.getSchemaRefs = xe.resolveUrl = xe.normalizeId = xe._getFullPath = xe.getFullPath = xe.inlineRef = void 0;
const n$ = x, s$ = Ea, a$ = r$, o$ = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function i$(t, e = !0) {
  return typeof t == "boolean" ? !0 : e === !0 ? !Oo(t) : e ? uf(t) <= e : !1;
}
xe.inlineRef = i$;
const c$ = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Oo(t) {
  for (const e in t) {
    if (c$.has(e))
      return !0;
    const r = t[e];
    if (Array.isArray(r) && r.some(Oo) || typeof r == "object" && Oo(r))
      return !0;
  }
  return !1;
}
function uf(t) {
  let e = 0;
  for (const r in t) {
    if (r === "$ref")
      return 1 / 0;
    if (e++, !o$.has(r) && (typeof t[r] == "object" && (0, n$.eachItem)(t[r], (n) => e += uf(n)), e === 1 / 0))
      return 1 / 0;
  }
  return e;
}
function df(t, e = "", r) {
  r !== !1 && (e = Qr(e));
  const n = t.parse(e);
  return ff(t, n);
}
xe.getFullPath = df;
function ff(t, e) {
  return t.serialize(e).split("#")[0] + "#";
}
xe._getFullPath = ff;
const l$ = /#\/?$/;
function Qr(t) {
  return t ? t.replace(l$, "") : "";
}
xe.normalizeId = Qr;
function u$(t, e, r) {
  return r = Qr(r), t.resolve(e, r);
}
xe.resolveUrl = u$;
const d$ = /^[a-z_][-a-z0-9._]*$/i;
function f$(t, e) {
  if (typeof t == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Qr(t[r] || e), a = { "": s }, o = df(n, s, !1), i = {}, c = /* @__PURE__ */ new Set();
  return a$(t, { allKeys: !0 }, (f, _, m, g) => {
    if (g === void 0)
      return;
    const y = o + _;
    let $ = a[g];
    typeof f[r] == "string" && ($ = p.call(this, f[r])), w.call(this, f.$anchor), w.call(this, f.$dynamicAnchor), a[_] = $;
    function p(S) {
      const R = this.opts.uriResolver.resolve;
      if (S = Qr($ ? R($, S) : S), c.has(S))
        throw l(S);
      c.add(S);
      let A = this.refs[S];
      return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? d(f, A.schema, S) : S !== Qr(y) && (S[0] === "#" ? (d(f, i[S], S), i[S] = f) : this.refs[S] = y), S;
    }
    function w(S) {
      if (typeof S == "string") {
        if (!d$.test(S))
          throw new Error(`invalid anchor "${S}"`);
        p.call(this, `#${S}`);
      }
    }
  }), i;
  function d(f, _, m) {
    if (_ !== void 0 && !s$(f, _))
      throw l(m);
  }
  function l(f) {
    return new Error(`reference "${f}" resolves to more than one schema`);
  }
}
xe.getSchemaRefs = f$;
Object.defineProperty(St, "__esModule", { value: !0 });
St.getData = St.KeywordCxt = St.validateFunctionCode = void 0;
const hf = tn, Ul = Te, pi = Bt, aa = Te, h$ = ba, Un = kt, Ya = dr, Q = ue, oe = dt, m$ = xe, Ht = x, wn = ts;
function p$(t) {
  if (yf(t) && ($f(t), pf(t))) {
    g$(t);
    return;
  }
  mf(t, () => (0, hf.topBoolOrEmptySchema)(t));
}
St.validateFunctionCode = p$;
function mf({ gen: t, validateName: e, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? t.func(e, (0, Q._)`${oe.default.data}, ${oe.default.valCxt}`, n.$async, () => {
    t.code((0, Q._)`"use strict"; ${ql(r, s)}`), $$(t, s), t.code(a);
  }) : t.func(e, (0, Q._)`${oe.default.data}, ${y$(s)}`, n.$async, () => t.code(ql(r, s)).code(a));
}
function y$(t) {
  return (0, Q._)`{${oe.default.instancePath}="", ${oe.default.parentData}, ${oe.default.parentDataProperty}, ${oe.default.rootData}=${oe.default.data}${t.dynamicRef ? (0, Q._)`, ${oe.default.dynamicAnchors}={}` : Q.nil}}={}`;
}
function $$(t, e) {
  t.if(oe.default.valCxt, () => {
    t.var(oe.default.instancePath, (0, Q._)`${oe.default.valCxt}.${oe.default.instancePath}`), t.var(oe.default.parentData, (0, Q._)`${oe.default.valCxt}.${oe.default.parentData}`), t.var(oe.default.parentDataProperty, (0, Q._)`${oe.default.valCxt}.${oe.default.parentDataProperty}`), t.var(oe.default.rootData, (0, Q._)`${oe.default.valCxt}.${oe.default.rootData}`), e.dynamicRef && t.var(oe.default.dynamicAnchors, (0, Q._)`${oe.default.valCxt}.${oe.default.dynamicAnchors}`);
  }, () => {
    t.var(oe.default.instancePath, (0, Q._)`""`), t.var(oe.default.parentData, (0, Q._)`undefined`), t.var(oe.default.parentDataProperty, (0, Q._)`undefined`), t.var(oe.default.rootData, oe.default.data), e.dynamicRef && t.var(oe.default.dynamicAnchors, (0, Q._)`{}`);
  });
}
function g$(t) {
  const { schema: e, opts: r, gen: n } = t;
  mf(t, () => {
    r.$comment && e.$comment && _f(t), E$(t), n.let(oe.default.vErrors, null), n.let(oe.default.errors, 0), r.unevaluated && _$(t), gf(t), R$(t);
  });
}
function _$(t) {
  const { gen: e, validateName: r } = t;
  t.evaluated = e.const("evaluated", (0, Q._)`${r}.evaluated`), e.if((0, Q._)`${t.evaluated}.dynamicProps`, () => e.assign((0, Q._)`${t.evaluated}.props`, (0, Q._)`undefined`)), e.if((0, Q._)`${t.evaluated}.dynamicItems`, () => e.assign((0, Q._)`${t.evaluated}.items`, (0, Q._)`undefined`));
}
function ql(t, e) {
  const r = typeof t == "object" && t[e.schemaId];
  return r && (e.code.source || e.code.process) ? (0, Q._)`/*# sourceURL=${r} */` : Q.nil;
}
function v$(t, e) {
  if (yf(t) && ($f(t), pf(t))) {
    w$(t, e);
    return;
  }
  (0, hf.boolOrEmptySchema)(t, e);
}
function pf({ schema: t, self: e }) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e.RULES.all[r])
      return !0;
  return !1;
}
function yf(t) {
  return typeof t.schema != "boolean";
}
function w$(t, e) {
  const { schema: r, gen: n, opts: s } = t;
  s.$comment && r.$comment && _f(t), S$(t), P$(t);
  const a = n.const("_errs", oe.default.errors);
  gf(t, a), n.var(e, (0, Q._)`${a} === ${oe.default.errors}`);
}
function $f(t) {
  (0, Ht.checkUnknownRules)(t), b$(t);
}
function gf(t, e) {
  if (t.opts.jtd)
    return xl(t, [], !1, e);
  const r = (0, Ul.getSchemaTypes)(t.schema), n = (0, Ul.coerceAndCheckDataType)(t, r);
  xl(t, r, !n, e);
}
function b$(t) {
  const { schema: e, errSchemaPath: r, opts: n, self: s } = t;
  e.$ref && n.ignoreKeywordsWithRef && (0, Ht.schemaHasRulesButRef)(e, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function E$(t) {
  const { schema: e, opts: r } = t;
  e.default !== void 0 && r.useDefaults && r.strictSchema && (0, Ht.checkStrictMode)(t, "default is ignored in the schema root");
}
function S$(t) {
  const e = t.schema[t.opts.schemaId];
  e && (t.baseId = (0, m$.resolveUrl)(t.opts.uriResolver, t.baseId, e));
}
function P$(t) {
  if (t.schema.$async && !t.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function _f({ gen: t, schemaEnv: e, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    t.code((0, Q._)`${oe.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, Q.str)`${n}/$comment`, i = t.scopeValue("root", { ref: e.root });
    t.code((0, Q._)`${oe.default.self}.opts.$comment(${a}, ${o}, ${i}.schema)`);
  }
}
function R$(t) {
  const { gen: e, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = t;
  r.$async ? e.if((0, Q._)`${oe.default.errors} === 0`, () => e.return(oe.default.data), () => e.throw((0, Q._)`new ${s}(${oe.default.vErrors})`)) : (e.assign((0, Q._)`${n}.errors`, oe.default.vErrors), a.unevaluated && I$(t), e.return((0, Q._)`${oe.default.errors} === 0`));
}
function I$({ gen: t, evaluated: e, props: r, items: n }) {
  r instanceof Q.Name && t.assign((0, Q._)`${e}.props`, r), n instanceof Q.Name && t.assign((0, Q._)`${e}.items`, n);
}
function xl(t, e, r, n) {
  const { gen: s, schema: a, data: o, allErrors: i, opts: c, self: d } = t, { RULES: l } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, Ht.schemaHasRulesButRef)(a, l))) {
    s.block(() => bf(t, "$ref", l.all.$ref.definition));
    return;
  }
  c.jtd || O$(t, e), s.block(() => {
    for (const _ of l.rules)
      f(_);
    f(l.post);
  });
  function f(_) {
    (0, pi.shouldUseGroup)(a, _) && (_.type ? (s.if((0, aa.checkDataType)(_.type, o, c.strictNumbers)), zl(t, _), e.length === 1 && e[0] === _.type && r && (s.else(), (0, aa.reportTypeError)(t)), s.endIf()) : zl(t, _), i || s.if((0, Q._)`${oe.default.errors} === ${n || 0}`));
  }
}
function zl(t, e) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = t;
  s && (0, h$.assignDefaults)(t, e.type), r.block(() => {
    for (const a of e.rules)
      (0, pi.shouldUseRule)(n, a) && bf(t, a.keyword, a.definition, e.type);
  });
}
function O$(t, e) {
  t.schemaEnv.meta || !t.opts.strictTypes || (N$(t, e), t.opts.allowUnionTypes || A$(t, e), T$(t, t.dataTypes));
}
function N$(t, e) {
  if (e.length) {
    if (!t.dataTypes.length) {
      t.dataTypes = e;
      return;
    }
    e.forEach((r) => {
      vf(t.dataTypes, r) || yi(t, `type "${r}" not allowed by context "${t.dataTypes.join(",")}"`);
    }), C$(t, e);
  }
}
function A$(t, e) {
  e.length > 1 && !(e.length === 2 && e.includes("null")) && yi(t, "use allowUnionTypes to allow union type keyword");
}
function T$(t, e) {
  const r = t.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, pi.shouldUseRule)(t.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => k$(e, o)) && yi(t, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function k$(t, e) {
  return t.includes(e) || e === "number" && t.includes("integer");
}
function vf(t, e) {
  return t.includes(e) || e === "integer" && t.includes("number");
}
function C$(t, e) {
  const r = [];
  for (const n of t.dataTypes)
    vf(e, n) ? r.push(n) : e.includes("integer") && n === "number" && r.push("integer");
  t.dataTypes = r;
}
function yi(t, e) {
  const r = t.schemaEnv.baseId + t.errSchemaPath;
  e += ` at "${r}" (strictTypes)`, (0, Ht.checkStrictMode)(t, e, t.opts.strictTypes);
}
class wf {
  constructor(e, r, n) {
    if ((0, Un.validateKeywordUsage)(e, r, n), this.gen = e.gen, this.allErrors = e.allErrors, this.keyword = n, this.data = e.data, this.schema = e.schema[n], this.$data = r.$data && e.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Ht.schemaRefOrVal)(e, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = e.schema, this.params = {}, this.it = e, this.def = r, this.$data)
      this.schemaCode = e.gen.const("vSchema", Ef(this.$data, e));
    else if (this.schemaCode = this.schemaValue, !(0, Un.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = e.gen.const("_errs", oe.default.errors));
  }
  result(e, r, n) {
    this.failResult((0, Q.not)(e), r, n);
  }
  failResult(e, r, n) {
    this.gen.if(e), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(e, r) {
    this.failResult((0, Q.not)(e), void 0, r);
  }
  fail(e) {
    if (e === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(e), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(e) {
    if (!this.$data)
      return this.fail(e);
    const { schemaCode: r } = this;
    this.fail((0, Q._)`${r} !== undefined && (${(0, Q.or)(this.invalid$data(), e)})`);
  }
  error(e, r, n) {
    if (r) {
      this.setParams(r), this._error(e, n), this.setParams({});
      return;
    }
    this._error(e, n);
  }
  _error(e, r) {
    (e ? wn.reportExtraError : wn.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, wn.reportError)(this, this.def.$dataError || wn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, wn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(e) {
    this.allErrors || this.gen.if(e);
  }
  setParams(e, r) {
    r ? Object.assign(this.params, e) : this.params = e;
  }
  block$data(e, r, n = Q.nil) {
    this.gen.block(() => {
      this.check$data(e, n), r();
    });
  }
  check$data(e = Q.nil, r = Q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, Q.or)((0, Q._)`${s} === undefined`, r)), e !== Q.nil && n.assign(e, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), e !== Q.nil && n.assign(e, !1)), n.else();
  }
  invalid$data() {
    const { gen: e, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, Q.or)(o(), i());
    function o() {
      if (n.length) {
        if (!(r instanceof Q.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, Q._)`${(0, aa.checkDataTypes)(c, r, a.opts.strictNumbers, aa.DataType.Wrong)}`;
      }
      return Q.nil;
    }
    function i() {
      if (s.validateSchema) {
        const c = e.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, Q._)`!${c}(${r})`;
      }
      return Q.nil;
    }
  }
  subschema(e, r) {
    const n = (0, Ya.getSubschema)(this.it, e);
    (0, Ya.extendSubschemaData)(n, this.it, e), (0, Ya.extendSubschemaMode)(n, e);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return v$(s, r), s;
  }
  mergeEvaluated(e, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && e.props !== void 0 && (n.props = Ht.mergeEvaluated.props(s, e.props, n.props, r)), n.items !== !0 && e.items !== void 0 && (n.items = Ht.mergeEvaluated.items(s, e.items, n.items, r)));
  }
  mergeValidEvaluated(e, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(e, Q.Name)), !0;
  }
}
St.KeywordCxt = wf;
function bf(t, e, r, n) {
  const s = new wf(t, r, e);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Un.funcKeywordCode)(s, r) : "macro" in r ? (0, Un.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Un.funcKeywordCode)(s, r);
}
const j$ = /^\/(?:[^~]|~0|~1)*$/, D$ = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Ef(t, { dataLevel: e, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (t === "")
    return oe.default.rootData;
  if (t[0] === "/") {
    if (!j$.test(t))
      throw new Error(`Invalid JSON-pointer: ${t}`);
    s = t, a = oe.default.rootData;
  } else {
    const d = D$.exec(t);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${t}`);
    const l = +d[1];
    if (s = d[2], s === "#") {
      if (l >= e)
        throw new Error(c("property/index", l));
      return n[e - l];
    }
    if (l > e)
      throw new Error(c("data", l));
    if (a = r[e - l], !s)
      return a;
  }
  let o = a;
  const i = s.split("/");
  for (const d of i)
    d && (a = (0, Q._)`${a}${(0, Q.getProperty)((0, Ht.unescapeJsonPointer)(d))}`, o = (0, Q._)`${o} && ${a}`);
  return o;
  function c(d, l) {
    return `Cannot access ${d} ${l} levels up, current level is ${e}`;
  }
}
St.getData = Ef;
var us = {}, Kl;
function $i() {
  if (Kl) return us;
  Kl = 1, Object.defineProperty(us, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return us.default = t, us;
}
var an = {};
Object.defineProperty(an, "__esModule", { value: !0 });
const Qa = xe;
let M$ = class extends Error {
  constructor(e, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Qa.resolveUrl)(e, r, n), this.missingSchema = (0, Qa.normalizeId)((0, Qa.getFullPath)(e, this.missingRef));
  }
};
an.default = M$;
var et = {};
Object.defineProperty(et, "__esModule", { value: !0 });
et.resolveSchema = et.getCompilingSchema = et.resolveRef = et.compileSchema = et.SchemaEnv = void 0;
const yt = ue, L$ = $i(), yr = dt, bt = xe, Gl = x, F$ = St;
let Sa = class {
  constructor(e) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof e.schema == "object" && (n = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = (r = e.baseId) !== null && r !== void 0 ? r : (0, bt.normalizeId)(n == null ? void 0 : n[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
et.SchemaEnv = Sa;
function gi(t) {
  const e = Sf.call(this, t);
  if (e)
    return e;
  const r = (0, bt.getFullPath)(this.opts.uriResolver, t.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new yt.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let i;
  t.$async && (i = o.scopeValue("Error", {
    ref: L$.default,
    code: (0, yt._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  t.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: yr.default.data,
    parentData: yr.default.parentData,
    parentDataProperty: yr.default.parentDataProperty,
    dataNames: [yr.default.data],
    dataPathArr: [yt.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: t.schema, code: (0, yt.stringify)(t.schema) } : { ref: t.schema }),
    validateName: c,
    ValidationError: i,
    schema: t.schema,
    schemaEnv: t,
    rootId: r,
    baseId: t.baseId || r,
    schemaPath: yt.nil,
    errSchemaPath: t.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, yt._)`""`,
    opts: this.opts,
    self: this
  };
  let l;
  try {
    this._compilations.add(t), (0, F$.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const f = o.toString();
    l = `${o.scopeRefs(yr.default.scope)}return ${f}`, this.opts.code.process && (l = this.opts.code.process(l, t));
    const m = new Function(`${yr.default.self}`, `${yr.default.scope}`, l)(this, this.scope.get());
    if (this.scope.value(c, { ref: m }), m.errors = null, m.schema = t.schema, m.schemaEnv = t, t.$async && (m.$async = !0), this.opts.code.source === !0 && (m.source = { validateName: c, validateCode: f, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: g, items: y } = d;
      m.evaluated = {
        props: g instanceof yt.Name ? void 0 : g,
        items: y instanceof yt.Name ? void 0 : y,
        dynamicProps: g instanceof yt.Name,
        dynamicItems: y instanceof yt.Name
      }, m.source && (m.source.evaluated = (0, yt.stringify)(m.evaluated));
    }
    return t.validate = m, t;
  } catch (f) {
    throw delete t.validate, delete t.validateName, l && this.logger.error("Error compiling schema, function code:", l), f;
  } finally {
    this._compilations.delete(t);
  }
}
et.compileSchema = gi;
function V$(t, e, r) {
  var n;
  r = (0, bt.resolveUrl)(this.opts.uriResolver, e, r);
  const s = t.refs[r];
  if (s)
    return s;
  let a = x$.call(this, t, r);
  if (a === void 0) {
    const o = (n = t.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: i } = this.opts;
    o && (a = new Sa({ schema: o, schemaId: i, root: t, baseId: e }));
  }
  if (a !== void 0)
    return t.refs[r] = U$.call(this, a);
}
et.resolveRef = V$;
function U$(t) {
  return (0, bt.inlineRef)(t.schema, this.opts.inlineRefs) ? t.schema : t.validate ? t : gi.call(this, t);
}
function Sf(t) {
  for (const e of this._compilations)
    if (q$(e, t))
      return e;
}
et.getCompilingSchema = Sf;
function q$(t, e) {
  return t.schema === e.schema && t.root === e.root && t.baseId === e.baseId;
}
function x$(t, e) {
  let r;
  for (; typeof (r = this.refs[e]) == "string"; )
    e = r;
  return r || this.schemas[e] || Pa.call(this, t, e);
}
function Pa(t, e) {
  const r = this.opts.uriResolver.parse(e), n = (0, bt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, bt.getFullPath)(this.opts.uriResolver, t.baseId, void 0);
  if (Object.keys(t.schema).length > 0 && n === s)
    return Za.call(this, r, t);
  const a = (0, bt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const i = Pa.call(this, t, o);
    return typeof (i == null ? void 0 : i.schema) != "object" ? void 0 : Za.call(this, r, i);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || gi.call(this, o), a === (0, bt.normalizeId)(e)) {
      const { schema: i } = o, { schemaId: c } = this.opts, d = i[c];
      return d && (s = (0, bt.resolveUrl)(this.opts.uriResolver, s, d)), new Sa({ schema: i, schemaId: c, root: t, baseId: s });
    }
    return Za.call(this, r, o);
  }
}
et.resolveSchema = Pa;
const z$ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Za(t, { baseId: e, schema: r, root: n }) {
  var s;
  if (((s = t.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const i of t.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Gl.unescapeFragment)(i)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !z$.has(i) && d && (e = (0, bt.resolveUrl)(this.opts.uriResolver, e, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Gl.schemaHasRulesButRef)(r, this.RULES)) {
    const i = (0, bt.resolveUrl)(this.opts.uriResolver, e, r.$ref);
    a = Pa.call(this, n, i);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new Sa({ schema: r, schemaId: o, root: n, baseId: e }), a.schema !== a.root.schema)
    return a;
}
const K$ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", G$ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", B$ = "object", H$ = [
  "$data"
], W$ = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, J$ = !1, X$ = {
  $id: K$,
  description: G$,
  type: B$,
  required: H$,
  properties: W$,
  additionalProperties: J$
};
var _i = {}, Ra = { exports: {} };
const Y$ = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var Q$ = {
  HEX: Y$
};
const { HEX: Z$ } = Q$, eg = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
function Pf(t) {
  if (If(t, ".") < 3)
    return { host: t, isIPV4: !1 };
  const e = t.match(eg) || [], [r] = e;
  return r ? { host: rg(r, "."), isIPV4: !0 } : { host: t, isIPV4: !1 };
}
function Bl(t, e = !1) {
  let r = "", n = !0;
  for (const s of t) {
    if (Z$[s] === void 0) return;
    s !== "0" && n === !0 && (n = !1), n || (r += s);
  }
  return e && r.length === 0 && (r = "0"), r;
}
function tg(t) {
  let e = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, i = !1;
  function c() {
    if (s.length) {
      if (a === !1) {
        const d = Bl(s);
        if (d !== void 0)
          n.push(d);
        else
          return r.error = !0, !1;
      }
      s.length = 0;
    }
    return !0;
  }
  for (let d = 0; d < t.length; d++) {
    const l = t[d];
    if (!(l === "[" || l === "]"))
      if (l === ":") {
        if (o === !0 && (i = !0), !c())
          break;
        if (e++, n.push(":"), e > 7) {
          r.error = !0;
          break;
        }
        d - 1 >= 0 && t[d - 1] === ":" && (o = !0);
        continue;
      } else if (l === "%") {
        if (!c())
          break;
        a = !0;
      } else {
        s.push(l);
        continue;
      }
  }
  return s.length && (a ? r.zone = s.join("") : i ? n.push(s.join("")) : n.push(Bl(s))), r.address = n.join(""), r;
}
function Rf(t) {
  if (If(t, ":") < 2)
    return { host: t, isIPV6: !1 };
  const e = tg(t);
  if (e.error)
    return { host: t, isIPV6: !1 };
  {
    let r = e.address, n = e.address;
    return e.zone && (r += "%" + e.zone, n += "%25" + e.zone), { host: r, escapedHost: n, isIPV6: !0 };
  }
}
function rg(t, e) {
  let r = "", n = !0;
  const s = t.length;
  for (let a = 0; a < s; a++) {
    const o = t[a];
    o === "0" && n ? (a + 1 <= s && t[a + 1] === e || a + 1 === s) && (r += o, n = !1) : (o === e ? n = !0 : n = !1, r += o);
  }
  return r;
}
function If(t, e) {
  let r = 0;
  for (let n = 0; n < t.length; n++)
    t[n] === e && r++;
  return r;
}
const Hl = /^\.\.?\//u, Wl = /^\/\.(?:\/|$)/u, Jl = /^\/\.\.(?:\/|$)/u, ng = /^\/?(?:.|\n)*?(?=\/|$)/u;
function sg(t) {
  const e = [];
  for (; t.length; )
    if (t.match(Hl))
      t = t.replace(Hl, "");
    else if (t.match(Wl))
      t = t.replace(Wl, "/");
    else if (t.match(Jl))
      t = t.replace(Jl, "/"), e.pop();
    else if (t === "." || t === "..")
      t = "";
    else {
      const r = t.match(ng);
      if (r) {
        const n = r[0];
        t = t.slice(n.length), e.push(n);
      } else
        throw new Error("Unexpected dot segment condition");
    }
  return e.join("");
}
function ag(t, e) {
  const r = e !== !0 ? escape : unescape;
  return t.scheme !== void 0 && (t.scheme = r(t.scheme)), t.userinfo !== void 0 && (t.userinfo = r(t.userinfo)), t.host !== void 0 && (t.host = r(t.host)), t.path !== void 0 && (t.path = r(t.path)), t.query !== void 0 && (t.query = r(t.query)), t.fragment !== void 0 && (t.fragment = r(t.fragment)), t;
}
function og(t) {
  const e = [];
  if (t.userinfo !== void 0 && (e.push(t.userinfo), e.push("@")), t.host !== void 0) {
    let r = unescape(t.host);
    const n = Pf(r);
    if (n.isIPV4)
      r = n.host;
    else {
      const s = Rf(n.host);
      s.isIPV6 === !0 ? r = `[${s.escapedHost}]` : r = t.host;
    }
    e.push(r);
  }
  return (typeof t.port == "number" || typeof t.port == "string") && (e.push(":"), e.push(String(t.port))), e.length ? e.join("") : void 0;
}
var ig = {
  recomposeAuthority: og,
  normalizeComponentEncoding: ag,
  removeDotSegments: sg,
  normalizeIPv4: Pf,
  normalizeIPv6: Rf
};
const cg = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, lg = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Of(t) {
  return typeof t.secure == "boolean" ? t.secure : String(t.scheme).toLowerCase() === "wss";
}
function Nf(t) {
  return t.host || (t.error = t.error || "HTTP URIs must have a host."), t;
}
function Af(t) {
  const e = String(t.scheme).toLowerCase() === "https";
  return (t.port === (e ? 443 : 80) || t.port === "") && (t.port = void 0), t.path || (t.path = "/"), t;
}
function ug(t) {
  return t.secure = Of(t), t.resourceName = (t.path || "/") + (t.query ? "?" + t.query : ""), t.path = void 0, t.query = void 0, t;
}
function dg(t) {
  if ((t.port === (Of(t) ? 443 : 80) || t.port === "") && (t.port = void 0), typeof t.secure == "boolean" && (t.scheme = t.secure ? "wss" : "ws", t.secure = void 0), t.resourceName) {
    const [e, r] = t.resourceName.split("?");
    t.path = e && e !== "/" ? e : void 0, t.query = r, t.resourceName = void 0;
  }
  return t.fragment = void 0, t;
}
function fg(t, e) {
  if (!t.path)
    return t.error = "URN can not be parsed", t;
  const r = t.path.match(lg);
  if (r) {
    const n = e.scheme || t.scheme || "urn";
    t.nid = r[1].toLowerCase(), t.nss = r[2];
    const s = `${n}:${e.nid || t.nid}`, a = vi[s];
    t.path = void 0, a && (t = a.parse(t, e));
  } else
    t.error = t.error || "URN can not be parsed.";
  return t;
}
function hg(t, e) {
  const r = e.scheme || t.scheme || "urn", n = t.nid.toLowerCase(), s = `${r}:${e.nid || n}`, a = vi[s];
  a && (t = a.serialize(t, e));
  const o = t, i = t.nss;
  return o.path = `${n || e.nid}:${i}`, e.skipEscape = !0, o;
}
function mg(t, e) {
  const r = t;
  return r.uuid = r.nss, r.nss = void 0, !e.tolerant && (!r.uuid || !cg.test(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function pg(t) {
  const e = t;
  return e.nss = (t.uuid || "").toLowerCase(), e;
}
const Tf = {
  scheme: "http",
  domainHost: !0,
  parse: Nf,
  serialize: Af
}, yg = {
  scheme: "https",
  domainHost: Tf.domainHost,
  parse: Nf,
  serialize: Af
}, Fs = {
  scheme: "ws",
  domainHost: !0,
  parse: ug,
  serialize: dg
}, $g = {
  scheme: "wss",
  domainHost: Fs.domainHost,
  parse: Fs.parse,
  serialize: Fs.serialize
}, gg = {
  scheme: "urn",
  parse: fg,
  serialize: hg,
  skipNormalize: !0
}, _g = {
  scheme: "urn:uuid",
  parse: mg,
  serialize: pg,
  skipNormalize: !0
}, vi = {
  http: Tf,
  https: yg,
  ws: Fs,
  wss: $g,
  urn: gg,
  "urn:uuid": _g
};
var vg = vi;
const { normalizeIPv6: wg, normalizeIPv4: bg, removeDotSegments: In, recomposeAuthority: Eg, normalizeComponentEncoding: ds } = ig, wi = vg;
function Sg(t, e) {
  return typeof t == "string" ? t = Ct(Wt(t, e), e) : typeof t == "object" && (t = Wt(Ct(t, e), e)), t;
}
function Pg(t, e, r) {
  const n = Object.assign({ scheme: "null" }, r), s = kf(Wt(t, n), Wt(e, n), n, !0);
  return Ct(s, { ...n, skipEscape: !0 });
}
function kf(t, e, r, n) {
  const s = {};
  return n || (t = Wt(Ct(t, r), r), e = Wt(Ct(e, r), r)), r = r || {}, !r.tolerant && e.scheme ? (s.scheme = e.scheme, s.userinfo = e.userinfo, s.host = e.host, s.port = e.port, s.path = In(e.path || ""), s.query = e.query) : (e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0 ? (s.userinfo = e.userinfo, s.host = e.host, s.port = e.port, s.path = In(e.path || ""), s.query = e.query) : (e.path ? (e.path.charAt(0) === "/" ? s.path = In(e.path) : ((t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0) && !t.path ? s.path = "/" + e.path : t.path ? s.path = t.path.slice(0, t.path.lastIndexOf("/") + 1) + e.path : s.path = e.path, s.path = In(s.path)), s.query = e.query) : (s.path = t.path, e.query !== void 0 ? s.query = e.query : s.query = t.query), s.userinfo = t.userinfo, s.host = t.host, s.port = t.port), s.scheme = t.scheme), s.fragment = e.fragment, s;
}
function Rg(t, e, r) {
  return typeof t == "string" ? (t = unescape(t), t = Ct(ds(Wt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = Ct(ds(t, !0), { ...r, skipEscape: !0 })), typeof e == "string" ? (e = unescape(e), e = Ct(ds(Wt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = Ct(ds(e, !0), { ...r, skipEscape: !0 })), t.toLowerCase() === e.toLowerCase();
}
function Ct(t, e) {
  const r = {
    host: t.host,
    scheme: t.scheme,
    userinfo: t.userinfo,
    port: t.port,
    path: t.path,
    query: t.query,
    nid: t.nid,
    nss: t.nss,
    uuid: t.uuid,
    fragment: t.fragment,
    reference: t.reference,
    resourceName: t.resourceName,
    secure: t.secure,
    error: ""
  }, n = Object.assign({}, e), s = [], a = wi[(n.scheme || r.scheme || "").toLowerCase()];
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Eg(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path.charAt(0) !== "/" && s.push("/")), r.path !== void 0) {
    let i = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (i = In(i)), o === void 0 && (i = i.replace(/^\/\//u, "/%2F")), s.push(i);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Ig = Array.from({ length: 127 }, (t, e) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(e)));
function Og(t) {
  let e = 0;
  for (let r = 0, n = t.length; r < n; ++r)
    if (e = t.charCodeAt(r), e > 126 || Ig[e])
      return !0;
  return !1;
}
const Ng = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Wt(t, e) {
  const r = Object.assign({}, e), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  }, s = t.indexOf("%") !== -1;
  let a = !1;
  r.reference === "suffix" && (t = (r.scheme ? r.scheme + ":" : "") + "//" + t);
  const o = t.match(Ng);
  if (o) {
    if (n.scheme = o[1], n.userinfo = o[3], n.host = o[4], n.port = parseInt(o[5], 10), n.path = o[6] || "", n.query = o[7], n.fragment = o[8], isNaN(n.port) && (n.port = o[5]), n.host) {
      const c = bg(n.host);
      if (c.isIPV4 === !1) {
        const d = wg(c.host);
        n.host = d.host.toLowerCase(), a = d.isIPV6;
      } else
        n.host = c.host, a = !0;
    }
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const i = wi[(r.scheme || n.scheme || "").toLowerCase()];
    if (!r.unicodeSupport && (!i || !i.unicodeSupport) && n.host && (r.domainHost || i && i.domainHost) && a === !1 && Og(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (c) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + c;
      }
    (!i || i && !i.skipNormalize) && (s && n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), s && n.host !== void 0 && (n.host = unescape(n.host)), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), i && i.parse && i.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const bi = {
  SCHEMES: wi,
  normalize: Sg,
  resolve: Pg,
  resolveComponents: kf,
  equal: Rg,
  serialize: Ct,
  parse: Wt
};
Ra.exports = bi;
Ra.exports.default = bi;
Ra.exports.fastUri = bi;
var Cf = Ra.exports;
Object.defineProperty(_i, "__esModule", { value: !0 });
const jf = Cf;
jf.code = 'require("ajv/dist/runtime/uri").default';
_i.default = jf;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  var e = St;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return e.KeywordCxt;
  } });
  var r = ue;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = $i(), s = an, a = Ar, o = et, i = ue, c = xe, d = Te, l = x, f = X$, _ = _i, m = (I, v) => new RegExp(I, v);
  m.code = "new RegExp";
  const g = ["removeAdditional", "useDefaults", "coerceTypes"], y = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, p = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, w = 200;
  function S(I) {
    var v, P, b, u, h, E, C, j, J, H, O, N, D, U, X, ce, Se, Ye, De, Me, Pe, It, Ge, fr, hr;
    const pt = I.strict, mr = (v = I.code) === null || v === void 0 ? void 0 : v.optimize, yn = mr === !0 || mr === void 0 ? 1 : mr || 0, $n = (b = (P = I.code) === null || P === void 0 ? void 0 : P.regExp) !== null && b !== void 0 ? b : m, Wa = (u = I.uriResolver) !== null && u !== void 0 ? u : _.default;
    return {
      strictSchema: (E = (h = I.strictSchema) !== null && h !== void 0 ? h : pt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (C = I.strictNumbers) !== null && C !== void 0 ? C : pt) !== null && j !== void 0 ? j : !0,
      strictTypes: (H = (J = I.strictTypes) !== null && J !== void 0 ? J : pt) !== null && H !== void 0 ? H : "log",
      strictTuples: (N = (O = I.strictTuples) !== null && O !== void 0 ? O : pt) !== null && N !== void 0 ? N : "log",
      strictRequired: (U = (D = I.strictRequired) !== null && D !== void 0 ? D : pt) !== null && U !== void 0 ? U : !1,
      code: I.code ? { ...I.code, optimize: yn, regExp: $n } : { optimize: yn, regExp: $n },
      loopRequired: (X = I.loopRequired) !== null && X !== void 0 ? X : w,
      loopEnum: (ce = I.loopEnum) !== null && ce !== void 0 ? ce : w,
      meta: (Se = I.meta) !== null && Se !== void 0 ? Se : !0,
      messages: (Ye = I.messages) !== null && Ye !== void 0 ? Ye : !0,
      inlineRefs: (De = I.inlineRefs) !== null && De !== void 0 ? De : !0,
      schemaId: (Me = I.schemaId) !== null && Me !== void 0 ? Me : "$id",
      addUsedSchema: (Pe = I.addUsedSchema) !== null && Pe !== void 0 ? Pe : !0,
      validateSchema: (It = I.validateSchema) !== null && It !== void 0 ? It : !0,
      validateFormats: (Ge = I.validateFormats) !== null && Ge !== void 0 ? Ge : !0,
      unicodeRegExp: (fr = I.unicodeRegExp) !== null && fr !== void 0 ? fr : !0,
      int32range: (hr = I.int32range) !== null && hr !== void 0 ? hr : !0,
      uriResolver: Wa
    };
  }
  class R {
    constructor(v = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), v = this.opts = { ...v, ...S(v) };
      const { es5: P, lines: b } = this.opts.code;
      this.scope = new i.ValueScope({ scope: {}, prefixes: y, es5: P, lines: b }), this.logger = W(v.logger);
      const u = v.validateFormats;
      v.validateFormats = !1, this.RULES = (0, a.getRules)(), A.call(this, $, v, "NOT SUPPORTED"), A.call(this, p, v, "DEPRECATED", "warn"), this._metaOpts = ae.call(this), v.formats && ie.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), v.keywords && te.call(this, v.keywords), typeof v.meta == "object" && this.addMetaSchema(v.meta), V.call(this), v.validateFormats = u;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: v, meta: P, schemaId: b } = this.opts;
      let u = f;
      b === "id" && (u = { ...f }, u.id = u.$id, delete u.$id), P && v && this.addMetaSchema(u, u[b], !1);
    }
    defaultMeta() {
      const { meta: v, schemaId: P } = this.opts;
      return this.opts.defaultMeta = typeof v == "object" ? v[P] || v : void 0;
    }
    validate(v, P) {
      let b;
      if (typeof v == "string") {
        if (b = this.getSchema(v), !b)
          throw new Error(`no schema with key or ref "${v}"`);
      } else
        b = this.compile(v);
      const u = b(P);
      return "$async" in b || (this.errors = b.errors), u;
    }
    compile(v, P) {
      const b = this._addSchema(v, P);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(v, P) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return u.call(this, v, P);
      async function u(H, O) {
        await h.call(this, H.$schema);
        const N = this._addSchema(H, O);
        return N.validate || E.call(this, N);
      }
      async function h(H) {
        H && !this.getSchema(H) && await u.call(this, { $ref: H }, !0);
      }
      async function E(H) {
        try {
          return this._compileSchemaEnv(H);
        } catch (O) {
          if (!(O instanceof s.default))
            throw O;
          return C.call(this, O), await j.call(this, O.missingSchema), E.call(this, H);
        }
      }
      function C({ missingSchema: H, missingRef: O }) {
        if (this.refs[H])
          throw new Error(`AnySchema ${H} is loaded but ${O} cannot be resolved`);
      }
      async function j(H) {
        const O = await J.call(this, H);
        this.refs[H] || await h.call(this, O.$schema), this.refs[H] || this.addSchema(O, H, P);
      }
      async function J(H) {
        const O = this._loading[H];
        if (O)
          return O;
        try {
          return await (this._loading[H] = b(H));
        } finally {
          delete this._loading[H];
        }
      }
    }
    // Adds schema to the instance
    addSchema(v, P, b, u = this.opts.validateSchema) {
      if (Array.isArray(v)) {
        for (const E of v)
          this.addSchema(E, void 0, b, u);
        return this;
      }
      let h;
      if (typeof v == "object") {
        const { schemaId: E } = this.opts;
        if (h = v[E], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return P = (0, c.normalizeId)(P || h), this._checkUnique(P), this.schemas[P] = this._addSchema(v, b, P, u, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(v, P, b = this.opts.validateSchema) {
      return this.addSchema(v, P, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(v, P) {
      if (typeof v == "boolean")
        return !0;
      let b;
      if (b = v.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const u = this.validate(b, v);
      if (!u && P) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return u;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(v) {
      let P;
      for (; typeof (P = F.call(this, v)) == "string"; )
        v = P;
      if (P === void 0) {
        const { schemaId: b } = this.opts, u = new o.SchemaEnv({ schema: {}, schemaId: b });
        if (P = o.resolveSchema.call(this, u, v), !P)
          return;
        this.refs[v] = P;
      }
      return P.validate || this._compileSchemaEnv(P);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(v) {
      if (v instanceof RegExp)
        return this._removeAllSchemas(this.schemas, v), this._removeAllSchemas(this.refs, v), this;
      switch (typeof v) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const P = F.call(this, v);
          return typeof P == "object" && this._cache.delete(P.schema), delete this.schemas[v], delete this.refs[v], this;
        }
        case "object": {
          const P = v;
          this._cache.delete(P);
          let b = v[this.opts.schemaId];
          return b && (b = (0, c.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(v) {
      for (const P of v)
        this.addKeyword(P);
      return this;
    }
    addKeyword(v, P) {
      let b;
      if (typeof v == "string")
        b = v, typeof P == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), P.keyword = b);
      else if (typeof v == "object" && P === void 0) {
        if (P = v, b = P.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (k.call(this, b, P), !P)
        return (0, l.eachItem)(b, (h) => M.call(this, h)), this;
      z.call(this, P);
      const u = {
        ...P,
        type: (0, d.getJSONTypes)(P.type),
        schemaType: (0, d.getJSONTypes)(P.schemaType)
      };
      return (0, l.eachItem)(b, u.type.length === 0 ? (h) => M.call(this, h, u) : (h) => u.type.forEach((E) => M.call(this, h, u, E))), this;
    }
    getKeyword(v) {
      const P = this.RULES.all[v];
      return typeof P == "object" ? P.definition : !!P;
    }
    // Remove keyword
    removeKeyword(v) {
      const { RULES: P } = this;
      delete P.keywords[v], delete P.all[v];
      for (const b of P.rules) {
        const u = b.rules.findIndex((h) => h.keyword === v);
        u >= 0 && b.rules.splice(u, 1);
      }
      return this;
    }
    // Add format
    addFormat(v, P) {
      return typeof P == "string" && (P = new RegExp(P)), this.formats[v] = P, this;
    }
    errorsText(v = this.errors, { separator: P = ", ", dataVar: b = "data" } = {}) {
      return !v || v.length === 0 ? "No errors" : v.map((u) => `${b}${u.instancePath} ${u.message}`).reduce((u, h) => u + P + h);
    }
    $dataMetaSchema(v, P) {
      const b = this.RULES.all;
      v = JSON.parse(JSON.stringify(v));
      for (const u of P) {
        const h = u.split("/").slice(1);
        let E = v;
        for (const C of h)
          E = E[C];
        for (const C in b) {
          const j = b[C];
          if (typeof j != "object")
            continue;
          const { $data: J } = j.definition, H = E[C];
          J && H && (E[C] = G(H));
        }
      }
      return v;
    }
    _removeAllSchemas(v, P) {
      for (const b in v) {
        const u = v[b];
        (!P || P.test(b)) && (typeof u == "string" ? delete v[b] : u && !u.meta && (this._cache.delete(u.schema), delete v[b]));
      }
    }
    _addSchema(v, P, b, u = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let E;
      const { schemaId: C } = this.opts;
      if (typeof v == "object")
        E = v[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof v != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(v);
      if (j !== void 0)
        return j;
      b = (0, c.normalizeId)(E || b);
      const J = c.getSchemaRefs.call(this, v, b);
      return j = new o.SchemaEnv({ schema: v, schemaId: C, meta: P, baseId: b, localRefs: J }), this._cache.set(j.schema, j), h && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = j), u && this.validateSchema(v, !0), j;
    }
    _checkUnique(v) {
      if (this.schemas[v] || this.refs[v])
        throw new Error(`schema with key or id "${v}" already exists`);
    }
    _compileSchemaEnv(v) {
      if (v.meta ? this._compileMetaSchema(v) : o.compileSchema.call(this, v), !v.validate)
        throw new Error("ajv implementation error");
      return v.validate;
    }
    _compileMetaSchema(v) {
      const P = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, v);
      } finally {
        this.opts = P;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, t.default = R;
  function A(I, v, P, b = "error") {
    for (const u in I) {
      const h = u;
      h in v && this.logger[b](`${P}: option ${u}. ${I[h]}`);
    }
  }
  function F(I) {
    return I = (0, c.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function V() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const v in I)
          this.addSchema(I[v], v);
  }
  function ie() {
    for (const I in this.opts.formats) {
      const v = this.opts.formats[I];
      v && this.addFormat(I, v);
    }
  }
  function te(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const v in I) {
      const P = I[v];
      P.keyword || (P.keyword = v), this.addKeyword(P);
    }
  }
  function ae() {
    const I = { ...this.opts };
    for (const v of g)
      delete I[v];
    return I;
  }
  const L = { log() {
  }, warn() {
  }, error() {
  } };
  function W(I) {
    if (I === !1)
      return L;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ee = /^[a-z_$][a-z0-9_$:-]*$/i;
  function k(I, v) {
    const { RULES: P } = this;
    if ((0, l.eachItem)(I, (b) => {
      if (P.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!ee.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!v && v.$data && !("code" in v || "validate" in v))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function M(I, v, P) {
    var b;
    const u = v == null ? void 0 : v.post;
    if (P && u)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let E = u ? h.post : h.rules.find(({ type: j }) => j === P);
    if (E || (E = { type: P, rules: [] }, h.rules.push(E)), h.keywords[I] = !0, !v)
      return;
    const C = {
      keyword: I,
      definition: {
        ...v,
        type: (0, d.getJSONTypes)(v.type),
        schemaType: (0, d.getJSONTypes)(v.schemaType)
      }
    };
    v.before ? B.call(this, E, C, v.before) : E.rules.push(C), h.all[I] = C, (b = v.implements) === null || b === void 0 || b.forEach((j) => this.addKeyword(j));
  }
  function B(I, v, P) {
    const b = I.rules.findIndex((u) => u.keyword === P);
    b >= 0 ? I.rules.splice(b, 0, v) : (I.rules.push(v), this.logger.warn(`rule ${P} is not defined`));
  }
  function z(I) {
    let { metaSchema: v } = I;
    v !== void 0 && (I.$data && this.opts.$data && (v = G(v)), I.validateSchema = this.compile(v, !0));
  }
  const Y = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function G(I) {
    return { anyOf: [I, Y] };
  }
})(Bd);
var Ei = {}, Si = {}, Pi = {};
Object.defineProperty(Pi, "__esModule", { value: !0 });
const Ag = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Pi.default = Ag;
var Jt = {};
Object.defineProperty(Jt, "__esModule", { value: !0 });
Jt.callRef = Jt.getValidate = void 0;
const Tg = an, Xl = pe, rt = ue, Dr = dt, Yl = et, fs = x, kg = {
  keyword: "$ref",
  schemaType: "string",
  code(t) {
    const { gen: e, schema: r, it: n } = t, { baseId: s, schemaEnv: a, validateName: o, opts: i, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return f();
    const l = Yl.resolveRef.call(c, d, s, r);
    if (l === void 0)
      throw new Tg.default(n.opts.uriResolver, s, r);
    if (l instanceof Yl.SchemaEnv)
      return _(l);
    return m(l);
    function f() {
      if (a === d)
        return Vs(t, o, a, a.$async);
      const g = e.scopeValue("root", { ref: d });
      return Vs(t, (0, rt._)`${g}.validate`, d, d.$async);
    }
    function _(g) {
      const y = Df(t, g);
      Vs(t, y, g, g.$async);
    }
    function m(g) {
      const y = e.scopeValue("schema", i.code.source === !0 ? { ref: g, code: (0, rt.stringify)(g) } : { ref: g }), $ = e.name("valid"), p = t.subschema({
        schema: g,
        dataTypes: [],
        schemaPath: rt.nil,
        topSchemaRef: y,
        errSchemaPath: r
      }, $);
      t.mergeEvaluated(p), t.ok($);
    }
  }
};
function Df(t, e) {
  const { gen: r } = t;
  return e.validate ? r.scopeValue("validate", { ref: e.validate }) : (0, rt._)`${r.scopeValue("wrapper", { ref: e })}.validate`;
}
Jt.getValidate = Df;
function Vs(t, e, r, n) {
  const { gen: s, it: a } = t, { allErrors: o, schemaEnv: i, opts: c } = a, d = c.passContext ? Dr.default.this : rt.nil;
  n ? l() : f();
  function l() {
    if (!i.$async)
      throw new Error("async schema referenced by sync schema");
    const g = s.let("valid");
    s.try(() => {
      s.code((0, rt._)`await ${(0, Xl.callValidateCode)(t, e, d)}`), m(e), o || s.assign(g, !0);
    }, (y) => {
      s.if((0, rt._)`!(${y} instanceof ${a.ValidationError})`, () => s.throw(y)), _(y), o || s.assign(g, !1);
    }), t.ok(g);
  }
  function f() {
    t.result((0, Xl.callValidateCode)(t, e, d), () => m(e), () => _(e));
  }
  function _(g) {
    const y = (0, rt._)`${g}.errors`;
    s.assign(Dr.default.vErrors, (0, rt._)`${Dr.default.vErrors} === null ? ${y} : ${Dr.default.vErrors}.concat(${y})`), s.assign(Dr.default.errors, (0, rt._)`${Dr.default.vErrors}.length`);
  }
  function m(g) {
    var y;
    if (!a.opts.unevaluated)
      return;
    const $ = (y = r == null ? void 0 : r.validate) === null || y === void 0 ? void 0 : y.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = fs.mergeEvaluated.props(s, $.props, a.props));
      else {
        const p = s.var("props", (0, rt._)`${g}.evaluated.props`);
        a.props = fs.mergeEvaluated.props(s, p, a.props, rt.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = fs.mergeEvaluated.items(s, $.items, a.items));
      else {
        const p = s.var("items", (0, rt._)`${g}.evaluated.items`);
        a.items = fs.mergeEvaluated.items(s, p, a.items, rt.Name);
      }
  }
}
Jt.callRef = Vs;
Jt.default = kg;
Object.defineProperty(Si, "__esModule", { value: !0 });
const Cg = Pi, jg = Jt, Dg = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Cg.default,
  jg.default
];
Si.default = Dg;
var Ri = {}, Ii = {};
Object.defineProperty(Ii, "__esModule", { value: !0 });
const oa = ue, tr = oa.operators, ia = {
  maximum: { okStr: "<=", ok: tr.LTE, fail: tr.GT },
  minimum: { okStr: ">=", ok: tr.GTE, fail: tr.LT },
  exclusiveMaximum: { okStr: "<", ok: tr.LT, fail: tr.GTE },
  exclusiveMinimum: { okStr: ">", ok: tr.GT, fail: tr.LTE }
}, Mg = {
  message: ({ keyword: t, schemaCode: e }) => (0, oa.str)`must be ${ia[t].okStr} ${e}`,
  params: ({ keyword: t, schemaCode: e }) => (0, oa._)`{comparison: ${ia[t].okStr}, limit: ${e}}`
}, Lg = {
  keyword: Object.keys(ia),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Mg,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t;
    t.fail$data((0, oa._)`${r} ${ia[e].fail} ${n} || isNaN(${r})`);
  }
};
Ii.default = Lg;
var Oi = {};
Object.defineProperty(Oi, "__esModule", { value: !0 });
const qn = ue, Fg = {
  message: ({ schemaCode: t }) => (0, qn.str)`must be multiple of ${t}`,
  params: ({ schemaCode: t }) => (0, qn._)`{multipleOf: ${t}}`
}, Vg = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Fg,
  code(t) {
    const { gen: e, data: r, schemaCode: n, it: s } = t, a = s.opts.multipleOfPrecision, o = e.let("res"), i = a ? (0, qn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, qn._)`${o} !== parseInt(${o})`;
    t.fail$data((0, qn._)`(${n} === 0 || (${o} = ${r}/${n}, ${i}))`);
  }
};
Oi.default = Vg;
var Ni = {}, Ai = {};
Object.defineProperty(Ai, "__esModule", { value: !0 });
function Mf(t) {
  const e = t.length;
  let r = 0, n = 0, s;
  for (; n < e; )
    r++, s = t.charCodeAt(n++), s >= 55296 && s <= 56319 && n < e && (s = t.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Ai.default = Mf;
Mf.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ni, "__esModule", { value: !0 });
const wr = ue, Ug = x, qg = Ai, xg = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxLength" ? "more" : "fewer";
    return (0, wr.str)`must NOT have ${r} than ${e} characters`;
  },
  params: ({ schemaCode: t }) => (0, wr._)`{limit: ${t}}`
}, zg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: xg,
  code(t) {
    const { keyword: e, data: r, schemaCode: n, it: s } = t, a = e === "maxLength" ? wr.operators.GT : wr.operators.LT, o = s.opts.unicode === !1 ? (0, wr._)`${r}.length` : (0, wr._)`${(0, Ug.useFunc)(t.gen, qg.default)}(${r})`;
    t.fail$data((0, wr._)`${o} ${a} ${n}`);
  }
};
Ni.default = zg;
var Ti = {};
Object.defineProperty(Ti, "__esModule", { value: !0 });
const Kg = pe, ca = ue, Gg = {
  message: ({ schemaCode: t }) => (0, ca.str)`must match pattern "${t}"`,
  params: ({ schemaCode: t }) => (0, ca._)`{pattern: ${t}}`
}, Bg = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Gg,
  code(t) {
    const { data: e, $data: r, schema: n, schemaCode: s, it: a } = t, o = a.opts.unicodeRegExp ? "u" : "", i = r ? (0, ca._)`(new RegExp(${s}, ${o}))` : (0, Kg.usePattern)(t, n);
    t.fail$data((0, ca._)`!${i}.test(${e})`);
  }
};
Ti.default = Bg;
var ki = {};
Object.defineProperty(ki, "__esModule", { value: !0 });
const xn = ue, Hg = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxProperties" ? "more" : "fewer";
    return (0, xn.str)`must NOT have ${r} than ${e} properties`;
  },
  params: ({ schemaCode: t }) => (0, xn._)`{limit: ${t}}`
}, Wg = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Hg,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxProperties" ? xn.operators.GT : xn.operators.LT;
    t.fail$data((0, xn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
ki.default = Wg;
var Ci = {};
Object.defineProperty(Ci, "__esModule", { value: !0 });
const bn = pe, zn = ue, Jg = x, Xg = {
  message: ({ params: { missingProperty: t } }) => (0, zn.str)`must have required property '${t}'`,
  params: ({ params: { missingProperty: t } }) => (0, zn._)`{missingProperty: ${t}}`
}, Yg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Xg,
  code(t) {
    const { gen: e, schema: r, schemaCode: n, data: s, $data: a, it: o } = t, { opts: i } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= i.loopRequired;
    if (o.allErrors ? d() : l(), i.strictRequired) {
      const m = t.parentSchema.properties, { definedProperties: g } = t.it;
      for (const y of r)
        if ((m == null ? void 0 : m[y]) === void 0 && !g.has(y)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, p = `required property "${y}" is not defined at "${$}" (strictRequired)`;
          (0, Jg.checkStrictMode)(o, p, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        t.block$data(zn.nil, f);
      else
        for (const m of r)
          (0, bn.checkReportMissingProp)(t, m);
    }
    function l() {
      const m = e.let("missing");
      if (c || a) {
        const g = e.let("valid", !0);
        t.block$data(g, () => _(m, g)), t.ok(g);
      } else
        e.if((0, bn.checkMissingProp)(t, r, m)), (0, bn.reportMissingProp)(t, m), e.else();
    }
    function f() {
      e.forOf("prop", n, (m) => {
        t.setParams({ missingProperty: m }), e.if((0, bn.noPropertyInData)(e, s, m, i.ownProperties), () => t.error());
      });
    }
    function _(m, g) {
      t.setParams({ missingProperty: m }), e.forOf(m, n, () => {
        e.assign(g, (0, bn.propertyInData)(e, s, m, i.ownProperties)), e.if((0, zn.not)(g), () => {
          t.error(), e.break();
        });
      }, zn.nil);
    }
  }
};
Ci.default = Yg;
var ji = {};
Object.defineProperty(ji, "__esModule", { value: !0 });
const Kn = ue, Qg = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxItems" ? "more" : "fewer";
    return (0, Kn.str)`must NOT have ${r} than ${e} items`;
  },
  params: ({ schemaCode: t }) => (0, Kn._)`{limit: ${t}}`
}, Zg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Qg,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxItems" ? Kn.operators.GT : Kn.operators.LT;
    t.fail$data((0, Kn._)`${r}.length ${s} ${n}`);
  }
};
ji.default = Zg;
var Di = {}, rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
const Lf = Ea;
Lf.code = 'require("ajv/dist/runtime/equal").default';
rs.default = Lf;
Object.defineProperty(Di, "__esModule", { value: !0 });
const eo = Te, Fe = ue, e_ = x, t_ = rs, r_ = {
  message: ({ params: { i: t, j: e } }) => (0, Fe.str)`must NOT have duplicate items (items ## ${e} and ${t} are identical)`,
  params: ({ params: { i: t, j: e } }) => (0, Fe._)`{i: ${t}, j: ${e}}`
}, n_ = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: r_,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: i } = t;
    if (!n && !s)
      return;
    const c = e.let("valid"), d = a.items ? (0, eo.getSchemaTypes)(a.items) : [];
    t.block$data(c, l, (0, Fe._)`${o} === false`), t.ok(c);
    function l() {
      const g = e.let("i", (0, Fe._)`${r}.length`), y = e.let("j");
      t.setParams({ i: g, j: y }), e.assign(c, !0), e.if((0, Fe._)`${g} > 1`, () => (f() ? _ : m)(g, y));
    }
    function f() {
      return d.length > 0 && !d.some((g) => g === "object" || g === "array");
    }
    function _(g, y) {
      const $ = e.name("item"), p = (0, eo.checkDataTypes)(d, $, i.opts.strictNumbers, eo.DataType.Wrong), w = e.const("indices", (0, Fe._)`{}`);
      e.for((0, Fe._)`;${g}--;`, () => {
        e.let($, (0, Fe._)`${r}[${g}]`), e.if(p, (0, Fe._)`continue`), d.length > 1 && e.if((0, Fe._)`typeof ${$} == "string"`, (0, Fe._)`${$} += "_"`), e.if((0, Fe._)`typeof ${w}[${$}] == "number"`, () => {
          e.assign(y, (0, Fe._)`${w}[${$}]`), t.error(), e.assign(c, !1).break();
        }).code((0, Fe._)`${w}[${$}] = ${g}`);
      });
    }
    function m(g, y) {
      const $ = (0, e_.useFunc)(e, t_.default), p = e.name("outer");
      e.label(p).for((0, Fe._)`;${g}--;`, () => e.for((0, Fe._)`${y} = ${g}; ${y}--;`, () => e.if((0, Fe._)`${$}(${r}[${g}], ${r}[${y}])`, () => {
        t.error(), e.assign(c, !1).break(p);
      })));
    }
  }
};
Di.default = n_;
var Mi = {};
Object.defineProperty(Mi, "__esModule", { value: !0 });
const No = ue, s_ = x, a_ = rs, o_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: t }) => (0, No._)`{allowedValue: ${t}}`
}, i_ = {
  keyword: "const",
  $data: !0,
  error: o_,
  code(t) {
    const { gen: e, data: r, $data: n, schemaCode: s, schema: a } = t;
    n || a && typeof a == "object" ? t.fail$data((0, No._)`!${(0, s_.useFunc)(e, a_.default)}(${r}, ${s})`) : t.fail((0, No._)`${a} !== ${r}`);
  }
};
Mi.default = i_;
var Li = {};
Object.defineProperty(Li, "__esModule", { value: !0 });
const On = ue, c_ = x, l_ = rs, u_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: t }) => (0, On._)`{allowedValues: ${t}}`
}, d_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: u_,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, schemaCode: a, it: o } = t;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const i = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, c_.useFunc)(e, l_.default));
    let l;
    if (i || n)
      l = e.let("valid"), t.block$data(l, f);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const m = e.const("vSchema", a);
      l = (0, On.or)(...s.map((g, y) => _(m, y)));
    }
    t.pass(l);
    function f() {
      e.assign(l, !1), e.forOf("v", a, (m) => e.if((0, On._)`${d()}(${r}, ${m})`, () => e.assign(l, !0).break()));
    }
    function _(m, g) {
      const y = s[g];
      return typeof y == "object" && y !== null ? (0, On._)`${d()}(${r}, ${m}[${g}])` : (0, On._)`${r} === ${y}`;
    }
  }
};
Li.default = d_;
Object.defineProperty(Ri, "__esModule", { value: !0 });
const f_ = Ii, h_ = Oi, m_ = Ni, p_ = Ti, y_ = ki, $_ = Ci, g_ = ji, __ = Di, v_ = Mi, w_ = Li, b_ = [
  // number
  f_.default,
  h_.default,
  // string
  m_.default,
  p_.default,
  // object
  y_.default,
  $_.default,
  // array
  g_.default,
  __.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  v_.default,
  w_.default
];
Ri.default = b_;
var Fi = {}, on = {};
Object.defineProperty(on, "__esModule", { value: !0 });
on.validateAdditionalItems = void 0;
const br = ue, Ao = x, E_ = {
  message: ({ params: { len: t } }) => (0, br.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, br._)`{limit: ${t}}`
}, S_ = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: E_,
  code(t) {
    const { parentSchema: e, it: r } = t, { items: n } = e;
    if (!Array.isArray(n)) {
      (0, Ao.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Ff(t, n);
  }
};
function Ff(t, e) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = t;
  o.items = !0;
  const i = r.const("len", (0, br._)`${s}.length`);
  if (n === !1)
    t.setParams({ len: e.length }), t.pass((0, br._)`${i} <= ${e.length}`);
  else if (typeof n == "object" && !(0, Ao.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, br._)`${i} <= ${e.length}`);
    r.if((0, br.not)(d), () => c(d)), t.ok(d);
  }
  function c(d) {
    r.forRange("i", e.length, i, (l) => {
      t.subschema({ keyword: a, dataProp: l, dataPropType: Ao.Type.Num }, d), o.allErrors || r.if((0, br.not)(d), () => r.break());
    });
  }
}
on.validateAdditionalItems = Ff;
on.default = S_;
var Vi = {}, cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
cn.validateTuple = void 0;
const Ql = ue, Us = x, P_ = pe, R_ = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(t) {
    const { schema: e, it: r } = t;
    if (Array.isArray(e))
      return Vf(t, "additionalItems", e);
    r.items = !0, !(0, Us.alwaysValidSchema)(r, e) && t.ok((0, P_.validateArray)(t));
  }
};
function Vf(t, e, r = t.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: i } = t;
  l(s), i.opts.unevaluated && r.length && i.items !== !0 && (i.items = Us.mergeEvaluated.items(n, r.length, i.items));
  const c = n.name("valid"), d = n.const("len", (0, Ql._)`${a}.length`);
  r.forEach((f, _) => {
    (0, Us.alwaysValidSchema)(i, f) || (n.if((0, Ql._)`${d} > ${_}`, () => t.subschema({
      keyword: o,
      schemaProp: _,
      dataProp: _
    }, c)), t.ok(c));
  });
  function l(f) {
    const { opts: _, errSchemaPath: m } = i, g = r.length, y = g === f.minItems && (g === f.maxItems || f[e] === !1);
    if (_.strictTuples && !y) {
      const $ = `"${o}" is ${g}-tuple, but minItems or maxItems/${e} are not specified or different at path "${m}"`;
      (0, Us.checkStrictMode)(i, $, _.strictTuples);
    }
  }
}
cn.validateTuple = Vf;
cn.default = R_;
Object.defineProperty(Vi, "__esModule", { value: !0 });
const I_ = cn, O_ = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (t) => (0, I_.validateTuple)(t, "items")
};
Vi.default = O_;
var Ui = {};
Object.defineProperty(Ui, "__esModule", { value: !0 });
const Zl = ue, N_ = x, A_ = pe, T_ = on, k_ = {
  message: ({ params: { len: t } }) => (0, Zl.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Zl._)`{limit: ${t}}`
}, C_ = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: k_,
  code(t) {
    const { schema: e, parentSchema: r, it: n } = t, { prefixItems: s } = r;
    n.items = !0, !(0, N_.alwaysValidSchema)(n, e) && (s ? (0, T_.validateAdditionalItems)(t, s) : t.ok((0, A_.validateArray)(t)));
  }
};
Ui.default = C_;
var qi = {};
Object.defineProperty(qi, "__esModule", { value: !0 });
const ft = ue, hs = x, j_ = {
  message: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ft.str)`must contain at least ${t} valid item(s)` : (0, ft.str)`must contain at least ${t} and no more than ${e} valid item(s)`,
  params: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ft._)`{minContains: ${t}}` : (0, ft._)`{minContains: ${t}, maxContains: ${e}}`
}, D_ = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: j_,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    let o, i;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, i = d) : o = 1;
    const l = e.const("len", (0, ft._)`${s}.length`);
    if (t.setParams({ min: o, max: i }), i === void 0 && o === 0) {
      (0, hs.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (i !== void 0 && o > i) {
      (0, hs.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), t.fail();
      return;
    }
    if ((0, hs.alwaysValidSchema)(a, r)) {
      let y = (0, ft._)`${l} >= ${o}`;
      i !== void 0 && (y = (0, ft._)`${y} && ${l} <= ${i}`), t.pass(y);
      return;
    }
    a.items = !0;
    const f = e.name("valid");
    i === void 0 && o === 1 ? m(f, () => e.if(f, () => e.break())) : o === 0 ? (e.let(f, !0), i !== void 0 && e.if((0, ft._)`${s}.length > 0`, _)) : (e.let(f, !1), _()), t.result(f, () => t.reset());
    function _() {
      const y = e.name("_valid"), $ = e.let("count", 0);
      m(y, () => e.if(y, () => g($)));
    }
    function m(y, $) {
      e.forRange("i", 0, l, (p) => {
        t.subschema({
          keyword: "contains",
          dataProp: p,
          dataPropType: hs.Type.Num,
          compositeRule: !0
        }, y), $();
      });
    }
    function g(y) {
      e.code((0, ft._)`${y}++`), i === void 0 ? e.if((0, ft._)`${y} >= ${o}`, () => e.assign(f, !0).break()) : (e.if((0, ft._)`${y} > ${i}`, () => e.assign(f, !1).break()), o === 1 ? e.assign(f, !0) : e.if((0, ft._)`${y} >= ${o}`, () => e.assign(f, !0)));
    }
  }
};
qi.default = D_;
var Ia = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
  const e = ue, r = x, n = pe;
  t.error = {
    message: ({ params: { property: c, depsCount: d, deps: l } }) => {
      const f = d === 1 ? "property" : "properties";
      return (0, e.str)`must have ${f} ${l} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: l, missingProperty: f } }) => (0, e._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${d},
    deps: ${l}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(c) {
      const [d, l] = a(c);
      o(c, d), i(c, l);
    }
  };
  function a({ schema: c }) {
    const d = {}, l = {};
    for (const f in c) {
      if (f === "__proto__")
        continue;
      const _ = Array.isArray(c[f]) ? d : l;
      _[f] = c[f];
    }
    return [d, l];
  }
  function o(c, d = c.schema) {
    const { gen: l, data: f, it: _ } = c;
    if (Object.keys(d).length === 0)
      return;
    const m = l.let("missing");
    for (const g in d) {
      const y = d[g];
      if (y.length === 0)
        continue;
      const $ = (0, n.propertyInData)(l, f, g, _.opts.ownProperties);
      c.setParams({
        property: g,
        depsCount: y.length,
        deps: y.join(", ")
      }), _.allErrors ? l.if($, () => {
        for (const p of y)
          (0, n.checkReportMissingProp)(c, p);
      }) : (l.if((0, e._)`${$} && (${(0, n.checkMissingProp)(c, y, m)})`), (0, n.reportMissingProp)(c, m), l.else());
    }
  }
  t.validatePropertyDeps = o;
  function i(c, d = c.schema) {
    const { gen: l, data: f, keyword: _, it: m } = c, g = l.name("valid");
    for (const y in d)
      (0, r.alwaysValidSchema)(m, d[y]) || (l.if(
        (0, n.propertyInData)(l, f, y, m.opts.ownProperties),
        () => {
          const $ = c.subschema({ keyword: _, schemaProp: y }, g);
          c.mergeValidEvaluated($, g);
        },
        () => l.var(g, !0)
        // TODO var
      ), c.ok(g));
  }
  t.validateSchemaDeps = i, t.default = s;
})(Ia);
var xi = {};
Object.defineProperty(xi, "__esModule", { value: !0 });
const Uf = ue, M_ = x, L_ = {
  message: "property name must be valid",
  params: ({ params: t }) => (0, Uf._)`{propertyName: ${t.propertyName}}`
}, F_ = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: L_,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t;
    if ((0, M_.alwaysValidSchema)(s, r))
      return;
    const a = e.name("valid");
    e.forIn("key", n, (o) => {
      t.setParams({ propertyName: o }), t.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), e.if((0, Uf.not)(a), () => {
        t.error(!0), s.allErrors || e.break();
      });
    }), t.ok(a);
  }
};
xi.default = F_;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const ms = pe, _t = ue, V_ = dt, ps = x, U_ = {
  message: "must NOT have additional properties",
  params: ({ params: t }) => (0, _t._)`{additionalProperty: ${t.additionalProperty}}`
}, q_ = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: U_,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = t;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: i, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, ps.alwaysValidSchema)(o, r))
      return;
    const d = (0, ms.allSchemaProperties)(n.properties), l = (0, ms.allSchemaProperties)(n.patternProperties);
    f(), t.ok((0, _t._)`${a} === ${V_.default.errors}`);
    function f() {
      e.forIn("key", s, ($) => {
        !d.length && !l.length ? g($) : e.if(_($), () => g($));
      });
    }
    function _($) {
      let p;
      if (d.length > 8) {
        const w = (0, ps.schemaRefOrVal)(o, n.properties, "properties");
        p = (0, ms.isOwnProperty)(e, w, $);
      } else d.length ? p = (0, _t.or)(...d.map((w) => (0, _t._)`${$} === ${w}`)) : p = _t.nil;
      return l.length && (p = (0, _t.or)(p, ...l.map((w) => (0, _t._)`${(0, ms.usePattern)(t, w)}.test(${$})`))), (0, _t.not)(p);
    }
    function m($) {
      e.code((0, _t._)`delete ${s}[${$}]`);
    }
    function g($) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        m($);
        return;
      }
      if (r === !1) {
        t.setParams({ additionalProperty: $ }), t.error(), i || e.break();
        return;
      }
      if (typeof r == "object" && !(0, ps.alwaysValidSchema)(o, r)) {
        const p = e.name("valid");
        c.removeAdditional === "failing" ? (y($, p, !1), e.if((0, _t.not)(p), () => {
          t.reset(), m($);
        })) : (y($, p), i || e.if((0, _t.not)(p), () => e.break()));
      }
    }
    function y($, p, w) {
      const S = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: ps.Type.Str
      };
      w === !1 && Object.assign(S, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), t.subschema(S, p);
    }
  }
};
Oa.default = q_;
var zi = {};
Object.defineProperty(zi, "__esModule", { value: !0 });
const x_ = St, eu = pe, to = x, tu = Oa, z_ = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && tu.default.code(new x_.KeywordCxt(a, tu.default, "additionalProperties"));
    const o = (0, eu.allSchemaProperties)(r);
    for (const f of o)
      a.definedProperties.add(f);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = to.mergeEvaluated.props(e, (0, to.toHash)(o), a.props));
    const i = o.filter((f) => !(0, to.alwaysValidSchema)(a, r[f]));
    if (i.length === 0)
      return;
    const c = e.name("valid");
    for (const f of i)
      d(f) ? l(f) : (e.if((0, eu.propertyInData)(e, s, f, a.opts.ownProperties)), l(f), a.allErrors || e.else().var(c, !0), e.endIf()), t.it.definedProperties.add(f), t.ok(c);
    function d(f) {
      return a.opts.useDefaults && !a.compositeRule && r[f].default !== void 0;
    }
    function l(f) {
      t.subschema({
        keyword: "properties",
        schemaProp: f,
        dataProp: f
      }, c);
    }
  }
};
zi.default = z_;
var Ki = {};
Object.defineProperty(Ki, "__esModule", { value: !0 });
const ru = pe, ys = ue, nu = x, su = x, K_ = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, data: n, parentSchema: s, it: a } = t, { opts: o } = a, i = (0, ru.allSchemaProperties)(r), c = i.filter((y) => (0, nu.alwaysValidSchema)(a, r[y]));
    if (i.length === 0 || c.length === i.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, l = e.name("valid");
    a.props !== !0 && !(a.props instanceof ys.Name) && (a.props = (0, su.evaluatedPropsToName)(e, a.props));
    const { props: f } = a;
    _();
    function _() {
      for (const y of i)
        d && m(y), a.allErrors ? g(y) : (e.var(l, !0), g(y), e.if(l));
    }
    function m(y) {
      for (const $ in d)
        new RegExp(y).test($) && (0, nu.checkStrictMode)(a, `property ${$} matches pattern ${y} (use allowMatchingProperties)`);
    }
    function g(y) {
      e.forIn("key", n, ($) => {
        e.if((0, ys._)`${(0, ru.usePattern)(t, y)}.test(${$})`, () => {
          const p = c.includes(y);
          p || t.subschema({
            keyword: "patternProperties",
            schemaProp: y,
            dataProp: $,
            dataPropType: su.Type.Str
          }, l), a.opts.unevaluated && f !== !0 ? e.assign((0, ys._)`${f}[${$}]`, !0) : !p && !a.allErrors && e.if((0, ys.not)(l), () => e.break());
        });
      });
    }
  }
};
Ki.default = K_;
var Gi = {};
Object.defineProperty(Gi, "__esModule", { value: !0 });
const G_ = x, B_ = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if ((0, G_.alwaysValidSchema)(n, r)) {
      t.fail();
      return;
    }
    const s = e.name("valid");
    t.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), t.failResult(s, () => t.reset(), () => t.error());
  },
  error: { message: "must NOT be valid" }
};
Gi.default = B_;
var Bi = {};
Object.defineProperty(Bi, "__esModule", { value: !0 });
const H_ = pe, W_ = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: H_.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Bi.default = W_;
var Hi = {};
Object.defineProperty(Hi, "__esModule", { value: !0 });
const qs = ue, J_ = x, X_ = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: t }) => (0, qs._)`{passingSchemas: ${t.passing}}`
}, Y_ = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: X_,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, it: s } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = e.let("valid", !1), i = e.let("passing", null), c = e.name("_valid");
    t.setParams({ passing: i }), e.block(d), t.result(o, () => t.reset(), () => t.error(!0));
    function d() {
      a.forEach((l, f) => {
        let _;
        (0, J_.alwaysValidSchema)(s, l) ? e.var(c, !0) : _ = t.subschema({
          keyword: "oneOf",
          schemaProp: f,
          compositeRule: !0
        }, c), f > 0 && e.if((0, qs._)`${c} && ${o}`).assign(o, !1).assign(i, (0, qs._)`[${i}, ${f}]`).else(), e.if(c, () => {
          e.assign(o, !0), e.assign(i, f), _ && t.mergeEvaluated(_, qs.Name);
        });
      });
    }
  }
};
Hi.default = Y_;
var Wi = {};
Object.defineProperty(Wi, "__esModule", { value: !0 });
const Q_ = x, Z_ = {
  keyword: "allOf",
  schemaType: "array",
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = e.name("valid");
    r.forEach((a, o) => {
      if ((0, Q_.alwaysValidSchema)(n, a))
        return;
      const i = t.subschema({ keyword: "allOf", schemaProp: o }, s);
      t.ok(s), t.mergeEvaluated(i);
    });
  }
};
Wi.default = Z_;
var Ji = {};
Object.defineProperty(Ji, "__esModule", { value: !0 });
const la = ue, qf = x, e0 = {
  message: ({ params: t }) => (0, la.str)`must match "${t.ifClause}" schema`,
  params: ({ params: t }) => (0, la._)`{failingKeyword: ${t.ifClause}}`
}, t0 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: e0,
  code(t) {
    const { gen: e, parentSchema: r, it: n } = t;
    r.then === void 0 && r.else === void 0 && (0, qf.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = au(n, "then"), a = au(n, "else");
    if (!s && !a)
      return;
    const o = e.let("valid", !0), i = e.name("_valid");
    if (c(), t.reset(), s && a) {
      const l = e.let("ifClause");
      t.setParams({ ifClause: l }), e.if(i, d("then", l), d("else", l));
    } else s ? e.if(i, d("then")) : e.if((0, la.not)(i), d("else"));
    t.pass(o, () => t.error(!0));
    function c() {
      const l = t.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i);
      t.mergeEvaluated(l);
    }
    function d(l, f) {
      return () => {
        const _ = t.subschema({ keyword: l }, i);
        e.assign(o, i), t.mergeValidEvaluated(_, o), f ? e.assign(f, (0, la._)`${l}`) : t.setParams({ ifClause: l });
      };
    }
  }
};
function au(t, e) {
  const r = t.schema[e];
  return r !== void 0 && !(0, qf.alwaysValidSchema)(t, r);
}
Ji.default = t0;
var Xi = {};
Object.defineProperty(Xi, "__esModule", { value: !0 });
const r0 = x, n0 = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: t, parentSchema: e, it: r }) {
    e.if === void 0 && (0, r0.checkStrictMode)(r, `"${t}" without "if" is ignored`);
  }
};
Xi.default = n0;
Object.defineProperty(Fi, "__esModule", { value: !0 });
const s0 = on, a0 = Vi, o0 = cn, i0 = Ui, c0 = qi, l0 = Ia, u0 = xi, d0 = Oa, f0 = zi, h0 = Ki, m0 = Gi, p0 = Bi, y0 = Hi, $0 = Wi, g0 = Ji, _0 = Xi;
function v0(t = !1) {
  const e = [
    // any
    m0.default,
    p0.default,
    y0.default,
    $0.default,
    g0.default,
    _0.default,
    // object
    u0.default,
    d0.default,
    l0.default,
    f0.default,
    h0.default
  ];
  return t ? e.push(a0.default, i0.default) : e.push(s0.default, o0.default), e.push(c0.default), e;
}
Fi.default = v0;
var Yi = {}, ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
ln.dynamicAnchor = void 0;
const ro = ue, w0 = dt, ou = et, b0 = Jt, E0 = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (t) => xf(t, t.schema)
};
function xf(t, e) {
  const { gen: r, it: n } = t;
  n.schemaEnv.root.dynamicAnchors[e] = !0;
  const s = (0, ro._)`${w0.default.dynamicAnchors}${(0, ro.getProperty)(e)}`, a = n.errSchemaPath === "#" ? n.validateName : S0(t);
  r.if((0, ro._)`!${s}`, () => r.assign(s, a));
}
ln.dynamicAnchor = xf;
function S0(t) {
  const { schemaEnv: e, schema: r, self: n } = t.it, { root: s, baseId: a, localRefs: o, meta: i } = e.root, { schemaId: c } = n.opts, d = new ou.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: i });
  return ou.compileSchema.call(n, d), (0, b0.getValidate)(t, d);
}
ln.default = E0;
var un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
un.dynamicRef = void 0;
const iu = ue, P0 = dt, cu = Jt, R0 = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (t) => zf(t, t.schema)
};
function zf(t, e) {
  const { gen: r, keyword: n, it: s } = t;
  if (e[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = e.slice(1);
  if (s.allErrors)
    o();
  else {
    const c = r.let("valid", !1);
    o(c), t.ok(c);
  }
  function o(c) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, iu._)`${P0.default.dynamicAnchors}${(0, iu.getProperty)(a)}`);
      r.if(d, i(d, c), i(s.validateName, c));
    } else
      i(s.validateName, c)();
  }
  function i(c, d) {
    return d ? () => r.block(() => {
      (0, cu.callRef)(t, c), r.let(d, !0);
    }) : () => (0, cu.callRef)(t, c);
  }
}
un.dynamicRef = zf;
un.default = R0;
var Qi = {};
Object.defineProperty(Qi, "__esModule", { value: !0 });
const I0 = ln, O0 = x, N0 = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(t) {
    t.schema ? (0, I0.dynamicAnchor)(t, "") : (0, O0.checkStrictMode)(t.it, "$recursiveAnchor: false is ignored");
  }
};
Qi.default = N0;
var Zi = {};
Object.defineProperty(Zi, "__esModule", { value: !0 });
const A0 = un, T0 = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (t) => (0, A0.dynamicRef)(t, t.schema)
};
Zi.default = T0;
Object.defineProperty(Yi, "__esModule", { value: !0 });
const k0 = ln, C0 = un, j0 = Qi, D0 = Zi, M0 = [k0.default, C0.default, j0.default, D0.default];
Yi.default = M0;
var ec = {}, tc = {};
Object.defineProperty(tc, "__esModule", { value: !0 });
const lu = Ia, L0 = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: lu.error,
  code: (t) => (0, lu.validatePropertyDeps)(t)
};
tc.default = L0;
var rc = {};
Object.defineProperty(rc, "__esModule", { value: !0 });
const F0 = Ia, V0 = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (t) => (0, F0.validateSchemaDeps)(t)
};
rc.default = V0;
var nc = {};
Object.defineProperty(nc, "__esModule", { value: !0 });
const U0 = x, q0 = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: t, parentSchema: e, it: r }) {
    e.contains === void 0 && (0, U0.checkStrictMode)(r, `"${t}" without "contains" is ignored`);
  }
};
nc.default = q0;
Object.defineProperty(ec, "__esModule", { value: !0 });
const x0 = tc, z0 = rc, K0 = nc, G0 = [x0.default, z0.default, K0.default];
ec.default = G0;
var sc = {}, ac = {};
Object.defineProperty(ac, "__esModule", { value: !0 });
const or = ue, uu = x, B0 = dt, H0 = {
  message: "must NOT have unevaluated properties",
  params: ({ params: t }) => (0, or._)`{unevaluatedProperty: ${t.unevaluatedProperty}}`
}, W0 = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: H0,
  code(t) {
    const { gen: e, schema: r, data: n, errsCount: s, it: a } = t;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: i } = a;
    i instanceof or.Name ? e.if((0, or._)`${i} !== true`, () => e.forIn("key", n, (f) => e.if(d(i, f), () => c(f)))) : i !== !0 && e.forIn("key", n, (f) => i === void 0 ? c(f) : e.if(l(i, f), () => c(f))), a.props = !0, t.ok((0, or._)`${s} === ${B0.default.errors}`);
    function c(f) {
      if (r === !1) {
        t.setParams({ unevaluatedProperty: f }), t.error(), o || e.break();
        return;
      }
      if (!(0, uu.alwaysValidSchema)(a, r)) {
        const _ = e.name("valid");
        t.subschema({
          keyword: "unevaluatedProperties",
          dataProp: f,
          dataPropType: uu.Type.Str
        }, _), o || e.if((0, or.not)(_), () => e.break());
      }
    }
    function d(f, _) {
      return (0, or._)`!${f} || !${f}[${_}]`;
    }
    function l(f, _) {
      const m = [];
      for (const g in f)
        f[g] === !0 && m.push((0, or._)`${_} !== ${g}`);
      return (0, or.and)(...m);
    }
  }
};
ac.default = W0;
var oc = {};
Object.defineProperty(oc, "__esModule", { value: !0 });
const Er = ue, du = x, J0 = {
  message: ({ params: { len: t } }) => (0, Er.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Er._)`{limit: ${t}}`
}, X0 = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: J0,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t, a = s.items || 0;
    if (a === !0)
      return;
    const o = e.const("len", (0, Er._)`${n}.length`);
    if (r === !1)
      t.setParams({ len: a }), t.fail((0, Er._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, du.alwaysValidSchema)(s, r)) {
      const c = e.var("valid", (0, Er._)`${o} <= ${a}`);
      e.if((0, Er.not)(c), () => i(c, a)), t.ok(c);
    }
    s.items = !0;
    function i(c, d) {
      e.forRange("i", d, o, (l) => {
        t.subschema({ keyword: "unevaluatedItems", dataProp: l, dataPropType: du.Type.Num }, c), s.allErrors || e.if((0, Er.not)(c), () => e.break());
      });
    }
  }
};
oc.default = X0;
Object.defineProperty(sc, "__esModule", { value: !0 });
const Y0 = ac, Q0 = oc, Z0 = [Y0.default, Q0.default];
sc.default = Z0;
var ic = {}, cc = {};
Object.defineProperty(cc, "__esModule", { value: !0 });
const Re = ue, ev = {
  message: ({ schemaCode: t }) => (0, Re.str)`must match format "${t}"`,
  params: ({ schemaCode: t }) => (0, Re._)`{format: ${t}}`
}, tv = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: ev,
  code(t, e) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: i } = t, { opts: c, errSchemaPath: d, schemaEnv: l, self: f } = i;
    if (!c.validateFormats)
      return;
    s ? _() : m();
    function _() {
      const g = r.scopeValue("formats", {
        ref: f.formats,
        code: c.code.formats
      }), y = r.const("fDef", (0, Re._)`${g}[${o}]`), $ = r.let("fType"), p = r.let("format");
      r.if((0, Re._)`typeof ${y} == "object" && !(${y} instanceof RegExp)`, () => r.assign($, (0, Re._)`${y}.type || "string"`).assign(p, (0, Re._)`${y}.validate`), () => r.assign($, (0, Re._)`"string"`).assign(p, y)), t.fail$data((0, Re.or)(w(), S()));
      function w() {
        return c.strictSchema === !1 ? Re.nil : (0, Re._)`${o} && !${p}`;
      }
      function S() {
        const R = l.$async ? (0, Re._)`(${y}.async ? await ${p}(${n}) : ${p}(${n}))` : (0, Re._)`${p}(${n})`, A = (0, Re._)`(typeof ${p} == "function" ? ${R} : ${p}.test(${n}))`;
        return (0, Re._)`${p} && ${p} !== true && ${$} === ${e} && !${A}`;
      }
    }
    function m() {
      const g = f.formats[a];
      if (!g) {
        w();
        return;
      }
      if (g === !0)
        return;
      const [y, $, p] = S(g);
      y === e && t.pass(R());
      function w() {
        if (c.strictSchema === !1) {
          f.logger.warn(A());
          return;
        }
        throw new Error(A());
        function A() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function S(A) {
        const F = A instanceof RegExp ? (0, Re.regexpCode)(A) : c.code.formats ? (0, Re._)`${c.code.formats}${(0, Re.getProperty)(a)}` : void 0, V = r.scopeValue("formats", { key: a, ref: A, code: F });
        return typeof A == "object" && !(A instanceof RegExp) ? [A.type || "string", A.validate, (0, Re._)`${V}.validate`] : ["string", A, V];
      }
      function R() {
        if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
          if (!l.$async)
            throw new Error("async format in sync schema");
          return (0, Re._)`await ${p}(${n})`;
        }
        return typeof $ == "function" ? (0, Re._)`${p}(${n})` : (0, Re._)`${p}.test(${n})`;
      }
    }
  }
};
cc.default = tv;
Object.defineProperty(ic, "__esModule", { value: !0 });
const rv = cc, nv = [rv.default];
ic.default = nv;
var rn = {};
Object.defineProperty(rn, "__esModule", { value: !0 });
rn.contentVocabulary = rn.metadataVocabulary = void 0;
rn.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
rn.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Ei, "__esModule", { value: !0 });
const sv = Si, av = Ri, ov = Fi, iv = Yi, cv = ec, lv = sc, uv = ic, fu = rn, dv = [
  iv.default,
  sv.default,
  av.default,
  (0, ov.default)(!0),
  uv.default,
  fu.metadataVocabulary,
  fu.contentVocabulary,
  cv.default,
  lv.default
];
Ei.default = dv;
var lc = {}, Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
Na.DiscrError = void 0;
var hu;
(function(t) {
  t.Tag = "tag", t.Mapping = "mapping";
})(hu || (Na.DiscrError = hu = {}));
Object.defineProperty(lc, "__esModule", { value: !0 });
const zr = ue, To = Na, mu = et, fv = an, hv = x, mv = {
  message: ({ params: { discrError: t, tagName: e } }) => t === To.DiscrError.Tag ? `tag "${e}" must be string` : `value of tag "${e}" must be in oneOf`,
  params: ({ params: { discrError: t, tag: e, tagName: r } }) => (0, zr._)`{error: ${t}, tag: ${r}, tagValue: ${e}}`
}, pv = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: mv,
  code(t) {
    const { gen: e, data: r, schema: n, parentSchema: s, it: a } = t, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const i = n.propertyName;
    if (typeof i != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = e.let("valid", !1), d = e.const("tag", (0, zr._)`${r}${(0, zr.getProperty)(i)}`);
    e.if((0, zr._)`typeof ${d} == "string"`, () => l(), () => t.error(!1, { discrError: To.DiscrError.Tag, tag: d, tagName: i })), t.ok(c);
    function l() {
      const m = _();
      e.if(!1);
      for (const g in m)
        e.elseIf((0, zr._)`${d} === ${g}`), e.assign(c, f(m[g]));
      e.else(), t.error(!1, { discrError: To.DiscrError.Mapping, tag: d, tagName: i }), e.endIf();
    }
    function f(m) {
      const g = e.name("valid"), y = t.subschema({ keyword: "oneOf", schemaProp: m }, g);
      return t.mergeEvaluated(y, zr.Name), g;
    }
    function _() {
      var m;
      const g = {}, y = p(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let A = o[R];
        if (A != null && A.$ref && !(0, hv.schemaHasRulesButRef)(A, a.self.RULES)) {
          const V = A.$ref;
          if (A = mu.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, V), A instanceof mu.SchemaEnv && (A = A.schema), A === void 0)
            throw new fv.default(a.opts.uriResolver, a.baseId, V);
        }
        const F = (m = A == null ? void 0 : A.properties) === null || m === void 0 ? void 0 : m[i];
        if (typeof F != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${i}"`);
        $ = $ && (y || p(A)), w(F, R);
      }
      if (!$)
        throw new Error(`discriminator: "${i}" must be required`);
      return g;
      function p({ required: R }) {
        return Array.isArray(R) && R.includes(i);
      }
      function w(R, A) {
        if (R.const)
          S(R.const, A);
        else if (R.enum)
          for (const F of R.enum)
            S(F, A);
        else
          throw new Error(`discriminator: "properties/${i}" must have "const" or "enum"`);
      }
      function S(R, A) {
        if (typeof R != "string" || R in g)
          throw new Error(`discriminator: "${i}" values must be unique strings`);
        g[R] = A;
      }
    }
  }
};
lc.default = pv;
var uc = {};
const yv = "https://json-schema.org/draft/2020-12/schema", $v = "https://json-schema.org/draft/2020-12/schema", gv = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, _v = "meta", vv = "Core and Validation specifications meta-schema", wv = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], bv = [
  "object",
  "boolean"
], Ev = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Sv = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, Pv = {
  $schema: yv,
  $id: $v,
  $vocabulary: gv,
  $dynamicAnchor: _v,
  title: vv,
  allOf: wv,
  type: bv,
  $comment: Ev,
  properties: Sv
}, Rv = "https://json-schema.org/draft/2020-12/schema", Iv = "https://json-schema.org/draft/2020-12/meta/applicator", Ov = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, Nv = "meta", Av = "Applicator vocabulary meta-schema", Tv = [
  "object",
  "boolean"
], kv = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Cv = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, jv = {
  $schema: Rv,
  $id: Iv,
  $vocabulary: Ov,
  $dynamicAnchor: Nv,
  title: Av,
  type: Tv,
  properties: kv,
  $defs: Cv
}, Dv = "https://json-schema.org/draft/2020-12/schema", Mv = "https://json-schema.org/draft/2020-12/meta/unevaluated", Lv = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, Fv = "meta", Vv = "Unevaluated applicator vocabulary meta-schema", Uv = [
  "object",
  "boolean"
], qv = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, xv = {
  $schema: Dv,
  $id: Mv,
  $vocabulary: Lv,
  $dynamicAnchor: Fv,
  title: Vv,
  type: Uv,
  properties: qv
}, zv = "https://json-schema.org/draft/2020-12/schema", Kv = "https://json-schema.org/draft/2020-12/meta/content", Gv = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Bv = "meta", Hv = "Content vocabulary meta-schema", Wv = [
  "object",
  "boolean"
], Jv = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Xv = {
  $schema: zv,
  $id: Kv,
  $vocabulary: Gv,
  $dynamicAnchor: Bv,
  title: Hv,
  type: Wv,
  properties: Jv
}, Yv = "https://json-schema.org/draft/2020-12/schema", Qv = "https://json-schema.org/draft/2020-12/meta/core", Zv = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, ew = "meta", tw = "Core vocabulary meta-schema", rw = [
  "object",
  "boolean"
], nw = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, sw = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, aw = {
  $schema: Yv,
  $id: Qv,
  $vocabulary: Zv,
  $dynamicAnchor: ew,
  title: tw,
  type: rw,
  properties: nw,
  $defs: sw
}, ow = "https://json-schema.org/draft/2020-12/schema", iw = "https://json-schema.org/draft/2020-12/meta/format-annotation", cw = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, lw = "meta", uw = "Format vocabulary meta-schema for annotation results", dw = [
  "object",
  "boolean"
], fw = {
  format: {
    type: "string"
  }
}, hw = {
  $schema: ow,
  $id: iw,
  $vocabulary: cw,
  $dynamicAnchor: lw,
  title: uw,
  type: dw,
  properties: fw
}, mw = "https://json-schema.org/draft/2020-12/schema", pw = "https://json-schema.org/draft/2020-12/meta/meta-data", yw = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, $w = "meta", gw = "Meta-data vocabulary meta-schema", _w = [
  "object",
  "boolean"
], vw = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, ww = {
  $schema: mw,
  $id: pw,
  $vocabulary: yw,
  $dynamicAnchor: $w,
  title: gw,
  type: _w,
  properties: vw
}, bw = "https://json-schema.org/draft/2020-12/schema", Ew = "https://json-schema.org/draft/2020-12/meta/validation", Sw = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Pw = "meta", Rw = "Validation vocabulary meta-schema", Iw = [
  "object",
  "boolean"
], Ow = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, Nw = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Aw = {
  $schema: bw,
  $id: Ew,
  $vocabulary: Sw,
  $dynamicAnchor: Pw,
  title: Rw,
  type: Iw,
  properties: Ow,
  $defs: Nw
};
Object.defineProperty(uc, "__esModule", { value: !0 });
const Tw = Pv, kw = jv, Cw = xv, jw = Xv, Dw = aw, Mw = hw, Lw = ww, Fw = Aw, Vw = ["/properties"];
function Uw(t) {
  return [
    Tw,
    kw,
    Cw,
    jw,
    Dw,
    e(this, Mw),
    Lw,
    e(this, Fw)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function e(r, n) {
    return t ? r.$dataMetaSchema(n, Vw) : n;
  }
}
uc.default = Uw;
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv2020 = void 0;
  const r = Bd, n = Ei, s = lc, a = uc, o = "https://json-schema.org/draft/2020-12/schema";
  class i extends r.default {
    constructor(m = {}) {
      super({
        ...m,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: m, meta: g } = this.opts;
      g && (a.default.call(this, m), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  e.Ajv2020 = i, t.exports = e = i, t.exports.Ajv2020 = i, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = i;
  var c = St;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = ue;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var l = $i();
  Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
    return l.default;
  } });
  var f = an;
  Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
    return f.default;
  } });
})(So, So.exports);
var qw = So.exports, ko = { exports: {} }, Kf = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.formatNames = t.fastFormats = t.fullFormats = void 0;
  function e(L, W) {
    return { validate: L, compare: W };
  }
  t.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: e(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: e(c(!0), d),
    "date-time": e(_(!0), m),
    "iso-time": e(c(), l),
    "iso-date-time": e(_(), g),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: p,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: ae,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: S,
    // signed 32 bit integer
    int32: { type: "number", validate: F },
    // signed 64 bit integer
    int64: { type: "number", validate: V },
    // C-type float
    float: { type: "number", validate: ie },
    // C-type double
    double: { type: "number", validate: ie },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, t.fastFormats = {
    ...t.fullFormats,
    date: e(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, m),
    "iso-time": e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, l),
    "iso-date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, g),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, t.formatNames = Object.keys(t.fullFormats);
  function r(L) {
    return L % 4 === 0 && (L % 100 !== 0 || L % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(L) {
    const W = n.exec(L);
    if (!W)
      return !1;
    const ee = +W[1], k = +W[2], M = +W[3];
    return k >= 1 && k <= 12 && M >= 1 && M <= (k === 2 && r(ee) ? 29 : s[k]);
  }
  function o(L, W) {
    if (L && W)
      return L > W ? 1 : L < W ? -1 : 0;
  }
  const i = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function c(L) {
    return function(ee) {
      const k = i.exec(ee);
      if (!k)
        return !1;
      const M = +k[1], B = +k[2], z = +k[3], Y = k[4], G = k[5] === "-" ? -1 : 1, I = +(k[6] || 0), v = +(k[7] || 0);
      if (I > 23 || v > 59 || L && !Y)
        return !1;
      if (M <= 23 && B <= 59 && z < 60)
        return !0;
      const P = B - v * G, b = M - I * G - (P < 0 ? 1 : 0);
      return (b === 23 || b === -1) && (P === 59 || P === -1) && z < 61;
    };
  }
  function d(L, W) {
    if (!(L && W))
      return;
    const ee = (/* @__PURE__ */ new Date("2020-01-01T" + L)).valueOf(), k = (/* @__PURE__ */ new Date("2020-01-01T" + W)).valueOf();
    if (ee && k)
      return ee - k;
  }
  function l(L, W) {
    if (!(L && W))
      return;
    const ee = i.exec(L), k = i.exec(W);
    if (ee && k)
      return L = ee[1] + ee[2] + ee[3], W = k[1] + k[2] + k[3], L > W ? 1 : L < W ? -1 : 0;
  }
  const f = /t|\s/i;
  function _(L) {
    const W = c(L);
    return function(k) {
      const M = k.split(f);
      return M.length === 2 && a(M[0]) && W(M[1]);
    };
  }
  function m(L, W) {
    if (!(L && W))
      return;
    const ee = new Date(L).valueOf(), k = new Date(W).valueOf();
    if (ee && k)
      return ee - k;
  }
  function g(L, W) {
    if (!(L && W))
      return;
    const [ee, k] = L.split(f), [M, B] = W.split(f), z = o(ee, M);
    if (z !== void 0)
      return z || d(k, B);
  }
  const y = /\/|:/, $ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function p(L) {
    return y.test(L) && $.test(L);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function S(L) {
    return w.lastIndex = 0, w.test(L);
  }
  const R = -2147483648, A = 2 ** 31 - 1;
  function F(L) {
    return Number.isInteger(L) && L <= A && L >= R;
  }
  function V(L) {
    return Number.isInteger(L);
  }
  function ie() {
    return !0;
  }
  const te = /[^\\]\\Z/;
  function ae(L) {
    if (te.test(L))
      return !1;
    try {
      return new RegExp(L), !0;
    } catch {
      return !1;
    }
  }
})(Kf);
var Gf = {}, Co = { exports: {} }, Bf = {}, Ft = {}, $r = {}, ns = {}, me = {}, Zn = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
  class e {
  }
  t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends e {
    constructor(w) {
      if (super(), !t.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = r;
  class n extends e {
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((S, R) => `${S}${R}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((S, R) => (R instanceof r && (S[R.str] = (S[R.str] || 0) + 1), S), {});
    }
  }
  t._Code = n, t.nil = new n("");
  function s(p, ...w) {
    const S = [p[0]];
    let R = 0;
    for (; R < w.length; )
      i(S, w[R]), S.push(p[++R]);
    return new n(S);
  }
  t._ = s;
  const a = new n("+");
  function o(p, ...w) {
    const S = [m(p[0])];
    let R = 0;
    for (; R < w.length; )
      S.push(a), i(S, w[R]), S.push(a, m(p[++R]));
    return c(S), new n(S);
  }
  t.str = o;
  function i(p, w) {
    w instanceof n ? p.push(...w._items) : w instanceof r ? p.push(w) : p.push(f(w));
  }
  t.addCodeArg = i;
  function c(p) {
    let w = 1;
    for (; w < p.length - 1; ) {
      if (p[w] === a) {
        const S = d(p[w - 1], p[w + 1]);
        if (S !== void 0) {
          p.splice(w - 1, 3, S);
          continue;
        }
        p[w++] = "+";
      }
      w++;
    }
  }
  function d(p, w) {
    if (w === '""')
      return p;
    if (p === '""')
      return w;
    if (typeof p == "string")
      return w instanceof r || p[p.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${p.slice(0, -1)}${w}"` : w[0] === '"' ? p.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(p instanceof r))
      return `"${p}${w.slice(1)}`;
  }
  function l(p, w) {
    return w.emptyStr() ? p : p.emptyStr() ? w : o`${p}${w}`;
  }
  t.strConcat = l;
  function f(p) {
    return typeof p == "number" || typeof p == "boolean" || p === null ? p : m(Array.isArray(p) ? p.join(",") : p);
  }
  function _(p) {
    return new n(m(p));
  }
  t.stringify = _;
  function m(p) {
    return JSON.stringify(p).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  t.safeStringify = m;
  function g(p) {
    return typeof p == "string" && t.IDENTIFIER.test(p) ? new n(`.${p}`) : s`[${p}]`;
  }
  t.getProperty = g;
  function y(p) {
    if (typeof p == "string" && t.IDENTIFIER.test(p))
      return new n(`${p}`);
    throw new Error(`CodeGen: invalid export name: ${p}, use explicit $id name mapping`);
  }
  t.getEsmExportName = y;
  function $(p) {
    return new n(p.toString());
  }
  t.regexpCode = $;
})(Zn);
var jo = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
  const e = Zn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (t.UsedValueState = n = {})), t.varKinds = {
    const: new e.Name("const"),
    let: new e.Name("let"),
    var: new e.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: l } = {}) {
      this._names = {}, this._prefixes = d, this._parent = l;
    }
    toName(d) {
      return d instanceof e.Name ? d : this.name(d);
    }
    name(d) {
      return new e.Name(this._newName(d));
    }
    _newName(d) {
      const l = this._names[d] || this._nameGroup(d);
      return `${d}${l.index++}`;
    }
    _nameGroup(d) {
      var l, f;
      if (!((f = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || f === void 0) && f.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  t.Scope = s;
  class a extends e.Name {
    constructor(d, l) {
      super(l), this.prefix = d;
    }
    setValue(d, { property: l, itemIndex: f }) {
      this.value = d, this.scopePath = (0, e._)`.${new e.Name(l)}[${f}]`;
    }
  }
  t.ValueScopeName = a;
  const o = (0, e._)`\n`;
  class i extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : e.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, l) {
      var f;
      if (l.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const _ = this.toName(d), { prefix: m } = _, g = (f = l.key) !== null && f !== void 0 ? f : l.ref;
      let y = this._values[m];
      if (y) {
        const w = y.get(g);
        if (w)
          return w;
      } else
        y = this._values[m] = /* @__PURE__ */ new Map();
      y.set(g, _);
      const $ = this._scope[m] || (this._scope[m] = []), p = $.length;
      return $[p] = l.ref, _.setValue(l, { property: m, itemIndex: p }), _;
    }
    getValue(d, l) {
      const f = this._values[d];
      if (f)
        return f.get(l);
    }
    scopeRefs(d, l = this._values) {
      return this._reduceValues(l, (f) => {
        if (f.scopePath === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return (0, e._)`${d}${f.scopePath}`;
      });
    }
    scopeCode(d = this._values, l, f) {
      return this._reduceValues(d, (_) => {
        if (_.value === void 0)
          throw new Error(`CodeGen: name "${_}" has no value`);
        return _.value.code;
      }, l, f);
    }
    _reduceValues(d, l, f = {}, _) {
      let m = e.nil;
      for (const g in d) {
        const y = d[g];
        if (!y)
          continue;
        const $ = f[g] = f[g] || /* @__PURE__ */ new Map();
        y.forEach((p) => {
          if ($.has(p))
            return;
          $.set(p, n.Started);
          let w = l(p);
          if (w) {
            const S = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
            m = (0, e._)`${m}${S} ${p} = ${w};${this.opts._n}`;
          } else if (w = _ == null ? void 0 : _(p))
            m = (0, e._)`${m}${w}${this.opts._n}`;
          else
            throw new r(p);
          $.set(p, n.Completed);
        });
      }
      return m;
    }
  }
  t.ValueScope = i;
})(jo);
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
  const e = Zn, r = jo;
  var n = Zn;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = jo;
  Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), t.operators = {
    GT: new e._Code(">"),
    GTE: new e._Code(">="),
    LT: new e._Code("<"),
    LTE: new e._Code("<="),
    EQ: new e._Code("==="),
    NEQ: new e._Code("!=="),
    NOT: new e._Code("!"),
    OR: new e._Code("||"),
    AND: new e._Code("&&"),
    ADD: new e._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(u, h) {
      return this;
    }
  }
  class o extends a {
    constructor(u, h, E) {
      super(), this.varKind = u, this.name = h, this.rhs = E;
    }
    render({ es5: u, _n: h }) {
      const E = u ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${C};` + h;
    }
    optimizeNames(u, h) {
      if (u[this.name.str])
        return this.rhs && (this.rhs = k(this.rhs, u, h)), this;
    }
    get names() {
      return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
    }
  }
  class i extends a {
    constructor(u, h, E) {
      super(), this.lhs = u, this.rhs = h, this.sideEffects = E;
    }
    render({ _n: u }) {
      return `${this.lhs} = ${this.rhs};` + u;
    }
    optimizeNames(u, h) {
      if (!(this.lhs instanceof e.Name && !u[this.lhs.str] && !this.sideEffects))
        return this.rhs = k(this.rhs, u, h), this;
    }
    get names() {
      const u = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
      return ee(u, this.rhs);
    }
  }
  class c extends i {
    constructor(u, h, E, C) {
      super(u, E, C), this.op = h;
    }
    render({ _n: u }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + u;
    }
  }
  class d extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `${this.label}:` + u;
    }
  }
  class l extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `break${this.label ? ` ${this.label}` : ""};` + u;
    }
  }
  class f extends a {
    constructor(u) {
      super(), this.error = u;
    }
    render({ _n: u }) {
      return `throw ${this.error};` + u;
    }
    get names() {
      return this.error.names;
    }
  }
  class _ extends a {
    constructor(u) {
      super(), this.code = u;
    }
    render({ _n: u }) {
      return `${this.code};` + u;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(u, h) {
      return this.code = k(this.code, u, h), this;
    }
    get names() {
      return this.code instanceof e._CodeOrName ? this.code.names : {};
    }
  }
  class m extends a {
    constructor(u = []) {
      super(), this.nodes = u;
    }
    render(u) {
      return this.nodes.reduce((h, E) => h + E.render(u), "");
    }
    optimizeNodes() {
      const { nodes: u } = this;
      let h = u.length;
      for (; h--; ) {
        const E = u[h].optimizeNodes();
        Array.isArray(E) ? u.splice(h, 1, ...E) : E ? u[h] = E : u.splice(h, 1);
      }
      return u.length > 0 ? this : void 0;
    }
    optimizeNames(u, h) {
      const { nodes: E } = this;
      let C = E.length;
      for (; C--; ) {
        const j = E[C];
        j.optimizeNames(u, h) || (M(u, j.names), E.splice(C, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((u, h) => W(u, h.names), {});
    }
  }
  class g extends m {
    render(u) {
      return "{" + u._n + super.render(u) + "}" + u._n;
    }
  }
  class y extends m {
  }
  class $ extends g {
  }
  $.kind = "else";
  class p extends g {
    constructor(u, h) {
      super(h), this.condition = u;
    }
    render(u) {
      let h = `if(${this.condition})` + super.render(u);
      return this.else && (h += "else " + this.else.render(u)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const u = this.condition;
      if (u === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const E = h.optimizeNodes();
        h = this.else = Array.isArray(E) ? new $(E) : E;
      }
      if (h)
        return u === !1 ? h instanceof p ? h : h.nodes : this.nodes.length ? this : new p(B(u), h instanceof p ? [h] : h.nodes);
      if (!(u === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(u, h) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(u, h), !!(super.optimizeNames(u, h) || this.else))
        return this.condition = k(this.condition, u, h), this;
    }
    get names() {
      const u = super.names;
      return ee(u, this.condition), this.else && W(u, this.else.names), u;
    }
  }
  p.kind = "if";
  class w extends g {
  }
  w.kind = "for";
  class S extends w {
    constructor(u) {
      super(), this.iteration = u;
    }
    render(u) {
      return `for(${this.iteration})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iteration = k(this.iteration, u, h), this;
    }
    get names() {
      return W(super.names, this.iteration.names);
    }
  }
  class R extends w {
    constructor(u, h, E, C) {
      super(), this.varKind = u, this.name = h, this.from = E, this.to = C;
    }
    render(u) {
      const h = u.es5 ? r.varKinds.var : this.varKind, { name: E, from: C, to: j } = this;
      return `for(${h} ${E}=${C}; ${E}<${j}; ${E}++)` + super.render(u);
    }
    get names() {
      const u = ee(super.names, this.from);
      return ee(u, this.to);
    }
  }
  class A extends w {
    constructor(u, h, E, C) {
      super(), this.loop = u, this.varKind = h, this.name = E, this.iterable = C;
    }
    render(u) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iterable = k(this.iterable, u, h), this;
    }
    get names() {
      return W(super.names, this.iterable.names);
    }
  }
  class F extends g {
    constructor(u, h, E) {
      super(), this.name = u, this.args = h, this.async = E;
    }
    render(u) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(u);
    }
  }
  F.kind = "func";
  class V extends m {
    render(u) {
      return "return " + super.render(u);
    }
  }
  V.kind = "return";
  class ie extends g {
    render(u) {
      let h = "try" + super.render(u);
      return this.catch && (h += this.catch.render(u)), this.finally && (h += this.finally.render(u)), h;
    }
    optimizeNodes() {
      var u, h;
      return super.optimizeNodes(), (u = this.catch) === null || u === void 0 || u.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(u, h) {
      var E, C;
      return super.optimizeNames(u, h), (E = this.catch) === null || E === void 0 || E.optimizeNames(u, h), (C = this.finally) === null || C === void 0 || C.optimizeNames(u, h), this;
    }
    get names() {
      const u = super.names;
      return this.catch && W(u, this.catch.names), this.finally && W(u, this.finally.names), u;
    }
  }
  class te extends g {
    constructor(u) {
      super(), this.error = u;
    }
    render(u) {
      return `catch(${this.error})` + super.render(u);
    }
  }
  te.kind = "catch";
  class ae extends g {
    render(u) {
      return "finally" + super.render(u);
    }
  }
  ae.kind = "finally";
  class L {
    constructor(u, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = u, this._scope = new r.Scope({ parent: u }), this._nodes = [new y()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(u) {
      return this._scope.name(u);
    }
    // reserves unique name in the external scope
    scopeName(u) {
      return this._extScope.name(u);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(u, h) {
      const E = this._extScope.value(u, h);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(u, h) {
      return this._extScope.getValue(u, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(u) {
      return this._extScope.scopeRefs(u, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(u, h, E, C) {
      const j = this._scope.toName(h);
      return E !== void 0 && C && (this._constants[j.str] = E), this._leafNode(new o(u, j, E)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(u, h, E) {
      return this._def(r.varKinds.const, u, h, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(u, h, E) {
      return this._def(r.varKinds.let, u, h, E);
    }
    // `var` declaration with optional assignment
    var(u, h, E) {
      return this._def(r.varKinds.var, u, h, E);
    }
    // assignment code
    assign(u, h, E) {
      return this._leafNode(new i(u, h, E));
    }
    // `+=` code
    add(u, h) {
      return this._leafNode(new c(u, t.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(u) {
      return typeof u == "function" ? u() : u !== e.nil && this._leafNode(new _(u)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...u) {
      const h = ["{"];
      for (const [E, C] of u)
        h.length > 1 && h.push(","), h.push(E), (E !== C || this.opts.es5) && (h.push(":"), (0, e.addCodeArg)(h, C));
      return h.push("}"), new e._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(u, h, E) {
      if (this._blockNode(new p(u)), h && E)
        this.code(h).else().code(E).endIf();
      else if (h)
        this.code(h).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(u) {
      return this._elseNode(new p(u));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(p, $);
    }
    _for(u, h) {
      return this._blockNode(u), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(u, h) {
      return this._for(new S(u), h);
    }
    // `for` statement for a range of values
    forRange(u, h, E, C, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const J = this._scope.toName(u);
      return this._for(new R(j, J, h, E), () => C(J));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(u, h, E, C = r.varKinds.const) {
      const j = this._scope.toName(u);
      if (this.opts.es5) {
        const J = h instanceof e.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, e._)`${J}.length`, (H) => {
          this.var(j, (0, e._)`${J}[${H}]`), E(j);
        });
      }
      return this._for(new A("of", C, j, h), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(u, h, E, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(u, (0, e._)`Object.keys(${h})`, E);
      const j = this._scope.toName(u);
      return this._for(new A("in", C, j, h), () => E(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(u) {
      return this._leafNode(new d(u));
    }
    // `break` statement
    break(u) {
      return this._leafNode(new l(u));
    }
    // `return` statement
    return(u) {
      const h = new V();
      if (this._blockNode(h), this.code(u), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(V);
    }
    // `try` statement
    try(u, h, E) {
      if (!h && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new ie();
      if (this._blockNode(C), this.code(u), h) {
        const j = this.name("e");
        this._currNode = C.catch = new te(j), h(j);
      }
      return E && (this._currNode = C.finally = new ae(), this.code(E)), this._endBlockNode(te, ae);
    }
    // `throw` statement
    throw(u) {
      return this._leafNode(new f(u));
    }
    // start self-balancing block
    block(u, h) {
      return this._blockStarts.push(this._nodes.length), u && this.code(u).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(u) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - h;
      if (E < 0 || u !== void 0 && E !== u)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${u} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(u, h = e.nil, E, C) {
      return this._blockNode(new F(u, h, E)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(F);
    }
    optimize(u = 1) {
      for (; u-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(u) {
      return this._currNode.nodes.push(u), this;
    }
    _blockNode(u) {
      this._currNode.nodes.push(u), this._nodes.push(u);
    }
    _endBlockNode(u, h) {
      const E = this._currNode;
      if (E instanceof u || h && E instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${u.kind}/${h.kind}` : u.kind}"`);
    }
    _elseNode(u) {
      const h = this._currNode;
      if (!(h instanceof p))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = u, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const u = this._nodes;
      return u[u.length - 1];
    }
    set _currNode(u) {
      const h = this._nodes;
      h[h.length - 1] = u;
    }
  }
  t.CodeGen = L;
  function W(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) + (u[h] || 0);
    return b;
  }
  function ee(b, u) {
    return u instanceof e._CodeOrName ? W(b, u.names) : b;
  }
  function k(b, u, h) {
    if (b instanceof e.Name)
      return E(b);
    if (!C(b))
      return b;
    return new e._Code(b._items.reduce((j, J) => (J instanceof e.Name && (J = E(J)), J instanceof e._Code ? j.push(...J._items) : j.push(J), j), []));
    function E(j) {
      const J = h[j.str];
      return J === void 0 || u[j.str] !== 1 ? j : (delete u[j.str], J);
    }
    function C(j) {
      return j instanceof e._Code && j._items.some((J) => J instanceof e.Name && u[J.str] === 1 && h[J.str] !== void 0);
    }
  }
  function M(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) - (u[h] || 0);
  }
  function B(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, e._)`!${P(b)}`;
  }
  t.not = B;
  const z = v(t.operators.AND);
  function Y(...b) {
    return b.reduce(z);
  }
  t.and = Y;
  const G = v(t.operators.OR);
  function I(...b) {
    return b.reduce(G);
  }
  t.or = I;
  function v(b) {
    return (u, h) => u === e.nil ? h : h === e.nil ? u : (0, e._)`${P(u)} ${b} ${P(h)}`;
  }
  function P(b) {
    return b instanceof e.Name ? b : (0, e._)`(${b})`;
  }
})(me);
var K = {};
Object.defineProperty(K, "__esModule", { value: !0 });
K.checkStrictMode = K.getErrorPath = K.Type = K.useFunc = K.setEvaluated = K.evaluatedPropsToName = K.mergeEvaluated = K.eachItem = K.unescapeJsonPointer = K.escapeJsonPointer = K.escapeFragment = K.unescapeFragment = K.schemaRefOrVal = K.schemaHasRulesButRef = K.schemaHasRules = K.checkUnknownRules = K.alwaysValidSchema = K.toHash = void 0;
const _e = me, xw = Zn;
function zw(t) {
  const e = {};
  for (const r of t)
    e[r] = !0;
  return e;
}
K.toHash = zw;
function Kw(t, e) {
  return typeof e == "boolean" ? e : Object.keys(e).length === 0 ? !0 : (Hf(t, e), !Wf(e, t.self.RULES.all));
}
K.alwaysValidSchema = Kw;
function Hf(t, e = t.schema) {
  const { opts: r, self: n } = t;
  if (!r.strictSchema || typeof e == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in e)
    s[a] || Yf(t, `unknown keyword: "${a}"`);
}
K.checkUnknownRules = Hf;
function Wf(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e[r])
      return !0;
  return !1;
}
K.schemaHasRules = Wf;
function Gw(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (r !== "$ref" && e.all[r])
      return !0;
  return !1;
}
K.schemaHasRulesButRef = Gw;
function Bw({ topSchemaRef: t, schemaPath: e }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, _e._)`${r}`;
  }
  return (0, _e._)`${t}${e}${(0, _e.getProperty)(n)}`;
}
K.schemaRefOrVal = Bw;
function Hw(t) {
  return Jf(decodeURIComponent(t));
}
K.unescapeFragment = Hw;
function Ww(t) {
  return encodeURIComponent(dc(t));
}
K.escapeFragment = Ww;
function dc(t) {
  return typeof t == "number" ? `${t}` : t.replace(/~/g, "~0").replace(/\//g, "~1");
}
K.escapeJsonPointer = dc;
function Jf(t) {
  return t.replace(/~1/g, "/").replace(/~0/g, "~");
}
K.unescapeJsonPointer = Jf;
function Jw(t, e) {
  if (Array.isArray(t))
    for (const r of t)
      e(r);
  else
    e(t);
}
K.eachItem = Jw;
function pu({ mergeNames: t, mergeToName: e, mergeValues: r, resultToName: n }) {
  return (s, a, o, i) => {
    const c = o === void 0 ? a : o instanceof _e.Name ? (a instanceof _e.Name ? t(s, a, o) : e(s, a, o), o) : a instanceof _e.Name ? (e(s, o, a), a) : r(a, o);
    return i === _e.Name && !(c instanceof _e.Name) ? n(s, c) : c;
  };
}
K.mergeEvaluated = {
  props: pu({
    mergeNames: (t, e, r) => t.if((0, _e._)`${r} !== true && ${e} !== undefined`, () => {
      t.if((0, _e._)`${e} === true`, () => t.assign(r, !0), () => t.assign(r, (0, _e._)`${r} || {}`).code((0, _e._)`Object.assign(${r}, ${e})`));
    }),
    mergeToName: (t, e, r) => t.if((0, _e._)`${r} !== true`, () => {
      e === !0 ? t.assign(r, !0) : (t.assign(r, (0, _e._)`${r} || {}`), fc(t, r, e));
    }),
    mergeValues: (t, e) => t === !0 ? !0 : { ...t, ...e },
    resultToName: Xf
  }),
  items: pu({
    mergeNames: (t, e, r) => t.if((0, _e._)`${r} !== true && ${e} !== undefined`, () => t.assign(r, (0, _e._)`${e} === true ? true : ${r} > ${e} ? ${r} : ${e}`)),
    mergeToName: (t, e, r) => t.if((0, _e._)`${r} !== true`, () => t.assign(r, e === !0 ? !0 : (0, _e._)`${r} > ${e} ? ${r} : ${e}`)),
    mergeValues: (t, e) => t === !0 ? !0 : Math.max(t, e),
    resultToName: (t, e) => t.var("items", e)
  })
};
function Xf(t, e) {
  if (e === !0)
    return t.var("props", !0);
  const r = t.var("props", (0, _e._)`{}`);
  return e !== void 0 && fc(t, r, e), r;
}
K.evaluatedPropsToName = Xf;
function fc(t, e, r) {
  Object.keys(r).forEach((n) => t.assign((0, _e._)`${e}${(0, _e.getProperty)(n)}`, !0));
}
K.setEvaluated = fc;
const yu = {};
function Xw(t, e) {
  return t.scopeValue("func", {
    ref: e,
    code: yu[e.code] || (yu[e.code] = new xw._Code(e.code))
  });
}
K.useFunc = Xw;
var Do;
(function(t) {
  t[t.Num = 0] = "Num", t[t.Str = 1] = "Str";
})(Do || (K.Type = Do = {}));
function Yw(t, e, r) {
  if (t instanceof _e.Name) {
    const n = e === Do.Num;
    return r ? n ? (0, _e._)`"[" + ${t} + "]"` : (0, _e._)`"['" + ${t} + "']"` : n ? (0, _e._)`"/" + ${t}` : (0, _e._)`"/" + ${t}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, _e.getProperty)(t).toString() : "/" + dc(t);
}
K.getErrorPath = Yw;
function Yf(t, e, r = t.opts.strictSchema) {
  if (r) {
    if (e = `strict mode: ${e}`, r === !0)
      throw new Error(e);
    t.self.logger.warn(e);
  }
}
K.checkStrictMode = Yf;
var Mt = {};
Object.defineProperty(Mt, "__esModule", { value: !0 });
const We = me, Qw = {
  // validation function arguments
  data: new We.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new We.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new We.Name("instancePath"),
  parentData: new We.Name("parentData"),
  parentDataProperty: new We.Name("parentDataProperty"),
  rootData: new We.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new We.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new We.Name("vErrors"),
  // null or array of validation errors
  errors: new We.Name("errors"),
  // counter of validation errors
  this: new We.Name("this"),
  // "globals"
  self: new We.Name("self"),
  scope: new We.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new We.Name("json"),
  jsonPos: new We.Name("jsonPos"),
  jsonLen: new We.Name("jsonLen"),
  jsonPart: new We.Name("jsonPart")
};
Mt.default = Qw;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
  const e = me, r = K, n = Mt;
  t.keywordError = {
    message: ({ keyword: $ }) => (0, e.str)`must pass "${$}" keyword validation`
  }, t.keyword$DataError = {
    message: ({ keyword: $, schemaType: p }) => p ? (0, e.str)`"${$}" keyword must be ${p} ($data)` : (0, e.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, p = t.keywordError, w, S) {
    const { it: R } = $, { gen: A, compositeRule: F, allErrors: V } = R, ie = f($, p, w);
    S ?? (F || V) ? c(A, ie) : d(R, (0, e._)`[${ie}]`);
  }
  t.reportError = s;
  function a($, p = t.keywordError, w) {
    const { it: S } = $, { gen: R, compositeRule: A, allErrors: F } = S, V = f($, p, w);
    c(R, V), A || F || d(S, n.default.vErrors);
  }
  t.reportExtraError = a;
  function o($, p) {
    $.assign(n.default.errors, p), $.if((0, e._)`${n.default.vErrors} !== null`, () => $.if(p, () => $.assign((0, e._)`${n.default.vErrors}.length`, p), () => $.assign(n.default.vErrors, null)));
  }
  t.resetErrorsCount = o;
  function i({ gen: $, keyword: p, schemaValue: w, data: S, errsCount: R, it: A }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const F = $.name("err");
    $.forRange("i", R, n.default.errors, (V) => {
      $.const(F, (0, e._)`${n.default.vErrors}[${V}]`), $.if((0, e._)`${F}.instancePath === undefined`, () => $.assign((0, e._)`${F}.instancePath`, (0, e.strConcat)(n.default.instancePath, A.errorPath))), $.assign((0, e._)`${F}.schemaPath`, (0, e.str)`${A.errSchemaPath}/${p}`), A.opts.verbose && ($.assign((0, e._)`${F}.schema`, w), $.assign((0, e._)`${F}.data`, S));
    });
  }
  t.extendErrors = i;
  function c($, p) {
    const w = $.const("err", p);
    $.if((0, e._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, e._)`[${w}]`), (0, e._)`${n.default.vErrors}.push(${w})`), $.code((0, e._)`${n.default.errors}++`);
  }
  function d($, p) {
    const { gen: w, validateName: S, schemaEnv: R } = $;
    R.$async ? w.throw((0, e._)`new ${$.ValidationError}(${p})`) : (w.assign((0, e._)`${S}.errors`, p), w.return(!1));
  }
  const l = {
    keyword: new e.Name("keyword"),
    schemaPath: new e.Name("schemaPath"),
    // also used in JTD errors
    params: new e.Name("params"),
    propertyName: new e.Name("propertyName"),
    message: new e.Name("message"),
    schema: new e.Name("schema"),
    parentSchema: new e.Name("parentSchema")
  };
  function f($, p, w) {
    const { createErrors: S } = $.it;
    return S === !1 ? (0, e._)`{}` : _($, p, w);
  }
  function _($, p, w = {}) {
    const { gen: S, it: R } = $, A = [
      m(R, w),
      g($, w)
    ];
    return y($, p, A), S.object(...A);
  }
  function m({ errorPath: $ }, { instancePath: p }) {
    const w = p ? (0, e.str)`${$}${(0, r.getErrorPath)(p, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, w)];
  }
  function g({ keyword: $, it: { errSchemaPath: p } }, { schemaPath: w, parentSchema: S }) {
    let R = S ? p : (0, e.str)`${p}/${$}`;
    return w && (R = (0, e.str)`${R}${(0, r.getErrorPath)(w, r.Type.Str)}`), [l.schemaPath, R];
  }
  function y($, { params: p, message: w }, S) {
    const { keyword: R, data: A, schemaValue: F, it: V } = $, { opts: ie, propertyName: te, topSchemaRef: ae, schemaPath: L } = V;
    S.push([l.keyword, R], [l.params, typeof p == "function" ? p($) : p || (0, e._)`{}`]), ie.messages && S.push([l.message, typeof w == "function" ? w($) : w]), ie.verbose && S.push([l.schema, F], [l.parentSchema, (0, e._)`${ae}${L}`], [n.default.data, A]), te && S.push([l.propertyName, te]);
  }
})(ns);
var $u;
function Zw() {
  if ($u) return $r;
  $u = 1, Object.defineProperty($r, "__esModule", { value: !0 }), $r.boolOrEmptySchema = $r.topBoolOrEmptySchema = void 0;
  const t = ns, e = me, r = Mt, n = {
    message: "boolean schema is false"
  };
  function s(i) {
    const { gen: c, schema: d, validateName: l } = i;
    d === !1 ? o(i, !1) : typeof d == "object" && d.$async === !0 ? c.return(r.default.data) : (c.assign((0, e._)`${l}.errors`, null), c.return(!0));
  }
  $r.topBoolOrEmptySchema = s;
  function a(i, c) {
    const { gen: d, schema: l } = i;
    l === !1 ? (d.var(c, !1), o(i)) : d.var(c, !0);
  }
  $r.boolOrEmptySchema = a;
  function o(i, c) {
    const { gen: d, data: l } = i, f = {
      gen: d,
      keyword: "false schema",
      data: l,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: i
    };
    (0, t.reportError)(f, n, void 0, c);
  }
  return $r;
}
var ke = {}, Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.getRules = Tr.isJSONType = void 0;
const eb = ["string", "number", "integer", "boolean", "null", "object", "array"], tb = new Set(eb);
function rb(t) {
  return typeof t == "string" && tb.has(t);
}
Tr.isJSONType = rb;
function nb() {
  const t = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...t, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, t.number, t.string, t.array, t.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Tr.getRules = nb;
var Vt = {}, gu;
function Qf() {
  if (gu) return Vt;
  gu = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.shouldUseRule = Vt.shouldUseGroup = Vt.schemaHasRulesForType = void 0;
  function t({ schema: n, self: s }, a) {
    const o = s.RULES.types[a];
    return o && o !== !0 && e(n, o);
  }
  Vt.schemaHasRulesForType = t;
  function e(n, s) {
    return s.rules.some((a) => r(n, a));
  }
  Vt.shouldUseGroup = e;
  function r(n, s) {
    var a;
    return n[s.keyword] !== void 0 || ((a = s.definition.implements) === null || a === void 0 ? void 0 : a.some((o) => n[o] !== void 0));
  }
  return Vt.shouldUseRule = r, Vt;
}
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.reportTypeError = ke.checkDataTypes = ke.checkDataType = ke.coerceAndCheckDataType = ke.getJSONTypes = ke.getSchemaTypes = ke.DataType = void 0;
const sb = Tr, ab = Qf(), ob = ns, fe = me, Zf = K;
var Zr;
(function(t) {
  t[t.Correct = 0] = "Correct", t[t.Wrong = 1] = "Wrong";
})(Zr || (ke.DataType = Zr = {}));
function ib(t) {
  const e = eh(t.type);
  if (e.includes("null")) {
    if (t.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!e.length && t.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    t.nullable === !0 && e.push("null");
  }
  return e;
}
ke.getSchemaTypes = ib;
function eh(t) {
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (e.every(sb.isJSONType))
    return e;
  throw new Error("type must be JSONType or JSONType[]: " + e.join(","));
}
ke.getJSONTypes = eh;
function cb(t, e) {
  const { gen: r, data: n, opts: s } = t, a = lb(e, s.coerceTypes), o = e.length > 0 && !(a.length === 0 && e.length === 1 && (0, ab.schemaHasRulesForType)(t, e[0]));
  if (o) {
    const i = hc(e, n, s.strictNumbers, Zr.Wrong);
    r.if(i, () => {
      a.length ? ub(t, e, a) : mc(t);
    });
  }
  return o;
}
ke.coerceAndCheckDataType = cb;
const th = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function lb(t, e) {
  return e ? t.filter((r) => th.has(r) || e === "array" && r === "array") : [];
}
function ub(t, e, r) {
  const { gen: n, data: s, opts: a } = t, o = n.let("dataType", (0, fe._)`typeof ${s}`), i = n.let("coerced", (0, fe._)`undefined`);
  a.coerceTypes === "array" && n.if((0, fe._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, fe._)`${s}[0]`).assign(o, (0, fe._)`typeof ${s}`).if(hc(e, s, a.strictNumbers), () => n.assign(i, s))), n.if((0, fe._)`${i} !== undefined`);
  for (const d of r)
    (th.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), mc(t), n.endIf(), n.if((0, fe._)`${i} !== undefined`, () => {
    n.assign(s, i), db(t, i);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, fe._)`${o} == "number" || ${o} == "boolean"`).assign(i, (0, fe._)`"" + ${s}`).elseIf((0, fe._)`${s} === null`).assign(i, (0, fe._)`""`);
        return;
      case "number":
        n.elseIf((0, fe._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(i, (0, fe._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, fe._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(i, (0, fe._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, fe._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(i, !1).elseIf((0, fe._)`${s} === "true" || ${s} === 1`).assign(i, !0);
        return;
      case "null":
        n.elseIf((0, fe._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(i, null);
        return;
      case "array":
        n.elseIf((0, fe._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(i, (0, fe._)`[${s}]`);
    }
  }
}
function db({ gen: t, parentData: e, parentDataProperty: r }, n) {
  t.if((0, fe._)`${e} !== undefined`, () => t.assign((0, fe._)`${e}[${r}]`, n));
}
function Mo(t, e, r, n = Zr.Correct) {
  const s = n === Zr.Correct ? fe.operators.EQ : fe.operators.NEQ;
  let a;
  switch (t) {
    case "null":
      return (0, fe._)`${e} ${s} null`;
    case "array":
      a = (0, fe._)`Array.isArray(${e})`;
      break;
    case "object":
      a = (0, fe._)`${e} && typeof ${e} == "object" && !Array.isArray(${e})`;
      break;
    case "integer":
      a = o((0, fe._)`!(${e} % 1) && !isNaN(${e})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, fe._)`typeof ${e} ${s} ${t}`;
  }
  return n === Zr.Correct ? a : (0, fe.not)(a);
  function o(i = fe.nil) {
    return (0, fe.and)((0, fe._)`typeof ${e} == "number"`, i, r ? (0, fe._)`isFinite(${e})` : fe.nil);
  }
}
ke.checkDataType = Mo;
function hc(t, e, r, n) {
  if (t.length === 1)
    return Mo(t[0], e, r, n);
  let s;
  const a = (0, Zf.toHash)(t);
  if (a.array && a.object) {
    const o = (0, fe._)`typeof ${e} != "object"`;
    s = a.null ? o : (0, fe._)`!${e} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = fe.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, fe.and)(s, Mo(o, e, r, n));
  return s;
}
ke.checkDataTypes = hc;
const fb = {
  message: ({ schema: t }) => `must be ${t}`,
  params: ({ schema: t, schemaValue: e }) => typeof t == "string" ? (0, fe._)`{type: ${t}}` : (0, fe._)`{type: ${e}}`
};
function mc(t) {
  const e = hb(t);
  (0, ob.reportError)(e, fb);
}
ke.reportTypeError = mc;
function hb(t) {
  const { gen: e, data: r, schema: n } = t, s = (0, Zf.schemaRefOrVal)(t, n, "type");
  return {
    gen: e,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: t
  };
}
var En = {}, _u;
function mb() {
  if (_u) return En;
  _u = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.assignDefaults = void 0;
  const t = me, e = K;
  function r(s, a) {
    const { properties: o, items: i } = s.schema;
    if (a === "object" && o)
      for (const c in o)
        n(s, c, o[c].default);
    else a === "array" && Array.isArray(i) && i.forEach((c, d) => n(s, d, c.default));
  }
  En.assignDefaults = r;
  function n(s, a, o) {
    const { gen: i, compositeRule: c, data: d, opts: l } = s;
    if (o === void 0)
      return;
    const f = (0, t._)`${d}${(0, t.getProperty)(a)}`;
    if (c) {
      (0, e.checkStrictMode)(s, `default is ignored for: ${f}`);
      return;
    }
    let _ = (0, t._)`${f} === undefined`;
    l.useDefaults === "empty" && (_ = (0, t._)`${_} || ${f} === null || ${f} === ""`), i.if(_, (0, t._)`${f} = ${(0, t.stringify)(o)}`);
  }
  return En;
}
var $t = {}, ye = {};
Object.defineProperty(ye, "__esModule", { value: !0 });
ye.validateUnion = ye.validateArray = ye.usePattern = ye.callValidateCode = ye.schemaProperties = ye.allSchemaProperties = ye.noPropertyInData = ye.propertyInData = ye.isOwnProperty = ye.hasPropFunc = ye.reportMissingProp = ye.checkMissingProp = ye.checkReportMissingProp = void 0;
const we = me, pc = K, rr = Mt, pb = K;
function yb(t, e) {
  const { gen: r, data: n, it: s } = t;
  r.if($c(r, n, e, s.opts.ownProperties), () => {
    t.setParams({ missingProperty: (0, we._)`${e}` }, !0), t.error();
  });
}
ye.checkReportMissingProp = yb;
function $b({ gen: t, data: e, it: { opts: r } }, n, s) {
  return (0, we.or)(...n.map((a) => (0, we.and)($c(t, e, a, r.ownProperties), (0, we._)`${s} = ${a}`)));
}
ye.checkMissingProp = $b;
function gb(t, e) {
  t.setParams({ missingProperty: e }, !0), t.error();
}
ye.reportMissingProp = gb;
function rh(t) {
  return t.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, we._)`Object.prototype.hasOwnProperty`
  });
}
ye.hasPropFunc = rh;
function yc(t, e, r) {
  return (0, we._)`${rh(t)}.call(${e}, ${r})`;
}
ye.isOwnProperty = yc;
function _b(t, e, r, n) {
  const s = (0, we._)`${e}${(0, we.getProperty)(r)} !== undefined`;
  return n ? (0, we._)`${s} && ${yc(t, e, r)}` : s;
}
ye.propertyInData = _b;
function $c(t, e, r, n) {
  const s = (0, we._)`${e}${(0, we.getProperty)(r)} === undefined`;
  return n ? (0, we.or)(s, (0, we.not)(yc(t, e, r))) : s;
}
ye.noPropertyInData = $c;
function nh(t) {
  return t ? Object.keys(t).filter((e) => e !== "__proto__") : [];
}
ye.allSchemaProperties = nh;
function vb(t, e) {
  return nh(e).filter((r) => !(0, pc.alwaysValidSchema)(t, e[r]));
}
ye.schemaProperties = vb;
function wb({ schemaCode: t, data: e, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, i, c, d) {
  const l = d ? (0, we._)`${t}, ${e}, ${n}${s}` : e, f = [
    [rr.default.instancePath, (0, we.strConcat)(rr.default.instancePath, a)],
    [rr.default.parentData, o.parentData],
    [rr.default.parentDataProperty, o.parentDataProperty],
    [rr.default.rootData, rr.default.rootData]
  ];
  o.opts.dynamicRef && f.push([rr.default.dynamicAnchors, rr.default.dynamicAnchors]);
  const _ = (0, we._)`${l}, ${r.object(...f)}`;
  return c !== we.nil ? (0, we._)`${i}.call(${c}, ${_})` : (0, we._)`${i}(${_})`;
}
ye.callValidateCode = wb;
const bb = (0, we._)`new RegExp`;
function Eb({ gen: t, it: { opts: e } }, r) {
  const n = e.unicodeRegExp ? "u" : "", { regExp: s } = e.code, a = s(r, n);
  return t.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, we._)`${s.code === "new RegExp" ? bb : (0, pb.useFunc)(t, s)}(${r}, ${n})`
  });
}
ye.usePattern = Eb;
function Sb(t) {
  const { gen: e, data: r, keyword: n, it: s } = t, a = e.name("valid");
  if (s.allErrors) {
    const i = e.let("valid", !0);
    return o(() => e.assign(i, !1)), i;
  }
  return e.var(a, !0), o(() => e.break()), a;
  function o(i) {
    const c = e.const("len", (0, we._)`${r}.length`);
    e.forRange("i", 0, c, (d) => {
      t.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: pc.Type.Num
      }, a), e.if((0, we.not)(a), i);
    });
  }
}
ye.validateArray = Sb;
function Pb(t) {
  const { gen: e, schema: r, keyword: n, it: s } = t;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, pc.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = e.let("valid", !1), i = e.name("_valid");
  e.block(() => r.forEach((c, d) => {
    const l = t.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, i);
    e.assign(o, (0, we._)`${o} || ${i}`), t.mergeValidEvaluated(l, i) || e.if((0, we.not)(o));
  })), t.result(o, () => t.reset(), () => t.error(!0));
}
ye.validateUnion = Pb;
var vu;
function Rb() {
  if (vu) return $t;
  vu = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.validateKeywordUsage = $t.validSchemaType = $t.funcKeywordCode = $t.macroKeywordCode = void 0;
  const t = me, e = Mt, r = ye, n = ns;
  function s(_, m) {
    const { gen: g, keyword: y, schema: $, parentSchema: p, it: w } = _, S = m.macro.call(w.self, $, p, w), R = d(g, y, S);
    w.opts.validateSchema !== !1 && w.self.validateSchema(S, !0);
    const A = g.name("valid");
    _.subschema({
      schema: S,
      schemaPath: t.nil,
      errSchemaPath: `${w.errSchemaPath}/${y}`,
      topSchemaRef: R,
      compositeRule: !0
    }, A), _.pass(A, () => _.error(!0));
  }
  $t.macroKeywordCode = s;
  function a(_, m) {
    var g;
    const { gen: y, keyword: $, schema: p, parentSchema: w, $data: S, it: R } = _;
    c(R, m);
    const A = !S && m.compile ? m.compile.call(R.self, p, w, R) : m.validate, F = d(y, $, A), V = y.let("valid");
    _.block$data(V, ie), _.ok((g = m.valid) !== null && g !== void 0 ? g : V);
    function ie() {
      if (m.errors === !1)
        L(), m.modifying && o(_), W(() => _.error());
      else {
        const ee = m.async ? te() : ae();
        m.modifying && o(_), W(() => i(_, ee));
      }
    }
    function te() {
      const ee = y.let("ruleErrs", null);
      return y.try(() => L((0, t._)`await `), (k) => y.assign(V, !1).if((0, t._)`${k} instanceof ${R.ValidationError}`, () => y.assign(ee, (0, t._)`${k}.errors`), () => y.throw(k))), ee;
    }
    function ae() {
      const ee = (0, t._)`${F}.errors`;
      return y.assign(ee, null), L(t.nil), ee;
    }
    function L(ee = m.async ? (0, t._)`await ` : t.nil) {
      const k = R.opts.passContext ? e.default.this : e.default.self, M = !("compile" in m && !S || m.schema === !1);
      y.assign(V, (0, t._)`${ee}${(0, r.callValidateCode)(_, F, k, M)}`, m.modifying);
    }
    function W(ee) {
      var k;
      y.if((0, t.not)((k = m.valid) !== null && k !== void 0 ? k : V), ee);
    }
  }
  $t.funcKeywordCode = a;
  function o(_) {
    const { gen: m, data: g, it: y } = _;
    m.if(y.parentData, () => m.assign(g, (0, t._)`${y.parentData}[${y.parentDataProperty}]`));
  }
  function i(_, m) {
    const { gen: g } = _;
    g.if((0, t._)`Array.isArray(${m})`, () => {
      g.assign(e.default.vErrors, (0, t._)`${e.default.vErrors} === null ? ${m} : ${e.default.vErrors}.concat(${m})`).assign(e.default.errors, (0, t._)`${e.default.vErrors}.length`), (0, n.extendErrors)(_);
    }, () => _.error());
  }
  function c({ schemaEnv: _ }, m) {
    if (m.async && !_.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(_, m, g) {
    if (g === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return _.scopeValue("keyword", typeof g == "function" ? { ref: g } : { ref: g, code: (0, t.stringify)(g) });
  }
  function l(_, m, g = !1) {
    return !m.length || m.some((y) => y === "array" ? Array.isArray(_) : y === "object" ? _ && typeof _ == "object" && !Array.isArray(_) : typeof _ == y || g && typeof _ > "u");
  }
  $t.validSchemaType = l;
  function f({ schema: _, opts: m, self: g, errSchemaPath: y }, $, p) {
    if (Array.isArray($.keyword) ? !$.keyword.includes(p) : $.keyword !== p)
      throw new Error("ajv implementation error");
    const w = $.dependencies;
    if (w != null && w.some((S) => !Object.prototype.hasOwnProperty.call(_, S)))
      throw new Error(`parent schema must have dependencies of ${p}: ${w.join(",")}`);
    if ($.validateSchema && !$.validateSchema(_[p])) {
      const R = `keyword "${p}" value is invalid at path "${y}": ` + g.errorsText($.validateSchema.errors);
      if (m.validateSchema === "log")
        g.logger.error(R);
      else
        throw new Error(R);
    }
  }
  return $t.validateKeywordUsage = f, $t;
}
var Ut = {}, wu;
function Ib() {
  if (wu) return Ut;
  wu = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.extendSubschemaMode = Ut.extendSubschemaData = Ut.getSubschema = void 0;
  const t = me, e = K;
  function r(a, { keyword: o, schemaProp: i, schema: c, schemaPath: d, errSchemaPath: l, topSchemaRef: f }) {
    if (o !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const _ = a.schema[o];
      return i === void 0 ? {
        schema: _,
        schemaPath: (0, t._)`${a.schemaPath}${(0, t.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}`
      } : {
        schema: _[i],
        schemaPath: (0, t._)`${a.schemaPath}${(0, t.getProperty)(o)}${(0, t.getProperty)(i)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}/${(0, e.escapeFragment)(i)}`
      };
    }
    if (c !== void 0) {
      if (d === void 0 || l === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: d,
        topSchemaRef: f,
        errSchemaPath: l
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Ut.getSubschema = r;
  function n(a, o, { dataProp: i, dataPropType: c, data: d, dataTypes: l, propertyName: f }) {
    if (d !== void 0 && i !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: _ } = o;
    if (i !== void 0) {
      const { errorPath: g, dataPathArr: y, opts: $ } = o, p = _.let("data", (0, t._)`${o.data}${(0, t.getProperty)(i)}`, !0);
      m(p), a.errorPath = (0, t.str)`${g}${(0, e.getErrorPath)(i, c, $.jsPropertySyntax)}`, a.parentDataProperty = (0, t._)`${i}`, a.dataPathArr = [...y, a.parentDataProperty];
    }
    if (d !== void 0) {
      const g = d instanceof t.Name ? d : _.let("data", d, !0);
      m(g), f !== void 0 && (a.propertyName = f);
    }
    l && (a.dataTypes = l);
    function m(g) {
      a.data = g, a.dataLevel = o.dataLevel + 1, a.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), a.parentData = o.data, a.dataNames = [...o.dataNames, g];
    }
  }
  Ut.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: o, jtdMetadata: i, compositeRule: c, createErrors: d, allErrors: l }) {
    c !== void 0 && (a.compositeRule = c), d !== void 0 && (a.createErrors = d), l !== void 0 && (a.allErrors = l), a.jtdDiscriminator = o, a.jtdMetadata = i;
  }
  return Ut.extendSubschemaMode = s, Ut;
}
var ze = {}, sh = { exports: {} }, ur = sh.exports = function(t, e, r) {
  typeof e == "function" && (r = e, e = {}), r = e.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  xs(e, n, s, t, "", t);
};
ur.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
ur.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
ur.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
ur.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function xs(t, e, r, n, s, a, o, i, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    e(n, s, a, o, i, c, d);
    for (var l in n) {
      var f = n[l];
      if (Array.isArray(f)) {
        if (l in ur.arrayKeywords)
          for (var _ = 0; _ < f.length; _++)
            xs(t, e, r, f[_], s + "/" + l + "/" + _, a, s, l, n, _);
      } else if (l in ur.propsKeywords) {
        if (f && typeof f == "object")
          for (var m in f)
            xs(t, e, r, f[m], s + "/" + l + "/" + Ob(m), a, s, l, n, m);
      } else (l in ur.keywords || t.allKeys && !(l in ur.skipKeywords)) && xs(t, e, r, f, s + "/" + l, a, s, l, n);
    }
    r(n, s, a, o, i, c, d);
  }
}
function Ob(t) {
  return t.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Nb = sh.exports;
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.getSchemaRefs = ze.resolveUrl = ze.normalizeId = ze._getFullPath = ze.getFullPath = ze.inlineRef = void 0;
const Ab = K, Tb = Ea, kb = Nb, Cb = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function jb(t, e = !0) {
  return typeof t == "boolean" ? !0 : e === !0 ? !Lo(t) : e ? ah(t) <= e : !1;
}
ze.inlineRef = jb;
const Db = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Lo(t) {
  for (const e in t) {
    if (Db.has(e))
      return !0;
    const r = t[e];
    if (Array.isArray(r) && r.some(Lo) || typeof r == "object" && Lo(r))
      return !0;
  }
  return !1;
}
function ah(t) {
  let e = 0;
  for (const r in t) {
    if (r === "$ref")
      return 1 / 0;
    if (e++, !Cb.has(r) && (typeof t[r] == "object" && (0, Ab.eachItem)(t[r], (n) => e += ah(n)), e === 1 / 0))
      return 1 / 0;
  }
  return e;
}
function oh(t, e = "", r) {
  r !== !1 && (e = en(e));
  const n = t.parse(e);
  return ih(t, n);
}
ze.getFullPath = oh;
function ih(t, e) {
  return t.serialize(e).split("#")[0] + "#";
}
ze._getFullPath = ih;
const Mb = /#\/?$/;
function en(t) {
  return t ? t.replace(Mb, "") : "";
}
ze.normalizeId = en;
function Lb(t, e, r) {
  return r = en(r), t.resolve(e, r);
}
ze.resolveUrl = Lb;
const Fb = /^[a-z_][-a-z0-9._]*$/i;
function Vb(t, e) {
  if (typeof t == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = en(t[r] || e), a = { "": s }, o = oh(n, s, !1), i = {}, c = /* @__PURE__ */ new Set();
  return kb(t, { allKeys: !0 }, (f, _, m, g) => {
    if (g === void 0)
      return;
    const y = o + _;
    let $ = a[g];
    typeof f[r] == "string" && ($ = p.call(this, f[r])), w.call(this, f.$anchor), w.call(this, f.$dynamicAnchor), a[_] = $;
    function p(S) {
      const R = this.opts.uriResolver.resolve;
      if (S = en($ ? R($, S) : S), c.has(S))
        throw l(S);
      c.add(S);
      let A = this.refs[S];
      return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? d(f, A.schema, S) : S !== en(y) && (S[0] === "#" ? (d(f, i[S], S), i[S] = f) : this.refs[S] = y), S;
    }
    function w(S) {
      if (typeof S == "string") {
        if (!Fb.test(S))
          throw new Error(`invalid anchor "${S}"`);
        p.call(this, `#${S}`);
      }
    }
  }), i;
  function d(f, _, m) {
    if (_ !== void 0 && !Tb(f, _))
      throw l(m);
  }
  function l(f) {
    return new Error(`reference "${f}" resolves to more than one schema`);
  }
}
ze.getSchemaRefs = Vb;
var bu;
function Aa() {
  if (bu) return Ft;
  bu = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.getData = Ft.KeywordCxt = Ft.validateFunctionCode = void 0;
  const t = Zw(), e = ke, r = Qf(), n = ke, s = mb(), a = Rb(), o = Ib(), i = me, c = Mt, d = ze, l = K, f = ns;
  function _(O) {
    if (A(O) && (V(O), R(O))) {
      $(O);
      return;
    }
    m(O, () => (0, t.topBoolOrEmptySchema)(O));
  }
  Ft.validateFunctionCode = _;
  function m({ gen: O, validateName: N, schema: D, schemaEnv: U, opts: X }, ce) {
    X.code.es5 ? O.func(N, (0, i._)`${c.default.data}, ${c.default.valCxt}`, U.$async, () => {
      O.code((0, i._)`"use strict"; ${w(D, X)}`), y(O, X), O.code(ce);
    }) : O.func(N, (0, i._)`${c.default.data}, ${g(X)}`, U.$async, () => O.code(w(D, X)).code(ce));
  }
  function g(O) {
    return (0, i._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${O.dynamicRef ? (0, i._)`, ${c.default.dynamicAnchors}={}` : i.nil}}={}`;
  }
  function y(O, N) {
    O.if(c.default.valCxt, () => {
      O.var(c.default.instancePath, (0, i._)`${c.default.valCxt}.${c.default.instancePath}`), O.var(c.default.parentData, (0, i._)`${c.default.valCxt}.${c.default.parentData}`), O.var(c.default.parentDataProperty, (0, i._)`${c.default.valCxt}.${c.default.parentDataProperty}`), O.var(c.default.rootData, (0, i._)`${c.default.valCxt}.${c.default.rootData}`), N.dynamicRef && O.var(c.default.dynamicAnchors, (0, i._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      O.var(c.default.instancePath, (0, i._)`""`), O.var(c.default.parentData, (0, i._)`undefined`), O.var(c.default.parentDataProperty, (0, i._)`undefined`), O.var(c.default.rootData, c.default.data), N.dynamicRef && O.var(c.default.dynamicAnchors, (0, i._)`{}`);
    });
  }
  function $(O) {
    const { schema: N, opts: D, gen: U } = O;
    m(O, () => {
      D.$comment && N.$comment && ee(O), ae(O), U.let(c.default.vErrors, null), U.let(c.default.errors, 0), D.unevaluated && p(O), ie(O), k(O);
    });
  }
  function p(O) {
    const { gen: N, validateName: D } = O;
    O.evaluated = N.const("evaluated", (0, i._)`${D}.evaluated`), N.if((0, i._)`${O.evaluated}.dynamicProps`, () => N.assign((0, i._)`${O.evaluated}.props`, (0, i._)`undefined`)), N.if((0, i._)`${O.evaluated}.dynamicItems`, () => N.assign((0, i._)`${O.evaluated}.items`, (0, i._)`undefined`));
  }
  function w(O, N) {
    const D = typeof O == "object" && O[N.schemaId];
    return D && (N.code.source || N.code.process) ? (0, i._)`/*# sourceURL=${D} */` : i.nil;
  }
  function S(O, N) {
    if (A(O) && (V(O), R(O))) {
      F(O, N);
      return;
    }
    (0, t.boolOrEmptySchema)(O, N);
  }
  function R({ schema: O, self: N }) {
    if (typeof O == "boolean")
      return !O;
    for (const D in O)
      if (N.RULES.all[D])
        return !0;
    return !1;
  }
  function A(O) {
    return typeof O.schema != "boolean";
  }
  function F(O, N) {
    const { schema: D, gen: U, opts: X } = O;
    X.$comment && D.$comment && ee(O), L(O), W(O);
    const ce = U.const("_errs", c.default.errors);
    ie(O, ce), U.var(N, (0, i._)`${ce} === ${c.default.errors}`);
  }
  function V(O) {
    (0, l.checkUnknownRules)(O), te(O);
  }
  function ie(O, N) {
    if (O.opts.jtd)
      return B(O, [], !1, N);
    const D = (0, e.getSchemaTypes)(O.schema), U = (0, e.coerceAndCheckDataType)(O, D);
    B(O, D, !U, N);
  }
  function te(O) {
    const { schema: N, errSchemaPath: D, opts: U, self: X } = O;
    N.$ref && U.ignoreKeywordsWithRef && (0, l.schemaHasRulesButRef)(N, X.RULES) && X.logger.warn(`$ref: keywords ignored in schema at path "${D}"`);
  }
  function ae(O) {
    const { schema: N, opts: D } = O;
    N.default !== void 0 && D.useDefaults && D.strictSchema && (0, l.checkStrictMode)(O, "default is ignored in the schema root");
  }
  function L(O) {
    const N = O.schema[O.opts.schemaId];
    N && (O.baseId = (0, d.resolveUrl)(O.opts.uriResolver, O.baseId, N));
  }
  function W(O) {
    if (O.schema.$async && !O.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function ee({ gen: O, schemaEnv: N, schema: D, errSchemaPath: U, opts: X }) {
    const ce = D.$comment;
    if (X.$comment === !0)
      O.code((0, i._)`${c.default.self}.logger.log(${ce})`);
    else if (typeof X.$comment == "function") {
      const Se = (0, i.str)`${U}/$comment`, Ye = O.scopeValue("root", { ref: N.root });
      O.code((0, i._)`${c.default.self}.opts.$comment(${ce}, ${Se}, ${Ye}.schema)`);
    }
  }
  function k(O) {
    const { gen: N, schemaEnv: D, validateName: U, ValidationError: X, opts: ce } = O;
    D.$async ? N.if((0, i._)`${c.default.errors} === 0`, () => N.return(c.default.data), () => N.throw((0, i._)`new ${X}(${c.default.vErrors})`)) : (N.assign((0, i._)`${U}.errors`, c.default.vErrors), ce.unevaluated && M(O), N.return((0, i._)`${c.default.errors} === 0`));
  }
  function M({ gen: O, evaluated: N, props: D, items: U }) {
    D instanceof i.Name && O.assign((0, i._)`${N}.props`, D), U instanceof i.Name && O.assign((0, i._)`${N}.items`, U);
  }
  function B(O, N, D, U) {
    const { gen: X, schema: ce, data: Se, allErrors: Ye, opts: De, self: Me } = O, { RULES: Pe } = Me;
    if (ce.$ref && (De.ignoreKeywordsWithRef || !(0, l.schemaHasRulesButRef)(ce, Pe))) {
      X.block(() => C(O, "$ref", Pe.all.$ref.definition));
      return;
    }
    De.jtd || Y(O, N), X.block(() => {
      for (const Ge of Pe.rules)
        It(Ge);
      It(Pe.post);
    });
    function It(Ge) {
      (0, r.shouldUseGroup)(ce, Ge) && (Ge.type ? (X.if((0, n.checkDataType)(Ge.type, Se, De.strictNumbers)), z(O, Ge), N.length === 1 && N[0] === Ge.type && D && (X.else(), (0, n.reportTypeError)(O)), X.endIf()) : z(O, Ge), Ye || X.if((0, i._)`${c.default.errors} === ${U || 0}`));
    }
  }
  function z(O, N) {
    const { gen: D, schema: U, opts: { useDefaults: X } } = O;
    X && (0, s.assignDefaults)(O, N.type), D.block(() => {
      for (const ce of N.rules)
        (0, r.shouldUseRule)(U, ce) && C(O, ce.keyword, ce.definition, N.type);
    });
  }
  function Y(O, N) {
    O.schemaEnv.meta || !O.opts.strictTypes || (G(O, N), O.opts.allowUnionTypes || I(O, N), v(O, O.dataTypes));
  }
  function G(O, N) {
    if (N.length) {
      if (!O.dataTypes.length) {
        O.dataTypes = N;
        return;
      }
      N.forEach((D) => {
        b(O.dataTypes, D) || h(O, `type "${D}" not allowed by context "${O.dataTypes.join(",")}"`);
      }), u(O, N);
    }
  }
  function I(O, N) {
    N.length > 1 && !(N.length === 2 && N.includes("null")) && h(O, "use allowUnionTypes to allow union type keyword");
  }
  function v(O, N) {
    const D = O.self.RULES.all;
    for (const U in D) {
      const X = D[U];
      if (typeof X == "object" && (0, r.shouldUseRule)(O.schema, X)) {
        const { type: ce } = X.definition;
        ce.length && !ce.some((Se) => P(N, Se)) && h(O, `missing type "${ce.join(",")}" for keyword "${U}"`);
      }
    }
  }
  function P(O, N) {
    return O.includes(N) || N === "number" && O.includes("integer");
  }
  function b(O, N) {
    return O.includes(N) || N === "integer" && O.includes("number");
  }
  function u(O, N) {
    const D = [];
    for (const U of O.dataTypes)
      b(N, U) ? D.push(U) : N.includes("integer") && U === "number" && D.push("integer");
    O.dataTypes = D;
  }
  function h(O, N) {
    const D = O.schemaEnv.baseId + O.errSchemaPath;
    N += ` at "${D}" (strictTypes)`, (0, l.checkStrictMode)(O, N, O.opts.strictTypes);
  }
  class E {
    constructor(N, D, U) {
      if ((0, a.validateKeywordUsage)(N, D, U), this.gen = N.gen, this.allErrors = N.allErrors, this.keyword = U, this.data = N.data, this.schema = N.schema[U], this.$data = D.$data && N.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, l.schemaRefOrVal)(N, this.schema, U, this.$data), this.schemaType = D.schemaType, this.parentSchema = N.schema, this.params = {}, this.it = N, this.def = D, this.$data)
        this.schemaCode = N.gen.const("vSchema", H(this.$data, N));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, D.schemaType, D.allowUndefined))
        throw new Error(`${U} value must be ${JSON.stringify(D.schemaType)}`);
      ("code" in D ? D.trackErrors : D.errors !== !1) && (this.errsCount = N.gen.const("_errs", c.default.errors));
    }
    result(N, D, U) {
      this.failResult((0, i.not)(N), D, U);
    }
    failResult(N, D, U) {
      this.gen.if(N), U ? U() : this.error(), D ? (this.gen.else(), D(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(N, D) {
      this.failResult((0, i.not)(N), void 0, D);
    }
    fail(N) {
      if (N === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(N), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(N) {
      if (!this.$data)
        return this.fail(N);
      const { schemaCode: D } = this;
      this.fail((0, i._)`${D} !== undefined && (${(0, i.or)(this.invalid$data(), N)})`);
    }
    error(N, D, U) {
      if (D) {
        this.setParams(D), this._error(N, U), this.setParams({});
        return;
      }
      this._error(N, U);
    }
    _error(N, D) {
      (N ? f.reportExtraError : f.reportError)(this, this.def.error, D);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(N) {
      this.allErrors || this.gen.if(N);
    }
    setParams(N, D) {
      D ? Object.assign(this.params, N) : this.params = N;
    }
    block$data(N, D, U = i.nil) {
      this.gen.block(() => {
        this.check$data(N, U), D();
      });
    }
    check$data(N = i.nil, D = i.nil) {
      if (!this.$data)
        return;
      const { gen: U, schemaCode: X, schemaType: ce, def: Se } = this;
      U.if((0, i.or)((0, i._)`${X} === undefined`, D)), N !== i.nil && U.assign(N, !0), (ce.length || Se.validateSchema) && (U.elseIf(this.invalid$data()), this.$dataError(), N !== i.nil && U.assign(N, !1)), U.else();
    }
    invalid$data() {
      const { gen: N, schemaCode: D, schemaType: U, def: X, it: ce } = this;
      return (0, i.or)(Se(), Ye());
      function Se() {
        if (U.length) {
          if (!(D instanceof i.Name))
            throw new Error("ajv implementation error");
          const De = Array.isArray(U) ? U : [U];
          return (0, i._)`${(0, n.checkDataTypes)(De, D, ce.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return i.nil;
      }
      function Ye() {
        if (X.validateSchema) {
          const De = N.scopeValue("validate$data", { ref: X.validateSchema });
          return (0, i._)`!${De}(${D})`;
        }
        return i.nil;
      }
    }
    subschema(N, D) {
      const U = (0, o.getSubschema)(this.it, N);
      (0, o.extendSubschemaData)(U, this.it, N), (0, o.extendSubschemaMode)(U, N);
      const X = { ...this.it, ...U, items: void 0, props: void 0 };
      return S(X, D), X;
    }
    mergeEvaluated(N, D) {
      const { it: U, gen: X } = this;
      U.opts.unevaluated && (U.props !== !0 && N.props !== void 0 && (U.props = l.mergeEvaluated.props(X, N.props, U.props, D)), U.items !== !0 && N.items !== void 0 && (U.items = l.mergeEvaluated.items(X, N.items, U.items, D)));
    }
    mergeValidEvaluated(N, D) {
      const { it: U, gen: X } = this;
      if (U.opts.unevaluated && (U.props !== !0 || U.items !== !0))
        return X.if(D, () => this.mergeEvaluated(N, i.Name)), !0;
    }
  }
  Ft.KeywordCxt = E;
  function C(O, N, D, U) {
    const X = new E(O, D, N);
    "code" in D ? D.code(X, U) : X.$data && D.validate ? (0, a.funcKeywordCode)(X, D) : "macro" in D ? (0, a.macroKeywordCode)(X, D) : (D.compile || D.validate) && (0, a.funcKeywordCode)(X, D);
  }
  const j = /^\/(?:[^~]|~0|~1)*$/, J = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function H(O, { dataLevel: N, dataNames: D, dataPathArr: U }) {
    let X, ce;
    if (O === "")
      return c.default.rootData;
    if (O[0] === "/") {
      if (!j.test(O))
        throw new Error(`Invalid JSON-pointer: ${O}`);
      X = O, ce = c.default.rootData;
    } else {
      const Me = J.exec(O);
      if (!Me)
        throw new Error(`Invalid JSON-pointer: ${O}`);
      const Pe = +Me[1];
      if (X = Me[2], X === "#") {
        if (Pe >= N)
          throw new Error(De("property/index", Pe));
        return U[N - Pe];
      }
      if (Pe > N)
        throw new Error(De("data", Pe));
      if (ce = D[N - Pe], !X)
        return ce;
    }
    let Se = ce;
    const Ye = X.split("/");
    for (const Me of Ye)
      Me && (ce = (0, i._)`${ce}${(0, i.getProperty)((0, l.unescapeJsonPointer)(Me))}`, Se = (0, i._)`${Se} && ${ce}`);
    return Se;
    function De(Me, Pe) {
      return `Cannot access ${Me} ${Pe} levels up, current level is ${N}`;
    }
  }
  return Ft.getData = H, Ft;
}
var $s = {}, Eu;
function gc() {
  if (Eu) return $s;
  Eu = 1, Object.defineProperty($s, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return $s.default = t, $s;
}
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
const no = ze;
class Ub extends Error {
  constructor(e, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, no.resolveUrl)(e, r, n), this.missingSchema = (0, no.normalizeId)((0, no.getFullPath)(e, this.missingRef));
  }
}
dn.default = Ub;
var at = {};
Object.defineProperty(at, "__esModule", { value: !0 });
at.resolveSchema = at.getCompilingSchema = at.resolveRef = at.compileSchema = at.SchemaEnv = void 0;
const gt = me, qb = gc(), gr = Mt, Et = ze, Su = K, xb = Aa();
class Ta {
  constructor(e) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof e.schema == "object" && (n = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = (r = e.baseId) !== null && r !== void 0 ? r : (0, Et.normalizeId)(n == null ? void 0 : n[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
at.SchemaEnv = Ta;
function _c(t) {
  const e = ch.call(this, t);
  if (e)
    return e;
  const r = (0, Et.getFullPath)(this.opts.uriResolver, t.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new gt.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let i;
  t.$async && (i = o.scopeValue("Error", {
    ref: qb.default,
    code: (0, gt._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  t.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: gr.default.data,
    parentData: gr.default.parentData,
    parentDataProperty: gr.default.parentDataProperty,
    dataNames: [gr.default.data],
    dataPathArr: [gt.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: t.schema, code: (0, gt.stringify)(t.schema) } : { ref: t.schema }),
    validateName: c,
    ValidationError: i,
    schema: t.schema,
    schemaEnv: t,
    rootId: r,
    baseId: t.baseId || r,
    schemaPath: gt.nil,
    errSchemaPath: t.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, gt._)`""`,
    opts: this.opts,
    self: this
  };
  let l;
  try {
    this._compilations.add(t), (0, xb.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const f = o.toString();
    l = `${o.scopeRefs(gr.default.scope)}return ${f}`, this.opts.code.process && (l = this.opts.code.process(l, t));
    const m = new Function(`${gr.default.self}`, `${gr.default.scope}`, l)(this, this.scope.get());
    if (this.scope.value(c, { ref: m }), m.errors = null, m.schema = t.schema, m.schemaEnv = t, t.$async && (m.$async = !0), this.opts.code.source === !0 && (m.source = { validateName: c, validateCode: f, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: g, items: y } = d;
      m.evaluated = {
        props: g instanceof gt.Name ? void 0 : g,
        items: y instanceof gt.Name ? void 0 : y,
        dynamicProps: g instanceof gt.Name,
        dynamicItems: y instanceof gt.Name
      }, m.source && (m.source.evaluated = (0, gt.stringify)(m.evaluated));
    }
    return t.validate = m, t;
  } catch (f) {
    throw delete t.validate, delete t.validateName, l && this.logger.error("Error compiling schema, function code:", l), f;
  } finally {
    this._compilations.delete(t);
  }
}
at.compileSchema = _c;
function zb(t, e, r) {
  var n;
  r = (0, Et.resolveUrl)(this.opts.uriResolver, e, r);
  const s = t.refs[r];
  if (s)
    return s;
  let a = Bb.call(this, t, r);
  if (a === void 0) {
    const o = (n = t.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: i } = this.opts;
    o && (a = new Ta({ schema: o, schemaId: i, root: t, baseId: e }));
  }
  if (a !== void 0)
    return t.refs[r] = Kb.call(this, a);
}
at.resolveRef = zb;
function Kb(t) {
  return (0, Et.inlineRef)(t.schema, this.opts.inlineRefs) ? t.schema : t.validate ? t : _c.call(this, t);
}
function ch(t) {
  for (const e of this._compilations)
    if (Gb(e, t))
      return e;
}
at.getCompilingSchema = ch;
function Gb(t, e) {
  return t.schema === e.schema && t.root === e.root && t.baseId === e.baseId;
}
function Bb(t, e) {
  let r;
  for (; typeof (r = this.refs[e]) == "string"; )
    e = r;
  return r || this.schemas[e] || ka.call(this, t, e);
}
function ka(t, e) {
  const r = this.opts.uriResolver.parse(e), n = (0, Et._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Et.getFullPath)(this.opts.uriResolver, t.baseId, void 0);
  if (Object.keys(t.schema).length > 0 && n === s)
    return so.call(this, r, t);
  const a = (0, Et.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const i = ka.call(this, t, o);
    return typeof (i == null ? void 0 : i.schema) != "object" ? void 0 : so.call(this, r, i);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || _c.call(this, o), a === (0, Et.normalizeId)(e)) {
      const { schema: i } = o, { schemaId: c } = this.opts, d = i[c];
      return d && (s = (0, Et.resolveUrl)(this.opts.uriResolver, s, d)), new Ta({ schema: i, schemaId: c, root: t, baseId: s });
    }
    return so.call(this, r, o);
  }
}
at.resolveSchema = ka;
const Hb = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function so(t, { baseId: e, schema: r, root: n }) {
  var s;
  if (((s = t.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const i of t.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Su.unescapeFragment)(i)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Hb.has(i) && d && (e = (0, Et.resolveUrl)(this.opts.uriResolver, e, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Su.schemaHasRulesButRef)(r, this.RULES)) {
    const i = (0, Et.resolveUrl)(this.opts.uriResolver, e, r.$ref);
    a = ka.call(this, n, i);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new Ta({ schema: r, schemaId: o, root: n, baseId: e }), a.schema !== a.root.schema)
    return a;
}
const Wb = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Jb = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Xb = "object", Yb = [
  "$data"
], Qb = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Zb = !1, eE = {
  $id: Wb,
  description: Jb,
  type: Xb,
  required: Yb,
  properties: Qb,
  additionalProperties: Zb
};
var vc = {};
Object.defineProperty(vc, "__esModule", { value: !0 });
const lh = Cf;
lh.code = 'require("ajv/dist/runtime/uri").default';
vc.default = lh;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  var e = Aa();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return e.KeywordCxt;
  } });
  var r = me;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = gc(), s = dn, a = Tr, o = at, i = me, c = ze, d = ke, l = K, f = eE, _ = vc, m = (I, v) => new RegExp(I, v);
  m.code = "new RegExp";
  const g = ["removeAdditional", "useDefaults", "coerceTypes"], y = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, p = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, w = 200;
  function S(I) {
    var v, P, b, u, h, E, C, j, J, H, O, N, D, U, X, ce, Se, Ye, De, Me, Pe, It, Ge, fr, hr;
    const pt = I.strict, mr = (v = I.code) === null || v === void 0 ? void 0 : v.optimize, yn = mr === !0 || mr === void 0 ? 1 : mr || 0, $n = (b = (P = I.code) === null || P === void 0 ? void 0 : P.regExp) !== null && b !== void 0 ? b : m, Wa = (u = I.uriResolver) !== null && u !== void 0 ? u : _.default;
    return {
      strictSchema: (E = (h = I.strictSchema) !== null && h !== void 0 ? h : pt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (C = I.strictNumbers) !== null && C !== void 0 ? C : pt) !== null && j !== void 0 ? j : !0,
      strictTypes: (H = (J = I.strictTypes) !== null && J !== void 0 ? J : pt) !== null && H !== void 0 ? H : "log",
      strictTuples: (N = (O = I.strictTuples) !== null && O !== void 0 ? O : pt) !== null && N !== void 0 ? N : "log",
      strictRequired: (U = (D = I.strictRequired) !== null && D !== void 0 ? D : pt) !== null && U !== void 0 ? U : !1,
      code: I.code ? { ...I.code, optimize: yn, regExp: $n } : { optimize: yn, regExp: $n },
      loopRequired: (X = I.loopRequired) !== null && X !== void 0 ? X : w,
      loopEnum: (ce = I.loopEnum) !== null && ce !== void 0 ? ce : w,
      meta: (Se = I.meta) !== null && Se !== void 0 ? Se : !0,
      messages: (Ye = I.messages) !== null && Ye !== void 0 ? Ye : !0,
      inlineRefs: (De = I.inlineRefs) !== null && De !== void 0 ? De : !0,
      schemaId: (Me = I.schemaId) !== null && Me !== void 0 ? Me : "$id",
      addUsedSchema: (Pe = I.addUsedSchema) !== null && Pe !== void 0 ? Pe : !0,
      validateSchema: (It = I.validateSchema) !== null && It !== void 0 ? It : !0,
      validateFormats: (Ge = I.validateFormats) !== null && Ge !== void 0 ? Ge : !0,
      unicodeRegExp: (fr = I.unicodeRegExp) !== null && fr !== void 0 ? fr : !0,
      int32range: (hr = I.int32range) !== null && hr !== void 0 ? hr : !0,
      uriResolver: Wa
    };
  }
  class R {
    constructor(v = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), v = this.opts = { ...v, ...S(v) };
      const { es5: P, lines: b } = this.opts.code;
      this.scope = new i.ValueScope({ scope: {}, prefixes: y, es5: P, lines: b }), this.logger = W(v.logger);
      const u = v.validateFormats;
      v.validateFormats = !1, this.RULES = (0, a.getRules)(), A.call(this, $, v, "NOT SUPPORTED"), A.call(this, p, v, "DEPRECATED", "warn"), this._metaOpts = ae.call(this), v.formats && ie.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), v.keywords && te.call(this, v.keywords), typeof v.meta == "object" && this.addMetaSchema(v.meta), V.call(this), v.validateFormats = u;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: v, meta: P, schemaId: b } = this.opts;
      let u = f;
      b === "id" && (u = { ...f }, u.id = u.$id, delete u.$id), P && v && this.addMetaSchema(u, u[b], !1);
    }
    defaultMeta() {
      const { meta: v, schemaId: P } = this.opts;
      return this.opts.defaultMeta = typeof v == "object" ? v[P] || v : void 0;
    }
    validate(v, P) {
      let b;
      if (typeof v == "string") {
        if (b = this.getSchema(v), !b)
          throw new Error(`no schema with key or ref "${v}"`);
      } else
        b = this.compile(v);
      const u = b(P);
      return "$async" in b || (this.errors = b.errors), u;
    }
    compile(v, P) {
      const b = this._addSchema(v, P);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(v, P) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return u.call(this, v, P);
      async function u(H, O) {
        await h.call(this, H.$schema);
        const N = this._addSchema(H, O);
        return N.validate || E.call(this, N);
      }
      async function h(H) {
        H && !this.getSchema(H) && await u.call(this, { $ref: H }, !0);
      }
      async function E(H) {
        try {
          return this._compileSchemaEnv(H);
        } catch (O) {
          if (!(O instanceof s.default))
            throw O;
          return C.call(this, O), await j.call(this, O.missingSchema), E.call(this, H);
        }
      }
      function C({ missingSchema: H, missingRef: O }) {
        if (this.refs[H])
          throw new Error(`AnySchema ${H} is loaded but ${O} cannot be resolved`);
      }
      async function j(H) {
        const O = await J.call(this, H);
        this.refs[H] || await h.call(this, O.$schema), this.refs[H] || this.addSchema(O, H, P);
      }
      async function J(H) {
        const O = this._loading[H];
        if (O)
          return O;
        try {
          return await (this._loading[H] = b(H));
        } finally {
          delete this._loading[H];
        }
      }
    }
    // Adds schema to the instance
    addSchema(v, P, b, u = this.opts.validateSchema) {
      if (Array.isArray(v)) {
        for (const E of v)
          this.addSchema(E, void 0, b, u);
        return this;
      }
      let h;
      if (typeof v == "object") {
        const { schemaId: E } = this.opts;
        if (h = v[E], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return P = (0, c.normalizeId)(P || h), this._checkUnique(P), this.schemas[P] = this._addSchema(v, b, P, u, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(v, P, b = this.opts.validateSchema) {
      return this.addSchema(v, P, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(v, P) {
      if (typeof v == "boolean")
        return !0;
      let b;
      if (b = v.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const u = this.validate(b, v);
      if (!u && P) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return u;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(v) {
      let P;
      for (; typeof (P = F.call(this, v)) == "string"; )
        v = P;
      if (P === void 0) {
        const { schemaId: b } = this.opts, u = new o.SchemaEnv({ schema: {}, schemaId: b });
        if (P = o.resolveSchema.call(this, u, v), !P)
          return;
        this.refs[v] = P;
      }
      return P.validate || this._compileSchemaEnv(P);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(v) {
      if (v instanceof RegExp)
        return this._removeAllSchemas(this.schemas, v), this._removeAllSchemas(this.refs, v), this;
      switch (typeof v) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const P = F.call(this, v);
          return typeof P == "object" && this._cache.delete(P.schema), delete this.schemas[v], delete this.refs[v], this;
        }
        case "object": {
          const P = v;
          this._cache.delete(P);
          let b = v[this.opts.schemaId];
          return b && (b = (0, c.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(v) {
      for (const P of v)
        this.addKeyword(P);
      return this;
    }
    addKeyword(v, P) {
      let b;
      if (typeof v == "string")
        b = v, typeof P == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), P.keyword = b);
      else if (typeof v == "object" && P === void 0) {
        if (P = v, b = P.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (k.call(this, b, P), !P)
        return (0, l.eachItem)(b, (h) => M.call(this, h)), this;
      z.call(this, P);
      const u = {
        ...P,
        type: (0, d.getJSONTypes)(P.type),
        schemaType: (0, d.getJSONTypes)(P.schemaType)
      };
      return (0, l.eachItem)(b, u.type.length === 0 ? (h) => M.call(this, h, u) : (h) => u.type.forEach((E) => M.call(this, h, u, E))), this;
    }
    getKeyword(v) {
      const P = this.RULES.all[v];
      return typeof P == "object" ? P.definition : !!P;
    }
    // Remove keyword
    removeKeyword(v) {
      const { RULES: P } = this;
      delete P.keywords[v], delete P.all[v];
      for (const b of P.rules) {
        const u = b.rules.findIndex((h) => h.keyword === v);
        u >= 0 && b.rules.splice(u, 1);
      }
      return this;
    }
    // Add format
    addFormat(v, P) {
      return typeof P == "string" && (P = new RegExp(P)), this.formats[v] = P, this;
    }
    errorsText(v = this.errors, { separator: P = ", ", dataVar: b = "data" } = {}) {
      return !v || v.length === 0 ? "No errors" : v.map((u) => `${b}${u.instancePath} ${u.message}`).reduce((u, h) => u + P + h);
    }
    $dataMetaSchema(v, P) {
      const b = this.RULES.all;
      v = JSON.parse(JSON.stringify(v));
      for (const u of P) {
        const h = u.split("/").slice(1);
        let E = v;
        for (const C of h)
          E = E[C];
        for (const C in b) {
          const j = b[C];
          if (typeof j != "object")
            continue;
          const { $data: J } = j.definition, H = E[C];
          J && H && (E[C] = G(H));
        }
      }
      return v;
    }
    _removeAllSchemas(v, P) {
      for (const b in v) {
        const u = v[b];
        (!P || P.test(b)) && (typeof u == "string" ? delete v[b] : u && !u.meta && (this._cache.delete(u.schema), delete v[b]));
      }
    }
    _addSchema(v, P, b, u = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let E;
      const { schemaId: C } = this.opts;
      if (typeof v == "object")
        E = v[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof v != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(v);
      if (j !== void 0)
        return j;
      b = (0, c.normalizeId)(E || b);
      const J = c.getSchemaRefs.call(this, v, b);
      return j = new o.SchemaEnv({ schema: v, schemaId: C, meta: P, baseId: b, localRefs: J }), this._cache.set(j.schema, j), h && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = j), u && this.validateSchema(v, !0), j;
    }
    _checkUnique(v) {
      if (this.schemas[v] || this.refs[v])
        throw new Error(`schema with key or id "${v}" already exists`);
    }
    _compileSchemaEnv(v) {
      if (v.meta ? this._compileMetaSchema(v) : o.compileSchema.call(this, v), !v.validate)
        throw new Error("ajv implementation error");
      return v.validate;
    }
    _compileMetaSchema(v) {
      const P = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, v);
      } finally {
        this.opts = P;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, t.default = R;
  function A(I, v, P, b = "error") {
    for (const u in I) {
      const h = u;
      h in v && this.logger[b](`${P}: option ${u}. ${I[h]}`);
    }
  }
  function F(I) {
    return I = (0, c.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function V() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const v in I)
          this.addSchema(I[v], v);
  }
  function ie() {
    for (const I in this.opts.formats) {
      const v = this.opts.formats[I];
      v && this.addFormat(I, v);
    }
  }
  function te(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const v in I) {
      const P = I[v];
      P.keyword || (P.keyword = v), this.addKeyword(P);
    }
  }
  function ae() {
    const I = { ...this.opts };
    for (const v of g)
      delete I[v];
    return I;
  }
  const L = { log() {
  }, warn() {
  }, error() {
  } };
  function W(I) {
    if (I === !1)
      return L;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ee = /^[a-z_$][a-z0-9_$:-]*$/i;
  function k(I, v) {
    const { RULES: P } = this;
    if ((0, l.eachItem)(I, (b) => {
      if (P.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!ee.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!v && v.$data && !("code" in v || "validate" in v))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function M(I, v, P) {
    var b;
    const u = v == null ? void 0 : v.post;
    if (P && u)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let E = u ? h.post : h.rules.find(({ type: j }) => j === P);
    if (E || (E = { type: P, rules: [] }, h.rules.push(E)), h.keywords[I] = !0, !v)
      return;
    const C = {
      keyword: I,
      definition: {
        ...v,
        type: (0, d.getJSONTypes)(v.type),
        schemaType: (0, d.getJSONTypes)(v.schemaType)
      }
    };
    v.before ? B.call(this, E, C, v.before) : E.rules.push(C), h.all[I] = C, (b = v.implements) === null || b === void 0 || b.forEach((j) => this.addKeyword(j));
  }
  function B(I, v, P) {
    const b = I.rules.findIndex((u) => u.keyword === P);
    b >= 0 ? I.rules.splice(b, 0, v) : (I.rules.push(v), this.logger.warn(`rule ${P} is not defined`));
  }
  function z(I) {
    let { metaSchema: v } = I;
    v !== void 0 && (I.$data && this.opts.$data && (v = G(v)), I.validateSchema = this.compile(v, !0));
  }
  const Y = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function G(I) {
    return { anyOf: [I, Y] };
  }
})(Bf);
var wc = {}, bc = {}, Ec = {};
Object.defineProperty(Ec, "__esModule", { value: !0 });
const tE = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Ec.default = tE;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.callRef = kr.getValidate = void 0;
const rE = dn, Pu = ye, nt = me, Mr = Mt, Ru = at, gs = K, nE = {
  keyword: "$ref",
  schemaType: "string",
  code(t) {
    const { gen: e, schema: r, it: n } = t, { baseId: s, schemaEnv: a, validateName: o, opts: i, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return f();
    const l = Ru.resolveRef.call(c, d, s, r);
    if (l === void 0)
      throw new rE.default(n.opts.uriResolver, s, r);
    if (l instanceof Ru.SchemaEnv)
      return _(l);
    return m(l);
    function f() {
      if (a === d)
        return zs(t, o, a, a.$async);
      const g = e.scopeValue("root", { ref: d });
      return zs(t, (0, nt._)`${g}.validate`, d, d.$async);
    }
    function _(g) {
      const y = uh(t, g);
      zs(t, y, g, g.$async);
    }
    function m(g) {
      const y = e.scopeValue("schema", i.code.source === !0 ? { ref: g, code: (0, nt.stringify)(g) } : { ref: g }), $ = e.name("valid"), p = t.subschema({
        schema: g,
        dataTypes: [],
        schemaPath: nt.nil,
        topSchemaRef: y,
        errSchemaPath: r
      }, $);
      t.mergeEvaluated(p), t.ok($);
    }
  }
};
function uh(t, e) {
  const { gen: r } = t;
  return e.validate ? r.scopeValue("validate", { ref: e.validate }) : (0, nt._)`${r.scopeValue("wrapper", { ref: e })}.validate`;
}
kr.getValidate = uh;
function zs(t, e, r, n) {
  const { gen: s, it: a } = t, { allErrors: o, schemaEnv: i, opts: c } = a, d = c.passContext ? Mr.default.this : nt.nil;
  n ? l() : f();
  function l() {
    if (!i.$async)
      throw new Error("async schema referenced by sync schema");
    const g = s.let("valid");
    s.try(() => {
      s.code((0, nt._)`await ${(0, Pu.callValidateCode)(t, e, d)}`), m(e), o || s.assign(g, !0);
    }, (y) => {
      s.if((0, nt._)`!(${y} instanceof ${a.ValidationError})`, () => s.throw(y)), _(y), o || s.assign(g, !1);
    }), t.ok(g);
  }
  function f() {
    t.result((0, Pu.callValidateCode)(t, e, d), () => m(e), () => _(e));
  }
  function _(g) {
    const y = (0, nt._)`${g}.errors`;
    s.assign(Mr.default.vErrors, (0, nt._)`${Mr.default.vErrors} === null ? ${y} : ${Mr.default.vErrors}.concat(${y})`), s.assign(Mr.default.errors, (0, nt._)`${Mr.default.vErrors}.length`);
  }
  function m(g) {
    var y;
    if (!a.opts.unevaluated)
      return;
    const $ = (y = r == null ? void 0 : r.validate) === null || y === void 0 ? void 0 : y.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = gs.mergeEvaluated.props(s, $.props, a.props));
      else {
        const p = s.var("props", (0, nt._)`${g}.evaluated.props`);
        a.props = gs.mergeEvaluated.props(s, p, a.props, nt.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = gs.mergeEvaluated.items(s, $.items, a.items));
      else {
        const p = s.var("items", (0, nt._)`${g}.evaluated.items`);
        a.items = gs.mergeEvaluated.items(s, p, a.items, nt.Name);
      }
  }
}
kr.callRef = zs;
kr.default = nE;
Object.defineProperty(bc, "__esModule", { value: !0 });
const sE = Ec, aE = kr, oE = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  sE.default,
  aE.default
];
bc.default = oE;
var Sc = {}, Pc = {};
Object.defineProperty(Pc, "__esModule", { value: !0 });
const ua = me, nr = ua.operators, da = {
  maximum: { okStr: "<=", ok: nr.LTE, fail: nr.GT },
  minimum: { okStr: ">=", ok: nr.GTE, fail: nr.LT },
  exclusiveMaximum: { okStr: "<", ok: nr.LT, fail: nr.GTE },
  exclusiveMinimum: { okStr: ">", ok: nr.GT, fail: nr.LTE }
}, iE = {
  message: ({ keyword: t, schemaCode: e }) => (0, ua.str)`must be ${da[t].okStr} ${e}`,
  params: ({ keyword: t, schemaCode: e }) => (0, ua._)`{comparison: ${da[t].okStr}, limit: ${e}}`
}, cE = {
  keyword: Object.keys(da),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: iE,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t;
    t.fail$data((0, ua._)`${r} ${da[e].fail} ${n} || isNaN(${r})`);
  }
};
Pc.default = cE;
var Rc = {};
Object.defineProperty(Rc, "__esModule", { value: !0 });
const Gn = me, lE = {
  message: ({ schemaCode: t }) => (0, Gn.str)`must be multiple of ${t}`,
  params: ({ schemaCode: t }) => (0, Gn._)`{multipleOf: ${t}}`
}, uE = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: lE,
  code(t) {
    const { gen: e, data: r, schemaCode: n, it: s } = t, a = s.opts.multipleOfPrecision, o = e.let("res"), i = a ? (0, Gn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Gn._)`${o} !== parseInt(${o})`;
    t.fail$data((0, Gn._)`(${n} === 0 || (${o} = ${r}/${n}, ${i}))`);
  }
};
Rc.default = uE;
var Ic = {}, Oc = {};
Object.defineProperty(Oc, "__esModule", { value: !0 });
function dh(t) {
  const e = t.length;
  let r = 0, n = 0, s;
  for (; n < e; )
    r++, s = t.charCodeAt(n++), s >= 55296 && s <= 56319 && n < e && (s = t.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Oc.default = dh;
dh.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ic, "__esModule", { value: !0 });
const Sr = me, dE = K, fE = Oc, hE = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxLength" ? "more" : "fewer";
    return (0, Sr.str)`must NOT have ${r} than ${e} characters`;
  },
  params: ({ schemaCode: t }) => (0, Sr._)`{limit: ${t}}`
}, mE = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: hE,
  code(t) {
    const { keyword: e, data: r, schemaCode: n, it: s } = t, a = e === "maxLength" ? Sr.operators.GT : Sr.operators.LT, o = s.opts.unicode === !1 ? (0, Sr._)`${r}.length` : (0, Sr._)`${(0, dE.useFunc)(t.gen, fE.default)}(${r})`;
    t.fail$data((0, Sr._)`${o} ${a} ${n}`);
  }
};
Ic.default = mE;
var Nc = {};
Object.defineProperty(Nc, "__esModule", { value: !0 });
const pE = ye, fa = me, yE = {
  message: ({ schemaCode: t }) => (0, fa.str)`must match pattern "${t}"`,
  params: ({ schemaCode: t }) => (0, fa._)`{pattern: ${t}}`
}, $E = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: yE,
  code(t) {
    const { data: e, $data: r, schema: n, schemaCode: s, it: a } = t, o = a.opts.unicodeRegExp ? "u" : "", i = r ? (0, fa._)`(new RegExp(${s}, ${o}))` : (0, pE.usePattern)(t, n);
    t.fail$data((0, fa._)`!${i}.test(${e})`);
  }
};
Nc.default = $E;
var Ac = {};
Object.defineProperty(Ac, "__esModule", { value: !0 });
const Bn = me, gE = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxProperties" ? "more" : "fewer";
    return (0, Bn.str)`must NOT have ${r} than ${e} properties`;
  },
  params: ({ schemaCode: t }) => (0, Bn._)`{limit: ${t}}`
}, _E = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: gE,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxProperties" ? Bn.operators.GT : Bn.operators.LT;
    t.fail$data((0, Bn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ac.default = _E;
var Tc = {};
Object.defineProperty(Tc, "__esModule", { value: !0 });
const Sn = ye, Hn = me, vE = K, wE = {
  message: ({ params: { missingProperty: t } }) => (0, Hn.str)`must have required property '${t}'`,
  params: ({ params: { missingProperty: t } }) => (0, Hn._)`{missingProperty: ${t}}`
}, bE = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: wE,
  code(t) {
    const { gen: e, schema: r, schemaCode: n, data: s, $data: a, it: o } = t, { opts: i } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= i.loopRequired;
    if (o.allErrors ? d() : l(), i.strictRequired) {
      const m = t.parentSchema.properties, { definedProperties: g } = t.it;
      for (const y of r)
        if ((m == null ? void 0 : m[y]) === void 0 && !g.has(y)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, p = `required property "${y}" is not defined at "${$}" (strictRequired)`;
          (0, vE.checkStrictMode)(o, p, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        t.block$data(Hn.nil, f);
      else
        for (const m of r)
          (0, Sn.checkReportMissingProp)(t, m);
    }
    function l() {
      const m = e.let("missing");
      if (c || a) {
        const g = e.let("valid", !0);
        t.block$data(g, () => _(m, g)), t.ok(g);
      } else
        e.if((0, Sn.checkMissingProp)(t, r, m)), (0, Sn.reportMissingProp)(t, m), e.else();
    }
    function f() {
      e.forOf("prop", n, (m) => {
        t.setParams({ missingProperty: m }), e.if((0, Sn.noPropertyInData)(e, s, m, i.ownProperties), () => t.error());
      });
    }
    function _(m, g) {
      t.setParams({ missingProperty: m }), e.forOf(m, n, () => {
        e.assign(g, (0, Sn.propertyInData)(e, s, m, i.ownProperties)), e.if((0, Hn.not)(g), () => {
          t.error(), e.break();
        });
      }, Hn.nil);
    }
  }
};
Tc.default = bE;
var kc = {};
Object.defineProperty(kc, "__esModule", { value: !0 });
const Wn = me, EE = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxItems" ? "more" : "fewer";
    return (0, Wn.str)`must NOT have ${r} than ${e} items`;
  },
  params: ({ schemaCode: t }) => (0, Wn._)`{limit: ${t}}`
}, SE = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: EE,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxItems" ? Wn.operators.GT : Wn.operators.LT;
    t.fail$data((0, Wn._)`${r}.length ${s} ${n}`);
  }
};
kc.default = SE;
var Cc = {}, ss = {};
Object.defineProperty(ss, "__esModule", { value: !0 });
const fh = Ea;
fh.code = 'require("ajv/dist/runtime/equal").default';
ss.default = fh;
Object.defineProperty(Cc, "__esModule", { value: !0 });
const ao = ke, Ve = me, PE = K, RE = ss, IE = {
  message: ({ params: { i: t, j: e } }) => (0, Ve.str)`must NOT have duplicate items (items ## ${e} and ${t} are identical)`,
  params: ({ params: { i: t, j: e } }) => (0, Ve._)`{i: ${t}, j: ${e}}`
}, OE = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: IE,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: i } = t;
    if (!n && !s)
      return;
    const c = e.let("valid"), d = a.items ? (0, ao.getSchemaTypes)(a.items) : [];
    t.block$data(c, l, (0, Ve._)`${o} === false`), t.ok(c);
    function l() {
      const g = e.let("i", (0, Ve._)`${r}.length`), y = e.let("j");
      t.setParams({ i: g, j: y }), e.assign(c, !0), e.if((0, Ve._)`${g} > 1`, () => (f() ? _ : m)(g, y));
    }
    function f() {
      return d.length > 0 && !d.some((g) => g === "object" || g === "array");
    }
    function _(g, y) {
      const $ = e.name("item"), p = (0, ao.checkDataTypes)(d, $, i.opts.strictNumbers, ao.DataType.Wrong), w = e.const("indices", (0, Ve._)`{}`);
      e.for((0, Ve._)`;${g}--;`, () => {
        e.let($, (0, Ve._)`${r}[${g}]`), e.if(p, (0, Ve._)`continue`), d.length > 1 && e.if((0, Ve._)`typeof ${$} == "string"`, (0, Ve._)`${$} += "_"`), e.if((0, Ve._)`typeof ${w}[${$}] == "number"`, () => {
          e.assign(y, (0, Ve._)`${w}[${$}]`), t.error(), e.assign(c, !1).break();
        }).code((0, Ve._)`${w}[${$}] = ${g}`);
      });
    }
    function m(g, y) {
      const $ = (0, PE.useFunc)(e, RE.default), p = e.name("outer");
      e.label(p).for((0, Ve._)`;${g}--;`, () => e.for((0, Ve._)`${y} = ${g}; ${y}--;`, () => e.if((0, Ve._)`${$}(${r}[${g}], ${r}[${y}])`, () => {
        t.error(), e.assign(c, !1).break(p);
      })));
    }
  }
};
Cc.default = OE;
var jc = {};
Object.defineProperty(jc, "__esModule", { value: !0 });
const Fo = me, NE = K, AE = ss, TE = {
  message: "must be equal to constant",
  params: ({ schemaCode: t }) => (0, Fo._)`{allowedValue: ${t}}`
}, kE = {
  keyword: "const",
  $data: !0,
  error: TE,
  code(t) {
    const { gen: e, data: r, $data: n, schemaCode: s, schema: a } = t;
    n || a && typeof a == "object" ? t.fail$data((0, Fo._)`!${(0, NE.useFunc)(e, AE.default)}(${r}, ${s})`) : t.fail((0, Fo._)`${a} !== ${r}`);
  }
};
jc.default = kE;
var Dc = {};
Object.defineProperty(Dc, "__esModule", { value: !0 });
const Nn = me, CE = K, jE = ss, DE = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: t }) => (0, Nn._)`{allowedValues: ${t}}`
}, ME = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: DE,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, schemaCode: a, it: o } = t;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const i = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, CE.useFunc)(e, jE.default));
    let l;
    if (i || n)
      l = e.let("valid"), t.block$data(l, f);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const m = e.const("vSchema", a);
      l = (0, Nn.or)(...s.map((g, y) => _(m, y)));
    }
    t.pass(l);
    function f() {
      e.assign(l, !1), e.forOf("v", a, (m) => e.if((0, Nn._)`${d()}(${r}, ${m})`, () => e.assign(l, !0).break()));
    }
    function _(m, g) {
      const y = s[g];
      return typeof y == "object" && y !== null ? (0, Nn._)`${d()}(${r}, ${m}[${g}])` : (0, Nn._)`${r} === ${y}`;
    }
  }
};
Dc.default = ME;
Object.defineProperty(Sc, "__esModule", { value: !0 });
const LE = Pc, FE = Rc, VE = Ic, UE = Nc, qE = Ac, xE = Tc, zE = kc, KE = Cc, GE = jc, BE = Dc, HE = [
  // number
  LE.default,
  FE.default,
  // string
  VE.default,
  UE.default,
  // object
  qE.default,
  xE.default,
  // array
  zE.default,
  KE.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  GE.default,
  BE.default
];
Sc.default = HE;
var Mc = {}, fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
fn.validateAdditionalItems = void 0;
const Pr = me, Vo = K, WE = {
  message: ({ params: { len: t } }) => (0, Pr.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Pr._)`{limit: ${t}}`
}, JE = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: WE,
  code(t) {
    const { parentSchema: e, it: r } = t, { items: n } = e;
    if (!Array.isArray(n)) {
      (0, Vo.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    hh(t, n);
  }
};
function hh(t, e) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = t;
  o.items = !0;
  const i = r.const("len", (0, Pr._)`${s}.length`);
  if (n === !1)
    t.setParams({ len: e.length }), t.pass((0, Pr._)`${i} <= ${e.length}`);
  else if (typeof n == "object" && !(0, Vo.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Pr._)`${i} <= ${e.length}`);
    r.if((0, Pr.not)(d), () => c(d)), t.ok(d);
  }
  function c(d) {
    r.forRange("i", e.length, i, (l) => {
      t.subschema({ keyword: a, dataProp: l, dataPropType: Vo.Type.Num }, d), o.allErrors || r.if((0, Pr.not)(d), () => r.break());
    });
  }
}
fn.validateAdditionalItems = hh;
fn.default = JE;
var Lc = {}, hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
hn.validateTuple = void 0;
const Iu = me, Ks = K, XE = ye, YE = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(t) {
    const { schema: e, it: r } = t;
    if (Array.isArray(e))
      return mh(t, "additionalItems", e);
    r.items = !0, !(0, Ks.alwaysValidSchema)(r, e) && t.ok((0, XE.validateArray)(t));
  }
};
function mh(t, e, r = t.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: i } = t;
  l(s), i.opts.unevaluated && r.length && i.items !== !0 && (i.items = Ks.mergeEvaluated.items(n, r.length, i.items));
  const c = n.name("valid"), d = n.const("len", (0, Iu._)`${a}.length`);
  r.forEach((f, _) => {
    (0, Ks.alwaysValidSchema)(i, f) || (n.if((0, Iu._)`${d} > ${_}`, () => t.subschema({
      keyword: o,
      schemaProp: _,
      dataProp: _
    }, c)), t.ok(c));
  });
  function l(f) {
    const { opts: _, errSchemaPath: m } = i, g = r.length, y = g === f.minItems && (g === f.maxItems || f[e] === !1);
    if (_.strictTuples && !y) {
      const $ = `"${o}" is ${g}-tuple, but minItems or maxItems/${e} are not specified or different at path "${m}"`;
      (0, Ks.checkStrictMode)(i, $, _.strictTuples);
    }
  }
}
hn.validateTuple = mh;
hn.default = YE;
Object.defineProperty(Lc, "__esModule", { value: !0 });
const QE = hn, ZE = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (t) => (0, QE.validateTuple)(t, "items")
};
Lc.default = ZE;
var Fc = {};
Object.defineProperty(Fc, "__esModule", { value: !0 });
const Ou = me, eS = K, tS = ye, rS = fn, nS = {
  message: ({ params: { len: t } }) => (0, Ou.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Ou._)`{limit: ${t}}`
}, sS = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: nS,
  code(t) {
    const { schema: e, parentSchema: r, it: n } = t, { prefixItems: s } = r;
    n.items = !0, !(0, eS.alwaysValidSchema)(n, e) && (s ? (0, rS.validateAdditionalItems)(t, s) : t.ok((0, tS.validateArray)(t)));
  }
};
Fc.default = sS;
var Vc = {};
Object.defineProperty(Vc, "__esModule", { value: !0 });
const ht = me, _s = K, aS = {
  message: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ht.str)`must contain at least ${t} valid item(s)` : (0, ht.str)`must contain at least ${t} and no more than ${e} valid item(s)`,
  params: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ht._)`{minContains: ${t}}` : (0, ht._)`{minContains: ${t}, maxContains: ${e}}`
}, oS = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: aS,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    let o, i;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, i = d) : o = 1;
    const l = e.const("len", (0, ht._)`${s}.length`);
    if (t.setParams({ min: o, max: i }), i === void 0 && o === 0) {
      (0, _s.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (i !== void 0 && o > i) {
      (0, _s.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), t.fail();
      return;
    }
    if ((0, _s.alwaysValidSchema)(a, r)) {
      let y = (0, ht._)`${l} >= ${o}`;
      i !== void 0 && (y = (0, ht._)`${y} && ${l} <= ${i}`), t.pass(y);
      return;
    }
    a.items = !0;
    const f = e.name("valid");
    i === void 0 && o === 1 ? m(f, () => e.if(f, () => e.break())) : o === 0 ? (e.let(f, !0), i !== void 0 && e.if((0, ht._)`${s}.length > 0`, _)) : (e.let(f, !1), _()), t.result(f, () => t.reset());
    function _() {
      const y = e.name("_valid"), $ = e.let("count", 0);
      m(y, () => e.if(y, () => g($)));
    }
    function m(y, $) {
      e.forRange("i", 0, l, (p) => {
        t.subschema({
          keyword: "contains",
          dataProp: p,
          dataPropType: _s.Type.Num,
          compositeRule: !0
        }, y), $();
      });
    }
    function g(y) {
      e.code((0, ht._)`${y}++`), i === void 0 ? e.if((0, ht._)`${y} >= ${o}`, () => e.assign(f, !0).break()) : (e.if((0, ht._)`${y} > ${i}`, () => e.assign(f, !1).break()), o === 1 ? e.assign(f, !0) : e.if((0, ht._)`${y} >= ${o}`, () => e.assign(f, !0)));
    }
  }
};
Vc.default = oS;
var ph = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
  const e = me, r = K, n = ye;
  t.error = {
    message: ({ params: { property: c, depsCount: d, deps: l } }) => {
      const f = d === 1 ? "property" : "properties";
      return (0, e.str)`must have ${f} ${l} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: l, missingProperty: f } }) => (0, e._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${d},
    deps: ${l}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(c) {
      const [d, l] = a(c);
      o(c, d), i(c, l);
    }
  };
  function a({ schema: c }) {
    const d = {}, l = {};
    for (const f in c) {
      if (f === "__proto__")
        continue;
      const _ = Array.isArray(c[f]) ? d : l;
      _[f] = c[f];
    }
    return [d, l];
  }
  function o(c, d = c.schema) {
    const { gen: l, data: f, it: _ } = c;
    if (Object.keys(d).length === 0)
      return;
    const m = l.let("missing");
    for (const g in d) {
      const y = d[g];
      if (y.length === 0)
        continue;
      const $ = (0, n.propertyInData)(l, f, g, _.opts.ownProperties);
      c.setParams({
        property: g,
        depsCount: y.length,
        deps: y.join(", ")
      }), _.allErrors ? l.if($, () => {
        for (const p of y)
          (0, n.checkReportMissingProp)(c, p);
      }) : (l.if((0, e._)`${$} && (${(0, n.checkMissingProp)(c, y, m)})`), (0, n.reportMissingProp)(c, m), l.else());
    }
  }
  t.validatePropertyDeps = o;
  function i(c, d = c.schema) {
    const { gen: l, data: f, keyword: _, it: m } = c, g = l.name("valid");
    for (const y in d)
      (0, r.alwaysValidSchema)(m, d[y]) || (l.if(
        (0, n.propertyInData)(l, f, y, m.opts.ownProperties),
        () => {
          const $ = c.subschema({ keyword: _, schemaProp: y }, g);
          c.mergeValidEvaluated($, g);
        },
        () => l.var(g, !0)
        // TODO var
      ), c.ok(g));
  }
  t.validateSchemaDeps = i, t.default = s;
})(ph);
var Uc = {};
Object.defineProperty(Uc, "__esModule", { value: !0 });
const yh = me, iS = K, cS = {
  message: "property name must be valid",
  params: ({ params: t }) => (0, yh._)`{propertyName: ${t.propertyName}}`
}, lS = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: cS,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t;
    if ((0, iS.alwaysValidSchema)(s, r))
      return;
    const a = e.name("valid");
    e.forIn("key", n, (o) => {
      t.setParams({ propertyName: o }), t.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), e.if((0, yh.not)(a), () => {
        t.error(!0), s.allErrors || e.break();
      });
    }), t.ok(a);
  }
};
Uc.default = lS;
var Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const vs = ye, vt = me, uS = Mt, ws = K, dS = {
  message: "must NOT have additional properties",
  params: ({ params: t }) => (0, vt._)`{additionalProperty: ${t.additionalProperty}}`
}, fS = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: dS,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = t;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: i, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, ws.alwaysValidSchema)(o, r))
      return;
    const d = (0, vs.allSchemaProperties)(n.properties), l = (0, vs.allSchemaProperties)(n.patternProperties);
    f(), t.ok((0, vt._)`${a} === ${uS.default.errors}`);
    function f() {
      e.forIn("key", s, ($) => {
        !d.length && !l.length ? g($) : e.if(_($), () => g($));
      });
    }
    function _($) {
      let p;
      if (d.length > 8) {
        const w = (0, ws.schemaRefOrVal)(o, n.properties, "properties");
        p = (0, vs.isOwnProperty)(e, w, $);
      } else d.length ? p = (0, vt.or)(...d.map((w) => (0, vt._)`${$} === ${w}`)) : p = vt.nil;
      return l.length && (p = (0, vt.or)(p, ...l.map((w) => (0, vt._)`${(0, vs.usePattern)(t, w)}.test(${$})`))), (0, vt.not)(p);
    }
    function m($) {
      e.code((0, vt._)`delete ${s}[${$}]`);
    }
    function g($) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        m($);
        return;
      }
      if (r === !1) {
        t.setParams({ additionalProperty: $ }), t.error(), i || e.break();
        return;
      }
      if (typeof r == "object" && !(0, ws.alwaysValidSchema)(o, r)) {
        const p = e.name("valid");
        c.removeAdditional === "failing" ? (y($, p, !1), e.if((0, vt.not)(p), () => {
          t.reset(), m($);
        })) : (y($, p), i || e.if((0, vt.not)(p), () => e.break()));
      }
    }
    function y($, p, w) {
      const S = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: ws.Type.Str
      };
      w === !1 && Object.assign(S, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), t.subschema(S, p);
    }
  }
};
Ca.default = fS;
var qc = {};
Object.defineProperty(qc, "__esModule", { value: !0 });
const hS = Aa(), Nu = ye, oo = K, Au = Ca, mS = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Au.default.code(new hS.KeywordCxt(a, Au.default, "additionalProperties"));
    const o = (0, Nu.allSchemaProperties)(r);
    for (const f of o)
      a.definedProperties.add(f);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = oo.mergeEvaluated.props(e, (0, oo.toHash)(o), a.props));
    const i = o.filter((f) => !(0, oo.alwaysValidSchema)(a, r[f]));
    if (i.length === 0)
      return;
    const c = e.name("valid");
    for (const f of i)
      d(f) ? l(f) : (e.if((0, Nu.propertyInData)(e, s, f, a.opts.ownProperties)), l(f), a.allErrors || e.else().var(c, !0), e.endIf()), t.it.definedProperties.add(f), t.ok(c);
    function d(f) {
      return a.opts.useDefaults && !a.compositeRule && r[f].default !== void 0;
    }
    function l(f) {
      t.subschema({
        keyword: "properties",
        schemaProp: f,
        dataProp: f
      }, c);
    }
  }
};
qc.default = mS;
var xc = {};
Object.defineProperty(xc, "__esModule", { value: !0 });
const Tu = ye, bs = me, ku = K, Cu = K, pS = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, data: n, parentSchema: s, it: a } = t, { opts: o } = a, i = (0, Tu.allSchemaProperties)(r), c = i.filter((y) => (0, ku.alwaysValidSchema)(a, r[y]));
    if (i.length === 0 || c.length === i.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, l = e.name("valid");
    a.props !== !0 && !(a.props instanceof bs.Name) && (a.props = (0, Cu.evaluatedPropsToName)(e, a.props));
    const { props: f } = a;
    _();
    function _() {
      for (const y of i)
        d && m(y), a.allErrors ? g(y) : (e.var(l, !0), g(y), e.if(l));
    }
    function m(y) {
      for (const $ in d)
        new RegExp(y).test($) && (0, ku.checkStrictMode)(a, `property ${$} matches pattern ${y} (use allowMatchingProperties)`);
    }
    function g(y) {
      e.forIn("key", n, ($) => {
        e.if((0, bs._)`${(0, Tu.usePattern)(t, y)}.test(${$})`, () => {
          const p = c.includes(y);
          p || t.subschema({
            keyword: "patternProperties",
            schemaProp: y,
            dataProp: $,
            dataPropType: Cu.Type.Str
          }, l), a.opts.unevaluated && f !== !0 ? e.assign((0, bs._)`${f}[${$}]`, !0) : !p && !a.allErrors && e.if((0, bs.not)(l), () => e.break());
        });
      });
    }
  }
};
xc.default = pS;
var zc = {};
Object.defineProperty(zc, "__esModule", { value: !0 });
const yS = K, $S = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if ((0, yS.alwaysValidSchema)(n, r)) {
      t.fail();
      return;
    }
    const s = e.name("valid");
    t.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), t.failResult(s, () => t.reset(), () => t.error());
  },
  error: { message: "must NOT be valid" }
};
zc.default = $S;
var Kc = {};
Object.defineProperty(Kc, "__esModule", { value: !0 });
const gS = ye, _S = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: gS.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Kc.default = _S;
var Gc = {};
Object.defineProperty(Gc, "__esModule", { value: !0 });
const Gs = me, vS = K, wS = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: t }) => (0, Gs._)`{passingSchemas: ${t.passing}}`
}, bS = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: wS,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, it: s } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = e.let("valid", !1), i = e.let("passing", null), c = e.name("_valid");
    t.setParams({ passing: i }), e.block(d), t.result(o, () => t.reset(), () => t.error(!0));
    function d() {
      a.forEach((l, f) => {
        let _;
        (0, vS.alwaysValidSchema)(s, l) ? e.var(c, !0) : _ = t.subschema({
          keyword: "oneOf",
          schemaProp: f,
          compositeRule: !0
        }, c), f > 0 && e.if((0, Gs._)`${c} && ${o}`).assign(o, !1).assign(i, (0, Gs._)`[${i}, ${f}]`).else(), e.if(c, () => {
          e.assign(o, !0), e.assign(i, f), _ && t.mergeEvaluated(_, Gs.Name);
        });
      });
    }
  }
};
Gc.default = bS;
var Bc = {};
Object.defineProperty(Bc, "__esModule", { value: !0 });
const ES = K, SS = {
  keyword: "allOf",
  schemaType: "array",
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = e.name("valid");
    r.forEach((a, o) => {
      if ((0, ES.alwaysValidSchema)(n, a))
        return;
      const i = t.subschema({ keyword: "allOf", schemaProp: o }, s);
      t.ok(s), t.mergeEvaluated(i);
    });
  }
};
Bc.default = SS;
var Hc = {};
Object.defineProperty(Hc, "__esModule", { value: !0 });
const ha = me, $h = K, PS = {
  message: ({ params: t }) => (0, ha.str)`must match "${t.ifClause}" schema`,
  params: ({ params: t }) => (0, ha._)`{failingKeyword: ${t.ifClause}}`
}, RS = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: PS,
  code(t) {
    const { gen: e, parentSchema: r, it: n } = t;
    r.then === void 0 && r.else === void 0 && (0, $h.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = ju(n, "then"), a = ju(n, "else");
    if (!s && !a)
      return;
    const o = e.let("valid", !0), i = e.name("_valid");
    if (c(), t.reset(), s && a) {
      const l = e.let("ifClause");
      t.setParams({ ifClause: l }), e.if(i, d("then", l), d("else", l));
    } else s ? e.if(i, d("then")) : e.if((0, ha.not)(i), d("else"));
    t.pass(o, () => t.error(!0));
    function c() {
      const l = t.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i);
      t.mergeEvaluated(l);
    }
    function d(l, f) {
      return () => {
        const _ = t.subschema({ keyword: l }, i);
        e.assign(o, i), t.mergeValidEvaluated(_, o), f ? e.assign(f, (0, ha._)`${l}`) : t.setParams({ ifClause: l });
      };
    }
  }
};
function ju(t, e) {
  const r = t.schema[e];
  return r !== void 0 && !(0, $h.alwaysValidSchema)(t, r);
}
Hc.default = RS;
var Wc = {};
Object.defineProperty(Wc, "__esModule", { value: !0 });
const IS = K, OS = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: t, parentSchema: e, it: r }) {
    e.if === void 0 && (0, IS.checkStrictMode)(r, `"${t}" without "if" is ignored`);
  }
};
Wc.default = OS;
Object.defineProperty(Mc, "__esModule", { value: !0 });
const NS = fn, AS = Lc, TS = hn, kS = Fc, CS = Vc, jS = ph, DS = Uc, MS = Ca, LS = qc, FS = xc, VS = zc, US = Kc, qS = Gc, xS = Bc, zS = Hc, KS = Wc;
function GS(t = !1) {
  const e = [
    // any
    VS.default,
    US.default,
    qS.default,
    xS.default,
    zS.default,
    KS.default,
    // object
    DS.default,
    MS.default,
    jS.default,
    LS.default,
    FS.default
  ];
  return t ? e.push(AS.default, kS.default) : e.push(NS.default, TS.default), e.push(CS.default), e;
}
Mc.default = GS;
var Jc = {}, Xc = {};
Object.defineProperty(Xc, "__esModule", { value: !0 });
const Ie = me, BS = {
  message: ({ schemaCode: t }) => (0, Ie.str)`must match format "${t}"`,
  params: ({ schemaCode: t }) => (0, Ie._)`{format: ${t}}`
}, HS = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: BS,
  code(t, e) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: i } = t, { opts: c, errSchemaPath: d, schemaEnv: l, self: f } = i;
    if (!c.validateFormats)
      return;
    s ? _() : m();
    function _() {
      const g = r.scopeValue("formats", {
        ref: f.formats,
        code: c.code.formats
      }), y = r.const("fDef", (0, Ie._)`${g}[${o}]`), $ = r.let("fType"), p = r.let("format");
      r.if((0, Ie._)`typeof ${y} == "object" && !(${y} instanceof RegExp)`, () => r.assign($, (0, Ie._)`${y}.type || "string"`).assign(p, (0, Ie._)`${y}.validate`), () => r.assign($, (0, Ie._)`"string"`).assign(p, y)), t.fail$data((0, Ie.or)(w(), S()));
      function w() {
        return c.strictSchema === !1 ? Ie.nil : (0, Ie._)`${o} && !${p}`;
      }
      function S() {
        const R = l.$async ? (0, Ie._)`(${y}.async ? await ${p}(${n}) : ${p}(${n}))` : (0, Ie._)`${p}(${n})`, A = (0, Ie._)`(typeof ${p} == "function" ? ${R} : ${p}.test(${n}))`;
        return (0, Ie._)`${p} && ${p} !== true && ${$} === ${e} && !${A}`;
      }
    }
    function m() {
      const g = f.formats[a];
      if (!g) {
        w();
        return;
      }
      if (g === !0)
        return;
      const [y, $, p] = S(g);
      y === e && t.pass(R());
      function w() {
        if (c.strictSchema === !1) {
          f.logger.warn(A());
          return;
        }
        throw new Error(A());
        function A() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function S(A) {
        const F = A instanceof RegExp ? (0, Ie.regexpCode)(A) : c.code.formats ? (0, Ie._)`${c.code.formats}${(0, Ie.getProperty)(a)}` : void 0, V = r.scopeValue("formats", { key: a, ref: A, code: F });
        return typeof A == "object" && !(A instanceof RegExp) ? [A.type || "string", A.validate, (0, Ie._)`${V}.validate`] : ["string", A, V];
      }
      function R() {
        if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
          if (!l.$async)
            throw new Error("async format in sync schema");
          return (0, Ie._)`await ${p}(${n})`;
        }
        return typeof $ == "function" ? (0, Ie._)`${p}(${n})` : (0, Ie._)`${p}.test(${n})`;
      }
    }
  }
};
Xc.default = HS;
Object.defineProperty(Jc, "__esModule", { value: !0 });
const WS = Xc, JS = [WS.default];
Jc.default = JS;
var nn = {};
Object.defineProperty(nn, "__esModule", { value: !0 });
nn.contentVocabulary = nn.metadataVocabulary = void 0;
nn.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
nn.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(wc, "__esModule", { value: !0 });
const XS = bc, YS = Sc, QS = Mc, ZS = Jc, Du = nn, e1 = [
  XS.default,
  YS.default,
  (0, QS.default)(),
  ZS.default,
  Du.metadataVocabulary,
  Du.contentVocabulary
];
wc.default = e1;
var Yc = {}, ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
ja.DiscrError = void 0;
var Mu;
(function(t) {
  t.Tag = "tag", t.Mapping = "mapping";
})(Mu || (ja.DiscrError = Mu = {}));
Object.defineProperty(Yc, "__esModule", { value: !0 });
const Kr = me, Uo = ja, Lu = at, t1 = dn, r1 = K, n1 = {
  message: ({ params: { discrError: t, tagName: e } }) => t === Uo.DiscrError.Tag ? `tag "${e}" must be string` : `value of tag "${e}" must be in oneOf`,
  params: ({ params: { discrError: t, tag: e, tagName: r } }) => (0, Kr._)`{error: ${t}, tag: ${r}, tagValue: ${e}}`
}, s1 = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: n1,
  code(t) {
    const { gen: e, data: r, schema: n, parentSchema: s, it: a } = t, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const i = n.propertyName;
    if (typeof i != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = e.let("valid", !1), d = e.const("tag", (0, Kr._)`${r}${(0, Kr.getProperty)(i)}`);
    e.if((0, Kr._)`typeof ${d} == "string"`, () => l(), () => t.error(!1, { discrError: Uo.DiscrError.Tag, tag: d, tagName: i })), t.ok(c);
    function l() {
      const m = _();
      e.if(!1);
      for (const g in m)
        e.elseIf((0, Kr._)`${d} === ${g}`), e.assign(c, f(m[g]));
      e.else(), t.error(!1, { discrError: Uo.DiscrError.Mapping, tag: d, tagName: i }), e.endIf();
    }
    function f(m) {
      const g = e.name("valid"), y = t.subschema({ keyword: "oneOf", schemaProp: m }, g);
      return t.mergeEvaluated(y, Kr.Name), g;
    }
    function _() {
      var m;
      const g = {}, y = p(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let A = o[R];
        if (A != null && A.$ref && !(0, r1.schemaHasRulesButRef)(A, a.self.RULES)) {
          const V = A.$ref;
          if (A = Lu.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, V), A instanceof Lu.SchemaEnv && (A = A.schema), A === void 0)
            throw new t1.default(a.opts.uriResolver, a.baseId, V);
        }
        const F = (m = A == null ? void 0 : A.properties) === null || m === void 0 ? void 0 : m[i];
        if (typeof F != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${i}"`);
        $ = $ && (y || p(A)), w(F, R);
      }
      if (!$)
        throw new Error(`discriminator: "${i}" must be required`);
      return g;
      function p({ required: R }) {
        return Array.isArray(R) && R.includes(i);
      }
      function w(R, A) {
        if (R.const)
          S(R.const, A);
        else if (R.enum)
          for (const F of R.enum)
            S(F, A);
        else
          throw new Error(`discriminator: "properties/${i}" must have "const" or "enum"`);
      }
      function S(R, A) {
        if (typeof R != "string" || R in g)
          throw new Error(`discriminator: "${i}" values must be unique strings`);
        g[R] = A;
      }
    }
  }
};
Yc.default = s1;
const a1 = "http://json-schema.org/draft-07/schema#", o1 = "http://json-schema.org/draft-07/schema#", i1 = "Core schema meta-schema", c1 = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, l1 = [
  "object",
  "boolean"
], u1 = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, d1 = {
  $schema: a1,
  $id: o1,
  title: i1,
  definitions: c1,
  type: l1,
  properties: u1,
  default: !0
};
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv = void 0;
  const r = Bf, n = wc, s = Yc, a = d1, o = ["/properties"], i = "http://json-schema.org/draft-07/schema";
  class c extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const g = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(g, i, !1), this.refs["http://json-schema.org/schema"] = i;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
    }
  }
  e.Ajv = c, t.exports = e = c, t.exports.Ajv = c, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = c;
  var d = Aa();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var l = me;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return l._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return l.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return l.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return l.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return l.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return l.CodeGen;
  } });
  var f = gc();
  Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
    return f.default;
  } });
  var _ = dn;
  Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
    return _.default;
  } });
})(Co, Co.exports);
var f1 = Co.exports;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.formatLimitDefinition = void 0;
  const e = f1, r = me, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: i, schemaCode: c }) => (0, r.str)`should be ${s[i].okStr} ${c}`,
    params: ({ keyword: i, schemaCode: c }) => (0, r._)`{comparison: ${s[i].okStr}, limit: ${c}}`
  };
  t.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(i) {
      const { gen: c, data: d, schemaCode: l, keyword: f, it: _ } = i, { opts: m, self: g } = _;
      if (!m.validateFormats)
        return;
      const y = new e.KeywordCxt(_, g.RULES.all.format.definition, "format");
      y.$data ? $() : p();
      function $() {
        const S = c.scopeValue("formats", {
          ref: g.formats,
          code: m.code.formats
        }), R = c.const("fmt", (0, r._)`${S}[${y.schemaCode}]`);
        i.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, w(R)));
      }
      function p() {
        const S = y.schema, R = g.formats[S];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${f}": format "${S}" does not define "compare" function`);
        const A = c.scopeValue("formats", {
          key: S,
          ref: R,
          code: m.code.formats ? (0, r._)`${m.code.formats}${(0, r.getProperty)(S)}` : void 0
        });
        i.fail$data(w(A));
      }
      function w(S) {
        return (0, r._)`${S}.compare(${d}, ${l}) ${s[f].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (i) => (i.addKeyword(t.formatLimitDefinition), i);
  t.default = o;
})(Gf);
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 });
  const r = Kf, n = Gf, s = me, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), i = (d, l = { keywords: !0 }) => {
    if (Array.isArray(l))
      return c(d, l, r.fullFormats, a), d;
    const [f, _] = l.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], m = l.formats || r.formatNames;
    return c(d, m, f, _), l.keywords && (0, n.default)(d), d;
  };
  i.get = (d, l = "full") => {
    const _ = (l === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!_)
      throw new Error(`Unknown format "${d}"`);
    return _;
  };
  function c(d, l, f, _) {
    var m, g;
    (m = (g = d.opts.code).formats) !== null && m !== void 0 || (g.formats = (0, s._)`require("ajv-formats/dist/formats").${_}`);
    for (const y of l)
      d.addFormat(y, f[y]);
  }
  t.exports = e = i, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = i;
})(ko, ko.exports);
var h1 = ko.exports;
const m1 = /* @__PURE__ */ ni(h1), p1 = (t, e, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(t, r), a = Object.getOwnPropertyDescriptor(e, r);
  !y1(s, a) && n || Object.defineProperty(t, r, a);
}, y1 = function(t, e) {
  return t === void 0 || t.configurable || t.writable === e.writable && t.enumerable === e.enumerable && t.configurable === e.configurable && (t.writable || t.value === e.value);
}, $1 = (t, e) => {
  const r = Object.getPrototypeOf(e);
  r !== Object.getPrototypeOf(t) && Object.setPrototypeOf(t, r);
}, g1 = (t, e) => `/* Wrapped ${t}*/
${e}`, _1 = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), v1 = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), w1 = (t, e, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = g1.bind(null, n, e.toString());
  Object.defineProperty(s, "name", v1);
  const { writable: a, enumerable: o, configurable: i } = _1;
  Object.defineProperty(t, "toString", { value: s, writable: a, enumerable: o, configurable: i });
};
function b1(t, e, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = t;
  for (const s of Reflect.ownKeys(e))
    p1(t, e, s, r);
  return $1(t, e), w1(t, e, n), t;
}
const Fu = (t, e = {}) => {
  if (typeof t != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = e;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, i, c;
  const d = function(...l) {
    const f = this, _ = () => {
      o = void 0, i && (clearTimeout(i), i = void 0), a && (c = t.apply(f, l));
    }, m = () => {
      i = void 0, o && (clearTimeout(o), o = void 0), a && (c = t.apply(f, l));
    }, g = s && !o;
    return clearTimeout(o), o = setTimeout(_, r), n > 0 && n !== Number.POSITIVE_INFINITY && !i && (i = setTimeout(m, n)), g && (c = t.apply(f, l)), c;
  };
  return b1(d, t), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), i && (clearTimeout(i), i = void 0);
  }, d;
};
var qo = { exports: {} };
const E1 = "2.0.0", gh = 256, S1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, P1 = 16, R1 = gh - 6, I1 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Da = {
  MAX_LENGTH: gh,
  MAX_SAFE_COMPONENT_LENGTH: P1,
  MAX_SAFE_BUILD_LENGTH: R1,
  MAX_SAFE_INTEGER: S1,
  RELEASE_TYPES: I1,
  SEMVER_SPEC_VERSION: E1,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const O1 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
};
var Ma = O1;
(function(t, e) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = Da, a = Ma;
  e = t.exports = {};
  const o = e.re = [], i = e.safeRe = [], c = e.src = [], d = e.safeSrc = [], l = e.t = {};
  let f = 0;
  const _ = "[a-zA-Z0-9-]", m = [
    ["\\s", 1],
    ["\\d", s],
    [_, n]
  ], g = ($) => {
    for (const [p, w] of m)
      $ = $.split(`${p}*`).join(`${p}{0,${w}}`).split(`${p}+`).join(`${p}{1,${w}}`);
    return $;
  }, y = ($, p, w) => {
    const S = g(p), R = f++;
    a($, R, p), l[$] = R, c[R] = p, d[R] = S, o[R] = new RegExp(p, w ? "g" : void 0), i[R] = new RegExp(S, w ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${_}*`), y("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${_}+`), y("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), y("FULL", `^${c[l.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), y("LOOSE", `^${c[l.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), y("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", c[l.COERCE], !0), y("COERCERTLFULL", c[l.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", y("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", y("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(qo, qo.exports);
var as = qo.exports;
const N1 = Object.freeze({ loose: !0 }), A1 = Object.freeze({}), T1 = (t) => t ? typeof t != "object" ? N1 : t : A1;
var Qc = T1;
const Vu = /^[0-9]+$/, _h = (t, e) => {
  const r = Vu.test(t), n = Vu.test(e);
  return r && n && (t = +t, e = +e), t === e ? 0 : r && !n ? -1 : n && !r ? 1 : t < e ? -1 : 1;
}, k1 = (t, e) => _h(e, t);
var vh = {
  compareIdentifiers: _h,
  rcompareIdentifiers: k1
};
const Es = Ma, { MAX_LENGTH: Uu, MAX_SAFE_INTEGER: Ss } = Da, { safeRe: Ps, t: Rs } = as, C1 = Qc, { compareIdentifiers: Lr } = vh;
let j1 = class Nt {
  constructor(e, r) {
    if (r = C1(r), e instanceof Nt) {
      if (e.loose === !!r.loose && e.includePrerelease === !!r.includePrerelease)
        return e;
      e = e.version;
    } else if (typeof e != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
    if (e.length > Uu)
      throw new TypeError(
        `version is longer than ${Uu} characters`
      );
    Es("SemVer", e, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = e.trim().match(r.loose ? Ps[Rs.LOOSE] : Ps[Rs.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${e}`);
    if (this.raw = e, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Ss || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Ss || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Ss || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < Ss)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(e) {
    if (Es("SemVer.compare", this.version, this.options, e), !(e instanceof Nt)) {
      if (typeof e == "string" && e === this.version)
        return 0;
      e = new Nt(e, this.options);
    }
    return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e);
  }
  compareMain(e) {
    return e instanceof Nt || (e = new Nt(e, this.options)), Lr(this.major, e.major) || Lr(this.minor, e.minor) || Lr(this.patch, e.patch);
  }
  comparePre(e) {
    if (e instanceof Nt || (e = new Nt(e, this.options)), this.prerelease.length && !e.prerelease.length)
      return -1;
    if (!this.prerelease.length && e.prerelease.length)
      return 1;
    if (!this.prerelease.length && !e.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = e.prerelease[r];
      if (Es("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Lr(n, s);
    } while (++r);
  }
  compareBuild(e) {
    e instanceof Nt || (e = new Nt(e, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = e.build[r];
      if (Es("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Lr(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(e, r, n) {
    if (e.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? Ps[Rs.PRERELEASELOOSE] : Ps[Rs.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (e) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), Lr(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${e}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var tt = j1;
const qu = tt, D1 = (t, e, r = !1) => {
  if (t instanceof qu)
    return t;
  try {
    return new qu(t, e);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var mn = D1;
const M1 = mn, L1 = (t, e) => {
  const r = M1(t, e);
  return r ? r.version : null;
};
var F1 = L1;
const V1 = mn, U1 = (t, e) => {
  const r = V1(t.trim().replace(/^[=v]+/, ""), e);
  return r ? r.version : null;
};
var q1 = U1;
const xu = tt, x1 = (t, e, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new xu(
      t instanceof xu ? t.version : t,
      r
    ).inc(e, n, s).version;
  } catch {
    return null;
  }
};
var z1 = x1;
const zu = mn, K1 = (t, e) => {
  const r = zu(t, null, !0), n = zu(e, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, i = a ? n : r, c = !!o.prerelease.length;
  if (!!i.prerelease.length && !c) {
    if (!i.patch && !i.minor)
      return "major";
    if (i.compareMain(o) === 0)
      return i.minor && !i.patch ? "minor" : "patch";
  }
  const l = c ? "pre" : "";
  return r.major !== n.major ? l + "major" : r.minor !== n.minor ? l + "minor" : r.patch !== n.patch ? l + "patch" : "prerelease";
};
var G1 = K1;
const B1 = tt, H1 = (t, e) => new B1(t, e).major;
var W1 = H1;
const J1 = tt, X1 = (t, e) => new J1(t, e).minor;
var Y1 = X1;
const Q1 = tt, Z1 = (t, e) => new Q1(t, e).patch;
var eP = Z1;
const tP = mn, rP = (t, e) => {
  const r = tP(t, e);
  return r && r.prerelease.length ? r.prerelease : null;
};
var nP = rP;
const Ku = tt, sP = (t, e, r) => new Ku(t, r).compare(new Ku(e, r));
var Pt = sP;
const aP = Pt, oP = (t, e, r) => aP(e, t, r);
var iP = oP;
const cP = Pt, lP = (t, e) => cP(t, e, !0);
var uP = lP;
const Gu = tt, dP = (t, e, r) => {
  const n = new Gu(t, r), s = new Gu(e, r);
  return n.compare(s) || n.compareBuild(s);
};
var Zc = dP;
const fP = Zc, hP = (t, e) => t.sort((r, n) => fP(r, n, e));
var mP = hP;
const pP = Zc, yP = (t, e) => t.sort((r, n) => pP(n, r, e));
var $P = yP;
const gP = Pt, _P = (t, e, r) => gP(t, e, r) > 0;
var La = _P;
const vP = Pt, wP = (t, e, r) => vP(t, e, r) < 0;
var el = wP;
const bP = Pt, EP = (t, e, r) => bP(t, e, r) === 0;
var wh = EP;
const SP = Pt, PP = (t, e, r) => SP(t, e, r) !== 0;
var bh = PP;
const RP = Pt, IP = (t, e, r) => RP(t, e, r) >= 0;
var tl = IP;
const OP = Pt, NP = (t, e, r) => OP(t, e, r) <= 0;
var rl = NP;
const AP = wh, TP = bh, kP = La, CP = tl, jP = el, DP = rl, MP = (t, e, r, n) => {
  switch (e) {
    case "===":
      return typeof t == "object" && (t = t.version), typeof r == "object" && (r = r.version), t === r;
    case "!==":
      return typeof t == "object" && (t = t.version), typeof r == "object" && (r = r.version), t !== r;
    case "":
    case "=":
    case "==":
      return AP(t, r, n);
    case "!=":
      return TP(t, r, n);
    case ">":
      return kP(t, r, n);
    case ">=":
      return CP(t, r, n);
    case "<":
      return jP(t, r, n);
    case "<=":
      return DP(t, r, n);
    default:
      throw new TypeError(`Invalid operator: ${e}`);
  }
};
var Eh = MP;
const LP = tt, FP = mn, { safeRe: Is, t: Os } = as, VP = (t, e) => {
  if (t instanceof LP)
    return t;
  if (typeof t == "number" && (t = String(t)), typeof t != "string")
    return null;
  e = e || {};
  let r = null;
  if (!e.rtl)
    r = t.match(e.includePrerelease ? Is[Os.COERCEFULL] : Is[Os.COERCE]);
  else {
    const c = e.includePrerelease ? Is[Os.COERCERTLFULL] : Is[Os.COERCERTL];
    let d;
    for (; (d = c.exec(t)) && (!r || r.index + r[0].length !== t.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = e.includePrerelease && r[5] ? `-${r[5]}` : "", i = e.includePrerelease && r[6] ? `+${r[6]}` : "";
  return FP(`${n}.${s}.${a}${o}${i}`, e);
};
var UP = VP;
class qP {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(e) {
    const r = this.map.get(e);
    if (r !== void 0)
      return this.map.delete(e), this.map.set(e, r), r;
  }
  delete(e) {
    return this.map.delete(e);
  }
  set(e, r) {
    if (!this.delete(e) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(e, r);
    }
    return this;
  }
}
var xP = qP, io, Bu;
function Rt() {
  if (Bu) return io;
  Bu = 1;
  const t = /\s+/g;
  class e {
    constructor(M, B) {
      if (B = s(B), M instanceof e)
        return M.loose === !!B.loose && M.includePrerelease === !!B.includePrerelease ? M : new e(M.raw, B);
      if (M instanceof a)
        return this.raw = M.value, this.set = [[M]], this.formatted = void 0, this;
      if (this.options = B, this.loose = !!B.loose, this.includePrerelease = !!B.includePrerelease, this.raw = M.trim().replace(t, " "), this.set = this.raw.split("||").map((z) => this.parseRange(z.trim())).filter((z) => z.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const z = this.set[0];
        if (this.set = this.set.filter((Y) => !y(Y[0])), this.set.length === 0)
          this.set = [z];
        else if (this.set.length > 1) {
          for (const Y of this.set)
            if (Y.length === 1 && $(Y[0])) {
              this.set = [Y];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let M = 0; M < this.set.length; M++) {
          M > 0 && (this.formatted += "||");
          const B = this.set[M];
          for (let z = 0; z < B.length; z++)
            z > 0 && (this.formatted += " "), this.formatted += B[z].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(M) {
      const z = ((this.options.includePrerelease && m) | (this.options.loose && g)) + ":" + M, Y = n.get(z);
      if (Y)
        return Y;
      const G = this.options.loose, I = G ? c[d.HYPHENRANGELOOSE] : c[d.HYPHENRANGE];
      M = M.replace(I, W(this.options.includePrerelease)), o("hyphen replace", M), M = M.replace(c[d.COMPARATORTRIM], l), o("comparator trim", M), M = M.replace(c[d.TILDETRIM], f), o("tilde trim", M), M = M.replace(c[d.CARETTRIM], _), o("caret trim", M);
      let v = M.split(" ").map((h) => w(h, this.options)).join(" ").split(/\s+/).map((h) => L(h, this.options));
      G && (v = v.filter((h) => (o("loose invalid filter", h, this.options), !!h.match(c[d.COMPARATORLOOSE])))), o("range list", v);
      const P = /* @__PURE__ */ new Map(), b = v.map((h) => new a(h, this.options));
      for (const h of b) {
        if (y(h))
          return [h];
        P.set(h.value, h);
      }
      P.size > 1 && P.has("") && P.delete("");
      const u = [...P.values()];
      return n.set(z, u), u;
    }
    intersects(M, B) {
      if (!(M instanceof e))
        throw new TypeError("a Range is required");
      return this.set.some((z) => p(z, B) && M.set.some((Y) => p(Y, B) && z.every((G) => Y.every((I) => G.intersects(I, B)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(M) {
      if (!M)
        return !1;
      if (typeof M == "string")
        try {
          M = new i(M, this.options);
        } catch {
          return !1;
        }
      for (let B = 0; B < this.set.length; B++)
        if (ee(this.set[B], M, this.options))
          return !0;
      return !1;
    }
  }
  io = e;
  const r = xP, n = new r(), s = Qc, a = Fa(), o = Ma, i = tt, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: l,
    tildeTrimReplace: f,
    caretTrimReplace: _
  } = as, { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: g } = Da, y = (k) => k.value === "<0.0.0-0", $ = (k) => k.value === "", p = (k, M) => {
    let B = !0;
    const z = k.slice();
    let Y = z.pop();
    for (; B && z.length; )
      B = z.every((G) => Y.intersects(G, M)), Y = z.pop();
    return B;
  }, w = (k, M) => (o("comp", k, M), k = F(k, M), o("caret", k), k = R(k, M), o("tildes", k), k = ie(k, M), o("xrange", k), k = ae(k, M), o("stars", k), k), S = (k) => !k || k.toLowerCase() === "x" || k === "*", R = (k, M) => k.trim().split(/\s+/).map((B) => A(B, M)).join(" "), A = (k, M) => {
    const B = M.loose ? c[d.TILDELOOSE] : c[d.TILDE];
    return k.replace(B, (z, Y, G, I, v) => {
      o("tilde", k, z, Y, G, I, v);
      let P;
      return S(Y) ? P = "" : S(G) ? P = `>=${Y}.0.0 <${+Y + 1}.0.0-0` : S(I) ? P = `>=${Y}.${G}.0 <${Y}.${+G + 1}.0-0` : v ? (o("replaceTilde pr", v), P = `>=${Y}.${G}.${I}-${v} <${Y}.${+G + 1}.0-0`) : P = `>=${Y}.${G}.${I} <${Y}.${+G + 1}.0-0`, o("tilde return", P), P;
    });
  }, F = (k, M) => k.trim().split(/\s+/).map((B) => V(B, M)).join(" "), V = (k, M) => {
    o("caret", k, M);
    const B = M.loose ? c[d.CARETLOOSE] : c[d.CARET], z = M.includePrerelease ? "-0" : "";
    return k.replace(B, (Y, G, I, v, P) => {
      o("caret", k, Y, G, I, v, P);
      let b;
      return S(G) ? b = "" : S(I) ? b = `>=${G}.0.0${z} <${+G + 1}.0.0-0` : S(v) ? G === "0" ? b = `>=${G}.${I}.0${z} <${G}.${+I + 1}.0-0` : b = `>=${G}.${I}.0${z} <${+G + 1}.0.0-0` : P ? (o("replaceCaret pr", P), G === "0" ? I === "0" ? b = `>=${G}.${I}.${v}-${P} <${G}.${I}.${+v + 1}-0` : b = `>=${G}.${I}.${v}-${P} <${G}.${+I + 1}.0-0` : b = `>=${G}.${I}.${v}-${P} <${+G + 1}.0.0-0`) : (o("no pr"), G === "0" ? I === "0" ? b = `>=${G}.${I}.${v}${z} <${G}.${I}.${+v + 1}-0` : b = `>=${G}.${I}.${v}${z} <${G}.${+I + 1}.0-0` : b = `>=${G}.${I}.${v} <${+G + 1}.0.0-0`), o("caret return", b), b;
    });
  }, ie = (k, M) => (o("replaceXRanges", k, M), k.split(/\s+/).map((B) => te(B, M)).join(" ")), te = (k, M) => {
    k = k.trim();
    const B = M.loose ? c[d.XRANGELOOSE] : c[d.XRANGE];
    return k.replace(B, (z, Y, G, I, v, P) => {
      o("xRange", k, z, Y, G, I, v, P);
      const b = S(G), u = b || S(I), h = u || S(v), E = h;
      return Y === "=" && E && (Y = ""), P = M.includePrerelease ? "-0" : "", b ? Y === ">" || Y === "<" ? z = "<0.0.0-0" : z = "*" : Y && E ? (u && (I = 0), v = 0, Y === ">" ? (Y = ">=", u ? (G = +G + 1, I = 0, v = 0) : (I = +I + 1, v = 0)) : Y === "<=" && (Y = "<", u ? G = +G + 1 : I = +I + 1), Y === "<" && (P = "-0"), z = `${Y + G}.${I}.${v}${P}`) : u ? z = `>=${G}.0.0${P} <${+G + 1}.0.0-0` : h && (z = `>=${G}.${I}.0${P} <${G}.${+I + 1}.0-0`), o("xRange return", z), z;
    });
  }, ae = (k, M) => (o("replaceStars", k, M), k.trim().replace(c[d.STAR], "")), L = (k, M) => (o("replaceGTE0", k, M), k.trim().replace(c[M.includePrerelease ? d.GTE0PRE : d.GTE0], "")), W = (k) => (M, B, z, Y, G, I, v, P, b, u, h, E) => (S(z) ? B = "" : S(Y) ? B = `>=${z}.0.0${k ? "-0" : ""}` : S(G) ? B = `>=${z}.${Y}.0${k ? "-0" : ""}` : I ? B = `>=${B}` : B = `>=${B}${k ? "-0" : ""}`, S(b) ? P = "" : S(u) ? P = `<${+b + 1}.0.0-0` : S(h) ? P = `<${b}.${+u + 1}.0-0` : E ? P = `<=${b}.${u}.${h}-${E}` : k ? P = `<${b}.${u}.${+h + 1}-0` : P = `<=${P}`, `${B} ${P}`.trim()), ee = (k, M, B) => {
    for (let z = 0; z < k.length; z++)
      if (!k[z].test(M))
        return !1;
    if (M.prerelease.length && !B.includePrerelease) {
      for (let z = 0; z < k.length; z++)
        if (o(k[z].semver), k[z].semver !== a.ANY && k[z].semver.prerelease.length > 0) {
          const Y = k[z].semver;
          if (Y.major === M.major && Y.minor === M.minor && Y.patch === M.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return io;
}
var co, Hu;
function Fa() {
  if (Hu) return co;
  Hu = 1;
  const t = Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return t;
    }
    constructor(l, f) {
      if (f = r(f), l instanceof e) {
        if (l.loose === !!f.loose)
          return l;
        l = l.value;
      }
      l = l.trim().split(/\s+/).join(" "), o("comparator", l, f), this.options = f, this.loose = !!f.loose, this.parse(l), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(l) {
      const f = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], _ = l.match(f);
      if (!_)
        throw new TypeError(`Invalid comparator: ${l}`);
      this.operator = _[1] !== void 0 ? _[1] : "", this.operator === "=" && (this.operator = ""), _[2] ? this.semver = new i(_[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(l) {
      if (o("Comparator.test", l, this.options.loose), this.semver === t || l === t)
        return !0;
      if (typeof l == "string")
        try {
          l = new i(l, this.options);
        } catch {
          return !1;
        }
      return a(l, this.operator, this.semver, this.options);
    }
    intersects(l, f) {
      if (!(l instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(l.value, f).test(this.value) : l.operator === "" ? l.value === "" ? !0 : new c(this.value, f).test(l.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || l.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || l.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && l.operator.startsWith(">") || this.operator.startsWith("<") && l.operator.startsWith("<") || this.semver.version === l.semver.version && this.operator.includes("=") && l.operator.includes("=") || a(this.semver, "<", l.semver, f) && this.operator.startsWith(">") && l.operator.startsWith("<") || a(this.semver, ">", l.semver, f) && this.operator.startsWith("<") && l.operator.startsWith(">")));
    }
  }
  co = e;
  const r = Qc, { safeRe: n, t: s } = as, a = Eh, o = Ma, i = tt, c = Rt();
  return co;
}
const zP = Rt(), KP = (t, e, r) => {
  try {
    e = new zP(e, r);
  } catch {
    return !1;
  }
  return e.test(t);
};
var Va = KP;
const GP = Rt(), BP = (t, e) => new GP(t, e).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var HP = BP;
const WP = tt, JP = Rt(), XP = (t, e, r) => {
  let n = null, s = null, a = null;
  try {
    a = new JP(e, r);
  } catch {
    return null;
  }
  return t.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new WP(n, r));
  }), n;
};
var YP = XP;
const QP = tt, ZP = Rt(), eR = (t, e, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ZP(e, r);
  } catch {
    return null;
  }
  return t.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new QP(n, r));
  }), n;
};
var tR = eR;
const lo = tt, rR = Rt(), Wu = La, nR = (t, e) => {
  t = new rR(t, e);
  let r = new lo("0.0.0");
  if (t.test(r) || (r = new lo("0.0.0-0"), t.test(r)))
    return r;
  r = null;
  for (let n = 0; n < t.set.length; ++n) {
    const s = t.set[n];
    let a = null;
    s.forEach((o) => {
      const i = new lo(o.semver.version);
      switch (o.operator) {
        case ">":
          i.prerelease.length === 0 ? i.patch++ : i.prerelease.push(0), i.raw = i.format();
        case "":
        case ">=":
          (!a || Wu(i, a)) && (a = i);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Wu(r, a)) && (r = a);
  }
  return r && t.test(r) ? r : null;
};
var sR = nR;
const aR = Rt(), oR = (t, e) => {
  try {
    return new aR(t, e).range || "*";
  } catch {
    return null;
  }
};
var iR = oR;
const cR = tt, Sh = Fa(), { ANY: lR } = Sh, uR = Rt(), dR = Va, Ju = La, Xu = el, fR = rl, hR = tl, mR = (t, e, r, n) => {
  t = new cR(t, n), e = new uR(e, n);
  let s, a, o, i, c;
  switch (r) {
    case ">":
      s = Ju, a = fR, o = Xu, i = ">", c = ">=";
      break;
    case "<":
      s = Xu, a = hR, o = Ju, i = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (dR(t, e, n))
    return !1;
  for (let d = 0; d < e.set.length; ++d) {
    const l = e.set[d];
    let f = null, _ = null;
    if (l.forEach((m) => {
      m.semver === lR && (m = new Sh(">=0.0.0")), f = f || m, _ = _ || m, s(m.semver, f.semver, n) ? f = m : o(m.semver, _.semver, n) && (_ = m);
    }), f.operator === i || f.operator === c || (!_.operator || _.operator === i) && a(t, _.semver))
      return !1;
    if (_.operator === c && o(t, _.semver))
      return !1;
  }
  return !0;
};
var nl = mR;
const pR = nl, yR = (t, e, r) => pR(t, e, ">", r);
var $R = yR;
const gR = nl, _R = (t, e, r) => gR(t, e, "<", r);
var vR = _R;
const Yu = Rt(), wR = (t, e, r) => (t = new Yu(t, r), e = new Yu(e, r), t.intersects(e, r));
var bR = wR;
const ER = Va, SR = Pt;
var PR = (t, e, r) => {
  const n = [];
  let s = null, a = null;
  const o = t.sort((l, f) => SR(l, f, r));
  for (const l of o)
    ER(l, e, r) ? (a = l, s || (s = l)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const i = [];
  for (const [l, f] of n)
    l === f ? i.push(l) : !f && l === o[0] ? i.push("*") : f ? l === o[0] ? i.push(`<=${f}`) : i.push(`${l} - ${f}`) : i.push(`>=${l}`);
  const c = i.join(" || "), d = typeof e.raw == "string" ? e.raw : String(e);
  return c.length < d.length ? c : e;
};
const Qu = Rt(), sl = Fa(), { ANY: uo } = sl, Pn = Va, al = Pt, RR = (t, e, r = {}) => {
  if (t === e)
    return !0;
  t = new Qu(t, r), e = new Qu(e, r);
  let n = !1;
  e: for (const s of t.set) {
    for (const a of e.set) {
      const o = OR(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, IR = [new sl(">=0.0.0-0")], Zu = [new sl(">=0.0.0")], OR = (t, e, r) => {
  if (t === e)
    return !0;
  if (t.length === 1 && t[0].semver === uo) {
    if (e.length === 1 && e[0].semver === uo)
      return !0;
    r.includePrerelease ? t = IR : t = Zu;
  }
  if (e.length === 1 && e[0].semver === uo) {
    if (r.includePrerelease)
      return !0;
    e = Zu;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const m of t)
    m.operator === ">" || m.operator === ">=" ? s = ed(s, m, r) : m.operator === "<" || m.operator === "<=" ? a = td(a, m, r) : n.add(m.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = al(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const m of n) {
    if (s && !Pn(m, String(s), r) || a && !Pn(m, String(a), r))
      return null;
    for (const g of e)
      if (!Pn(m, String(g), r))
        return !1;
    return !0;
  }
  let i, c, d, l, f = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, _ = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  f && f.prerelease.length === 1 && a.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const m of e) {
    if (l = l || m.operator === ">" || m.operator === ">=", d = d || m.operator === "<" || m.operator === "<=", s) {
      if (_ && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === _.major && m.semver.minor === _.minor && m.semver.patch === _.patch && (_ = !1), m.operator === ">" || m.operator === ">=") {
        if (i = ed(s, m, r), i === m && i !== s)
          return !1;
      } else if (s.operator === ">=" && !Pn(s.semver, String(m), r))
        return !1;
    }
    if (a) {
      if (f && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === f.major && m.semver.minor === f.minor && m.semver.patch === f.patch && (f = !1), m.operator === "<" || m.operator === "<=") {
        if (c = td(a, m, r), c === m && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Pn(a.semver, String(m), r))
        return !1;
    }
    if (!m.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && l && !s && o !== 0 || _ || f);
}, ed = (t, e, r) => {
  if (!t)
    return e;
  const n = al(t.semver, e.semver, r);
  return n > 0 ? t : n < 0 || e.operator === ">" && t.operator === ">=" ? e : t;
}, td = (t, e, r) => {
  if (!t)
    return e;
  const n = al(t.semver, e.semver, r);
  return n < 0 ? t : n > 0 || e.operator === "<" && t.operator === "<=" ? e : t;
};
var NR = RR;
const fo = as, rd = Da, AR = tt, nd = vh, TR = mn, kR = F1, CR = q1, jR = z1, DR = G1, MR = W1, LR = Y1, FR = eP, VR = nP, UR = Pt, qR = iP, xR = uP, zR = Zc, KR = mP, GR = $P, BR = La, HR = el, WR = wh, JR = bh, XR = tl, YR = rl, QR = Eh, ZR = UP, eI = Fa(), tI = Rt(), rI = Va, nI = HP, sI = YP, aI = tR, oI = sR, iI = iR, cI = nl, lI = $R, uI = vR, dI = bR, fI = PR, hI = NR;
var mI = {
  parse: TR,
  valid: kR,
  clean: CR,
  inc: jR,
  diff: DR,
  major: MR,
  minor: LR,
  patch: FR,
  prerelease: VR,
  compare: UR,
  rcompare: qR,
  compareLoose: xR,
  compareBuild: zR,
  sort: KR,
  rsort: GR,
  gt: BR,
  lt: HR,
  eq: WR,
  neq: JR,
  gte: XR,
  lte: YR,
  cmp: QR,
  coerce: ZR,
  Comparator: eI,
  Range: tI,
  satisfies: rI,
  toComparators: nI,
  maxSatisfying: sI,
  minSatisfying: aI,
  minVersion: oI,
  validRange: iI,
  outside: cI,
  gtr: lI,
  ltr: uI,
  intersects: dI,
  simplifyRange: fI,
  subset: hI,
  SemVer: AR,
  re: fo.re,
  src: fo.src,
  tokens: fo.t,
  SEMVER_SPEC_VERSION: rd.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: rd.RELEASE_TYPES,
  compareIdentifiers: nd.compareIdentifiers,
  rcompareIdentifiers: nd.rcompareIdentifiers
};
const Fr = /* @__PURE__ */ ni(mI), pI = Object.prototype.toString, yI = "[object Uint8Array]", $I = "[object ArrayBuffer]";
function Ph(t, e, r) {
  return t ? t.constructor === e ? !0 : pI.call(t) === r : !1;
}
function Rh(t) {
  return Ph(t, Uint8Array, yI);
}
function gI(t) {
  return Ph(t, ArrayBuffer, $I);
}
function _I(t) {
  return Rh(t) || gI(t);
}
function vI(t) {
  if (!Rh(t))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof t}\``);
}
function wI(t) {
  if (!_I(t))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof t}\``);
}
function sd(t, e) {
  if (t.length === 0)
    return new Uint8Array(0);
  e ?? (e = t.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(e);
  let n = 0;
  for (const s of t)
    vI(s), r.set(s, n), n += s.length;
  return r;
}
const Ns = {
  utf8: new globalThis.TextDecoder("utf8")
};
function ad(t, e = "utf8") {
  return wI(t), Ns[e] ?? (Ns[e] = new globalThis.TextDecoder(e)), Ns[e].decode(t);
}
function bI(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof t}\``);
}
const EI = new globalThis.TextEncoder();
function ho(t) {
  return bI(t), EI.encode(t);
}
Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
const SI = m1.default, od = "aes-256-cbc", Vr = () => /* @__PURE__ */ Object.create(null), PI = (t) => t != null, RI = (t, e) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof e;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${t}\` is not allowed as it's not supported by JSON`);
}, Bs = "__internal__", mo = `${Bs}.migrations.version`;
var cr, Kt, ut, Gt;
class II {
  constructor(e = {}) {
    pr(this, "path");
    pr(this, "events");
    gn(this, cr);
    gn(this, Kt);
    gn(this, ut);
    gn(this, Gt, {});
    pr(this, "_deserialize", (e) => JSON.parse(e));
    pr(this, "_serialize", (e) => JSON.stringify(e, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...e
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Mp(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (_n(this, ut, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new qw.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      SI(o);
      const i = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      _n(this, cr, o.compile(i));
      for (const [c, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (be(this, Gt)[c] = d.default);
    }
    r.defaults && _n(this, Gt, {
      ...be(this, Gt),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), _n(this, Kt, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = he.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(Vr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      cp.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(e, r) {
    if (be(this, ut).accessPropertiesByDotNotation)
      return this._get(e, r);
    const { store: n } = this;
    return e in n ? n[e] : r;
  }
  set(e, r) {
    if (typeof e != "string" && typeof e != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof e}`);
    if (typeof e != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(e))
      throw new TypeError(`Please don't use the ${Bs} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      RI(a, o), be(this, ut).accessPropertiesByDotNotation ? kl(n, a, o) : n[a] = o;
    };
    if (typeof e == "object") {
      const a = e;
      for (const [o, i] of Object.entries(a))
        s(o, i);
    } else
      s(e, r);
    this.store = n;
  }
  has(e) {
    return be(this, ut).accessPropertiesByDotNotation ? kp(this.store, e) : e in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...e) {
    for (const r of e)
      PI(be(this, Gt)[r]) && this.set(r, be(this, Gt)[r]);
  }
  delete(e) {
    const { store: r } = this;
    be(this, ut).accessPropertiesByDotNotation ? Tp(r, e) : delete r[e], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = Vr();
    for (const e of Object.keys(be(this, Gt)))
      this.reset(e);
  }
  onDidChange(e, r) {
    if (typeof e != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof e}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(e), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(e) {
    if (typeof e != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof e}`);
    return this._handleChange(() => this.store, e);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const e = le.readFileSync(this.path, be(this, Kt) ? null : "utf8"), r = this._encryptData(e), n = this._deserialize(r);
      return this._validate(n), Object.assign(Vr(), n);
    } catch (e) {
      if ((e == null ? void 0 : e.code) === "ENOENT")
        return this._ensureDirectory(), Vr();
      if (be(this, ut).clearInvalidConfig && e.name === "SyntaxError")
        return Vr();
      throw e;
    }
  }
  set store(e) {
    this._ensureDirectory(), this._validate(e), this._write(e), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [e, r] of Object.entries(this.store))
      yield [e, r];
  }
  _encryptData(e) {
    if (!be(this, Kt))
      return typeof e == "string" ? e : ad(e);
    try {
      const r = e.slice(0, 16), n = vn.pbkdf2Sync(be(this, Kt), r.toString(), 1e4, 32, "sha512"), s = vn.createDecipheriv(od, n, r), a = e.slice(17), o = typeof a == "string" ? ho(a) : a;
      return ad(sd([s.update(o), s.final()]));
    } catch {
    }
    return e.toString();
  }
  _handleChange(e, r) {
    let n = e();
    const s = () => {
      const a = n, o = e();
      ip(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(e) {
    if (!be(this, cr) || be(this, cr).call(this, e) || !be(this, cr).errors)
      return;
    const n = be(this, cr).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    le.mkdirSync(he.dirname(this.path), { recursive: !0 });
  }
  _write(e) {
    let r = this._serialize(e);
    if (be(this, Kt)) {
      const n = vn.randomBytes(16), s = vn.pbkdf2Sync(be(this, Kt), n.toString(), 1e4, 32, "sha512"), a = vn.createCipheriv(od, s, n);
      r = sd([n, ho(":"), a.update(ho(r)), a.final()]);
    }
    if (Ce.env.SNAP)
      le.writeFileSync(this.path, r, { mode: be(this, ut).configFileMode });
    else
      try {
        Gd(this.path, r, { mode: be(this, ut).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          le.writeFileSync(this.path, r, { mode: be(this, ut).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), le.existsSync(this.path) || this._write(Vr()), Ce.platform === "win32" ? le.watch(this.path, { persistent: !1 }, Fu(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : le.watchFile(this.path, { persistent: !1 }, Fu(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(e, r, n) {
    let s = this._get(mo, "0.0.0");
    const a = Object.keys(e).filter((i) => this._shouldPerformMigration(i, s, r));
    let o = { ...this.store };
    for (const i of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: i,
          finalVersion: r,
          versions: a
        });
        const c = e[i];
        c == null || c(this), this._set(mo, i), s = i, o = { ...this.store };
      } catch (c) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${c}`);
      }
    (this._isVersionInRangeFormat(s) || !Fr.eq(s, r)) && this._set(mo, r);
  }
  _containsReservedKey(e) {
    return typeof e == "object" && Object.keys(e)[0] === Bs ? !0 : typeof e != "string" ? !1 : be(this, ut).accessPropertiesByDotNotation ? !!e.startsWith(`${Bs}.`) : !1;
  }
  _isVersionInRangeFormat(e) {
    return Fr.clean(e) === null;
  }
  _shouldPerformMigration(e, r, n) {
    return this._isVersionInRangeFormat(e) ? r !== "0.0.0" && Fr.satisfies(r, e) ? !1 : Fr.satisfies(n, e) : !(Fr.lte(e, r) || Fr.gt(e, n));
  }
  _get(e, r) {
    return Ap(this.store, e, r);
  }
  _set(e, r) {
    const { store: n } = this;
    kl(n, e, r), this.store = n;
  }
}
cr = new WeakMap(), Kt = new WeakMap(), ut = new WeakMap(), Gt = new WeakMap();
const { app: Hs, ipcMain: xo, shell: OI } = Md;
let id = !1;
const cd = () => {
  if (!xo || !Hs)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const t = {
    defaultCwd: Hs.getPath("userData"),
    appVersion: Hs.getVersion()
  };
  return id || (xo.on("electron-store-get-data", (e) => {
    e.returnValue = t;
  }), id = !0), t;
};
class NI extends II {
  constructor(e) {
    let r, n;
    if (Ce.type === "renderer") {
      const s = Md.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else xo && Hs && ({ defaultCwd: r, appVersion: n } = cd());
    e = {
      name: "config",
      ...e
    }, e.projectVersion || (e.projectVersion = n), e.cwd ? e.cwd = he.isAbsolute(e.cwd) ? e.cwd : he.join(r, e.cwd) : e.cwd = r, e.configName = e.name, delete e.name, super(e);
  }
  static initRenderer() {
    cd();
  }
  async openInEditor() {
    const e = await OI.openPath(this.path);
    if (e)
      throw new Error(e);
  }
}
class AI {
  validateRequest(e) {
    if (!e.filePath)
      throw new Error("File path is required");
    if (!e.provider)
      throw new Error("Provider is required");
    if (!e.model)
      throw new Error("Model is required");
  }
}
function re(t, e, r, n, s) {
  if (typeof e == "function" ? t !== e || !0 : !e.has(t))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return e.set(t, r), r;
}
function T(t, e, r, n) {
  if (r === "a" && !n)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? t !== e || !n : !e.has(t))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return r === "m" ? n : r === "a" ? n.call(t) : n ? n.value : e.get(t);
}
let Ih = function() {
  const { crypto: t } = globalThis;
  if (t != null && t.randomUUID)
    return Ih = t.randomUUID.bind(t), t.randomUUID();
  const e = new Uint8Array(1), r = t ? () => t.getRandomValues(e)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (n) => (+n ^ r() & 15 >> +n / 4).toString(16));
};
function zo(t) {
  return typeof t == "object" && t !== null && // Spec-compliant fetch implementations
  ("name" in t && t.name === "AbortError" || // Expo fetch
  "message" in t && String(t.message).includes("FetchRequestCanceledException"));
}
const Ko = (t) => {
  if (t instanceof Error)
    return t;
  if (typeof t == "object" && t !== null) {
    try {
      if (Object.prototype.toString.call(t) === "[object Error]") {
        const e = new Error(t.message, t.cause ? { cause: t.cause } : {});
        return t.stack && (e.stack = t.stack), t.cause && !e.cause && (e.cause = t.cause), t.name && (e.name = t.name), e;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(t));
    } catch {
    }
  }
  return new Error(t);
};
class ne extends Error {
}
class Ke extends ne {
  constructor(e, r, n, s) {
    super(`${Ke.makeMessage(e, r, n)}`), this.status = e, this.headers = s, this.requestID = s == null ? void 0 : s.get("x-request-id"), this.error = r;
    const a = r;
    this.code = a == null ? void 0 : a.code, this.param = a == null ? void 0 : a.param, this.type = a == null ? void 0 : a.type;
  }
  static makeMessage(e, r, n) {
    const s = r != null && r.message ? typeof r.message == "string" ? r.message : JSON.stringify(r.message) : r ? JSON.stringify(r) : n;
    return e && s ? `${e} ${s}` : e ? `${e} status code (no body)` : s || "(no status code or body)";
  }
  static generate(e, r, n, s) {
    if (!e || !s)
      return new Ua({ message: n, cause: Ko(r) });
    const a = r == null ? void 0 : r.error;
    return e === 400 ? new Oh(e, a, n, s) : e === 401 ? new Nh(e, a, n, s) : e === 403 ? new Ah(e, a, n, s) : e === 404 ? new Th(e, a, n, s) : e === 409 ? new kh(e, a, n, s) : e === 422 ? new Ch(e, a, n, s) : e === 429 ? new jh(e, a, n, s) : e >= 500 ? new Dh(e, a, n, s) : new Ke(e, a, n, s);
  }
}
class mt extends Ke {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}
class Ua extends Ke {
  constructor({ message: e, cause: r }) {
    super(void 0, void 0, e || "Connection error.", void 0), r && (this.cause = r);
  }
}
class ol extends Ua {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}
class Oh extends Ke {
}
class Nh extends Ke {
}
class Ah extends Ke {
}
class Th extends Ke {
}
class kh extends Ke {
}
class Ch extends Ke {
}
class jh extends Ke {
}
class Dh extends Ke {
}
class Mh extends ne {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}
class Lh extends ne {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}
class An extends Error {
  constructor(e) {
    super(e);
  }
}
const TI = /^[a-z][a-z0-9+.-]*:/i, kI = (t) => TI.test(t);
let st = (t) => (st = Array.isArray, st(t)), ld = st;
function CI(t) {
  return typeof t != "object" ? {} : t ?? {};
}
function jI(t) {
  if (!t)
    return !0;
  for (const e in t)
    return !1;
  return !0;
}
function DI(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e);
}
function po(t) {
  return t != null && typeof t == "object" && !Array.isArray(t);
}
const MI = (t, e) => {
  if (typeof e != "number" || !Number.isInteger(e))
    throw new ne(`${t} must be an integer`);
  if (e < 0)
    throw new ne(`${t} must be a positive integer`);
  return e;
}, LI = (t) => {
  try {
    return JSON.parse(t);
  } catch {
    return;
  }
}, os = (t) => new Promise((e) => setTimeout(e, t)), Gr = "5.11.0", FI = () => (
  // @ts-ignore
  typeof window < "u" && // @ts-ignore
  typeof window.document < "u" && // @ts-ignore
  typeof navigator < "u"
);
function VI() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
const UI = () => {
  var r;
  const t = VI();
  if (t === "deno")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": Gr,
      "X-Stainless-OS": dd(Deno.build.os),
      "X-Stainless-Arch": ud(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : ((r = Deno.version) == null ? void 0 : r.deno) ?? "unknown"
    };
  if (typeof EdgeRuntime < "u")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": Gr,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  if (t === "node")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": Gr,
      "X-Stainless-OS": dd(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": ud(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  const e = qI();
  return e ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gr,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${e.browser}`,
    "X-Stainless-Runtime-Version": e.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gr,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function qI() {
  if (typeof navigator > "u" || !navigator)
    return null;
  const t = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key: e, pattern: r } of t) {
    const n = r.exec(navigator.userAgent);
    if (n) {
      const s = n[1] || 0, a = n[2] || 0, o = n[3] || 0;
      return { browser: e, version: `${s}.${a}.${o}` };
    }
  }
  return null;
}
const ud = (t) => t === "x32" ? "x32" : t === "x86_64" || t === "x64" ? "x64" : t === "arm" ? "arm" : t === "aarch64" || t === "arm64" ? "arm64" : t ? `other:${t}` : "unknown", dd = (t) => (t = t.toLowerCase(), t.includes("ios") ? "iOS" : t === "android" ? "Android" : t === "darwin" ? "MacOS" : t === "win32" ? "Windows" : t === "freebsd" ? "FreeBSD" : t === "openbsd" ? "OpenBSD" : t === "linux" ? "Linux" : t ? `Other:${t}` : "Unknown");
let fd;
const xI = () => fd ?? (fd = UI());
function zI() {
  if (typeof fetch < "u")
    return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Fh(...t) {
  const e = globalThis.ReadableStream;
  if (typeof e > "u")
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new e(...t);
}
function Vh(t) {
  let e = Symbol.asyncIterator in t ? t[Symbol.asyncIterator]() : t[Symbol.iterator]();
  return Fh({
    start() {
    },
    async pull(r) {
      const { done: n, value: s } = await e.next();
      n ? r.close() : r.enqueue(s);
    },
    async cancel() {
      var r;
      await ((r = e.return) == null ? void 0 : r.call(e));
    }
  });
}
function Uh(t) {
  if (t[Symbol.asyncIterator])
    return t;
  const e = t.getReader();
  return {
    async next() {
      try {
        const r = await e.read();
        return r != null && r.done && e.releaseLock(), r;
      } catch (r) {
        throw e.releaseLock(), r;
      }
    },
    async return() {
      const r = e.cancel();
      return e.releaseLock(), await r, { done: !0, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function KI(t) {
  var n, s;
  if (t === null || typeof t != "object")
    return;
  if (t[Symbol.asyncIterator]) {
    await ((s = (n = t[Symbol.asyncIterator]()).return) == null ? void 0 : s.call(n));
    return;
  }
  const e = t.getReader(), r = e.cancel();
  e.releaseLock(), await r;
}
const GI = ({ headers: t, body: e }) => ({
  bodyHeaders: {
    "content-type": "application/json"
  },
  body: JSON.stringify(e)
}), qh = "RFC3986", xh = (t) => String(t), hd = {
  RFC1738: (t) => String(t).replace(/%20/g, "+"),
  RFC3986: xh
}, BI = "RFC1738";
let Go = (t, e) => (Go = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Go(t, e));
const Ot = /* @__PURE__ */ (() => {
  const t = [];
  for (let e = 0; e < 256; ++e)
    t.push("%" + ((e < 16 ? "0" : "") + e.toString(16)).toUpperCase());
  return t;
})(), yo = 1024, HI = (t, e, r, n, s) => {
  if (t.length === 0)
    return t;
  let a = t;
  if (typeof t == "symbol" ? a = Symbol.prototype.toString.call(t) : typeof t != "string" && (a = String(t)), r === "iso-8859-1")
    return escape(a).replace(/%u[0-9a-f]{4}/gi, function(i) {
      return "%26%23" + parseInt(i.slice(2), 16) + "%3B";
    });
  let o = "";
  for (let i = 0; i < a.length; i += yo) {
    const c = a.length >= yo ? a.slice(i, i + yo) : a, d = [];
    for (let l = 0; l < c.length; ++l) {
      let f = c.charCodeAt(l);
      if (f === 45 || // -
      f === 46 || // .
      f === 95 || // _
      f === 126 || // ~
      f >= 48 && f <= 57 || // 0-9
      f >= 65 && f <= 90 || // a-z
      f >= 97 && f <= 122 || // A-Z
      s === BI && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(l);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ot[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ot[192 | f >> 6] + Ot[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ot[224 | f >> 12] + Ot[128 | f >> 6 & 63] + Ot[128 | f & 63];
        continue;
      }
      l += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(l) & 1023), d[d.length] = Ot[240 | f >> 18] + Ot[128 | f >> 12 & 63] + Ot[128 | f >> 6 & 63] + Ot[128 | f & 63];
    }
    o += d.join("");
  }
  return o;
};
function WI(t) {
  return !t || typeof t != "object" ? !1 : !!(t.constructor && t.constructor.isBuffer && t.constructor.isBuffer(t));
}
function md(t, e) {
  if (st(t)) {
    const r = [];
    for (let n = 0; n < t.length; n += 1)
      r.push(e(t[n]));
    return r;
  }
  return e(t);
}
const zh = {
  brackets(t) {
    return String(t) + "[]";
  },
  comma: "comma",
  indices(t, e) {
    return String(t) + "[" + e + "]";
  },
  repeat(t) {
    return String(t);
  }
}, Kh = function(t, e) {
  Array.prototype.push.apply(t, st(e) ? e : [e]);
};
let pd;
const Ae = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: HI,
  encodeValuesOnly: !1,
  format: qh,
  formatter: xh,
  /** @deprecated */
  indices: !1,
  serializeDate(t) {
    return (pd ?? (pd = Function.prototype.call.bind(Date.prototype.toISOString)))(t);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function JI(t) {
  return typeof t == "string" || typeof t == "number" || typeof t == "boolean" || typeof t == "symbol" || typeof t == "bigint";
}
const $o = {};
function Gh(t, e, r, n, s, a, o, i, c, d, l, f, _, m, g, y, $, p) {
  let w = t, S = p, R = 0, A = !1;
  for (; (S = S.get($o)) !== void 0 && !A; ) {
    const ae = S.get(t);
    if (R += 1, typeof ae < "u") {
      if (ae === R)
        throw new RangeError("Cyclic object value");
      A = !0;
    }
    typeof S.get($o) > "u" && (R = 0);
  }
  if (typeof d == "function" ? w = d(e, w) : w instanceof Date ? w = _ == null ? void 0 : _(w) : r === "comma" && st(w) && (w = md(w, function(ae) {
    return ae instanceof Date ? _ == null ? void 0 : _(ae) : ae;
  })), w === null) {
    if (a)
      return c && !y ? (
        // @ts-expect-error
        c(e, Ae.encoder, $, "key", m)
      ) : e;
    w = "";
  }
  if (JI(w) || WI(w)) {
    if (c) {
      const ae = y ? e : c(e, Ae.encoder, $, "key", m);
      return [
        (g == null ? void 0 : g(ae)) + "=" + // @ts-expect-error
        (g == null ? void 0 : g(c(w, Ae.encoder, $, "value", m)))
      ];
    }
    return [(g == null ? void 0 : g(e)) + "=" + (g == null ? void 0 : g(String(w)))];
  }
  const F = [];
  if (typeof w > "u")
    return F;
  let V;
  if (r === "comma" && st(w))
    y && c && (w = md(w, c)), V = [{ value: w.length > 0 ? w.join(",") || null : void 0 }];
  else if (st(d))
    V = d;
  else {
    const ae = Object.keys(w);
    V = l ? ae.sort(l) : ae;
  }
  const ie = i ? String(e).replace(/\./g, "%2E") : String(e), te = n && st(w) && w.length === 1 ? ie + "[]" : ie;
  if (s && st(w) && w.length === 0)
    return te + "[]";
  for (let ae = 0; ae < V.length; ++ae) {
    const L = V[ae], W = (
      // @ts-ignore
      typeof L == "object" && typeof L.value < "u" ? L.value : w[L]
    );
    if (o && W === null)
      continue;
    const ee = f && i ? L.replace(/\./g, "%2E") : L, k = st(w) ? typeof r == "function" ? r(te, ee) : te : te + (f ? "." + ee : "[" + ee + "]");
    p.set(t, R);
    const M = /* @__PURE__ */ new WeakMap();
    M.set($o, p), Kh(F, Gh(
      W,
      k,
      r,
      n,
      s,
      a,
      o,
      i,
      // @ts-ignore
      r === "comma" && y && st(w) ? null : c,
      d,
      l,
      f,
      _,
      m,
      g,
      y,
      $,
      M
    ));
  }
  return F;
}
function XI(t = Ae) {
  if (typeof t.allowEmptyArrays < "u" && typeof t.allowEmptyArrays != "boolean")
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof t.encodeDotInKeys < "u" && typeof t.encodeDotInKeys != "boolean")
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (t.encoder !== null && typeof t.encoder < "u" && typeof t.encoder != "function")
    throw new TypeError("Encoder has to be a function.");
  const e = t.charset || Ae.charset;
  if (typeof t.charset < "u" && t.charset !== "utf-8" && t.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let r = qh;
  if (typeof t.format < "u") {
    if (!Go(hd, t.format))
      throw new TypeError("Unknown format option provided.");
    r = t.format;
  }
  const n = hd[r];
  let s = Ae.filter;
  (typeof t.filter == "function" || st(t.filter)) && (s = t.filter);
  let a;
  if (t.arrayFormat && t.arrayFormat in zh ? a = t.arrayFormat : "indices" in t ? a = t.indices ? "indices" : "repeat" : a = Ae.arrayFormat, "commaRoundTrip" in t && typeof t.commaRoundTrip != "boolean")
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const o = typeof t.allowDots > "u" ? t.encodeDotInKeys ? !0 : Ae.allowDots : !!t.allowDots;
  return {
    addQueryPrefix: typeof t.addQueryPrefix == "boolean" ? t.addQueryPrefix : Ae.addQueryPrefix,
    // @ts-ignore
    allowDots: o,
    allowEmptyArrays: typeof t.allowEmptyArrays == "boolean" ? !!t.allowEmptyArrays : Ae.allowEmptyArrays,
    arrayFormat: a,
    charset: e,
    charsetSentinel: typeof t.charsetSentinel == "boolean" ? t.charsetSentinel : Ae.charsetSentinel,
    commaRoundTrip: !!t.commaRoundTrip,
    delimiter: typeof t.delimiter > "u" ? Ae.delimiter : t.delimiter,
    encode: typeof t.encode == "boolean" ? t.encode : Ae.encode,
    encodeDotInKeys: typeof t.encodeDotInKeys == "boolean" ? t.encodeDotInKeys : Ae.encodeDotInKeys,
    encoder: typeof t.encoder == "function" ? t.encoder : Ae.encoder,
    encodeValuesOnly: typeof t.encodeValuesOnly == "boolean" ? t.encodeValuesOnly : Ae.encodeValuesOnly,
    filter: s,
    format: r,
    formatter: n,
    serializeDate: typeof t.serializeDate == "function" ? t.serializeDate : Ae.serializeDate,
    skipNulls: typeof t.skipNulls == "boolean" ? t.skipNulls : Ae.skipNulls,
    // @ts-ignore
    sort: typeof t.sort == "function" ? t.sort : null,
    strictNullHandling: typeof t.strictNullHandling == "boolean" ? t.strictNullHandling : Ae.strictNullHandling
  };
}
function YI(t, e = {}) {
  let r = t;
  const n = XI(e);
  let s, a;
  typeof n.filter == "function" ? (a = n.filter, r = a("", r)) : st(n.filter) && (a = n.filter, s = a);
  const o = [];
  if (typeof r != "object" || r === null)
    return "";
  const i = zh[n.arrayFormat], c = i === "comma" && n.commaRoundTrip;
  s || (s = Object.keys(r)), n.sort && s.sort(n.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let _ = 0; _ < s.length; ++_) {
    const m = s[_];
    n.skipNulls && r[m] === null || Kh(o, Gh(
      r[m],
      m,
      // @ts-expect-error
      i,
      c,
      n.allowEmptyArrays,
      n.strictNullHandling,
      n.skipNulls,
      n.encodeDotInKeys,
      n.encode ? n.encoder : null,
      n.filter,
      n.sort,
      n.allowDots,
      n.serializeDate,
      n.format,
      n.formatter,
      n.encodeValuesOnly,
      n.charset,
      d
    ));
  }
  const l = o.join(n.delimiter);
  let f = n.addQueryPrefix === !0 ? "?" : "";
  return n.charsetSentinel && (n.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), l.length > 0 ? f + l : "";
}
function QI(t) {
  let e = 0;
  for (const s of t)
    e += s.length;
  const r = new Uint8Array(e);
  let n = 0;
  for (const s of t)
    r.set(s, n), n += s.length;
  return r;
}
let yd;
function il(t) {
  let e;
  return (yd ?? (e = new globalThis.TextEncoder(), yd = e.encode.bind(e)))(t);
}
let $d;
function gd(t) {
  let e;
  return ($d ?? (e = new globalThis.TextDecoder(), $d = e.decode.bind(e)))(t);
}
var it, ct;
class qa {
  constructor() {
    it.set(this, void 0), ct.set(this, void 0), re(this, it, new Uint8Array()), re(this, ct, null);
  }
  decode(e) {
    if (e == null)
      return [];
    const r = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? il(e) : e;
    re(this, it, QI([T(this, it, "f"), r]));
    const n = [];
    let s;
    for (; (s = ZI(T(this, it, "f"), T(this, ct, "f"))) != null; ) {
      if (s.carriage && T(this, ct, "f") == null) {
        re(this, ct, s.index);
        continue;
      }
      if (T(this, ct, "f") != null && (s.index !== T(this, ct, "f") + 1 || s.carriage)) {
        n.push(gd(T(this, it, "f").subarray(0, T(this, ct, "f") - 1))), re(this, it, T(this, it, "f").subarray(T(this, ct, "f"))), re(this, ct, null);
        continue;
      }
      const a = T(this, ct, "f") !== null ? s.preceding - 1 : s.preceding, o = gd(T(this, it, "f").subarray(0, a));
      n.push(o), re(this, it, T(this, it, "f").subarray(s.index)), re(this, ct, null);
    }
    return n;
  }
  flush() {
    return T(this, it, "f").length ? this.decode(`
`) : [];
  }
}
it = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap();
qa.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
qa.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ZI(t, e) {
  for (let s = e ?? 0; s < t.length; s++) {
    if (t[s] === 10)
      return { preceding: s, index: s + 1, carriage: !1 };
    if (t[s] === 13)
      return { preceding: s, index: s + 1, carriage: !0 };
  }
  return null;
}
function eO(t) {
  for (let n = 0; n < t.length - 1; n++) {
    if (t[n] === 10 && t[n + 1] === 10 || t[n] === 13 && t[n + 1] === 13)
      return n + 2;
    if (t[n] === 13 && t[n + 1] === 10 && n + 3 < t.length && t[n + 2] === 13 && t[n + 3] === 10)
      return n + 4;
  }
  return -1;
}
const ma = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, _d = (t, e, r) => {
  if (t) {
    if (DI(ma, t))
      return t;
    Ue(r).warn(`${e} was set to ${JSON.stringify(t)}, expected one of ${JSON.stringify(Object.keys(ma))}`);
  }
};
function Tn() {
}
function As(t, e, r) {
  return !e || ma[t] > ma[r] ? Tn : e[t].bind(e);
}
const tO = {
  error: Tn,
  warn: Tn,
  info: Tn,
  debug: Tn
};
let vd = /* @__PURE__ */ new WeakMap();
function Ue(t) {
  const e = t.logger, r = t.logLevel ?? "off";
  if (!e)
    return tO;
  const n = vd.get(e);
  if (n && n[0] === r)
    return n[1];
  const s = {
    error: As("error", e, r),
    warn: As("warn", e, r),
    info: As("info", e, r),
    debug: As("debug", e, r)
  };
  return vd.set(e, [r, s]), s;
}
const _r = (t) => (t.options && (t.options = { ...t.options }, delete t.options.headers), t.headers && (t.headers = Object.fromEntries((t.headers instanceof Headers ? [...t.headers] : Object.entries(t.headers)).map(([e, r]) => [
  e,
  e.toLowerCase() === "authorization" || e.toLowerCase() === "cookie" || e.toLowerCase() === "set-cookie" ? "***" : r
]))), "retryOfRequestLogID" in t && (t.retryOfRequestLogID && (t.retryOf = t.retryOfRequestLogID), delete t.retryOfRequestLogID), t);
var Rn;
class jt {
  constructor(e, r, n) {
    this.iterator = e, Rn.set(this, void 0), this.controller = r, re(this, Rn, n);
  }
  static fromSSEResponse(e, r, n) {
    let s = !1;
    const a = n ? Ue(n) : console;
    async function* o() {
      if (s)
        throw new ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let i = !1;
      try {
        for await (const c of rO(e, r))
          if (!i) {
            if (c.data.startsWith("[DONE]")) {
              i = !0;
              continue;
            }
            if (c.event === null || !c.event.startsWith("thread.")) {
              let d;
              try {
                d = JSON.parse(c.data);
              } catch (l) {
                throw a.error("Could not parse message into JSON:", c.data), a.error("From chunk:", c.raw), l;
              }
              if (d && d.error)
                throw new Ke(void 0, d.error, void 0, e.headers);
              yield d;
            } else {
              let d;
              try {
                d = JSON.parse(c.data);
              } catch (l) {
                throw console.error("Could not parse message into JSON:", c.data), console.error("From chunk:", c.raw), l;
              }
              if (c.event == "error")
                throw new Ke(void 0, d.error, d.message, void 0);
              yield { event: c.event, data: d };
            }
          }
        i = !0;
      } catch (c) {
        if (zo(c))
          return;
        throw c;
      } finally {
        i || r.abort();
      }
    }
    return new jt(o, r, n);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(e, r, n) {
    let s = !1;
    async function* a() {
      const i = new qa(), c = Uh(e);
      for await (const d of c)
        for (const l of i.decode(d))
          yield l;
      for (const d of i.flush())
        yield d;
    }
    async function* o() {
      if (s)
        throw new ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let i = !1;
      try {
        for await (const c of a())
          i || c && (yield JSON.parse(c));
        i = !0;
      } catch (c) {
        if (zo(c))
          return;
        throw c;
      } finally {
        i || r.abort();
      }
    }
    return new jt(o, r, n);
  }
  [(Rn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const e = [], r = [], n = this.iterator(), s = (a) => ({
      next: () => {
        if (a.length === 0) {
          const o = n.next();
          e.push(o), r.push(o);
        }
        return a.shift();
      }
    });
    return [
      new jt(() => s(e), this.controller, T(this, Rn, "f")),
      new jt(() => s(r), this.controller, T(this, Rn, "f"))
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const e = this;
    let r;
    return Fh({
      async start() {
        r = e[Symbol.asyncIterator]();
      },
      async pull(n) {
        try {
          const { value: s, done: a } = await r.next();
          if (a)
            return n.close();
          const o = il(JSON.stringify(s) + `
`);
          n.enqueue(o);
        } catch (s) {
          n.error(s);
        }
      },
      async cancel() {
        var n;
        await ((n = r.return) == null ? void 0 : n.call(r));
      }
    });
  }
}
async function* rO(t, e) {
  if (!t.body)
    throw e.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ne("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ne("Attempted to iterate over a response with no body");
  const r = new sO(), n = new qa(), s = Uh(t.body);
  for await (const a of nO(s))
    for (const o of n.decode(a)) {
      const i = r.decode(o);
      i && (yield i);
    }
  for (const a of n.flush()) {
    const o = r.decode(a);
    o && (yield o);
  }
}
async function* nO(t) {
  let e = new Uint8Array();
  for await (const r of t) {
    if (r == null)
      continue;
    const n = r instanceof ArrayBuffer ? new Uint8Array(r) : typeof r == "string" ? il(r) : r;
    let s = new Uint8Array(e.length + n.length);
    s.set(e), s.set(n, e.length), e = s;
    let a;
    for (; (a = eO(e)) !== -1; )
      yield e.slice(0, a), e = e.slice(a);
  }
  e.length > 0 && (yield e);
}
class sO {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length)
        return null;
      const a = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], a;
    }
    if (this.chunks.push(e), e.startsWith(":"))
      return null;
    let [r, n, s] = aO(e, ":");
    return s.startsWith(" ") && (s = s.substring(1)), r === "event" ? this.event = s : r === "data" && this.data.push(s), null;
  }
}
function aO(t, e) {
  const r = t.indexOf(e);
  return r !== -1 ? [t.substring(0, r), e, t.substring(r + e.length)] : [t, "", ""];
}
async function Bh(t, e) {
  const { response: r, requestLogID: n, retryOfRequestLogID: s, startTime: a } = e, o = await (async () => {
    var f;
    if (e.options.stream)
      return Ue(t).debug("response", r.status, r.url, r.headers, r.body), e.options.__streamClass ? e.options.__streamClass.fromSSEResponse(r, e.controller, t) : jt.fromSSEResponse(r, e.controller, t);
    if (r.status === 204)
      return null;
    if (e.options.__binaryResponse)
      return r;
    const i = r.headers.get("content-type"), c = (f = i == null ? void 0 : i.split(";")[0]) == null ? void 0 : f.trim();
    if ((c == null ? void 0 : c.includes("application/json")) || (c == null ? void 0 : c.endsWith("+json"))) {
      const _ = await r.json();
      return Hh(_, r);
    }
    return await r.text();
  })();
  return Ue(t).debug(`[${n}] response parsed`, _r({
    retryOfRequestLogID: s,
    url: r.url,
    status: r.status,
    body: o,
    durationMs: Date.now() - a
  })), o;
}
function Hh(t, e) {
  return !t || typeof t != "object" || Array.isArray(t) ? t : Object.defineProperty(t, "_request_id", {
    value: e.headers.get("x-request-id"),
    enumerable: !1
  });
}
var kn;
class xa extends Promise {
  constructor(e, r, n = Bh) {
    super((s) => {
      s(null);
    }), this.responsePromise = r, this.parseResponse = n, kn.set(this, void 0), re(this, kn, e);
  }
  _thenUnwrap(e) {
    return new xa(T(this, kn, "f"), this.responsePromise, async (r, n) => Hh(e(await this.parseResponse(r, n), n), n.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((e) => e.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [e, r] = await Promise.all([this.parse(), this.asResponse()]);
    return { data: e, response: r, request_id: r.headers.get("x-request-id") };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((e) => this.parseResponse(T(this, kn, "f"), e))), this.parsedPromise;
  }
  then(e, r) {
    return this.parse().then(e, r);
  }
  catch(e) {
    return this.parse().catch(e);
  }
  finally(e) {
    return this.parse().finally(e);
  }
}
kn = /* @__PURE__ */ new WeakMap();
var Ts;
class Wh {
  constructor(e, r, n, s) {
    Ts.set(this, void 0), re(this, Ts, e), this.options = s, this.response = r, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e)
      throw new ne("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Ts, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Ts = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages())
      for (const r of e.getPaginatedItems())
        yield r;
  }
}
class oO extends xa {
  constructor(e, r, n) {
    super(e, r, async (s, a) => new n(s, a.response, await Bh(s, a), a.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const r of e)
      yield r;
  }
}
class za extends Wh {
  constructor(e, r, n, s) {
    super(e, r, n, s), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}
class Oe extends Wh {
  constructor(e, r, n, s) {
    super(e, r, n, s), this.data = n.data || [], this.has_more = n.has_more || !1;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    var n;
    const e = this.getPaginatedItems(), r = (n = e[e.length - 1]) == null ? void 0 : n.id;
    return r ? {
      ...this.options,
      query: {
        ...CI(this.options.query),
        after: r
      }
    } : null;
  }
}
const Jh = () => {
  var t;
  if (typeof File > "u") {
    const { process: e } = globalThis, r = typeof ((t = e == null ? void 0 : e.versions) == null ? void 0 : t.node) == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (r ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Jn(t, e, r) {
  return Jh(), new File(t, e ?? "unknown_file", r);
}
function Ws(t) {
  return (typeof t == "object" && t !== null && ("name" in t && t.name && String(t.name) || "url" in t && t.url && String(t.url) || "filename" in t && t.filename && String(t.filename) || "path" in t && t.path && String(t.path)) || "").split(/[\\/]/).pop() || void 0;
}
const Xh = (t) => t != null && typeof t == "object" && typeof t[Symbol.asyncIterator] == "function", Cr = async (t, e) => ({ ...t, body: await cO(t.body, e) }), wd = /* @__PURE__ */ new WeakMap();
function iO(t) {
  const e = typeof t == "function" ? t : t.fetch, r = wd.get(e);
  if (r)
    return r;
  const n = (async () => {
    try {
      const s = "Response" in e ? e.Response : (await e("data:,")).constructor, a = new FormData();
      return a.toString() !== await new s(a).text();
    } catch {
      return !0;
    }
  })();
  return wd.set(e, n), n;
}
const cO = async (t, e) => {
  if (!await iO(e))
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(t || {}).map(([n, s]) => Bo(r, n, s))), r;
}, lO = (t) => t instanceof Blob && "name" in t, Bo = async (t, e, r) => {
  if (r !== void 0) {
    if (r == null)
      throw new TypeError(`Received null for "${e}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof r == "string" || typeof r == "number" || typeof r == "boolean")
      t.append(e, String(r));
    else if (r instanceof Response)
      t.append(e, Jn([await r.blob()], Ws(r)));
    else if (Xh(r))
      t.append(e, Jn([await new Response(Vh(r)).blob()], Ws(r)));
    else if (lO(r))
      t.append(e, r, Ws(r));
    else if (Array.isArray(r))
      await Promise.all(r.map((n) => Bo(t, e + "[]", n)));
    else if (typeof r == "object")
      await Promise.all(Object.entries(r).map(([n, s]) => Bo(t, `${e}[${n}]`, s)));
    else
      throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${r} instead`);
  }
}, Yh = (t) => t != null && typeof t == "object" && typeof t.size == "number" && typeof t.type == "string" && typeof t.text == "function" && typeof t.slice == "function" && typeof t.arrayBuffer == "function", uO = (t) => t != null && typeof t == "object" && typeof t.name == "string" && typeof t.lastModified == "number" && Yh(t), dO = (t) => t != null && typeof t == "object" && typeof t.url == "string" && typeof t.blob == "function";
async function fO(t, e, r) {
  if (Jh(), t = await t, uO(t))
    return t instanceof File ? t : Jn([await t.arrayBuffer()], t.name);
  if (dO(t)) {
    const s = await t.blob();
    return e || (e = new URL(t.url).pathname.split(/[\\/]/).pop()), Jn(await Ho(s), e, r);
  }
  const n = await Ho(t);
  if (e || (e = Ws(t)), !(r != null && r.type)) {
    const s = n.find((a) => typeof a == "object" && "type" in a && a.type);
    typeof s == "string" && (r = { ...r, type: s });
  }
  return Jn(n, e, r);
}
async function Ho(t) {
  var r;
  let e = [];
  if (typeof t == "string" || ArrayBuffer.isView(t) || // includes Uint8Array, Buffer, etc.
  t instanceof ArrayBuffer)
    e.push(t);
  else if (Yh(t))
    e.push(t instanceof Blob ? t : await t.arrayBuffer());
  else if (Xh(t))
    for await (const n of t)
      e.push(...await Ho(n));
  else {
    const n = (r = t == null ? void 0 : t.constructor) == null ? void 0 : r.name;
    throw new Error(`Unexpected data type: ${typeof t}${n ? `; constructor: ${n}` : ""}${hO(t)}`);
  }
  return e;
}
function hO(t) {
  return typeof t != "object" || t === null ? "" : `; props: [${Object.getOwnPropertyNames(t).map((r) => `"${r}"`).join(", ")}]`;
}
class se {
  constructor(e) {
    this._client = e;
  }
}
function Qh(t) {
  return t.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const bd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), mO = (t = Qh) => function(r, ...n) {
  if (r.length === 1)
    return r[0];
  let s = !1;
  const a = [], o = r.reduce((l, f, _) => {
    var y;
    /[?#]/.test(f) && (s = !0);
    const m = n[_];
    let g = (s ? encodeURIComponent : t)("" + m);
    return _ !== n.length && (m == null || typeof m == "object" && // handle values from other realms
    m.toString === ((y = Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? bd) ?? bd)) == null ? void 0 : y.toString)) && (g = m + "", a.push({
      start: l.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), l + f + (_ === n.length ? "" : g);
  }, ""), i = o.split(/[?#]/, 1)[0], c = new RegExp("(?<=^|\\/)(?:\\.|%2e){1,2}(?=\\/|$)", "gi");
  let d;
  for (; (d = c.exec(i)) !== null; )
    a.push({
      start: d.index,
      length: d[0].length,
      error: `Value "${d[0]}" can't be safely passed as a path parameter`
    });
  if (a.sort((l, f) => l.start - f.start), a.length > 0) {
    let l = 0;
    const f = a.reduce((_, m) => {
      const g = " ".repeat(m.start - l), y = "^".repeat(m.length);
      return l = m.start + m.length, _ + g + y;
    }, "");
    throw new ne(`Path parameters result in path with invalid segments:
${a.map((_) => _.error).join(`
`)}
${o}
${f}`);
  }
  return o;
}, q = /* @__PURE__ */ mO(Qh);
let Zh = class extends se {
  /**
   * Get the messages in a stored chat completion. Only Chat Completions that have
   * been created with the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
   *   'completion_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/chat/completions/${e}/messages`, Oe, { query: r, ...n });
  }
};
function pO(t) {
  return typeof t.parse == "function";
}
const pa = (t) => (t == null ? void 0 : t.role) === "assistant", em = (t) => (t == null ? void 0 : t.role) === "tool";
var Wo, Js, Xs, Cn, jn, Ys, Dn, xt, Mn, ya, $a, Br, tm;
class cl {
  constructor() {
    Wo.add(this), this.controller = new AbortController(), Js.set(this, void 0), Xs.set(this, () => {
    }), Cn.set(this, () => {
    }), jn.set(this, void 0), Ys.set(this, () => {
    }), Dn.set(this, () => {
    }), xt.set(this, {}), Mn.set(this, !1), ya.set(this, !1), $a.set(this, !1), Br.set(this, !1), re(this, Js, new Promise((e, r) => {
      re(this, Xs, e, "f"), re(this, Cn, r, "f");
    })), re(this, jn, new Promise((e, r) => {
      re(this, Ys, e, "f"), re(this, Dn, r, "f");
    })), T(this, Js, "f").catch(() => {
    }), T(this, jn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, Wo, "m", tm).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, Xs, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, Mn, "f");
  }
  get errored() {
    return T(this, ya, "f");
  }
  get aborted() {
    return T(this, $a, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(e, r) {
    return (T(this, xt, "f")[e] || (T(this, xt, "f")[e] = [])).push({ listener: r }), this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(e, r) {
    const n = T(this, xt, "f")[e];
    if (!n)
      return this;
    const s = n.findIndex((a) => a.listener === r);
    return s >= 0 && n.splice(s, 1), this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(e, r) {
    return (T(this, xt, "f")[e] || (T(this, xt, "f")[e] = [])).push({ listener: r, once: !0 }), this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(e) {
    return new Promise((r, n) => {
      re(this, Br, !0), e !== "error" && this.once("error", n), this.once(e, r);
    });
  }
  async done() {
    re(this, Br, !0), await T(this, jn, "f");
  }
  _emit(e, ...r) {
    if (T(this, Mn, "f"))
      return;
    e === "end" && (re(this, Mn, !0), T(this, Ys, "f").call(this));
    const n = T(this, xt, "f")[e];
    if (n && (T(this, xt, "f")[e] = n.filter((s) => !s.once), n.forEach(({ listener: s }) => s(...r))), e === "abort") {
      const s = r[0];
      !T(this, Br, "f") && !(n != null && n.length) && Promise.reject(s), T(this, Cn, "f").call(this, s), T(this, Dn, "f").call(this, s), this._emit("end");
      return;
    }
    if (e === "error") {
      const s = r[0];
      !T(this, Br, "f") && !(n != null && n.length) && Promise.reject(s), T(this, Cn, "f").call(this, s), T(this, Dn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
  }
}
Js = /* @__PURE__ */ new WeakMap(), Xs = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), Ys = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), xt = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), ya = /* @__PURE__ */ new WeakMap(), $a = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakSet(), tm = function(e) {
  if (re(this, ya, !0), e instanceof Error && e.name === "AbortError" && (e = new mt()), e instanceof mt)
    return re(this, $a, !0), this._emit("abort", e);
  if (e instanceof ne)
    return this._emit("error", e);
  if (e instanceof Error) {
    const r = new ne(e.message);
    return r.cause = e, this._emit("error", r);
  }
  return this._emit("error", new ne(String(e)));
};
function ll(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-response-format";
}
function is(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-tool";
}
function yO(t, e) {
  return !e || !rm(e) ? {
    ...t,
    choices: t.choices.map((r) => ({
      ...r,
      message: {
        ...r.message,
        parsed: null,
        ...r.message.tool_calls ? {
          tool_calls: r.message.tool_calls
        } : void 0
      }
    }))
  } : ul(t, e);
}
function ul(t, e) {
  const r = t.choices.map((n) => {
    var s;
    if (n.finish_reason === "length")
      throw new Mh();
    if (n.finish_reason === "content_filter")
      throw new Lh();
    return {
      ...n,
      message: {
        ...n.message,
        ...n.message.tool_calls ? {
          tool_calls: ((s = n.message.tool_calls) == null ? void 0 : s.map((a) => gO(e, a))) ?? void 0
        } : void 0,
        parsed: n.message.content && !n.message.refusal ? $O(e, n.message.content) : null
      }
    };
  });
  return { ...t, choices: r };
}
function $O(t, e) {
  var r, n;
  return ((r = t.response_format) == null ? void 0 : r.type) !== "json_schema" ? null : ((n = t.response_format) == null ? void 0 : n.type) === "json_schema" ? "$parseRaw" in t.response_format ? t.response_format.$parseRaw(e) : JSON.parse(e) : null;
}
function gO(t, e) {
  var n;
  const r = (n = t.tools) == null ? void 0 : n.find((s) => {
    var a;
    return ((a = s.function) == null ? void 0 : a.name) === e.function.name;
  });
  return {
    ...e,
    function: {
      ...e.function,
      parsed_arguments: is(r) ? r.$parseRaw(e.function.arguments) : r != null && r.function.strict ? JSON.parse(e.function.arguments) : null
    }
  };
}
function _O(t, e) {
  var n;
  if (!t)
    return !1;
  const r = (n = t.tools) == null ? void 0 : n.find((s) => {
    var a;
    return ((a = s.function) == null ? void 0 : a.name) === e.function.name;
  });
  return is(r) || (r == null ? void 0 : r.function.strict) || !1;
}
function rm(t) {
  var e;
  return ll(t.response_format) ? !0 : ((e = t.tools) == null ? void 0 : e.some((r) => is(r) || r.type === "function" && r.function.strict === !0)) ?? !1;
}
function vO(t) {
  for (const e of t ?? []) {
    if (e.type !== "function")
      throw new ne(`Currently only \`function\` tool types support auto-parsing; Received \`${e.type}\``);
    if (e.function.strict !== !0)
      throw new ne(`The \`${e.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Qe, Jo, ga, Xo, Yo, Qo, nm, sm;
const wO = 10;
class am extends cl {
  constructor() {
    super(...arguments), Qe.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    var n;
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const r = (n = e.choices[0]) == null ? void 0 : n.message;
    return r && this._addMessage(r), e;
  }
  _addMessage(e, r = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), r) {
      if (this._emit("message", e), em(e) && e.content)
        this._emit("functionToolCallResult", e.content);
      else if (pa(e) && e.tool_calls)
        for (const n of e.tool_calls)
          n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e)
      throw new ne("stream ended without producing a ChatCompletion");
    return e;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    return await this.done(), T(this, Qe, "m", Jo).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    return await this.done(), T(this, Qe, "m", ga).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionToolCall() {
    return await this.done(), T(this, Qe, "m", Xo).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, Qe, "m", Yo).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, Qe, "m", Qo).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const r = T(this, Qe, "m", ga).call(this);
    r && this._emit("finalMessage", r);
    const n = T(this, Qe, "m", Jo).call(this);
    n && this._emit("finalContent", n);
    const s = T(this, Qe, "m", Xo).call(this);
    s && this._emit("finalFunctionToolCall", s);
    const a = T(this, Qe, "m", Yo).call(this);
    a != null && this._emit("finalFunctionToolCallResult", a), this._chatCompletions.some((o) => o.usage) && this._emit("totalUsage", T(this, Qe, "m", Qo).call(this));
  }
  async _createChatCompletion(e, r, n) {
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), T(this, Qe, "m", nm).call(this, r);
    const a = await e.chat.completions.create({ ...r, stream: !1 }, { ...n, signal: this.controller.signal });
    return this._connected(), this._addChatCompletion(ul(a, r));
  }
  async _runChatCompletion(e, r, n) {
    for (const s of r.messages)
      this._addMessage(s, !1);
    return await this._createChatCompletion(e, r, n);
  }
  async _runTools(e, r, n) {
    var m, g, y;
    const s = "tool", { tool_choice: a = "auto", stream: o, ...i } = r, c = typeof a != "string" && ((m = a == null ? void 0 : a.function) == null ? void 0 : m.name), { maxChatCompletions: d = wO } = n || {}, l = r.tools.map(($) => {
      if (is($)) {
        if (!$.$callback)
          throw new ne("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: $.$callback,
            name: $.function.name,
            description: $.function.description || "",
            parameters: $.function.parameters,
            parse: $.$parseRaw,
            strict: !0
          }
        };
      }
      return $;
    }), f = {};
    for (const $ of l)
      $.type === "function" && (f[$.function.name || $.function.function.name] = $.function);
    const _ = "tools" in r ? l.map(($) => $.type === "function" ? {
      type: "function",
      function: {
        name: $.function.name || $.function.function.name,
        parameters: $.function.parameters,
        description: $.function.description,
        strict: $.function.strict
      }
    } : $) : void 0;
    for (const $ of r.messages)
      this._addMessage($, !1);
    for (let $ = 0; $ < d; ++$) {
      const w = (g = (await this._createChatCompletion(e, {
        ...i,
        tool_choice: a,
        tools: _,
        messages: [...this.messages]
      }, n)).choices[0]) == null ? void 0 : g.message;
      if (!w)
        throw new ne("missing message in ChatCompletion response");
      if (!((y = w.tool_calls) != null && y.length))
        return;
      for (const S of w.tool_calls) {
        if (S.type !== "function")
          continue;
        const R = S.id, { name: A, arguments: F } = S.function, V = f[A];
        if (V) {
          if (c && c !== A) {
            const L = `Invalid tool_call: ${JSON.stringify(A)}. ${JSON.stringify(c)} requested. Please try again`;
            this._addMessage({ role: s, tool_call_id: R, content: L });
            continue;
          }
        } else {
          const L = `Invalid tool_call: ${JSON.stringify(A)}. Available options are: ${Object.keys(f).map((W) => JSON.stringify(W)).join(", ")}. Please try again`;
          this._addMessage({ role: s, tool_call_id: R, content: L });
          continue;
        }
        let ie;
        try {
          ie = pO(V) ? await V.parse(F) : F;
        } catch (L) {
          const W = L instanceof Error ? L.message : String(L);
          this._addMessage({ role: s, tool_call_id: R, content: W });
          continue;
        }
        const te = await V.function(ie, this), ae = T(this, Qe, "m", sm).call(this, te);
        if (this._addMessage({ role: s, tool_call_id: R, content: ae }), c)
          return;
      }
    }
  }
}
Qe = /* @__PURE__ */ new WeakSet(), Jo = function() {
  return T(this, Qe, "m", ga).call(this).content ?? null;
}, ga = function() {
  let e = this.messages.length;
  for (; e-- > 0; ) {
    const r = this.messages[e];
    if (pa(r))
      return {
        ...r,
        content: r.content ?? null,
        refusal: r.refusal ?? null
      };
  }
  throw new ne("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Xo = function() {
  var e, r;
  for (let n = this.messages.length - 1; n >= 0; n--) {
    const s = this.messages[n];
    if (pa(s) && ((e = s == null ? void 0 : s.tool_calls) != null && e.length))
      return (r = s.tool_calls.at(-1)) == null ? void 0 : r.function;
  }
}, Yo = function() {
  for (let e = this.messages.length - 1; e >= 0; e--) {
    const r = this.messages[e];
    if (em(r) && r.content != null && typeof r.content == "string" && this.messages.some((n) => {
      var s;
      return n.role === "assistant" && ((s = n.tool_calls) == null ? void 0 : s.some((a) => a.type === "function" && a.id === r.tool_call_id));
    }))
      return r.content;
  }
}, Qo = function() {
  const e = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: r } of this._chatCompletions)
    r && (e.completion_tokens += r.completion_tokens, e.prompt_tokens += r.prompt_tokens, e.total_tokens += r.total_tokens);
  return e;
}, nm = function(e) {
  if (e.n != null && e.n > 1)
    throw new ne("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, sm = function(e) {
  return typeof e == "string" ? e : e === void 0 ? "undefined" : JSON.stringify(e);
};
class dl extends am {
  static runTools(e, r, n) {
    const s = new dl(), a = {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    return s._run(() => s._runTools(e, r, a)), s;
  }
  _addMessage(e, r = !0) {
    super._addMessage(e, r), pa(e) && e.content && this._emit("content", e.content);
  }
}
const om = 1, im = 2, cm = 4, lm = 8, um = 16, dm = 32, fm = 64, hm = 128, mm = 256, pm = hm | mm, ym = um | dm | pm | fm, $m = om | im | ym, gm = cm | lm, bO = $m | gm, Le = {
  STR: om,
  NUM: im,
  ARR: cm,
  OBJ: lm,
  NULL: um,
  BOOL: dm,
  NAN: fm,
  INFINITY: hm,
  MINUS_INFINITY: mm,
  INF: pm,
  SPECIAL: ym,
  ATOM: $m,
  COLLECTION: gm,
  ALL: bO
};
class EO extends Error {
}
class SO extends Error {
}
function PO(t, e = Le.ALL) {
  if (typeof t != "string")
    throw new TypeError(`expecting str, got ${typeof t}`);
  if (!t.trim())
    throw new Error(`${t} is empty`);
  return RO(t.trim(), e);
}
const RO = (t, e) => {
  const r = t.length;
  let n = 0;
  const s = (_) => {
    throw new EO(`${_} at position ${n}`);
  }, a = (_) => {
    throw new SO(`${_} at position ${n}`);
  }, o = () => (f(), n >= r && s("Unexpected end of input"), t[n] === '"' ? i() : t[n] === "{" ? c() : t[n] === "[" ? d() : t.substring(n, n + 4) === "null" || Le.NULL & e && r - n < 4 && "null".startsWith(t.substring(n)) ? (n += 4, null) : t.substring(n, n + 4) === "true" || Le.BOOL & e && r - n < 4 && "true".startsWith(t.substring(n)) ? (n += 4, !0) : t.substring(n, n + 5) === "false" || Le.BOOL & e && r - n < 5 && "false".startsWith(t.substring(n)) ? (n += 5, !1) : t.substring(n, n + 8) === "Infinity" || Le.INFINITY & e && r - n < 8 && "Infinity".startsWith(t.substring(n)) ? (n += 8, 1 / 0) : t.substring(n, n + 9) === "-Infinity" || Le.MINUS_INFINITY & e && 1 < r - n && r - n < 9 && "-Infinity".startsWith(t.substring(n)) ? (n += 9, -1 / 0) : t.substring(n, n + 3) === "NaN" || Le.NAN & e && r - n < 3 && "NaN".startsWith(t.substring(n)) ? (n += 3, NaN) : l()), i = () => {
    const _ = n;
    let m = !1;
    for (n++; n < r && (t[n] !== '"' || m && t[n - 1] === "\\"); )
      m = t[n] === "\\" ? !m : !1, n++;
    if (t.charAt(n) == '"')
      try {
        return JSON.parse(t.substring(_, ++n - Number(m)));
      } catch (g) {
        a(String(g));
      }
    else if (Le.STR & e)
      try {
        return JSON.parse(t.substring(_, n - Number(m)) + '"');
      } catch {
        return JSON.parse(t.substring(_, t.lastIndexOf("\\")) + '"');
      }
    s("Unterminated string literal");
  }, c = () => {
    n++, f();
    const _ = {};
    try {
      for (; t[n] !== "}"; ) {
        if (f(), n >= r && Le.OBJ & e)
          return _;
        const m = i();
        f(), n++;
        try {
          const g = o();
          Object.defineProperty(_, m, { value: g, writable: !0, enumerable: !0, configurable: !0 });
        } catch (g) {
          if (Le.OBJ & e)
            return _;
          throw g;
        }
        f(), t[n] === "," && n++;
      }
    } catch {
      if (Le.OBJ & e)
        return _;
      s("Expected '}' at end of object");
    }
    return n++, _;
  }, d = () => {
    n++;
    const _ = [];
    try {
      for (; t[n] !== "]"; )
        _.push(o()), f(), t[n] === "," && n++;
    } catch {
      if (Le.ARR & e)
        return _;
      s("Expected ']' at end of array");
    }
    return n++, _;
  }, l = () => {
    if (n === 0) {
      t === "-" && Le.NUM & e && s("Not sure what '-' is");
      try {
        return JSON.parse(t);
      } catch (m) {
        if (Le.NUM & e)
          try {
            return t[t.length - 1] === "." ? JSON.parse(t.substring(0, t.lastIndexOf("."))) : JSON.parse(t.substring(0, t.lastIndexOf("e")));
          } catch {
          }
        a(String(m));
      }
    }
    const _ = n;
    for (t[n] === "-" && n++; t[n] && !",]}".includes(t[n]); )
      n++;
    n == r && !(Le.NUM & e) && s("Unterminated number literal");
    try {
      return JSON.parse(t.substring(_, n));
    } catch {
      t.substring(_, n) === "-" && Le.NUM & e && s("Not sure what '-' is");
      try {
        return JSON.parse(t.substring(_, t.lastIndexOf("e")));
      } catch (g) {
        a(String(g));
      }
    }
  }, f = () => {
    for (; n < r && ` 
\r	`.includes(t[n]); )
      n++;
  };
  return o();
}, Ed = (t) => PO(t, Le.ALL ^ Le.NUM);
var Ne, qt, Ur, sr, go, ks, _o, vo, wo, Cs, bo, Sd;
class es extends am {
  constructor(e) {
    super(), Ne.add(this), qt.set(this, void 0), Ur.set(this, void 0), sr.set(this, void 0), re(this, qt, e), re(this, Ur, []);
  }
  get currentChatCompletionSnapshot() {
    return T(this, sr, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(e) {
    const r = new es(null);
    return r._run(() => r._fromReadableStream(e)), r;
  }
  static createChatCompletion(e, r, n) {
    const s = new es(r);
    return s._run(() => s._runChatCompletion(e, { ...r, stream: !0 }, { ...n, headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" } })), s;
  }
  async _createChatCompletion(e, r, n) {
    var o;
    super._createChatCompletion;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), T(this, Ne, "m", go).call(this);
    const a = await e.chat.completions.create({ ...r, stream: !0 }, { ...n, signal: this.controller.signal });
    this._connected();
    for await (const i of a)
      T(this, Ne, "m", _o).call(this, i);
    if ((o = a.controller.signal) != null && o.aborted)
      throw new mt();
    return this._addChatCompletion(T(this, Ne, "m", Cs).call(this));
  }
  async _fromReadableStream(e, r) {
    var o;
    const n = r == null ? void 0 : r.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), T(this, Ne, "m", go).call(this), this._connected();
    const s = jt.fromReadableStream(e, this.controller);
    let a;
    for await (const i of s)
      a && a !== i.id && this._addChatCompletion(T(this, Ne, "m", Cs).call(this)), T(this, Ne, "m", _o).call(this, i), a = i.id;
    if ((o = s.controller.signal) != null && o.aborted)
      throw new mt();
    return this._addChatCompletion(T(this, Ne, "m", Cs).call(this));
  }
  [(qt = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakSet(), go = function() {
    this.ended || re(this, sr, void 0);
  }, ks = function(r) {
    let n = T(this, Ur, "f")[r.index];
    return n || (n = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, Ur, "f")[r.index] = n, n);
  }, _o = function(r) {
    var s, a, o, i, c, d, l, f, _, m, g, y, $, p, w;
    if (this.ended)
      return;
    const n = T(this, Ne, "m", Sd).call(this, r);
    this._emit("chunk", r, n);
    for (const S of r.choices) {
      const R = n.choices[S.index];
      S.delta.content != null && ((s = R.message) == null ? void 0 : s.role) === "assistant" && ((a = R.message) != null && a.content) && (this._emit("content", S.delta.content, R.message.content), this._emit("content.delta", {
        delta: S.delta.content,
        snapshot: R.message.content,
        parsed: R.message.parsed
      })), S.delta.refusal != null && ((o = R.message) == null ? void 0 : o.role) === "assistant" && ((i = R.message) != null && i.refusal) && this._emit("refusal.delta", {
        delta: S.delta.refusal,
        snapshot: R.message.refusal
      }), ((c = S.logprobs) == null ? void 0 : c.content) != null && ((d = R.message) == null ? void 0 : d.role) === "assistant" && this._emit("logprobs.content.delta", {
        content: (l = S.logprobs) == null ? void 0 : l.content,
        snapshot: ((f = R.logprobs) == null ? void 0 : f.content) ?? []
      }), ((_ = S.logprobs) == null ? void 0 : _.refusal) != null && ((m = R.message) == null ? void 0 : m.role) === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: (g = S.logprobs) == null ? void 0 : g.refusal,
        snapshot: ((y = R.logprobs) == null ? void 0 : y.refusal) ?? []
      });
      const A = T(this, Ne, "m", ks).call(this, R);
      R.finish_reason && (T(this, Ne, "m", wo).call(this, R), A.current_tool_call_index != null && T(this, Ne, "m", vo).call(this, R, A.current_tool_call_index));
      for (const F of S.delta.tool_calls ?? [])
        A.current_tool_call_index !== F.index && (T(this, Ne, "m", wo).call(this, R), A.current_tool_call_index != null && T(this, Ne, "m", vo).call(this, R, A.current_tool_call_index)), A.current_tool_call_index = F.index;
      for (const F of S.delta.tool_calls ?? []) {
        const V = ($ = R.message.tool_calls) == null ? void 0 : $[F.index];
        V != null && V.type && ((V == null ? void 0 : V.type) === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: (p = V.function) == null ? void 0 : p.name,
          index: F.index,
          arguments: V.function.arguments,
          parsed_arguments: V.function.parsed_arguments,
          arguments_delta: ((w = F.function) == null ? void 0 : w.arguments) ?? ""
        }) : (V == null || V.type, void 0));
      }
    }
  }, vo = function(r, n) {
    var o, i, c;
    if (T(this, Ne, "m", ks).call(this, r).done_tool_calls.has(n))
      return;
    const a = (o = r.message.tool_calls) == null ? void 0 : o[n];
    if (!a)
      throw new Error("no tool call snapshot");
    if (!a.type)
      throw new Error("tool call snapshot missing `type`");
    if (a.type === "function") {
      const d = (c = (i = T(this, qt, "f")) == null ? void 0 : i.tools) == null ? void 0 : c.find((l) => l.type === "function" && l.function.name === a.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: a.function.name,
        index: n,
        arguments: a.function.arguments,
        parsed_arguments: is(d) ? d.$parseRaw(a.function.arguments) : d != null && d.function.strict ? JSON.parse(a.function.arguments) : null
      });
    } else
      a.type;
  }, wo = function(r) {
    var s, a;
    const n = T(this, Ne, "m", ks).call(this, r);
    if (r.message.content && !n.content_done) {
      n.content_done = !0;
      const o = T(this, Ne, "m", bo).call(this);
      this._emit("content.done", {
        content: r.message.content,
        parsed: o ? o.$parseRaw(r.message.content) : null
      });
    }
    r.message.refusal && !n.refusal_done && (n.refusal_done = !0, this._emit("refusal.done", { refusal: r.message.refusal })), (s = r.logprobs) != null && s.content && !n.logprobs_content_done && (n.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: r.logprobs.content })), (a = r.logprobs) != null && a.refusal && !n.logprobs_refusal_done && (n.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: r.logprobs.refusal }));
  }, Cs = function() {
    if (this.ended)
      throw new ne("stream has ended, this shouldn't happen");
    const r = T(this, sr, "f");
    if (!r)
      throw new ne("request ended without sending any chunks");
    return re(this, sr, void 0), re(this, Ur, []), IO(r, T(this, qt, "f"));
  }, bo = function() {
    var n;
    const r = (n = T(this, qt, "f")) == null ? void 0 : n.response_format;
    return ll(r) ? r : null;
  }, Sd = function(r) {
    var n, s, a, o;
    let i = T(this, sr, "f");
    const { choices: c, ...d } = r;
    i ? Object.assign(i, d) : i = re(this, sr, {
      ...d,
      choices: []
    });
    for (const { delta: l, finish_reason: f, index: _, logprobs: m = null, ...g } of r.choices) {
      let y = i.choices[_];
      if (y || (y = i.choices[_] = { finish_reason: f, index: _, message: {}, logprobs: m, ...g }), m)
        if (!y.logprobs)
          y.logprobs = Object.assign({}, m);
        else {
          const { content: F, refusal: V, ...ie } = m;
          Object.assign(y.logprobs, ie), F && ((n = y.logprobs).content ?? (n.content = []), y.logprobs.content.push(...F)), V && ((s = y.logprobs).refusal ?? (s.refusal = []), y.logprobs.refusal.push(...V));
        }
      if (f && (y.finish_reason = f, T(this, qt, "f") && rm(T(this, qt, "f")))) {
        if (f === "length")
          throw new Mh();
        if (f === "content_filter")
          throw new Lh();
      }
      if (Object.assign(y, g), !l)
        continue;
      const { content: $, refusal: p, function_call: w, role: S, tool_calls: R, ...A } = l;
      if (Object.assign(y.message, A), p && (y.message.refusal = (y.message.refusal || "") + p), S && (y.message.role = S), w && (y.message.function_call ? (w.name && (y.message.function_call.name = w.name), w.arguments && ((a = y.message.function_call).arguments ?? (a.arguments = ""), y.message.function_call.arguments += w.arguments)) : y.message.function_call = w), $ && (y.message.content = (y.message.content || "") + $, !y.message.refusal && T(this, Ne, "m", bo).call(this) && (y.message.parsed = Ed(y.message.content))), R) {
        y.message.tool_calls || (y.message.tool_calls = []);
        for (const { index: F, id: V, type: ie, function: te, ...ae } of R) {
          const L = (o = y.message.tool_calls)[F] ?? (o[F] = {});
          Object.assign(L, ae), V && (L.id = V), ie && (L.type = ie), te && (L.function ?? (L.function = { name: te.name ?? "", arguments: "" })), te != null && te.name && (L.function.name = te.name), te != null && te.arguments && (L.function.arguments += te.arguments, _O(T(this, qt, "f"), L) && (L.function.parsed_arguments = Ed(L.function.arguments)));
        }
      }
    }
    return i;
  }, Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("chunk", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  toReadableStream() {
    return new jt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}
function IO(t, e) {
  const { id: r, choices: n, created: s, model: a, system_fingerprint: o, ...i } = t, c = {
    ...i,
    id: r,
    choices: n.map(({ message: d, finish_reason: l, index: f, logprobs: _, ...m }) => {
      if (!l)
        throw new ne(`missing finish_reason for choice ${f}`);
      const { content: g = null, function_call: y, tool_calls: $, ...p } = d, w = d.role;
      if (!w)
        throw new ne(`missing role for choice ${f}`);
      if (y) {
        const { arguments: S, name: R } = y;
        if (S == null)
          throw new ne(`missing function_call.arguments for choice ${f}`);
        if (!R)
          throw new ne(`missing function_call.name for choice ${f}`);
        return {
          ...m,
          message: {
            content: g,
            function_call: { arguments: S, name: R },
            role: w,
            refusal: d.refusal ?? null
          },
          finish_reason: l,
          index: f,
          logprobs: _
        };
      }
      return $ ? {
        ...m,
        index: f,
        finish_reason: l,
        logprobs: _,
        message: {
          ...p,
          role: w,
          content: g,
          refusal: d.refusal ?? null,
          tool_calls: $.map((S, R) => {
            const { function: A, type: F, id: V, ...ie } = S, { arguments: te, name: ae, ...L } = A || {};
            if (V == null)
              throw new ne(`missing choices[${f}].tool_calls[${R}].id
${js(t)}`);
            if (F == null)
              throw new ne(`missing choices[${f}].tool_calls[${R}].type
${js(t)}`);
            if (ae == null)
              throw new ne(`missing choices[${f}].tool_calls[${R}].function.name
${js(t)}`);
            if (te == null)
              throw new ne(`missing choices[${f}].tool_calls[${R}].function.arguments
${js(t)}`);
            return { ...ie, id: V, type: F, function: { ...L, name: ae, arguments: te } };
          })
        }
      } : {
        ...m,
        message: { ...p, content: g, role: w, refusal: d.refusal ?? null },
        finish_reason: l,
        index: f,
        logprobs: _
      };
    }),
    created: s,
    model: a,
    object: "chat.completion",
    ...o ? { system_fingerprint: o } : {}
  };
  return yO(c, e);
}
function js(t) {
  return JSON.stringify(t);
}
class _a extends es {
  static fromReadableStream(e) {
    const r = new _a(null);
    return r._run(() => r._fromReadableStream(e)), r;
  }
  static runTools(e, r, n) {
    const s = new _a(
      // @ts-expect-error TODO these types are incompatible
      r
    ), a = {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    return s._run(() => s._runTools(e, r, a)), s;
  }
}
let fl = class extends se {
  constructor() {
    super(...arguments), this.messages = new Zh(this._client);
  }
  create(e, r) {
    return this._client.post("/chat/completions", { body: e, ...r, stream: e.stream ?? !1 });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(e, r) {
    return this._client.get(q`/chat/completions/${e}`, r);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(e, r, n) {
    return this._client.post(q`/chat/completions/${e}`, { body: r, ...n });
  }
  /**
   * List stored Chat Completions. Only Chat Completions that have been stored with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletion of client.chat.completions.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/chat/completions", Oe, { query: e, ...r });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.delete('completion_id');
   * ```
   */
  delete(e, r) {
    return this._client.delete(q`/chat/completions/${e}`, r);
  }
  parse(e, r) {
    return vO(e.tools), this._client.chat.completions.create(e, {
      ...r,
      headers: {
        ...r == null ? void 0 : r.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ul(n, e));
  }
  runTools(e, r) {
    return e.stream ? _a.runTools(this._client, e, r) : dl.runTools(this._client, e, r);
  }
  /**
   * Creates a chat completion stream
   */
  stream(e, r) {
    return es.createChatCompletion(this._client, e, r);
  }
};
fl.Messages = Zh;
class hl extends se {
  constructor() {
    super(...arguments), this.completions = new fl(this._client);
  }
}
hl.Completions = fl;
const _m = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* OO(t) {
  if (!t)
    return;
  if (_m in t) {
    const { values: n, nulls: s } = t;
    yield* n.entries();
    for (const a of s)
      yield [a, null];
    return;
  }
  let e = !1, r;
  t instanceof Headers ? r = t.entries() : ld(t) ? r = t : (e = !0, r = Object.entries(t ?? {}));
  for (let n of r) {
    const s = n[0];
    if (typeof s != "string")
      throw new TypeError("expected header name to be a string");
    const a = ld(n[1]) ? n[1] : [n[1]];
    let o = !1;
    for (const i of a)
      i !== void 0 && (e && !o && (o = !0, yield [s, null]), yield [s, i]);
  }
}
const Z = (t) => {
  const e = new Headers(), r = /* @__PURE__ */ new Set();
  for (const n of t) {
    const s = /* @__PURE__ */ new Set();
    for (const [a, o] of OO(n)) {
      const i = a.toLowerCase();
      s.has(i) || (e.delete(a), s.add(i)), o === null ? (e.delete(a), r.add(i)) : (e.append(a, o), r.delete(i));
    }
  }
  return { [_m]: !0, values: e, nulls: r };
};
class vm extends se {
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(e, r) {
    return this._client.post("/audio/speech", {
      body: e,
      ...r,
      headers: Z([{ Accept: "application/octet-stream" }, r == null ? void 0 : r.headers]),
      __binaryResponse: !0
    });
  }
}
class wm extends se {
  create(e, r) {
    return this._client.post("/audio/transcriptions", Cr({
      body: e,
      ...r,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}
class bm extends se {
  create(e, r) {
    return this._client.post("/audio/translations", Cr({ body: e, ...r, __metadata: { model: e.model } }, this._client));
  }
}
class cs extends se {
  constructor() {
    super(...arguments), this.transcriptions = new wm(this._client), this.translations = new bm(this._client), this.speech = new vm(this._client);
  }
}
cs.Transcriptions = wm;
cs.Translations = bm;
cs.Speech = vm;
class Em extends se {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(e, r) {
    return this._client.post("/batches", { body: e, ...r });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(e, r) {
    return this._client.get(q`/batches/${e}`, r);
  }
  /**
   * List your organization's batches.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/batches", Oe, { query: e, ...r });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(e, r) {
    return this._client.post(q`/batches/${e}/cancel`, r);
  }
}
class Sm extends se {
  /**
   * Create an assistant with a model and instructions.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.create({
   *   model: 'gpt-4o',
   * });
   * ```
   */
  create(e, r) {
    return this._client.post("/assistants", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.retrieve(
   *   'assistant_id',
   * );
   * ```
   */
  retrieve(e, r) {
    return this._client.get(q`/assistants/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.update(
   *   'assistant_id',
   * );
   * ```
   */
  update(e, r, n) {
    return this._client.post(q`/assistants/${e}`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of assistants.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const assistant of client.beta.assistants.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/assistants", Oe, {
      query: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Delete an assistant.
   *
   * @example
   * ```ts
   * const assistantDeleted =
   *   await client.beta.assistants.delete('assistant_id');
   * ```
   */
  delete(e, r) {
    return this._client.delete(q`/assistants/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
}
class Pm extends se {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(e, r) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
}
class Rm extends se {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(e, r) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
}
class Ka extends se {
  constructor() {
    super(...arguments), this.sessions = new Pm(this._client), this.transcriptionSessions = new Rm(this._client);
  }
}
Ka.Sessions = Pm;
Ka.TranscriptionSessions = Rm;
class Im extends se {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(e, r, n) {
    return this._client.post(q`/threads/${e}/messages`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s } = r;
    return this._client.get(q`/threads/${s}/messages/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(q`/threads/${s}/messages/${e}`, {
      body: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of messages for a given thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/threads/${e}/messages`, Oe, {
      query: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(e, r, n) {
    const { thread_id: s } = r;
    return this._client.delete(q`/threads/${s}/messages/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
class Om extends se {
  /**
   * Retrieves a run step.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s, run_id: a, ...o } = r;
    return this._client.get(q`/threads/${s}/runs/${a}/steps/${e}`, {
      query: o,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of run steps belonging to a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.getAPIList(q`/threads/${s}/runs/${e}/steps`, Oe, {
      query: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
const NO = (t) => {
  if (typeof Buffer < "u") {
    const e = Buffer.from(t, "base64");
    return Array.from(new Float32Array(e.buffer, e.byteOffset, e.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const e = atob(t), r = e.length, n = new Uint8Array(r);
    for (let s = 0; s < r; s++)
      n[s] = e.charCodeAt(s);
    return Array.from(new Float32Array(n.buffer));
  }
}, qr = (t) => {
  var e, r, n, s, a;
  if (typeof globalThis.process < "u")
    return ((r = (e = globalThis.process.env) == null ? void 0 : e[t]) == null ? void 0 : r.trim()) ?? void 0;
  if (typeof globalThis.Deno < "u")
    return (a = (s = (n = globalThis.Deno.env) == null ? void 0 : n.get) == null ? void 0 : s.call(n, t)) == null ? void 0 : a.trim();
};
var qe, Ir, Zo, At, Qs, wt, Or, Xr, Rr, va, lt, Zs, ea, Xn, Ln, Fn, Pd, Rd, Id, Od, Nd, Ad, Td;
class Yn extends cl {
  constructor() {
    super(...arguments), qe.add(this), Zo.set(this, []), At.set(this, {}), Qs.set(this, {}), wt.set(this, void 0), Or.set(this, void 0), Xr.set(this, void 0), Rr.set(this, void 0), va.set(this, void 0), lt.set(this, void 0), Zs.set(this, void 0), ea.set(this, void 0), Xn.set(this, void 0);
  }
  [(Zo = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), Qs = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), va = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakMap(), ea = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("event", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  static fromReadableStream(e) {
    const r = new Ir();
    return r._run(() => r._fromReadableStream(e)), r;
  }
  async _fromReadableStream(e, r) {
    var a;
    const n = r == null ? void 0 : r.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const s = jt.fromReadableStream(e, this.controller);
    for await (const o of s)
      T(this, qe, "m", Ln).call(this, o);
    if ((a = s.controller.signal) != null && a.aborted)
      throw new mt();
    return this._addRun(T(this, qe, "m", Fn).call(this));
  }
  toReadableStream() {
    return new jt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, r, n, s) {
    const a = new Ir();
    return a._run(() => a._runToolAssistantStream(e, r, n, {
      ...s,
      headers: { ...s == null ? void 0 : s.headers, "X-Stainless-Helper-Method": "stream" }
    })), a;
  }
  async _createToolAssistantStream(e, r, n, s) {
    var c;
    const a = s == null ? void 0 : s.signal;
    a && (a.aborted && this.controller.abort(), a.addEventListener("abort", () => this.controller.abort()));
    const o = { ...n, stream: !0 }, i = await e.submitToolOutputs(r, o, {
      ...s,
      signal: this.controller.signal
    });
    this._connected();
    for await (const d of i)
      T(this, qe, "m", Ln).call(this, d);
    if ((c = i.controller.signal) != null && c.aborted)
      throw new mt();
    return this._addRun(T(this, qe, "m", Fn).call(this));
  }
  static createThreadAssistantStream(e, r, n) {
    const s = new Ir();
    return s._run(() => s._threadAssistantStream(e, r, {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" }
    })), s;
  }
  static createAssistantStream(e, r, n, s) {
    const a = new Ir();
    return a._run(() => a._runAssistantStream(e, r, n, {
      ...s,
      headers: { ...s == null ? void 0 : s.headers, "X-Stainless-Helper-Method": "stream" }
    })), a;
  }
  currentEvent() {
    return T(this, Zs, "f");
  }
  currentRun() {
    return T(this, ea, "f");
  }
  currentMessageSnapshot() {
    return T(this, wt, "f");
  }
  currentRunStepSnapshot() {
    return T(this, Xn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, At, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, Qs, "f"));
  }
  async finalRun() {
    if (await this.done(), !T(this, Or, "f"))
      throw Error("Final run was not received.");
    return T(this, Or, "f");
  }
  async _createThreadAssistantStream(e, r, n) {
    var i;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const a = { ...r, stream: !0 }, o = await e.createAndRun(a, { ...n, signal: this.controller.signal });
    this._connected();
    for await (const c of o)
      T(this, qe, "m", Ln).call(this, c);
    if ((i = o.controller.signal) != null && i.aborted)
      throw new mt();
    return this._addRun(T(this, qe, "m", Fn).call(this));
  }
  async _createAssistantStream(e, r, n, s) {
    var c;
    const a = s == null ? void 0 : s.signal;
    a && (a.aborted && this.controller.abort(), a.addEventListener("abort", () => this.controller.abort()));
    const o = { ...n, stream: !0 }, i = await e.create(r, o, { ...s, signal: this.controller.signal });
    this._connected();
    for await (const d of i)
      T(this, qe, "m", Ln).call(this, d);
    if ((c = i.controller.signal) != null && c.aborted)
      throw new mt();
    return this._addRun(T(this, qe, "m", Fn).call(this));
  }
  static accumulateDelta(e, r) {
    for (const [n, s] of Object.entries(r)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = s;
        continue;
      }
      let a = e[n];
      if (a == null) {
        e[n] = s;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = s;
        continue;
      }
      if (typeof a == "string" && typeof s == "string")
        a += s;
      else if (typeof a == "number" && typeof s == "number")
        a += s;
      else if (po(a) && po(s))
        a = this.accumulateDelta(a, s);
      else if (Array.isArray(a) && Array.isArray(s)) {
        if (a.every((o) => typeof o == "string" || typeof o == "number")) {
          a.push(...s);
          continue;
        }
        for (const o of s) {
          if (!po(o))
            throw new Error(`Expected array delta entry to be an object but got: ${o}`);
          const i = o.index;
          if (i == null)
            throw console.error(o), new Error("Expected array delta entry to have an `index` property");
          if (typeof i != "number")
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${i}`);
          const c = a[i];
          c == null ? a.push(o) : a[i] = this.accumulateDelta(c, o);
        }
        continue;
      } else
        throw Error(`Unhandled record type: ${n}, deltaValue: ${s}, accValue: ${a}`);
      e[n] = a;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, r, n) {
    return await this._createThreadAssistantStream(r, e, n);
  }
  async _runAssistantStream(e, r, n, s) {
    return await this._createAssistantStream(r, e, n, s);
  }
  async _runToolAssistantStream(e, r, n, s) {
    return await this._createToolAssistantStream(r, e, n, s);
  }
}
Ir = Yn, Ln = function(e) {
  if (!this.ended)
    switch (re(this, Zs, e), T(this, qe, "m", Id).call(this, e), e.event) {
      case "thread.created":
        break;
      case "thread.run.created":
      case "thread.run.queued":
      case "thread.run.in_progress":
      case "thread.run.requires_action":
      case "thread.run.completed":
      case "thread.run.incomplete":
      case "thread.run.failed":
      case "thread.run.cancelling":
      case "thread.run.cancelled":
      case "thread.run.expired":
        T(this, qe, "m", Td).call(this, e);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, qe, "m", Rd).call(this, e);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, qe, "m", Pd).call(this, e);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    }
}, Fn = function() {
  if (this.ended)
    throw new ne("stream has ended, this shouldn't happen");
  if (!T(this, Or, "f"))
    throw Error("Final run has not been received");
  return T(this, Or, "f");
}, Pd = function(e) {
  const [r, n] = T(this, qe, "m", Nd).call(this, e, T(this, wt, "f"));
  re(this, wt, r), T(this, Qs, "f")[r.id] = r;
  for (const s of n) {
    const a = r.content[s.index];
    (a == null ? void 0 : a.type) == "text" && this._emit("textCreated", a.text);
  }
  switch (e.event) {
    case "thread.message.created":
      this._emit("messageCreated", e.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", e.data.delta, r), e.data.delta.content)
        for (const s of e.data.delta.content) {
          if (s.type == "text" && s.text) {
            let a = s.text, o = r.content[s.index];
            if (o && o.type == "text")
              this._emit("textDelta", a, o.text);
            else
              throw Error("The snapshot associated with this text delta is not text or missing");
          }
          if (s.index != T(this, Xr, "f")) {
            if (T(this, Rr, "f"))
              switch (T(this, Rr, "f").type) {
                case "text":
                  this._emit("textDone", T(this, Rr, "f").text, T(this, wt, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", T(this, Rr, "f").image_file, T(this, wt, "f"));
                  break;
              }
            re(this, Xr, s.index);
          }
          re(this, Rr, r.content[s.index]);
        }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, Xr, "f") !== void 0) {
        const s = e.data.content[T(this, Xr, "f")];
        if (s)
          switch (s.type) {
            case "image_file":
              this._emit("imageFileDone", s.image_file, T(this, wt, "f"));
              break;
            case "text":
              this._emit("textDone", s.text, T(this, wt, "f"));
              break;
          }
      }
      T(this, wt, "f") && this._emit("messageDone", e.data), re(this, wt, void 0);
  }
}, Rd = function(e) {
  const r = T(this, qe, "m", Od).call(this, e);
  switch (re(this, Xn, r), e.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", e.data);
      break;
    case "thread.run.step.delta":
      const n = e.data.delta;
      if (n.step_details && n.step_details.type == "tool_calls" && n.step_details.tool_calls && r.step_details.type == "tool_calls")
        for (const a of n.step_details.tool_calls)
          a.index == T(this, va, "f") ? this._emit("toolCallDelta", a, r.step_details.tool_calls[a.index]) : (T(this, lt, "f") && this._emit("toolCallDone", T(this, lt, "f")), re(this, va, a.index), re(this, lt, r.step_details.tool_calls[a.index]), T(this, lt, "f") && this._emit("toolCallCreated", T(this, lt, "f")));
      this._emit("runStepDelta", e.data.delta, r);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      re(this, Xn, void 0), e.data.step_details.type == "tool_calls" && T(this, lt, "f") && (this._emit("toolCallDone", T(this, lt, "f")), re(this, lt, void 0)), this._emit("runStepDone", e.data, r);
      break;
  }
}, Id = function(e) {
  T(this, Zo, "f").push(e), this._emit("event", e);
}, Od = function(e) {
  switch (e.event) {
    case "thread.run.step.created":
      return T(this, At, "f")[e.data.id] = e.data, e.data;
    case "thread.run.step.delta":
      let r = T(this, At, "f")[e.data.id];
      if (!r)
        throw Error("Received a RunStepDelta before creation of a snapshot");
      let n = e.data;
      if (n.delta) {
        const s = Ir.accumulateDelta(r, n.delta);
        T(this, At, "f")[e.data.id] = s;
      }
      return T(this, At, "f")[e.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      T(this, At, "f")[e.data.id] = e.data;
      break;
  }
  if (T(this, At, "f")[e.data.id])
    return T(this, At, "f")[e.data.id];
  throw new Error("No snapshot available");
}, Nd = function(e, r) {
  let n = [];
  switch (e.event) {
    case "thread.message.created":
      return [e.data, n];
    case "thread.message.delta":
      if (!r)
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = e.data;
      if (s.delta.content)
        for (const a of s.delta.content)
          if (a.index in r.content) {
            let o = r.content[a.index];
            r.content[a.index] = T(this, qe, "m", Ad).call(this, a, o);
          } else
            r.content[a.index] = a, n.push(a);
      return [r, n];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (r)
        return [r, n];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Ad = function(e, r) {
  return Ir.accumulateDelta(r, e);
}, Td = function(e) {
  switch (re(this, ea, e.data), e.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete":
      re(this, Or, e.data), T(this, lt, "f") && (this._emit("toolCallDone", T(this, lt, "f")), re(this, lt, void 0));
      break;
  }
};
let ml = class extends se {
  constructor() {
    super(...arguments), this.steps = new Om(this._client);
  }
  create(e, r, n) {
    const { include: s, ...a } = r;
    return this._client.post(q`/threads/${e}/runs`, {
      query: { include: s },
      body: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]),
      stream: r.stream ?? !1
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s } = r;
    return this._client.get(q`/threads/${s}/runs/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(q`/threads/${s}/runs/${e}`, {
      body: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of runs belonging to a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/threads/${e}/runs`, Oe, {
      query: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(e, r, n) {
    const { thread_id: s } = r;
    return this._client.post(q`/threads/${s}/runs/${e}/cancel`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r, n);
    return await this.poll(s.id, { thread_id: e }, n);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(e, r, n) {
    return Yn.createAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(e, r, n) {
    var a;
    const s = Z([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(e, r, {
        ...n,
        headers: { ...n == null ? void 0 : n.headers, ...s }
      }).withResponse();
      switch (o.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = i.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await os(c);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return o;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(e, r, n) {
    return Yn.createAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
  submitToolOutputs(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(q`/threads/${s}/runs/${e}/submit_tool_outputs`, {
      body: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]),
      stream: r.stream ?? !1
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(e, r, n) {
    const s = await this.submitToolOutputs(e, r, n);
    return await this.poll(s.id, r, n);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(e, r, n) {
    return Yn.createToolAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
};
ml.Steps = Om;
class Ga extends se {
  constructor() {
    super(...arguments), this.runs = new ml(this._client), this.messages = new Im(this._client);
  }
  /**
   * Create a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(e = {}, r) {
    return this._client.post("/threads", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r) {
    return this._client.get(q`/threads/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    return this._client.post(q`/threads/${e}`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(e, r) {
    return this._client.delete(q`/threads/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  createAndRun(e, r) {
    return this._client.post("/threads/runs", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers]),
      stream: e.stream ?? !1
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(e, r) {
    const n = await this.createAndRun(e, r);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, r);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(e, r) {
    return Yn.createThreadAssistantStream(e, this._client.beta.threads, r);
  }
}
Ga.Runs = ml;
Ga.Messages = Im;
class ls extends se {
  constructor() {
    super(...arguments), this.realtime = new Ka(this._client), this.assistants = new Sm(this._client), this.threads = new Ga(this._client);
  }
}
ls.Realtime = Ka;
ls.Assistants = Sm;
ls.Threads = Ga;
class Nm extends se {
  create(e, r) {
    return this._client.post("/completions", { body: e, ...r, stream: e.stream ?? !1 });
  }
}
class Am extends se {
  /**
   * Retrieve Container File Content
   */
  retrieve(e, r, n) {
    const { container_id: s } = r;
    return this._client.get(q`/containers/${s}/files/${e}/content`, {
      ...n,
      headers: Z([{ Accept: "application/binary" }, n == null ? void 0 : n.headers]),
      __binaryResponse: !0
    });
  }
}
let pl = class extends se {
  constructor() {
    super(...arguments), this.content = new Am(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(e, r, n) {
    return this._client.post(q`/containers/${e}/files`, Cr({ body: r, ...n }, this._client));
  }
  /**
   * Retrieve Container File
   */
  retrieve(e, r, n) {
    const { container_id: s } = r;
    return this._client.get(q`/containers/${s}/files/${e}`, n);
  }
  /**
   * List Container files
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/containers/${e}/files`, Oe, {
      query: r,
      ...n
    });
  }
  /**
   * Delete Container File
   */
  delete(e, r, n) {
    const { container_id: s } = r;
    return this._client.delete(q`/containers/${s}/files/${e}`, {
      ...n,
      headers: Z([{ Accept: "*/*" }, n == null ? void 0 : n.headers])
    });
  }
};
pl.Content = Am;
class yl extends se {
  constructor() {
    super(...arguments), this.files = new pl(this._client);
  }
  /**
   * Create Container
   */
  create(e, r) {
    return this._client.post("/containers", { body: e, ...r });
  }
  /**
   * Retrieve Container
   */
  retrieve(e, r) {
    return this._client.get(q`/containers/${e}`, r);
  }
  /**
   * List Containers
   */
  list(e = {}, r) {
    return this._client.getAPIList("/containers", Oe, { query: e, ...r });
  }
  /**
   * Delete Container
   */
  delete(e, r) {
    return this._client.delete(q`/containers/${e}`, {
      ...r,
      headers: Z([{ Accept: "*/*" }, r == null ? void 0 : r.headers])
    });
  }
}
yl.Files = pl;
class Tm extends se {
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(e, r) {
    const n = !!e.encoding_format;
    let s = n ? e.encoding_format : "base64";
    n && Ue(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const a = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: s
      },
      ...r
    });
    return n ? a : (Ue(this._client).debug("embeddings/decoding base64 embeddings from base64"), a._thenUnwrap((o) => (o && o.data && o.data.forEach((i) => {
      const c = i.embedding;
      i.embedding = NO(c);
    }), o)));
  }
}
class km extends se {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(e, r, n) {
    const { eval_id: s, run_id: a } = r;
    return this._client.get(q`/evals/${s}/runs/${a}/output_items/${e}`, n);
  }
  /**
   * Get a list of output items for an evaluation run.
   */
  list(e, r, n) {
    const { eval_id: s, ...a } = r;
    return this._client.getAPIList(q`/evals/${s}/runs/${e}/output_items`, Oe, { query: a, ...n });
  }
}
class $l extends se {
  constructor() {
    super(...arguments), this.outputItems = new km(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(e, r, n) {
    return this._client.post(q`/evals/${e}/runs`, { body: r, ...n });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(e, r, n) {
    const { eval_id: s } = r;
    return this._client.get(q`/evals/${s}/runs/${e}`, n);
  }
  /**
   * Get a list of runs for an evaluation.
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/evals/${e}/runs`, Oe, {
      query: r,
      ...n
    });
  }
  /**
   * Delete an eval run.
   */
  delete(e, r, n) {
    const { eval_id: s } = r;
    return this._client.delete(q`/evals/${s}/runs/${e}`, n);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(e, r, n) {
    const { eval_id: s } = r;
    return this._client.post(q`/evals/${s}/runs/${e}`, n);
  }
}
$l.OutputItems = km;
class gl extends se {
  constructor() {
    super(...arguments), this.runs = new $l(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(e, r) {
    return this._client.post("/evals", { body: e, ...r });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(e, r) {
    return this._client.get(q`/evals/${e}`, r);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(e, r, n) {
    return this._client.post(q`/evals/${e}`, { body: r, ...n });
  }
  /**
   * List evaluations for a project.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/evals", Oe, { query: e, ...r });
  }
  /**
   * Delete an evaluation.
   */
  delete(e, r) {
    return this._client.delete(q`/evals/${e}`, r);
  }
}
gl.Runs = $l;
let Cm = class extends se {
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and the size of all files uploaded by one organization can be up
   * to 100 GB.
   *
   * The Assistants API supports files up to 2 million tokens and of specific file
   * types. See the
   * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
   * details.
   *
   * The Fine-tuning API only supports `.jsonl` files. The input also has certain
   * required formats for fine-tuning
   * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
   * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   * models.
   *
   * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
   * has a specific required
   * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(e, r) {
    return this._client.post("/files", Cr({ body: e, ...r }, this._client));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(e, r) {
    return this._client.get(q`/files/${e}`, r);
  }
  /**
   * Returns a list of files.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/files", Oe, { query: e, ...r });
  }
  /**
   * Delete a file.
   */
  delete(e, r) {
    return this._client.delete(q`/files/${e}`, r);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(e, r) {
    return this._client.get(q`/files/${e}/content`, {
      ...r,
      headers: Z([{ Accept: "application/binary" }, r == null ? void 0 : r.headers]),
      __binaryResponse: !0
    });
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(e, { pollInterval: r = 5e3, maxWait: n = 30 * 60 * 1e3 } = {}) {
    const s = /* @__PURE__ */ new Set(["processed", "error", "deleted"]), a = Date.now();
    let o = await this.retrieve(e);
    for (; !o.status || !s.has(o.status); )
      if (await os(r), o = await this.retrieve(e), Date.now() - a > n)
        throw new ol({
          message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.`
        });
    return o;
  }
};
class jm extends se {
}
let Dm = class extends se {
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   * });
   * ```
   */
  run(e, r) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body: e, ...r });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(e, r) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body: e, ...r });
  }
};
class _l extends se {
  constructor() {
    super(...arguments), this.graders = new Dm(this._client);
  }
}
_l.Graders = Dm;
class Mm extends se {
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(e, r, n) {
    return this._client.getAPIList(q`/fine_tuning/checkpoints/${e}/permissions`, za, { body: r, method: "post", ...n });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to view all permissions for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.retrieve(
   *     'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   *   );
   * ```
   */
  retrieve(e, r = {}, n) {
    return this._client.get(q`/fine_tuning/checkpoints/${e}/permissions`, {
      query: r,
      ...n
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.delete(
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *     {
   *       fine_tuned_model_checkpoint:
   *         'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     },
   *   );
   * ```
   */
  delete(e, r, n) {
    const { fine_tuned_model_checkpoint: s } = r;
    return this._client.delete(q`/fine_tuning/checkpoints/${s}/permissions/${e}`, n);
  }
}
let vl = class extends se {
  constructor() {
    super(...arguments), this.permissions = new Mm(this._client);
  }
};
vl.Permissions = Mm;
class Lm extends se {
  /**
   * List checkpoints for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/fine_tuning/jobs/${e}/checkpoints`, Oe, { query: r, ...n });
  }
}
class wl extends se {
  constructor() {
    super(...arguments), this.checkpoints = new Lm(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(e, r) {
    return this._client.post("/fine_tuning/jobs", { body: e, ...r });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(e, r) {
    return this._client.get(q`/fine_tuning/jobs/${e}`, r);
  }
  /**
   * List your organization's fine-tuning jobs
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJob of client.fineTuning.jobs.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/fine_tuning/jobs", Oe, { query: e, ...r });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(e, r) {
    return this._client.post(q`/fine_tuning/jobs/${e}/cancel`, r);
  }
  /**
   * Get status updates for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobEvent of client.fineTuning.jobs.listEvents(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  listEvents(e, r = {}, n) {
    return this._client.getAPIList(q`/fine_tuning/jobs/${e}/events`, Oe, { query: r, ...n });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(e, r) {
    return this._client.post(q`/fine_tuning/jobs/${e}/pause`, r);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(e, r) {
    return this._client.post(q`/fine_tuning/jobs/${e}/resume`, r);
  }
}
wl.Checkpoints = Lm;
class pn extends se {
  constructor() {
    super(...arguments), this.methods = new jm(this._client), this.jobs = new wl(this._client), this.checkpoints = new vl(this._client), this.alpha = new _l(this._client);
  }
}
pn.Methods = jm;
pn.Jobs = wl;
pn.Checkpoints = vl;
pn.Alpha = _l;
class Fm extends se {
}
class bl extends se {
  constructor() {
    super(...arguments), this.graderModels = new Fm(this._client);
  }
}
bl.GraderModels = Fm;
class Vm extends se {
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(e, r) {
    return this._client.post("/images/variations", Cr({ body: e, ...r }, this._client));
  }
  edit(e, r) {
    return this._client.post("/images/edits", Cr({ body: e, ...r, stream: e.stream ?? !1 }, this._client));
  }
  generate(e, r) {
    return this._client.post("/images/generations", { body: e, ...r, stream: e.stream ?? !1 });
  }
}
class Um extends se {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(e, r) {
    return this._client.get(q`/models/${e}`, r);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(e) {
    return this._client.getAPIList("/models", za, e);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  delete(e, r) {
    return this._client.delete(q`/models/${e}`, r);
  }
}
class qm extends se {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(e, r) {
    return this._client.post("/moderations", { body: e, ...r });
  }
}
function AO(t, e) {
  return !e || !kO(e) ? {
    ...t,
    output_parsed: null,
    output: t.output.map((r) => r.type === "function_call" ? {
      ...r,
      parsed_arguments: null
    } : r.type === "message" ? {
      ...r,
      content: r.content.map((n) => ({
        ...n,
        parsed: null
      }))
    } : r)
  } : xm(t, e);
}
function xm(t, e) {
  const r = t.output.map((s) => {
    if (s.type === "function_call")
      return {
        ...s,
        parsed_arguments: DO(e, s)
      };
    if (s.type === "message") {
      const a = s.content.map((o) => o.type === "output_text" ? {
        ...o,
        parsed: TO(e, o.text)
      } : o);
      return {
        ...s,
        content: a
      };
    }
    return s;
  }), n = Object.assign({}, t, { output: r });
  return Object.getOwnPropertyDescriptor(t, "output_text") || ei(n), Object.defineProperty(n, "output_parsed", {
    enumerable: !0,
    get() {
      for (const s of n.output)
        if (s.type === "message") {
          for (const a of s.content)
            if (a.type === "output_text" && a.parsed !== null)
              return a.parsed;
        }
      return null;
    }
  }), n;
}
function TO(t, e) {
  var r, n, s, a;
  return ((n = (r = t.text) == null ? void 0 : r.format) == null ? void 0 : n.type) !== "json_schema" ? null : "$parseRaw" in ((s = t.text) == null ? void 0 : s.format) ? ((a = t.text) == null ? void 0 : a.format).$parseRaw(e) : JSON.parse(e);
}
function kO(t) {
  var e;
  return !!ll((e = t.text) == null ? void 0 : e.format);
}
function CO(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-tool";
}
function jO(t, e) {
  return t.find((r) => r.type === "function" && r.name === e);
}
function DO(t, e) {
  const r = jO(t.tools ?? [], e.name);
  return {
    ...e,
    ...e,
    parsed_arguments: CO(r) ? r.$parseRaw(e.arguments) : r != null && r.strict ? JSON.parse(e.arguments) : null
  };
}
function ei(t) {
  const e = [];
  for (const r of t.output)
    if (r.type === "message")
      for (const n of r.content)
        n.type === "output_text" && e.push(n.text);
  t.output_text = e.join("");
}
var xr, Ds, ar, Ms, kd, Cd, jd, Dd;
class El extends cl {
  constructor(e) {
    super(), xr.add(this), Ds.set(this, void 0), ar.set(this, void 0), Ms.set(this, void 0), re(this, Ds, e);
  }
  static createResponse(e, r, n) {
    const s = new El(r);
    return s._run(() => s._createOrRetrieveResponse(e, r, {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" }
    })), s;
  }
  async _createOrRetrieveResponse(e, r, n) {
    var i;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), T(this, xr, "m", kd).call(this);
    let a, o = null;
    "response_id" in r ? (a = await e.responses.retrieve(r.response_id, { stream: !0 }, { ...n, signal: this.controller.signal, stream: !0 }), o = r.starting_after ?? null) : a = await e.responses.create({ ...r, stream: !0 }, { ...n, signal: this.controller.signal }), this._connected();
    for await (const c of a)
      T(this, xr, "m", Cd).call(this, c, o);
    if ((i = a.controller.signal) != null && i.aborted)
      throw new mt();
    return T(this, xr, "m", jd).call(this);
  }
  [(Ds = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), Ms = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakSet(), kd = function() {
    this.ended || re(this, ar, void 0);
  }, Cd = function(r, n) {
    if (this.ended)
      return;
    const s = (o, i) => {
      (n == null || i.sequence_number > n) && this._emit(o, i);
    }, a = T(this, xr, "m", Dd).call(this, r);
    switch (s("event", r), r.type) {
      case "response.output_text.delta": {
        const o = a.output[r.output_index];
        if (!o)
          throw new ne(`missing output at index ${r.output_index}`);
        if (o.type === "message") {
          const i = o.content[r.content_index];
          if (!i)
            throw new ne(`missing content at index ${r.content_index}`);
          if (i.type !== "output_text")
            throw new ne(`expected content to be 'output_text', got ${i.type}`);
          s("response.output_text.delta", {
            ...r,
            snapshot: i.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = a.output[r.output_index];
        if (!o)
          throw new ne(`missing output at index ${r.output_index}`);
        o.type === "function_call" && s("response.function_call_arguments.delta", {
          ...r,
          snapshot: o.arguments
        });
        break;
      }
      default:
        s(r.type, r);
        break;
    }
  }, jd = function() {
    if (this.ended)
      throw new ne("stream has ended, this shouldn't happen");
    const r = T(this, ar, "f");
    if (!r)
      throw new ne("request ended without sending any events");
    re(this, ar, void 0);
    const n = MO(r, T(this, Ds, "f"));
    return re(this, Ms, n), n;
  }, Dd = function(r) {
    let n = T(this, ar, "f");
    if (!n) {
      if (r.type !== "response.created")
        throw new ne(`When snapshot hasn't been set yet, expected 'response.created' event, got ${r.type}`);
      return n = re(this, ar, r.response), n;
    }
    switch (r.type) {
      case "response.output_item.added": {
        n.output.push(r.item);
        break;
      }
      case "response.content_part.added": {
        const s = n.output[r.output_index];
        if (!s)
          throw new ne(`missing output at index ${r.output_index}`);
        s.type === "message" && s.content.push(r.part);
        break;
      }
      case "response.output_text.delta": {
        const s = n.output[r.output_index];
        if (!s)
          throw new ne(`missing output at index ${r.output_index}`);
        if (s.type === "message") {
          const a = s.content[r.content_index];
          if (!a)
            throw new ne(`missing content at index ${r.content_index}`);
          if (a.type !== "output_text")
            throw new ne(`expected content to be 'output_text', got ${a.type}`);
          a.text += r.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = n.output[r.output_index];
        if (!s)
          throw new ne(`missing output at index ${r.output_index}`);
        s.type === "function_call" && (s.arguments += r.delta);
        break;
      }
      case "response.completed": {
        re(this, ar, r.response);
        break;
      }
    }
    return n;
  }, Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("event", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const e = T(this, Ms, "f");
    if (!e)
      throw new ne("stream ended without producing a ChatCompletion");
    return e;
  }
}
function MO(t, e) {
  return AO(t, e);
}
class zm extends se {
  /**
   * Returns a list of input items for a given response.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const responseItem of client.responses.inputItems.list(
   *   'response_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/responses/${e}/input_items`, Oe, { query: r, ...n });
  }
}
class Sl extends se {
  constructor() {
    super(...arguments), this.inputItems = new zm(this._client);
  }
  create(e, r) {
    return this._client.post("/responses", { body: e, ...r, stream: e.stream ?? !1 })._thenUnwrap((n) => ("object" in n && n.object === "response" && ei(n), n));
  }
  retrieve(e, r = {}, n) {
    return this._client.get(q`/responses/${e}`, {
      query: r,
      ...n,
      stream: (r == null ? void 0 : r.stream) ?? !1
    })._thenUnwrap((s) => ("object" in s && s.object === "response" && ei(s), s));
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.delete(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  delete(e, r) {
    return this._client.delete(q`/responses/${e}`, {
      ...r,
      headers: Z([{ Accept: "*/*" }, r == null ? void 0 : r.headers])
    });
  }
  parse(e, r) {
    return this._client.responses.create(e, r)._thenUnwrap((n) => xm(n, e));
  }
  /**
   * Creates a model response stream
   */
  stream(e, r) {
    return El.createResponse(this._client, e, r);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * const response = await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(e, r) {
    return this._client.post(q`/responses/${e}/cancel`, r);
  }
}
Sl.InputItems = zm;
class Km extends se {
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(e, r, n) {
    return this._client.post(q`/uploads/${e}/parts`, Cr({ body: r, ...n }, this._client));
  }
}
class Pl extends se {
  constructor() {
    super(...arguments), this.parts = new Km(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(e, r) {
    return this._client.post("/uploads", { body: e, ...r });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(e, r) {
    return this._client.post(q`/uploads/${e}/cancel`, r);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(e, r, n) {
    return this._client.post(q`/uploads/${e}/complete`, { body: r, ...n });
  }
}
Pl.Parts = Km;
const LO = async (t) => {
  const e = await Promise.allSettled(t), r = e.filter((s) => s.status === "rejected");
  if (r.length) {
    for (const s of r)
      console.error(s.reason);
    throw new Error(`${r.length} promise(s) failed - see the above errors`);
  }
  const n = [];
  for (const s of e)
    s.status === "fulfilled" && n.push(s.value);
  return n;
};
class Gm extends se {
  /**
   * Create a vector store file batch.
   */
  create(e, r, n) {
    return this._client.post(q`/vector_stores/${e}/file_batches`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.get(q`/vector_stores/${s}/file_batches/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.post(q`/vector_stores/${s}/file_batches/${e}/cancel`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r);
    return await this.poll(e, s.id, n);
  }
  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(e, r, n) {
    const { vector_store_id: s, ...a } = r;
    return this._client.getAPIList(q`/vector_stores/${s}/file_batches/${e}/files`, Oe, { query: a, ...n, headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]) });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(e, r, n) {
    var a;
    const s = Z([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(r, { vector_store_id: e }, {
        ...n,
        headers: s
      }).withResponse();
      switch (o.status) {
        case "in_progress":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = i.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await os(c);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return o;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(e, { files: r, fileIds: n = [] }, s) {
    if (r == null || r.length == 0)
      throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const a = (s == null ? void 0 : s.maxConcurrency) ?? 5, o = Math.min(a, r.length), i = this._client, c = r.values(), d = [...n];
    async function l(_) {
      for (let m of _) {
        const g = await i.files.create({ file: m, purpose: "assistants" }, s);
        d.push(g.id);
      }
    }
    const f = Array(o).fill(c).map(l);
    return await LO(f), await this.createAndPoll(e, {
      file_ids: d
    });
  }
}
class Bm extends se {
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(e, r, n) {
    return this._client.post(q`/vector_stores/${e}/files`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.get(q`/vector_stores/${s}/files/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(e, r, n) {
    const { vector_store_id: s, ...a } = r;
    return this._client.post(q`/vector_stores/${s}/files/${e}`, {
      body: a,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of vector store files.
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(q`/vector_stores/${e}/files`, Oe, {
      query: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  delete(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.delete(q`/vector_stores/${s}/files/${e}`, {
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r, n);
    return await this.poll(e, s.id, n);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(e, r, n) {
    var a;
    const s = Z([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const o = await this.retrieve(r, {
        vector_store_id: e
      }, { ...n, headers: s }).withResponse(), i = o.data;
      switch (i.status) {
        case "in_progress":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = o.response.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await os(c);
          break;
        case "failed":
        case "completed":
          return i;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(e, r, n) {
    const s = await this._client.files.create({ file: r, purpose: "assistants" }, n);
    return this.create(e, { file_id: s.id }, n);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(e, r, n) {
    const s = await this.upload(e, r, n);
    return await this.poll(e, s.id, n);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.getAPIList(q`/vector_stores/${s}/files/${e}/content`, za, { ...n, headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]) });
  }
}
class Ba extends se {
  constructor() {
    super(...arguments), this.files = new Bm(this._client), this.fileBatches = new Gm(this._client);
  }
  /**
   * Create a vector store.
   */
  create(e, r) {
    return this._client.post("/vector_stores", {
      body: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(e, r) {
    return this._client.get(q`/vector_stores/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies a vector store.
   */
  update(e, r, n) {
    return this._client.post(q`/vector_stores/${e}`, {
      body: r,
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of vector stores.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/vector_stores", Oe, {
      query: e,
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Delete a vector store.
   */
  delete(e, r) {
    return this._client.delete(q`/vector_stores/${e}`, {
      ...r,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(e, r, n) {
    return this._client.getAPIList(q`/vector_stores/${e}/search`, za, {
      body: r,
      method: "post",
      ...n,
      headers: Z([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
Ba.Files = Bm;
Ba.FileBatches = Gm;
var Hr, Hm, ta;
class Wm extends se {
  constructor() {
    super(...arguments), Hr.add(this);
  }
  /**
   * Validates that the given payload was sent by OpenAI and parses the payload.
   */
  async unwrap(e, r, n = this._client.webhookSecret, s = 300) {
    return await this.verifySignature(e, r, n, s), JSON.parse(e);
  }
  /**
   * Validates whether or not the webhook payload was sent by OpenAI.
   *
   * An error will be raised if the webhook payload was not sent by OpenAI.
   *
   * @param payload - The webhook payload
   * @param headers - The webhook headers
   * @param secret - The webhook secret (optional, will use client secret if not provided)
   * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
   */
  async verifySignature(e, r, n = this._client.webhookSecret, s = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function")
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, Hr, "m", Hm).call(this, n);
    const a = Z([r]).values, o = T(this, Hr, "m", ta).call(this, a, "webhook-signature"), i = T(this, Hr, "m", ta).call(this, a, "webhook-timestamp"), c = T(this, Hr, "m", ta).call(this, a, "webhook-id"), d = parseInt(i, 10);
    if (isNaN(d))
      throw new An("Invalid webhook timestamp format");
    const l = Math.floor(Date.now() / 1e3);
    if (l - d > s)
      throw new An("Webhook timestamp is too old");
    if (d > l + s)
      throw new An("Webhook timestamp is too new");
    const f = o.split(" ").map((y) => y.startsWith("v1,") ? y.substring(3) : y), _ = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), m = c ? `${c}.${i}.${e}` : `${i}.${e}`, g = await crypto.subtle.importKey("raw", _, { name: "HMAC", hash: "SHA-256" }, !1, ["verify"]);
    for (const y of f)
      try {
        const $ = Buffer.from(y, "base64");
        if (await crypto.subtle.verify("HMAC", g, $, new TextEncoder().encode(m)))
          return;
      } catch {
        continue;
      }
    throw new An("The given webhook signature does not match the expected signature");
  }
}
Hr = /* @__PURE__ */ new WeakSet(), Hm = function(e) {
  if (typeof e != "string" || e.length === 0)
    throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, ta = function(e, r) {
  if (!e)
    throw new Error("Headers are required");
  const n = e.get(r);
  if (n == null)
    throw new Error(`Missing required header: ${r}`);
  return n;
};
var ti, Rl, ra, Jm;
class $e {
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL: e = qr("OPENAI_BASE_URL"), apiKey: r = qr("OPENAI_API_KEY"), organization: n = qr("OPENAI_ORG_ID") ?? null, project: s = qr("OPENAI_PROJECT_ID") ?? null, webhookSecret: a = qr("OPENAI_WEBHOOK_SECRET") ?? null, ...o } = {}) {
    if (ti.add(this), ra.set(this, void 0), this.completions = new Nm(this), this.chat = new hl(this), this.embeddings = new Tm(this), this.files = new Cm(this), this.images = new Vm(this), this.audio = new cs(this), this.moderations = new qm(this), this.models = new Um(this), this.fineTuning = new pn(this), this.graders = new bl(this), this.vectorStores = new Ba(this), this.webhooks = new Wm(this), this.beta = new ls(this), this.batches = new Em(this), this.uploads = new Pl(this), this.responses = new Sl(this), this.evals = new gl(this), this.containers = new yl(this), r === void 0)
      throw new ne("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    const i = {
      apiKey: r,
      organization: n,
      project: s,
      webhookSecret: a,
      ...o,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!i.dangerouslyAllowBrowser && FI())
      throw new ne(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? Rl.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = _d(i.logLevel, "ClientOptions.logLevel", this) ?? _d(qr("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? zI(), re(this, ra, GI), this._options = i, this.apiKey = r, this.organization = n, this.project = s, this.webhookSecret = a;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: r }) {
  }
  async authHeaders(e) {
    return Z([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return YI(e, { arrayFormat: "brackets" });
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Gr}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ih()}`;
  }
  makeStatusError(e, r, n, s) {
    return Ke.generate(e, r, n, s);
  }
  buildURL(e, r, n) {
    const s = !T(this, ti, "m", Jm).call(this) && n || this.baseURL, a = kI(e) ? new URL(e) : new URL(s + (s.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery();
    return jI(o) || (r = { ...o, ...r }), typeof r == "object" && r && !Array.isArray(r) && (a.search = this.stringifyQuery(r)), a.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(e) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(e, { url: r, options: n }) {
  }
  get(e, r) {
    return this.methodRequest("get", e, r);
  }
  post(e, r) {
    return this.methodRequest("post", e, r);
  }
  patch(e, r) {
    return this.methodRequest("patch", e, r);
  }
  put(e, r) {
    return this.methodRequest("put", e, r);
  }
  delete(e, r) {
    return this.methodRequest("delete", e, r);
  }
  methodRequest(e, r, n) {
    return this.request(Promise.resolve(n).then((s) => ({ method: e, path: r, ...s })));
  }
  request(e, r = null) {
    return new xa(this, this.makeRequest(e, r, void 0));
  }
  async makeRequest(e, r, n) {
    var p, w;
    const s = await e, a = s.maxRetries ?? this.maxRetries;
    r == null && (r = a), await this.prepareOptions(s);
    const { req: o, url: i, timeout: c } = await this.buildRequest(s, {
      retryCount: a - r
    });
    await this.prepareRequest(o, { url: i, options: s });
    const d = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), l = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (Ue(this).debug(`[${d}] sending request`, _r({
      retryOfRequestLogID: n,
      method: s.method,
      url: i,
      options: s,
      headers: o.headers
    })), (p = s.signal) != null && p.aborted)
      throw new mt();
    const _ = new AbortController(), m = await this.fetchWithTimeout(i, o, c, _).catch(Ko), g = Date.now();
    if (m instanceof Error) {
      const S = `retrying, ${r} attempts remaining`;
      if ((w = s.signal) != null && w.aborted)
        throw new mt();
      const R = zo(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (r)
        return Ue(this).info(`[${d}] connection ${R ? "timed out" : "failed"} - ${S}`), Ue(this).debug(`[${d}] connection ${R ? "timed out" : "failed"} (${S})`, _r({
          retryOfRequestLogID: n,
          url: i,
          durationMs: g - f,
          message: m.message
        })), this.retryRequest(s, r, n ?? d);
      throw Ue(this).info(`[${d}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), Ue(this).debug(`[${d}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, _r({
        retryOfRequestLogID: n,
        url: i,
        durationMs: g - f,
        message: m.message
      })), R ? new ol() : new Ua({ cause: m });
    }
    const y = [...m.headers.entries()].filter(([S]) => S === "x-request-id").map(([S, R]) => ", " + S + ": " + JSON.stringify(R)).join(""), $ = `[${d}${l}${y}] ${o.method} ${i} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - f}ms`;
    if (!m.ok) {
      const S = await this.shouldRetry(m);
      if (r && S) {
        const te = `retrying, ${r} attempts remaining`;
        return await KI(m.body), Ue(this).info(`${$} - ${te}`), Ue(this).debug(`[${d}] response error (${te})`, _r({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - f
        })), this.retryRequest(s, r, n ?? d, m.headers);
      }
      const R = S ? "error; no more retries left" : "error; not retryable";
      Ue(this).info(`${$} - ${R}`);
      const A = await m.text().catch((te) => Ko(te).message), F = LI(A), V = F ? void 0 : A;
      throw Ue(this).debug(`[${d}] response error (${R})`, _r({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: V,
        durationMs: Date.now() - f
      })), this.makeStatusError(m.status, F, V, m.headers);
    }
    return Ue(this).info($), Ue(this).debug(`[${d}] response start`, _r({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - f
    })), { response: m, options: s, controller: _, requestLogID: d, retryOfRequestLogID: n, startTime: f };
  }
  getAPIList(e, r, n) {
    return this.requestAPIList(r, { method: "get", path: e, ...n });
  }
  requestAPIList(e, r) {
    const n = this.makeRequest(r, null, void 0);
    return new oO(this, n, e);
  }
  async fetchWithTimeout(e, r, n, s) {
    const { signal: a, method: o, ...i } = r || {};
    a && a.addEventListener("abort", () => s.abort());
    const c = setTimeout(() => s.abort(), n), d = globalThis.ReadableStream && i.body instanceof globalThis.ReadableStream || typeof i.body == "object" && i.body !== null && Symbol.asyncIterator in i.body, l = {
      signal: s.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...i
    };
    o && (l.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, l);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const r = e.headers.get("x-should-retry");
    return r === "true" ? !0 : r === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, r, n, s) {
    let a;
    const o = s == null ? void 0 : s.get("retry-after-ms");
    if (o) {
      const c = parseFloat(o);
      Number.isNaN(c) || (a = c);
    }
    const i = s == null ? void 0 : s.get("retry-after");
    if (i && !a) {
      const c = parseFloat(i);
      Number.isNaN(c) ? a = Date.parse(i) - Date.now() : a = c * 1e3;
    }
    if (!(a && 0 <= a && a < 60 * 1e3)) {
      const c = e.maxRetries ?? this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(r, c);
    }
    return await os(a), this.makeRequest(e, r - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, r) {
    const a = r - e, o = Math.min(0.5 * Math.pow(2, a), 8), i = 1 - Math.random() * 0.25;
    return o * i * 1e3;
  }
  async buildRequest(e, { retryCount: r = 0 } = {}) {
    const n = { ...e }, { method: s, path: a, query: o, defaultBaseURL: i } = n, c = this.buildURL(a, o, i);
    "timeout" in n && MI("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: d, body: l } = this.buildBody({ options: n }), f = await this.buildHeaders({ options: e, method: s, bodyHeaders: d, retryCount: r });
    return { req: {
      method: s,
      headers: f,
      ...n.signal && { signal: n.signal },
      ...globalThis.ReadableStream && l instanceof globalThis.ReadableStream && { duplex: "half" },
      ...l && { body: l },
      ...this.fetchOptions ?? {},
      ...n.fetchOptions ?? {}
    }, url: c, timeout: n.timeout };
  }
  async buildHeaders({ options: e, method: r, bodyHeaders: n, retryCount: s }) {
    let a = {};
    this.idempotencyHeader && r !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), a[this.idempotencyHeader] = e.idempotencyKey);
    const o = Z([
      a,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(s),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...xI(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(o), o.values;
  }
  buildBody({ options: { body: e, headers: r } }) {
    if (!e)
      return { bodyHeaders: void 0, body: void 0 };
    const n = Z([r]);
    return (
      // Pass raw type verbatim
      ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && // Preserve legacy string encoding behavior for now
      n.values.has("content-type") || // `Blob` is superset of `File`
      e instanceof Blob || // `FormData` -> `multipart/form-data`
      e instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      e instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? { bodyHeaders: void 0, body: e } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? { bodyHeaders: void 0, body: Vh(e) } : T(this, ra, "f").call(this, { body: e, headers: n })
    );
  }
}
Rl = $e, ra = /* @__PURE__ */ new WeakMap(), ti = /* @__PURE__ */ new WeakSet(), Jm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
$e.OpenAI = Rl;
$e.DEFAULT_TIMEOUT = 6e5;
$e.OpenAIError = ne;
$e.APIError = Ke;
$e.APIConnectionError = Ua;
$e.APIConnectionTimeoutError = ol;
$e.APIUserAbortError = mt;
$e.NotFoundError = Th;
$e.ConflictError = kh;
$e.RateLimitError = jh;
$e.BadRequestError = Oh;
$e.AuthenticationError = Nh;
$e.InternalServerError = Dh;
$e.PermissionDeniedError = Ah;
$e.UnprocessableEntityError = Ch;
$e.InvalidWebhookSignatureError = An;
$e.toFile = fO;
$e.Completions = Nm;
$e.Chat = hl;
$e.Embeddings = Tm;
$e.Files = Cm;
$e.Images = Vm;
$e.Audio = cs;
$e.Moderations = qm;
$e.Models = Um;
$e.FineTuning = pn;
$e.Graders = bl;
$e.VectorStores = Ba;
$e.Webhooks = Wm;
$e.Beta = ls;
$e.Batches = Em;
$e.Uploads = Pl;
$e.Responses = Sl;
$e.Evals = gl;
$e.Containers = yl;
class FO extends AI {
  constructor(r) {
    super();
    pr(this, "openai");
    this.openai = new $e({
      apiKey: r,
      dangerouslyAllowBrowser: !1
      // This will run in Node.js (Electron main process)
    });
  }
  getProvider() {
    return {
      id: "openai",
      name: "OpenAI",
      models: [
        {
          id: "whisper-1",
          name: "Whisper v1",
          description: "OpenAI Whisper model for general transcription"
        }
      ]
    };
  }
  async transcribe(r) {
    try {
      this.validateRequest(r), console.log("Starting OpenAI transcription for:", r.filePath);
      const n = await this.openai.audio.transcriptions.create({
        file: Vd.createReadStream(r.filePath),
        model: r.model || "whisper-1",
        response_format: "verbose_json",
        language: r.language || void 0
      });
      return console.log("OpenAI transcription completed successfully"), {
        success: !0,
        text: n.text,
        language: n.language || r.language,
        duration: n.duration
      };
    } catch (n) {
      console.error("OpenAI transcription error:", n);
      let s = "Erro desconhecido na transcrição";
      return n instanceof Error && (n.message.includes("401") || n.message.includes("Invalid API key") || n.message.includes("Unauthorized") ? s = "API key inválida. Verifique sua chave OpenAI no arquivo .env" : n.message.includes("402") || n.message.includes("quota") ? s = "Quota excedida. Verifique seu limite de uso da API OpenAI" : n.message.includes("429") || n.message.includes("rate limit") ? s = "Limite de taxa excedido. Tente novamente em alguns minutos" : n.message.includes("400") || n.message.includes("Bad Request") ? s = "Requisição inválida. Verifique o formato do arquivo de áudio" : n.message.includes("500") || n.message.includes("502") || n.message.includes("503") ? s = "Erro interno do servidor OpenAI. Tente novamente mais tarde" : s = n.message), {
        success: !1,
        error: s
      };
    }
  }
  // Test API key validity
  async testConnection() {
    try {
      return await this.openai.models.list(), { success: !0 };
    } catch (r) {
      console.error("OpenAI API key test failed:", r);
      let n = "Erro ao conectar com a API OpenAI";
      return r instanceof Error && (r.message.includes("401") || r.message.includes("Invalid API key") || r.message.includes("Unauthorized") ? n = "API key inválida. Verifique sua chave OpenAI no arquivo .env" : r.message.includes("402") || r.message.includes("quota") ? n = "Quota excedida. Verifique seu limite de uso da API OpenAI" : n = r.message), { success: !1, error: n };
    }
  }
}
class VO {
  constructor() {
    pr(this, "services", /* @__PURE__ */ new Map());
    this.initializeServices();
  }
  initializeServices() {
    const e = process.env.OPENAI_API_KEY;
    e && e !== "your_openai_api_key_here" && e.trim() !== "" && e.startsWith("sk-") && this.services.set("openai", new FO(e));
  }
  getAvailableProviders() {
    return Array.from(this.services.values()).map((e) => e.getProvider());
  }
  async transcribe(e) {
    const r = this.services.get(e.provider);
    return r ? r.transcribe(e) : {
      success: !1,
      error: `Provedor de transcrição '${e.provider}' não encontrado ou não configurado`
    };
  }
  isProviderAvailable(e) {
    return this.services.has(e);
  }
}
Op.config();
const Ha = new NI({
  name: "transcripto-data",
  defaults: {
    groups: [],
    selectedFileId: null,
    selectedGroupId: null,
    expandedGroups: []
  }
}), Xm = new VO(), Ym = he.dirname(np(import.meta.url));
Nl && Fd.setFfmpegPath(Nl);
async function UO(t, e) {
  return new Promise((r, n) => {
    const s = `${he.parse(t).name}_converted.mp3`, a = he.join(e, s);
    Fd(t).toFormat("mp3").audioBitrate(93).on("end", () => {
      console.log("Conversion finished successfully"), r(a);
    }).on("error", (o) => {
      console.error("Error during conversion:", o), n(o);
    }).save(a);
  });
}
process.env.APP_ROOT = he.join(Ym, "..");
const ri = process.env.VITE_DEV_SERVER_URL, fN = he.join(process.env.APP_ROOT, "dist-electron"), Qm = he.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ri ? he.join(process.env.APP_ROOT, "public") : Qm;
let zt;
function Zm() {
  zt = new Ld({
    icon: he.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: he.join(Ym, "preload.mjs")
    }
  }), zt.webContents.on("did-finish-load", () => {
    zt == null || zt.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ri ? zt.loadURL(ri) : zt.loadFile(he.join(Qm, "index.html"));
}
na.on("window-all-closed", () => {
  process.platform !== "darwin" && (na.quit(), zt = null);
});
na.on("activate", () => {
  Ld.getAllWindows().length === 0 && Zm();
});
Dt.handle("convert-audio", async (t, e) => {
  try {
    const r = sn.tmpdir();
    return { success: !0, outputPath: await UO(e, r) };
  } catch (r) {
    return console.error("Conversion error:", r), { success: !1, error: r instanceof Error ? r.message : "Unknown error" };
  }
});
Dt.handle("save-file-dialog", async () => await rp.showSaveDialog(zt, {
  filters: [{ name: "MP3 Files", extensions: ["mp3"] }],
  defaultPath: "converted_audio.mp3"
}));
Dt.handle("save-file-to-disk", async (t, e, r) => {
  try {
    const n = sn.tmpdir(), s = he.join(n, r);
    return await le.promises.writeFile(s, e), { success: !0, filePath: s };
  } catch (n) {
    return console.error("Error saving file to disk:", n), { success: !1, error: n instanceof Error ? n.message : "Unknown error" };
  }
});
Dt.handle("copy-file", async (t, e, r) => {
  try {
    return await le.promises.copyFile(e, r), { success: !0 };
  } catch (n) {
    return console.error("Error copying file:", n), { success: !1, error: n instanceof Error ? n.message : "Unknown error" };
  }
});
Dt.handle("get-transcription-providers", async () => {
  try {
    return { success: !0, providers: Xm.getAvailableProviders() };
  } catch (t) {
    return console.error("Error getting transcription providers:", t), { success: !1, error: t instanceof Error ? t.message : "Unknown error" };
  }
});
Dt.handle("transcribe-audio", async (t, e) => {
  try {
    return await Xm.transcribe(e);
  } catch (r) {
    return console.error("Error transcribing audio:", r), {
      success: !1,
      error: r instanceof Error ? r.message : "Unknown error"
    };
  }
});
Dt.handle("store-get", async (t, e) => {
  try {
    return { success: !0, data: Ha.get(e) };
  } catch (r) {
    return console.error("Error getting store data:", r), { success: !1, error: r instanceof Error ? r.message : "Unknown error" };
  }
});
Dt.handle("store-set", async (t, e, r) => {
  try {
    return Ha.set(e, r), { success: !0 };
  } catch (n) {
    return console.error("Error setting store data:", n), { success: !1, error: n instanceof Error ? n.message : "Unknown error" };
  }
});
Dt.handle("store-delete", async (t, e) => {
  try {
    return Ha.delete(e), { success: !0 };
  } catch (r) {
    return console.error("Error deleting store data:", r), { success: !1, error: r instanceof Error ? r.message : "Unknown error" };
  }
});
Dt.handle("store-clear", async () => {
  try {
    return Ha.clear(), { success: !0 };
  } catch (t) {
    return console.error("Error clearing store:", t), { success: !1, error: t instanceof Error ? t.message : "Unknown error" };
  }
});
na.whenReady().then(Zm);
export {
  fN as MAIN_DIST,
  Qm as RENDERER_DIST,
  ri as VITE_DEV_SERVER_URL
};
