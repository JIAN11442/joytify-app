import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import AlbumModel from "../../../src/models/album.model";
import {
  getUserAlbums,
  getAlbumById,
  getRecommendedAlbums,
  createAlbum,
  updateAlbumById,
  removeAlbum,
} from "../../../src/services/album.service";
import { collectDocumentAttributes } from "../../../src/services/util.service";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/album.model");
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/services/util.service");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockAlbumModel = AlbumModel as jest.Mocked<typeof AlbumModel>;
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockCollectDocumentAttributes = collectDocumentAttributes as jest.MockedFunction<
  typeof collectDocumentAttributes
>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Album Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockAlbumId = "507f1f77bcf86cd799439012";
  const mockArtistId = "507f1f77bcf86cd799439013";
  const mockSongId = "507f1f77bcf86cd799439014";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockAlbumObjectId = new mongoose.Types.ObjectId(mockAlbumId);
  const mockArtistObjectId = new mongoose.Types.ObjectId(mockArtistId);
  const mockSongObjectId = new mongoose.Types.ObjectId(mockSongId);

  const mockAlbum = {
    _id: mockAlbumObjectId,
    title: "Test Album",
    creator: mockUserObjectId,
    artists: [mockArtistObjectId],
    users: [mockUserObjectId],
    songs: [mockSongObjectId],
    coverImage: "https://example.com/cover.jpg",
    releaseDate: new Date("2023-01-01"),
  };

  const mockSong = {
    _id: mockSongObjectId,
    title: "Test Song",
    artist: "Test Artist",
    album: mockAlbumObjectId,
    genres: ["pop"],
    tags: ["happy"],
    languages: ["en"],
  };

  const mockQueryChain = {
    populate: jest.fn().mockReturnThis(),
    populateNestedSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([mockAlbum]),
  };

  const mockSingleQueryChain = {
    populate: jest.fn().mockReturnThis(),
    populateNestedSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockAlbum),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });
  });

  describe("getUserAlbums", () => {
    it("should get user albums successfully", async () => {
      // ==================== Arrange ====================
      mockAlbumModel.find.mockResolvedValue([mockAlbum]);

      // ==================== Act ====================
      const result = await getUserAlbums(mockUserId);

      // ==================== Assert Process ====================
      // 1. verify find was called with correct parameters
      expect(mockAlbumModel.find).toHaveBeenCalledWith({
        users: mockUserId,
      });

      // 2. verify correct result
      expect(result).toEqual({
        albums: [mockAlbum],
      });
    });

    it("should return empty array when user has no albums", async () => {
      // ==================== Arrange ====================
      mockAlbumModel.find.mockResolvedValue([]);

      // ==================== Act ====================
      const result = await getUserAlbums(mockUserId);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        albums: [],
      });
    });
  });

  describe("getAlbumById", () => {
    it("should get album by ID successfully", async () => {
      // ==================== Arrange ====================
      mockAlbumModel.findById.mockReturnValue(mockSingleQueryChain as any);

      // ==================== Act ====================
      const result = await getAlbumById(mockAlbumId);

      // ==================== Assert Process ====================
      // 1. verify findById was called with correct parameters
      expect(mockAlbumModel.findById).toHaveBeenCalledWith(mockAlbumId);

      // 2. verify query chain methods were called
      expect(mockSingleQueryChain.populate).toHaveBeenCalledWith({
        path: "artists",
        select: "name",
        transform: expect.any(Function),
      });
      expect(mockSingleQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockSingleQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockSingleQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        album: mockAlbum,
      });
    });

    it("should handle album not found", async () => {
      // ==================== Arrange ====================
      mockAlbumModel.findById.mockReturnValue({
        ...mockSingleQueryChain,
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      // ==================== Act ====================
      const result = await getAlbumById(mockAlbumId);

      // ==================== Assert Process ====================
      // 1. verify findById was called with correct parameters
      expect(mockAlbumModel.findById).toHaveBeenCalledWith(mockAlbumId);

      // 2. verify correct result
      expect(result).toEqual({
        album: null,
      });
    });
  });

  describe("getRecommendedAlbums", () => {
    it("should get recommended albums successfully", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
      };

      const mockAggregateResult = {
        albumIds: [mockAlbumObjectId],
      };

      mockAlbumModel.findById.mockResolvedValue(mockAlbum);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([mockAggregateResult]);
      mockAlbumModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedAlbums(mockAlbumId);

      // ==================== Assert Process ====================
      // 1. verify album lookup
      expect(mockAlbumModel.findById).toHaveBeenCalledWith(mockAlbumId);

      // 2. verify features collection
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: mockSongModel,
        ids: [mockSongObjectId],
        fields: ["genres", "tags", "languages"],
      });

      // 3. verify song aggregation
      expect(mockSongModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: { $nin: [mockSongObjectId] } } },
        { $match: { album: { $ne: mockAlbumObjectId } } },
        {
          $match: {
            $or: [
              { genres: { $in: mockFeatures.genres } },
              { tags: { $in: mockFeatures.tags } },
              { languages: { $in: mockFeatures.languages } },
            ],
          },
        },
        { $limit: 50 },
        {
          $group: {
            _id: null,
            albumIds: { $addToSet: "$album" },
          },
        },
      ]);

      // 4. verify album search
      expect(mockAlbumModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockAlbumObjectId] },
      });

      // 5. verify correct result
      expect(result).toEqual([mockAlbum]);
    });

    it("should handle album not found error", async () => {
      // ==================== Arrange ====================
      mockAlbumModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(getRecommendedAlbums(mockAlbumId)).rejects.toThrow("Album not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Album not found");
    });

    it("should handle empty aggregate result", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
      };

      mockAlbumModel.findById.mockResolvedValue(mockAlbum);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.aggregate.mockResolvedValue([]);
      mockAlbumModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedAlbums(mockAlbumId);

      // ==================== Assert Process ====================
      // 1. verify album search with empty albumIds
      expect(mockAlbumModel.find).toHaveBeenCalledWith({
        _id: { $in: [] },
      });

      // 2. verify correct result
      expect(result).toEqual([mockAlbum]);
    });
  });

  describe("createAlbum", () => {
    it("should create new album successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Album",
        artists: [mockArtistId],
        coverImage: "https://example.com/new-cover.jpg",
        releaseDate: new Date("2023-01-01"),
      };

      mockAlbumModel.findOneAndUpdate.mockResolvedValue(null);
      mockAlbumModel.create.mockResolvedValue(mockAlbum as any);

      // ==================== Act ====================
      const result = await createAlbum(params);

      // ==================== Assert Process ====================
      // 1. verify findOneAndUpdate was called
      expect(mockAlbumModel.findOneAndUpdate).toHaveBeenCalledWith(
        { title: "New Album", artists: [mockArtistId] },
        { $addToSet: { users: mockUserId } },
        { new: true }
      );

      // 2. verify album creation
      expect(mockAlbumModel.create).toHaveBeenCalledWith({
        creator: mockUserId,
        title: "New Album",
        artists: [mockArtistId],
        users: [mockUserId],
        coverImage: "https://example.com/new-cover.jpg",
        releaseDate: new Date("2023-01-01"),
      });

      // 3. verify correct result
      expect(result).toEqual({
        album: mockAlbum,
      });
    });

    it("should add user to existing album successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "Existing Album",
        artists: [mockArtistId],
      };

      mockAlbumModel.findOneAndUpdate.mockResolvedValue(mockAlbum);

      // ==================== Act ====================
      const result = await createAlbum(params);

      // ==================== Assert Process ====================
      // 1. verify findOneAndUpdate was called
      expect(mockAlbumModel.findOneAndUpdate).toHaveBeenCalledWith(
        { title: "Existing Album", artists: [mockArtistId] },
        { $addToSet: { users: mockUserId } },
        { new: true }
      );

      // 2. verify create was not called
      expect(mockAlbumModel.create).not.toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        album: mockAlbum,
      });
    });

    it("should handle album creation failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Album",
        artists: [mockArtistId],
      };

      mockAlbumModel.findOneAndUpdate.mockResolvedValue(null);
      mockAlbumModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      await expect(createAlbum(params)).rejects.toThrow("Failed to create album");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to create album");
    });
  });

  describe("updateAlbumById", () => {
    it("should update album successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        albumId: mockAlbumId,
        title: "Updated Album",
        coverImage: "https://example.com/updated-cover.jpg",
      };

      mockAlbumModel.findOneAndUpdate.mockResolvedValue(mockAlbum);

      // ==================== Act ====================
      const result = await updateAlbumById(params);

      // ==================== Assert Process ====================
      // 1. verify album update
      expect(mockAlbumModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAlbumId, creator: mockUserId },
        { $set: { title: "Updated Album", coverImage: "https://example.com/updated-cover.jpg" } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual(mockAlbum);
    });

    it("should handle album not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        albumId: mockAlbumId,
        title: "Updated Album",
      };

      mockAlbumModel.findOneAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(updateAlbumById(params)).rejects.toThrow("Album not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Album not found");
    });
  });

  describe("removeAlbum", () => {
    it("should remove user from album successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        albumId: mockAlbumId,
      };

      mockAlbumModel.findByIdAndUpdate.mockResolvedValue(mockAlbum);

      // ==================== Act ====================
      const result = await removeAlbum(params);

      // ==================== Assert Process ====================
      // 1. verify album update
      expect(mockAlbumModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAlbumId,
        { $pull: { users: mockUserId } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual({
        updatedAlbum: mockAlbum,
      });
    });

    it("should handle album not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        albumId: mockAlbumId,
      };

      mockAlbumModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(removeAlbum(params)).rejects.toThrow("Album not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Album not found");
    });
  });
});
