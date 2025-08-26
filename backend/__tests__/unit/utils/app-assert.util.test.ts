import assert from "node:assert";
import appAssert from "../../../src/utils/app-assert.util";

describe("App Assert Util", () => {
  describe("truthy conditions", () => {
    it("should not throw when condition is truthy", () => {
      // ==================== Arrange ====================
      // prepare various truthy values for testing, including different types of truthy values
      const truthyValues = [
        true,
        1,
        -1,
        "hello",
        "0",
        "false",
        [],
        {},
        Infinity,
        -Infinity,
        Symbol("test"),
        new Date(),
        /regex/,
      ];

      // ==================== Act & Assert ====================
      // execute appAssert for each truthy value, verify no exception is thrown
      truthyValues.forEach((value) => {
        expect(() => appAssert(value, 400, "Should not throw")).not.toThrow();
      });
    });

    it("should handle complex truthy expressions", () => {
      // ==================== Arrange ====================
      // prepare complex logical expressions as test conditions

      // ==================== Act & Assert ====================
      // test mathematical operations, string operations, array operations and other complex expressions
      expect(() => appAssert(5 > 3, 400, "Math should work")).not.toThrow();
      expect(() => appAssert("hello".length > 0, 400, "String length")).not.toThrow();
      expect(() => appAssert([1, 2, 3].includes(2), 400, "Array includes")).not.toThrow();
    });
  });

  describe("falsy conditions", () => {
    it("should throw AssertionError when condition is falsy", () => {
      // ==================== Arrange ====================
      // prepare various falsy values for testing, including different types of falsy values
      const falsyValues = [false, 0, -0, "", null, undefined, NaN];

      // ==================== Act & Assert ====================
      // execute appAssert for each falsy value, verify AssertionError is thrown
      falsyValues.forEach((value) => {
        expect(() => appAssert(value, 400, "Should throw")).toThrow(assert.AssertionError);
      });
    });

    it("should include AppError in assertion message", () => {
      // ==================== Arrange ====================
      // prepare test parameters: falsy condition, HTTP status code, error message

      // ==================== Act ====================
      // execute appAssert call that will throw an exception
      try {
        appAssert(false, 404, "Resource not found");
        fail("Expected AssertionError to be thrown");
      } catch (error) {
        // ==================== Assert ====================
        // verify the thrown error is an AssertionError
        expect(error).toBeInstanceOf(assert.AssertionError);
        // verify the error message contains "Error:" prefix
        expect((error as Error).message).toContain("Error:");
        // verify the error message contains custom error description
        expect((error as Error).message).toContain("Resource not found");
      }
    });

    it("should handle all AppError parameters", () => {
      // ==================== Arrange ====================
      // prepare test cases with different parameter combinations, including optional parameters
      const testCases = [
        [404, "Not found"],
        [400, "Bad request", "INVALID_INPUT"],
        [500, "Server error", "DB_ERROR", "firebase-123"],
        [500, "Cleanup error", "CLEANUP_FAILED", "firebase-123", ["s3-url1", "s3-url2"]],
      ];

      // ==================== Act & Assert ====================
      // execute appAssert for each test case, verify AssertionError is thrown
      testCases.forEach((params) => {
        expect(() => {
          appAssert(false, ...(params as [number, string, ...any[]]));
        }).toThrow(assert.AssertionError);
      });
    });
  });

  describe("real-world scenarios", () => {
    it("should validate user authentication", () => {
      // ==================== Arrange ====================
      // prepare user object and null value for authentication validation testing
      const user = { id: 1, email: "user@test.com" };

      // ==================== Act & Assert ====================
      // test that valid user object doesn't throw exception
      expect(() => appAssert(user, 401, "Unauthorized")).not.toThrow();
      // test that null user throws AssertionError
      expect(() => appAssert(null, 401, "Unauthorized")).toThrow(assert.AssertionError);
    });

    it("should validate permissions", () => {
      // ==================== Arrange ====================
      // prepare permission validation test conditions

      // ==================== Act & Assert ====================
      // test that having permission doesn't throw exception
      expect(() => appAssert(true, 403, "Forbidden")).not.toThrow();
      // test that lacking permission throws AssertionError
      expect(() => appAssert(false, 403, "Forbidden")).toThrow(assert.AssertionError);
    });

    it("should validate array operations", () => {
      // ==================== Arrange ====================
      // prepare non-empty array and empty array for array operation validation
      const items = [1, 2, 3];

      // ==================== Act & Assert ====================
      // test that non-empty array doesn't throw exception
      expect(() => appAssert(items.length > 0, 404, "No items")).not.toThrow();
      // test that empty array throws AssertionError
      expect(() => appAssert([].length > 0, 404, "No items")).toThrow(assert.AssertionError);
    });
  });

  describe("edge cases", () => {
    it("should handle complex nested conditions", () => {
      // ==================== Arrange ====================
      // prepare object with nested properties for testing optional chaining operations
      const obj = { user: { profile: { active: true } } };

      // ==================== Act & Assert ====================
      // test that optional chaining access to valid property doesn't throw exception
      expect(() => appAssert(obj?.user?.profile?.active, 400, "Inactive")).not.toThrow();
      // test that optional chaining comparison to false throws AssertionError
      expect(() => appAssert(obj?.user?.profile?.active === false, 400, "Check")).toThrow();
    });

    it("should handle type coercion correctly", () => {
      // ==================== Arrange ====================
      // prepare different types of values for testing type conversion behavior

      // ==================== Act & Assert ====================
      // test that string "0" is truthy, doesn't throw exception
      expect(() => appAssert("0", 400, "String zero")).not.toThrow(); // truthy
      // test that number 0 is falsy, throws AssertionError
      expect(() => appAssert(0, 400, "Number zero")).toThrow(); // falsy
      // test that string "false" is truthy, doesn't throw exception
      expect(() => appAssert("false", 400, "String false")).not.toThrow(); // truthy
      // test that boolean false is falsy, throws AssertionError
      expect(() => appAssert(false, 400, "Boolean false")).toThrow(); // falsy
    });

    it("should maintain TypeScript assertion behavior", () => {
      // ==================== Arrange ====================
      // prepare nullable string variable for testing TypeScript type narrowing
      let value: string | null = "test";

      // ==================== Act ====================
      // execute appAssert for type narrowing
      appAssert(value, 400, "Value required");

      // ==================== Assert ====================
      // verify TypeScript knows value is no longer null, can safely access properties
      expect(value.length).toBe(4);
      expect(typeof value).toBe("string");
    });
  });

  describe("Node.js assert integration", () => {
    it("should throw proper AssertionError", () => {
      // ==================== Arrange ====================
      // prepare test parameters

      // ==================== Act ====================
      // execute appAssert call that will throw an exception
      try {
        appAssert(false, 400, "Test error");
        fail("Should have thrown");
      } catch (error) {
        // ==================== Assert ====================
        // verify the thrown error is a proper AssertionError instance
        expect(error).toBeInstanceOf(assert.AssertionError);
        // verify the error name is "AssertionError"
        expect((error as assert.AssertionError).name).toBe("AssertionError");
        // verify the error code is "ERR_ASSERTION"
        expect((error as assert.AssertionError).code).toBe("ERR_ASSERTION");
      }
    });
  });
});
