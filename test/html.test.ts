// S3: text from data (board files, player names) is always shown as text, never run as markup.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { artFor } from "../src/render/art";
import { cardFace } from "../src/render/art-modern";
import { esc } from "../src/render/html";
import { describe as card } from "../src/ui/stage";
import { fill, taleOf } from "../src/ui/tales";

const BAD = `<img src=x onerror="alert(1)">'&`;

describe("text is escaped", () => {
  it("esc", () => {
    expect(esc(BAD)).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&#39;&amp;");
    expect(esc(undefined)).toBe("");
    expect(esc(7)).toBe("7");
  });
  it("picture labels", () => {
    expect(artFor("house", BAD)).not.toContain("<img");
    expect(artFor("no-such-picture", BAD)).not.toContain("<img");
    expect(cardFace("bonus", BAD)).not.toContain("<img");
  });
  it("names filled into the story", () => expect(fill("{p} meets {o} ({n})", { p: BAD, o: "<b>", n: "<i>" })).not.toMatch(/<(img|b|i)/));
  it("a board file's own words: an unknown square's story, landmarks and regions on the stage", () => {
    const B = BOARDS.short, tiles = { ...B.tiles, 3: { cat: "R" as const, type: "card" as const, card: "bonus" as const, text: BAD, story: BAD, icon: "unknown-icon" } };
    const story = { ...B.story, landmarks: { ...B.story.landmarks, 4: { name: BAD, icon: "house" } }, regions: B.story.regions.map((r, i) => (i === 0 ? { ...r, name: BAD } : r)) };
    const bad = { ...B, tiles, story };
    expect(taleOf(bad, 3)!.tale.text).not.toContain("<img");
    for (const pos of [3, 4, 5]) expect(card(bad, pos).html, `square ${pos}`).not.toContain("<img");
  });
});
