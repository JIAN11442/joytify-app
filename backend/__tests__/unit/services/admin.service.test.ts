import UserModel from "../../../src/models/user.model";
import SongModel from "../../../src/models/song.model";
import PlaylistModel from "../../../src/models/playlist.model";
import NotificationModel from "../../../src/models/notification.model";
import {
  deleteTargetNotification,
  initializeUserNotifications,
  createSystemAnnouncement,
  recalculatePlaylistStats,
  removePlaylistStats,
  deleteSongById,
  updateCollectionPaletee,
} from "../../../src/services/admin.service";
import { NotificationFilterOptions } from "@joytify/types/constants";
import usePalette from "../../../src/hooks/paletee.hook";

// Mock all external dependencies
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/playlist.model");
jest.mock("../../../src/models/notification.model");
jest.mock("../../../src/hooks/paletee.hook");

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockPlaylistModel = PlaylistModel as jest.Mocked<typeof PlaylistModel>;
const mockNotificationModel = NotificationModel as jest.Mocked<typeof NotificationModel>;
const mockUsePalette = usePalette as jest.MockedFunction<typeof usePalette>;

describe("Admin Service", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
  });

  describe("deleteTargetNotification", () => {
    it("should delete notification and remove it from all users", async () => {
      // ==================== Arrange ====================
      // prepare mock data for notification deletion
      const notificationId = "6507f1a456789abcdef12345";
      const mockUpdateResult = { modifiedCount: 3 };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);
      mockNotificationModel.findByIdAndDelete.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute deleteTargetNotification
      const result = await deleteTargetNotification(notificationId);

      // ==================== Assert ====================
      // verify notification is deleted and users are updated
      expect(result).toEqual({ modifiedCount: 3 });
      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { "notifications.id": notificationId },
        { $pull: { notifications: { id: notificationId } } }
      );
      expect(mockNotificationModel.findByIdAndDelete).toHaveBeenCalledWith(notificationId);
    });

    it("should handle case when no users have the notification", async () => {
      // ==================== Arrange ====================
      // prepare mock data for no users with notification
      const notificationId = "6507f1a456789abcdef12345";
      const mockUpdateResult = { modifiedCount: 0 };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);
      mockNotificationModel.findByIdAndDelete.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute deleteTargetNotification
      const result = await deleteTargetNotification(notificationId);

      // ==================== Assert ====================
      // verify result shows no users were modified
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { "notifications.id": notificationId },
        { $pull: { notifications: { id: notificationId } } }
      );
      expect(mockNotificationModel.findByIdAndDelete).toHaveBeenCalledWith(notificationId);
    });
  });

  describe("initializeUserNotifications", () => {
    it("should reset all user notifications to unread and unviewed", async () => {
      // ==================== Arrange ====================
      // prepare mock data for notification initialization
      const mockUpdateResult = { modifiedCount: 5 };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      // execute initializeUserNotifications
      const result = await initializeUserNotifications();

      // ==================== Assert ====================
      // verify notifications are reset for users with notifications
      expect(result).toEqual({ modifiedCount: 5 });
      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { "notifications.0": { $exists: true } },
        {
          $set: {
            "notifications.$[].viewed": false,
            "notifications.$[].read": false,
          },
        }
      );
    });

    it("should handle case when no users have notifications", async () => {
      // ==================== Arrange ====================
      // prepare mock data for no users with notifications
      const mockUpdateResult = { modifiedCount: 0 };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      // execute initializeUserNotifications
      const result = await initializeUserNotifications();

      // ==================== Assert ====================
      // verify result shows no users were modified
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { "notifications.0": { $exists: true } },
        {
          $set: {
            "notifications.$[].viewed": false,
            "notifications.$[].read": false,
          },
        }
      );
    });
  });

  describe("createSystemAnnouncement", () => {
    it("should create system announcement notification", async () => {
      // ==================== Arrange ====================
      // prepare mock data for system announcement
      const mockNotification = {
        _id: "6507f1a456789abcdef12345",
        type: NotificationFilterOptions.SYSTEM_ANNOUNCEMENT,
        systemAnnouncement: {
          date: "2024-01-15",
          startTime: "02:00",
          endTime: "04:00",
        },
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification as any);

      const params = {
        date: "2024-01-15",
        startTime: "02:00",
        endTime: "04:00",
      };

      // ==================== Act ====================
      // execute createSystemAnnouncement
      const result = await createSystemAnnouncement(params);

      // ==================== Assert ====================
      // verify system announcement is created
      expect(result).toEqual(mockNotification);
      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        type: NotificationFilterOptions.SYSTEM_ANNOUNCEMENT,
        systemAnnouncement: params,
      });
    });

    it("should throw error when notification creation fails", async () => {
      // ==================== Arrange ====================
      // prepare mock for failed notification creation
      mockNotificationModel.create.mockResolvedValue(null as any);

      const params = {
        date: "2024-01-15",
        startTime: "02:00",
        endTime: "04:00",
      };

      // ==================== Act & Assert ====================
      // verify error is thrown when notification creation fails
      await expect(createSystemAnnouncement(params)).rejects.toThrow(
        "Failed to create system announcement notification"
      );
      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        type: NotificationFilterOptions.SYSTEM_ANNOUNCEMENT,
        systemAnnouncement: params,
      });
    });
  });

  describe("recalculatePlaylistStats", () => {
    it("should recalculate stats for all playlists", async () => {
      // ==================== Arrange ====================
      // prepare mock data for playlist stats recalculation
      const mockPlaylists = [
        {
          _id: "playlist1",
          songs: [
            { _id: "song1", duration: 180 },
            { _id: "song2", duration: 240 },
          ],
        },
        {
          _id: "playlist2",
          songs: [{ _id: "song3", duration: 200 }],
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockPlaylistModel.find.mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(mockPlaylists);

      mockPlaylistModel.updateOne.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute recalculatePlaylistStats
      const result = await recalculatePlaylistStats();

      // ==================== Assert ====================
      // verify playlist stats are recalculated
      expect(result).toEqual({ modifiedCount: 2 });
      expect(mockPlaylistModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: "songs",
        select: "duration",
      });
      expect(mockPlaylistModel.updateOne).toHaveBeenCalledTimes(2);
      expect(mockPlaylistModel.updateOne).toHaveBeenCalledWith(
        { _id: "playlist1" },
        { $set: { stats: { totalSongCount: 2, totalSongDuration: 420 } } },
        { timestamps: false }
      );
      expect(mockPlaylistModel.updateOne).toHaveBeenCalledWith(
        { _id: "playlist2" },
        { $set: { stats: { totalSongCount: 1, totalSongDuration: 200 } } },
        { timestamps: false }
      );
    });

    it("should handle playlists with songs missing duration", async () => {
      // ==================== Arrange ====================
      // prepare mock data for playlists with missing duration
      const mockPlaylists = [
        {
          _id: "playlist1",
          songs: [
            { _id: "song1", duration: 180 },
            { _id: "song2" }, // missing duration
            { _id: "song3", duration: 240 },
          ],
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockPlaylistModel.find.mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(mockPlaylists);

      mockPlaylistModel.updateOne.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute recalculatePlaylistStats
      const result = await recalculatePlaylistStats();

      // ==================== Assert ====================
      // verify playlist stats handle missing duration correctly
      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockPlaylistModel.updateOne).toHaveBeenCalledWith(
        { _id: "playlist1" },
        { $set: { stats: { totalSongCount: 3, totalSongDuration: 420 } } },
        { timestamps: false }
      );
    });

    it("should handle empty playlists array", async () => {
      // ==================== Arrange ====================
      // prepare mock data for empty playlists
      const mockPlaylists: any[] = [];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      mockPlaylistModel.find.mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(mockPlaylists);

      // ==================== Act ====================
      // execute recalculatePlaylistStats
      const result = await recalculatePlaylistStats();

      // ==================== Assert ====================
      // verify empty playlists are handled correctly
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockPlaylistModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: "songs",
        select: "duration",
      });
      expect(mockPlaylistModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe("removePlaylistStats", () => {
    it("should remove stats field from all playlists", async () => {
      // ==================== Arrange ====================
      // prepare mock data for playlist stats removal
      const mockUpdateResult = { modifiedCount: 10 };

      mockPlaylistModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      // execute removePlaylistStats
      const result = await removePlaylistStats();

      // ==================== Assert ====================
      // verify stats field is removed from all playlists
      expect(result).toEqual({ modifiedCount: 10 });
      expect(mockPlaylistModel.updateMany).toHaveBeenCalledWith({}, { $unset: { stats: "" } });
    });

    it("should handle case when no playlists have stats", async () => {
      // ==================== Arrange ====================
      // prepare mock data for no playlists with stats
      const mockUpdateResult = { modifiedCount: 0 };

      mockPlaylistModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      // execute removePlaylistStats
      const result = await removePlaylistStats();

      // ==================== Assert ====================
      // verify result shows no playlists were modified
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockPlaylistModel.updateMany).toHaveBeenCalledWith({}, { $unset: { stats: "" } });
    });
  });

  describe("deleteSongById", () => {
    it("should delete song by ID", async () => {
      // ==================== Arrange ====================
      // prepare mock data for song deletion
      const songId = "6507f1a456789abcdef12345";
      const mockDeletedSong = {
        _id: songId,
        title: "Test Song",
        artist: "Test Artist",
      };

      mockSongModel.findByIdAndDelete.mockResolvedValue(mockDeletedSong as any);

      // ==================== Act ====================
      // execute deleteSongById
      const result = await deleteSongById(songId);

      // ==================== Assert ====================
      // verify song is deleted
      expect(result).toEqual({ deletedSong: mockDeletedSong });
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith(songId);
    });

    it("should throw error when song is not found", async () => {
      // ==================== Arrange ====================
      // prepare mock for song not found
      const songId = "6507f1a456789abcdef12345";

      mockSongModel.findByIdAndDelete.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // verify error is thrown when song not found
      await expect(deleteSongById(songId)).rejects.toThrow("Song not found or access denied");
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith(songId);
    });
  });

  describe("updateCollectionPaletee", () => {
    it("should update palette for song collection", async () => {
      // ==================== Arrange ====================
      // prepare mock data for song palette update
      const mockSongs = [
        { _id: "song1", imageUrl: "https://example.com/image1.jpg" },
        { _id: "song2", imageUrl: "https://example.com/image2.jpg" },
      ];

      const mockPalette = {
        vibrant: "#ff0000",
        darkVibrant: "#cc0000",
        lightVibrant: "#ff3333",
        muted: "#00ff00",
        darkMuted: "#00cc00",
        lightMuted: "#33ff33",
      };

      mockSongModel.find.mockResolvedValue(mockSongs as any);
      mockUsePalette.mockResolvedValue(mockPalette as any);
      mockSongModel.findByIdAndUpdate.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute updateCollectionPaletee for songs
      const result = await updateCollectionPaletee("song");

      // ==================== Assert ====================
      // verify song palettes are updated
      expect(result).toEqual({ modifiedCount: 2 });
      expect(mockSongModel.find).toHaveBeenCalledWith({
        imageUrl: { $exists: true },
      });
      expect(mockUsePalette).toHaveBeenCalledTimes(2);
      expect(mockUsePalette).toHaveBeenCalledWith("https://example.com/image1.jpg");
      expect(mockUsePalette).toHaveBeenCalledWith("https://example.com/image2.jpg");
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith("song1", {
        paletee: mockPalette,
      });
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith("song2", {
        paletee: mockPalette,
      });
    });

    it("should update palette for user collection", async () => {
      // ==================== Arrange ====================
      // prepare mock data for user palette update
      const mockUsers = [{ _id: "user1", profileImage: "https://example.com/profile1.jpg" }];

      const mockPalette = {
        vibrant: "#ff0000",
        darkVibrant: "#cc0000",
        lightVibrant: "#ff3333",
        muted: "#00ff00",
        darkMuted: "#00cc00",
        lightMuted: "#33ff33",
      };

      mockUserModel.find.mockResolvedValue(mockUsers as any);
      mockUsePalette.mockResolvedValue(mockPalette as any);
      mockUserModel.findByIdAndUpdate.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute updateCollectionPaletee for users
      const result = await updateCollectionPaletee("user");

      // ==================== Assert ====================
      // verify user palettes are updated
      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockUserModel.find).toHaveBeenCalledWith({
        profileImage: { $exists: true },
      });
      expect(mockUsePalette).toHaveBeenCalledWith("https://example.com/profile1.jpg");
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", {
        paletee: mockPalette,
      });
    });

    it("should handle documents without image fields", async () => {
      // ==================== Arrange ====================
      // prepare mock data for documents without images
      const mockSongs = [
        { _id: "song1", imageUrl: null },
        { _id: "song2" }, // no imageUrl field
      ];

      mockSongModel.find.mockResolvedValue(mockSongs as any);

      // ==================== Act ====================
      // execute updateCollectionPaletee for songs
      const result = await updateCollectionPaletee("song");

      // ==================== Assert ====================
      // verify documents without images are skipped
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockSongModel.find).toHaveBeenCalledWith({
        imageUrl: { $exists: true },
      });
      expect(mockUsePalette).not.toHaveBeenCalled();
      expect(mockSongModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should handle empty collection", async () => {
      // ==================== Arrange ====================
      // prepare mock data for empty collection
      const mockSongs: any[] = [];

      mockSongModel.find.mockResolvedValue(mockSongs);

      // ==================== Act ====================
      // execute updateCollectionPaletee for songs
      const result = await updateCollectionPaletee("song");

      // ==================== Assert ====================
      // verify empty collection is handled correctly
      expect(result).toEqual({ modifiedCount: 0 });
      expect(mockSongModel.find).toHaveBeenCalledWith({
        imageUrl: { $exists: true },
      });
      expect(mockUsePalette).not.toHaveBeenCalled();
      expect(mockSongModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw error for unsupported model", async () => {
      // ==================== Act & Assert ====================
      // verify error is thrown for unsupported model
      await expect(updateCollectionPaletee("unsupported" as any)).rejects.toThrow(
        "Unsupported model: unsupported"
      );
    });

    it("should handle palette generation errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare mock data with palette generation error
      const mockSongs = [
        { _id: "song1", imageUrl: "https://example.com/image1.jpg" },
        { _id: "song2", imageUrl: "https://example.com/image2.jpg" },
      ];

      mockSongModel.find.mockResolvedValue(mockSongs as any);
      mockUsePalette.mockRejectedValue(new Error("Palette generation failed"));
      mockSongModel.findByIdAndUpdate.mockResolvedValue({} as any);

      // ==================== Act & Assert ====================
      // verify palette generation errors are handled
      await expect(updateCollectionPaletee("song")).rejects.toThrow("Palette generation failed");
      expect(mockSongModel.find).toHaveBeenCalledWith({
        imageUrl: { $exists: true },
      });
      expect(mockUsePalette).toHaveBeenCalledWith("https://example.com/image1.jpg");
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle database errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare database error
      const dbError = new Error("Database connection failed");
      mockUserModel.updateMany.mockRejectedValue(dbError);

      // ==================== Act & Assert ====================
      // verify database errors are properly propagated
      await expect(deleteTargetNotification("notificationId")).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle palette generation errors in updateCollectionPaletee", async () => {
      // ==================== Arrange ====================
      // prepare mock data with palette generation error
      const mockSongs = [{ _id: "song1", imageUrl: "https://example.com/image1.jpg" }];

      mockSongModel.find.mockResolvedValue(mockSongs as any);
      mockUsePalette.mockRejectedValue(new Error("Image processing failed"));

      // ==================== Act & Assert ====================
      // verify palette generation errors are handled
      await expect(updateCollectionPaletee("song")).rejects.toThrow("Image processing failed");
    });
  });

  describe("Integration scenarios", () => {
    it("should verify all service functions are properly exported and callable", async () => {
      // ==================== Act & Assert ====================
      // verify all service functions are properly exported and can be called
      expect(typeof deleteTargetNotification).toBe("function");
      expect(typeof initializeUserNotifications).toBe("function");
      expect(typeof createSystemAnnouncement).toBe("function");
      expect(typeof recalculatePlaylistStats).toBe("function");
      expect(typeof removePlaylistStats).toBe("function");
      expect(typeof deleteSongById).toBe("function");
      expect(typeof updateCollectionPaletee).toBe("function");

      // verify functions accept the correct parameters
      expect(deleteTargetNotification).toHaveLength(1);
      expect(initializeUserNotifications).toHaveLength(0);
      expect(createSystemAnnouncement).toHaveLength(1);
      expect(recalculatePlaylistStats).toHaveLength(0);
      expect(removePlaylistStats).toHaveLength(0);
      expect(deleteSongById).toHaveLength(1);
      expect(updateCollectionPaletee).toHaveLength(1);
    });

    it("should demonstrate complete admin workflow", async () => {
      // ==================== Arrange ====================
      // prepare comprehensive mock data for admin workflow
      const notificationId = "6507f1a456789abcdef12345";
      const songId = "6507f1a456789abcdef12346";

      // Mock for deleteTargetNotification
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 2 });
      mockNotificationModel.findByIdAndDelete.mockResolvedValue({} as any);

      // Mock for createSystemAnnouncement
      const mockNotification = {
        _id: "notification1",
        type: NotificationFilterOptions.SYSTEM_ANNOUNCEMENT,
        systemAnnouncement: { date: "2024-01-15", startTime: "02:00", endTime: "04:00" },
      };
      mockNotificationModel.create.mockResolvedValue(mockNotification as any);

      // Mock for recalculatePlaylistStats
      const mockPlaylists = [{ _id: "playlist1", songs: [{ duration: 180 }, { duration: 240 }] }];
      const mockQuery = { populate: jest.fn().mockResolvedValue(mockPlaylists) };
      mockPlaylistModel.find.mockReturnValue(mockQuery);
      mockPlaylistModel.updateOne.mockResolvedValue({} as any);

      // Mock for deleteSongById
      const mockDeletedSong = { _id: songId, title: "Test Song" };
      mockSongModel.findByIdAndDelete.mockResolvedValue(mockDeletedSong as any);

      // Mock for updateCollectionPaletee
      const mockSongs = [{ _id: "song1", imageUrl: "https://example.com/image.jpg" }];
      mockSongModel.find.mockResolvedValue(mockSongs as any);
      mockUsePalette.mockResolvedValue({
        vibrant: "#ff0000",
        darkVibrant: "#cc0000",
        lightVibrant: "#ff3333",
        muted: "#00ff00",
        darkMuted: "#00cc00",
        lightMuted: "#33ff33",
      } as any);
      mockSongModel.findByIdAndUpdate.mockResolvedValue({} as any);

      // ==================== Act ====================
      // execute complete admin workflow
      const deleteResult = await deleteTargetNotification(notificationId);
      const announcementResult = await createSystemAnnouncement({
        date: "2024-01-15",
        startTime: "02:00",
        endTime: "04:00",
      });
      const statsResult = await recalculatePlaylistStats();
      const songResult = await deleteSongById(songId);
      const paletteResult = await updateCollectionPaletee("song");

      // ==================== Assert ====================
      // verify all admin operations work together correctly
      expect(deleteResult).toEqual({ modifiedCount: 2 });
      expect(announcementResult).toEqual(mockNotification);
      expect(statsResult).toEqual({ modifiedCount: 1 });
      expect(songResult).toEqual({ deletedSong: mockDeletedSong });
      expect(paletteResult).toEqual({ modifiedCount: 1 });

      // verify all models were queried appropriately
      expect(mockUserModel.updateMany).toHaveBeenCalled();
      expect(mockNotificationModel.findByIdAndDelete).toHaveBeenCalled();
      expect(mockNotificationModel.create).toHaveBeenCalled();
      expect(mockPlaylistModel.find).toHaveBeenCalled();
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalled();
      expect(mockSongModel.find).toHaveBeenCalled();
    });
  });
});
