import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import PlaylistModel from "../../../src/models/playlist.model";
import {
  getUserPlaylists,
  getUserPlaylistById,
  createNewPlaylist,
  updatePlaylistById,
  deletePlaylistById,
} from "../../../src/services/playlist.service";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/playlist.model");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockPlaylistModel = PlaylistModel as jest.Mocked<typeof PlaylistModel>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Playlist Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockPlaylistId = "507f1f77bcf86cd799439012";
  const mockSongId = "507f1f77bcf86cd799439013";
  const mockTargetPlaylistId = "507f1f77bcf86cd799439014";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockPlaylistObjectId = new mongoose.Types.ObjectId(mockPlaylistId);
  const mockSongObjectId = new mongoose.Types.ObjectId(mockSongId);

  const mockSong = {
    _id: mockSongObjectId,
    title: "Test Song",
    artist: "Test Artist",
    duration: 180,
    playlistFor: [],
  };

  const mockPlaylist = {
    _id: mockPlaylistObjectId,
    user: mockUserObjectId,
    title: "Test Playlist",
    description: "A test playlist",
    default: false,
    songs: [mockSongObjectId],
    stats: {
      totalSongCount: 1,
      totalSongDuration: 180,
    },
  };

  const mockDefaultPlaylist = {
    ...mockPlaylist,
    _id: new mongoose.Types.ObjectId(),
    title: "Default Playlist",
    default: true,
  };

  const mockQueryChain = {
    populateNestedSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockPlaylist),
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

  describe("getUserPlaylists", () => {
    it("should get user playlists successfully", async () => {
      // ==================== Arrange ====================
      const query = "";

      mockPlaylistModel.findOne
        .mockResolvedValueOnce(mockDefaultPlaylist) // default playlist
        .mockReturnValueOnce(mockQueryChain as any); // user playlists

      mockPlaylistModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPlaylist]),
      } as any);

      // ==================== Act ====================
      const result = await getUserPlaylists(mockUserId, query);

      // ==================== Assert Process ====================
      // 1. verify default playlist query
      expect(mockPlaylistModel.findOne).toHaveBeenCalledWith({
        user: mockUserId,
        default: true,
      });

      // 2. verify user playlists query
      expect(mockPlaylistModel.find).toHaveBeenCalledWith({
        user: mockUserId,
        default: false,
      });

      // 3. verify correct result
      expect(result).toEqual({
        playlists: [mockDefaultPlaylist, mockPlaylist],
      });
    });

    it("should get user playlists with search query", async () => {
      // ==================== Arrange ====================
      const query = "test";

      // Reset mock to avoid interference from beforeEach
      mockPlaylistModel.findOne.mockReset();
      mockPlaylistModel.find.mockReset();

      mockPlaylistModel.findOne.mockResolvedValue(null); // no default playlist
      mockPlaylistModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPlaylist]),
      } as any);

      // ==================== Act ====================
      const result = await getUserPlaylists(mockUserId, query);

      // ==================== Assert Process ====================
      // 1. verify search query was applied
      expect(mockPlaylistModel.findOne).toHaveBeenCalledWith({
        user: mockUserId,
        default: true,
        title: expect.any(RegExp),
      });

      // 2. verify user playlists query with search
      expect(mockPlaylistModel.find).toHaveBeenCalledWith({
        user: mockUserId,
        default: false,
        title: expect.any(RegExp),
      });

      // 3. verify correct result
      expect(result).toEqual({
        playlists: [mockPlaylist],
      });
    });

    it("should handle no default playlist", async () => {
      // ==================== Arrange ====================
      const query = "";

      mockPlaylistModel.findOne.mockResolvedValue(null); // no default playlist
      mockPlaylistModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      } as any);

      // ==================== Act ====================
      const result = await getUserPlaylists(mockUserId, query);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        playlists: [],
      });
    });
  });

  describe("getUserPlaylistById", () => {
    it("should get user playlist by ID successfully", async () => {
      // ==================== Arrange ====================
      mockPlaylistModel.findOne.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getUserPlaylistById(mockPlaylistId, mockUserId);

      // ==================== Assert Process ====================
      // 1. verify findOne was called with correct parameters
      expect(mockPlaylistModel.findOne).toHaveBeenCalledWith({
        _id: mockPlaylistId,
        user: mockUserId,
      });

      // 2. verify query chain methods were called
      expect(mockQueryChain.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalledWith({
        transformNestedSongs: true,
      });
      expect(mockQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        playlist: mockPlaylist,
      });
    });
  });

  describe("createNewPlaylist", () => {
    it("should create new playlist without songs successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Playlist",
        description: "A new playlist",
        addedSongs: [],
      };

      mockPlaylistModel.create.mockResolvedValue(mockPlaylist as any);

      // ==================== Act ====================
      const result = await createNewPlaylist(params);

      // ==================== Assert Process ====================
      // 1. verify playlist creation
      expect(mockPlaylistModel.create).toHaveBeenCalledWith({
        user: mockUserObjectId,
        title: "New Playlist",
        description: "A new playlist",
      });

      // 2. verify no song operations
      expect(mockSongModel.find).not.toHaveBeenCalled();
      expect(mockSongModel.updateMany).not.toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        playlist: mockPlaylist,
      });
    });

    it("should create new playlist with songs successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Playlist",
        description: "A new playlist",
        addedSongs: [mockSongId],
      };

      mockSongModel.find.mockResolvedValue([mockSong]);
      mockPlaylistModel.create.mockResolvedValue(mockPlaylist as any);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: true });

      // ==================== Act ====================
      const result = await createNewPlaylist(params);

      // ==================== Assert Process ====================
      // 1. verify song lookup
      expect(mockSongModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockSongId] },
      });

      // 2. verify playlist creation with songs
      expect(mockPlaylistModel.create).toHaveBeenCalledWith({
        user: mockUserObjectId,
        title: "New Playlist",
        description: "A new playlist",
        songs: [mockSongObjectId],
        stats: {
          totalSongCount: 1,
          totalSongDuration: 180,
        },
      });

      // 3. verify song update
      expect(mockSongModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [mockSongId] } },
        { $addToSet: { playlistFor: mockPlaylistObjectId } }
      );

      // 4. verify correct result
      expect(result).toEqual({
        playlist: mockPlaylist,
      });
    });

    it("should handle playlist creation failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Playlist",
        description: "A new playlist",
        addedSongs: [],
      };

      mockPlaylistModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      await expect(createNewPlaylist(params)).rejects.toThrow("Failed to create playlist");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to create playlist");
    });

    it("should handle song update failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        title: "New Playlist",
        description: "A new playlist",
        addedSongs: [mockSongId],
      };

      mockSongModel.find.mockResolvedValue([mockSong]);
      mockPlaylistModel.create.mockResolvedValue(mockPlaylist as any);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: false });

      // ==================== Act & Assert ====================
      await expect(createNewPlaylist(params)).rejects.toThrow("Failed to add songs to playlist");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(false, 500, "Failed to add songs to playlist");
    });
  });

  describe("updatePlaylistById", () => {
    it("should update playlist without removing songs successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        playlistId: mockPlaylistId,
        userId: mockUserId,
        title: "Updated Playlist",
        description: "Updated description",
        removedSongs: [],
      };

      mockPlaylistModel.findOneAndUpdate.mockResolvedValue(mockPlaylist);

      // ==================== Act ====================
      const result = await updatePlaylistById(params);

      // ==================== Assert Process ====================
      // 1. verify playlist update
      expect(mockPlaylistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPlaylistId, user: mockUserId },
        { $set: { title: "Updated Playlist", description: "Updated description" } },
        { new: true }
      );

      // 2. verify no song operations
      expect(mockSongModel.find).not.toHaveBeenCalled();
      expect(mockSongModel.updateMany).not.toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        playlist: mockPlaylist,
      });
    });

    it("should update playlist with removing songs successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        playlistId: mockPlaylistId,
        userId: mockUserId,
        title: "Updated Playlist",
        removedSongs: [mockSongId],
      };

      mockSongModel.find.mockResolvedValue([mockSong]);
      mockPlaylistModel.findOneAndUpdate.mockResolvedValue(mockPlaylist);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: true });

      // ==================== Act ====================
      const result = await updatePlaylistById(params);

      // ==================== Assert Process ====================
      // 1. verify song lookup
      expect(mockSongModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockSongId] },
      });

      // 2. verify playlist update with song removal
      expect(mockPlaylistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPlaylistId, user: mockUserId },
        {
          $set: { title: "Updated Playlist" },
          $pull: { songs: { $in: [mockSongId] } },
          $inc: {
            "stats.totalSongCount": -1,
            "stats.totalSongDuration": -180,
          },
        },
        { new: true }
      );

      // 3. verify song update
      expect(mockSongModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [mockSongId] } },
        {
          $pull: {
            playlistFor: mockPlaylistId,
          },
        }
      );

      // 4. verify correct result
      expect(result).toEqual({
        playlist: mockPlaylist,
      });
    });

    it("should handle songs not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        playlistId: mockPlaylistId,
        userId: mockUserId,
        title: "Updated Playlist",
        removedSongs: [mockSongId],
      };

      mockSongModel.find.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(updatePlaylistById(params)).rejects.toThrow("Songs not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Songs not found");
    });

    it("should handle playlist not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        playlistId: mockPlaylistId,
        userId: mockUserId,
        title: "Updated Playlist",
        removedSongs: [],
      };

      mockPlaylistModel.findOneAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(updatePlaylistById(params)).rejects.toThrow(
        "Playlist not found or access denied"
      );

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Playlist not found or access denied");
    });

    it("should handle song update failure", async () => {
      // ==================== Arrange ====================
      const params = {
        playlistId: mockPlaylistId,
        userId: mockUserId,
        title: "Updated Playlist",
        removedSongs: [mockSongId],
      };

      mockSongModel.find.mockResolvedValue([mockSong]);
      mockPlaylistModel.findOneAndUpdate.mockResolvedValue(mockPlaylist);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: false });

      // ==================== Act & Assert ====================
      await expect(updatePlaylistById(params)).rejects.toThrow("Failed to update songs");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(false, 500, "Failed to update songs");
    });
  });

  describe("deletePlaylistById", () => {
    it("should delete playlist without target playlist successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockPlaylistModel.findOneAndDelete.mockResolvedValue(mockPlaylist);

      // ==================== Act ====================
      const result = await deletePlaylistById(params);

      // ==================== Assert Process ====================
      // 1. verify playlist lookup
      expect(mockPlaylistModel.findById).toHaveBeenCalledWith(mockPlaylistId);

      // 2. verify playlist deletion
      expect(mockPlaylistModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockPlaylistId,
        user: mockUserId,
      });

      // 3. verify no target playlist operations
      expect(mockPlaylistModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(mockSongModel.updateMany).not.toHaveBeenCalled();

      // 4. verify correct result
      expect(result).toEqual(mockPlaylist);
    });

    it("should delete playlist with target playlist successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
        targetPlaylistId: mockTargetPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockPlaylistModel.findByIdAndUpdate.mockResolvedValue(mockPlaylist);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: true });
      mockPlaylistModel.findOneAndDelete.mockResolvedValue(mockPlaylist);

      // ==================== Act ====================
      const result = await deletePlaylistById(params);

      // ==================== Assert Process ====================
      // 1. verify target playlist update
      expect(mockPlaylistModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTargetPlaylistId,
        {
          $addToSet: { songs: { $each: [mockSongObjectId] } },
          $inc: {
            "stats.totalSongCount": 1,
            "stats.totalSongDuration": 180,
          },
        },
        { new: true }
      );

      // 2. verify song update
      expect(mockSongModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [mockSongObjectId] } },
        {
          $addToSet: { playlistFor: mockTargetPlaylistId },
          $pull: { playlistFor: mockPlaylistId },
        },
        { new: true }
      );

      // 3. verify playlist deletion
      expect(mockPlaylistModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockPlaylistId,
        user: mockUserId,
      });

      // 4. verify correct result
      expect(result).toEqual(mockPlaylist);
    });

    it("should handle playlist not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(deletePlaylistById(params)).rejects.toThrow("The playlist is not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "The playlist is not found");
    });

    it("should handle target playlist not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
        targetPlaylistId: mockTargetPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockPlaylistModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(deletePlaylistById(params)).rejects.toThrow("Target playlist not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Target playlist not found");
    });

    it("should handle song update failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
        targetPlaylistId: mockTargetPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockPlaylistModel.findByIdAndUpdate.mockResolvedValue(mockPlaylist);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: false });

      // ==================== Act & Assert ====================
      await expect(deletePlaylistById(params)).rejects.toThrow(
        "Failed to add target playlist ID to songs's playlistFor property"
      );

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(
        false,
        500,
        "Failed to add target playlist ID to songs's playlistFor property"
      );
    });

    it("should handle playlist deletion failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        currentPlaylistId: mockPlaylistId,
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockPlaylistModel.findOneAndDelete.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(deletePlaylistById(params)).rejects.toThrow(
        "Playlist not found or access denied"
      );

      // ==================== Assert Process ====================
      // First call: playlist exists check (passes)
      // Second call: deletion failure check (fails)
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockPlaylist,
        404,
        "The playlist is not found"
      );
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        false,
        404,
        "Playlist not found or access denied"
      );
    });
  });
});
