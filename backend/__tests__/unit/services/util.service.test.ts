import { collectDocumentAttributes } from "../../../src/services/util.service";

// Mock mongoose Model
const createMockModel = () => {
  const mockModel = {
    find: jest.fn(),
  };
  return mockModel;
};

describe("Util Service", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests
  let mockModel: any;

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
    // create fresh mock model
    mockModel = createMockModel();
  });

  describe("collectDocumentAttributes", () => {
    it("should collect unique values from single fields", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with single field values
      const mockDocuments = [
        { _id: "doc1", name: "John", age: 25, city: "New York" },
        { _id: "doc2", name: "Jane", age: 30, city: "Los Angeles" },
        { _id: "doc3", name: "Bob", age: 25, city: "New York" },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["name", "age", "city"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify unique values are collected correctly
      expect(result).toEqual({
        name: ["John", "Jane", "Bob"],
        age: [25, 30],
        city: ["New York", "Los Angeles"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should collect unique values from array fields", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with array field values
      const mockDocuments = [
        { _id: "doc1", tags: ["rock", "pop"], genres: ["alternative"] },
        { _id: "doc2", tags: ["jazz", "pop"], genres: ["classical", "jazz"] },
        { _id: "doc3", tags: ["rock", "metal"], genres: ["rock"] },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["tags", "genres"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify unique values from arrays are collected correctly
      expect(result).toEqual({
        tags: ["rock", "pop", "jazz", "metal"],
        genres: ["alternative", "classical", "jazz", "rock"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle mixed single and array fields", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with mixed field types
      const mockDocuments = [
        { _id: "doc1", name: "Song1", tags: ["rock", "pop"], artist: "Artist1" },
        { _id: "doc2", name: "Song2", tags: ["jazz"], artist: "Artist2" },
        { _id: "doc3", name: "Song1", tags: ["rock", "metal"], artist: "Artist1" },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["name", "tags", "artist"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify mixed field types are handled correctly
      expect(result).toEqual({
        name: ["Song1", "Song2"],
        tags: ["rock", "pop", "jazz", "metal"],
        artist: ["Artist1", "Artist2"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle empty documents array", async () => {
      // ==================== Arrange ====================
      // prepare empty documents array
      const mockDocuments: any[] = [];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2"],
        fields: ["name", "age"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify empty arrays are returned for each field
      expect(result).toEqual({
        name: [],
        age: [],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle documents with missing fields", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with missing fields
      const mockDocuments = [
        { _id: "doc1", name: "John", age: 25 },
        { _id: "doc2", name: "Jane" }, // missing age
        { _id: "doc3", age: 30 }, // missing name
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["name", "age", "city"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify missing fields are handled correctly
      expect(result).toEqual({
        name: ["John", "Jane"],
        age: [25, 30],
        city: [],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle documents with null and undefined values", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with null and undefined values
      const mockDocuments = [
        { _id: "doc1", name: "John", age: null, city: undefined },
        { _id: "doc2", name: null, age: 30, city: "New York" },
        { _id: "doc3", name: "Bob", age: 25, city: null },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["name", "age", "city"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify null and undefined values are filtered out
      expect(result).toEqual({
        name: ["John", "Bob"],
        age: [30, 25],
        city: ["New York"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle empty array values", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with empty arrays
      const mockDocuments = [
        { _id: "doc1", tags: ["rock", "pop"], genres: [] },
        { _id: "doc2", tags: [], genres: ["jazz"] },
        { _id: "doc3", tags: ["rock"], genres: [] },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["tags", "genres"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify empty arrays are handled correctly
      expect(result).toEqual({
        tags: ["rock", "pop"],
        genres: ["jazz"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle duplicate values in arrays", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with duplicate values in arrays
      const mockDocuments = [
        { _id: "doc1", tags: ["rock", "pop", "rock"], genres: ["jazz", "jazz"] },
        { _id: "doc2", tags: ["pop", "jazz", "pop"], genres: ["rock", "jazz"] },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2"],
        fields: ["tags", "genres"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify duplicate values are removed
      expect(result).toEqual({
        tags: ["rock", "pop", "jazz"],
        genres: ["jazz", "rock"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle empty ids array", async () => {
      // ==================== Arrange ====================
      // prepare mock for empty ids array
      const mockDocuments: any[] = [];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: [],
        fields: ["name", "age"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify empty arrays are returned for each field
      expect(result).toEqual({
        name: [],
        age: [],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: [] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle empty fields array", async () => {
      // ==================== Arrange ====================
      // prepare mock documents
      const mockDocuments = [
        { _id: "doc1", name: "John", age: 25 },
        { _id: "doc2", name: "Jane", age: 30 },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2"],
        fields: [],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify empty object is returned
      expect(result).toEqual({});
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle complex nested object values", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with complex nested objects
      const mockDocuments = [
        { _id: "doc1", metadata: { genre: "rock", year: 2020 } },
        { _id: "doc2", metadata: { genre: "pop", year: 2021 } },
        { _id: "doc3", metadata: { genre: "rock", year: 2022 } },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2", "doc3"],
        fields: ["metadata"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify complex objects are handled correctly
      expect(result).toEqual({
        metadata: [
          { genre: "rock", year: 2020 },
          { genre: "pop", year: 2021 },
          { genre: "rock", year: 2022 },
        ],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2", "doc3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle database errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare database error
      const dbError = new Error("Database connection failed");
      const mockQuery = {
        lean: jest.fn().mockRejectedValue(dbError),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2"],
        fields: ["name", "age"],
      };

      // ==================== Act & Assert ====================
      // verify database errors are properly propagated
      await expect(collectDocumentAttributes(params)).rejects.toThrow("Database connection failed");
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2"] } });
    });

    it("should handle invalid ObjectId values", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with invalid ObjectId
      const mockDocuments = [
        { _id: "invalid-id", name: "John" },
        { _id: "doc2", name: "Jane" },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["invalid-id", "doc2"],
        fields: ["name"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify invalid ObjectId is handled correctly
      expect(result).toEqual({
        name: ["John", "Jane"],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["invalid-id", "doc2"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should handle very large arrays efficiently", async () => {
      // ==================== Arrange ====================
      // prepare mock documents with large arrays
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item${i}`);
      const mockDocuments = [
        { _id: "doc1", tags: largeArray },
        { _id: "doc2", tags: [...largeArray, "unique1"] },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["doc1", "doc2"],
        fields: ["tags"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify large arrays are processed correctly
      expect(result.tags).toHaveLength(1001); // 1000 from largeArray + 1 unique
      expect(result.tags).toContain("item0");
      expect(result.tags).toContain("item999");
      expect(result.tags).toContain("unique1");
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["doc1", "doc2"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });
  });

  describe("Integration scenarios", () => {
    it("should verify function is properly exported and callable", async () => {
      // ==================== Act & Assert ====================
      // verify function is properly exported and can be called
      expect(typeof collectDocumentAttributes).toBe("function");
      expect(collectDocumentAttributes).toHaveLength(1);
    });

    it("should demonstrate complete workflow with real-world data", async () => {
      // ==================== Arrange ====================
      // prepare realistic mock data for music application
      const mockDocuments = [
        {
          _id: "song1",
          title: "Rock Song",
          artist: "Rock Band",
          genres: ["rock", "hard rock"],
          tags: ["guitar", "drums", "vocals"],
          year: 2020,
        },
        {
          _id: "song2",
          title: "Pop Song",
          artist: "Pop Artist",
          genres: ["pop", "dance"],
          tags: ["synth", "vocals"],
          year: 2021,
        },
        {
          _id: "song3",
          title: "Jazz Song",
          artist: "Jazz Band",
          genres: ["jazz", "smooth jazz"],
          tags: ["saxophone", "piano", "vocals"],
          year: 2020,
        },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockDocuments),
      };
      mockModel.find.mockReturnValue(mockQuery);

      const params = {
        model: mockModel,
        ids: ["song1", "song2", "song3"],
        fields: ["title", "artist", "genres", "tags", "year"],
      };

      // ==================== Act ====================
      // execute collectDocumentAttributes
      const result = await collectDocumentAttributes(params);

      // ==================== Assert ====================
      // verify realistic data is processed correctly
      expect(result).toEqual({
        title: ["Rock Song", "Pop Song", "Jazz Song"],
        artist: ["Rock Band", "Pop Artist", "Jazz Band"],
        genres: ["rock", "hard rock", "pop", "dance", "jazz", "smooth jazz"],
        tags: ["guitar", "drums", "vocals", "synth", "saxophone", "piano"],
        year: [2020, 2021],
      });
      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ["song1", "song2", "song3"] } });
      expect(mockQuery.lean).toHaveBeenCalled();
    });
  });
});
