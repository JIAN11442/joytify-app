export type HexColor = `#${string}` & { length: 7 | 4 };

export type HexPaletee = {
  vibrant: HexColor;
  darkVibrant: HexColor;
  lightVibrant: HexColor;
  muted: HexColor;
  darkMuted: HexColor;
  lightMuted: HexColor;
};
