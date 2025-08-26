import mongoose from "mongoose";
import LabelModel from "../../../src/models/label.model";
import {
  getLabelId,
  getLabels,
  getLabelById,
  getRecommendedLabels,
  createLabel,
  removeLabel,
} from "../../../src/services/label.service";
import { LabelOptions } from "@joytify/shared-types/constants";

// Mock all external dependencies
jest.mock("../../../src/models/label.model");

// Mock type definitions
const mockLabelModel = LabelModel as jest.Mocked<typeof LabelModel>;

describe("Label Service", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
  });

  describe("getLabelId", () => {
    it("should return existing label ID when label exists", async () => {
      // ==================== Arrange ====================
      // prepare mock data for existing label
      const mockLabel = {
        _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
        label: "Rock",
        type: LabelOptions.GENRE,
        default: true,
      };

      mockLabelModel.findOne.mockResolvedValue(mockLabel);

      const params = {
        label: "Rock",
        type: LabelOptions.GENRE,
        default: true,
        createIfAbsent: false,
      };

      // ==================== Act ====================
      // execute getLabelId with existing label
      const result = await getLabelId(params);

      // ==================== Assert ====================
      // verify correct label ID is returned
      expect(result).toEqual({ id: mockLabel._id });
      expect(mockLabelModel.findOne).toHaveBeenCalledWith({
        type: LabelOptions.GENRE,
        label: "Rock",
        default: true,
      });
    });

    it("should create new label when label doesn't exist and createIfAbsent is true", async () => {
      // ==================== Arrange ====================
      // prepare mock data for new label creation
      const mockNewLabel = {
        _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12346"),
        label: "Jazz",
        type: LabelOptions.GENRE,
        default: false,
      };

      mockLabelModel.findOne.mockResolvedValue(null);
      mockLabelModel.create.mockResolvedValue(mockNewLabel as any);

      const params = {
        label: "Jazz",
        type: LabelOptions.GENRE,
        default: false,
        createIfAbsent: true,
      };

      // ==================== Act ====================
      // execute getLabelId with createIfAbsent option
      const result = await getLabelId(params);

      // ==================== Assert ====================
      // verify new label is created and ID is returned
      expect(result).toEqual({ id: mockNewLabel._id });
      expect(mockLabelModel.create).toHaveBeenCalledWith({
        type: LabelOptions.GENRE,
        label: "Jazz",
        default: false,
      });
    });

    it("should throw error when label doesn't exist and createIfAbsent is false", async () => {
      // ==================== Arrange ====================
      // prepare mock for non-existent label
      mockLabelModel.findOne.mockResolvedValue(null);

      const params = {
        label: "NonExistent",
        type: LabelOptions.GENRE,
        default: true,
        createIfAbsent: false,
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when label not found
      await expect(getLabelId(params)).rejects.toThrow("Label is not found");
    });

    it("should throw error when label creation fails", async () => {
      // ==================== Arrange ====================
      // prepare mock for failed label creation
      mockLabelModel.findOne.mockResolvedValue(null);
      mockLabelModel.create.mockResolvedValue(null as any);

      const params = {
        label: "FailedLabel",
        type: LabelOptions.GENRE,
        default: false,
        createIfAbsent: true,
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when label creation fails
      await expect(getLabelId(params)).rejects.toThrow("Failed to create label");
    });
  });

  describe("getLabels", () => {
    it("should return grouped labels with default and created labels", async () => {
      // ==================== Arrange ====================
      // prepare mock aggregation results
      const mockAggregationResult = [
        {
          default: {
            GENRE: [
              { id: "genre1", label: "Rock", index: 1 },
              { id: "genre2", label: "Pop", index: 2 },
            ],
            TAG: [{ id: "tag1", label: "Popular", index: 1 }],
          },
          created: {
            GENRE: [{ id: "genre3", label: "Jazz", index: 3 }],
          },
        },
      ];

      mockLabelModel.aggregate.mockResolvedValue(mockAggregationResult);

      const params = {
        userId: "6507f1a456789abcdef12345",
        types: [LabelOptions.GENRE, LabelOptions.TAG],
        sortBySequence: true,
      };

      // ==================== Act ====================
      // execute getLabels with grouping parameters
      const result = await getLabels(params);

      // ==================== Assert ====================
      // verify correct grouped labels are returned
      expect(result).toEqual({ labels: mockAggregationResult[0] });
      expect(mockLabelModel.aggregate).toHaveBeenCalledWith([
        {
          $facet: {
            default: expect.arrayContaining([
              {
                $match: {
                  default: true,
                  type: { $in: [LabelOptions.GENRE, LabelOptions.TAG] },
                },
              },
            ]),
            created: expect.arrayContaining([
              {
                $match: {
                  default: false,
                  type: { $in: [LabelOptions.GENRE, LabelOptions.TAG] },
                  users: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
                },
              },
            ]),
          },
        },
        expect.any(Object),
      ]);
    });

    it("should handle empty aggregation results", async () => {
      // ==================== Arrange ====================
      // prepare empty aggregation results
      mockLabelModel.aggregate.mockResolvedValue([]);

      const params = {
        userId: "6507f1a456789abcdef12345",
      };

      // ==================== Act ====================
      // execute getLabels with empty results
      const result = await getLabels(params);

      // ==================== Assert ====================
      // verify empty result is handled correctly
      expect(result).toEqual({ labels: {} });
    });

    it("should handle labels without type filtering", async () => {
      // ==================== Arrange ====================
      // prepare mock aggregation results without type filtering
      const mockAggregationResult = [
        {
          default: { GENRE: [{ id: "genre1", label: "Rock", index: 1 }] },
          created: null,
        },
      ];

      mockLabelModel.aggregate.mockResolvedValue(mockAggregationResult);

      const params = {
        userId: "6507f1a456789abcdef12345",
        sortBySequence: false,
      };

      // ==================== Act ====================
      // execute getLabels without type filtering
      const result = await getLabels(params);

      // ==================== Assert ====================
      // verify aggregation is called without type filtering
      expect(result).toEqual({ labels: mockAggregationResult[0] });
      expect(mockLabelModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            $facet: {
              default: expect.arrayContaining([
                {
                  $match: {
                    default: true,
                  },
                },
              ]),
              created: expect.arrayContaining([
                {
                  $match: {
                    default: false,
                    users: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
                  },
                },
              ]),
            },
          },
        ])
      );
    });
  });

  describe("getLabelById", () => {
    it("should return label with populated details", async () => {
      // ==================== Arrange ====================
      // prepare mock label with populated details
      const mockLabel = {
        _id: "6507f1a456789abcdef12345",
        label: "Rock",
        type: LabelOptions.GENRE,
        songs: [
          {
            _id: "song1",
            title: "Rock Song",
            lyricists: "Artist 1",
            composers: "Composer 1",
            languages: "English",
          },
        ],
      };

      // mock the mongoose query chain
      const mockQueryChain = {
        populateNestedSongDetails: jest.fn().mockReturnThis(),
        refactorSongFields: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLabel),
      };

      mockLabelModel.findById.mockReturnValue(mockQueryChain);

      const labelId = "6507f1a456789abcdef12345";

      // ==================== Act ====================
      // execute getLabelById
      const result = await getLabelById(labelId);

      // ==================== Assert ====================
      // verify correct label is returned with populated details
      expect(result).toEqual({ label: mockLabel });
      expect(mockLabelModel.findById).toHaveBeenCalledWith(labelId);
      expect(mockQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockQueryChain.lean).toHaveBeenCalled();
    });
  });

  describe("getRecommendedLabels", () => {
    it("should return recommended labels of same type", async () => {
      // ==================== Arrange ====================
      // prepare mock label and recommended labels
      const mockLabel = {
        _id: "6507f1a456789abcdef12345",
        label: "Rock",
        type: LabelOptions.GENRE,
      };

      const mockRecommendedLabels = [
        {
          _id: "6507f1a456789abcdef12346",
          label: "Pop",
          type: LabelOptions.GENRE,
          songs: [],
        },
        {
          _id: "6507f1a456789abcdef12347",
          label: "Jazz",
          type: LabelOptions.GENRE,
          songs: [],
        },
      ];

      // mock the mongoose query chain
      const mockQueryChain = {
        limit: jest.fn().mockReturnThis(),
        populateNestedSongDetails: jest.fn().mockReturnThis(),
        refactorSongFields: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRecommendedLabels),
      };

      mockLabelModel.findById.mockResolvedValue(mockLabel);
      mockLabelModel.find.mockReturnValue(mockQueryChain);

      const labelId = "6507f1a456789abcdef12345";

      // ==================== Act ====================
      // execute getRecommendedLabels
      const result = await getRecommendedLabels(labelId);

      // ==================== Assert ====================
      // verify recommended labels are returned
      expect(result).toEqual(mockRecommendedLabels);
      expect(mockLabelModel.findById).toHaveBeenCalledWith(labelId);
      expect(mockLabelModel.find).toHaveBeenCalledWith({
        _id: { $ne: labelId },
        type: LabelOptions.GENRE,
        songs: { $ne: [] },
      });
      expect(mockQueryChain.limit).toHaveBeenCalledWith(50); // PROFILE_FETCH_LIMIT
      expect(mockQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockQueryChain.lean).toHaveBeenCalled();
    });

    it("should throw error when label is not found", async () => {
      // ==================== Arrange ====================
      // prepare mock for non-existent label
      mockLabelModel.findById.mockResolvedValue(null);

      const labelId = "6507f1a456789abcdef12345";

      // ==================== Act & Assert ====================
      // verify error is thrown when label not found
      await expect(getRecommendedLabels(labelId)).rejects.toThrow("Label is not found");
    });
  });

  describe("createLabel", () => {
    it("should create new label when label doesn't exist", async () => {
      // ==================== Arrange ====================
      // prepare mock data for new label creation
      const mockNewLabel = {
        _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
        label: "New Genre",
        type: LabelOptions.GENRE,
        author: "6507f1a456789abcdef12346",
        users: ["6507f1a456789abcdef12346"],
        default: false,
      };

      mockLabelModel.findOne.mockResolvedValue(null);
      mockLabelModel.create.mockResolvedValue(mockNewLabel as any);

      const params = {
        userId: "6507f1a456789abcdef12346",
        label: "New Genre",
        type: LabelOptions.GENRE,
      };

      // ==================== Act ====================
      // execute createLabel with new label
      const result = await createLabel(params);

      // ==================== Assert ====================
      // verify new label is created correctly
      expect(result).toEqual({ label: mockNewLabel });
      expect(mockLabelModel.findOne).toHaveBeenCalledWith({
        label: "New Genre",
        type: LabelOptions.GENRE,
      });
      expect(mockLabelModel.create).toHaveBeenCalledWith({
        label: "New Genre",
        type: LabelOptions.GENRE,
        author: "6507f1a456789abcdef12346",
        users: "6507f1a456789abcdef12346",
        default: false,
      });
    });

    it("should update existing label by adding user to users array", async () => {
      // ==================== Arrange ====================
      // prepare mock data for existing label update
      const mockExistingLabel = {
        _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
        label: "Existing Genre",
        type: LabelOptions.GENRE,
        users: ["existingUser"],
      };

      const mockUpdatedLabel = {
        ...mockExistingLabel,
        users: ["existingUser", "newUser"],
      };

      mockLabelModel.findOne.mockResolvedValue(mockExistingLabel);
      mockLabelModel.findOneAndUpdate.mockResolvedValue(mockUpdatedLabel);

      const params = {
        userId: "newUser",
        label: "Existing Genre",
        type: LabelOptions.GENRE,
      };

      // ==================== Act ====================
      // execute createLabel with existing label
      const result = await createLabel(params);

      // ==================== Assert ====================
      // verify existing label is updated correctly
      expect(result).toEqual({ label: mockUpdatedLabel });
      expect(mockLabelModel.findOneAndUpdate).toHaveBeenCalledWith(
        { label: "Existing Genre", type: LabelOptions.GENRE },
        { $addToSet: { users: "newUser" } },
        { new: true }
      );
    });

    it("should throw error when label creation fails", async () => {
      // ==================== Arrange ====================
      // prepare mock for failed label creation
      mockLabelModel.findOne.mockResolvedValue(null);
      mockLabelModel.create.mockResolvedValue(null as any);

      const params = {
        userId: "6507f1a456789abcdef12346",
        label: "Failed Label",
        type: LabelOptions.GENRE,
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when label creation fails
      await expect(createLabel(params)).rejects.toThrow("Failed to create label");
    });
  });

  describe("removeLabel", () => {
    it("should remove user from label users array", async () => {
      // ==================== Arrange ====================
      // prepare mock data for label removal
      const mockRemovedLabel = {
        _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
        label: "Test Genre",
        type: LabelOptions.GENRE,
        users: ["remainingUser"],
        default: false,
      };

      mockLabelModel.findOneAndUpdate.mockResolvedValue(mockRemovedLabel);

      const data = {
        id: "6507f1a456789abcdef12345",
        userId: "removedUser",
      };

      // ==================== Act ====================
      // execute removeLabel
      const result = await removeLabel(data);

      // ==================== Assert ====================
      // verify user is removed from label
      expect(result).toEqual({ removedLabel: mockRemovedLabel });
      expect(mockLabelModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "6507f1a456789abcdef12345", default: false },
        { $pull: { users: "removedUser" } },
        { new: true }
      );
    });

    it("should throw error when label is not found", async () => {
      // ==================== Arrange ====================
      // prepare mock for non-existent label
      mockLabelModel.findOneAndUpdate.mockResolvedValue(null);

      const data = {
        id: "6507f1a456789abcdef12345",
        userId: "testUser",
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when label not found
      await expect(removeLabel(data)).rejects.toThrow("Label is not found");
    });

    it("should not remove default labels", async () => {
      // ==================== Arrange ====================
      // prepare mock for default label (should not be found due to default: false filter)
      mockLabelModel.findOneAndUpdate.mockResolvedValue(null);

      const data = {
        id: "6507f1a456789abcdef12345",
        userId: "testUser",
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when trying to remove default label
      await expect(removeLabel(data)).rejects.toThrow("Label is not found");
      expect(mockLabelModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "6507f1a456789abcdef12345", default: false },
        { $pull: { users: "testUser" } },
        { new: true }
      );
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle database errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare database error
      const dbError = new Error("Database connection failed");
      mockLabelModel.findOne.mockRejectedValue(dbError);

      const params = {
        label: "Test",
        type: LabelOptions.GENRE,
        default: true,
        createIfAbsent: false,
      };

      // ==================== Act & Assert ====================
      // verify database errors are properly propagated
      await expect(getLabelId(params)).rejects.toThrow("Database connection failed");
    });

    it("should handle aggregation errors in getLabels", async () => {
      // ==================== Arrange ====================
      // prepare aggregation error
      const aggError = new Error("Aggregation pipeline failed");
      mockLabelModel.aggregate.mockRejectedValue(aggError);

      const params = {
        userId: "6507f1a456789abcdef12345",
        types: [LabelOptions.GENRE],
      };

      // ==================== Act & Assert ====================
      // verify aggregation errors are properly propagated
      await expect(getLabels(params)).rejects.toThrow("Aggregation pipeline failed");
    });

    it("should handle ObjectId conversion errors", async () => {
      // ==================== Arrange ====================
      // prepare invalid ObjectId
      const invalidUserId = "invalid-user-id";

      // ==================== Act & Assert ====================
      // verify ObjectId conversion error is handled appropriately
      expect(() => {
        new mongoose.Types.ObjectId(invalidUserId);
      }).toThrow();
    });
  });

  describe("Integration scenarios", () => {
    it("should verify all service functions are properly exported and callable", async () => {
      // ==================== Act & Assert ====================
      // verify all service functions are properly exported and can be called
      expect(typeof getLabelId).toBe("function");
      expect(typeof getLabels).toBe("function");
      expect(typeof getLabelById).toBe("function");
      expect(typeof getRecommendedLabels).toBe("function");
      expect(typeof createLabel).toBe("function");
      expect(typeof removeLabel).toBe("function");

      // verify functions accept the correct parameters
      expect(getLabelId).toHaveLength(1);
      expect(getLabels).toHaveLength(1);
      expect(getLabelById).toHaveLength(1);
      expect(getRecommendedLabels).toHaveLength(1);
      expect(createLabel).toHaveLength(1);
      expect(removeLabel).toHaveLength(1);
    });
  });
});
