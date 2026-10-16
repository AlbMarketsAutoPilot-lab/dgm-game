// Step 8, Step C: the Android project (android/) stays in step with the owner's decisions and with the game.
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_HOST } from "../src/ui/android";

const read = (f: string) => fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const app = "android/app/";
const manifest = read(`${app}src/main/AndroidManifest.xml`);
const activity = read(`${app}src/main/java/com/dontgetmad/game/MainActivity.java`);

describe("the Android app", () => {
  it("asks for no permission at all (D9)", () => {
    expect(manifest).not.toMatch(/<uses-permission|<permission|<uses-feature/);
  });

  it("allows Android backup, and the privacy policy says so (D10)", () => {
    expect(manifest).toContain('android:allowBackup="true"');
    expect(read("public/privacy.html")).toContain("Android backup");
  });

  it("turns with the phone (D12), and keeps the game running when it turns", () => {
    expect(manifest).not.toContain("screenOrientation");
    expect(manifest).toContain('android:configChanges="orientation|screenSize');
  });

  it("serves the game from the address the page knows (B1) and calls the page's Back (B2, D13)", () => {
    expect(activity).toContain(`HOST = "${APP_HOST}"`);
    expect(activity).toContain('"https://" + HOST + "/assets/index.html"');
    expect(activity).toContain("window.dgmBack ? (window.dgmBack() ? 1 : 0) : -1");
    expect(read("src/main.ts")).toContain(".dgmBack = () => back()");
  });

  it("has the approved app ID, name, colour and icon (D1, D2, D7, D11)", () => {
    const gradle = read(`${app}build.gradle.kts`);
    expect(gradle).toContain('applicationId = "com.dontgetmad.game"');
    expect(read(`${app}src/main/res/values/strings.xml`)).toContain('<string name="app_name">Don’t Get Mad</string>');
    expect(read(`${app}src/main/res/values/colors.xml`)).toContain("#4b2377");
    expect(activity).toContain("Color.rgb(0x4b, 0x23, 0x77)");
    for (const d of ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"])
      for (const f of ["ic_launcher", "ic_launcher_round", "ic_launcher_background"])
        expect(fs.existsSync(new URL(`../${app}src/main/res/mipmap-${d}/${f}.png`, import.meta.url))).toBe(true);
  });

  it("keeps the signing key and the copied game off GitHub (rule 6)", () => {
    const ignore = read("android/.gitignore");
    for (const f of ["*.jks", "*.keystore", "app/src/main/assets/", "local.properties"]) expect(ignore).toContain(f);
  });
});
