var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path$2 from "node:path";
import fs$1 from "node:fs";
import os$1 from "node:os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import require$$0 from "fs";
import require$$1 from "path";
import require$$2 from "os";
import require$$3 from "crypto";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main = { exports: {} };
const version$1 = "17.2.1";
const require$$4 = {
  version: version$1
};
const fs = require$$0;
const path$1 = require$$1;
const os = require$$2;
const crypto$1 = require$$3;
const packageJson = require$$4;
const version = packageJson.version;
const TIPS = [
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
function _getRandomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
function parseBoolean(value) {
  if (typeof value === "string") {
    return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
  }
  return Boolean(value);
}
function supportsAnsi() {
  return process.stdout.isTTY;
}
function dim(text) {
  return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
}
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function parse(src) {
  const obj = {};
  let lines = src.toString();
  lines = lines.replace(/\r\n?/mg, "\n");
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function _parseVault(options) {
  options = options || {};
  const vaultPath = _vaultPath(options);
  options.path = vaultPath;
  const result = DotenvModule.configDotenv(options);
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = "MISSING_DATA";
    throw err;
  }
  const keys = _dotenvKey(options).split(",");
  const length = keys.length;
  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      const key = keys[i].trim();
      const attrs = _instructions(result, key);
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (i + 1 >= length) {
        throw error;
      }
    }
  }
  return DotenvModule.parse(decrypted);
}
function _warn(message) {
  console.error(`[dotenv@${version}][WARN] ${message}`);
}
function _debug(message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}
function _log(message) {
  console.log(`[dotenv@${version}] ${message}`);
}
function _dotenvKey(options) {
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY;
  }
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY;
  }
  return "";
}
function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    throw error;
  }
  const key = uri.password;
  if (!key) {
    const err = new Error("INVALID_DOTENV_KEY: Missing key part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environment = uri.searchParams.get("environment");
  if (!environment) {
    const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
    throw err;
  }
  return { ciphertext, key };
}
function _vaultPath(options) {
  let possibleVaultPath = null;
  if (options && options.path && options.path.length > 0) {
    if (Array.isArray(options.path)) {
      for (const filepath of options.path) {
        if (fs.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
    }
  } else {
    possibleVaultPath = path$1.resolve(process.cwd(), ".env.vault");
  }
  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}
function _resolveHome(envPath) {
  return envPath[0] === "~" ? path$1.join(os.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options) {
  const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
  const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
  if (debug || !quiet) {
    _log("Loading env from encrypted .env.vault");
  }
  const parsed = DotenvModule._parseVault(options);
  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }
  DotenvModule.populate(processEnv, parsed, options);
  return { parsed };
}
function configDotenv(options) {
  const dotenvPath = path$1.resolve(process.cwd(), ".env");
  let encoding = "utf8";
  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }
  let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
  let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
  if (options && options.encoding) {
    encoding = options.encoding;
  } else {
    if (debug) {
      _debug("No encoding is specified. UTF-8 is used by default");
    }
  }
  let optionPaths = [dotenvPath];
  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [_resolveHome(options.path)];
    } else {
      optionPaths = [];
      for (const filepath of options.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }
  let lastError;
  const parsedAll = {};
  for (const path2 of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) {
        _debug(`Failed to load ${path2} ${e.message}`);
      }
      lastError = e;
    }
  }
  const populated = DotenvModule.populate(processEnv, parsedAll, options);
  debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
  quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
  if (debug || !quiet) {
    const keysCount = Object.keys(populated).length;
    const shortPaths = [];
    for (const filePath of optionPaths) {
      try {
        const relative = path$1.relative(process.cwd(), filePath);
        shortPaths.push(relative);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${filePath} ${e.message}`);
        }
        lastError = e;
      }
    }
    _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
  }
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  } else {
    return { parsed: parsedAll };
  }
}
function config(options) {
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options);
  }
  const vaultPath = _vaultPath(options);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
    return DotenvModule.configDotenv(options);
  }
  return DotenvModule._configVault(options);
}
function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), "hex");
  let ciphertext = Buffer.from(encrypted, "base64");
  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);
  try {
    const aesgcm = crypto$1.createDecipheriv("aes-256-gcm", key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === "Invalid key length";
    const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
    if (isRange || invalidKeyLength) {
      const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    } else if (decryptionFailed) {
      const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      err.code = "DECRYPTION_FAILED";
      throw err;
    } else {
      throw error;
    }
  }
}
function populate(processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug);
  const override = Boolean(options && options.override);
  const populated = {};
  if (typeof parsed !== "object") {
    const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    err.code = "OBJECT_REQUIRED";
    throw err;
  }
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
      populated[key] = parsed[key];
    }
  }
  return populated;
}
const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};
main.exports.configDotenv = DotenvModule.configDotenv;
main.exports._configVault = DotenvModule._configVault;
main.exports._parseVault = DotenvModule._parseVault;
main.exports.config = DotenvModule.config;
main.exports.decrypt = DotenvModule.decrypt;
main.exports.parse = DotenvModule.parse;
main.exports.populate = DotenvModule.populate;
main.exports = DotenvModule;
var mainExports = main.exports;
const dotenv = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
class BaseTranscriptionService {
  validateRequest(request) {
    if (!request.filePath) {
      throw new Error("File path is required");
    }
    if (!request.provider) {
      throw new Error("Provider is required");
    }
    if (!request.model) {
      throw new Error("Model is required");
    }
  }
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
let uuid4 = function() {
  const { crypto: crypto2 } = globalThis;
  if (crypto2 == null ? void 0 : crypto2.randomUUID) {
    uuid4 = crypto2.randomUUID.bind(crypto2);
    return crypto2.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto2 ? () => crypto2.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
};
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
const castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
        if (err.stack)
          error.stack = err.stack;
        if (err.cause && !error.cause)
          error.cause = err.cause;
        if (err.name)
          error.name = err.name;
        return error;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};
class OpenAIError extends Error {
}
class APIError extends OpenAIError {
  constructor(status, error, message, headers) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.requestID = headers == null ? void 0 : headers.get("x-request-id");
    this.error = error;
    const data = error;
    this.code = data == null ? void 0 : data["code"];
    this.param = data == null ? void 0 : data["param"];
    this.type = data == null ? void 0 : data["type"];
  }
  static makeMessage(status, error, message) {
    const msg = (error == null ? void 0 : error.message) ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse == null ? void 0 : errorResponse["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new APIError(status, error, message, headers);
  }
}
class APIUserAbortError extends APIError {
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
}
class APIConnectionError extends APIError {
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
}
class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}
class LengthFinishReasonError extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
}
class ContentFilterFinishReasonError extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
}
class InvalidWebhookSignatureError extends Error {
  constructor(message) {
    super(message);
  }
}
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
let isArray = (val) => (isArray = Array.isArray, isArray(val));
let isReadonlyArray = isArray;
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
const validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
};
const safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const VERSION = "5.11.0";
const isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
};
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
const getPlatformProperties = () => {
  var _a2;
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : ((_a2 = Deno.version) == null ? void 0 : _a2.deno) ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
const normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
const normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
let _platformHeaders;
const getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      var _a2;
      await ((_a2 = iter.return) == null ? void 0 : _a2.call(iter));
    }
  });
}
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result == null ? void 0 : result.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function CancelReadableStream(stream) {
  var _a2, _b;
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await ((_b = (_a2 = stream[Symbol.asyncIterator]()).return) == null ? void 0 : _b.call(_a2));
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
const FallbackEncoder = ({ headers, body }) => {
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
};
const default_format = "RFC3986";
const default_formatter = (v) => String(v);
const formatters = {
  RFC1738: (v) => String(v).replace(/%20/g, "+"),
  RFC3986: default_formatter
};
const RFC1738 = "RFC1738";
let has = (obj, key) => (has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), has(obj, key));
const hex_table = /* @__PURE__ */ (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
const limit = 1024;
const encode = (str2, _defaultEncoder, charset, _kind, format) => {
  if (str2.length === 0) {
    return str2;
  }
  let string = str2;
  if (typeof str2 === "symbol") {
    string = Symbol.prototype.toString.call(str2);
  } else if (typeof str2 !== "string") {
    string = String(str2);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || // -
      c === 46 || // .
      c === 95 || // _
      c === 126 || // ~
      c >= 48 && c <= 57 || // 0-9
      c >= 65 && c <= 90 || // a-z
      c >= 97 && c <= 122 || // A-Z
      format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (isArray(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}
const array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
const push_to_array = function(arr, value_or_array) {
  Array.prototype.push.apply(arr, isArray(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: default_formatter,
  /** @deprecated */
  indices: false,
  serializeDate(date) {
    return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate == null ? void 0 : serializeDate(obj);
  } else if (generateArrayPrefix === "comma" && isArray(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate == null ? void 0 : serializeDate(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
      return [
        (formatter == null ? void 0 : formatter(key_value)) + "=" + // @ts-expect-error
        (formatter == null ? void 0 : formatter(encoder(obj, defaults.encoder, charset, "value", format)))
      ];
    }
    return [(formatter == null ? void 0 : formatter(prefix)) + "=" + (formatter == null ? void 0 : formatter(String(obj)))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && isArray(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || isArray(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (isArray(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
let encodeUTF8_;
function encodeUTF8(str2) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str2);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;
class LineDecoder {
  constructor() {
    _LineDecoder_buffer.set(this, void 0);
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array());
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]));
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index);
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")));
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
      lines.push(line);
      __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index));
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
    }
    return lines;
  }
  flush() {
    if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
      return [];
    }
    return this.decode("\n");
  }
}
_LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
const levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
const parseLogLevel = (maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
};
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
const noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
const formatRequestDetails = (details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
};
var _Stream_client;
class Stream {
  constructor(iterator, controller, client) {
    this.iterator = iterator;
    _Stream_client.set(this, void 0);
    this.controller = controller;
    __classPrivateFieldSet(this, _Stream_client, client);
  }
  static fromSSEResponse(response, controller, client) {
    let consumed = false;
    const logger = client ? loggerFor(client) : console;
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null || !sse.event.startsWith("thread.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              logger.error(`Could not parse message into JSON:`, sse.data);
              logger.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, response.headers);
            }
            yield data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (sse.event == "error") {
              throw new APIError(void 0, data.error, data.message, void 0);
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new Stream(iterator, controller, client);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller, client) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new Stream(iterator, controller, client);
  }
  [(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = (queue) => {
      return {
        next: () => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }
      };
    };
    return [
      new Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
      new Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self = this;
    let iter;
    return makeReadableStream({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encodeUTF8(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        var _a2;
        await ((_a2 = iter.return) == null ? void 0 : _a2.call(iter));
      }
    });
  }
}
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
      throw new OpenAIError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
class SSEDecoder {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
}
function partition(str2, delimiter) {
  const index = str2.indexOf(delimiter);
  if (index !== -1) {
    return [str2.substring(0, index), delimiter, str2.substring(index + delimiter.length)];
  }
  return [str2, "", ""];
}
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    var _a2;
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
      }
      return Stream.fromSSEResponse(response, props.controller, client);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = (_a2 = contentType == null ? void 0 : contentType.split(";")[0]) == null ? void 0 : _a2.trim();
    const isJSON = (mediaType == null ? void 0 : mediaType.includes("application/json")) || (mediaType == null ? void 0 : mediaType.endsWith("+json"));
    if (isJSON) {
      const json = await response.json();
      return addRequestID(json, response);
    }
    const text = await response.text();
    return text;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
var _APIPromise_client;
class APIPromise extends Promise {
  constructor(client, responsePromise, parseResponse2 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse2;
    _APIPromise_client.set(this, void 0);
    __classPrivateFieldSet(this, _APIPromise_client, client);
  }
  _thenUnwrap(transform) {
    return new APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
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
    return this.responsePromise.then((p) => p.response);
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
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
}
_APIPromise_client = /* @__PURE__ */ new WeakMap();
var _AbstractPage_client;
class AbstractPage {
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet(this, _AbstractPage_client, client);
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageRequestOptions() != null;
  }
  async getNextPage() {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
}
class PagePromise extends APIPromise {
  constructor(client, request, Page2) {
    super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
}
class Page extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}
class CursorPage extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    var _a2;
    const data = this.getPaginatedItems();
    const id = (_a2 = data[data.length - 1]) == null ? void 0 : _a2.id;
    if (!id) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: id
      }
    };
  }
}
const checkFileSupport = () => {
  var _a2;
  if (typeof File === "undefined") {
    const { process: process2 } = globalThis;
    const isOldNode = typeof ((_a2 = process2 == null ? void 0 : process2.versions) == null ? void 0 : _a2.node) === "string" && parseInt(process2.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value) {
  return (typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "").split(/[\\/]/).pop() || void 0;
}
const isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
const multipartFormRequestOptions = async (opts, fetch2) => {
  return { ...opts, body: await createForm(opts.body, fetch2) };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached)
    return cached;
  const promise = (async () => {
    try {
      const FetchResponse = "Response" in fetch2 ? fetch2.Response : (await fetch2("data:,")).constructor;
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
const createForm = async (body, fetch2) => {
  if (!await supportsFormData(fetch2)) {
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};
const isNamedBlob = (value) => value instanceof Blob && "name" in value;
const addFormValue = async (form, key, value) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
  } else if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};
const isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
const isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
const isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    if (value instanceof File) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], value.name);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  name || (name = getName(value));
  if (!(options == null ? void 0 : options.type)) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
async function getBytes(value) {
  var _a2;
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = (_a2 = value == null ? void 0 : value.constructor) == null ? void 0 : _a2.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
class APIResource {
  constructor(client) {
    this._client = client;
  }
}
function encodeURIPath(str2) {
  return str2.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path2(statics, ...params) {
  if (statics.length === 1)
    return statics[0];
  let postPath = false;
  const invalidSegments = [];
  const path3 = statics.reduce((previousValue, currentValue, index) => {
    var _a2;
    if (/[?#]/.test(currentValue)) {
      postPath = true;
    }
    const value = params[index];
    let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
    if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
    value.toString === ((_a2 = Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)) == null ? void 0 : _a2.toString))) {
      encoded = value + "";
      invalidSegments.push({
        start: previousValue.length + currentValue.length,
        length: encoded.length,
        error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
      });
    }
    return previousValue + currentValue + (index === params.length ? "" : encoded);
  }, "");
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = new RegExp("(?<=^|\\/)(?:\\.|%2e){1,2}(?=\\/|$)", "gi");
  let match;
  while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match.index,
      length: match[0].length,
      error: `Value "${match[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    const underline = invalidSegments.reduce((acc, segment) => {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      return acc + spaces + arrows;
    }, "");
    throw new OpenAIError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
};
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
let Messages$1 = class Messages extends APIResource {
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
  list(completionID, query = {}, options) {
    return this._client.getAPIList(path`/chat/completions/${completionID}/messages`, CursorPage, { query, ...options });
  }
};
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}
const isAssistantMessage = (message) => {
  return (message == null ? void 0 : message.role) === "assistant";
};
const isToolMessage = (message) => {
  return (message == null ? void 0 : message.role) === "tool";
};
var _EventStream_instances, _EventStream_connectedPromise, _EventStream_resolveConnectedPromise, _EventStream_rejectConnectedPromise, _EventStream_endPromise, _EventStream_resolveEndPromise, _EventStream_rejectEndPromise, _EventStream_listeners, _EventStream_ended, _EventStream_errored, _EventStream_aborted, _EventStream_catchingPromiseCreated, _EventStream_handleError;
class EventStream {
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => {
    });
    _EventStream_rejectConnectedPromise.set(this, () => {
    });
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => {
    });
    _EventStream_rejectEndPromise.set(this, () => {
    });
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectConnectedPromise, reject, "f");
    }));
    __classPrivateFieldSet(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectEndPromise, reject, "f");
    }));
    __classPrivateFieldGet(this, _EventStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet(this, _EventStream_endPromise, "f").catch(() => {
    });
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet(this, _EventStream_aborted, "f");
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
  on(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
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
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true);
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true);
    await __classPrivateFieldGet(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet(this, _EventStream_ended, true);
      __classPrivateFieldGet(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !(listeners == null ? void 0 : listeners.length)) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !(listeners == null ? void 0 : listeners.length)) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
  }
}
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = function _EventStream_handleError2(error) {
  __classPrivateFieldSet(this, _EventStream_errored, true);
  if (error instanceof Error && error.name === "AbortError") {
    error = new APIUserAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet(this, _EventStream_aborted, true);
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
};
function isAutoParsableResponseFormat(response_format) {
  return (response_format == null ? void 0 : response_format["$brand"]) === "auto-parseable-response-format";
}
function isAutoParsableTool$1(tool) {
  return (tool == null ? void 0 : tool["$brand"]) === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput$1(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : void 0
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    var _a2;
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: ((_a2 = choice.message.tool_calls) == null ? void 0 : _a2.map((toolCall) => parseToolCall$1(params, toolCall))) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  var _a2, _b;
  if (((_a2 = params.response_format) == null ? void 0 : _a2.type) !== "json_schema") {
    return null;
  }
  if (((_b = params.response_format) == null ? void 0 : _b.type) === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
function parseToolCall$1(params, toolCall) {
  var _a2;
  const inputTool = (_a2 = params.tools) == null ? void 0 : _a2.find((inputTool2) => {
    var _a3;
    return ((_a3 = inputTool2.function) == null ? void 0 : _a3.name) === toolCall.function.name;
  });
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool$1(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : (inputTool == null ? void 0 : inputTool.function.strict) ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  var _a2;
  if (!params) {
    return false;
  }
  const inputTool = (_a2 = params.tools) == null ? void 0 : _a2.find((inputTool2) => {
    var _a3;
    return ((_a3 = inputTool2.function) == null ? void 0 : _a3.name) === toolCall.function.name;
  });
  return isAutoParsableTool$1(inputTool) || (inputTool == null ? void 0 : inputTool.function.strict) || false;
}
function hasAutoParseableInput$1(params) {
  var _a2;
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return ((_a2 = params.tools) == null ? void 0 : _a2.some((t) => isAutoParsableTool$1(t) || t.type === "function" && t.function.strict === true)) ?? false;
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
var _AbstractChatCompletionRunner_instances, _AbstractChatCompletionRunner_getFinalContent, _AbstractChatCompletionRunner_getFinalMessage, _AbstractChatCompletionRunner_getFinalFunctionToolCall, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult, _AbstractChatCompletionRunner_calculateTotalUsage, _AbstractChatCompletionRunner_validateParams, _AbstractChatCompletionRunner_stringifyFunctionCallResult;
const DEFAULT_MAX_CHAT_COMPLETIONS = 10;
class AbstractChatCompletionRunner extends EventStream {
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    var _a2;
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = (_a2 = chatCompletion.choices[0]) == null ? void 0 : _a2.message;
    if (message)
      this._addMessage(message);
    return chatCompletion;
  }
  _addMessage(message, emit = true) {
    if (!("content" in message))
      message.content = null;
    this.messages.push(message);
    if (emit) {
      this._emit("message", message);
      if (isToolMessage(message) && message.content) {
        this._emit("functionToolCallResult", message.content);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionToolCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionToolCall() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
  }
  async finalFunctionToolCallResult() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
  }
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion)
      this._emit("finalChatCompletion", completion);
    const finalMessage = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage)
      this._emit("finalMessage", finalMessage);
    const finalContent = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent)
      this._emit("finalContent", finalContent);
    const finalFunctionCall = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
    if (finalFunctionCall)
      this._emit("finalFunctionToolCall", finalFunctionCall);
    const finalFunctionCallResult = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
    if (finalFunctionCallResult != null)
      this._emit("finalFunctionToolCallResult", finalFunctionCallResult);
    if (this._chatCompletions.some((c) => c.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options) {
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options) {
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    return await this._createChatCompletion(client, params, options);
  }
  async _runTools(client, params, options) {
    var _a2, _b, _c;
    const role = "tool";
    const { tool_choice = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof tool_choice !== "string" && ((_a2 = tool_choice == null ? void 0 : tool_choice.function) == null ? void 0 : _a2.name);
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool$1(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = {};
    for (const f of inputTools) {
      if (f.type === "function") {
        functionsByName[f.function.name || f.function.function.name] = f.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
      type: "function",
      function: {
        name: t.function.name || t.function.function.name,
        parameters: t.function.parameters,
        description: t.function.description,
        strict: t.function.strict
      }
    } : t) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: [...this.messages]
      }, options);
      const message = (_b = chatCompletion.choices[0]) == null ? void 0 : _b.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!((_c = message.tool_calls) == null ? void 0 : _c.length)) {
        return;
      }
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function")
          continue;
        const tool_call_id = tool_call.id;
        const { name, arguments: args } = tool_call.function;
        const fn = functionsByName[name];
        if (!fn) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
        } catch (error) {
          const content2 = error instanceof Error ? error.message : String(error);
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        const rawContent = await fn.function(parsed, this);
        const content = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, tool_call_id, content });
        if (singleFunctionToCall) {
          return;
        }
      }
    }
    return;
  }
}
_AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const ret = {
        ...message,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, _AbstractChatCompletionRunner_getFinalFunctionToolCall = function _AbstractChatCompletionRunner_getFinalFunctionToolCall2() {
  var _a2, _b;
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && ((_a2 = message == null ? void 0 : message.tool_calls) == null ? void 0 : _a2.length)) {
      return (_b = message.tool_calls.at(-1)) == null ? void 0 : _b.function;
    }
  }
  return;
}, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult = function _AbstractChatCompletionRunner_getFinalFunctionToolCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x) => {
      var _a2;
      return x.role === "assistant" && ((_a2 = x.tool_calls) == null ? void 0 : _a2.some((y) => y.type === "function" && y.id === message.tool_call_id));
    })) {
      return message.content;
    }
  }
  return;
}, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
};
class ChatCompletionRunner extends AbstractChatCompletionRunner {
  static runTools(client, params, options) {
    const runner = new ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
  _addMessage(message, emit = true) {
    super._addMessage(message, emit);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
}
const STR = 1;
const NUM = 2;
const ARR = 4;
const OBJ = 8;
const NULL = 16;
const BOOL = 32;
const NAN = 64;
const INFINITY = 128;
const MINUS_INFINITY = 256;
const INF = INFINITY | MINUS_INFINITY;
const SPECIAL = NULL | BOOL | INF | NAN;
const ATOM = STR | NUM | SPECIAL;
const COLLECTION = ARR | OBJ;
const ALL = ATOM | COLLECTION;
const Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
class PartialJSON extends Error {
}
class MalformedJSON extends Error {
}
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
const _parseJSON = (jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = (msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };
  const throwMalformedError = (msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };
  const parseAny = () => {
    skipBlank();
    if (index >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index] === '"')
      return parseStr();
    if (jsonString[index] === "{")
      return parseObj();
    if (jsonString[index] === "[")
      return parseArr();
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };
  const parseStr = () => {
    const start = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
      } catch (e) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  };
  const parseObj = () => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e;
        }
        skipBlank();
        if (jsonString[index] === ",")
          index++;
      }
    } catch (e) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  };
  const parseArr = () => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  };
  const parseNum = () => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ("." === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e2) {
          }
        }
        throwMalformedError(String(e));
      }
    }
    const start = index;
    if (jsonString[index] === "-")
      index++;
    while (jsonString[index] && !",]}".includes(jsonString[index]))
      index++;
    if (index == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e2) {
        throwMalformedError(String(e2));
      }
    }
  };
  const skipBlank = () => {
    while (index < length && " \n\r	".includes(jsonString[index])) {
      index++;
    }
  };
  return parseAny();
};
const partialParse = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);
var _ChatCompletionStream_instances, _ChatCompletionStream_params, _ChatCompletionStream_choiceEventStates, _ChatCompletionStream_currentChatCompletionSnapshot, _ChatCompletionStream_beginRequest, _ChatCompletionStream_getChoiceEventState, _ChatCompletionStream_addChunk, _ChatCompletionStream_emitToolCallDoneEvent, _ChatCompletionStream_emitContentDoneEvents, _ChatCompletionStream_endRequest, _ChatCompletionStream_getAutoParseableResponseFormat, _ChatCompletionStream_accumulateChatCompletion;
class ChatCompletionStream extends AbstractChatCompletionRunner {
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_params, params);
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, []);
  }
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createChatCompletion(client, params, options) {
    const runner = new ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  async _createChatCompletion(client, params, options) {
    var _a2;
    super._createChatCompletion;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const chunk of stream) {
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const chunk of stream) {
      if (chatId && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      chatId = chunk.id;
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0);
  }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state = __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state) {
      return state;
    }
    state = {
      content_done: false,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    };
    __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
    return state;
  }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    if (this.ended)
      return;
    const completion = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const choiceSnapshot = completion.choices[choice.index];
      if (choice.delta.content != null && ((_a2 = choiceSnapshot.message) == null ? void 0 : _a2.role) === "assistant" && ((_b = choiceSnapshot.message) == null ? void 0 : _b.content)) {
        this._emit("content", choice.delta.content, choiceSnapshot.message.content);
        this._emit("content.delta", {
          delta: choice.delta.content,
          snapshot: choiceSnapshot.message.content,
          parsed: choiceSnapshot.message.parsed
        });
      }
      if (choice.delta.refusal != null && ((_c = choiceSnapshot.message) == null ? void 0 : _c.role) === "assistant" && ((_d = choiceSnapshot.message) == null ? void 0 : _d.refusal)) {
        this._emit("refusal.delta", {
          delta: choice.delta.refusal,
          snapshot: choiceSnapshot.message.refusal
        });
      }
      if (((_e = choice.logprobs) == null ? void 0 : _e.content) != null && ((_f = choiceSnapshot.message) == null ? void 0 : _f.role) === "assistant") {
        this._emit("logprobs.content.delta", {
          content: (_g = choice.logprobs) == null ? void 0 : _g.content,
          snapshot: ((_h = choiceSnapshot.logprobs) == null ? void 0 : _h.content) ?? []
        });
      }
      if (((_i = choice.logprobs) == null ? void 0 : _i.refusal) != null && ((_j = choiceSnapshot.message) == null ? void 0 : _j.role) === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: (_k = choice.logprobs) == null ? void 0 : _k.refusal,
          snapshot: ((_l = choiceSnapshot.logprobs) == null ? void 0 : _l.refusal) ?? []
        });
      }
      const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state.current_tool_call_index != null) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
        }
      }
      for (const toolCall of choice.delta.tool_calls ?? []) {
        if (state.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        state.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of choice.delta.tool_calls ?? []) {
        const toolCallSnapshot = (_m = choiceSnapshot.message.tool_calls) == null ? void 0 : _m[toolCallDelta.index];
        if (!(toolCallSnapshot == null ? void 0 : toolCallSnapshot.type)) {
          continue;
        }
        if ((toolCallSnapshot == null ? void 0 : toolCallSnapshot.type) === "function") {
          this._emit("tool_calls.function.arguments.delta", {
            name: (_n = toolCallSnapshot.function) == null ? void 0 : _n.name,
            index: toolCallDelta.index,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: ((_o = toolCallDelta.function) == null ? void 0 : _o.arguments) ?? ""
          });
        } else {
          assertNever(toolCallSnapshot == null ? void 0 : toolCallSnapshot.type);
        }
      }
    }
  }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    var _a2, _b, _c;
    const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const toolCallSnapshot = (_a2 = choiceSnapshot.message.tool_calls) == null ? void 0 : _a2[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = (_c = (_b = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _b.tools) == null ? void 0 : _c.find((tool) => tool.type === "function" && tool.function.name === toolCallSnapshot.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: toolCallSnapshot.function.arguments,
        parsed_arguments: isAutoParsableTool$1(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : (inputTool == null ? void 0 : inputTool.function.strict) ? JSON.parse(toolCallSnapshot.function.arguments) : null
      });
    } else {
      assertNever(toolCallSnapshot.type);
    }
  }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    var _a2, _b;
    const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (choiceSnapshot.message.content && !state.content_done) {
      state.content_done = true;
      const responseFormat = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
      this._emit("content.done", {
        content: choiceSnapshot.message.content,
        parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
      });
    }
    if (choiceSnapshot.message.refusal && !state.refusal_done) {
      state.refusal_done = true;
      this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
    }
    if (((_a2 = choiceSnapshot.logprobs) == null ? void 0 : _a2.content) && !state.logprobs_content_done) {
      state.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (((_b = choiceSnapshot.logprobs) == null ? void 0 : _b.refusal) && !state.logprobs_refusal_done) {
      state.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, []);
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet(this, _ChatCompletionStream_params, "f"));
  }, _ChatCompletionStream_getAutoParseableResponseFormat = function _ChatCompletionStream_getAutoParseableResponseFormat2() {
    var _a2;
    const responseFormat = (_a2 = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")) == null ? void 0 : _a2.response_format;
    if (isAutoParsableResponseFormat(responseFormat)) {
      return responseFormat;
    }
    return null;
  }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
    var _a2, _b, _c, _d;
    let snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, ...rest } = chunk;
    if (!snapshot) {
      snapshot = __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
        ...rest,
        choices: []
      });
    } else {
      Object.assign(snapshot, rest);
    }
    for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
      let choice = snapshot.choices[index];
      if (!choice) {
        choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
      }
      if (logprobs) {
        if (!choice.logprobs) {
          choice.logprobs = Object.assign({}, logprobs);
        } else {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          Object.assign(choice.logprobs, rest3);
          if (content2) {
            (_a2 = choice.logprobs).content ?? (_a2.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b = choice.logprobs).refusal ?? (_b.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput$1(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      Object.assign(choice, other);
      if (!delta)
        continue;
      const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
      Object.assign(choice.message, rest2);
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role)
        choice.message.role = role;
      if (function_call) {
        if (!choice.message.function_call) {
          choice.message.function_call = function_call;
        } else {
          if (function_call.name)
            choice.message.function_call.name = function_call.name;
          if (function_call.arguments) {
            (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        }
      }
      if (content) {
        choice.message.content = (choice.message.content || "") + content;
        if (!choice.message.refusal && __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
          choice.message.parsed = partialParse(choice.message.content);
        }
      }
      if (tool_calls) {
        if (!choice.message.tool_calls)
          choice.message.tool_calls = [];
        for (const { index: index2, id, type, function: fn, ...rest3 } of tool_calls) {
          const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
          Object.assign(tool_call, rest3);
          if (id)
            tool_call.id = id;
          if (type)
            tool_call.type = type;
          if (fn)
            tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
          if (fn == null ? void 0 : fn.name)
            tool_call.function.name = fn.name;
          if (fn == null ? void 0 : fn.arguments) {
            tool_call.function.arguments += fn.arguments;
            if (shouldParseToolCall(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), tool_call)) {
              tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
            }
          }
        }
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("chunk", (chunk) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(chunk);
      } else {
        pushQueue.push(chunk);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
}
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function str(x) {
  return JSON.stringify(x);
}
function assertNever(_x) {
}
class ChatCompletionStreamingRunner extends ChatCompletionStream {
  static fromReadableStream(stream) {
    const runner = new ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
}
let Completions$1 = class Completions extends APIResource {
  constructor() {
    super(...arguments);
    this.messages = new Messages$1(this._client);
  }
  create(body, options) {
    return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
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
  retrieve(completionID, options) {
    return this._client.get(path`/chat/completions/${completionID}`, options);
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
  update(completionID, body, options) {
    return this._client.post(path`/chat/completions/${completionID}`, { body, ...options });
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
  list(query = {}, options) {
    return this._client.getAPIList("/chat/completions", CursorPage, { query, ...options });
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
  delete(completionID, options) {
    return this._client.delete(path`/chat/completions/${completionID}`, options);
  }
  parse(body, options) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options,
      headers: {
        ...options == null ? void 0 : options.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runTools(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options);
    }
    return ChatCompletionRunner.runTools(this._client, body, options);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options);
  }
};
Completions$1.Messages = Messages$1;
class Chat extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions$1(this._client);
  }
}
Chat.Completions = Completions$1;
const brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
const buildHeaders = (newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(name);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(name);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(name, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};
class Speech extends APIResource {
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
  create(body, options) {
    return this._client.post("/audio/speech", {
      body,
      ...options,
      headers: buildHeaders([{ Accept: "application/octet-stream" }, options == null ? void 0 : options.headers]),
      __binaryResponse: true
    });
  }
}
class Transcriptions extends APIResource {
  create(body, options) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options,
      stream: body.stream ?? false,
      __metadata: { model: body.model }
    }, this._client));
  }
}
class Translations extends APIResource {
  create(body, options) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }, this._client));
  }
}
class Audio extends APIResource {
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
}
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;
class Batches extends APIResource {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options) {
    return this._client.post("/batches", { body, ...options });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchID, options) {
    return this._client.get(path`/batches/${batchID}`, options);
  }
  /**
   * List your organization's batches.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/batches", CursorPage, { query, ...options });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchID, options) {
    return this._client.post(path`/batches/${batchID}/cancel`, options);
  }
}
class Assistants extends APIResource {
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
  create(body, options) {
    return this._client.post("/assistants", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
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
  retrieve(assistantID, options) {
    return this._client.get(path`/assistants/${assistantID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
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
  update(assistantID, body, options) {
    return this._client.post(path`/assistants/${assistantID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
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
  list(query = {}, options) {
    return this._client.getAPIList("/assistants", CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
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
  delete(assistantID, options) {
    return this._client.delete(path`/assistants/${assistantID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
class Sessions extends APIResource {
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
  create(body, options) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
class TranscriptionSessions extends APIResource {
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
  create(body, options) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
class Realtime extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
}
Realtime.Sessions = Sessions;
Realtime.TranscriptionSessions = TranscriptionSessions;
class Messages2 extends APIResource {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadID, body, options) {
    return this._client.post(path`/threads/${threadID}/messages`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(messageID, params, options) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(messageID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/messages/${messageID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Returns a list of messages for a given thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options) {
    return this._client.getAPIList(path`/threads/${threadID}/messages`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(messageID, params, options) {
    const { thread_id } = params;
    return this._client.delete(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
class Steps extends APIResource {
  /**
   * Retrieves a run step.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(stepID, params, options) {
    const { thread_id, run_id, ...query } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${run_id}/steps/${stepID}`, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Returns a list of run steps belonging to a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(runID, params, options) {
    const { thread_id, ...query } = params;
    return this._client.getAPIList(path`/threads/${thread_id}/runs/${runID}/steps`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
const toFloat32Array = (base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
};
const readEnv = (env) => {
  var _a2, _b, _c, _d, _e;
  if (typeof globalThis.process !== "undefined") {
    return ((_b = (_a2 = globalThis.process.env) == null ? void 0 : _a2[env]) == null ? void 0 : _b.trim()) ?? void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return (_e = (_d = (_c = globalThis.Deno.env) == null ? void 0 : _c.get) == null ? void 0 : _d.call(_c, env)) == null ? void 0 : _e.trim();
  }
  return void 0;
};
var _AssistantStream_instances, _a$1, _AssistantStream_events, _AssistantStream_runStepSnapshots, _AssistantStream_messageSnapshots, _AssistantStream_messageSnapshot, _AssistantStream_finalRun, _AssistantStream_currentContentIndex, _AssistantStream_currentContent, _AssistantStream_currentToolCallIndex, _AssistantStream_currentToolCall, _AssistantStream_currentEvent, _AssistantStream_currentRunSnapshot, _AssistantStream_currentRunStepSnapshot, _AssistantStream_addEvent, _AssistantStream_endRequest, _AssistantStream_handleMessage, _AssistantStream_handleRunStep, _AssistantStream_handleEvent, _AssistantStream_accumulateRunStep, _AssistantStream_accumulateMessage, _AssistantStream_accumulateContent, _AssistantStream_handleRun;
class AssistantStream extends EventStream {
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_events.set(this, []);
    _AssistantStream_runStepSnapshots.set(this, {});
    _AssistantStream_messageSnapshots.set(this, {});
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  static fromReadableStream(stream) {
    const runner = new _a$1();
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  async _fromReadableStream(readableStream, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
  static createToolAssistantStream(runId, runs, params, options) {
    const runner = new _a$1();
    runner._run(() => runner._runToolAssistantStream(runId, runs, params, {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, runId, params, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.submitToolOutputs(runId, body, {
      ...options,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static createThreadAssistantStream(params, thread, options) {
    const runner = new _a$1();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  static createAssistantStream(threadId, runs, params, options) {
    const runner = new _a$1();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  currentEvent() {
    return __classPrivateFieldGet(this, _AssistantStream_currentEvent, "f");
  }
  currentRun() {
    return __classPrivateFieldGet(this, _AssistantStream_currentRunSnapshot, "f");
  }
  currentMessageSnapshot() {
    return __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f");
  }
  currentRunStepSnapshot() {
    return __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"));
  }
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f"));
  }
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run was not received.");
    return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static accumulateDelta(acc, delta) {
    for (const [key, deltaValue] of Object.entries(delta)) {
      if (!acc.hasOwnProperty(key)) {
        acc[key] = deltaValue;
        continue;
      }
      let accValue = acc[key];
      if (accValue === null || accValue === void 0) {
        acc[key] = deltaValue;
        continue;
      }
      if (key === "index" || key === "type") {
        acc[key] = deltaValue;
        continue;
      }
      if (typeof accValue === "string" && typeof deltaValue === "string") {
        accValue += deltaValue;
      } else if (typeof accValue === "number" && typeof deltaValue === "number") {
        accValue += deltaValue;
      } else if (isObj(accValue) && isObj(deltaValue)) {
        accValue = this.accumulateDelta(accValue, deltaValue);
      } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
        if (accValue.every((x) => typeof x === "string" || typeof x === "number")) {
          accValue.push(...deltaValue);
          continue;
        }
        for (const deltaEntry of deltaValue) {
          if (!isObj(deltaEntry)) {
            throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
          }
          const index = deltaEntry["index"];
          if (index == null) {
            console.error(deltaEntry);
            throw new Error("Expected array delta entry to have an `index` property");
          }
          if (typeof index !== "number") {
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
          }
          const accEntry = accValue[index];
          if (accEntry == null) {
            accValue.push(deltaEntry);
          } else {
            accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
          }
        }
        continue;
      } else {
        throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
      }
      acc[key] = accValue;
    }
    return acc;
  }
  _addRun(run) {
    return run;
  }
  async _threadAssistantStream(params, thread, options) {
    return await this._createThreadAssistantStream(thread, params, options);
  }
  async _runAssistantStream(threadId, runs, params, options) {
    return await this._createAssistantStream(runs, threadId, params, options);
  }
  async _runToolAssistantStream(runId, runs, params, options) {
    return await this._createToolAssistantStream(runs, runId, params, options);
  }
}
_a$1 = AssistantStream, _AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
  if (this.ended)
    return;
  __classPrivateFieldSet(this, _AssistantStream_currentEvent, event);
  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
  switch (event.event) {
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
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
      break;
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
      break;
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete":
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
      break;
    case "error":
      throw new Error("Encountered an error event in event processing - errors should be processed earlier");
  }
}, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
    throw Error("Final run has not been received");
  return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
}, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, accumulatedMessage);
  __classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if ((snapshotContent == null ? void 0 : snapshotContent.type) == "text") {
      this._emit("textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created":
      this._emit("messageCreated", event.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      this._emit("messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type == "text" && content.text) {
            let textDelta = content.text;
            let snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type == "text") {
              this._emit("textDelta", textDelta, snapshot.text);
            } else {
              throw Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index != __classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f").type) {
                case "text":
                  this._emit("textDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
            __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, content.index);
          }
          __classPrivateFieldSet(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index]);
        }
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file":
              this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
            case "text":
              this._emit("textDone", currentContent.text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
          }
        }
      }
      if (__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
        this._emit("messageDone", event.data);
      }
      __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, void 0);
  }
}, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event) {
  const accumulatedRunStep = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
  __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep);
  switch (event.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", event.data);
      break;
    case "thread.run.step.delta":
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index == __classPrivateFieldGet(this, _AssistantStream_currentToolCallIndex, "f")) {
            this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, toolCall.index);
            __classPrivateFieldSet(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"))
              this._emit("toolCallCreated", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
          }
        }
      }
      this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, void 0);
      const details = event.data.step_details;
      if (details.type == "tool_calls") {
        if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0);
        }
      }
      this._emit("runStepDone", event.data, accumulatedRunStep);
      break;
  }
}, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet(this, _AssistantStream_events, "f").push(event);
  this._emit("event", event);
}, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event) {
  switch (event.event) {
    case "thread.run.step.created":
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      return event.data;
    case "thread.run.step.delta":
      let snapshot = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      if (!snapshot) {
        throw Error("Received a RunStepDelta before creation of a snapshot");
      }
      let data = event.data;
      if (data.delta) {
        const accumulated = _a$1.accumulateDelta(snapshot, data.delta);
        __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
      }
      return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      break;
  }
  if (__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
    return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
  throw new Error("No snapshot available");
}, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
  let newContent = [];
  switch (event.event) {
    case "thread.message.created":
      return [event.data, newContent];
    case "thread.message.delta":
      if (!snapshot) {
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      let data = event.data;
      if (data.delta.content) {
        for (const contentElement of data.delta.content) {
          if (contentElement.index in snapshot.content) {
            let currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
          } else {
            snapshot.content[contentElement.index] = contentElement;
            newContent.push(contentElement);
          }
        }
      }
      return [snapshot, newContent];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (snapshot) {
        return [snapshot, newContent];
      } else {
        throw Error("Received thread message event with no existing snapshot");
      }
  }
  throw Error("Tried to accumulate a non-message event");
}, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent) {
  return _a$1.accumulateDelta(currentContent, contentElement);
}, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet(this, _AssistantStream_currentRunSnapshot, event.data);
  switch (event.event) {
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
      __classPrivateFieldSet(this, _AssistantStream_finalRun, event.data);
      if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
        this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
        __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0);
      }
      break;
  }
};
let Runs$1 = class Runs extends APIResource {
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadID, params, options) {
    const { include, ...body } = params;
    return this._client.post(path`/threads/${threadID}/runs`, {
      query: { include },
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers]),
      stream: params.stream ?? false
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(runID, params, options) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${runID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(runID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Returns a list of runs belonging to a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options) {
    return this._client.getAPIList(path`/threads/${threadID}/runs`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(runID, params, options) {
    const { thread_id } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/cancel`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options) {
    const run = await this.create(threadId, body, options);
    return await this.poll(run.id, { thread_id: threadId }, options);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(runId, params, options) {
    var _a2;
    const headers = buildHeaders([
      options == null ? void 0 : options.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((_a2 = options == null ? void 0 : options.pollIntervalMs) == null ? void 0 : _a2.toString()) ?? void 0
      }
    ]);
    while (true) {
      const { data: run, response } = await this.retrieve(runId, params, {
        ...options,
        headers: { ...options == null ? void 0 : options.headers, ...headers }
      }).withResponse();
      switch (run.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let sleepInterval = 5e3;
          if (options == null ? void 0 : options.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return run;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  submitToolOutputs(runID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/submit_tool_outputs`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers]),
      stream: params.stream ?? false
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(runId, params, options) {
    const run = await this.submitToolOutputs(runId, params, options);
    return await this.poll(run.id, params, options);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(runId, params, options) {
    return AssistantStream.createToolAssistantStream(runId, this._client.beta.threads.runs, params, options);
  }
};
Runs$1.Steps = Steps;
class Threads extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs$1(this._client);
    this.messages = new Messages2(this._client);
  }
  /**
   * Create a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(body = {}, options) {
    return this._client.post("/threads", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadID, options) {
    return this._client.get(path`/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadID, body, options) {
    return this._client.post(path`/threads/${threadID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(threadID, options) {
    return this._client.delete(path`/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  createAndRun(body, options) {
    return this._client.post("/threads/runs", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers]),
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options) {
    const run = await this.createAndRun(body, options);
    return await this.runs.poll(run.id, { thread_id: run.thread_id }, options);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
  }
}
Threads.Runs = Runs$1;
Threads.Messages = Messages2;
class Beta extends APIResource {
  constructor() {
    super(...arguments);
    this.realtime = new Realtime(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads(this._client);
  }
}
Beta.Realtime = Realtime;
Beta.Assistants = Assistants;
Beta.Threads = Threads;
class Completions2 extends APIResource {
  create(body, options) {
    return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
  }
}
class Content extends APIResource {
  /**
   * Retrieve Container File Content
   */
  retrieve(fileID, params, options) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options == null ? void 0 : options.headers]),
      __binaryResponse: true
    });
  }
}
let Files$2 = class Files extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerID, body, options) {
    return this._client.post(path`/containers/${containerID}/files`, multipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Retrieve Container File
   */
  retrieve(fileID, params, options) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}`, options);
  }
  /**
   * List Container files
   */
  list(containerID, query = {}, options) {
    return this._client.getAPIList(path`/containers/${containerID}/files`, CursorPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Container File
   */
  delete(fileID, params, options) {
    const { container_id } = params;
    return this._client.delete(path`/containers/${container_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options == null ? void 0 : options.headers])
    });
  }
};
Files$2.Content = Content;
class Containers extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files$2(this._client);
  }
  /**
   * Create Container
   */
  create(body, options) {
    return this._client.post("/containers", { body, ...options });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerID, options) {
    return this._client.get(path`/containers/${containerID}`, options);
  }
  /**
   * List Containers
   */
  list(query = {}, options) {
    return this._client.getAPIList("/containers", CursorPage, { query, ...options });
  }
  /**
   * Delete Container
   */
  delete(containerID, options) {
    return this._client.delete(path`/containers/${containerID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options == null ? void 0 : options.headers])
    });
  }
}
Containers.Files = Files$2;
class Embeddings extends APIResource {
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
  create(body, options) {
    const hasUserProvidedEncodingFormat = !!body.encoding_format;
    let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
    if (hasUserProvidedEncodingFormat) {
      loggerFor(this._client).debug("embeddings/user defined encoding_format:", body.encoding_format);
    }
    const response = this._client.post("/embeddings", {
      body: {
        ...body,
        encoding_format
      },
      ...options
    });
    if (hasUserProvidedEncodingFormat) {
      return response;
    }
    loggerFor(this._client).debug("embeddings/decoding base64 embeddings from base64");
    return response._thenUnwrap((response2) => {
      if (response2 && response2.data) {
        response2.data.forEach((embeddingBase64Obj) => {
          const embeddingBase64Str = embeddingBase64Obj.embedding;
          embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
        });
      }
      return response2;
    });
  }
}
class OutputItems extends APIResource {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(outputItemID, params, options) {
    const { eval_id, run_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${run_id}/output_items/${outputItemID}`, options);
  }
  /**
   * Get a list of output items for an evaluation run.
   */
  list(runID, params, options) {
    const { eval_id, ...query } = params;
    return this._client.getAPIList(path`/evals/${eval_id}/runs/${runID}/output_items`, CursorPage, { query, ...options });
  }
}
class Runs2 extends APIResource {
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalID, body, options) {
    return this._client.post(path`/evals/${evalID}/runs`, { body, ...options });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(runID, params, options) {
    const { eval_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${runID}`, options);
  }
  /**
   * Get a list of runs for an evaluation.
   */
  list(evalID, query = {}, options) {
    return this._client.getAPIList(path`/evals/${evalID}/runs`, CursorPage, {
      query,
      ...options
    });
  }
  /**
   * Delete an eval run.
   */
  delete(runID, params, options) {
    const { eval_id } = params;
    return this._client.delete(path`/evals/${eval_id}/runs/${runID}`, options);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(runID, params, options) {
    const { eval_id } = params;
    return this._client.post(path`/evals/${eval_id}/runs/${runID}`, options);
  }
}
Runs2.OutputItems = OutputItems;
class Evals extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(body, options) {
    return this._client.post("/evals", { body, ...options });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalID, options) {
    return this._client.get(path`/evals/${evalID}`, options);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalID, body, options) {
    return this._client.post(path`/evals/${evalID}`, { body, ...options });
  }
  /**
   * List evaluations for a project.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/evals", CursorPage, { query, ...options });
  }
  /**
   * Delete an evaluation.
   */
  delete(evalID, options) {
    return this._client.delete(path`/evals/${evalID}`, options);
  }
}
Evals.Runs = Runs2;
let Files$1 = class Files2 extends APIResource {
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
  create(body, options) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileID, options) {
    return this._client.get(path`/files/${fileID}`, options);
  }
  /**
   * Returns a list of files.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/files", CursorPage, { query, ...options });
  }
  /**
   * Delete a file.
   */
  delete(fileID, options) {
    return this._client.delete(path`/files/${fileID}`, options);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(fileID, options) {
    return this._client.get(path`/files/${fileID}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options == null ? void 0 : options.headers]),
      __binaryResponse: true
    });
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
};
class Methods extends APIResource {
}
let Graders$1 = class Graders extends APIResource {
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
  run(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
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
  validate(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
  }
};
class Alpha extends APIResource {
  constructor() {
    super(...arguments);
    this.graders = new Graders$1(this._client);
  }
}
Alpha.Graders = Graders$1;
class Permissions extends APIResource {
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
  create(fineTunedModelCheckpoint, body, options) {
    return this._client.getAPIList(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, Page, { body, method: "post", ...options });
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
  retrieve(fineTunedModelCheckpoint, query = {}, options) {
    return this._client.get(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options
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
  delete(permissionID, params, options) {
    const { fine_tuned_model_checkpoint } = params;
    return this._client.delete(path`/fine_tuning/checkpoints/${fine_tuned_model_checkpoint}/permissions/${permissionID}`, options);
  }
}
let Checkpoints$1 = class Checkpoints extends APIResource {
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints$1.Permissions = Permissions;
class Checkpoints2 extends APIResource {
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
  list(fineTuningJobID, query = {}, options) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, CursorPage, { query, ...options });
  }
}
class Jobs extends APIResource {
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
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
  create(body, options) {
    return this._client.post("/fine_tuning/jobs", { body, ...options });
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
  retrieve(fineTuningJobID, options) {
    return this._client.get(path`/fine_tuning/jobs/${fineTuningJobID}`, options);
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
  list(query = {}, options) {
    return this._client.getAPIList("/fine_tuning/jobs", CursorPage, { query, ...options });
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
  cancel(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/cancel`, options);
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
  listEvents(fineTuningJobID, query = {}, options) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/events`, CursorPage, { query, ...options });
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
  pause(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/pause`, options);
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
  resume(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/resume`, options);
  }
}
Jobs.Checkpoints = Checkpoints2;
class FineTuning extends APIResource {
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints$1(this._client);
    this.alpha = new Alpha(this._client);
  }
}
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.Checkpoints = Checkpoints$1;
FineTuning.Alpha = Alpha;
class GraderModels extends APIResource {
}
class Graders2 extends APIResource {
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
}
Graders2.GraderModels = GraderModels;
class Images extends APIResource {
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
  createVariation(body, options) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }, this._client));
  }
  edit(body, options) {
    return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options, stream: body.stream ?? false }, this._client));
  }
  generate(body, options) {
    return this._client.post("/images/generations", { body, ...options, stream: body.stream ?? false });
  }
}
class Models extends APIResource {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options) {
    return this._client.get(path`/models/${model}`, options);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options) {
    return this._client.getAPIList("/models", Page, options);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  delete(model, options) {
    return this._client.delete(path`/models/${model}`, options);
  }
}
class Moderations extends APIResource {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(body, options) {
    return this._client.post("/moderations", { body, ...options });
  }
}
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  var _a2, _b, _c, _d;
  if (((_b = (_a2 = params.text) == null ? void 0 : _a2.format) == null ? void 0 : _b.type) !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in ((_c = params.text) == null ? void 0 : _c.format)) {
    const text_format = (_d = params.text) == null ? void 0 : _d.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
function hasAutoParseableInput(params) {
  var _a2;
  if (isAutoParsableResponseFormat((_a2 = params.text) == null ? void 0 : _a2.format)) {
    return true;
  }
  return false;
}
function isAutoParsableTool(tool) {
  return (tool == null ? void 0 : tool["$brand"]) === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
function parseToolCall(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : (inputTool == null ? void 0 : inputTool.strict) ? JSON.parse(toolCall.arguments) : null
  };
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
var _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_beginRequest, _ResponseStream_addEvent, _ResponseStream_endRequest, _ResponseStream_accumulateResponse;
class ResponseStream extends EventStream {
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    __classPrivateFieldSet(this, _ResponseStream_params, params);
  }
  static createResponse(client, params, options) {
    const runner = new ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options,
      headers: { ...options == null ? void 0 : options.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options) {
    var _a2;
    const signal = options == null ? void 0 : options.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream;
    let starting_after = null;
    if ("response_id" in params) {
      stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if ((_a2 = stream.controller.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0);
  }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended)
      return;
    const maybeEmit = (name, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name, event2);
      }
    };
    const response = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
    maybeEmit("event", event);
    switch (event.type) {
      case "response.output_text.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...event,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...event,
            snapshot: output.arguments
          });
        }
        break;
      }
      default:
        maybeEmit(event.type, event);
        break;
    }
  }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0);
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse);
    return parsedResponse;
  }, _ResponseStream_accumulateResponse = function _ResponseStream_accumulateResponse2(event) {
    let snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      if (event.type !== "response.created") {
        throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
      }
      snapshot = __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response);
      return snapshot;
    }
    switch (event.type) {
      case "response.output_item.added": {
        snapshot.output.push(event.item);
        break;
      }
      case "response.content_part.added": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          output.content.push(event.part);
        }
        break;
      }
      case "response.output_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          output.arguments += event.delta;
        }
        break;
      }
      case "response.completed": {
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response);
        break;
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
        }
        const event = pushQueue.shift();
        return { value: event, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
    if (!response)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return response;
  }
}
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
class InputItems extends APIResource {
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
  list(responseID, query = {}, options) {
    return this._client.getAPIList(path`/responses/${responseID}/input_items`, CursorPage, { query, ...options });
  }
}
class Responses extends APIResource {
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems(this._client);
  }
  create(body, options) {
    return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseID, query = {}, options) {
    return this._client.get(path`/responses/${responseID}`, {
      query,
      ...options,
      stream: (query == null ? void 0 : query.stream) ?? false
    })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
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
  delete(responseID, options) {
    return this._client.delete(path`/responses/${responseID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options == null ? void 0 : options.headers])
    });
  }
  parse(body, options) {
    return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options) {
    return ResponseStream.createResponse(this._client, body, options);
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
  cancel(responseID, options) {
    return this._client.post(path`/responses/${responseID}/cancel`, options);
  }
}
Responses.InputItems = InputItems;
class Parts extends APIResource {
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
  create(uploadID, body, options) {
    return this._client.post(path`/uploads/${uploadID}/parts`, multipartFormRequestOptions({ body, ...options }, this._client));
  }
}
class Uploads extends APIResource {
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
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
  create(body, options) {
    return this._client.post("/uploads", { body, ...options });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadID, options) {
    return this._client.post(path`/uploads/${uploadID}/cancel`, options);
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
  complete(uploadID, body, options) {
    return this._client.post(path`/uploads/${uploadID}/complete`, { body, ...options });
  }
}
Uploads.Parts = Parts;
const allSettledWithThrow = async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
};
class FileBatches extends APIResource {
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/file_batches`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(batchID, params, options) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/file_batches/${batchID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(batchID, params, options) {
    const { vector_store_id } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/cancel`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }
  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(batchID, params, options) {
    const { vector_store_id, ...query } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/files`, CursorPage, { query, ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers]) });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreID, batchID, options) {
    var _a2;
    const headers = buildHeaders([
      options == null ? void 0 : options.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((_a2 = options == null ? void 0 : options.pollIntervalMs) == null ? void 0 : _a2.toString()) ?? void 0
      }
    ]);
    while (true) {
      const { data: batch, response } = await this.retrieve(batchID, { vector_store_id: vectorStoreID }, {
        ...options,
        headers
      }).withResponse();
      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options == null ? void 0 : options.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
    if (files == null || files.length == 0) {
      throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
    }
    const configuredConcurrency = (options == null ? void 0 : options.maxConcurrency) ?? 5;
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);
    const client = this._client;
    const fileIterator = files.values();
    const allFileIds = [...fileIds];
    async function processFiles(iterator) {
      for (let item of iterator) {
        const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
        allFileIds.push(fileObj.id);
      }
    }
    const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
    await allSettledWithThrow(workers);
    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds
    });
  }
}
class Files3 extends APIResource {
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/files`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(fileID, params, options) {
    const { vector_store_id, ...body } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Returns a list of vector store files.
   */
  list(vectorStoreID, query = {}, options) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/files`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  delete(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.delete(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const file = await this.create(vectorStoreId, body, options);
    return await this.poll(vectorStoreId, file.id, options);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreID, fileID, options) {
    var _a2;
    const headers = buildHeaders([
      options == null ? void 0 : options.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((_a2 = options == null ? void 0 : options.pollIntervalMs) == null ? void 0 : _a2.toString()) ?? void 0
      }
    ]);
    while (true) {
      const fileResponse = await this.retrieve(fileID, {
        vector_store_id: vectorStoreID
      }, { ...options, headers }).withResponse();
      const file = fileResponse.data;
      switch (file.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options == null ? void 0 : options.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "completed":
          return file;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options) {
    const fileInfo = await this.upload(vectorStoreId, file, options);
    return await this.poll(vectorStoreId, fileInfo.id, options);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/files/${fileID}/content`, Page, { ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers]) });
  }
}
class VectorStores extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files3(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options) {
    return this._client.post("/vector_stores", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreID, options) {
    return this._client.get(path`/vector_stores/${vectorStoreID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Returns a list of vector stores.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/vector_stores", CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Delete a vector store.
   */
  delete(vectorStoreID, options) {
    return this._client.delete(path`/vector_stores/${vectorStoreID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreID, body, options) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/search`, Page, {
      body,
      method: "post",
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options == null ? void 0 : options.headers])
    });
  }
}
VectorStores.Files = Files3;
VectorStores.FileBatches = FileBatches;
var _Webhooks_instances, _Webhooks_validateSecret, _Webhooks_getRequiredHeader;
class Webhooks extends APIResource {
  constructor() {
    super(...arguments);
    _Webhooks_instances.add(this);
  }
  /**
   * Validates that the given payload was sent by OpenAI and parses the payload.
   */
  async unwrap(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    await this.verifySignature(payload, headers, secret, tolerance);
    return JSON.parse(payload);
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
  async verifySignature(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    if (typeof crypto === "undefined" || typeof crypto.subtle.importKey !== "function" || typeof crypto.subtle.verify !== "function") {
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    }
    __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_validateSecret).call(this, secret);
    const headersObj = buildHeaders([headers]).values;
    const signatureHeader = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-signature");
    const timestamp = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-timestamp");
    const webhookId = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-id");
    const timestampSeconds = parseInt(timestamp, 10);
    if (isNaN(timestampSeconds)) {
      throw new InvalidWebhookSignatureError("Invalid webhook timestamp format");
    }
    const nowSeconds = Math.floor(Date.now() / 1e3);
    if (nowSeconds - timestampSeconds > tolerance) {
      throw new InvalidWebhookSignatureError("Webhook timestamp is too old");
    }
    if (timestampSeconds > nowSeconds + tolerance) {
      throw new InvalidWebhookSignatureError("Webhook timestamp is too new");
    }
    const signatures = signatureHeader.split(" ").map((part) => part.startsWith("v1,") ? part.substring(3) : part);
    const decodedSecret = secret.startsWith("whsec_") ? Buffer.from(secret.replace("whsec_", ""), "base64") : Buffer.from(secret, "utf-8");
    const signedPayload = webhookId ? `${webhookId}.${timestamp}.${payload}` : `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey("raw", decodedSecret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    for (const signature of signatures) {
      try {
        const signatureBytes = Buffer.from(signature, "base64");
        const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(signedPayload));
        if (isValid) {
          return;
        }
      } catch {
        continue;
      }
    }
    throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
  }
}
_Webhooks_instances = /* @__PURE__ */ new WeakSet(), _Webhooks_validateSecret = function _Webhooks_validateSecret2(secret) {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new Error(`The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function`);
  }
}, _Webhooks_getRequiredHeader = function _Webhooks_getRequiredHeader2(headers, name) {
  if (!headers) {
    throw new Error(`Headers are required`);
  }
  const value = headers.get(name);
  if (value === null || value === void 0) {
    throw new Error(`Missing required header: ${name}`);
  }
  return value;
};
var _OpenAI_instances, _a, _OpenAI_encoder, _OpenAI_baseURLOverridden;
class OpenAI {
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
  constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, webhookSecret = readEnv("OPENAI_WEBHOOK_SECRET") ?? null, ...opts } = {}) {
    _OpenAI_instances.add(this);
    _OpenAI_encoder.set(this, void 0);
    this.completions = new Completions2(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files$1(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.webhooks = new Webhooks(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.responses = new Responses(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    if (apiKey === void 0) {
      throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    }
    const options = {
      apiKey,
      organization,
      project,
      webhookSecret,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    this.baseURL = options.baseURL;
    this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
    this.logger = options.logger ?? console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? getDefaultFetch();
    __classPrivateFieldSet(this, _OpenAI_encoder, FallbackEncoder);
    this._options = options;
    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
    this.webhookSecret = webhookSecret;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options) {
    const client = new this.constructor({
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
      ...options
    });
    return client;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values, nulls }) {
    return;
  }
  async authHeaders(opts) {
    return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(query) {
    return stringify(query, { arrayFormat: "brackets" });
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return { method, path: path2, ...opts2 };
    }));
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    var _a2, _b;
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining
    });
    await this.prepareRequest(req, { url, options });
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();
    loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
      retryOfRequestLogID,
      method: options.method,
      url,
      options,
      headers: req.headers
    }));
    if ((_a2 = options.signal) == null ? void 0 : _a2.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if ((_b = options.signal) == null ? void 0 : _b.aborted) {
        throw new APIUserAbortError();
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: response.message
      }));
      if (isTimeout) {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "x-request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
    const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        await CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
      }
      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }
  getAPIList(path2, Page2, opts) {
    return this.requestAPIList(Page2, { method: "get", path: path2, ...opts });
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null, void 0);
    return new PagePromise(this, request, Page2);
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, method, ...options } = init || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
    const fetchOptions = {
      signal: controller.signal,
      ...isReadableBody ? { duplex: "half" } : {},
      method: "GET",
      ...options
    };
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      return await this.fetch.call(void 0, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders == null ? void 0 : responseHeaders.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders == null ? void 0 : responseHeaders.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path: path2, query, defaultBaseURL } = options;
    const url = this.buildURL(path2, query, defaultBaseURL);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
    const req = {
      method,
      headers: reqHeaders,
      ...options.signal && { signal: options.signal },
      ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
      ...body && { body },
      ...this.fetchOptions ?? {},
      ...options.fetchOptions ?? {}
    };
    return { req, url, timeout: options.timeout };
  }
  async buildHeaders({ options, method, bodyHeaders, retryCount }) {
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }
    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(retryCount),
        ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
        ...getPlatformHeaders(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers
    ]);
    this.validateHeaders(headers);
    return headers.values;
  }
  buildBody({ options: { body, headers: rawHeaders } }) {
    if (!body) {
      return { bodyHeaders: void 0, body: void 0 };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      body instanceof Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && body instanceof globalThis.ReadableStream
    ) {
      return { bodyHeaders: void 0, body };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
    } else {
      return __classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers });
    }
  }
}
_a = OpenAI, _OpenAI_encoder = /* @__PURE__ */ new WeakMap(), _OpenAI_instances = /* @__PURE__ */ new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden2() {
  return this.baseURL !== "https://api.openai.com/v1";
};
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.InvalidWebhookSignatureError = InvalidWebhookSignatureError;
OpenAI.toFile = toFile;
OpenAI.Completions = Completions2;
OpenAI.Chat = Chat;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files$1;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.Webhooks = Webhooks;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.Uploads = Uploads;
OpenAI.Responses = Responses;
OpenAI.Evals = Evals;
OpenAI.Containers = Containers;
class OpenAITranscriptionService extends BaseTranscriptionService {
  constructor(apiKey) {
    super();
    __publicField(this, "openai");
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: false
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
  async transcribe(request) {
    try {
      this.validateRequest(request);
      console.log(...oo_oo$1(`2318871722_35_6_35_73_4`, "Starting OpenAI transcription for:", request.filePath));
      const transcription = await this.openai.audio.transcriptions.create({
        file: require$$0.createReadStream(request.filePath),
        model: request.model || "whisper-1",
        response_format: "verbose_json",
        language: request.language || void 0
      });
      console.log(...oo_oo$1(`2318871722_44_6_44_64_4`, "OpenAI transcription completed successfully"));
      return {
        success: true,
        text: transcription.text,
        language: transcription.language || request.language,
        duration: transcription.duration
      };
    } catch (error) {
      console.error(...oo_tx$1(`2318871722_52_6_52_57_11`, "OpenAI transcription error:", error));
      let errorMessage = "Erro desconhecido na transcrição";
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Invalid API key") || error.message.includes("Unauthorized")) {
          errorMessage = "API key inválida. Verifique sua chave OpenAI no arquivo .env";
        } else if (error.message.includes("402") || error.message.includes("quota")) {
          errorMessage = "Quota excedida. Verifique seu limite de uso da API OpenAI";
        } else if (error.message.includes("429") || error.message.includes("rate limit")) {
          errorMessage = "Limite de taxa excedido. Tente novamente em alguns minutos";
        } else if (error.message.includes("400") || error.message.includes("Bad Request")) {
          errorMessage = "Requisição inválida. Verifique o formato do arquivo de áudio";
        } else if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
          errorMessage = "Erro interno do servidor OpenAI. Tente novamente mais tarde";
        } else {
          errorMessage = error.message;
        }
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  // Test API key validity
  async testConnection() {
    try {
      await this.openai.models.list();
      return { success: true };
    } catch (error) {
      console.error(...oo_tx$1(`2318871722_87_6_87_57_11`, "OpenAI API key test failed:", error));
      let errorMessage = "Erro ao conectar com a API OpenAI";
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Invalid API key") || error.message.includes("Unauthorized")) {
          errorMessage = "API key inválida. Verifique sua chave OpenAI no arquivo .env";
        } else if (error.message.includes("402") || error.message.includes("quota")) {
          errorMessage = "Quota excedida. Verifique seu limite de uso da API OpenAI";
        } else {
          errorMessage = error.message;
        }
      }
      return { success: false, error: errorMessage };
    }
  }
}
function oo_cm$1() {
  try {
    return (0, eval)("globalThis._console_ninja") || (0, eval)(`/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x1fd864=_0xc145;(function(_0x161e64,_0x199d30){var _0x5ac4fa=_0xc145,_0xe04798=_0x161e64();while(!![]){try{var _0x289a13=parseInt(_0x5ac4fa(0x175))/0x1+parseInt(_0x5ac4fa(0x158))/0x2*(-parseInt(_0x5ac4fa(0xf5))/0x3)+parseInt(_0x5ac4fa(0xe9))/0x4+parseInt(_0x5ac4fa(0x167))/0x5+parseInt(_0x5ac4fa(0x135))/0x6+parseInt(_0x5ac4fa(0xc2))/0x7+parseInt(_0x5ac4fa(0x147))/0x8*(-parseInt(_0x5ac4fa(0x92))/0x9);if(_0x289a13===_0x199d30)break;else _0xe04798['push'](_0xe04798['shift']());}catch(_0x1037ab){_0xe04798['push'](_0xe04798['shift']());}}}(_0x1b35,0x7c015));var G=Object[_0x1fd864(0x166)],V=Object['defineProperty'],ee=Object[_0x1fd864(0xd4)],te=Object[_0x1fd864(0xbc)],ne=Object[_0x1fd864(0xc9)],re=Object['prototype'][_0x1fd864(0x179)],ie=(_0x54694d,_0x420f9c,_0x2027fc,_0x45a95d)=>{var _0x5e707d=_0x1fd864;if(_0x420f9c&&typeof _0x420f9c=='object'||typeof _0x420f9c=='function'){for(let _0x21dddb of te(_0x420f9c))!re[_0x5e707d(0x123)](_0x54694d,_0x21dddb)&&_0x21dddb!==_0x2027fc&&V(_0x54694d,_0x21dddb,{'get':()=>_0x420f9c[_0x21dddb],'enumerable':!(_0x45a95d=ee(_0x420f9c,_0x21dddb))||_0x45a95d[_0x5e707d(0xcc)]});}return _0x54694d;},j=(_0x53583a,_0x316274,_0x4f63db)=>(_0x4f63db=_0x53583a!=null?G(ne(_0x53583a)):{},ie(_0x316274||!_0x53583a||!_0x53583a[_0x1fd864(0xdc)]?V(_0x4f63db,_0x1fd864(0x149),{'value':_0x53583a,'enumerable':!0x0}):_0x4f63db,_0x53583a)),q=class{constructor(_0x2defc5,_0xebb55f,_0x32c1cd,_0x31655b,_0x131b0e,_0x294203){var _0x59a553=_0x1fd864,_0x1e0c94,_0x4ecf3b,_0x3cf91a,_0x318ed0;this[_0x59a553(0xf7)]=_0x2defc5,this[_0x59a553(0x121)]=_0xebb55f,this[_0x59a553(0x106)]=_0x32c1cd,this[_0x59a553(0xf3)]=_0x31655b,this[_0x59a553(0xf0)]=_0x131b0e,this[_0x59a553(0x14e)]=_0x294203,this[_0x59a553(0x87)]=!0x0,this[_0x59a553(0x8c)]=!0x0,this[_0x59a553(0x11e)]=!0x1,this[_0x59a553(0x107)]=!0x1,this[_0x59a553(0x109)]=((_0x4ecf3b=(_0x1e0c94=_0x2defc5[_0x59a553(0xc8)])==null?void 0x0:_0x1e0c94[_0x59a553(0x137)])==null?void 0x0:_0x4ecf3b[_0x59a553(0xe6)])===_0x59a553(0x151),this[_0x59a553(0x81)]=!((_0x318ed0=(_0x3cf91a=this[_0x59a553(0xf7)]['process'])==null?void 0x0:_0x3cf91a[_0x59a553(0x9e)])!=null&&_0x318ed0[_0x59a553(0xca)])&&!this['_inNextEdge'],this[_0x59a553(0x15b)]=null,this[_0x59a553(0xb2)]=0x0,this[_0x59a553(0x9b)]=0x14,this[_0x59a553(0xee)]=_0x59a553(0xb5),this[_0x59a553(0xe2)]=(this[_0x59a553(0x81)]?_0x59a553(0xe3):_0x59a553(0x177))+this['_webSocketErrorDocsLink'];}async[_0x1fd864(0xec)](){var _0x1feded=_0x1fd864,_0x270d70,_0x50eeab;if(this[_0x1feded(0x15b)])return this[_0x1feded(0x15b)];let _0x5d875a;if(this[_0x1feded(0x81)]||this[_0x1feded(0x109)])_0x5d875a=this[_0x1feded(0xf7)][_0x1feded(0x126)];else{if((_0x270d70=this[_0x1feded(0xf7)][_0x1feded(0xc8)])!=null&&_0x270d70['_WebSocket'])_0x5d875a=(_0x50eeab=this['global'][_0x1feded(0xc8)])==null?void 0x0:_0x50eeab['_WebSocket'];else try{let _0x24d766=await import(_0x1feded(0xda));_0x5d875a=(await import((await import(_0x1feded(0x114)))[_0x1feded(0x120)](_0x24d766['join'](this[_0x1feded(0xf3)],'ws/index.js'))[_0x1feded(0x117)]()))['default'];}catch{try{_0x5d875a=require(require('path')['join'](this[_0x1feded(0xf3)],'ws'));}catch{throw new Error('failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket');}}}return this[_0x1feded(0x15b)]=_0x5d875a,_0x5d875a;}[_0x1fd864(0x12d)](){var _0x5bcfae=_0x1fd864;this[_0x5bcfae(0x107)]||this[_0x5bcfae(0x11e)]||this[_0x5bcfae(0xb2)]>=this['_maxConnectAttemptCount']||(this[_0x5bcfae(0x8c)]=!0x1,this[_0x5bcfae(0x107)]=!0x0,this[_0x5bcfae(0xb2)]++,this[_0x5bcfae(0xad)]=new Promise((_0x21f0c0,_0x2a8cde)=>{var _0x1fdd59=_0x5bcfae;this[_0x1fdd59(0xec)]()[_0x1fdd59(0x116)](_0x5079e5=>{var _0x3c771e=_0x1fdd59;let _0x59db1e=new _0x5079e5(_0x3c771e(0x13f)+(!this[_0x3c771e(0x81)]&&this[_0x3c771e(0xf0)]?_0x3c771e(0xcb):this['host'])+':'+this[_0x3c771e(0x106)]);_0x59db1e['onerror']=()=>{var _0xd39d40=_0x3c771e;this[_0xd39d40(0x87)]=!0x1,this[_0xd39d40(0x115)](_0x59db1e),this['_attemptToReconnectShortly'](),_0x2a8cde(new Error(_0xd39d40(0xab)));},_0x59db1e[_0x3c771e(0xa6)]=()=>{var _0x7120f3=_0x3c771e;this['_inBrowser']||_0x59db1e[_0x7120f3(0x161)]&&_0x59db1e[_0x7120f3(0x161)][_0x7120f3(0x95)]&&_0x59db1e[_0x7120f3(0x161)][_0x7120f3(0x95)](),_0x21f0c0(_0x59db1e);},_0x59db1e[_0x3c771e(0xb8)]=()=>{var _0xd802a9=_0x3c771e;this[_0xd802a9(0x8c)]=!0x0,this[_0xd802a9(0x115)](_0x59db1e),this['_attemptToReconnectShortly']();},_0x59db1e['onmessage']=_0x2a4c4d=>{var _0x97f841=_0x3c771e;try{if(!(_0x2a4c4d!=null&&_0x2a4c4d[_0x97f841(0xa5)])||!this[_0x97f841(0x14e)])return;let _0x37e5dc=JSON[_0x97f841(0xbe)](_0x2a4c4d['data']);this['eventReceivedCallback'](_0x37e5dc['method'],_0x37e5dc[_0x97f841(0x170)],this[_0x97f841(0xf7)],this[_0x97f841(0x81)]);}catch{}};})['then'](_0x132e18=>(this[_0x1fdd59(0x11e)]=!0x0,this[_0x1fdd59(0x107)]=!0x1,this[_0x1fdd59(0x8c)]=!0x1,this[_0x1fdd59(0x87)]=!0x0,this[_0x1fdd59(0xb2)]=0x0,_0x132e18))[_0x1fdd59(0x134)](_0x5b8932=>(this[_0x1fdd59(0x11e)]=!0x1,this[_0x1fdd59(0x107)]=!0x1,console['warn'](_0x1fdd59(0x128)+this[_0x1fdd59(0xee)]),_0x2a8cde(new Error(_0x1fdd59(0x10d)+(_0x5b8932&&_0x5b8932[_0x1fdd59(0x102)])))));}));}[_0x1fd864(0x115)](_0x35cb1d){var _0x4d75b9=_0x1fd864;this['_connected']=!0x1,this[_0x4d75b9(0x107)]=!0x1;try{_0x35cb1d[_0x4d75b9(0xb8)]=null,_0x35cb1d[_0x4d75b9(0xce)]=null,_0x35cb1d[_0x4d75b9(0xa6)]=null;}catch{}try{_0x35cb1d[_0x4d75b9(0xb1)]<0x2&&_0x35cb1d[_0x4d75b9(0x11f)]();}catch{}}[_0x1fd864(0x10e)](){var _0x1c284a=_0x1fd864;clearTimeout(this[_0x1c284a(0xbf)]),!(this[_0x1c284a(0xb2)]>=this['_maxConnectAttemptCount'])&&(this[_0x1c284a(0xbf)]=setTimeout(()=>{var _0x575fc7=_0x1c284a,_0x47e91a;this[_0x575fc7(0x11e)]||this[_0x575fc7(0x107)]||(this['_connectToHostNow'](),(_0x47e91a=this[_0x575fc7(0xad)])==null||_0x47e91a['catch'](()=>this[_0x575fc7(0x10e)]()));},0x1f4),this[_0x1c284a(0xbf)][_0x1c284a(0x95)]&&this[_0x1c284a(0xbf)]['unref']());}async[_0x1fd864(0xd5)](_0xfed7f2){var _0xbcae47=_0x1fd864;try{if(!this[_0xbcae47(0x87)])return;this['_allowedToConnectOnSend']&&this[_0xbcae47(0x12d)](),(await this[_0xbcae47(0xad)])['send'](JSON[_0xbcae47(0xd3)](_0xfed7f2));}catch(_0x3528b1){this['_extendedWarning']?console[_0xbcae47(0x159)](this[_0xbcae47(0xe2)]+':\\x20'+(_0x3528b1&&_0x3528b1[_0xbcae47(0x102)])):(this[_0xbcae47(0x111)]=!0x0,console[_0xbcae47(0x159)](this[_0xbcae47(0xe2)]+':\\x20'+(_0x3528b1&&_0x3528b1['message']),_0xfed7f2)),this[_0xbcae47(0x87)]=!0x1,this[_0xbcae47(0x10e)]();}}};function H(_0x34a872,_0x4d9e64,_0x192be1,_0x3db0cc,_0x1e475b,_0x365e19,_0x5355f3,_0x97df06=oe){var _0x2c3ce4=_0x1fd864;let _0x3bd4b7=_0x192be1[_0x2c3ce4(0x112)](',')['map'](_0x28d0b2=>{var _0x503812=_0x2c3ce4,_0x582326,_0x3b71ac,_0x9a7f7a,_0x187985;try{if(!_0x34a872[_0x503812(0x8f)]){let _0x2391d4=((_0x3b71ac=(_0x582326=_0x34a872[_0x503812(0xc8)])==null?void 0x0:_0x582326[_0x503812(0x9e)])==null?void 0x0:_0x3b71ac['node'])||((_0x187985=(_0x9a7f7a=_0x34a872[_0x503812(0xc8)])==null?void 0x0:_0x9a7f7a[_0x503812(0x137)])==null?void 0x0:_0x187985[_0x503812(0xe6)])===_0x503812(0x151);(_0x1e475b===_0x503812(0xdf)||_0x1e475b==='remix'||_0x1e475b==='astro'||_0x1e475b===_0x503812(0x174))&&(_0x1e475b+=_0x2391d4?_0x503812(0x108):'\\x20browser'),_0x34a872[_0x503812(0x8f)]={'id':+new Date(),'tool':_0x1e475b},_0x5355f3&&_0x1e475b&&!_0x2391d4&&console['log'](_0x503812(0x160)+(_0x1e475b[_0x503812(0x119)](0x0)[_0x503812(0xfb)]()+_0x1e475b[_0x503812(0xf9)](0x1))+',',_0x503812(0xc1),_0x503812(0xb4));}let _0x2e2542=new q(_0x34a872,_0x4d9e64,_0x28d0b2,_0x3db0cc,_0x365e19,_0x97df06);return _0x2e2542['send'][_0x503812(0x80)](_0x2e2542);}catch(_0xe4b2d4){return console[_0x503812(0x159)](_0x503812(0x168),_0xe4b2d4&&_0xe4b2d4['message']),()=>{};}});return _0x52d327=>_0x3bd4b7[_0x2c3ce4(0x150)](_0x519c27=>_0x519c27(_0x52d327));}function _0xc145(_0xfda6ff,_0x5bc7d2){var _0x1b351a=_0x1b35();return _0xc145=function(_0xc1458f,_0x3b9943){_0xc1458f=_0xc1458f-0x7f;var _0x551e9a=_0x1b351a[_0xc1458f];return _0x551e9a;},_0xc145(_0xfda6ff,_0x5bc7d2);}function _0x1b35(){var _0xe68bc4=['_cleanNode','_addLoadNode','elapsed','data','onopen','sort','autoExpand','boolean','prototype','logger\\x20websocket\\x20error','origin','_ws','_hasSetOnItsPath','[object\\x20BigInt]','replace','readyState','_connectAttemptCount','Boolean','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','https://tinyurl.com/37x8b79t','reload','undefined','onclose','bigint','root_exp_id','funcName','getOwnPropertyNames','concat','parse','_reconnectTimeout','_setNodeExpandableState','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)','3578708gFpXvc','reduceLimits','getter','name','negativeInfinity','sortProps','process','getPrototypeOf','node','gateway.docker.internal','enumerable','[object\\x20Map]','onerror','isExpressionToEvaluate','_setNodeId','pop','count','stringify','getOwnPropertyDescriptor','send','_ninjaIgnoreNextError','_regExpToString','test','level','path','includes','__es'+'Module','now','1','next.js','','positiveInfinity','_sendErrorMessage','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','String','push','NEXT_RUNTIME','_HTMLAllCollection','_p_length','139528NyjUDG','_isPrimitiveType','constructor','getWebSocketClass','_isNegativeZero','_webSocketErrorDocsLink','_type','dockerizedApp','resolveGetters','depth','nodeModules','_setNodeQueryPath','1965zUXaXA','autoExpandPropertyCount','global','type','substr',["localhost","127.0.0.1","example.cypress.io","DESKNIK","10.0.0.106"],'toUpperCase','hostname','allStrLength','startsWith','[object\\x20Set]','array','trace','message','_treeNodePropertiesBeforeFullValue','Error','_setNodePermissions','port','_connecting','\\x20server','_inNextEdge','_sortProps','function','_undefined','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','_attemptToReconnectShortly','_capIfString','coverage','_extendedWarning','split','expId','url','_disposeWebsocket','then','toString','unknown','charAt','_getOwnPropertyNames','string','...','autoExpandPreviousObjects','_connected','close','pathToFileURL','host','map','call','value','_Symbol','WebSocket','autoExpandLimit','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20','capped','slice','_setNodeExpressionPath','_propertyName','_connectToHostNow','negativeZero','_isMap','_getOwnPropertyDescriptor','_addProperty','expressionsToEvaluate','_property','catch','773022JINmzd','_dateToString','env','_console_ninja','cappedProps','length','_setNodeLabel','number','POSITIVE_INFINITY','nan','ws://','error','props','setter','elements','stackTraceLimit','some','set','1696tKAKvD','cappedElements','default','current','_getOwnPropertySymbols','','_hasMapOnItsPath','eventReceivedCallback','valueOf','forEach','edge','date','location','1754402960519','serialize','63911','Symbol','404ozamGy','warn','totalStrLength','_WebSocketClass','_addObjectProperty','hrtime','_treeNodePropertiesAfterFullValue','object','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_socket','log','_processTreeNodeResult','_addFunctionsNode','_blacklistedProperty','create','3448505qTcTrz','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_consoleNinjaAllowedToStart','_isSet','strLength','fromCharCode','timeStamp','noFunctions',"c:\\\\Users\\\\deskn\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.463\\\\node_modules",'args','Map','time','getOwnPropertySymbols','angular','417403iHdthw','isArray','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20','_objectToString','hasOwnProperty','autoExpandMaxDepth','_additionalMetadata','bind','_inBrowser','Number','symbol','_p_name','parent','null','_allowedToSend','disabledLog','match','endsWith','127.0.0.1','_allowedToConnectOnSend','[object\\x20Array]','_isPrimitiveWrapperType','_console_ninja_session','root_exp','console','48474MlkxnC','get','1.0.0','unref','_quotedRegExp','unshift','stack','_isUndefined','hits','_maxConnectAttemptCount','index','NEGATIVE_INFINITY','versions','_p_','Set','Buffer'];_0x1b35=function(){return _0xe68bc4;};return _0x1b35();}function oe(_0x176a5b,_0x3663dd,_0x386391,_0x250b1c){var _0x55a837=_0x1fd864;_0x250b1c&&_0x176a5b===_0x55a837(0xb6)&&_0x386391[_0x55a837(0x153)][_0x55a837(0xb6)]();}function B(_0x2b0bf1){var _0x41f003=_0x1fd864,_0x27183c,_0x5e450a;let _0x53cbd6=function(_0x3741cd,_0x38156f){return _0x38156f-_0x3741cd;},_0x57d76c;if(_0x2b0bf1['performance'])_0x57d76c=function(){var _0x1c4f31=_0xc145;return _0x2b0bf1['performance'][_0x1c4f31(0xdd)]();};else{if(_0x2b0bf1[_0x41f003(0xc8)]&&_0x2b0bf1[_0x41f003(0xc8)][_0x41f003(0x15d)]&&((_0x5e450a=(_0x27183c=_0x2b0bf1[_0x41f003(0xc8)])==null?void 0x0:_0x27183c[_0x41f003(0x137)])==null?void 0x0:_0x5e450a['NEXT_RUNTIME'])!==_0x41f003(0x151))_0x57d76c=function(){var _0x2b6f8a=_0x41f003;return _0x2b0bf1[_0x2b6f8a(0xc8)][_0x2b6f8a(0x15d)]();},_0x53cbd6=function(_0x3674e8,_0x22a469){return 0x3e8*(_0x22a469[0x0]-_0x3674e8[0x0])+(_0x22a469[0x1]-_0x3674e8[0x1])/0xf4240;};else try{let {performance:_0x1c4602}=require('perf_hooks');_0x57d76c=function(){var _0x2fd5b1=_0x41f003;return _0x1c4602[_0x2fd5b1(0xdd)]();};}catch{_0x57d76c=function(){return+new Date();};}}return{'elapsed':_0x53cbd6,'timeStamp':_0x57d76c,'now':()=>Date[_0x41f003(0xdd)]()};}function X(_0x5d516a,_0x158d16,_0x1ea3a7){var _0x2a8361=_0x1fd864,_0x18601a,_0x35e1a7,_0x314c37,_0x5ec9b3,_0x54b215;if(_0x5d516a[_0x2a8361(0x169)]!==void 0x0)return _0x5d516a[_0x2a8361(0x169)];let _0x2f9953=((_0x35e1a7=(_0x18601a=_0x5d516a[_0x2a8361(0xc8)])==null?void 0x0:_0x18601a[_0x2a8361(0x9e)])==null?void 0x0:_0x35e1a7['node'])||((_0x5ec9b3=(_0x314c37=_0x5d516a[_0x2a8361(0xc8)])==null?void 0x0:_0x314c37['env'])==null?void 0x0:_0x5ec9b3[_0x2a8361(0xe6)])===_0x2a8361(0x151);function _0x2afa65(_0x7a5ff5){var _0x8e866c=_0x2a8361;if(_0x7a5ff5[_0x8e866c(0xfe)]('/')&&_0x7a5ff5[_0x8e866c(0x8a)]('/')){let _0x53348a=new RegExp(_0x7a5ff5[_0x8e866c(0x12a)](0x1,-0x1));return _0x550922=>_0x53348a[_0x8e866c(0xd8)](_0x550922);}else{if(_0x7a5ff5[_0x8e866c(0xdb)]('*')||_0x7a5ff5['includes']('?')){let _0xfeea3d=new RegExp('^'+_0x7a5ff5['replace'](/\\./g,String[_0x8e866c(0x16c)](0x5c)+'.')[_0x8e866c(0xb0)](/\\*/g,'.*')[_0x8e866c(0xb0)](/\\?/g,'.')+String['fromCharCode'](0x24));return _0x252eaa=>_0xfeea3d['test'](_0x252eaa);}else return _0xfc4410=>_0xfc4410===_0x7a5ff5;}}let _0x129767=_0x158d16[_0x2a8361(0x122)](_0x2afa65);return _0x5d516a[_0x2a8361(0x169)]=_0x2f9953||!_0x158d16,!_0x5d516a['_consoleNinjaAllowedToStart']&&((_0x54b215=_0x5d516a[_0x2a8361(0x153)])==null?void 0x0:_0x54b215[_0x2a8361(0xfc)])&&(_0x5d516a['_consoleNinjaAllowedToStart']=_0x129767[_0x2a8361(0x145)](_0x1babbb=>_0x1babbb(_0x5d516a[_0x2a8361(0x153)][_0x2a8361(0xfc)]))),_0x5d516a[_0x2a8361(0x169)];}function J(_0x274c7d,_0x594f94,_0x1fe9bb,_0x17209b){var _0x54bbb6=_0x1fd864;_0x274c7d=_0x274c7d,_0x594f94=_0x594f94,_0x1fe9bb=_0x1fe9bb,_0x17209b=_0x17209b;let _0x57cf3f=B(_0x274c7d),_0x4f599c=_0x57cf3f[_0x54bbb6(0xa4)],_0x7d7510=_0x57cf3f['timeStamp'];class _0x520123{constructor(){var _0x89bdcd=_0x54bbb6;this['_keyStrRegExp']=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this['_numberRegExp']=/^(0|[1-9][0-9]*)$/,this[_0x89bdcd(0x96)]=/'([^\\\\']|\\\\')*'/,this[_0x89bdcd(0x10c)]=_0x274c7d[_0x89bdcd(0xb7)],this[_0x89bdcd(0xe7)]=_0x274c7d['HTMLAllCollection'],this[_0x89bdcd(0x130)]=Object['getOwnPropertyDescriptor'],this['_getOwnPropertyNames']=Object[_0x89bdcd(0xbc)],this[_0x89bdcd(0x125)]=_0x274c7d[_0x89bdcd(0x157)],this[_0x89bdcd(0xd7)]=RegExp[_0x89bdcd(0xaa)][_0x89bdcd(0x117)],this[_0x89bdcd(0x136)]=Date[_0x89bdcd(0xaa)][_0x89bdcd(0x117)];}[_0x54bbb6(0x155)](_0x12c564,_0x398eff,_0x24a950,_0x510df2){var _0x171f19=_0x54bbb6,_0x5882b1=this,_0x32bec8=_0x24a950[_0x171f19(0xa8)];function _0x471d2e(_0x4740ef,_0x209807,_0x4d3b5b){var _0x4f354e=_0x171f19;_0x209807[_0x4f354e(0xf8)]=_0x4f354e(0x118),_0x209807['error']=_0x4740ef[_0x4f354e(0x102)],_0x261598=_0x4d3b5b[_0x4f354e(0xca)][_0x4f354e(0x14a)],_0x4d3b5b[_0x4f354e(0xca)][_0x4f354e(0x14a)]=_0x209807,_0x5882b1[_0x4f354e(0x103)](_0x209807,_0x4d3b5b);}let _0x18447b;_0x274c7d[_0x171f19(0x91)]&&(_0x18447b=_0x274c7d[_0x171f19(0x91)][_0x171f19(0x140)],_0x18447b&&(_0x274c7d['console']['error']=function(){}));try{try{_0x24a950[_0x171f19(0xd9)]++,_0x24a950[_0x171f19(0xa8)]&&_0x24a950['autoExpandPreviousObjects'][_0x171f19(0xe5)](_0x398eff);var _0x50ffce,_0x18e964,_0x409e8c,_0x3d696f,_0x2de392=[],_0x19220f=[],_0xf6729b,_0x259485=this['_type'](_0x398eff),_0x26fb44=_0x259485==='array',_0x2855ee=!0x1,_0x46640c=_0x259485===_0x171f19(0x10b),_0x55ac38=this[_0x171f19(0xea)](_0x259485),_0x32d4c3=this['_isPrimitiveWrapperType'](_0x259485),_0x5dea83=_0x55ac38||_0x32d4c3,_0x113bb1={},_0x12d26c=0x0,_0x1e966c=!0x1,_0x261598,_0x536375=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x24a950[_0x171f19(0xf2)]){if(_0x26fb44){if(_0x18e964=_0x398eff[_0x171f19(0x13a)],_0x18e964>_0x24a950['elements']){for(_0x409e8c=0x0,_0x3d696f=_0x24a950['elements'],_0x50ffce=_0x409e8c;_0x50ffce<_0x3d696f;_0x50ffce++)_0x19220f['push'](_0x5882b1[_0x171f19(0x131)](_0x2de392,_0x398eff,_0x259485,_0x50ffce,_0x24a950));_0x12c564[_0x171f19(0x148)]=!0x0;}else{for(_0x409e8c=0x0,_0x3d696f=_0x18e964,_0x50ffce=_0x409e8c;_0x50ffce<_0x3d696f;_0x50ffce++)_0x19220f[_0x171f19(0xe5)](_0x5882b1[_0x171f19(0x131)](_0x2de392,_0x398eff,_0x259485,_0x50ffce,_0x24a950));}_0x24a950[_0x171f19(0xf6)]+=_0x19220f[_0x171f19(0x13a)];}if(!(_0x259485==='null'||_0x259485==='undefined')&&!_0x55ac38&&_0x259485!==_0x171f19(0xe4)&&_0x259485!==_0x171f19(0xa1)&&_0x259485!=='bigint'){var _0x5ec92e=_0x510df2[_0x171f19(0x141)]||_0x24a950[_0x171f19(0x141)];if(this['_isSet'](_0x398eff)?(_0x50ffce=0x0,_0x398eff[_0x171f19(0x150)](function(_0x18b29c){var _0x28c627=_0x171f19;if(_0x12d26c++,_0x24a950[_0x28c627(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;return;}if(!_0x24a950[_0x28c627(0xcf)]&&_0x24a950[_0x28c627(0xa8)]&&_0x24a950[_0x28c627(0xf6)]>_0x24a950[_0x28c627(0x127)]){_0x1e966c=!0x0;return;}_0x19220f[_0x28c627(0xe5)](_0x5882b1[_0x28c627(0x131)](_0x2de392,_0x398eff,_0x28c627(0xa0),_0x50ffce++,_0x24a950,function(_0x5ef35a){return function(){return _0x5ef35a;};}(_0x18b29c)));})):this['_isMap'](_0x398eff)&&_0x398eff[_0x171f19(0x150)](function(_0x20c50e,_0xa7d00f){var _0x252158=_0x171f19;if(_0x12d26c++,_0x24a950[_0x252158(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;return;}if(!_0x24a950['isExpressionToEvaluate']&&_0x24a950['autoExpand']&&_0x24a950[_0x252158(0xf6)]>_0x24a950[_0x252158(0x127)]){_0x1e966c=!0x0;return;}var _0x3a5c9e=_0xa7d00f[_0x252158(0x117)]();_0x3a5c9e['length']>0x64&&(_0x3a5c9e=_0x3a5c9e['slice'](0x0,0x64)+_0x252158(0x11c)),_0x19220f['push'](_0x5882b1[_0x252158(0x131)](_0x2de392,_0x398eff,_0x252158(0x171),_0x3a5c9e,_0x24a950,function(_0x54cecb){return function(){return _0x54cecb;};}(_0x20c50e)));}),!_0x2855ee){try{for(_0xf6729b in _0x398eff)if(!(_0x26fb44&&_0x536375[_0x171f19(0xd8)](_0xf6729b))&&!this[_0x171f19(0x165)](_0x398eff,_0xf6729b,_0x24a950)){if(_0x12d26c++,_0x24a950[_0x171f19(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;break;}if(!_0x24a950[_0x171f19(0xcf)]&&_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0xf6)]>_0x24a950['autoExpandLimit']){_0x1e966c=!0x0;break;}_0x19220f['push'](_0x5882b1['_addObjectProperty'](_0x2de392,_0x113bb1,_0x398eff,_0x259485,_0xf6729b,_0x24a950));}}catch{}if(_0x113bb1[_0x171f19(0xe8)]=!0x0,_0x46640c&&(_0x113bb1[_0x171f19(0x84)]=!0x0),!_0x1e966c){var _0x1399e2=[][_0x171f19(0xbd)](this[_0x171f19(0x11a)](_0x398eff))[_0x171f19(0xbd)](this[_0x171f19(0x14b)](_0x398eff));for(_0x50ffce=0x0,_0x18e964=_0x1399e2[_0x171f19(0x13a)];_0x50ffce<_0x18e964;_0x50ffce++)if(_0xf6729b=_0x1399e2[_0x50ffce],!(_0x26fb44&&_0x536375[_0x171f19(0xd8)](_0xf6729b[_0x171f19(0x117)]()))&&!this[_0x171f19(0x165)](_0x398eff,_0xf6729b,_0x24a950)&&!_0x113bb1[_0x171f19(0x9f)+_0xf6729b[_0x171f19(0x117)]()]){if(_0x12d26c++,_0x24a950[_0x171f19(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;break;}if(!_0x24a950['isExpressionToEvaluate']&&_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0xf6)]>_0x24a950[_0x171f19(0x127)]){_0x1e966c=!0x0;break;}_0x19220f[_0x171f19(0xe5)](_0x5882b1[_0x171f19(0x15c)](_0x2de392,_0x113bb1,_0x398eff,_0x259485,_0xf6729b,_0x24a950));}}}}}if(_0x12c564[_0x171f19(0xf8)]=_0x259485,_0x5dea83?(_0x12c564[_0x171f19(0x124)]=_0x398eff[_0x171f19(0x14f)](),this[_0x171f19(0x10f)](_0x259485,_0x12c564,_0x24a950,_0x510df2)):_0x259485===_0x171f19(0x152)?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0x136)]['call'](_0x398eff):_0x259485==='bigint'?_0x12c564['value']=_0x398eff[_0x171f19(0x117)]():_0x259485==='RegExp'?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0xd7)][_0x171f19(0x123)](_0x398eff):_0x259485==='symbol'&&this[_0x171f19(0x125)]?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0x125)][_0x171f19(0xaa)][_0x171f19(0x117)][_0x171f19(0x123)](_0x398eff):!_0x24a950[_0x171f19(0xf2)]&&!(_0x259485===_0x171f19(0x86)||_0x259485==='undefined')&&(delete _0x12c564[_0x171f19(0x124)],_0x12c564['capped']=!0x0),_0x1e966c&&(_0x12c564[_0x171f19(0x139)]=!0x0),_0x261598=_0x24a950[_0x171f19(0xca)][_0x171f19(0x14a)],_0x24a950['node'][_0x171f19(0x14a)]=_0x12c564,this['_treeNodePropertiesBeforeFullValue'](_0x12c564,_0x24a950),_0x19220f[_0x171f19(0x13a)]){for(_0x50ffce=0x0,_0x18e964=_0x19220f[_0x171f19(0x13a)];_0x50ffce<_0x18e964;_0x50ffce++)_0x19220f[_0x50ffce](_0x50ffce);}_0x2de392[_0x171f19(0x13a)]&&(_0x12c564['props']=_0x2de392);}catch(_0x313923){_0x471d2e(_0x313923,_0x12c564,_0x24a950);}this[_0x171f19(0x7f)](_0x398eff,_0x12c564),this[_0x171f19(0x15e)](_0x12c564,_0x24a950),_0x24a950['node']['current']=_0x261598,_0x24a950['level']--,_0x24a950[_0x171f19(0xa8)]=_0x32bec8,_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0x11d)][_0x171f19(0xd1)]();}finally{_0x18447b&&(_0x274c7d['console'][_0x171f19(0x140)]=_0x18447b);}return _0x12c564;}['_getOwnPropertySymbols'](_0x25460a){var _0x2b5b6a=_0x54bbb6;return Object[_0x2b5b6a(0x173)]?Object[_0x2b5b6a(0x173)](_0x25460a):[];}[_0x54bbb6(0x16a)](_0x290900){var _0x52acd1=_0x54bbb6;return!!(_0x290900&&_0x274c7d[_0x52acd1(0xa0)]&&this[_0x52acd1(0x178)](_0x290900)===_0x52acd1(0xff)&&_0x290900[_0x52acd1(0x150)]);}[_0x54bbb6(0x165)](_0x1f363d,_0x44e206,_0x50ac1a){var _0x2241ae=_0x54bbb6;return _0x50ac1a[_0x2241ae(0x16e)]?typeof _0x1f363d[_0x44e206]=='function':!0x1;}[_0x54bbb6(0xef)](_0x4deed1){var _0x1d5037=_0x54bbb6,_0x2fc110='';return _0x2fc110=typeof _0x4deed1,_0x2fc110===_0x1d5037(0x15f)?this[_0x1d5037(0x178)](_0x4deed1)==='[object\\x20Array]'?_0x2fc110=_0x1d5037(0x100):this[_0x1d5037(0x178)](_0x4deed1)==='[object\\x20Date]'?_0x2fc110='date':this[_0x1d5037(0x178)](_0x4deed1)===_0x1d5037(0xaf)?_0x2fc110=_0x1d5037(0xb9):_0x4deed1===null?_0x2fc110=_0x1d5037(0x86):_0x4deed1[_0x1d5037(0xeb)]&&(_0x2fc110=_0x4deed1[_0x1d5037(0xeb)][_0x1d5037(0xc5)]||_0x2fc110):_0x2fc110===_0x1d5037(0xb7)&&this[_0x1d5037(0xe7)]&&_0x4deed1 instanceof this[_0x1d5037(0xe7)]&&(_0x2fc110='HTMLAllCollection'),_0x2fc110;}[_0x54bbb6(0x178)](_0x7051d6){var _0x1891a9=_0x54bbb6;return Object[_0x1891a9(0xaa)][_0x1891a9(0x117)][_0x1891a9(0x123)](_0x7051d6);}['_isPrimitiveType'](_0x389f06){var _0x297bf2=_0x54bbb6;return _0x389f06===_0x297bf2(0xa9)||_0x389f06==='string'||_0x389f06===_0x297bf2(0x13c);}[_0x54bbb6(0x8e)](_0x2b2617){var _0x38de67=_0x54bbb6;return _0x2b2617===_0x38de67(0xb3)||_0x2b2617===_0x38de67(0xe4)||_0x2b2617===_0x38de67(0x82);}['_addProperty'](_0xbfa4f4,_0x6cd504,_0x484e0a,_0x283e2d,_0x1f123f,_0x5309b8){var _0x2bb943=this;return function(_0x1d4205){var _0x4bddc8=_0xc145,_0x274fd6=_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x14a)],_0x18d7ca=_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x9c)],_0x49f1d0=_0x1f123f['node']['parent'];_0x1f123f[_0x4bddc8(0xca)]['parent']=_0x274fd6,_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x9c)]=typeof _0x283e2d==_0x4bddc8(0x13c)?_0x283e2d:_0x1d4205,_0xbfa4f4['push'](_0x2bb943[_0x4bddc8(0x133)](_0x6cd504,_0x484e0a,_0x283e2d,_0x1f123f,_0x5309b8)),_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x85)]=_0x49f1d0,_0x1f123f['node'][_0x4bddc8(0x9c)]=_0x18d7ca;};}[_0x54bbb6(0x15c)](_0x9cbb5c,_0x12846c,_0x5ee924,_0x3a4d82,_0x5f4ddc,_0x484ae2,_0x4d2bdf){var _0x168bd5=_0x54bbb6,_0x2eef81=this;return _0x12846c[_0x168bd5(0x9f)+_0x5f4ddc[_0x168bd5(0x117)]()]=!0x0,function(_0x44d082){var _0x78824f=_0x168bd5,_0xc3468c=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x14a)],_0x4ca4ec=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x9c)],_0x43cd57=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x85)];_0x484ae2[_0x78824f(0xca)][_0x78824f(0x85)]=_0xc3468c,_0x484ae2[_0x78824f(0xca)]['index']=_0x44d082,_0x9cbb5c[_0x78824f(0xe5)](_0x2eef81[_0x78824f(0x133)](_0x5ee924,_0x3a4d82,_0x5f4ddc,_0x484ae2,_0x4d2bdf)),_0x484ae2['node'][_0x78824f(0x85)]=_0x43cd57,_0x484ae2[_0x78824f(0xca)]['index']=_0x4ca4ec;};}[_0x54bbb6(0x133)](_0x233576,_0x54e8bc,_0x382b29,_0x19fffe,_0x18e9ed){var _0x3fa53e=_0x54bbb6,_0x5e9d19=this;_0x18e9ed||(_0x18e9ed=function(_0x5b2f18,_0x1a10a5){return _0x5b2f18[_0x1a10a5];});var _0x181cf5=_0x382b29[_0x3fa53e(0x117)](),_0x41ea3c=_0x19fffe[_0x3fa53e(0x132)]||{},_0x562384=_0x19fffe['depth'],_0x37636d=_0x19fffe[_0x3fa53e(0xcf)];try{var _0x1462ad=this[_0x3fa53e(0x12f)](_0x233576),_0x48c5f8=_0x181cf5;_0x1462ad&&_0x48c5f8[0x0]==='\\x27'&&(_0x48c5f8=_0x48c5f8['substr'](0x1,_0x48c5f8['length']-0x2));var _0x4dfee=_0x19fffe[_0x3fa53e(0x132)]=_0x41ea3c['_p_'+_0x48c5f8];_0x4dfee&&(_0x19fffe[_0x3fa53e(0xf2)]=_0x19fffe[_0x3fa53e(0xf2)]+0x1),_0x19fffe[_0x3fa53e(0xcf)]=!!_0x4dfee;var _0x332612=typeof _0x382b29==_0x3fa53e(0x83),_0x1afc9a={'name':_0x332612||_0x1462ad?_0x181cf5:this[_0x3fa53e(0x12c)](_0x181cf5)};if(_0x332612&&(_0x1afc9a['symbol']=!0x0),!(_0x54e8bc===_0x3fa53e(0x100)||_0x54e8bc===_0x3fa53e(0x104))){var _0x3dcb87=this[_0x3fa53e(0x130)](_0x233576,_0x382b29);if(_0x3dcb87&&(_0x3dcb87[_0x3fa53e(0x146)]&&(_0x1afc9a[_0x3fa53e(0x142)]=!0x0),_0x3dcb87[_0x3fa53e(0x93)]&&!_0x4dfee&&!_0x19fffe[_0x3fa53e(0xf1)]))return _0x1afc9a[_0x3fa53e(0xc4)]=!0x0,this[_0x3fa53e(0x163)](_0x1afc9a,_0x19fffe),_0x1afc9a;}var _0x4c74c6;try{_0x4c74c6=_0x18e9ed(_0x233576,_0x382b29);}catch(_0x425f95){return _0x1afc9a={'name':_0x181cf5,'type':_0x3fa53e(0x118),'error':_0x425f95[_0x3fa53e(0x102)]},this['_processTreeNodeResult'](_0x1afc9a,_0x19fffe),_0x1afc9a;}var _0x938d99=this[_0x3fa53e(0xef)](_0x4c74c6),_0x48d2ab=this[_0x3fa53e(0xea)](_0x938d99);if(_0x1afc9a[_0x3fa53e(0xf8)]=_0x938d99,_0x48d2ab)this[_0x3fa53e(0x163)](_0x1afc9a,_0x19fffe,_0x4c74c6,function(){var _0x33cf45=_0x3fa53e;_0x1afc9a['value']=_0x4c74c6[_0x33cf45(0x14f)](),!_0x4dfee&&_0x5e9d19[_0x33cf45(0x10f)](_0x938d99,_0x1afc9a,_0x19fffe,{});});else{var _0x5ab3b6=_0x19fffe[_0x3fa53e(0xa8)]&&_0x19fffe[_0x3fa53e(0xd9)]<_0x19fffe['autoExpandMaxDepth']&&_0x19fffe[_0x3fa53e(0x11d)]['indexOf'](_0x4c74c6)<0x0&&_0x938d99!=='function'&&_0x19fffe[_0x3fa53e(0xf6)]<_0x19fffe[_0x3fa53e(0x127)];_0x5ab3b6||_0x19fffe[_0x3fa53e(0xd9)]<_0x562384||_0x4dfee?(this[_0x3fa53e(0x155)](_0x1afc9a,_0x4c74c6,_0x19fffe,_0x4dfee||{}),this[_0x3fa53e(0x7f)](_0x4c74c6,_0x1afc9a)):this['_processTreeNodeResult'](_0x1afc9a,_0x19fffe,_0x4c74c6,function(){var _0x111231=_0x3fa53e;_0x938d99===_0x111231(0x86)||_0x938d99===_0x111231(0xb7)||(delete _0x1afc9a[_0x111231(0x124)],_0x1afc9a[_0x111231(0x129)]=!0x0);});}return _0x1afc9a;}finally{_0x19fffe[_0x3fa53e(0x132)]=_0x41ea3c,_0x19fffe[_0x3fa53e(0xf2)]=_0x562384,_0x19fffe[_0x3fa53e(0xcf)]=_0x37636d;}}['_capIfString'](_0x581e93,_0x84fa5b,_0x5d31d3,_0x45b883){var _0xfd3f77=_0x54bbb6,_0x51dc92=_0x45b883['strLength']||_0x5d31d3[_0xfd3f77(0x16b)];if((_0x581e93===_0xfd3f77(0x11b)||_0x581e93===_0xfd3f77(0xe4))&&_0x84fa5b[_0xfd3f77(0x124)]){let _0x1638c6=_0x84fa5b['value'][_0xfd3f77(0x13a)];_0x5d31d3[_0xfd3f77(0xfd)]+=_0x1638c6,_0x5d31d3[_0xfd3f77(0xfd)]>_0x5d31d3[_0xfd3f77(0x15a)]?(_0x84fa5b[_0xfd3f77(0x129)]='',delete _0x84fa5b['value']):_0x1638c6>_0x51dc92&&(_0x84fa5b[_0xfd3f77(0x129)]=_0x84fa5b[_0xfd3f77(0x124)]['substr'](0x0,_0x51dc92),delete _0x84fa5b['value']);}}['_isMap'](_0x2d9c2e){var _0x1f7590=_0x54bbb6;return!!(_0x2d9c2e&&_0x274c7d['Map']&&this['_objectToString'](_0x2d9c2e)===_0x1f7590(0xcd)&&_0x2d9c2e[_0x1f7590(0x150)]);}[_0x54bbb6(0x12c)](_0x5e8596){var _0x196a24=_0x54bbb6;if(_0x5e8596['match'](/^\\d+$/))return _0x5e8596;var _0x330bd4;try{_0x330bd4=JSON[_0x196a24(0xd3)](''+_0x5e8596);}catch{_0x330bd4='\\x22'+this[_0x196a24(0x178)](_0x5e8596)+'\\x22';}return _0x330bd4[_0x196a24(0x89)](/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?_0x330bd4=_0x330bd4['substr'](0x1,_0x330bd4[_0x196a24(0x13a)]-0x2):_0x330bd4=_0x330bd4[_0x196a24(0xb0)](/'/g,'\\x5c\\x27')[_0x196a24(0xb0)](/\\\\"/g,'\\x22')[_0x196a24(0xb0)](/(^"|"$)/g,'\\x27'),_0x330bd4;}[_0x54bbb6(0x163)](_0x4bea1d,_0x227889,_0x57842,_0x516a1b){var _0x4a9e29=_0x54bbb6;this[_0x4a9e29(0x103)](_0x4bea1d,_0x227889),_0x516a1b&&_0x516a1b(),this[_0x4a9e29(0x7f)](_0x57842,_0x4bea1d),this[_0x4a9e29(0x15e)](_0x4bea1d,_0x227889);}[_0x54bbb6(0x103)](_0x5343ce,_0x30eb50){var _0x2f4977=_0x54bbb6;this[_0x2f4977(0xd0)](_0x5343ce,_0x30eb50),this[_0x2f4977(0xf4)](_0x5343ce,_0x30eb50),this[_0x2f4977(0x12b)](_0x5343ce,_0x30eb50),this[_0x2f4977(0x105)](_0x5343ce,_0x30eb50);}[_0x54bbb6(0xd0)](_0x25e7d8,_0x3adc72){}[_0x54bbb6(0xf4)](_0x36ca22,_0x7eb9d0){}[_0x54bbb6(0x13b)](_0x3cfced,_0x5c952b){}[_0x54bbb6(0x99)](_0x2ec3d5){var _0x23aad7=_0x54bbb6;return _0x2ec3d5===this[_0x23aad7(0x10c)];}['_treeNodePropertiesAfterFullValue'](_0x34cf57,_0x22c1b3){var _0x4757ae=_0x54bbb6;this[_0x4757ae(0x13b)](_0x34cf57,_0x22c1b3),this[_0x4757ae(0xc0)](_0x34cf57),_0x22c1b3[_0x4757ae(0xc7)]&&this[_0x4757ae(0x10a)](_0x34cf57),this[_0x4757ae(0x164)](_0x34cf57,_0x22c1b3),this['_addLoadNode'](_0x34cf57,_0x22c1b3),this['_cleanNode'](_0x34cf57);}[_0x54bbb6(0x7f)](_0x4338ce,_0x24eade){var _0x19f8b6=_0x54bbb6;try{_0x4338ce&&typeof _0x4338ce['length']==_0x19f8b6(0x13c)&&(_0x24eade[_0x19f8b6(0x13a)]=_0x4338ce[_0x19f8b6(0x13a)]);}catch{}if(_0x24eade['type']===_0x19f8b6(0x13c)||_0x24eade[_0x19f8b6(0xf8)]===_0x19f8b6(0x82)){if(isNaN(_0x24eade[_0x19f8b6(0x124)]))_0x24eade[_0x19f8b6(0x13e)]=!0x0,delete _0x24eade[_0x19f8b6(0x124)];else switch(_0x24eade[_0x19f8b6(0x124)]){case Number[_0x19f8b6(0x13d)]:_0x24eade[_0x19f8b6(0xe1)]=!0x0,delete _0x24eade['value'];break;case Number[_0x19f8b6(0x9d)]:_0x24eade[_0x19f8b6(0xc6)]=!0x0,delete _0x24eade[_0x19f8b6(0x124)];break;case 0x0:this['_isNegativeZero'](_0x24eade[_0x19f8b6(0x124)])&&(_0x24eade[_0x19f8b6(0x12e)]=!0x0);break;}}else _0x24eade[_0x19f8b6(0xf8)]===_0x19f8b6(0x10b)&&typeof _0x4338ce[_0x19f8b6(0xc5)]==_0x19f8b6(0x11b)&&_0x4338ce[_0x19f8b6(0xc5)]&&_0x24eade[_0x19f8b6(0xc5)]&&_0x4338ce[_0x19f8b6(0xc5)]!==_0x24eade[_0x19f8b6(0xc5)]&&(_0x24eade[_0x19f8b6(0xbb)]=_0x4338ce[_0x19f8b6(0xc5)]);}[_0x54bbb6(0xed)](_0x5ddf8f){var _0xfad8c1=_0x54bbb6;return 0x1/_0x5ddf8f===Number[_0xfad8c1(0x9d)];}[_0x54bbb6(0x10a)](_0xd2b322){var _0x1fb5f1=_0x54bbb6;!_0xd2b322[_0x1fb5f1(0x141)]||!_0xd2b322[_0x1fb5f1(0x141)][_0x1fb5f1(0x13a)]||_0xd2b322[_0x1fb5f1(0xf8)]===_0x1fb5f1(0x100)||_0xd2b322[_0x1fb5f1(0xf8)]===_0x1fb5f1(0x171)||_0xd2b322[_0x1fb5f1(0xf8)]==='Set'||_0xd2b322[_0x1fb5f1(0x141)][_0x1fb5f1(0xa7)](function(_0x4362ca,_0x40ce89){var _0x1ec206=_0x1fb5f1,_0x2019d8=_0x4362ca[_0x1ec206(0xc5)]['toLowerCase'](),_0x2fee95=_0x40ce89[_0x1ec206(0xc5)]['toLowerCase']();return _0x2019d8<_0x2fee95?-0x1:_0x2019d8>_0x2fee95?0x1:0x0;});}[_0x54bbb6(0x164)](_0x7303f,_0x5d624b){var _0x278d36=_0x54bbb6;if(!(_0x5d624b['noFunctions']||!_0x7303f[_0x278d36(0x141)]||!_0x7303f[_0x278d36(0x141)][_0x278d36(0x13a)])){for(var _0x449957=[],_0x129b94=[],_0x4db039=0x0,_0x10c97d=_0x7303f[_0x278d36(0x141)][_0x278d36(0x13a)];_0x4db039<_0x10c97d;_0x4db039++){var _0x4ff592=_0x7303f['props'][_0x4db039];_0x4ff592['type']===_0x278d36(0x10b)?_0x449957[_0x278d36(0xe5)](_0x4ff592):_0x129b94['push'](_0x4ff592);}if(!(!_0x129b94[_0x278d36(0x13a)]||_0x449957['length']<=0x1)){_0x7303f[_0x278d36(0x141)]=_0x129b94;var _0x3812d3={'functionsNode':!0x0,'props':_0x449957};this[_0x278d36(0xd0)](_0x3812d3,_0x5d624b),this[_0x278d36(0x13b)](_0x3812d3,_0x5d624b),this[_0x278d36(0xc0)](_0x3812d3),this[_0x278d36(0x105)](_0x3812d3,_0x5d624b),_0x3812d3['id']+='\\x20f',_0x7303f[_0x278d36(0x141)][_0x278d36(0x97)](_0x3812d3);}}}[_0x54bbb6(0xa3)](_0x4b6eb5,_0x14fb5e){}['_setNodeExpandableState'](_0x2e862b){}['_isArray'](_0x5e8475){var _0x43a5b9=_0x54bbb6;return Array[_0x43a5b9(0x176)](_0x5e8475)||typeof _0x5e8475==_0x43a5b9(0x15f)&&this[_0x43a5b9(0x178)](_0x5e8475)===_0x43a5b9(0x8d);}[_0x54bbb6(0x105)](_0x3f2715,_0x44e327){}[_0x54bbb6(0xa2)](_0x4a3570){var _0x4db01c=_0x54bbb6;delete _0x4a3570['_hasSymbolPropertyOnItsPath'],delete _0x4a3570[_0x4db01c(0xae)],delete _0x4a3570[_0x4db01c(0x14d)];}[_0x54bbb6(0x12b)](_0x2acbc1,_0x565922){}}let _0x1b7b89=new _0x520123(),_0x441d73={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x576235={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2};function _0x947643(_0x455c3c,_0x59fc4c,_0xbe5074,_0x2bd252,_0x4c6237,_0x5c8288){var _0x23fd4d=_0x54bbb6;let _0x16b42e,_0x181f99;try{_0x181f99=_0x7d7510(),_0x16b42e=_0x1fe9bb[_0x59fc4c],!_0x16b42e||_0x181f99-_0x16b42e['ts']>0x1f4&&_0x16b42e[_0x23fd4d(0xd2)]&&_0x16b42e[_0x23fd4d(0x172)]/_0x16b42e[_0x23fd4d(0xd2)]<0x64?(_0x1fe9bb[_0x59fc4c]=_0x16b42e={'count':0x0,'time':0x0,'ts':_0x181f99},_0x1fe9bb[_0x23fd4d(0x9a)]={}):_0x181f99-_0x1fe9bb['hits']['ts']>0x32&&_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]&&_0x1fe9bb[_0x23fd4d(0x9a)]['time']/_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]<0x64&&(_0x1fe9bb['hits']={});let _0x4b17df=[],_0x3275f9=_0x16b42e[_0x23fd4d(0xc3)]||_0x1fe9bb['hits'][_0x23fd4d(0xc3)]?_0x576235:_0x441d73,_0x204a85=_0x56119b=>{var _0x172804=_0x23fd4d;let _0x43a7b2={};return _0x43a7b2[_0x172804(0x141)]=_0x56119b[_0x172804(0x141)],_0x43a7b2[_0x172804(0x143)]=_0x56119b['elements'],_0x43a7b2[_0x172804(0x16b)]=_0x56119b[_0x172804(0x16b)],_0x43a7b2[_0x172804(0x15a)]=_0x56119b[_0x172804(0x15a)],_0x43a7b2['autoExpandLimit']=_0x56119b['autoExpandLimit'],_0x43a7b2[_0x172804(0x17a)]=_0x56119b['autoExpandMaxDepth'],_0x43a7b2['sortProps']=!0x1,_0x43a7b2[_0x172804(0x16e)]=!_0x594f94,_0x43a7b2[_0x172804(0xf2)]=0x1,_0x43a7b2['level']=0x0,_0x43a7b2[_0x172804(0x113)]=_0x172804(0xba),_0x43a7b2['rootExpression']=_0x172804(0x90),_0x43a7b2[_0x172804(0xa8)]=!0x0,_0x43a7b2['autoExpandPreviousObjects']=[],_0x43a7b2[_0x172804(0xf6)]=0x0,_0x43a7b2['resolveGetters']=!0x0,_0x43a7b2[_0x172804(0xfd)]=0x0,_0x43a7b2[_0x172804(0xca)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x43a7b2;};for(var _0x5383d6=0x0;_0x5383d6<_0x4c6237[_0x23fd4d(0x13a)];_0x5383d6++)_0x4b17df[_0x23fd4d(0xe5)](_0x1b7b89[_0x23fd4d(0x155)]({'timeNode':_0x455c3c===_0x23fd4d(0x172)||void 0x0},_0x4c6237[_0x5383d6],_0x204a85(_0x3275f9),{}));if(_0x455c3c==='trace'||_0x455c3c==='error'){let _0xdfeea3=Error[_0x23fd4d(0x144)];try{Error[_0x23fd4d(0x144)]=0x1/0x0,_0x4b17df[_0x23fd4d(0xe5)](_0x1b7b89[_0x23fd4d(0x155)]({'stackNode':!0x0},new Error()[_0x23fd4d(0x98)],_0x204a85(_0x3275f9),{'strLength':0x1/0x0}));}finally{Error['stackTraceLimit']=_0xdfeea3;}}return{'method':'log','version':_0x17209b,'args':[{'ts':_0xbe5074,'session':_0x2bd252,'args':_0x4b17df,'id':_0x59fc4c,'context':_0x5c8288}]};}catch(_0x5b7eb1){return{'method':_0x23fd4d(0x162),'version':_0x17209b,'args':[{'ts':_0xbe5074,'session':_0x2bd252,'args':[{'type':_0x23fd4d(0x118),'error':_0x5b7eb1&&_0x5b7eb1[_0x23fd4d(0x102)]}],'id':_0x59fc4c,'context':_0x5c8288}]};}finally{try{if(_0x16b42e&&_0x181f99){let _0x36f576=_0x7d7510();_0x16b42e[_0x23fd4d(0xd2)]++,_0x16b42e[_0x23fd4d(0x172)]+=_0x4f599c(_0x181f99,_0x36f576),_0x16b42e['ts']=_0x36f576,_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]++,_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0x172)]+=_0x4f599c(_0x181f99,_0x36f576),_0x1fe9bb[_0x23fd4d(0x9a)]['ts']=_0x36f576,(_0x16b42e[_0x23fd4d(0xd2)]>0x32||_0x16b42e[_0x23fd4d(0x172)]>0x64)&&(_0x16b42e[_0x23fd4d(0xc3)]=!0x0),(_0x1fe9bb['hits']['count']>0x3e8||_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0x172)]>0x12c)&&(_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xc3)]=!0x0);}}catch{}}}return _0x947643;}((_0x385570,_0x9cecea,_0x611c3e,_0x47cbda,_0x3675e9,_0x2e3a3e,_0x3f2ade,_0x1e40ad,_0x4ecce5,_0x49d13a,_0x5336e2)=>{var _0x4fd702=_0x1fd864;if(_0x385570[_0x4fd702(0x138)])return _0x385570[_0x4fd702(0x138)];if(!X(_0x385570,_0x1e40ad,_0x3675e9))return _0x385570['_console_ninja']={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x385570[_0x4fd702(0x138)];let _0x32bc6c=B(_0x385570),_0x278032=_0x32bc6c['elapsed'],_0x27ea9e=_0x32bc6c[_0x4fd702(0x16d)],_0x2b238b=_0x32bc6c[_0x4fd702(0xdd)],_0x566ac0={'hits':{},'ts':{}},_0x3bfcaf=J(_0x385570,_0x4ecce5,_0x566ac0,_0x2e3a3e),_0x53d045=_0x210e4=>{_0x566ac0['ts'][_0x210e4]=_0x27ea9e();},_0x138aeb=(_0x327637,_0x488ce9)=>{var _0x58159f=_0x4fd702;let _0x178ae7=_0x566ac0['ts'][_0x488ce9];if(delete _0x566ac0['ts'][_0x488ce9],_0x178ae7){let _0x1377fb=_0x278032(_0x178ae7,_0x27ea9e());_0x280e21(_0x3bfcaf(_0x58159f(0x172),_0x327637,_0x2b238b(),_0x224839,[_0x1377fb],_0x488ce9));}},_0x518c2c=_0x29d175=>{var _0x4ca26e=_0x4fd702,_0x38fb52;return _0x3675e9==='next.js'&&_0x385570[_0x4ca26e(0xac)]&&((_0x38fb52=_0x29d175==null?void 0x0:_0x29d175['args'])==null?void 0x0:_0x38fb52[_0x4ca26e(0x13a)])&&(_0x29d175[_0x4ca26e(0x170)][0x0]['origin']=_0x385570[_0x4ca26e(0xac)]),_0x29d175;};_0x385570[_0x4fd702(0x138)]={'consoleLog':(_0x40d516,_0x270457)=>{var _0x10a543=_0x4fd702;_0x385570[_0x10a543(0x91)][_0x10a543(0x162)][_0x10a543(0xc5)]!==_0x10a543(0x88)&&_0x280e21(_0x3bfcaf('log',_0x40d516,_0x2b238b(),_0x224839,_0x270457));},'consoleTrace':(_0x3396ac,_0x122ae4)=>{var _0x29be82=_0x4fd702,_0x4b7637,_0x35e3a9;_0x385570[_0x29be82(0x91)][_0x29be82(0x162)]['name']!=='disabledTrace'&&((_0x35e3a9=(_0x4b7637=_0x385570[_0x29be82(0xc8)])==null?void 0x0:_0x4b7637[_0x29be82(0x9e)])!=null&&_0x35e3a9['node']&&(_0x385570['_ninjaIgnoreNextError']=!0x0),_0x280e21(_0x518c2c(_0x3bfcaf(_0x29be82(0x101),_0x3396ac,_0x2b238b(),_0x224839,_0x122ae4))));},'consoleError':(_0x36d3cf,_0x451b1d)=>{var _0x4551f0=_0x4fd702;_0x385570[_0x4551f0(0xd6)]=!0x0,_0x280e21(_0x518c2c(_0x3bfcaf('error',_0x36d3cf,_0x2b238b(),_0x224839,_0x451b1d)));},'consoleTime':_0x45134c=>{_0x53d045(_0x45134c);},'consoleTimeEnd':(_0x3d07f5,_0x98e4d4)=>{_0x138aeb(_0x98e4d4,_0x3d07f5);},'autoLog':(_0x99b608,_0x273fa4)=>{var _0x44d244=_0x4fd702;_0x280e21(_0x3bfcaf(_0x44d244(0x162),_0x273fa4,_0x2b238b(),_0x224839,[_0x99b608]));},'autoLogMany':(_0x890992,_0x25c482)=>{var _0x1ce81b=_0x4fd702;_0x280e21(_0x3bfcaf(_0x1ce81b(0x162),_0x890992,_0x2b238b(),_0x224839,_0x25c482));},'autoTrace':(_0x3741e8,_0x1336ec)=>{_0x280e21(_0x518c2c(_0x3bfcaf('trace',_0x1336ec,_0x2b238b(),_0x224839,[_0x3741e8])));},'autoTraceMany':(_0x20b3de,_0x5c880b)=>{var _0x1781db=_0x4fd702;_0x280e21(_0x518c2c(_0x3bfcaf(_0x1781db(0x101),_0x20b3de,_0x2b238b(),_0x224839,_0x5c880b)));},'autoTime':(_0x5e9a28,_0x341c0d,_0xe2c00b)=>{_0x53d045(_0xe2c00b);},'autoTimeEnd':(_0x30bc0a,_0x137b72,_0x1c02b3)=>{_0x138aeb(_0x137b72,_0x1c02b3);},'coverage':_0x5621c2=>{var _0x1c7d14=_0x4fd702;_0x280e21({'method':_0x1c7d14(0x110),'version':_0x2e3a3e,'args':[{'id':_0x5621c2}]});}};let _0x280e21=H(_0x385570,_0x9cecea,_0x611c3e,_0x47cbda,_0x3675e9,_0x49d13a,_0x5336e2),_0x224839=_0x385570['_console_ninja_session'];return _0x385570[_0x4fd702(0x138)];})(globalThis,_0x1fd864(0x8b),_0x1fd864(0x156),_0x1fd864(0x16f),'vite',_0x1fd864(0x94),_0x1fd864(0x154),_0x1fd864(0xfa),_0x1fd864(0x14c),_0x1fd864(0xe0),_0x1fd864(0xde));`);
  } catch (e) {
  }
}
function oo_oo$1(i, ...v) {
  try {
    oo_cm$1().consoleLog(i, v);
  } catch (e) {
  }
  return v;
}
function oo_tx$1(i, ...v) {
  try {
    oo_cm$1().consoleError(i, v);
  } catch (e) {
  }
  return v;
}
class TranscriptionServiceManager {
  constructor() {
    __publicField(this, "services", /* @__PURE__ */ new Map());
    this.initializeServices();
  }
  initializeServices() {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== "your_openai_api_key_here" && openaiKey.trim() !== "" && openaiKey.startsWith("sk-")) {
      this.services.set("openai", new OpenAITranscriptionService(openaiKey));
    }
  }
  getAvailableProviders() {
    return Array.from(this.services.values()).map((service) => service.getProvider());
  }
  async transcribe(request) {
    const service = this.services.get(request.provider);
    if (!service) {
      return {
        success: false,
        error: `Provedor de transcrição '${request.provider}' não encontrado ou não configurado`
      };
    }
    return service.transcribe(request);
  }
  isProviderAvailable(providerId) {
    return this.services.has(providerId);
  }
}
dotenv.config();
const transcriptionManager = new TranscriptionServiceManager();
const __dirname = path$2.dirname(fileURLToPath(import.meta.url));
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
async function convertToMp3(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const outputFileName = `${path$2.parse(inputPath).name}_converted.mp3`;
    const outputPath = path$2.join(outputDir, outputFileName);
    ffmpeg(inputPath).toFormat("mp3").audioBitrate(93).on("end", () => {
      console.log(...oo_oo(`2572406455_34_8_34_55_4`, "Conversion finished successfully"));
      resolve(outputPath);
    }).on("error", (err) => {
      console.error(...oo_tx(`2572406455_37_8_37_54_11`, "Error during conversion:", err));
      reject(err);
    }).save(outputPath);
  });
}
process.env.APP_ROOT = path$2.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$2.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$2.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$2.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$2.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$2.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$2.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("convert-audio", async (_, filePath) => {
  try {
    const tempDir = os$1.tmpdir();
    const outputPath = await convertToMp3(filePath, tempDir);
    return { success: true, outputPath };
  } catch (error) {
    console.error(...oo_tx(`2572406455_110_4_110_45_11`, "Conversion error:", error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
});
ipcMain.handle("save-file-dialog", async () => {
  const result = await dialog.showSaveDialog(win, {
    filters: [{ name: "MP3 Files", extensions: ["mp3"] }],
    defaultPath: "converted_audio.mp3"
  });
  return result;
});
ipcMain.handle("save-file-to-disk", async (_, fileBuffer, fileName) => {
  try {
    const tempDir = os$1.tmpdir();
    const tempFilePath = path$2.join(tempDir, fileName);
    await fs$1.promises.writeFile(tempFilePath, fileBuffer);
    return { success: true, filePath: tempFilePath };
  } catch (error) {
    console.error(...oo_tx(`2572406455_131_4_131_54_11`, "Error saving file to disk:", error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
});
ipcMain.handle("copy-file", async (_, sourcePath, targetPath) => {
  try {
    await fs$1.promises.copyFile(sourcePath, targetPath);
    return { success: true };
  } catch (error) {
    console.error(...oo_tx(`2572406455_141_4_141_47_11`, "Error copying file:", error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
});
ipcMain.handle("get-transcription-providers", async () => {
  try {
    const providers = transcriptionManager.getAvailableProviders();
    return { success: true, providers };
  } catch (error) {
    console.error(...oo_tx(`2572406455_152_4_152_66_11`, "Error getting transcription providers:", error));
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
});
ipcMain.handle("transcribe-audio", async (_, request) => {
  try {
    const result = await transcriptionManager.transcribe(request);
    return result;
  } catch (error) {
    console.error(...oo_tx(`2572406455_162_4_162_53_11`, "Error transcribing audio:", error));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
app.whenReady().then(createWindow);
function oo_cm() {
  try {
    return (0, eval)("globalThis._console_ninja") || (0, eval)(`/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x1fd864=_0xc145;(function(_0x161e64,_0x199d30){var _0x5ac4fa=_0xc145,_0xe04798=_0x161e64();while(!![]){try{var _0x289a13=parseInt(_0x5ac4fa(0x175))/0x1+parseInt(_0x5ac4fa(0x158))/0x2*(-parseInt(_0x5ac4fa(0xf5))/0x3)+parseInt(_0x5ac4fa(0xe9))/0x4+parseInt(_0x5ac4fa(0x167))/0x5+parseInt(_0x5ac4fa(0x135))/0x6+parseInt(_0x5ac4fa(0xc2))/0x7+parseInt(_0x5ac4fa(0x147))/0x8*(-parseInt(_0x5ac4fa(0x92))/0x9);if(_0x289a13===_0x199d30)break;else _0xe04798['push'](_0xe04798['shift']());}catch(_0x1037ab){_0xe04798['push'](_0xe04798['shift']());}}}(_0x1b35,0x7c015));var G=Object[_0x1fd864(0x166)],V=Object['defineProperty'],ee=Object[_0x1fd864(0xd4)],te=Object[_0x1fd864(0xbc)],ne=Object[_0x1fd864(0xc9)],re=Object['prototype'][_0x1fd864(0x179)],ie=(_0x54694d,_0x420f9c,_0x2027fc,_0x45a95d)=>{var _0x5e707d=_0x1fd864;if(_0x420f9c&&typeof _0x420f9c=='object'||typeof _0x420f9c=='function'){for(let _0x21dddb of te(_0x420f9c))!re[_0x5e707d(0x123)](_0x54694d,_0x21dddb)&&_0x21dddb!==_0x2027fc&&V(_0x54694d,_0x21dddb,{'get':()=>_0x420f9c[_0x21dddb],'enumerable':!(_0x45a95d=ee(_0x420f9c,_0x21dddb))||_0x45a95d[_0x5e707d(0xcc)]});}return _0x54694d;},j=(_0x53583a,_0x316274,_0x4f63db)=>(_0x4f63db=_0x53583a!=null?G(ne(_0x53583a)):{},ie(_0x316274||!_0x53583a||!_0x53583a[_0x1fd864(0xdc)]?V(_0x4f63db,_0x1fd864(0x149),{'value':_0x53583a,'enumerable':!0x0}):_0x4f63db,_0x53583a)),q=class{constructor(_0x2defc5,_0xebb55f,_0x32c1cd,_0x31655b,_0x131b0e,_0x294203){var _0x59a553=_0x1fd864,_0x1e0c94,_0x4ecf3b,_0x3cf91a,_0x318ed0;this[_0x59a553(0xf7)]=_0x2defc5,this[_0x59a553(0x121)]=_0xebb55f,this[_0x59a553(0x106)]=_0x32c1cd,this[_0x59a553(0xf3)]=_0x31655b,this[_0x59a553(0xf0)]=_0x131b0e,this[_0x59a553(0x14e)]=_0x294203,this[_0x59a553(0x87)]=!0x0,this[_0x59a553(0x8c)]=!0x0,this[_0x59a553(0x11e)]=!0x1,this[_0x59a553(0x107)]=!0x1,this[_0x59a553(0x109)]=((_0x4ecf3b=(_0x1e0c94=_0x2defc5[_0x59a553(0xc8)])==null?void 0x0:_0x1e0c94[_0x59a553(0x137)])==null?void 0x0:_0x4ecf3b[_0x59a553(0xe6)])===_0x59a553(0x151),this[_0x59a553(0x81)]=!((_0x318ed0=(_0x3cf91a=this[_0x59a553(0xf7)]['process'])==null?void 0x0:_0x3cf91a[_0x59a553(0x9e)])!=null&&_0x318ed0[_0x59a553(0xca)])&&!this['_inNextEdge'],this[_0x59a553(0x15b)]=null,this[_0x59a553(0xb2)]=0x0,this[_0x59a553(0x9b)]=0x14,this[_0x59a553(0xee)]=_0x59a553(0xb5),this[_0x59a553(0xe2)]=(this[_0x59a553(0x81)]?_0x59a553(0xe3):_0x59a553(0x177))+this['_webSocketErrorDocsLink'];}async[_0x1fd864(0xec)](){var _0x1feded=_0x1fd864,_0x270d70,_0x50eeab;if(this[_0x1feded(0x15b)])return this[_0x1feded(0x15b)];let _0x5d875a;if(this[_0x1feded(0x81)]||this[_0x1feded(0x109)])_0x5d875a=this[_0x1feded(0xf7)][_0x1feded(0x126)];else{if((_0x270d70=this[_0x1feded(0xf7)][_0x1feded(0xc8)])!=null&&_0x270d70['_WebSocket'])_0x5d875a=(_0x50eeab=this['global'][_0x1feded(0xc8)])==null?void 0x0:_0x50eeab['_WebSocket'];else try{let _0x24d766=await import(_0x1feded(0xda));_0x5d875a=(await import((await import(_0x1feded(0x114)))[_0x1feded(0x120)](_0x24d766['join'](this[_0x1feded(0xf3)],'ws/index.js'))[_0x1feded(0x117)]()))['default'];}catch{try{_0x5d875a=require(require('path')['join'](this[_0x1feded(0xf3)],'ws'));}catch{throw new Error('failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket');}}}return this[_0x1feded(0x15b)]=_0x5d875a,_0x5d875a;}[_0x1fd864(0x12d)](){var _0x5bcfae=_0x1fd864;this[_0x5bcfae(0x107)]||this[_0x5bcfae(0x11e)]||this[_0x5bcfae(0xb2)]>=this['_maxConnectAttemptCount']||(this[_0x5bcfae(0x8c)]=!0x1,this[_0x5bcfae(0x107)]=!0x0,this[_0x5bcfae(0xb2)]++,this[_0x5bcfae(0xad)]=new Promise((_0x21f0c0,_0x2a8cde)=>{var _0x1fdd59=_0x5bcfae;this[_0x1fdd59(0xec)]()[_0x1fdd59(0x116)](_0x5079e5=>{var _0x3c771e=_0x1fdd59;let _0x59db1e=new _0x5079e5(_0x3c771e(0x13f)+(!this[_0x3c771e(0x81)]&&this[_0x3c771e(0xf0)]?_0x3c771e(0xcb):this['host'])+':'+this[_0x3c771e(0x106)]);_0x59db1e['onerror']=()=>{var _0xd39d40=_0x3c771e;this[_0xd39d40(0x87)]=!0x1,this[_0xd39d40(0x115)](_0x59db1e),this['_attemptToReconnectShortly'](),_0x2a8cde(new Error(_0xd39d40(0xab)));},_0x59db1e[_0x3c771e(0xa6)]=()=>{var _0x7120f3=_0x3c771e;this['_inBrowser']||_0x59db1e[_0x7120f3(0x161)]&&_0x59db1e[_0x7120f3(0x161)][_0x7120f3(0x95)]&&_0x59db1e[_0x7120f3(0x161)][_0x7120f3(0x95)](),_0x21f0c0(_0x59db1e);},_0x59db1e[_0x3c771e(0xb8)]=()=>{var _0xd802a9=_0x3c771e;this[_0xd802a9(0x8c)]=!0x0,this[_0xd802a9(0x115)](_0x59db1e),this['_attemptToReconnectShortly']();},_0x59db1e['onmessage']=_0x2a4c4d=>{var _0x97f841=_0x3c771e;try{if(!(_0x2a4c4d!=null&&_0x2a4c4d[_0x97f841(0xa5)])||!this[_0x97f841(0x14e)])return;let _0x37e5dc=JSON[_0x97f841(0xbe)](_0x2a4c4d['data']);this['eventReceivedCallback'](_0x37e5dc['method'],_0x37e5dc[_0x97f841(0x170)],this[_0x97f841(0xf7)],this[_0x97f841(0x81)]);}catch{}};})['then'](_0x132e18=>(this[_0x1fdd59(0x11e)]=!0x0,this[_0x1fdd59(0x107)]=!0x1,this[_0x1fdd59(0x8c)]=!0x1,this[_0x1fdd59(0x87)]=!0x0,this[_0x1fdd59(0xb2)]=0x0,_0x132e18))[_0x1fdd59(0x134)](_0x5b8932=>(this[_0x1fdd59(0x11e)]=!0x1,this[_0x1fdd59(0x107)]=!0x1,console['warn'](_0x1fdd59(0x128)+this[_0x1fdd59(0xee)]),_0x2a8cde(new Error(_0x1fdd59(0x10d)+(_0x5b8932&&_0x5b8932[_0x1fdd59(0x102)])))));}));}[_0x1fd864(0x115)](_0x35cb1d){var _0x4d75b9=_0x1fd864;this['_connected']=!0x1,this[_0x4d75b9(0x107)]=!0x1;try{_0x35cb1d[_0x4d75b9(0xb8)]=null,_0x35cb1d[_0x4d75b9(0xce)]=null,_0x35cb1d[_0x4d75b9(0xa6)]=null;}catch{}try{_0x35cb1d[_0x4d75b9(0xb1)]<0x2&&_0x35cb1d[_0x4d75b9(0x11f)]();}catch{}}[_0x1fd864(0x10e)](){var _0x1c284a=_0x1fd864;clearTimeout(this[_0x1c284a(0xbf)]),!(this[_0x1c284a(0xb2)]>=this['_maxConnectAttemptCount'])&&(this[_0x1c284a(0xbf)]=setTimeout(()=>{var _0x575fc7=_0x1c284a,_0x47e91a;this[_0x575fc7(0x11e)]||this[_0x575fc7(0x107)]||(this['_connectToHostNow'](),(_0x47e91a=this[_0x575fc7(0xad)])==null||_0x47e91a['catch'](()=>this[_0x575fc7(0x10e)]()));},0x1f4),this[_0x1c284a(0xbf)][_0x1c284a(0x95)]&&this[_0x1c284a(0xbf)]['unref']());}async[_0x1fd864(0xd5)](_0xfed7f2){var _0xbcae47=_0x1fd864;try{if(!this[_0xbcae47(0x87)])return;this['_allowedToConnectOnSend']&&this[_0xbcae47(0x12d)](),(await this[_0xbcae47(0xad)])['send'](JSON[_0xbcae47(0xd3)](_0xfed7f2));}catch(_0x3528b1){this['_extendedWarning']?console[_0xbcae47(0x159)](this[_0xbcae47(0xe2)]+':\\x20'+(_0x3528b1&&_0x3528b1[_0xbcae47(0x102)])):(this[_0xbcae47(0x111)]=!0x0,console[_0xbcae47(0x159)](this[_0xbcae47(0xe2)]+':\\x20'+(_0x3528b1&&_0x3528b1['message']),_0xfed7f2)),this[_0xbcae47(0x87)]=!0x1,this[_0xbcae47(0x10e)]();}}};function H(_0x34a872,_0x4d9e64,_0x192be1,_0x3db0cc,_0x1e475b,_0x365e19,_0x5355f3,_0x97df06=oe){var _0x2c3ce4=_0x1fd864;let _0x3bd4b7=_0x192be1[_0x2c3ce4(0x112)](',')['map'](_0x28d0b2=>{var _0x503812=_0x2c3ce4,_0x582326,_0x3b71ac,_0x9a7f7a,_0x187985;try{if(!_0x34a872[_0x503812(0x8f)]){let _0x2391d4=((_0x3b71ac=(_0x582326=_0x34a872[_0x503812(0xc8)])==null?void 0x0:_0x582326[_0x503812(0x9e)])==null?void 0x0:_0x3b71ac['node'])||((_0x187985=(_0x9a7f7a=_0x34a872[_0x503812(0xc8)])==null?void 0x0:_0x9a7f7a[_0x503812(0x137)])==null?void 0x0:_0x187985[_0x503812(0xe6)])===_0x503812(0x151);(_0x1e475b===_0x503812(0xdf)||_0x1e475b==='remix'||_0x1e475b==='astro'||_0x1e475b===_0x503812(0x174))&&(_0x1e475b+=_0x2391d4?_0x503812(0x108):'\\x20browser'),_0x34a872[_0x503812(0x8f)]={'id':+new Date(),'tool':_0x1e475b},_0x5355f3&&_0x1e475b&&!_0x2391d4&&console['log'](_0x503812(0x160)+(_0x1e475b[_0x503812(0x119)](0x0)[_0x503812(0xfb)]()+_0x1e475b[_0x503812(0xf9)](0x1))+',',_0x503812(0xc1),_0x503812(0xb4));}let _0x2e2542=new q(_0x34a872,_0x4d9e64,_0x28d0b2,_0x3db0cc,_0x365e19,_0x97df06);return _0x2e2542['send'][_0x503812(0x80)](_0x2e2542);}catch(_0xe4b2d4){return console[_0x503812(0x159)](_0x503812(0x168),_0xe4b2d4&&_0xe4b2d4['message']),()=>{};}});return _0x52d327=>_0x3bd4b7[_0x2c3ce4(0x150)](_0x519c27=>_0x519c27(_0x52d327));}function _0xc145(_0xfda6ff,_0x5bc7d2){var _0x1b351a=_0x1b35();return _0xc145=function(_0xc1458f,_0x3b9943){_0xc1458f=_0xc1458f-0x7f;var _0x551e9a=_0x1b351a[_0xc1458f];return _0x551e9a;},_0xc145(_0xfda6ff,_0x5bc7d2);}function _0x1b35(){var _0xe68bc4=['_cleanNode','_addLoadNode','elapsed','data','onopen','sort','autoExpand','boolean','prototype','logger\\x20websocket\\x20error','origin','_ws','_hasSetOnItsPath','[object\\x20BigInt]','replace','readyState','_connectAttemptCount','Boolean','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','https://tinyurl.com/37x8b79t','reload','undefined','onclose','bigint','root_exp_id','funcName','getOwnPropertyNames','concat','parse','_reconnectTimeout','_setNodeExpandableState','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)','3578708gFpXvc','reduceLimits','getter','name','negativeInfinity','sortProps','process','getPrototypeOf','node','gateway.docker.internal','enumerable','[object\\x20Map]','onerror','isExpressionToEvaluate','_setNodeId','pop','count','stringify','getOwnPropertyDescriptor','send','_ninjaIgnoreNextError','_regExpToString','test','level','path','includes','__es'+'Module','now','1','next.js','','positiveInfinity','_sendErrorMessage','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','String','push','NEXT_RUNTIME','_HTMLAllCollection','_p_length','139528NyjUDG','_isPrimitiveType','constructor','getWebSocketClass','_isNegativeZero','_webSocketErrorDocsLink','_type','dockerizedApp','resolveGetters','depth','nodeModules','_setNodeQueryPath','1965zUXaXA','autoExpandPropertyCount','global','type','substr',["localhost","127.0.0.1","example.cypress.io","DESKNIK","10.0.0.106"],'toUpperCase','hostname','allStrLength','startsWith','[object\\x20Set]','array','trace','message','_treeNodePropertiesBeforeFullValue','Error','_setNodePermissions','port','_connecting','\\x20server','_inNextEdge','_sortProps','function','_undefined','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','_attemptToReconnectShortly','_capIfString','coverage','_extendedWarning','split','expId','url','_disposeWebsocket','then','toString','unknown','charAt','_getOwnPropertyNames','string','...','autoExpandPreviousObjects','_connected','close','pathToFileURL','host','map','call','value','_Symbol','WebSocket','autoExpandLimit','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20','capped','slice','_setNodeExpressionPath','_propertyName','_connectToHostNow','negativeZero','_isMap','_getOwnPropertyDescriptor','_addProperty','expressionsToEvaluate','_property','catch','773022JINmzd','_dateToString','env','_console_ninja','cappedProps','length','_setNodeLabel','number','POSITIVE_INFINITY','nan','ws://','error','props','setter','elements','stackTraceLimit','some','set','1696tKAKvD','cappedElements','default','current','_getOwnPropertySymbols','','_hasMapOnItsPath','eventReceivedCallback','valueOf','forEach','edge','date','location','1754402960519','serialize','63911','Symbol','404ozamGy','warn','totalStrLength','_WebSocketClass','_addObjectProperty','hrtime','_treeNodePropertiesAfterFullValue','object','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_socket','log','_processTreeNodeResult','_addFunctionsNode','_blacklistedProperty','create','3448505qTcTrz','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_consoleNinjaAllowedToStart','_isSet','strLength','fromCharCode','timeStamp','noFunctions',"c:\\\\Users\\\\deskn\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.463\\\\node_modules",'args','Map','time','getOwnPropertySymbols','angular','417403iHdthw','isArray','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20','_objectToString','hasOwnProperty','autoExpandMaxDepth','_additionalMetadata','bind','_inBrowser','Number','symbol','_p_name','parent','null','_allowedToSend','disabledLog','match','endsWith','127.0.0.1','_allowedToConnectOnSend','[object\\x20Array]','_isPrimitiveWrapperType','_console_ninja_session','root_exp','console','48474MlkxnC','get','1.0.0','unref','_quotedRegExp','unshift','stack','_isUndefined','hits','_maxConnectAttemptCount','index','NEGATIVE_INFINITY','versions','_p_','Set','Buffer'];_0x1b35=function(){return _0xe68bc4;};return _0x1b35();}function oe(_0x176a5b,_0x3663dd,_0x386391,_0x250b1c){var _0x55a837=_0x1fd864;_0x250b1c&&_0x176a5b===_0x55a837(0xb6)&&_0x386391[_0x55a837(0x153)][_0x55a837(0xb6)]();}function B(_0x2b0bf1){var _0x41f003=_0x1fd864,_0x27183c,_0x5e450a;let _0x53cbd6=function(_0x3741cd,_0x38156f){return _0x38156f-_0x3741cd;},_0x57d76c;if(_0x2b0bf1['performance'])_0x57d76c=function(){var _0x1c4f31=_0xc145;return _0x2b0bf1['performance'][_0x1c4f31(0xdd)]();};else{if(_0x2b0bf1[_0x41f003(0xc8)]&&_0x2b0bf1[_0x41f003(0xc8)][_0x41f003(0x15d)]&&((_0x5e450a=(_0x27183c=_0x2b0bf1[_0x41f003(0xc8)])==null?void 0x0:_0x27183c[_0x41f003(0x137)])==null?void 0x0:_0x5e450a['NEXT_RUNTIME'])!==_0x41f003(0x151))_0x57d76c=function(){var _0x2b6f8a=_0x41f003;return _0x2b0bf1[_0x2b6f8a(0xc8)][_0x2b6f8a(0x15d)]();},_0x53cbd6=function(_0x3674e8,_0x22a469){return 0x3e8*(_0x22a469[0x0]-_0x3674e8[0x0])+(_0x22a469[0x1]-_0x3674e8[0x1])/0xf4240;};else try{let {performance:_0x1c4602}=require('perf_hooks');_0x57d76c=function(){var _0x2fd5b1=_0x41f003;return _0x1c4602[_0x2fd5b1(0xdd)]();};}catch{_0x57d76c=function(){return+new Date();};}}return{'elapsed':_0x53cbd6,'timeStamp':_0x57d76c,'now':()=>Date[_0x41f003(0xdd)]()};}function X(_0x5d516a,_0x158d16,_0x1ea3a7){var _0x2a8361=_0x1fd864,_0x18601a,_0x35e1a7,_0x314c37,_0x5ec9b3,_0x54b215;if(_0x5d516a[_0x2a8361(0x169)]!==void 0x0)return _0x5d516a[_0x2a8361(0x169)];let _0x2f9953=((_0x35e1a7=(_0x18601a=_0x5d516a[_0x2a8361(0xc8)])==null?void 0x0:_0x18601a[_0x2a8361(0x9e)])==null?void 0x0:_0x35e1a7['node'])||((_0x5ec9b3=(_0x314c37=_0x5d516a[_0x2a8361(0xc8)])==null?void 0x0:_0x314c37['env'])==null?void 0x0:_0x5ec9b3[_0x2a8361(0xe6)])===_0x2a8361(0x151);function _0x2afa65(_0x7a5ff5){var _0x8e866c=_0x2a8361;if(_0x7a5ff5[_0x8e866c(0xfe)]('/')&&_0x7a5ff5[_0x8e866c(0x8a)]('/')){let _0x53348a=new RegExp(_0x7a5ff5[_0x8e866c(0x12a)](0x1,-0x1));return _0x550922=>_0x53348a[_0x8e866c(0xd8)](_0x550922);}else{if(_0x7a5ff5[_0x8e866c(0xdb)]('*')||_0x7a5ff5['includes']('?')){let _0xfeea3d=new RegExp('^'+_0x7a5ff5['replace'](/\\./g,String[_0x8e866c(0x16c)](0x5c)+'.')[_0x8e866c(0xb0)](/\\*/g,'.*')[_0x8e866c(0xb0)](/\\?/g,'.')+String['fromCharCode'](0x24));return _0x252eaa=>_0xfeea3d['test'](_0x252eaa);}else return _0xfc4410=>_0xfc4410===_0x7a5ff5;}}let _0x129767=_0x158d16[_0x2a8361(0x122)](_0x2afa65);return _0x5d516a[_0x2a8361(0x169)]=_0x2f9953||!_0x158d16,!_0x5d516a['_consoleNinjaAllowedToStart']&&((_0x54b215=_0x5d516a[_0x2a8361(0x153)])==null?void 0x0:_0x54b215[_0x2a8361(0xfc)])&&(_0x5d516a['_consoleNinjaAllowedToStart']=_0x129767[_0x2a8361(0x145)](_0x1babbb=>_0x1babbb(_0x5d516a[_0x2a8361(0x153)][_0x2a8361(0xfc)]))),_0x5d516a[_0x2a8361(0x169)];}function J(_0x274c7d,_0x594f94,_0x1fe9bb,_0x17209b){var _0x54bbb6=_0x1fd864;_0x274c7d=_0x274c7d,_0x594f94=_0x594f94,_0x1fe9bb=_0x1fe9bb,_0x17209b=_0x17209b;let _0x57cf3f=B(_0x274c7d),_0x4f599c=_0x57cf3f[_0x54bbb6(0xa4)],_0x7d7510=_0x57cf3f['timeStamp'];class _0x520123{constructor(){var _0x89bdcd=_0x54bbb6;this['_keyStrRegExp']=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this['_numberRegExp']=/^(0|[1-9][0-9]*)$/,this[_0x89bdcd(0x96)]=/'([^\\\\']|\\\\')*'/,this[_0x89bdcd(0x10c)]=_0x274c7d[_0x89bdcd(0xb7)],this[_0x89bdcd(0xe7)]=_0x274c7d['HTMLAllCollection'],this[_0x89bdcd(0x130)]=Object['getOwnPropertyDescriptor'],this['_getOwnPropertyNames']=Object[_0x89bdcd(0xbc)],this[_0x89bdcd(0x125)]=_0x274c7d[_0x89bdcd(0x157)],this[_0x89bdcd(0xd7)]=RegExp[_0x89bdcd(0xaa)][_0x89bdcd(0x117)],this[_0x89bdcd(0x136)]=Date[_0x89bdcd(0xaa)][_0x89bdcd(0x117)];}[_0x54bbb6(0x155)](_0x12c564,_0x398eff,_0x24a950,_0x510df2){var _0x171f19=_0x54bbb6,_0x5882b1=this,_0x32bec8=_0x24a950[_0x171f19(0xa8)];function _0x471d2e(_0x4740ef,_0x209807,_0x4d3b5b){var _0x4f354e=_0x171f19;_0x209807[_0x4f354e(0xf8)]=_0x4f354e(0x118),_0x209807['error']=_0x4740ef[_0x4f354e(0x102)],_0x261598=_0x4d3b5b[_0x4f354e(0xca)][_0x4f354e(0x14a)],_0x4d3b5b[_0x4f354e(0xca)][_0x4f354e(0x14a)]=_0x209807,_0x5882b1[_0x4f354e(0x103)](_0x209807,_0x4d3b5b);}let _0x18447b;_0x274c7d[_0x171f19(0x91)]&&(_0x18447b=_0x274c7d[_0x171f19(0x91)][_0x171f19(0x140)],_0x18447b&&(_0x274c7d['console']['error']=function(){}));try{try{_0x24a950[_0x171f19(0xd9)]++,_0x24a950[_0x171f19(0xa8)]&&_0x24a950['autoExpandPreviousObjects'][_0x171f19(0xe5)](_0x398eff);var _0x50ffce,_0x18e964,_0x409e8c,_0x3d696f,_0x2de392=[],_0x19220f=[],_0xf6729b,_0x259485=this['_type'](_0x398eff),_0x26fb44=_0x259485==='array',_0x2855ee=!0x1,_0x46640c=_0x259485===_0x171f19(0x10b),_0x55ac38=this[_0x171f19(0xea)](_0x259485),_0x32d4c3=this['_isPrimitiveWrapperType'](_0x259485),_0x5dea83=_0x55ac38||_0x32d4c3,_0x113bb1={},_0x12d26c=0x0,_0x1e966c=!0x1,_0x261598,_0x536375=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x24a950[_0x171f19(0xf2)]){if(_0x26fb44){if(_0x18e964=_0x398eff[_0x171f19(0x13a)],_0x18e964>_0x24a950['elements']){for(_0x409e8c=0x0,_0x3d696f=_0x24a950['elements'],_0x50ffce=_0x409e8c;_0x50ffce<_0x3d696f;_0x50ffce++)_0x19220f['push'](_0x5882b1[_0x171f19(0x131)](_0x2de392,_0x398eff,_0x259485,_0x50ffce,_0x24a950));_0x12c564[_0x171f19(0x148)]=!0x0;}else{for(_0x409e8c=0x0,_0x3d696f=_0x18e964,_0x50ffce=_0x409e8c;_0x50ffce<_0x3d696f;_0x50ffce++)_0x19220f[_0x171f19(0xe5)](_0x5882b1[_0x171f19(0x131)](_0x2de392,_0x398eff,_0x259485,_0x50ffce,_0x24a950));}_0x24a950[_0x171f19(0xf6)]+=_0x19220f[_0x171f19(0x13a)];}if(!(_0x259485==='null'||_0x259485==='undefined')&&!_0x55ac38&&_0x259485!==_0x171f19(0xe4)&&_0x259485!==_0x171f19(0xa1)&&_0x259485!=='bigint'){var _0x5ec92e=_0x510df2[_0x171f19(0x141)]||_0x24a950[_0x171f19(0x141)];if(this['_isSet'](_0x398eff)?(_0x50ffce=0x0,_0x398eff[_0x171f19(0x150)](function(_0x18b29c){var _0x28c627=_0x171f19;if(_0x12d26c++,_0x24a950[_0x28c627(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;return;}if(!_0x24a950[_0x28c627(0xcf)]&&_0x24a950[_0x28c627(0xa8)]&&_0x24a950[_0x28c627(0xf6)]>_0x24a950[_0x28c627(0x127)]){_0x1e966c=!0x0;return;}_0x19220f[_0x28c627(0xe5)](_0x5882b1[_0x28c627(0x131)](_0x2de392,_0x398eff,_0x28c627(0xa0),_0x50ffce++,_0x24a950,function(_0x5ef35a){return function(){return _0x5ef35a;};}(_0x18b29c)));})):this['_isMap'](_0x398eff)&&_0x398eff[_0x171f19(0x150)](function(_0x20c50e,_0xa7d00f){var _0x252158=_0x171f19;if(_0x12d26c++,_0x24a950[_0x252158(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;return;}if(!_0x24a950['isExpressionToEvaluate']&&_0x24a950['autoExpand']&&_0x24a950[_0x252158(0xf6)]>_0x24a950[_0x252158(0x127)]){_0x1e966c=!0x0;return;}var _0x3a5c9e=_0xa7d00f[_0x252158(0x117)]();_0x3a5c9e['length']>0x64&&(_0x3a5c9e=_0x3a5c9e['slice'](0x0,0x64)+_0x252158(0x11c)),_0x19220f['push'](_0x5882b1[_0x252158(0x131)](_0x2de392,_0x398eff,_0x252158(0x171),_0x3a5c9e,_0x24a950,function(_0x54cecb){return function(){return _0x54cecb;};}(_0x20c50e)));}),!_0x2855ee){try{for(_0xf6729b in _0x398eff)if(!(_0x26fb44&&_0x536375[_0x171f19(0xd8)](_0xf6729b))&&!this[_0x171f19(0x165)](_0x398eff,_0xf6729b,_0x24a950)){if(_0x12d26c++,_0x24a950[_0x171f19(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;break;}if(!_0x24a950[_0x171f19(0xcf)]&&_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0xf6)]>_0x24a950['autoExpandLimit']){_0x1e966c=!0x0;break;}_0x19220f['push'](_0x5882b1['_addObjectProperty'](_0x2de392,_0x113bb1,_0x398eff,_0x259485,_0xf6729b,_0x24a950));}}catch{}if(_0x113bb1[_0x171f19(0xe8)]=!0x0,_0x46640c&&(_0x113bb1[_0x171f19(0x84)]=!0x0),!_0x1e966c){var _0x1399e2=[][_0x171f19(0xbd)](this[_0x171f19(0x11a)](_0x398eff))[_0x171f19(0xbd)](this[_0x171f19(0x14b)](_0x398eff));for(_0x50ffce=0x0,_0x18e964=_0x1399e2[_0x171f19(0x13a)];_0x50ffce<_0x18e964;_0x50ffce++)if(_0xf6729b=_0x1399e2[_0x50ffce],!(_0x26fb44&&_0x536375[_0x171f19(0xd8)](_0xf6729b[_0x171f19(0x117)]()))&&!this[_0x171f19(0x165)](_0x398eff,_0xf6729b,_0x24a950)&&!_0x113bb1[_0x171f19(0x9f)+_0xf6729b[_0x171f19(0x117)]()]){if(_0x12d26c++,_0x24a950[_0x171f19(0xf6)]++,_0x12d26c>_0x5ec92e){_0x1e966c=!0x0;break;}if(!_0x24a950['isExpressionToEvaluate']&&_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0xf6)]>_0x24a950[_0x171f19(0x127)]){_0x1e966c=!0x0;break;}_0x19220f[_0x171f19(0xe5)](_0x5882b1[_0x171f19(0x15c)](_0x2de392,_0x113bb1,_0x398eff,_0x259485,_0xf6729b,_0x24a950));}}}}}if(_0x12c564[_0x171f19(0xf8)]=_0x259485,_0x5dea83?(_0x12c564[_0x171f19(0x124)]=_0x398eff[_0x171f19(0x14f)](),this[_0x171f19(0x10f)](_0x259485,_0x12c564,_0x24a950,_0x510df2)):_0x259485===_0x171f19(0x152)?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0x136)]['call'](_0x398eff):_0x259485==='bigint'?_0x12c564['value']=_0x398eff[_0x171f19(0x117)]():_0x259485==='RegExp'?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0xd7)][_0x171f19(0x123)](_0x398eff):_0x259485==='symbol'&&this[_0x171f19(0x125)]?_0x12c564[_0x171f19(0x124)]=this[_0x171f19(0x125)][_0x171f19(0xaa)][_0x171f19(0x117)][_0x171f19(0x123)](_0x398eff):!_0x24a950[_0x171f19(0xf2)]&&!(_0x259485===_0x171f19(0x86)||_0x259485==='undefined')&&(delete _0x12c564[_0x171f19(0x124)],_0x12c564['capped']=!0x0),_0x1e966c&&(_0x12c564[_0x171f19(0x139)]=!0x0),_0x261598=_0x24a950[_0x171f19(0xca)][_0x171f19(0x14a)],_0x24a950['node'][_0x171f19(0x14a)]=_0x12c564,this['_treeNodePropertiesBeforeFullValue'](_0x12c564,_0x24a950),_0x19220f[_0x171f19(0x13a)]){for(_0x50ffce=0x0,_0x18e964=_0x19220f[_0x171f19(0x13a)];_0x50ffce<_0x18e964;_0x50ffce++)_0x19220f[_0x50ffce](_0x50ffce);}_0x2de392[_0x171f19(0x13a)]&&(_0x12c564['props']=_0x2de392);}catch(_0x313923){_0x471d2e(_0x313923,_0x12c564,_0x24a950);}this[_0x171f19(0x7f)](_0x398eff,_0x12c564),this[_0x171f19(0x15e)](_0x12c564,_0x24a950),_0x24a950['node']['current']=_0x261598,_0x24a950['level']--,_0x24a950[_0x171f19(0xa8)]=_0x32bec8,_0x24a950[_0x171f19(0xa8)]&&_0x24a950[_0x171f19(0x11d)][_0x171f19(0xd1)]();}finally{_0x18447b&&(_0x274c7d['console'][_0x171f19(0x140)]=_0x18447b);}return _0x12c564;}['_getOwnPropertySymbols'](_0x25460a){var _0x2b5b6a=_0x54bbb6;return Object[_0x2b5b6a(0x173)]?Object[_0x2b5b6a(0x173)](_0x25460a):[];}[_0x54bbb6(0x16a)](_0x290900){var _0x52acd1=_0x54bbb6;return!!(_0x290900&&_0x274c7d[_0x52acd1(0xa0)]&&this[_0x52acd1(0x178)](_0x290900)===_0x52acd1(0xff)&&_0x290900[_0x52acd1(0x150)]);}[_0x54bbb6(0x165)](_0x1f363d,_0x44e206,_0x50ac1a){var _0x2241ae=_0x54bbb6;return _0x50ac1a[_0x2241ae(0x16e)]?typeof _0x1f363d[_0x44e206]=='function':!0x1;}[_0x54bbb6(0xef)](_0x4deed1){var _0x1d5037=_0x54bbb6,_0x2fc110='';return _0x2fc110=typeof _0x4deed1,_0x2fc110===_0x1d5037(0x15f)?this[_0x1d5037(0x178)](_0x4deed1)==='[object\\x20Array]'?_0x2fc110=_0x1d5037(0x100):this[_0x1d5037(0x178)](_0x4deed1)==='[object\\x20Date]'?_0x2fc110='date':this[_0x1d5037(0x178)](_0x4deed1)===_0x1d5037(0xaf)?_0x2fc110=_0x1d5037(0xb9):_0x4deed1===null?_0x2fc110=_0x1d5037(0x86):_0x4deed1[_0x1d5037(0xeb)]&&(_0x2fc110=_0x4deed1[_0x1d5037(0xeb)][_0x1d5037(0xc5)]||_0x2fc110):_0x2fc110===_0x1d5037(0xb7)&&this[_0x1d5037(0xe7)]&&_0x4deed1 instanceof this[_0x1d5037(0xe7)]&&(_0x2fc110='HTMLAllCollection'),_0x2fc110;}[_0x54bbb6(0x178)](_0x7051d6){var _0x1891a9=_0x54bbb6;return Object[_0x1891a9(0xaa)][_0x1891a9(0x117)][_0x1891a9(0x123)](_0x7051d6);}['_isPrimitiveType'](_0x389f06){var _0x297bf2=_0x54bbb6;return _0x389f06===_0x297bf2(0xa9)||_0x389f06==='string'||_0x389f06===_0x297bf2(0x13c);}[_0x54bbb6(0x8e)](_0x2b2617){var _0x38de67=_0x54bbb6;return _0x2b2617===_0x38de67(0xb3)||_0x2b2617===_0x38de67(0xe4)||_0x2b2617===_0x38de67(0x82);}['_addProperty'](_0xbfa4f4,_0x6cd504,_0x484e0a,_0x283e2d,_0x1f123f,_0x5309b8){var _0x2bb943=this;return function(_0x1d4205){var _0x4bddc8=_0xc145,_0x274fd6=_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x14a)],_0x18d7ca=_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x9c)],_0x49f1d0=_0x1f123f['node']['parent'];_0x1f123f[_0x4bddc8(0xca)]['parent']=_0x274fd6,_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x9c)]=typeof _0x283e2d==_0x4bddc8(0x13c)?_0x283e2d:_0x1d4205,_0xbfa4f4['push'](_0x2bb943[_0x4bddc8(0x133)](_0x6cd504,_0x484e0a,_0x283e2d,_0x1f123f,_0x5309b8)),_0x1f123f[_0x4bddc8(0xca)][_0x4bddc8(0x85)]=_0x49f1d0,_0x1f123f['node'][_0x4bddc8(0x9c)]=_0x18d7ca;};}[_0x54bbb6(0x15c)](_0x9cbb5c,_0x12846c,_0x5ee924,_0x3a4d82,_0x5f4ddc,_0x484ae2,_0x4d2bdf){var _0x168bd5=_0x54bbb6,_0x2eef81=this;return _0x12846c[_0x168bd5(0x9f)+_0x5f4ddc[_0x168bd5(0x117)]()]=!0x0,function(_0x44d082){var _0x78824f=_0x168bd5,_0xc3468c=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x14a)],_0x4ca4ec=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x9c)],_0x43cd57=_0x484ae2[_0x78824f(0xca)][_0x78824f(0x85)];_0x484ae2[_0x78824f(0xca)][_0x78824f(0x85)]=_0xc3468c,_0x484ae2[_0x78824f(0xca)]['index']=_0x44d082,_0x9cbb5c[_0x78824f(0xe5)](_0x2eef81[_0x78824f(0x133)](_0x5ee924,_0x3a4d82,_0x5f4ddc,_0x484ae2,_0x4d2bdf)),_0x484ae2['node'][_0x78824f(0x85)]=_0x43cd57,_0x484ae2[_0x78824f(0xca)]['index']=_0x4ca4ec;};}[_0x54bbb6(0x133)](_0x233576,_0x54e8bc,_0x382b29,_0x19fffe,_0x18e9ed){var _0x3fa53e=_0x54bbb6,_0x5e9d19=this;_0x18e9ed||(_0x18e9ed=function(_0x5b2f18,_0x1a10a5){return _0x5b2f18[_0x1a10a5];});var _0x181cf5=_0x382b29[_0x3fa53e(0x117)](),_0x41ea3c=_0x19fffe[_0x3fa53e(0x132)]||{},_0x562384=_0x19fffe['depth'],_0x37636d=_0x19fffe[_0x3fa53e(0xcf)];try{var _0x1462ad=this[_0x3fa53e(0x12f)](_0x233576),_0x48c5f8=_0x181cf5;_0x1462ad&&_0x48c5f8[0x0]==='\\x27'&&(_0x48c5f8=_0x48c5f8['substr'](0x1,_0x48c5f8['length']-0x2));var _0x4dfee=_0x19fffe[_0x3fa53e(0x132)]=_0x41ea3c['_p_'+_0x48c5f8];_0x4dfee&&(_0x19fffe[_0x3fa53e(0xf2)]=_0x19fffe[_0x3fa53e(0xf2)]+0x1),_0x19fffe[_0x3fa53e(0xcf)]=!!_0x4dfee;var _0x332612=typeof _0x382b29==_0x3fa53e(0x83),_0x1afc9a={'name':_0x332612||_0x1462ad?_0x181cf5:this[_0x3fa53e(0x12c)](_0x181cf5)};if(_0x332612&&(_0x1afc9a['symbol']=!0x0),!(_0x54e8bc===_0x3fa53e(0x100)||_0x54e8bc===_0x3fa53e(0x104))){var _0x3dcb87=this[_0x3fa53e(0x130)](_0x233576,_0x382b29);if(_0x3dcb87&&(_0x3dcb87[_0x3fa53e(0x146)]&&(_0x1afc9a[_0x3fa53e(0x142)]=!0x0),_0x3dcb87[_0x3fa53e(0x93)]&&!_0x4dfee&&!_0x19fffe[_0x3fa53e(0xf1)]))return _0x1afc9a[_0x3fa53e(0xc4)]=!0x0,this[_0x3fa53e(0x163)](_0x1afc9a,_0x19fffe),_0x1afc9a;}var _0x4c74c6;try{_0x4c74c6=_0x18e9ed(_0x233576,_0x382b29);}catch(_0x425f95){return _0x1afc9a={'name':_0x181cf5,'type':_0x3fa53e(0x118),'error':_0x425f95[_0x3fa53e(0x102)]},this['_processTreeNodeResult'](_0x1afc9a,_0x19fffe),_0x1afc9a;}var _0x938d99=this[_0x3fa53e(0xef)](_0x4c74c6),_0x48d2ab=this[_0x3fa53e(0xea)](_0x938d99);if(_0x1afc9a[_0x3fa53e(0xf8)]=_0x938d99,_0x48d2ab)this[_0x3fa53e(0x163)](_0x1afc9a,_0x19fffe,_0x4c74c6,function(){var _0x33cf45=_0x3fa53e;_0x1afc9a['value']=_0x4c74c6[_0x33cf45(0x14f)](),!_0x4dfee&&_0x5e9d19[_0x33cf45(0x10f)](_0x938d99,_0x1afc9a,_0x19fffe,{});});else{var _0x5ab3b6=_0x19fffe[_0x3fa53e(0xa8)]&&_0x19fffe[_0x3fa53e(0xd9)]<_0x19fffe['autoExpandMaxDepth']&&_0x19fffe[_0x3fa53e(0x11d)]['indexOf'](_0x4c74c6)<0x0&&_0x938d99!=='function'&&_0x19fffe[_0x3fa53e(0xf6)]<_0x19fffe[_0x3fa53e(0x127)];_0x5ab3b6||_0x19fffe[_0x3fa53e(0xd9)]<_0x562384||_0x4dfee?(this[_0x3fa53e(0x155)](_0x1afc9a,_0x4c74c6,_0x19fffe,_0x4dfee||{}),this[_0x3fa53e(0x7f)](_0x4c74c6,_0x1afc9a)):this['_processTreeNodeResult'](_0x1afc9a,_0x19fffe,_0x4c74c6,function(){var _0x111231=_0x3fa53e;_0x938d99===_0x111231(0x86)||_0x938d99===_0x111231(0xb7)||(delete _0x1afc9a[_0x111231(0x124)],_0x1afc9a[_0x111231(0x129)]=!0x0);});}return _0x1afc9a;}finally{_0x19fffe[_0x3fa53e(0x132)]=_0x41ea3c,_0x19fffe[_0x3fa53e(0xf2)]=_0x562384,_0x19fffe[_0x3fa53e(0xcf)]=_0x37636d;}}['_capIfString'](_0x581e93,_0x84fa5b,_0x5d31d3,_0x45b883){var _0xfd3f77=_0x54bbb6,_0x51dc92=_0x45b883['strLength']||_0x5d31d3[_0xfd3f77(0x16b)];if((_0x581e93===_0xfd3f77(0x11b)||_0x581e93===_0xfd3f77(0xe4))&&_0x84fa5b[_0xfd3f77(0x124)]){let _0x1638c6=_0x84fa5b['value'][_0xfd3f77(0x13a)];_0x5d31d3[_0xfd3f77(0xfd)]+=_0x1638c6,_0x5d31d3[_0xfd3f77(0xfd)]>_0x5d31d3[_0xfd3f77(0x15a)]?(_0x84fa5b[_0xfd3f77(0x129)]='',delete _0x84fa5b['value']):_0x1638c6>_0x51dc92&&(_0x84fa5b[_0xfd3f77(0x129)]=_0x84fa5b[_0xfd3f77(0x124)]['substr'](0x0,_0x51dc92),delete _0x84fa5b['value']);}}['_isMap'](_0x2d9c2e){var _0x1f7590=_0x54bbb6;return!!(_0x2d9c2e&&_0x274c7d['Map']&&this['_objectToString'](_0x2d9c2e)===_0x1f7590(0xcd)&&_0x2d9c2e[_0x1f7590(0x150)]);}[_0x54bbb6(0x12c)](_0x5e8596){var _0x196a24=_0x54bbb6;if(_0x5e8596['match'](/^\\d+$/))return _0x5e8596;var _0x330bd4;try{_0x330bd4=JSON[_0x196a24(0xd3)](''+_0x5e8596);}catch{_0x330bd4='\\x22'+this[_0x196a24(0x178)](_0x5e8596)+'\\x22';}return _0x330bd4[_0x196a24(0x89)](/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?_0x330bd4=_0x330bd4['substr'](0x1,_0x330bd4[_0x196a24(0x13a)]-0x2):_0x330bd4=_0x330bd4[_0x196a24(0xb0)](/'/g,'\\x5c\\x27')[_0x196a24(0xb0)](/\\\\"/g,'\\x22')[_0x196a24(0xb0)](/(^"|"$)/g,'\\x27'),_0x330bd4;}[_0x54bbb6(0x163)](_0x4bea1d,_0x227889,_0x57842,_0x516a1b){var _0x4a9e29=_0x54bbb6;this[_0x4a9e29(0x103)](_0x4bea1d,_0x227889),_0x516a1b&&_0x516a1b(),this[_0x4a9e29(0x7f)](_0x57842,_0x4bea1d),this[_0x4a9e29(0x15e)](_0x4bea1d,_0x227889);}[_0x54bbb6(0x103)](_0x5343ce,_0x30eb50){var _0x2f4977=_0x54bbb6;this[_0x2f4977(0xd0)](_0x5343ce,_0x30eb50),this[_0x2f4977(0xf4)](_0x5343ce,_0x30eb50),this[_0x2f4977(0x12b)](_0x5343ce,_0x30eb50),this[_0x2f4977(0x105)](_0x5343ce,_0x30eb50);}[_0x54bbb6(0xd0)](_0x25e7d8,_0x3adc72){}[_0x54bbb6(0xf4)](_0x36ca22,_0x7eb9d0){}[_0x54bbb6(0x13b)](_0x3cfced,_0x5c952b){}[_0x54bbb6(0x99)](_0x2ec3d5){var _0x23aad7=_0x54bbb6;return _0x2ec3d5===this[_0x23aad7(0x10c)];}['_treeNodePropertiesAfterFullValue'](_0x34cf57,_0x22c1b3){var _0x4757ae=_0x54bbb6;this[_0x4757ae(0x13b)](_0x34cf57,_0x22c1b3),this[_0x4757ae(0xc0)](_0x34cf57),_0x22c1b3[_0x4757ae(0xc7)]&&this[_0x4757ae(0x10a)](_0x34cf57),this[_0x4757ae(0x164)](_0x34cf57,_0x22c1b3),this['_addLoadNode'](_0x34cf57,_0x22c1b3),this['_cleanNode'](_0x34cf57);}[_0x54bbb6(0x7f)](_0x4338ce,_0x24eade){var _0x19f8b6=_0x54bbb6;try{_0x4338ce&&typeof _0x4338ce['length']==_0x19f8b6(0x13c)&&(_0x24eade[_0x19f8b6(0x13a)]=_0x4338ce[_0x19f8b6(0x13a)]);}catch{}if(_0x24eade['type']===_0x19f8b6(0x13c)||_0x24eade[_0x19f8b6(0xf8)]===_0x19f8b6(0x82)){if(isNaN(_0x24eade[_0x19f8b6(0x124)]))_0x24eade[_0x19f8b6(0x13e)]=!0x0,delete _0x24eade[_0x19f8b6(0x124)];else switch(_0x24eade[_0x19f8b6(0x124)]){case Number[_0x19f8b6(0x13d)]:_0x24eade[_0x19f8b6(0xe1)]=!0x0,delete _0x24eade['value'];break;case Number[_0x19f8b6(0x9d)]:_0x24eade[_0x19f8b6(0xc6)]=!0x0,delete _0x24eade[_0x19f8b6(0x124)];break;case 0x0:this['_isNegativeZero'](_0x24eade[_0x19f8b6(0x124)])&&(_0x24eade[_0x19f8b6(0x12e)]=!0x0);break;}}else _0x24eade[_0x19f8b6(0xf8)]===_0x19f8b6(0x10b)&&typeof _0x4338ce[_0x19f8b6(0xc5)]==_0x19f8b6(0x11b)&&_0x4338ce[_0x19f8b6(0xc5)]&&_0x24eade[_0x19f8b6(0xc5)]&&_0x4338ce[_0x19f8b6(0xc5)]!==_0x24eade[_0x19f8b6(0xc5)]&&(_0x24eade[_0x19f8b6(0xbb)]=_0x4338ce[_0x19f8b6(0xc5)]);}[_0x54bbb6(0xed)](_0x5ddf8f){var _0xfad8c1=_0x54bbb6;return 0x1/_0x5ddf8f===Number[_0xfad8c1(0x9d)];}[_0x54bbb6(0x10a)](_0xd2b322){var _0x1fb5f1=_0x54bbb6;!_0xd2b322[_0x1fb5f1(0x141)]||!_0xd2b322[_0x1fb5f1(0x141)][_0x1fb5f1(0x13a)]||_0xd2b322[_0x1fb5f1(0xf8)]===_0x1fb5f1(0x100)||_0xd2b322[_0x1fb5f1(0xf8)]===_0x1fb5f1(0x171)||_0xd2b322[_0x1fb5f1(0xf8)]==='Set'||_0xd2b322[_0x1fb5f1(0x141)][_0x1fb5f1(0xa7)](function(_0x4362ca,_0x40ce89){var _0x1ec206=_0x1fb5f1,_0x2019d8=_0x4362ca[_0x1ec206(0xc5)]['toLowerCase'](),_0x2fee95=_0x40ce89[_0x1ec206(0xc5)]['toLowerCase']();return _0x2019d8<_0x2fee95?-0x1:_0x2019d8>_0x2fee95?0x1:0x0;});}[_0x54bbb6(0x164)](_0x7303f,_0x5d624b){var _0x278d36=_0x54bbb6;if(!(_0x5d624b['noFunctions']||!_0x7303f[_0x278d36(0x141)]||!_0x7303f[_0x278d36(0x141)][_0x278d36(0x13a)])){for(var _0x449957=[],_0x129b94=[],_0x4db039=0x0,_0x10c97d=_0x7303f[_0x278d36(0x141)][_0x278d36(0x13a)];_0x4db039<_0x10c97d;_0x4db039++){var _0x4ff592=_0x7303f['props'][_0x4db039];_0x4ff592['type']===_0x278d36(0x10b)?_0x449957[_0x278d36(0xe5)](_0x4ff592):_0x129b94['push'](_0x4ff592);}if(!(!_0x129b94[_0x278d36(0x13a)]||_0x449957['length']<=0x1)){_0x7303f[_0x278d36(0x141)]=_0x129b94;var _0x3812d3={'functionsNode':!0x0,'props':_0x449957};this[_0x278d36(0xd0)](_0x3812d3,_0x5d624b),this[_0x278d36(0x13b)](_0x3812d3,_0x5d624b),this[_0x278d36(0xc0)](_0x3812d3),this[_0x278d36(0x105)](_0x3812d3,_0x5d624b),_0x3812d3['id']+='\\x20f',_0x7303f[_0x278d36(0x141)][_0x278d36(0x97)](_0x3812d3);}}}[_0x54bbb6(0xa3)](_0x4b6eb5,_0x14fb5e){}['_setNodeExpandableState'](_0x2e862b){}['_isArray'](_0x5e8475){var _0x43a5b9=_0x54bbb6;return Array[_0x43a5b9(0x176)](_0x5e8475)||typeof _0x5e8475==_0x43a5b9(0x15f)&&this[_0x43a5b9(0x178)](_0x5e8475)===_0x43a5b9(0x8d);}[_0x54bbb6(0x105)](_0x3f2715,_0x44e327){}[_0x54bbb6(0xa2)](_0x4a3570){var _0x4db01c=_0x54bbb6;delete _0x4a3570['_hasSymbolPropertyOnItsPath'],delete _0x4a3570[_0x4db01c(0xae)],delete _0x4a3570[_0x4db01c(0x14d)];}[_0x54bbb6(0x12b)](_0x2acbc1,_0x565922){}}let _0x1b7b89=new _0x520123(),_0x441d73={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x576235={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2};function _0x947643(_0x455c3c,_0x59fc4c,_0xbe5074,_0x2bd252,_0x4c6237,_0x5c8288){var _0x23fd4d=_0x54bbb6;let _0x16b42e,_0x181f99;try{_0x181f99=_0x7d7510(),_0x16b42e=_0x1fe9bb[_0x59fc4c],!_0x16b42e||_0x181f99-_0x16b42e['ts']>0x1f4&&_0x16b42e[_0x23fd4d(0xd2)]&&_0x16b42e[_0x23fd4d(0x172)]/_0x16b42e[_0x23fd4d(0xd2)]<0x64?(_0x1fe9bb[_0x59fc4c]=_0x16b42e={'count':0x0,'time':0x0,'ts':_0x181f99},_0x1fe9bb[_0x23fd4d(0x9a)]={}):_0x181f99-_0x1fe9bb['hits']['ts']>0x32&&_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]&&_0x1fe9bb[_0x23fd4d(0x9a)]['time']/_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]<0x64&&(_0x1fe9bb['hits']={});let _0x4b17df=[],_0x3275f9=_0x16b42e[_0x23fd4d(0xc3)]||_0x1fe9bb['hits'][_0x23fd4d(0xc3)]?_0x576235:_0x441d73,_0x204a85=_0x56119b=>{var _0x172804=_0x23fd4d;let _0x43a7b2={};return _0x43a7b2[_0x172804(0x141)]=_0x56119b[_0x172804(0x141)],_0x43a7b2[_0x172804(0x143)]=_0x56119b['elements'],_0x43a7b2[_0x172804(0x16b)]=_0x56119b[_0x172804(0x16b)],_0x43a7b2[_0x172804(0x15a)]=_0x56119b[_0x172804(0x15a)],_0x43a7b2['autoExpandLimit']=_0x56119b['autoExpandLimit'],_0x43a7b2[_0x172804(0x17a)]=_0x56119b['autoExpandMaxDepth'],_0x43a7b2['sortProps']=!0x1,_0x43a7b2[_0x172804(0x16e)]=!_0x594f94,_0x43a7b2[_0x172804(0xf2)]=0x1,_0x43a7b2['level']=0x0,_0x43a7b2[_0x172804(0x113)]=_0x172804(0xba),_0x43a7b2['rootExpression']=_0x172804(0x90),_0x43a7b2[_0x172804(0xa8)]=!0x0,_0x43a7b2['autoExpandPreviousObjects']=[],_0x43a7b2[_0x172804(0xf6)]=0x0,_0x43a7b2['resolveGetters']=!0x0,_0x43a7b2[_0x172804(0xfd)]=0x0,_0x43a7b2[_0x172804(0xca)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x43a7b2;};for(var _0x5383d6=0x0;_0x5383d6<_0x4c6237[_0x23fd4d(0x13a)];_0x5383d6++)_0x4b17df[_0x23fd4d(0xe5)](_0x1b7b89[_0x23fd4d(0x155)]({'timeNode':_0x455c3c===_0x23fd4d(0x172)||void 0x0},_0x4c6237[_0x5383d6],_0x204a85(_0x3275f9),{}));if(_0x455c3c==='trace'||_0x455c3c==='error'){let _0xdfeea3=Error[_0x23fd4d(0x144)];try{Error[_0x23fd4d(0x144)]=0x1/0x0,_0x4b17df[_0x23fd4d(0xe5)](_0x1b7b89[_0x23fd4d(0x155)]({'stackNode':!0x0},new Error()[_0x23fd4d(0x98)],_0x204a85(_0x3275f9),{'strLength':0x1/0x0}));}finally{Error['stackTraceLimit']=_0xdfeea3;}}return{'method':'log','version':_0x17209b,'args':[{'ts':_0xbe5074,'session':_0x2bd252,'args':_0x4b17df,'id':_0x59fc4c,'context':_0x5c8288}]};}catch(_0x5b7eb1){return{'method':_0x23fd4d(0x162),'version':_0x17209b,'args':[{'ts':_0xbe5074,'session':_0x2bd252,'args':[{'type':_0x23fd4d(0x118),'error':_0x5b7eb1&&_0x5b7eb1[_0x23fd4d(0x102)]}],'id':_0x59fc4c,'context':_0x5c8288}]};}finally{try{if(_0x16b42e&&_0x181f99){let _0x36f576=_0x7d7510();_0x16b42e[_0x23fd4d(0xd2)]++,_0x16b42e[_0x23fd4d(0x172)]+=_0x4f599c(_0x181f99,_0x36f576),_0x16b42e['ts']=_0x36f576,_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xd2)]++,_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0x172)]+=_0x4f599c(_0x181f99,_0x36f576),_0x1fe9bb[_0x23fd4d(0x9a)]['ts']=_0x36f576,(_0x16b42e[_0x23fd4d(0xd2)]>0x32||_0x16b42e[_0x23fd4d(0x172)]>0x64)&&(_0x16b42e[_0x23fd4d(0xc3)]=!0x0),(_0x1fe9bb['hits']['count']>0x3e8||_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0x172)]>0x12c)&&(_0x1fe9bb[_0x23fd4d(0x9a)][_0x23fd4d(0xc3)]=!0x0);}}catch{}}}return _0x947643;}((_0x385570,_0x9cecea,_0x611c3e,_0x47cbda,_0x3675e9,_0x2e3a3e,_0x3f2ade,_0x1e40ad,_0x4ecce5,_0x49d13a,_0x5336e2)=>{var _0x4fd702=_0x1fd864;if(_0x385570[_0x4fd702(0x138)])return _0x385570[_0x4fd702(0x138)];if(!X(_0x385570,_0x1e40ad,_0x3675e9))return _0x385570['_console_ninja']={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x385570[_0x4fd702(0x138)];let _0x32bc6c=B(_0x385570),_0x278032=_0x32bc6c['elapsed'],_0x27ea9e=_0x32bc6c[_0x4fd702(0x16d)],_0x2b238b=_0x32bc6c[_0x4fd702(0xdd)],_0x566ac0={'hits':{},'ts':{}},_0x3bfcaf=J(_0x385570,_0x4ecce5,_0x566ac0,_0x2e3a3e),_0x53d045=_0x210e4=>{_0x566ac0['ts'][_0x210e4]=_0x27ea9e();},_0x138aeb=(_0x327637,_0x488ce9)=>{var _0x58159f=_0x4fd702;let _0x178ae7=_0x566ac0['ts'][_0x488ce9];if(delete _0x566ac0['ts'][_0x488ce9],_0x178ae7){let _0x1377fb=_0x278032(_0x178ae7,_0x27ea9e());_0x280e21(_0x3bfcaf(_0x58159f(0x172),_0x327637,_0x2b238b(),_0x224839,[_0x1377fb],_0x488ce9));}},_0x518c2c=_0x29d175=>{var _0x4ca26e=_0x4fd702,_0x38fb52;return _0x3675e9==='next.js'&&_0x385570[_0x4ca26e(0xac)]&&((_0x38fb52=_0x29d175==null?void 0x0:_0x29d175['args'])==null?void 0x0:_0x38fb52[_0x4ca26e(0x13a)])&&(_0x29d175[_0x4ca26e(0x170)][0x0]['origin']=_0x385570[_0x4ca26e(0xac)]),_0x29d175;};_0x385570[_0x4fd702(0x138)]={'consoleLog':(_0x40d516,_0x270457)=>{var _0x10a543=_0x4fd702;_0x385570[_0x10a543(0x91)][_0x10a543(0x162)][_0x10a543(0xc5)]!==_0x10a543(0x88)&&_0x280e21(_0x3bfcaf('log',_0x40d516,_0x2b238b(),_0x224839,_0x270457));},'consoleTrace':(_0x3396ac,_0x122ae4)=>{var _0x29be82=_0x4fd702,_0x4b7637,_0x35e3a9;_0x385570[_0x29be82(0x91)][_0x29be82(0x162)]['name']!=='disabledTrace'&&((_0x35e3a9=(_0x4b7637=_0x385570[_0x29be82(0xc8)])==null?void 0x0:_0x4b7637[_0x29be82(0x9e)])!=null&&_0x35e3a9['node']&&(_0x385570['_ninjaIgnoreNextError']=!0x0),_0x280e21(_0x518c2c(_0x3bfcaf(_0x29be82(0x101),_0x3396ac,_0x2b238b(),_0x224839,_0x122ae4))));},'consoleError':(_0x36d3cf,_0x451b1d)=>{var _0x4551f0=_0x4fd702;_0x385570[_0x4551f0(0xd6)]=!0x0,_0x280e21(_0x518c2c(_0x3bfcaf('error',_0x36d3cf,_0x2b238b(),_0x224839,_0x451b1d)));},'consoleTime':_0x45134c=>{_0x53d045(_0x45134c);},'consoleTimeEnd':(_0x3d07f5,_0x98e4d4)=>{_0x138aeb(_0x98e4d4,_0x3d07f5);},'autoLog':(_0x99b608,_0x273fa4)=>{var _0x44d244=_0x4fd702;_0x280e21(_0x3bfcaf(_0x44d244(0x162),_0x273fa4,_0x2b238b(),_0x224839,[_0x99b608]));},'autoLogMany':(_0x890992,_0x25c482)=>{var _0x1ce81b=_0x4fd702;_0x280e21(_0x3bfcaf(_0x1ce81b(0x162),_0x890992,_0x2b238b(),_0x224839,_0x25c482));},'autoTrace':(_0x3741e8,_0x1336ec)=>{_0x280e21(_0x518c2c(_0x3bfcaf('trace',_0x1336ec,_0x2b238b(),_0x224839,[_0x3741e8])));},'autoTraceMany':(_0x20b3de,_0x5c880b)=>{var _0x1781db=_0x4fd702;_0x280e21(_0x518c2c(_0x3bfcaf(_0x1781db(0x101),_0x20b3de,_0x2b238b(),_0x224839,_0x5c880b)));},'autoTime':(_0x5e9a28,_0x341c0d,_0xe2c00b)=>{_0x53d045(_0xe2c00b);},'autoTimeEnd':(_0x30bc0a,_0x137b72,_0x1c02b3)=>{_0x138aeb(_0x137b72,_0x1c02b3);},'coverage':_0x5621c2=>{var _0x1c7d14=_0x4fd702;_0x280e21({'method':_0x1c7d14(0x110),'version':_0x2e3a3e,'args':[{'id':_0x5621c2}]});}};let _0x280e21=H(_0x385570,_0x9cecea,_0x611c3e,_0x47cbda,_0x3675e9,_0x49d13a,_0x5336e2),_0x224839=_0x385570['_console_ninja_session'];return _0x385570[_0x4fd702(0x138)];})(globalThis,_0x1fd864(0x8b),_0x1fd864(0x156),_0x1fd864(0x16f),'vite',_0x1fd864(0x94),_0x1fd864(0x154),_0x1fd864(0xfa),_0x1fd864(0x14c),_0x1fd864(0xe0),_0x1fd864(0xde));`);
  } catch (e) {
  }
}
function oo_oo(i, ...v) {
  try {
    oo_cm().consoleLog(i, v);
  } catch (e) {
  }
  return v;
}
function oo_tx(i, ...v) {
  try {
    oo_cm().consoleError(i, v);
  } catch (e) {
  }
  return v;
}
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
