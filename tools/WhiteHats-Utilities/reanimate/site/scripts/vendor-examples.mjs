// Copies the runtime files the live examples load (three.js r178 and the Inter font) from
// node_modules into public/examples/*/vendor, so they are served with the static export.
// Runs before `dev` and `build`; the vendor folders are git-ignored.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const nm = (...p) => join(root, "node_modules", ...p);
const vendor = join(root, "public", "examples", "stripe-bento", "vendor");

rmSync(vendor, { recursive: true, force: true });
mkdirSync(join(vendor, "three", "addons"), { recursive: true });
mkdirSync(join(vendor, "fonts"), { recursive: true });
for (const f of ["three.module.js", "three.core.js"]) cpSync(nm("three", "build", f), join(vendor, "three", f));
cpSync(nm("three", "examples", "jsm", "lines"), join(vendor, "three", "addons", "lines"), { recursive: true });
cpSync(nm("three", "LICENSE"), join(vendor, "three", "LICENSE"));
cpSync(nm("@fontsource-variable", "inter", "files", "inter-latin-wght-normal.woff2"), join(vendor, "fonts", "inter-latin-wght-normal.woff2"));
cpSync(nm("@fontsource-variable", "inter", "LICENSE"), join(vendor, "fonts", "LICENSE-inter.txt"));
console.log("vendored three.js + Inter into", vendor);

// resend-cube: three.js only (no addons, no fonts).
const resendVendor = join(root, "public", "examples", "resend-cube", "vendor");
rmSync(resendVendor, { recursive: true, force: true });
mkdirSync(join(resendVendor, "three"), { recursive: true });
for (const f of ["three.module.js", "three.core.js"]) cpSync(nm("three", "build", f), join(resendVendor, "three", f));
cpSync(nm("three", "LICENSE"), join(resendVendor, "three", "LICENSE"));
console.log("vendored three.js into", resendVendor);
