import { Palette } from "node-vibrant/lib/color";
import usePalette from "../../../src/hooks/paletee.hook";
import getImgPaletee from "../../../src/utils/get-palette.util";

// Mock all external dependencies
jest.mock("../../../src/utils/get-palette.util");

// Mock type definitions
const mockGetImgPaletee = getImgPaletee as jest.MockedFunction<typeof getImgPaletee>;

describe("Palette Hook", () => {
  // Mock data constants
  const mockImageUrl = "https://example.com/image.jpg";

  // Create mock Swatch objects that only need hex property
  const createMockSwatch = (hex: string) => ({ hex }) as any;

  const mockVibrantPalette: Palette = {
    Vibrant: createMockSwatch("#FF5733"),
    DarkVibrant: createMockSwatch("#B71C1C"),
    LightVibrant: createMockSwatch("#FFCDD2"),
    Muted: createMockSwatch("#795548"),
    DarkMuted: createMockSwatch("#3E2723"),
    LightMuted: createMockSwatch("#D7CCC8"),
  };

  const expectedHexPalette = {
    vibrant: "#FF5733",
    darkVibrant: "#B71C1C",
    lightVibrant: "#FFCDD2",
    muted: "#795548",
    darkMuted: "#3E2723",
    lightMuted: "#D7CCC8",
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("usePalette", () => {
    it("should extract color palette successfully with all colors", async () => {
      // ==================== Arrange ====================
      mockGetImgPaletee.mockResolvedValue(mockVibrantPalette);

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called with correct parameters
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);
      expect(mockGetImgPaletee).toHaveBeenCalledTimes(1);

      // 2. verify correct result structure and values
      expect(result).toEqual(expectedHexPalette);
      expect(result.vibrant).toBe("#FF5733");
      expect(result.darkVibrant).toBe("#B71C1C");
      expect(result.lightVibrant).toBe("#FFCDD2");
      expect(result.muted).toBe("#795548");
      expect(result.darkMuted).toBe("#3E2723");
      expect(result.lightMuted).toBe("#D7CCC8");
    });

    it("should handle partial palette data with missing colors", async () => {
      // ==================== Arrange ====================
      const partialPalette: Palette = {
        Vibrant: createMockSwatch("#FF5733"),
        DarkVibrant: undefined,
        LightVibrant: createMockSwatch("#FFCDD2"),
        Muted: undefined,
        DarkMuted: createMockSwatch("#3E2723"),
        LightMuted: undefined,
      };

      const expectedPartialResult = {
        vibrant: "#FF5733",
        darkVibrant: undefined,
        lightVibrant: "#FFCDD2",
        muted: undefined,
        darkMuted: "#3E2723",
        lightMuted: undefined,
      };

      mockGetImgPaletee.mockResolvedValue(partialPalette);

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);

      // 2. verify partial result handling
      expect(result).toEqual(expectedPartialResult);
      expect(result.vibrant).toBe("#FF5733");
      expect(result.darkVibrant).toBeUndefined();
      expect(result.lightVibrant).toBe("#FFCDD2");
      expect(result.muted).toBeUndefined();
      expect(result.darkMuted).toBe("#3E2723");
      expect(result.lightMuted).toBeUndefined();
    });

    it("should handle null palette response", async () => {
      // ==================== Arrange ====================
      mockGetImgPaletee.mockResolvedValue(null);

      const expectedNullResult = {
        vibrant: undefined,
        darkVibrant: undefined,
        lightVibrant: undefined,
        muted: undefined,
        darkMuted: undefined,
        lightMuted: undefined,
      };

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);

      // 2. verify null handling
      expect(result).toEqual(expectedNullResult);
      Object.values(result).forEach((color) => {
        expect(color).toBeUndefined();
      });
    });

    it("should handle undefined palette response", async () => {
      // ==================== Arrange ====================
      mockGetImgPaletee.mockResolvedValue(undefined as any);

      const expectedUndefinedResult = {
        vibrant: undefined,
        darkVibrant: undefined,
        lightVibrant: undefined,
        muted: undefined,
        darkMuted: undefined,
        lightMuted: undefined,
      };

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);

      // 2. verify undefined handling
      expect(result).toEqual(expectedUndefinedResult);
    });

    it("should handle empty palette object", async () => {
      // ==================== Arrange ====================
      const emptyPalette = {};
      mockGetImgPaletee.mockResolvedValue(emptyPalette as any);

      const expectedEmptyResult = {
        vibrant: undefined,
        darkVibrant: undefined,
        lightVibrant: undefined,
        muted: undefined,
        darkMuted: undefined,
        lightMuted: undefined,
      };

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);

      // 2. verify empty object handling
      expect(result).toEqual(expectedEmptyResult);
    });

    it("should propagate getImgPaletee errors", async () => {
      // ==================== Arrange ====================
      const errorMessage = "Failed to process image";
      mockGetImgPaletee.mockRejectedValue(new Error(errorMessage));

      // ==================== Act & Assert ====================
      await expect(usePalette(mockImageUrl)).rejects.toThrow(errorMessage);

      // ==================== Assert Process ====================
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);
    });

    it("should handle different image URL formats", async () => {
      // ==================== Arrange ====================
      const testUrls = [
        "https://example.com/image.jpg",
        "http://example.com/image.png",
        "https://cdn.example.com/path/to/image.webp",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      ];

      mockGetImgPaletee.mockResolvedValue(mockVibrantPalette);

      // ==================== Act & Assert ====================
      for (const url of testUrls) {
        const result = await usePalette(url);

        // verify each URL is processed correctly
        expect(mockGetImgPaletee).toHaveBeenCalledWith(url);
        expect(result).toEqual(expectedHexPalette);
      }

      // ==================== Assert Process ====================
      expect(mockGetImgPaletee).toHaveBeenCalledTimes(testUrls.length);
    });

    it("should handle palette with color objects missing hex property", async () => {
      // ==================== Arrange ====================
      const paletteWithMissingHex = {
        Vibrant: { rgb: [255, 87, 51] }, // missing hex
        DarkVibrant: createMockSwatch("#B71C1C"),
        LightVibrant: {}, // empty object
        Muted: createMockSwatch("#795548"),
        DarkMuted: { population: 100 }, // different property
        LightMuted: createMockSwatch("#D7CCC8"),
      };

      const expectedMissingHexResult = {
        vibrant: undefined,
        darkVibrant: "#B71C1C",
        lightVibrant: undefined,
        muted: "#795548",
        darkMuted: undefined,
        lightMuted: "#D7CCC8",
      };

      mockGetImgPaletee.mockResolvedValue(paletteWithMissingHex as any);

      // ==================== Act ====================
      const result = await usePalette(mockImageUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called
      expect(mockGetImgPaletee).toHaveBeenCalledWith(mockImageUrl);

      // 2. verify handling of missing hex properties
      expect(result).toEqual(expectedMissingHexResult);
      expect(result.vibrant).toBeUndefined();
      expect(result.darkVibrant).toBe("#B71C1C");
      expect(result.lightVibrant).toBeUndefined();
      expect(result.muted).toBe("#795548");
      expect(result.darkMuted).toBeUndefined();
      expect(result.lightMuted).toBe("#D7CCC8");
    });

    it("should handle empty string URL", async () => {
      // ==================== Arrange ====================
      const emptyUrl = "";
      mockGetImgPaletee.mockResolvedValue(mockVibrantPalette);

      // ==================== Act ====================
      const result = await usePalette(emptyUrl);

      // ==================== Assert Process ====================
      // 1. verify getImgPaletee was called with empty string
      expect(mockGetImgPaletee).toHaveBeenCalledWith(emptyUrl);

      // 2. verify result is still processed correctly
      expect(result).toEqual(expectedHexPalette);
    });
  });
});
