import mongoose from "mongoose";
import {
  deleteDocWhileFieldsArrayEmpty,
  bulkUpdateReferenceArrayFields,
  getPaginatedDocs,
  remapFields,
} from "../../../src/utils/mongoose.util";

// mock mongoose module to isolate tests from actual database operations
jest.mock("mongoose");

const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe("Mongoose Utils", () => {
  beforeEach(() => {
    // clear all mocks before each test to ensure clean state
    jest.clearAllMocks();
  });

  describe("deleteDocWhileFieldsArrayEmpty", () => {
    // mock Mongoose model with chainable methods for testing
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    } as any;

    // sample documents with empty array fields for testing
    const mockEmptyDocs = [
      { _id: "doc1", name: "Test 1", tags: [] },
      { _id: "doc2", name: "Test 2", categories: [] },
    ];

    it("should delete documents with empty array fields", async () => {
      // ==================== Arrange ====================
      mockModel.lean.mockResolvedValue(mockEmptyDocs);

      const params = {
        model: mockModel,
        filter: { status: "active" },
        arrayFields: ["tags", "categories"],
      } as any;

      // ==================== Act ====================
      await deleteDocWhileFieldsArrayEmpty(params);

      // ==================== Assert ====================
      // 1. verify find query was called with correct filter and array conditions
      expect(mockModel.find).toHaveBeenCalledWith({
        status: "active",
        $and: [{ tags: { $size: 0 } }, { categories: { $size: 0 } }],
      });
      // 2. verify lean() was called to get plain objects
      expect(mockModel.lean).toHaveBeenCalled();
      // 3. verify deleteMany was called with correct document IDs
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["doc1", "doc2"] },
      });
    });

    it("should handle no filter parameter", async () => {
      // ==================== Arrange ====================
      mockModel.lean.mockResolvedValue(mockEmptyDocs);

      const params = {
        model: mockModel,
        arrayFields: ["tags"],
      } as any;

      // ==================== Act ====================
      await deleteDocWhileFieldsArrayEmpty(params);

      // ==================== Assert ====================
      // verify query only includes array field conditions when no filter provided
      expect(mockModel.find).toHaveBeenCalledWith({
        $and: [{ tags: { $size: 0 } }],
      });
    });

    it("should not delete when no empty docs found", async () => {
      // ==================== Arrange ====================
      mockModel.lean.mockResolvedValue([]);

      const params = {
        model: mockModel,
        arrayFields: ["tags"],
      } as any;

      // ==================== Act ====================
      await deleteDocWhileFieldsArrayEmpty(params);

      // ==================== Assert ====================
      // verify deleteMany is not called when no documents have empty arrays
      expect(mockModel.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe("bulkUpdateReferenceArrayFields", () => {
    // mock source document with reference fields and schema information
    const mockSourceDoc = {
      _id: "source123",
      name: "Test Source",
      userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
      playlistIds: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
      ],
      toObject: jest.fn().mockReturnValue({
        _id: "source123",
        name: "Test Source",
        userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        playlistIds: [
          new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
          new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
        ],
      }),
      constructor: {
        modelName: "SourceModel",
        schema: {
          path: jest.fn().mockImplementation((field) => {
            // mock schema path to return reference information
            const refs = {
              userId: { options: { ref: "UserModel" } },
              playlistIds: { options: { ref: "PlaylistModel" } },
            };
            return refs[field as keyof typeof refs];
          }),
        },
      },
    } as any;

    // mock target model for bulk update operations
    const mockTargetModel = {
      modelName: "UserModel",
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
    } as any;

    it("should update target model with reference IDs", async () => {
      // ==================== Arrange ====================
      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockSourceDoc,
        referenceId,
        mockTargetModel,
        targetField,
        "$push"
      );

      // ==================== Assert ====================
      // verify updateMany was called with correct reference IDs and push operation
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $push: { sourceIds: referenceId } }
      );
    });

    it("should handle $pull operation", async () => {
      // ==================== Arrange ====================
      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockSourceDoc,
        referenceId,
        mockTargetModel,
        targetField,
        "$pull"
      );

      // ==================== Assert ====================
      // verify updateMany was called with pull operation to remove reference ID
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $pull: { sourceIds: referenceId } }
      );
    });

    it("should handle $addToSet operation", async () => {
      // ==================== Arrange ====================
      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockSourceDoc,
        referenceId,
        mockTargetModel,
        targetField,
        "$addToSet"
      );

      // ==================== Assert ====================
      // verify updateMany was called with addToSet operation to add unique reference ID
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $addToSet: { sourceIds: referenceId } }
      );
    });

    it("should handle specific relative fields", async () => {
      // ==================== Arrange ====================
      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;
      const relativeFields = ["userId"];

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockSourceDoc,
        referenceId,
        mockTargetModel,
        targetField,
        "$push",
        relativeFields
      );

      // ==================== Assert ====================
      // verify updateMany was called with only specified relative fields
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $push: { sourceIds: referenceId } }
      );
    });

    it("should handle no matching reference fields", async () => {
      // ==================== Arrange ====================
      // mock document with no reference fields matching target model
      const mockDocWithNoRefs = {
        _id: "source123",
        name: "Test Source",
        toObject: jest.fn().mockReturnValue({
          _id: "source123",
          name: "Test Source",
        }),
        constructor: {
          modelName: "SourceModel",
          schema: {
            path: jest.fn().mockReturnValue({ options: { ref: "OtherModel" } }),
          },
        },
      } as any;

      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockDocWithNoRefs,
        referenceId,
        mockTargetModel,
        targetField,
        "$push"
      );

      // ==================== Assert ====================
      // verify updateMany is not called when no reference fields match target model
      expect(mockTargetModel.updateMany).not.toHaveBeenCalled();
    });

    it("should handle non-ObjectId values in array", async () => {
      // ==================== Arrange ====================
      // mock document with mixed types in array (strings and ObjectIds)
      const mockDocWithMixedTypes = {
        _id: "source123",
        name: "Test Source",
        userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        playlistIds: [
          "string1",
          new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
          "string2",
        ],
        toObject: jest.fn().mockReturnValue({
          _id: "source123",
          name: "Test Source",
          userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
          playlistIds: [
            "string1",
            new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
            "string2",
          ],
        }),
        constructor: {
          modelName: "SourceModel",
          schema: {
            path: jest.fn().mockImplementation((field) => {
              const refs = {
                userId: { options: { ref: "UserModel" } },
                playlistIds: { options: { ref: "PlaylistModel" } },
              };
              return refs[field as keyof typeof refs];
            }),
          },
        },
      } as any;

      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockDocWithMixedTypes,
        referenceId,
        mockTargetModel,
        targetField,
        "$push"
      );

      // ==================== Assert ====================
      // verify only ObjectId values are included in the update operation
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $push: { sourceIds: referenceId } }
      );
    });

    it("should handle empty array values", async () => {
      // ==================== Arrange ====================
      // mock document with empty array field
      const mockDocWithEmptyArray = {
        _id: "source123",
        name: "Test Source",
        userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        playlistIds: [],
        toObject: jest.fn().mockReturnValue({
          _id: "source123",
          name: "Test Source",
          userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
          playlistIds: [],
        }),
        constructor: {
          modelName: "SourceModel",
          schema: {
            path: jest.fn().mockImplementation((field) => {
              const refs = {
                userId: { options: { ref: "UserModel" } },
                playlistIds: { options: { ref: "PlaylistModel" } },
              };
              return refs[field as keyof typeof refs];
            }),
          },
        },
      } as any;

      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act ====================
      await bulkUpdateReferenceArrayFields(
        mockDocWithEmptyArray,
        referenceId,
        mockTargetModel,
        targetField,
        "$push"
      );

      // ==================== Assert ====================
      // verify updateMany is called with non-empty ObjectId values
      expect(mockTargetModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([expect.any(mongoose.Types.ObjectId)]) } },
        { $push: { sourceIds: referenceId } }
      );
    });

    it("should handle errors and rethrow", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Database error");
      mockTargetModel.updateMany.mockRejectedValue(mockError);

      const referenceId = new mongoose.Types.ObjectId();
      const targetField = "sourceIds" as any;

      // ==================== Act & Assert ====================
      // verify errors are properly caught and rethrown
      await expect(
        bulkUpdateReferenceArrayFields(
          mockSourceDoc,
          referenceId,
          mockTargetModel,
          targetField,
          "$push"
        )
      ).rejects.toThrow("Database error");
    });
  });

  describe("getPaginatedDocs", () => {
    // mock Mongoose model with chainable query methods
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    } as any;

    it("should handle first page with initial limit", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 1,
      } as any;

      // ==================== Act ====================
      getPaginatedDocs(params);

      // ==================== Assert ====================
      // 1. verify find query was called with correct filter
      expect(mockModel.find).toHaveBeenCalledWith({ status: "active" });
      // 2. verify limit was set to initial value for first page
      expect(mockModel.limit).toHaveBeenCalledWith(10);
      // 3. verify default sort by createdAt was applied
      expect(mockModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("should handle subsequent pages with calculated limit", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 3,
      } as any;

      // ==================== Act ====================
      getPaginatedDocs(params);

      // ==================== Assert ====================
      // verify limit was calculated correctly: initial + (page-1) * load
      expect(mockModel.limit).toHaveBeenCalledWith(20); // 10 + (3-1) * 5
    });

    it("should use custom sort when provided", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 1,
        sort: { name: 1 },
      } as any;

      // ==================== Act ====================
      getPaginatedDocs(params);

      // ==================== Assert ====================
      // verify custom sort was applied instead of default sort
      expect(mockModel.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it("should not sort when sort is null", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 1,
        sort: null,
      } as any;

      // ==================== Act ====================
      const result = getPaginatedDocs(params);

      // ==================== Assert ====================
      // 1. verify query object is returned without modification
      expect(result).toBe(mockModel);
      // 2. verify sort was not called when sort is null
      expect(mockModel.sort).not.toHaveBeenCalled();
    });

    it("should not sort when sort is false", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 1,
        sort: false,
      } as any;

      // ==================== Act ====================
      const result = getPaginatedDocs(params);

      // ==================== Assert ====================
      // 1. verify query object is returned without modification
      expect(result).toBe(mockModel);
      // 2. verify sort was not called when sort is false
      expect(mockModel.sort).not.toHaveBeenCalled();
    });

    it("should use default sort when no sort provided", () => {
      // ==================== Arrange ====================
      const params = {
        model: mockModel,
        filter: { status: "active" },
        limit: { initial: 10, load: 5 },
        page: 1,
      } as any;

      // ==================== Act ====================
      getPaginatedDocs(params);

      // ==================== Assert ====================
      // verify default sort by createdAt descending was applied
      expect(mockModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe("remapFields", () => {
    it("should remap fields correctly", () => {
      // ==================== Arrange ====================
      const doc = {
        _id: "123",
        name: "Test",
        email: "test@example.com",
        createdAt: new Date(),
      };

      const fields = {
        _id: "id",
        name: "fullName",
        email: "userEmail",
      };

      // ==================== Act ====================
      const result = remapFields(doc, fields);

      // ==================== Assert ====================
      // verify fields were correctly remapped with new names
      expect(result).toEqual({
        id: "123",
        fullName: "Test",
        userEmail: "test@example.com",
        createdAt: doc.createdAt,
      });
    });

    it("should handle Mongoose document with toObject method", () => {
      // ==================== Arrange ====================
      const mockDoc = {
        _id: "123",
        name: "Test",
        toObject: jest.fn().mockReturnValue({
          _id: "123",
          name: "Test",
        }),
      };

      const fields = {
        _id: "id",
        name: "fullName",
      };

      // ==================== Act ====================
      const result = remapFields(mockDoc, fields);

      // ==================== Assert ====================
      // 1. verify toObject method was called to convert Mongoose document
      expect(mockDoc.toObject).toHaveBeenCalled();
      // 2. verify fields were correctly remapped
      expect(result).toEqual({
        id: "123",
        fullName: "Test",
      });
    });

    it("should return null for null/undefined doc", () => {
      // ==================== Arrange ====================
      const fields = { name: "fullName" };

      // ==================== Act & Assert ====================
      // verify null and undefined documents return null
      expect(remapFields(null as any, fields)).toBeNull();
      expect(remapFields(undefined as any, fields)).toBeNull();
    });

    it("should handle empty fields object", () => {
      // ==================== Arrange ====================
      const doc = {
        _id: "123",
        name: "Test",
      };

      const fields = {};

      // ==================== Act ====================
      const result = remapFields(doc, fields);

      // ==================== Assert ====================
      // verify document is returned unchanged when no field mappings provided
      expect(result).toEqual({
        _id: "123",
        name: "Test",
      });
    });

    it("should handle partial field mapping", () => {
      // ==================== Arrange ====================
      const doc = {
        _id: "123",
        name: "Test",
        email: "test@example.com",
        age: 25,
      };

      const fields = {
        name: "fullName",
        // email and age not mapped
      };

      // ==================== Act ====================
      const result = remapFields(doc, fields);

      // ==================== Assert ====================
      // verify only specified fields are remapped, others remain unchanged
      expect(result).toEqual({
        _id: "123",
        fullName: "Test",
        email: "test@example.com",
        age: 25,
      });
    });

    it("should handle fields with non-existent properties", () => {
      // ==================== Arrange ====================
      const doc = {
        _id: "123",
        name: "Test",
      };

      const fields = {
        name: "fullName",
        nonExistent: "mapped", // This field doesn't exist in doc
      };

      // ==================== Act ====================
      const result = remapFields(doc, fields);

      // ==================== Assert ====================
      // verify non-existent fields in mapping are ignored
      expect(result).toEqual({
        _id: "123",
        fullName: "Test",
      });
    });
  });
});
