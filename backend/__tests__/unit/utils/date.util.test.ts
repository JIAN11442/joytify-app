import {
  onYearFromNow,
  thirtyDaysFormNow,
  oneDayFromNow,
  oneHourFromNow,
  fifteenMinutesFromNow,
  tenMinutesFromNow,
  fiveMinutesFromNow,
  oneMinuteFromNow,
  thirtySecondsAgo,
  oneDay,
} from "../../../src/utils/date.util";

describe("Date Util", () => {
  // ==================== Arrange ====================
  // mock Date.now for predictable testing
  const mockDateNow = jest.spyOn(Date, "now");
  const fixedTime = 1704067200000; // 2024-01-01 00:00:00 UTC

  beforeEach(() => {
    // ==================== Arrange ====================
    // set fixed time for all tests
    mockDateNow.mockReturnValue(fixedTime);
  });

  afterAll(() => {
    // ==================== Arrange ====================
    // restore Date.now
    mockDateNow.mockRestore();
  });

  describe("Future date functions", () => {
    describe("onYearFromNow", () => {
      it("should return date one year from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = onYearFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 365 * 24 * 60 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-12-31T00:00:00.000Z")); // 365 days from 2024-01-01
      });
    });

    describe("thirtyDaysFormNow", () => {
      it("should return date thirty days from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = thirtyDaysFormNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 30 * 24 * 60 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-31T00:00:00.000Z"));
      });
    });

    describe("oneDayFromNow", () => {
      it("should return date one day from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = oneDayFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 24 * 60 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-02T00:00:00.000Z"));
      });
    });

    describe("oneHourFromNow", () => {
      it("should return date one hour from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = oneHourFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 60 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-01T01:00:00.000Z"));
      });
    });

    describe("fifteenMinutesFromNow", () => {
      it("should return date fifteen minutes from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = fifteenMinutesFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 15 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-01T00:15:00.000Z"));
      });
    });

    describe("tenMinutesFromNow", () => {
      it("should return date ten minutes from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = tenMinutesFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 10 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-01T00:10:00.000Z"));
      });
    });

    describe("fiveMinutesFromNow", () => {
      it("should return date five minutes from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = fiveMinutesFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 5 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-01T00:05:00.000Z"));
      });
    });

    describe("oneMinuteFromNow", () => {
      it("should return date one minute from now", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = oneMinuteFromNow();

        // ==================== Assert ====================
        const expectedTime = fixedTime + 1 * 60 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2024-01-01T00:01:00.000Z"));
      });
    });
  });

  describe("Past date functions", () => {
    describe("thirtySecondsAgo", () => {
      it("should return date thirty seconds ago", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = thirtySecondsAgo();

        // ==================== Assert ====================
        const expectedTime = fixedTime - 30 * 1000;
        expect(result.getTime()).toBe(expectedTime);
        expect(result).toEqual(new Date("2023-12-31T23:59:30.000Z"));
      });
    });
  });

  describe("Duration functions", () => {
    describe("oneDay", () => {
      it("should return milliseconds in one day", () => {
        // ==================== Arrange ====================
        // prepare test environment: Date.now is set to fixed time

        // ==================== Act ====================
        const result = oneDay();

        // ==================== Assert ====================
        const expectedMs = 24 * 60 * 60 * 1000;
        expect(result).toBe(expectedMs);
        expect(result).toBe(86400000); // 24 hours in milliseconds
      });
    });
  });

  describe("Consistency and relationships", () => {
    it("should maintain correct time intervals between different functions", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const year = onYearFromNow();
      const thirtyDays = thirtyDaysFormNow();
      const day = oneDayFromNow();
      const hour = oneHourFromNow();
      const fifteenMin = fifteenMinutesFromNow();
      const tenMin = tenMinutesFromNow();
      const fiveMin = fiveMinutesFromNow();
      const minute = oneMinuteFromNow();

      // ==================== Assert ====================
      // Verify chronological order
      expect(minute.getTime()).toBeLessThan(fiveMin.getTime());
      expect(fiveMin.getTime()).toBeLessThan(tenMin.getTime());
      expect(tenMin.getTime()).toBeLessThan(fifteenMin.getTime());
      expect(fifteenMin.getTime()).toBeLessThan(hour.getTime());
      expect(hour.getTime()).toBeLessThan(day.getTime());
      expect(day.getTime()).toBeLessThan(thirtyDays.getTime());
      expect(thirtyDays.getTime()).toBeLessThan(year.getTime());
    });

    it("should have correct time differences between functions", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const tenMin = tenMinutesFromNow();
      const fiveMin = fiveMinutesFromNow();

      // ==================== Assert ====================
      const difference = tenMin.getTime() - fiveMin.getTime();
      const expectedDifference = 5 * 60 * 1000; // 5 minutes in milliseconds
      expect(difference).toBe(expectedDifference);
    });

    it("should work correctly with past and future functions", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const future = oneMinuteFromNow();
      const past = thirtySecondsAgo();

      // ==================== Assert ====================
      expect(past.getTime()).toBeLessThan(fixedTime);
      expect(future.getTime()).toBeGreaterThan(fixedTime);

      const totalDifference = future.getTime() - past.getTime();
      const expectedDifference = (60 + 30) * 1000; // 1 minute 30 seconds
      expect(totalDifference).toBe(expectedDifference);
    });
  });

  describe("Edge cases and precision", () => {
    it("should handle millisecond precision correctly", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const preciseTime = 1704067200123; // with milliseconds
      mockDateNow.mockReturnValue(preciseTime);

      // ==================== Act ====================
      const result = oneMinuteFromNow();

      // ==================== Assert ====================
      const expectedTime = preciseTime + 60 * 1000;
      expect(result.getTime()).toBe(expectedTime);
      expect(result.getMilliseconds()).toBe(123); // Original milliseconds preserved
    });

    it("should work with different base timestamps", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const testTimestamps = [
        0, // Unix epoch
        946684800000, // 2000-01-01
        1577836800000, // 2020-01-01
        2147483647000, // Near max 32-bit timestamp
      ];

      // ==================== Act & Assert ====================
      testTimestamps.forEach((timestamp) => {
        mockDateNow.mockReturnValue(timestamp);

        const future = oneDayFromNow();
        const expected = new Date(timestamp + 24 * 60 * 60 * 1000);

        expect(future.getTime()).toBe(expected.getTime());
      });
    });

    it("should handle large time calculations correctly", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const year = onYearFromNow();

      // ==================== Assert ====================
      // Verify the calculation doesn't overflow or lose precision
      const expectedDaysInYear = 365;
      const actualDifference = year.getTime() - fixedTime;
      const actualDays = actualDifference / (24 * 60 * 60 * 1000);

      expect(actualDays).toBe(expectedDaysInYear);
    });
  });

  describe("Real-world usage scenarios", () => {
    it("should generate appropriate expiry times for JWT tokens", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const accessTokenExpiry = fifteenMinutesFromNow();
      const refreshTokenExpiry = thirtyDaysFormNow();

      // ==================== Assert ====================
      expect(accessTokenExpiry.getTime()).toBeGreaterThan(Date.now());
      expect(refreshTokenExpiry.getTime()).toBeGreaterThan(accessTokenExpiry.getTime());

      // Verify reasonable timeframes
      const accessDiff = accessTokenExpiry.getTime() - fixedTime;
      const refreshDiff = refreshTokenExpiry.getTime() - fixedTime;

      expect(accessDiff).toBe(15 * 60 * 1000); // 15 minutes
      expect(refreshDiff).toBe(30 * 24 * 60 * 60 * 1000); // 30 days
    });

    it("should generate appropriate times for session management", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const sessionExpiry = oneHourFromNow();
      const recentActivity = thirtySecondsAgo();

      // ==================== Assert ====================
      expect(recentActivity.getTime()).toBeLessThan(fixedTime);
      expect(sessionExpiry.getTime()).toBeGreaterThan(fixedTime);

      // Session should be active (recent activity within threshold)
      const activityAge = fixedTime - recentActivity.getTime();
      expect(activityAge).toBe(30 * 1000); // 30 seconds
    });

    it("should generate appropriate times for verification codes", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const verificationExpiry = tenMinutesFromNow();

      // ==================== Assert ====================
      const expiryDiff = verificationExpiry.getTime() - fixedTime;
      expect(expiryDiff).toBe(10 * 60 * 1000); // 10 minutes

      // Verify it's reasonable for email verification
      expect(expiryDiff).toBeGreaterThan(5 * 60 * 1000); // At least 5 minutes
      expect(expiryDiff).toBeLessThan(60 * 60 * 1000); // Less than 1 hour
    });
  });

  describe("Integration with oneDay utility", () => {
    it("should match oneDay() duration with oneDayFromNow() calculation", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const dayDuration = oneDay();
      const dayFromNow = oneDayFromNow();

      // ==================== Assert ====================
      const calculatedDuration = dayFromNow.getTime() - fixedTime;
      expect(calculatedDuration).toBe(dayDuration);
    });

    it("should be usable for date arithmetic", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const today = new Date(fixedTime);
      const tomorrow = new Date(fixedTime + oneDay());
      const dayFromNowResult = oneDayFromNow();

      // ==================== Assert ====================
      expect(tomorrow.getTime()).toBe(dayFromNowResult.getTime());
      expect(tomorrow.getDate()).toBe(today.getDate() + 1);
    });
  });

  describe("Date object properties", () => {
    it("should return proper Date objects with all date methods", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const result = oneDayFromNow();

      // ==================== Assert ====================
      expect(result).toBeInstanceOf(Date);
      expect(typeof result.getTime).toBe("function");
      expect(typeof result.toISOString).toBe("function");
      expect(typeof result.getFullYear).toBe("function");

      // Verify it's a valid date
      expect(result.toString()).not.toBe("Invalid Date");
      expect(result.getTime()).not.toBeNaN();
    });

    it("should generate dates that can be serialized and compared", () => {
      // ==================== Arrange ====================
      // prepare test environment: Date.now is set to fixed time
      const date1 = oneDayFromNow();
      const date2 = oneDayFromNow();

      // ==================== Assert ====================
      // Dates should be equal (same timestamp)
      expect(date1.getTime()).toBe(date2.getTime());
      expect(date1.toISOString()).toBe(date2.toISOString());

      // Should be serializable to JSON
      const serialized = JSON.stringify({ expiry: date1 });
      expect(serialized).toContain(date1.toISOString());
    });
  });
});
