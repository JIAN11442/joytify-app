import { HexPaletee } from "../constants/paletee.constant";
import getImgPaletee from "../utils/get-palette.util";

const usePalette = async (imgSrc: string): Promise<HexPaletee> => {
  const paletee = await getImgPaletee(imgSrc);

  const generatePaletee = {
    vibrant: paletee?.Vibrant?.hex,
    darkVibrant: paletee?.DarkVibrant?.hex,
    lightVibrant: paletee?.LightVibrant?.hex,
    muted: paletee?.Muted?.hex,
    darkMuted: paletee?.DarkMuted?.hex,
    lightMuted: paletee?.LightMuted?.hex,
  } as HexPaletee;

  return generatePaletee;
};

export default usePalette;
