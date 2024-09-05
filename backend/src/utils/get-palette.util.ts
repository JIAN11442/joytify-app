import Vibrant from "node-vibrant";

const getImgPaletee = async (imgUrl: string) => {
  try {
    const paletee = await Vibrant.from(imgUrl).getPalette();

    return paletee;
  } catch (error) {
    console.log(error);
  }
};

export default getImgPaletee;
