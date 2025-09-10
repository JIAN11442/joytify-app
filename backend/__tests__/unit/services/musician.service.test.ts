import mongoose from "mongoose";
import UserModel from "../../../src/models/user.model";
import SongModel from "../../../src/models/song.model";
import MusicianModel from "../../../src/models/musician.model";
import {
  getMusicianId,
  getMusicianById,
  getFollowingMusicians,
  getRecommendedMusicians,
  updateMusicianById,
  followTargetMusician,
  unfollowTargetMusician,
} from "../../../src/services/musician.service";
import { collectDocumentAttributes } from "../../../src/services/util.service";
import { PROFILE_FETCH_LIMIT } from "../../../src/constants/env-validate.constant";
import { MusicianOptions } from "@joytify/types/constants";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/musician.model");
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/services/util.service");
jest.mock("../../../src/utils/app-assert.util");
jest.mock("../../../src/constants/env-validate.constant", () => ({
  PROFILE_FETCH_LIMIT: 50,
}));

// Mock type definitions
const mockMusicianModel = MusicianModel as jest.Mocked<typeof MusicianModel>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockCollectDocumentAttributes = collectDocumentAttributes as jest.MockedFunction<
  typeof collectDocumentAttributes
>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Musician Service", () => {
  // ==================== Arrange ====================
  // mock data constants for testing
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockMusicianId = "507f1f77bcf86cd799439012";
  const mockSongId = "507f1f77bcf86cd799439013";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockMusicianObjectId = new mongoose.Types.ObjectId(mockMusicianId);
  const mockSongObjectId = new mongoose.Types.ObjectId(mockSongId);

  const mockMusician = {
    _id: mockMusicianObjectId,
    name: "Test Musician",
    creator: mockUserObjectId,
    roles: ["artist", "composer"],
    songs: [mockSongObjectId],
    followers: [mockUserObjectId],
    coverImage: "https://example.com/cover.jpg",
  };

  const mockUser = {
    _id: mockUserObjectId,
    username: "testuser",
    following: [mockMusicianObjectId],
    accountInfo: {
      totalFollowing: 5,
    },
  };

  const mockSong = {
    _id: mockSongObjectId,
    title: "Test Song",
    artist: mockMusicianObjectId,
    composers: [mockMusicianObjectId],
    lyricists: [mockMusicianObjectId],
    genres: ["pop"],
    tags: ["happy"],
    languages: ["en"],
  };

  const mockQueryChain = {
    populateNestedSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([mockMusician]),
    limit: jest.fn().mockReturnThis(),
  };

  const mockSingleQueryChain = {
    populateNestedSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockMusician),
  };

  beforeEach(() => {
    // ==================== Arrange ====================
    // reset all mocks
    jest.clearAllMocks();

    // mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });
  });

  describe("getMusicianId", () => {
    it("should get existing musician ID successfully", async () => {
      // ==================== Arrange ====================
      // prepare test parameters for existing musician lookup
      const params = {
        userId: mockUserId,
        musician: "Test Musician",
        type: MusicianOptions.ARTIST,
        createIfAbsent: false,
      };

      // mock database responses
      mockMusicianModel.findOne.mockResolvedValue(mockMusician);
      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);

      // ==================== Act ====================
      // call the service function
      const result = await getMusicianId(params);

      // ==================== Assert ====================
      // verify findOne was called with correct parameters
      expect(mockMusicianModel.findOne).toHaveBeenCalledWith({
        name: "Test Musician",
      });

      // verify findByIdAndUpdate was called to add role
      expect(mockMusicianModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMusicianObjectId,
        { $addToSet: { roles: MusicianOptions.ARTIST } },
        { new: true }
      );

      // verify correct result is returned
      expect(result).toEqual({
        id: mockMusicianObjectId,
      });
    });

    it("should create new musician when not found and createIfAbsent is true", async () => {
      // ==================== Arrange ====================
      // prepare test parameters for new musician creation
      const params = {
        userId: mockUserId,
        musician: "New Musician",
        type: MusicianOptions.COMPOSER,
        createIfAbsent: true,
      } as any;

      // mock database responses
      mockMusicianModel.findOne.mockResolvedValue(null);
      mockMusicianModel.create.mockResolvedValue(mockMusician as any);
      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);

      // ==================== Act ====================
      // call the service function
      const result = await getMusicianId(params);

      // ==================== Assert ====================
      // verify create was called with correct parameters
      expect(mockMusicianModel.create).toHaveBeenCalledWith({
        name: "New Musician",
        creator: mockUserId,
        roles: MusicianOptions.COMPOSER,
      });

      // verify correct result is returned
      expect(result).toEqual({
        id: mockMusicianObjectId,
      });
    });

    it("should handle musician not found error when createIfAbsent is false", async () => {
      // ==================== Arrange ====================
      // prepare test parameters for non-existent musician
      const params = {
        userId: mockUserId,
        musician: "Non-existent Musician",
        type: MusicianOptions.ARTIST,
        createIfAbsent: false,
      } as any;

      // mock database response for non-existent musician
      mockMusicianModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // verify the function throws an error
      await expect(getMusicianId(params)).rejects.toThrow("Musician is not found");

      // verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician is not found");
    });

    it("should handle musician creation failure", async () => {
      // ==================== Arrange ====================
      // prepare test parameters for musician creation
      const params = {
        userId: mockUserId,
        musician: "New Musician",
        type: MusicianOptions.ARTIST,
        createIfAbsent: true,
      } as any;

      // mock database responses
      mockMusicianModel.findOne.mockResolvedValue(null);
      mockMusicianModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      // verify the function throws an error
      await expect(getMusicianId(params)).rejects.toThrow("Failed to create musician");

      // verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to create musician");
    });

    it("should handle musician not found when createIfAbsent is undefined", async () => {
      // ==================== Arrange ====================
      // prepare test parameters with undefined createIfAbsent
      const params = {
        userId: mockUserId,
        musician: "Non-existent Musician",
        type: MusicianOptions.ARTIST,
        createIfAbsent: undefined,
      } as any;

      // mock database response for non-existent musician
      mockMusicianModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // verify the function throws an error
      await expect(getMusicianId(params)).rejects.toThrow("Musician is not found");

      // verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician is not found");
    });
  });

  describe("getMusicianById", () => {
    it("should get musician by ID successfully", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.findById.mockReturnValue(mockSingleQueryChain as any);

      // ==================== Act ====================
      const result = await getMusicianById(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify findById was called
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockMusicianId);

      // 2. verify query chain methods were called
      expect(mockSingleQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockSingleQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockSingleQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        musician: mockMusician,
      });
    });

    it("should return null musician when not found", async () => {
      // ==================== Arrange ====================
      const mockNullQueryChain = {
        populateNestedSongDetails: jest.fn().mockReturnThis(),
        refactorSongFields: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };

      mockMusicianModel.findById.mockReturnValue(mockNullQueryChain as any);

      // ==================== Act ====================
      const result = await getMusicianById(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify findById was called
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockMusicianId);

      // 2. verify query chain methods were called
      expect(mockNullQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockNullQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockNullQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        musician: null,
      });
    });

    it("should handle database error during query", async () => {
      // ==================== Arrange ====================
      const mockErrorQueryChain = {
        populateNestedSongDetails: jest.fn().mockReturnThis(),
        refactorSongFields: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error("Database query error")),
      };

      mockMusicianModel.findById.mockReturnValue(mockErrorQueryChain as any);

      // ==================== Act & Assert ====================
      await expect(getMusicianById(mockMusicianId)).rejects.toThrow("Database query error");

      // ==================== Assert ====================
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockMusicianId);
      expect(mockErrorQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockErrorQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockErrorQueryChain.lean).toHaveBeenCalled();
    });
  });

  describe("getFollowingMusicians", () => {
    it("should get user following musicians successfully", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.find.mockResolvedValue([mockMusician]);

      // ==================== Act ====================
      const result = await getFollowingMusicians(mockUserId);

      // ==================== Assert ====================
      // 1. verify find was called
      expect(mockMusicianModel.find).toHaveBeenCalledWith({
        followers: mockUserId,
      });

      // 2. verify correct result
      expect(result).toEqual([mockMusician]);
    });

    it("should return empty array when user has no following musicians", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.find.mockResolvedValue([]);

      // ==================== Act ====================
      const result = await getFollowingMusicians(mockUserId);

      // ==================== Assert ====================
      expect(result).toEqual([]);
    });

    it("should handle database error", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.find.mockRejectedValue(new Error("Database connection error"));

      // ==================== Act & Assert ====================
      await expect(getFollowingMusicians(mockUserId)).rejects.toThrow("Database connection error");

      // ==================== Assert ====================
      expect(mockMusicianModel.find).toHaveBeenCalledWith({
        followers: mockUserId,
      });
    });
  });

  describe("getRecommendedMusicians", () => {
    it("should get recommended musicians successfully", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        artist: [mockMusicianObjectId],
        composers: [mockMusicianObjectId],
        lyricists: [mockMusicianObjectId],
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
      };

      const mockAggregateResult = {
        musicianIds: [mockMusicianObjectId],
      };

      mockMusicianModel.findById.mockResolvedValue(mockMusician);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([mockAggregateResult]);
      mockMusicianModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedMusicians(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify musician lookup
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockMusicianId);

      // 2. verify features collection
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: mockSongModel,
        ids: [mockSongObjectId],
        fields: ["artist", "composers", "lyricists", "genres", "tags", "languages"],
      });

      // 3. verify song aggregation
      expect(mockSongModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: { $nin: [mockSongObjectId] } } },
        { $match: { artist: { $ne: mockMusicianObjectId } } },
        {
          $match: {
            $or: [
              { artist: { $in: mockFeatures.artist } },
              { composers: { $in: mockFeatures.composers } },
              { lyricists: { $in: mockFeatures.lyricists } },
              { genres: { $in: mockFeatures.genres } },
              { tags: { $in: mockFeatures.tags } },
              { languages: { $in: mockFeatures.languages } },
            ],
          },
        },
        { $limit: PROFILE_FETCH_LIMIT },
        {
          $group: {
            _id: null,
            musicianIds: {
              $addToSet: {
                $concatArrays: [["$artist"], "$composers", "$lyricists"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            musicianIds: {
              $reduce: {
                input: "$musicianIds",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
          },
        },
      ]);

      // 4. verify musician search
      expect(mockMusicianModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockMusicianObjectId] },
      });

      // 5. verify query chain methods
      expect(mockQueryChain.limit).toHaveBeenCalledWith(PROFILE_FETCH_LIMIT);
      expect(mockQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockQueryChain.lean).toHaveBeenCalled();

      // 6. verify correct result
      expect(result).toEqual([mockMusician]);
    });

    it("should handle musician not found error", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(getRecommendedMusicians(mockMusicianId)).rejects.toThrow("Musician not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician not found");
    });

    it("should handle empty aggregate result", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        artist: [mockMusicianObjectId],
        composers: [mockMusicianObjectId],
        lyricists: [mockMusicianObjectId],
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
      };

      mockMusicianModel.findById.mockResolvedValue(mockMusician);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([]);
      mockMusicianModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedMusicians(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify musician search with empty musicianIds
      expect(mockMusicianModel.find).toHaveBeenCalledWith({
        _id: { $in: [] },
      });

      // 2. verify correct result
      expect(result).toEqual([mockMusician]);
    });

    it("should handle undefined aggregate result", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        artist: [mockMusicianObjectId],
        composers: [mockMusicianObjectId],
        lyricists: [mockMusicianObjectId],
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
      };

      mockMusicianModel.findById.mockResolvedValue(mockMusician);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([undefined]);
      mockMusicianModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedMusicians(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify musician search with empty musicianIds
      expect(mockMusicianModel.find).toHaveBeenCalledWith({
        _id: { $in: [] },
      });

      // 2. verify correct result
      expect(result).toEqual([mockMusician]);
    });

    it("should handle musician with empty songs array", async () => {
      // ==================== Arrange ====================
      const mockMusicianWithoutSongs = {
        ...mockMusician,
        songs: [],
      };

      const mockFeatures = {
        artist: [],
        composers: [],
        lyricists: [],
        genres: [],
        tags: [],
        languages: [],
      };

      mockMusicianModel.findById.mockResolvedValue(mockMusicianWithoutSongs);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([]);
      mockMusicianModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedMusicians(mockMusicianId);

      // ==================== Assert ====================
      // 1. verify features collection with empty songs
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: mockSongModel,
        ids: [],
        fields: ["artist", "composers", "lyricists", "genres", "tags", "languages"],
      });

      // 2. verify song aggregation with empty songs
      expect(mockSongModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: { $nin: [] } } },
        { $match: { artist: { $ne: mockMusicianObjectId } } },
        {
          $match: {
            $or: [
              { artist: { $in: [] } },
              { composers: { $in: [] } },
              { lyricists: { $in: [] } },
              { genres: { $in: [] } },
              { tags: { $in: [] } },
              { languages: { $in: [] } },
            ],
          },
        },
        { $limit: PROFILE_FETCH_LIMIT },
        {
          $group: {
            _id: null,
            musicianIds: {
              $addToSet: {
                $concatArrays: [["$artist"], "$composers", "$lyricists"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            musicianIds: {
              $reduce: {
                input: "$musicianIds",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
          },
        },
      ]);

      // 3. verify correct result
      expect(result).toEqual([mockMusician]);
    });

    it("should handle collectDocumentAttributes error", async () => {
      // ==================== Arrange ====================
      mockMusicianModel.findById.mockResolvedValue(mockMusician);
      mockCollectDocumentAttributes.mockRejectedValue(new Error("Collection error"));

      // ==================== Act & Assert ====================
      await expect(getRecommendedMusicians(mockMusicianId)).rejects.toThrow("Collection error");

      // ==================== Assert ====================
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockMusicianId);
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: mockSongModel,
        ids: [mockSongObjectId],
        fields: ["artist", "composers", "lyricists", "genres", "tags", "languages"],
      });
    });
  });

  describe("updateMusicianById", () => {
    it("should update musician successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
        name: "Updated Musician",
        coverImage: "https://example.com/updated-cover.jpg",
      };

      mockMusicianModel.findOneAndUpdate.mockResolvedValue(mockMusician);

      // ==================== Act ====================
      const result = await updateMusicianById(params);

      // ==================== Assert ====================
      // 1. verify musician update
      expect(mockMusicianModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockMusicianId, creator: mockUserId },
        { $set: { name: "Updated Musician", coverImage: "https://example.com/updated-cover.jpg" } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual(mockMusician);
    });

    it("should update musician with only name", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
        name: "Updated Musician",
      };

      mockMusicianModel.findOneAndUpdate.mockResolvedValue(mockMusician);

      // ==================== Act ====================
      const result = await updateMusicianById(params);

      // ==================== Assert ====================
      // 1. verify musician update
      expect(mockMusicianModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockMusicianId, creator: mockUserId },
        { $set: { name: "Updated Musician", coverImage: undefined } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual(mockMusician);
    });

    it("should handle musician not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
        name: "Updated Musician",
      };

      mockMusicianModel.findOneAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(updateMusicianById(params)).rejects.toThrow("Musician not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician not found");
    });
  });

  describe("followTargetMusician", () => {
    it("should follow musician successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      // ==================== Act ====================
      const result = await followTargetMusician(params);

      // ==================== Assert ====================
      // 1. verify musician followers update
      expect(mockMusicianModel.findByIdAndUpdate).toHaveBeenCalledWith(mockMusicianId, {
        $addToSet: { followers: mockUserId },
      });

      // 2. verify user following update
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
        $addToSet: { following: mockMusicianId },
        $inc: { "accountInfo.totalFollowing": 1 },
      });

      // 3. verify correct result
      expect(result).toEqual({
        musician: mockMusician,
        user: mockUser,
      });
    });

    it("should handle musician not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(followTargetMusician(params)).rejects.toThrow("Musician not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician not found");
    });

    it("should handle user not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(followTargetMusician(params)).rejects.toThrow("User not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "User not found");
    });
  });

  describe("unfollowTargetMusician", () => {
    it("should unfollow musician successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      // ==================== Act ====================
      const result = await unfollowTargetMusician(params);

      // ==================== Assert ====================
      // 1. verify musician followers update
      expect(mockMusicianModel.findByIdAndUpdate).toHaveBeenCalledWith(mockMusicianId, {
        $pull: { followers: mockUserId },
      });

      // 2. verify user following update
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
        $pull: { following: mockMusicianId },
        $inc: { "accountInfo.totalFollowing": -1 },
      });

      // 3. verify correct result
      expect(result).toEqual({
        musician: mockMusician,
        user: mockUser,
      });
    });

    it("should handle musician not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(unfollowTargetMusician(params)).rejects.toThrow("Musician not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Musician not found");
    });

    it("should handle user not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        musicianId: mockMusicianId,
      };

      mockMusicianModel.findByIdAndUpdate.mockResolvedValue(mockMusician);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(unfollowTargetMusician(params)).rejects.toThrow("User not found");

      // ==================== Assert ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "User not found");
    });
  });
});
