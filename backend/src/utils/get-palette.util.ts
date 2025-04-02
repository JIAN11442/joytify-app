import sharp from "sharp";
import Vibrant from "node-vibrant";

// Process image to extract color palette
const getImgPalette = async (imgUrl: string) => {
  try {
    let buffer: Buffer;

    // fetch the image data
    const response = await fetch(imgUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // fetch the image data as an ArrayBuffer to correctly handle binary data
    const arrayBuffer = await response.arrayBuffer();
    const tempBuffer = Buffer.from(arrayBuffer);

    // use sharp to get image metadata
    const metadata = await sharp(tempBuffer).metadata();

    // convert to PNG if necessary
    if (metadata.format !== "png") {
      buffer = await sharp(tempBuffer).png().toBuffer();
    } else {
      buffer = tempBuffer;
    }

    // ensure buffer is not empty
    if (!buffer || buffer.length === 0) {
      throw new Error("Failed to process image buffer");
    }

    // extract color palette
    const palette = await Vibrant.from(buffer).getPalette();
    return palette;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
};

export default getImgPalette;
