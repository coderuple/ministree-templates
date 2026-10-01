import { test } from "node:test";
import assert from "node:assert/strict";
import { embedFor, noiseInk, overlayProps } from "./media.ts";

test("every YouTube address shape gives the same muted loop", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?feature=share&v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=abc",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  ]) {
    const out = embedFor(url);
    assert.ok(out?.startsWith("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?"), url);
    assert.match(out!, /mute=1/);
    assert.match(out!, /playlist=dQw4w9WgXcQ/); // YouTube only loops a playlist
  }
});

test("Vimeo becomes its background player", () => {
  assert.equal(
    embedFor("https://vimeo.com/76979871"),
    "https://player.vimeo.com/video/76979871?background=1&autoplay=1&loop=1&muted=1&dnt=1",
  );
});

test("anything else embeds nothing", () => {
  assert.equal(embedFor(""), null);
  assert.equal(embedFor(undefined), null);
  assert.equal(embedFor("https://evil.example/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(embedFor("javascript:alert(1)"), null);
});

const base = { strength: "0.4", colour: "ground", customColour: "", fade: "edges", text: "auto", textColour: "" };

test("the overlay becomes clamped variables and a fade", () => {
  assert.deepEqual(overlayProps(base), { style: { "--scrim-a": "0.4" }, fade: undefined, ink: undefined });
  assert.equal(overlayProps({ ...base, strength: "7" }).style["--scrim-a"], "1");
  assert.equal(overlayProps({ ...base, colour: "black" }).style["--scrim"], "#000");
  assert.equal(overlayProps({ ...base, colour: "signal" }).style["--scrim"], "var(--flare)");
  assert.equal(overlayProps({ ...base, fade: "bottom" }).fade, "bottom");
});

test("a custom colour is only written when it is one", () => {
  const scrim = (c: string) => overlayProps({ ...base, colour: "custom", customColour: c }).style["--scrim"];
  assert.equal(scrim("#1a2b3c"), "#1a2b3c");
  assert.equal(scrim("rgb(10, 20, 30)"), "rgb(10, 20, 30)");
  assert.equal(scrim("red; background: url(x)"), undefined);
  assert.equal(scrim("rgb(300, 0, 0)"), undefined);
  assert.equal(scrim(""), undefined);
});

test("automatic type follows the overlay", () => {
  const ink = (colour: string, customColour = "") => overlayProps({ ...base, colour, customColour }).ink;
  assert.equal(ink("ground"), undefined); // the scene's own type, unchanged
  assert.equal(ink("black"), "light");
  assert.equal(ink("signal"), "signal");
  assert.equal(ink("custom", "#0b1f3a"), "light"); // navy
  assert.equal(ink("custom", "#f6e7c1"), "dark"); // sand
  assert.equal(ink("custom", "#fff"), "dark");
  assert.equal(ink("custom", "rgb(20, 20, 20)"), "light");
});

test("a chosen text colour wins over automatic", () => {
  assert.equal(overlayProps({ ...base, colour: "black", text: "dark" }).ink, "dark");
  assert.equal(overlayProps({ ...base, text: "light" }).ink, "light");
  const own = overlayProps({ ...base, colour: "black", text: "custom", textColour: "#e5c07b" });
  assert.equal(own.ink, "custom");
  assert.equal(own.style["--ink"], "#e5c07b");
  // not a colour → automatic stays in charge
  const bad = overlayProps({ ...base, colour: "black", text: "custom", textColour: "url(x)" });
  assert.equal(bad.ink, "light");
  assert.equal(bad.style["--ink"], undefined);
});

test("the drifting text takes its own colour, or the question's", () => {
  assert.equal(noiseInk("same", ""), undefined);
  assert.equal(noiseInk("signal", ""), "var(--flare-text)");
  assert.equal(noiseInk("accent", ""), "var(--gold-text)");
  assert.equal(noiseInk("custom", "#7fd1b9"), "#7fd1b9");
  assert.equal(noiseInk("custom", "nope"), undefined);
});
