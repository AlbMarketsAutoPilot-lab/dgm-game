// Copyright and privacy (owner, 15 Oct, for Google Play): the notice and the pages stay complete and in step with the game.
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (f: string) => fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

describe("copyright and privacy", () => {
  it("the start screen shows the copyright notice and links to both pages", () => {
    const setup = read("src/ui/setup.ts");
    expect(setup).toContain("© 2026 Connect AL");
    expect(setup).toContain('href="./copyright.html"');
    expect(setup).toContain('href="./privacy.html"');
  });

  it("every sound in the game is credited in the third-party licences and on the copyright page", () => {
    const sounds = fs.readdirSync(new URL("../src/assets/sounds", import.meta.url)).filter((f) => f.endsWith(".mp3"));
    const credits = read("public/licenses/third-party.txt"), page = read("public/copyright.html");
    expect(sounds.length).toBeGreaterThan(0);
    for (const s of sounds) expect(credits).toContain(s);
    for (const who of ["Kenney", "rubberduck", "pyranostudios", "mintodog", "starninjas", "extenz"]) expect(page).toContain(who);
    expect(credits).toContain("SIL OPEN FONT LICENSE Version 1.1");
  });

  it("the privacy policy names every kind of data the game keeps on the device", () => {
    const keys = new Set<string>();
    for (const f of fs.readdirSync(new URL("../src/ui", import.meta.url)).filter((f) => f.endsWith(".ts")))
      for (const m of read(`src/ui/${f}`).matchAll(/"(dgm\.[a-z]+\.v\d+)"/g)) keys.add(m[1]);
    // each storage key and the line of the policy that tells it
    const told: Record<string, string> = { "dgm.game.v1": "The game in progress", "dgm.postcards.v1": "postcards", "dgm.sound.v1": "sound effects and music", "dgm.guide.v1": "guide" };
    const policy = read("public/privacy.html");
    expect([...keys].sort()).toEqual(Object.keys(told).sort()); // a new kind of saved data must be added to the policy
    for (const k of keys) expect(policy).toContain(told[k]);
  });

  it("both pages carry the owner's name and the notice", () => {
    for (const f of ["public/copyright.html", "public/privacy.html", "LICENSE"]) expect(read(f)).toMatch(/(©|\(c\)|Copyright \(c\)) 2026 Connect AL/i);
  });
});
