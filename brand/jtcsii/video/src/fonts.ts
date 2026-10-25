import { continueRender, delayRender, staticFile } from "remotion";

// The same font files the seal is set in, loaded locally so renders need no network.
const FONTS = [
  { family: "Montserrat", file: "montserrat600.ttf", weight: "600", style: "normal" },
  { family: "Montserrat", file: "montserrat700.ttf", weight: "700", style: "normal" },
  { family: "Cormorant Garamond", file: "cormorant-italic600.ttf", weight: "600", style: "italic" },
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map((f) =>
    new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format("truetype")`, { weight: f.weight, style: f.style })
      .load()
      .then((face) => document.fonts.add(face)),
  ),
).then(() => continueRender(handle));

export const montserrat = "Montserrat";
export const cormorant = "Cormorant Garamond";
