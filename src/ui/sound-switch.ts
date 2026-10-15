// The sound switches (U7): a speaker for sound effects (with vibration) and a note for music. Shown as small toggle
// buttons on the start screen, and behind one speaker button beside the die in the game.
import { sound } from "./sound";

const SPEAKER = `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="wave" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`;
const NOTE = `<path d="M9 17.5V6.5l10-2v11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="7" cy="17.5" r="2.4" fill="currentColor"/><circle cx="17" cy="15.5" r="2.4" fill="currentColor"/>`;
const SLASH = `<path class="slash" d="M4 4l16 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;

/** The picture of a switch: on, or crossed out. */
export const switchIcon = (which: "fx" | "music", on: boolean): string =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${which === "fx" ? SPEAKER : NOTE}${on ? "" : SLASH}</svg>`;

export const switchLabel = (which: "fx" | "music", on: boolean): string =>
  `${which === "fx" ? "Sound effects" : "Music"}: ${on ? "on" : "off"}. Tap to switch ${on ? "off" : "on"}`;

/** Two toggle buttons (start screen). */
export function switchButtons(): string {
  return (["fx", "music"] as const).map((k) => `<button class="snd" data-snd="${k}" aria-pressed="${sound.settings[k]}" aria-label="${switchLabel(k, sound.settings[k])}">${switchIcon(k, sound.settings[k])}</button>`).join("");
}

/** Makes the toggle buttons inside `root` work. */
export function wireSwitches(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>("[data-snd]").forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.snd as "fx" | "music", on = !sound.settings[k];
      sound.set(k, on);
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", switchLabel(k, on));
      b.innerHTML = switchIcon(k, on);
    };
  });
}
