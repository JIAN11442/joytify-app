import { parseToFloat } from "../../../src/utils/parse-float.util";

describe("Parse Float Util", () => {
  describe("parseToFloat", () => {
    describe("default precision (2 decimal places)", () => {
      it("should round to 2 decimal places by default", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 3.14159, expected: 3.14 },
          { input: 2.999, expected: 3 },
          { input: 1.005, expected: 1 }, // JavaScript toFixed rounds 1.005 to 1.00, not 1.01
          { input: 0.123456789, expected: 0.12 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, expected }) => {
          const result = parseToFloat(input);
          expect(result).toBe(expected);
        });
      });

      it("should handle whole numbers", () => {
        // ==================== Arrange ====================
        const wholeNumbers = [0, 1, 5, 10, 100, 1000];

        // ==================== Act & Assert ====================
        wholeNumbers.forEach(num => {
          const result = parseToFloat(num);
          expect(result).toBe(num);
          expect(Number.isInteger(result)).toBe(true);
        });
      });

      it("should handle negative numbers", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: -3.14159, expected: -3.14 },
          { input: -2.999, expected: -3 },
          { input: -0.123456789, expected: -0.12 },
          { input: -1, expected: -1 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, expected }) => {
          const result = parseToFloat(input);
          expect(result).toBe(expected);
        });
      });

      it("should handle very small numbers", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 0.001, expected: 0 },
          { input: 0.009, expected: 0.01 },
          { input: 0.0001, expected: 0 },
          { input: 0.00999, expected: 0.01 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, expected }) => {
          const result = parseToFloat(input);
          expect(result).toBe(expected);
        });
      });

      it("should handle very large numbers", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 999999.999, expected: 1000000 },
          { input: 123456.789, expected: 123456.79 },
          { input: 1000000.123456, expected: 1000000.12 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, expected }) => {
          const result = parseToFloat(input);
          expect(result).toBe(expected);
        });
      });
    });

    describe("custom precision", () => {
      it("should round to specified decimal places", () => {
        // ==================== Arrange ====================
        const number = 3.14159265359;

        const testCases = [
          { precision: 0, expected: 3 },
          { precision: 1, expected: 3.1 },
          { precision: 2, expected: 3.14 },
          { precision: 3, expected: 3.142 },
          { precision: 4, expected: 3.1416 },
          { precision: 5, expected: 3.14159 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ precision, expected }) => {
          const result = parseToFloat(number, precision);
          expect(result).toBe(expected);
        });
      });

      it("should handle zero precision", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 3.14159, expected: 3 },
          { input: 3.9, expected: 4 },
          { input: 3.5, expected: 4 }, // JavaScript rounds 3.5 to 4
          { input: 4.5, expected: 5 }, // JavaScript rounds 4.5 to 5 (not banker's rounding)
          { input: -3.7, expected: -4 },
          { input: 0.9, expected: 1 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, expected }) => {
          const result = parseToFloat(input, 0);
          expect(result).toBe(expected);
        });
      });

      it("should handle high precision values", () => {
        // ==================== Arrange ====================
        const number = 1.123456789012345;

        const testCases = [
          { precision: 8, expected: 1.12345679 },
          { precision: 10, expected: 1.1234567890 },
          { precision: 15, expected: 1.123456789012345 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ precision, expected }) => {
          const result = parseToFloat(number, precision);
          expect(result).toBe(expected);
        });
      });

      it("should handle edge case precisions", () => {
        // ==================== Arrange ====================
        const number = 123.456;

        // ==================== Act & Assert ====================
        // Very high precision should preserve the number
        const result20 = parseToFloat(number, 20);
        expect(result20).toBe(123.456);

        // Precision of 1
        const result1 = parseToFloat(number, 1);
        expect(result1).toBe(123.5);
      });
    });

    describe("edge cases and special values", () => {
      it("should handle zero", () => {
        // ==================== Arrange & Act ====================
        const result = parseToFloat(0);

        // ==================== Assert Process ====================
        expect(result).toBe(0);
        expect(Object.is(result, 0)).toBe(true); // Positive zero
      });

      it("should handle negative zero", () => {
        // ==================== Arrange & Act ====================
        const result = parseToFloat(-0);

        // ==================== Assert Process ====================
        expect(result).toBe(0);
        // Note: parseFloat may not preserve -0, this is expected behavior
      });

      it("should handle floating point precision issues", () => {
        // ==================== Arrange ====================
        const problematicNumbers = [
          { input: 0.1 + 0.2, precision: 2, expected: 0.3 },
          { input: 0.1 + 0.2, precision: 10, expected: 0.3 },
          { input: 1.0000000001, precision: 2, expected: 1 },
        ];

        // ==================== Act & Assert ====================
        problematicNumbers.forEach(({ input, precision, expected }) => {
          const result = parseToFloat(input, precision);
          expect(result).toBe(expected);
        });
      });

      it("should handle very small precision issues", () => {
        // ==================== Arrange ====================
        const epsilon = Number.EPSILON; // Smallest representable positive number

        // ==================== Act ====================
        const result = parseToFloat(epsilon, 2);

        // ==================== Assert Process ====================
        expect(result).toBe(0); // Should round to 0 with 2 decimal precision
      });
    });

    describe("rounding behavior", () => {
      it("should handle midpoint rounding correctly", () => {
        // ==================== Arrange ====================
        // Test cases for .5 rounding (banker's rounding)
        const testCases = [
          { input: 1.5, precision: 0, expected: 2 },
          { input: 2.5, precision: 0, expected: 3 }, // JavaScript rounds 2.5 to 3
          { input: 3.5, precision: 0, expected: 4 },
          { input: 4.5, precision: 0, expected: 5 }, // JavaScript rounds 4.5 to 5
          { input: -1.5, precision: 0, expected: -2 },
          { input: -2.5, precision: 0, expected: -3 }, // JavaScript rounds -2.5 to -3
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, precision, expected }) => {
          const result = parseToFloat(input, precision);
          expect(result).toBe(expected);
        });
      });

      it("should round up for values > .5", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 1.6, precision: 0, expected: 2 },
          { input: 2.9, precision: 0, expected: 3 },
          { input: 1.51, precision: 1, expected: 1.5 },
          { input: 1.56, precision: 1, expected: 1.6 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, precision, expected }) => {
          const result = parseToFloat(input, precision);
          expect(result).toBe(expected);
        });
      });

      it("should round down for values < .5", () => {
        // ==================== Arrange ====================
        const testCases = [
          { input: 1.4, precision: 0, expected: 1 },
          { input: 2.1, precision: 0, expected: 2 },
          { input: 1.44, precision: 1, expected: 1.4 },
          { input: 1.49, precision: 1, expected: 1.5 },
        ];

        // ==================== Act & Assert ====================
        testCases.forEach(({ input, precision, expected }) => {
          const result = parseToFloat(input, precision);
          expect(result).toBe(expected);
        });
      });
    });

    describe("type and return value verification", () => {
      it("should return a number type", () => {
        // ==================== Act ====================
        const result = parseToFloat(3.14159);

        // ==================== Assert Process ====================
        expect(typeof result).toBe("number");
        expect(result).not.toBeNaN();
        expect(Number.isFinite(result)).toBe(true);
      });

      it("should return exact same number when no rounding needed", () => {
        // ==================== Arrange ====================
        const exactNumbers = [
          1.0,
          2.5,
          3.14, // Already 2 decimal places
          0.1,
          -5.25,
        ];

        // ==================== Act & Assert ====================
        exactNumbers.forEach(num => {
          const result = parseToFloat(num);
          expect(result).toBe(num);
        });
      });

      it("should handle numbers that are already integers", () => {
        // ==================== Arrange ====================
        const integers = [1, 5, 10, 100, -5, 0];

        // ==================== Act & Assert ====================
        integers.forEach(int => {
          const result = parseToFloat(int);
          expect(result).toBe(int);
          expect(Number.isInteger(result)).toBe(true);
        });
      });
    });

    describe("real-world usage scenarios", () => {
      it("should handle currency calculations", () => {
        // ==================== Arrange ====================
        const price = 19.99;
        const tax = 0.08875; // 8.875% tax
        const total = price * (1 + tax);

        // ==================== Act ====================
        const roundedTotal = parseToFloat(total, 2);

        // ==================== Assert Process ====================
        expect(roundedTotal).toBe(21.76); // Properly rounded to 2 decimal places
        expect(typeof roundedTotal).toBe("number");
      });

      it("should handle percentage calculations", () => {
        // ==================== Arrange ====================
        const score = 87;
        const total = 120;
        const percentage = (score / total) * 100;

        // ==================== Act ====================
        const roundedPercentage = parseToFloat(percentage, 1);

        // ==================== Assert Process ====================
        expect(roundedPercentage).toBe(72.5);
      });

      it("should handle scientific calculations", () => {
        // ==================== Arrange ====================
        const measurements = [
          { value: Math.PI, precision: 4, expected: 3.1416 },
          { value: Math.E, precision: 3, expected: 2.718 },
          { value: Math.sqrt(2), precision: 5, expected: 1.41421 },
        ];

        // ==================== Act & Assert ====================
        measurements.forEach(({ value, precision, expected }) => {
          const result = parseToFloat(value, precision);
          expect(result).toBe(expected);
        });
      });

      it("should handle coordinate calculations", () => {
        // ==================== Arrange ====================
        const lat = 40.7127837;
        const lng = -74.0059413;

        // ==================== Act ====================
        const roundedLat = parseToFloat(lat, 4);
        const roundedLng = parseToFloat(lng, 4);

        // ==================== Assert Process ====================
        expect(roundedLat).toBe(40.7128);
        expect(roundedLng).toBe(-74.0059);
      });
    });

    describe("parameter validation behavior", () => {
      it("should use default precision when precision is undefined", () => {
        // ==================== Arrange ====================
        const number = 3.14159;

        // ==================== Act ====================
        const result1 = parseToFloat(number);
        const result2 = parseToFloat(number, undefined);

        // ==================== Assert Process ====================
        expect(result1).toBe(result2);
        expect(result1).toBe(3.14);
      });

      it("should handle null precision as undefined", () => {
        // ==================== Arrange ====================
        const number = 3.14159;

        // ==================== Act ====================
        const result = parseToFloat(number, null as any);

        // ==================== Assert Process ====================
        expect(result).toBe(3.14); // Should use default precision
      });
    });
  });
});