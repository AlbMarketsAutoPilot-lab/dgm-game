// S3: text from data (board files, player names) is always shown as text, never run as markup.
import { describe, expect, it } from "vitest";
import { BOARDS } from "../src/engine";
import { DESTINATIONS } from "../src/engine/v3";
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
  it("a board file's own words: an unknown square's story, landmarks and regions", () => {
    const B = BOARDS.short, tiles = { ...B.tiles, 3: { cat: "R" as const, type: "card" as const, card: "bonus" as const, text: BAD, story: BAD, icon: "unknown-icon" } };
    const story = { ...B.story, landmarks: { ...B.story.landmarks, 4: { name: BAD, icon: "house" } }, regions: B.story.regions.map((r, i) => (i === 0 ? { ...r, name: BAD } : r)) };
    expect(taleOf({ ...B, tiles, story }, 3)!.tale.text).not.toContain("<img");
  });
  it("a destination file's own words on the stage cards (Step I phase C3)", () => {
    const B = DESTINATIONS["lantern-festival"];
    const bad = { ...B, tiles: { ...B.tiles, 3: { cat: "R" as const, type: "card" as const, name: BAD, title: BAD, icon: "unknown-icon" } },
      landmarks: { ...B.landmarks, 4: { name: BAD, icon: "house" } }, areas: B.areas.map((a, i) => (i === 0 ? { ...a, name: BAD } : a)),
      destination: { name: BAD }, moments: { home: { title: BAD } } };
    for (const pos of [0, 3, 4, 5, B.endTile]) expect(card(bad, pos).html, `square ${pos}`).not.toContain("<img");
  });
});
