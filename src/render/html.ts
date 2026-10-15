// S3 (owner approved, 15 Oct): the one place where text becomes HTML. The game builds its screens as HTML strings;
// every piece of text that comes from data (board files: names, stories; player names) goes through `esc`, so text can
// never become markup or script, even when player names, custom boards or the Android app bring text from outside.
// The game's own markup (pictures, tags around text) is written in code and not escaped.

const MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Text → HTML that shows exactly that text (safe inside elements and inside quoted attributes). */
export const esc = (text: unknown): string => String(text ?? "").replace(/[&<>"']/g, (c) => MAP[c]);
