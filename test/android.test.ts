// The Android app (Step 8, owner approved 16 Oct 2026): its version script, and its code never runs on the web.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error: a plain script of the tools, without types
import { apply, next } from "../tools/android/version.mjs";

const loaded = vi.fn();
vi.mock("@capacitor/app", () => {
  loaded();
  return { App: { addListener: vi.fn(async () => ({ remove: async () => {} })), exitApp: vi.fn(async () => {}) } };
});

describe("android:version", () => {
  it("sets the new version and adds 1 to the versionCode", () => {
    expect(next("1.0.0", 1, "1.0.1")).toEqual({ version: "1.0.1", code: 2 });
    expect(next("1.0.9", 7, "1.1.0")).toEqual({ version: "1.1.0", code: 8 });
    expect(next("1.9.9", 12, "2.0.0")).toEqual({ version: "2.0.0", code: 13 });
  });

  it("refuses a version that is not higher, not a version, or a broken versionCode", () => {
    expect(next("1.0.1", 2, "1.0.1").error).toMatch(/higher than 1\.0\.1/);
    expect(next("1.2.0", 2, "1.1.9").error).toMatch(/higher/);
    expect(next("1.0.0", 1, undefined).error).toMatch(/npm run android:version 1\.0\.1/);
    expect(next("1.0.0", 1, "1.0").error).toMatch(/not a version/);
    expect(next("1.0.0", Number.NaN, "1.0.1").error).toMatch(/whole number/);
  });

  it("writes package.json, package-lock.json and android/version-code.txt, and nothing on an error", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "dgm-version-"));
    fs.mkdirSync(path.join(root, "android"));
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "x", version: "1.0.0" }));
    fs.writeFileSync(path.join(root, "package-lock.json"), JSON.stringify({ version: "1.0.0", packages: { "": { version: "1.0.0" } } }));
    fs.writeFileSync(path.join(root, "android", "version-code.txt"), "1\n");
    expect(apply(root, "1.0.1")).toEqual({ version: "1.0.1", code: 2 });
    const read = (f: string) => fs.readFileSync(path.join(root, f), "utf8");
    expect(JSON.parse(read("package.json")).version).toBe("1.0.1");
    expect(JSON.parse(read("package-lock.json")).packages[""].version).toBe("1.0.1");
    expect(read("android/version-code.txt").trim()).toBe("2");
    expect(apply(root, "1.0.0").error).toBeTruthy();
    expect(read("android/version-code.txt").trim()).toBe("2");
    fs.rmSync(root, { recursive: true });
  });

  it("the app takes its version from these two files, and the first release is 1.0.0 / 1", () => {
    const gradle = fs.readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8");
    expect(gradle).toContain("versionCode appVersionCode");
    expect(gradle).toContain("versionName appVersionName");
    expect(fs.readFileSync(new URL("../android/version-code.txt", import.meta.url), "utf8").trim()).toMatch(/^\d+$/);
  });
});

describe("app-only code on the web", () => {
  afterEach(() => { delete (globalThis as { Capacitor?: unknown }).Capacitor; });

  it("is not taken: no Capacitor bridge, so the app plugin is never loaded", async () => {
    const { inApp, startApp } = await import("../src/ui/native");
    expect(inApp()).toBe(false);
    expect(await startApp(() => {})).toBe(false);
    expect(loaded).not.toHaveBeenCalled();
  });

  it("is taken in the app: the Back button and the background are listened to", async () => {
    (globalThis as { Capacitor?: unknown }).Capacitor = { isNativePlatform: () => true };
    const { inApp, startApp } = await import("../src/ui/native");
    const { App } = await import("@capacitor/app");
    expect(inApp()).toBe(true);
    expect(await startApp(() => {})).toBe(true);
    expect(vi.mocked(App.addListener).mock.calls.map((c) => c[0]).sort()).toEqual(["appStateChange", "backButton"]);
  });

  it("the offline worker is registered only outside the app (A5)", () => {
    const main = fs.readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(main).toMatch(/if \(import\.meta\.env\.PROD && "serviceWorker" in navigator && !inApp\(\)\)/);
  });
});

describe("the Android manifest", () => {
  const manifest = fs.readFileSync(new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8");

  it("asks only for VIBRATE, removes INTERNET, and backs nothing up (A6, A7, A9)", () => {
    const asked = [...manifest.matchAll(/<uses-permission android:name="([^"]+)"( tools:node="remove")?/g)];
    expect(asked.filter((m) => !m[2]).map((m) => m[1])).toEqual(["android.permission.VIBRATE"]);
    expect(asked.filter((m) => m[2]).map((m) => m[1])).toEqual(["android.permission.INTERNET"]);
    expect(manifest).toContain('android:allowBackup="false"');
    for (const f of ["backup_rules", "data_extraction_rules"]) {
      const rules = fs.readFileSync(new URL(`../android/app/src/main/res/xml/${f}.xml`, import.meta.url), "utf8");
      expect(rules).not.toContain("<include");
      expect(rules).toContain('<exclude domain="sharedpref" path="." />');
    }
  });

  it("no key, password or Google services file is in the repository's folders", () => {
    const ignore = fs.readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
    for (const k of ["*.jks", "*.keystore", "keystore.properties", "google-services.json", "local.properties", "*.apk", "*.aab"]) expect(ignore).toContain(k);
  });
});
