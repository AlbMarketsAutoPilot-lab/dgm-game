// Camera view math (pan, zoom, limits): the board stays on screen and zooming keeps the point under the finger.
import { describe, expect, it } from "vitest";
import { clampView, fitZoom, limitsFor, squareZoom, zoomAround } from "../src/render/camera";

const B = { x: -2, y: -1, w: 22, h: 20 }, VW = 390, VH = 700;

describe("camera", () => {
  it("square level shows about 2.8 squares across a phone", () => expect(VW / squareZoom(VW, VH)).toBeCloseTo(2.8));
  it("zoom limits: from the whole board to close-up", () => {
    const lim = limitsFor(B, VW, VH);
    expect(lim.minZoom).toBeCloseTo(fitZoom(B, VW, VH));
    expect(lim.maxZoom).toBeGreaterThan(squareZoom(VW, VH));
  });
  it("zooming keeps the board point under the finger in place", () => {
    const v = { cx: 5, cy: 5, zoom: 100 }, z = zoomAround(v, 2, 300, 100, VW, VH);
    const under = (w: typeof v) => [w.cx + (300 - VW / 2) / w.zoom, w.cy + (100 - VH / 2) / w.zoom];
    expect(under(z)[0]).toBeCloseTo(under(v)[0]);
    expect(under(z)[1]).toBeCloseTo(under(v)[1]);
  });
  it("the board cannot be dragged off screen", () => {
    const lim = limitsFor(B, VW, VH), v = clampView({ cx: 999, cy: -999, zoom: 100 }, B, VW, VH, lim);
    expect(v.cx).toBeCloseTo(B.x + B.w - VW / 2 / 100);
    expect(v.cy).toBeCloseTo(B.y + VH / 2 / 100);
  });
  it("a board smaller than the screen is centred", () => {
    const lim = limitsFor(B, VW, VH), v = clampView({ cx: 0, cy: 0, zoom: 1 }, B, VW, VH, lim);
    expect(v.zoom).toBeCloseTo(lim.minZoom);
    expect(v.cx).toBeCloseTo(B.x + B.w / 2);
  });
});
