import UserModel from "../../../src/models/user.model";
import SongModel from "../../../src/models/song.model";
import AlbumModel from "../../../src/models/album.model";
import StatsModel from "../../../src/models/stats.model";
import HistoryModel from "../../../src/models/history.model";
import PlaybackModel from "../../../src/models/playback.model";
import PlaylistModel from "../../../src/models/playlist.model";
import MusicianModel from "../../../src/models/musician.model";
import VerificationModel from "../../../src/models/verification.model";
import {
  getProfileUserInfo,
  getProfileCollectionsInfo,
  updateUserInfoById,
  updateUserPassword,
  resetUserPassword,
  changeUserPassword,
  deregisterUserAccount,
} from "../../../src/services/user.service";
import { sendEmail } from "../../../src/services/verification.service";
import { ProfileCollections } from "@joytify/shared-types/constants";
import { compareHashValue } from "../../../src/utils/bcrypt.util";
import { getPaginatedDocs } from "../../../src/utils/mongoose.util";
import { verifyToken, VerificationTokenSignOptions } from "../../../src/utils/jwt.util";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/album.model");
jest.mock("../../../src/models/stats.model");
jest.mock("../../../src/models/history.model");
jest.mock("../../../src/models/playback.model");
jest.mock("../../../src/models/playlist.model");
jest.mock("../../../src/models/musician.model");
jest.mock("../../../src/models/verification.model");
jest.mock("../../../src/services/verification.service");
jest.mock("../../../src/utils/bcrypt.util");
jest.mock("../../../src/utils/mongoose.util");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/utils/app-assert.util");
jest.mock("../../../src/templates/password-changed.template");
jest.mock("../../../src/constants/env-validate.constant");

// Mock template functions
jest.mock("../../../src/templates/password-changed.template", () => ({
  JoytifyPasswordChangedEmail: jest.fn().mockReturnValue("password-changed-template" as any),
}));

// Import mocked template functions after mocking
import { JoytifyPasswordChangedEmail } from "../../../src/templates/password-changed.template";

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockAlbumModel = AlbumModel as jest.Mocked<typeof AlbumModel>;
const mockStatsModel = StatsModel as jest.Mocked<typeof StatsModel>;
const mockHistoryModel = HistoryModel as jest.Mocked<typeof HistoryModel>;
const mockPlaybackModel = PlaybackModel as jest.Mocked<typeof PlaybackModel>;
const mockPlaylistModel = PlaylistModel as jest.Mocked<typeof PlaylistModel>;
const mockMusicianModel = MusicianModel as jest.Mocked<typeof MusicianModel>;
const mockVerificationModel = VerificationModel as jest.Mocked<typeof VerificationModel>;
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockCompareHashValue = compareHashValue as jest.MockedFunction<typeof compareHashValue>;
const mockGetPaginatedDocs = getPaginatedDocs as jest.MockedFunction<typeof getPaginatedDocs>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;
const mockJoytifyPasswordChangedEmail = JoytifyPasswordChangedEmail as jest.MockedFunction<
  typeof JoytifyPasswordChangedEmail
>;

describe("User Service", () => {
  // Mock data constants
  const mockUserId = "user-id-123";
  const mockEmail = "test@example.com";
  const mockPassword = "hashed-password";
  const mockNewPassword = "new-password";
  const mockToken = "verification-token";
  const mockSessionId = "session-id-123";

  const mockUserDoc = {
    _id: mockUserId,
    email: mockEmail,
    password: mockPassword,
    username: "testuser",
    profileImage: "profile.jpg",
    playlists: ["playlist-1", "playlist-2"],
    songs: ["song-1", "song-2"],
    albums: ["album-1"],
    following: ["musician-1"],
    personalInfo: {
      gender: "gender-id",
      country: "country-id",
      dateOfBirth: new Date("1990-01-01"),
    },
    userPreferences: {
      notifications: {
        monthlyStatistic: true,
        followingArtistUpdate: true,
        systemAnnouncement: true,
      },
    },
    omitPassword: jest.fn().mockReturnValue({
      _id: mockUserId,
      email: mockEmail,
      username: "testuser",
    }),
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockVerificationDoc = {
    _id: "verification-id",
    email: mockEmail,
    session: mockSessionId,
    type: "password_reset",
    deleteOne: jest.fn(),
  };

  beforeEach(() => {
    // reset all mocks
    jest.clearAllMocks();

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });

    // Setup common mock returns
    mockSendEmail.mockResolvedValue(undefined);
    mockJoytifyPasswordChangedEmail.mockReturnValue("email-template" as any);
  });

  describe("getProfileUserInfo", () => {
    it("should get profile user info successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup user query chain
      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: mockUserId,
          email: mockEmail,
          playlists: [{ title: "Playlist 1", imageUrl: "cover1.jpg" }],
          songs: [{ title: "Song 1", description: "Artist 1" }],
          albums: [{ title: "Album 1", imageUrl: "cover2.jpg" }],
          following: [{ title: "Musician 1", imageUrl: "cover3.jpg" }],
        }),
      };

      mockUserModel.findById.mockReturnValue(mockQueryChain as any);

      // Mock count operations
      mockPlaylistModel.countDocuments.mockResolvedValue(5);
      mockSongModel.countDocuments.mockResolvedValue(10);
      mockAlbumModel.countDocuments.mockResolvedValue(3);
      mockMusicianModel.countDocuments.mockResolvedValue(7);

      // ==================== Act ====================
      // 1. get profile user info
      const result = await getProfileUserInfo(mockUserId, 1);

      // ==================== Assert Process ====================
      // 1. verify user query was executed
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockQueryChain.populate).toHaveBeenCalledTimes(5);
      expect(mockQueryChain.select).toHaveBeenCalledWith("-password");

      // 2. verify counts were retrieved
      expect(mockPlaylistModel.countDocuments).toHaveBeenCalled();
      expect(mockSongModel.countDocuments).toHaveBeenCalled();
      expect(mockAlbumModel.countDocuments).toHaveBeenCalled();
      expect(mockMusicianModel.countDocuments).toHaveBeenCalled();

      // 3. verify correct result structure
      expect(result).toEqual({
        _id: mockUserId,
        email: mockEmail,
        playlists: {
          docs: [{ title: "Playlist 1", imageUrl: "cover1.jpg" }],
          totalDocs: 5,
        },
        songs: {
          docs: [{ title: "Song 1", description: "Artist 1" }],
          totalDocs: 10,
        },
        albums: {
          docs: [{ title: "Album 1", imageUrl: "cover2.jpg" }],
          totalDocs: 3,
        },
        following: {
          docs: [{ title: "Musician 1", imageUrl: "cover3.jpg" }],
          totalDocs: 7,
        },
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };

      mockUserModel.findById.mockReturnValue(mockQueryChain as any);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(getProfileUserInfo(mockUserId, 1)).rejects.toThrow("User not found");
    });
  });

  describe("getProfileCollectionsInfo", () => {
    it("should get playlists collection successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup paginated docs mock for playlists
      const mockPaginatedResult = {
        docs: [{ title: "Playlist 1", imageUrl: "cover1.jpg" }],
        totalDocs: 5,
        page: 1,
      };

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        remapFields: jest.fn().mockReturnThis(),
        forPagination: jest.fn().mockResolvedValue(mockPaginatedResult),
      };

      mockGetPaginatedDocs.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      // 1. get playlists collection
      const result = await getProfileCollectionsInfo(mockUserId, 1, ProfileCollections.PLAYLISTS);

      // ==================== Assert Process ====================
      // 1. verify getPaginatedDocs was called with correct parameters
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: PlaylistModel,
        filter: { user: mockUserId, default: false, privacy: "public" },
        limit: { initial: expect.any(Number), load: expect.any(Number) },
        page: 1,
      });

      // 2. verify query chain methods were called
      expect(mockQueryChain.select).toHaveBeenCalledWith("title coverImage");
      expect(mockQueryChain.remapFields).toHaveBeenCalledWith({ coverImage: "imageUrl" });
      expect(mockQueryChain.forPagination).toHaveBeenCalledWith(1);

      // 3. verify correct result
      expect(result).toEqual({ docs: mockPaginatedResult });
    });

    it("should get songs collection successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup paginated docs mock for songs
      const mockPaginatedResult = {
        docs: [{ title: "Song 1", description: "Artist 1", imageUrl: "cover1.jpg" }],
        totalDocs: 10,
        page: 1,
      };

      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        remapFields: jest.fn().mockReturnThis(),
        forPagination: jest.fn().mockResolvedValue(mockPaginatedResult),
      };

      mockGetPaginatedDocs.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      // 1. get songs collection
      const result = await getProfileCollectionsInfo(mockUserId, 1, ProfileCollections.SONGS);

      // ==================== Assert Process ====================
      // 1. verify getPaginatedDocs was called with correct parameters
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: SongModel,
        filter: { creator: mockUserId, "ownership.isPlatformOwned": false },
        limit: { initial: expect.any(Number), load: expect.any(Number) },
        page: 1,
      });

      // 2. verify query chain methods were called
      expect(mockQueryChain.populate).toHaveBeenCalledWith({
        path: "artist",
        select: "name",
        transform: expect.any(Function),
      });
      expect(mockQueryChain.select).toHaveBeenCalledWith("title artist imageUrl");
      expect(mockQueryChain.remapFields).toHaveBeenCalledWith({ artist: "description" });
      expect(mockQueryChain.forPagination).toHaveBeenCalledWith(1);

      // 3. verify correct result
      expect(result).toEqual({ docs: mockPaginatedResult });
    });

    it("should get albums collection successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup user with albums
      mockUserModel.findById.mockResolvedValue({
        albums: ["album-1", "album-2"],
      } as any);

      const mockPaginatedResult = {
        docs: [{ title: "Album 1", imageUrl: "cover1.jpg" }],
        totalDocs: 2,
        page: 1,
      };

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        remapFields: jest.fn().mockReturnThis(),
        forPagination: jest.fn().mockResolvedValue(mockPaginatedResult),
      };

      mockGetPaginatedDocs.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      // 1. get albums collection
      const result = await getProfileCollectionsInfo(mockUserId, 1, ProfileCollections.ALBUMS);

      // ==================== Assert Process ====================
      // 1. verify user was found
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);

      // 2. verify albums query was executed
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: AlbumModel,
        filter: { _id: { $in: ["album-1", "album-2"] } },
        limit: { initial: expect.any(Number), load: expect.any(Number) },
        page: 1,
      });

      // 3. verify correct result
      expect(result).toEqual({ docs: mockPaginatedResult });
    });

    it("should get following collection successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup paginated docs mock for following
      const mockPaginatedResult = {
        docs: [{ title: "Musician 1", description: "Artist", imageUrl: "cover1.jpg" }],
        totalDocs: 7,
        page: 1,
      };

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        remapFields: jest.fn().mockReturnThis(),
        forPagination: jest.fn().mockResolvedValue(mockPaginatedResult),
      };

      mockGetPaginatedDocs.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      // 1. get following collection
      const result = await getProfileCollectionsInfo(mockUserId, 1, ProfileCollections.FOLLOWING);

      // ==================== Assert Process ====================
      // 1. verify getPaginatedDocs was called with correct parameters
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: MusicianModel,
        filter: { followers: { $in: [mockUserId] } },
        limit: { initial: expect.any(Number), load: expect.any(Number) },
        page: 1,
      });

      // 2. verify query chain methods were called
      expect(mockQueryChain.select).toHaveBeenCalledWith("name coverImage roles");
      expect(mockQueryChain.remapFields).toHaveBeenCalledWith({
        name: "title",
        roles: "description",
        coverImage: "imageUrl",
      });
      expect(mockQueryChain.forPagination).toHaveBeenCalledWith(1);

      // 3. verify correct result
      expect(result).toEqual({ docs: mockPaginatedResult });
    });

    it("should throw error when user not found for albums collection", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockUserModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(
        getProfileCollectionsInfo(mockUserId, 1, ProfileCollections.ALBUMS)
      ).rejects.toThrow("User not found");
    });
  });

  describe("updateUserInfoById", () => {
    it("should update user info successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup update parameters
      const updateParams = {
        userId: mockUserId,
        username: "newusername",
        profileImage: "new-profile.jpg",
        gender: "new-gender-id",
        country: "new-country-id",
        dateOfBirth: "1995-01-01",
        monthlyStatistic: false,
        followingArtistUpdate: false,
        systemAnnouncement: false,
      };

      const mockUpdatedUser = {
        ...mockUserDoc,
        username: "newusername",
        omitPassword: jest.fn().mockReturnValue({ _id: mockUserId, username: "newusername" }),
      };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser as any);

      // ==================== Act ====================
      // 1. update user info
      const result = await updateUserInfoById(updateParams);

      // ==================== Assert Process ====================
      // 1. verify user update was called with correct parameters
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          username: "newusername",
          profileImage: "new-profile.jpg",
          $set: {
            "personalInfo.gender": "new-gender-id",
            "personalInfo.country": "new-country-id",
            "personalInfo.dateOfBirth": "1995-01-01",
            "userPreferences.notifications.monthlyStatistic": false,
            "userPreferences.notifications.followingArtistUpdate": false,
            "userPreferences.notifications.systemAnnouncement": false,
          },
        },
        { new: true }
      );

      // 2. verify omitPassword was called
      expect(mockUpdatedUser.omitPassword).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        user: { _id: mockUserId, username: "newusername" },
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      const updateParams = {
        userId: mockUserId,
        username: "newusername",
      };

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(updateUserInfoById(updateParams)).rejects.toThrow("User not found");
    });
  });

  describe("updateUserPassword", () => {
    it("should update password successfully and send email", async () => {
      // ==================== Arrange ====================
      // 1. setup password update scenario
      const updateParams = {
        user: mockUserDoc as any,
        currentPassword: "old-password",
        newPassword: mockNewPassword,
      };

      mockCompareHashValue.mockResolvedValue(true);

      // ==================== Act ====================
      // 1. update user password
      const result = await updateUserPassword(updateParams);

      // ==================== Assert Process ====================
      // 1. verify password comparison
      expect(mockCompareHashValue).toHaveBeenCalledWith("old-password", mockPassword);

      // 2. verify password was updated and user saved
      expect(mockUserDoc.password).toBe(mockNewPassword);
      expect(mockUserDoc.save).toHaveBeenCalled();

      // 3. verify email template and sending
      expect(mockJoytifyPasswordChangedEmail).toHaveBeenCalledWith({ username: "test" });
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: mockEmail,
        subject: "Your Joytify password has been changed",
        content: "email-template",
      });

      // 4. verify correct result
      expect(result).toEqual({
        updatedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should throw error when current password is invalid", async () => {
      // ==================== Arrange ====================
      // 1. setup invalid password scenario
      const updateParams = {
        user: mockUserDoc as any,
        currentPassword: "wrong-password",
        newPassword: mockNewPassword,
      };

      mockCompareHashValue.mockResolvedValue(false);

      // ==================== Act & Assert ====================
      // 1. expect error for invalid current password
      await expect(updateUserPassword(updateParams)).rejects.toThrow("Invalid current password");
    });
  });

  describe("resetUserPassword", () => {
    it("should reset password successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup password reset scenario
      const resetParams = {
        token: mockToken,
        currentPassword: "dummy", // not used in reset
        newPassword: mockNewPassword,
      };

      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockSessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockUserModel.findOne.mockResolvedValue(mockUserDoc as any);
      mockCompareHashValue.mockResolvedValue(true);

      // ==================== Act ====================
      // 1. reset user password
      const result = await resetUserPassword(resetParams);

      // ==================== Assert Process ====================
      // 1. verify token validation
      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken, {
        secret: VerificationTokenSignOptions.secret,
      });

      // 2. verify verification document lookup
      expect(mockVerificationModel.findOne).toHaveBeenCalledWith({
        session: mockSessionId,
        type: "password_reset",
      });

      // 3. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });

      // 4. verify verification document deletion
      expect(mockVerificationDoc.deleteOne).toHaveBeenCalled();

      // 5. verify correct result
      expect(result).toEqual({
        user: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should throw error when token is invalid", async () => {
      // ==================== Arrange ====================
      // 1. setup invalid token scenario
      mockVerifyToken.mockResolvedValue({ payload: null } as any);

      // ==================== Act & Assert ====================
      // 1. expect error for invalid token
      await expect(
        resetUserPassword({ token: "invalid-token", currentPassword: "", newPassword: "" })
      ).rejects.toThrow("Invalid or expired token");
    });

    it("should throw error when verification document not found", async () => {
      // ==================== Arrange ====================
      // 1. setup verification not found scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockSessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for missing verification
      await expect(
        resetUserPassword({ token: mockToken, currentPassword: "", newPassword: "" })
      ).rejects.toThrow("Invalid or expired token");
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockSessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockUserModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for missing user
      await expect(
        resetUserPassword({ token: mockToken, currentPassword: "", newPassword: "" })
      ).rejects.toThrow("Invalid or expired token");
    });

    it("should throw error when password update fails", async () => {
      // ==================== Arrange ====================
      // 1. setup password update failure scenario
      const resetParams = {
        token: mockToken,
        currentPassword: "wrong-password",
        newPassword: mockNewPassword,
      };

      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockSessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockUserModel.findOne.mockResolvedValue(mockUserDoc as any);
      mockCompareHashValue.mockResolvedValue(false); // password mismatch

      // ==================== Act & Assert ====================
      // 1. expect error for password update failure
      await expect(resetUserPassword(resetParams)).rejects.toThrow("Invalid current password");
    });
  });

  describe("changeUserPassword", () => {
    it("should change password successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup password change scenario
      const changeParams = {
        userId: mockUserId,
        currentPassword: "old-password",
        newPassword: mockNewPassword,
      };

      // Create a fresh mock user for this test to avoid password mutation from previous tests
      const freshMockUser = {
        ...mockUserDoc,
        password: mockPassword, // Reset to original password
        save: jest.fn(),
        omitPassword: jest.fn().mockReturnValue({
          _id: mockUserId,
          email: mockEmail,
          username: "testuser",
        }),
      };

      mockUserModel.findById.mockResolvedValue(freshMockUser as any);
      mockCompareHashValue.mockResolvedValue(true);

      // ==================== Act ====================
      // 1. change user password
      const result = await changeUserPassword(changeParams);

      // ==================== Assert Process ====================
      // 1. verify user lookup
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);

      // 2. verify password was updated
      expect(mockCompareHashValue).toHaveBeenCalledWith("old-password", mockPassword);
      expect(freshMockUser.save).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        user: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockUserModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(
        changeUserPassword({ userId: mockUserId, currentPassword: "", newPassword: "" })
      ).rejects.toThrow("User not found");
    });
  });

  describe("deregisterUserAccount", () => {
    it("should deregister account successfully with song deletion", async () => {
      // ==================== Arrange ====================
      // 1. setup deregistration with song deletion scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1", "song-2"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.findByIdAndDelete.mockResolvedValue({ _id: "song-1" } as any);
      mockPlaybackModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockHistoryModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockStatsModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify user lookup
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);

      // 2. verify songs deletion
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith("song-1");
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith("song-2");

      // 3. verify related data deletion
      expect(mockPlaybackModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockHistoryModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockStatsModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });

      // 4. verify user account deletion
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 5. verify correct result
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should deregister account successfully with song ownership transfer", async () => {
      // ==================== Arrange ====================
      // 1. setup deregistration with ownership transfer scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: false,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1", "song-2"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: true } as any);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify user lookup
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);

      // 2. verify songs ownership transfer
      expect(mockSongModel.updateMany).toHaveBeenCalledWith(
        { creator: mockUserId },
        { $set: { "ownership.isPlatformOwned": true } }
      );

      // 3. verify user account deletion
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 4. verify correct result
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should deregister account successfully when user has no songs", async () => {
      // ==================== Arrange ====================
      // 1. setup user with no songs scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserNoSongs = {
        ...mockUserDoc,
        songs: [],
      };

      mockUserModel.findById.mockResolvedValue(mockUserNoSongs as any);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify no song-related operations were performed
      expect(mockSongModel.findByIdAndDelete).not.toHaveBeenCalled();
      expect(mockSongModel.updateMany).not.toHaveBeenCalled();

      // 2. verify user account deletion
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockUserModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(
        deregisterUserAccount({ userId: mockUserId, shouldDeleteSongs: true })
      ).rejects.toThrow("User not found");
    });

    it("should throw error when user deletion fails", async () => {
      // ==================== Arrange ====================
      // 1. setup user deletion failure scenario
      const mockUserNoSongs = {
        ...mockUserDoc,
        songs: [],
      };

      mockUserModel.findById.mockResolvedValue(mockUserNoSongs as any);
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for failed user deletion
      await expect(
        deregisterUserAccount({ userId: mockUserId, shouldDeleteSongs: true })
      ).rejects.toThrow(`User ${mockUserId} not found in deregistration process`);
    });

    it("should handle song deletion failure gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup song deletion failure scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.findByIdAndDelete.mockResolvedValue(null); // song deletion fails
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account (should handle song deletion failure gracefully)
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify song deletion was attempted
      expect(mockSongModel.findByIdAndDelete).toHaveBeenCalledWith("song-1");

      // 2. verify user account was still deleted despite song deletion failure
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result (user deletion succeeds despite song deletion failure)
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should handle playback deletion failure gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup playback deletion failure scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.findByIdAndDelete.mockResolvedValue({ _id: "song-1" } as any);
      mockPlaybackModel.deleteMany.mockResolvedValue({ acknowledged: false } as any); // deletion fails
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account (should handle playback deletion failure gracefully)
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify playback deletion was attempted
      expect(mockPlaybackModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });

      // 2. verify user account was still deleted despite playback deletion failure
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result (user deletion succeeds despite playback deletion failure)
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should handle history deletion failure gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup history deletion failure scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.findByIdAndDelete.mockResolvedValue({ _id: "song-1" } as any);
      mockPlaybackModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockHistoryModel.deleteMany.mockResolvedValue({ acknowledged: false } as any); // deletion fails
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account (should handle history deletion failure gracefully)
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify history deletion was attempted
      expect(mockHistoryModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });

      // 2. verify user account was still deleted despite history deletion failure
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result (user deletion succeeds despite history deletion failure)
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should handle stats deletion failure gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup stats deletion failure scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.findByIdAndDelete.mockResolvedValue({ _id: "song-1" } as any);
      mockPlaybackModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockHistoryModel.deleteMany.mockResolvedValue({ acknowledged: true } as any);
      mockStatsModel.deleteMany.mockResolvedValue({ acknowledged: false } as any); // deletion fails
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account (should handle stats deletion failure gracefully)
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify stats deletion was attempted
      expect(mockStatsModel.deleteMany).toHaveBeenCalledWith({ user: mockUserId });

      // 2. verify user account was still deleted despite stats deletion failure
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result (user deletion succeeds despite stats deletion failure)
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });

    it("should handle song ownership update failure gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup song ownership update failure scenario
      const deregisterParams = {
        userId: mockUserId,
        shouldDeleteSongs: false,
      };

      const mockUserWithSongs = {
        ...mockUserDoc,
        songs: ["song-1"],
      };

      mockUserModel.findById.mockResolvedValue(mockUserWithSongs as any);
      mockSongModel.updateMany.mockResolvedValue({ acknowledged: false } as any); // update fails
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUserDoc as any);

      // ==================== Act ====================
      // 1. deregister user account (should handle ownership update failure gracefully)
      const result = await deregisterUserAccount(deregisterParams);

      // ==================== Assert Process ====================
      // 1. verify ownership update was attempted
      expect(mockSongModel.updateMany).toHaveBeenCalledWith(
        { creator: mockUserId },
        { $set: { "ownership.isPlatformOwned": true } }
      );

      // 2. verify user account was still deleted despite ownership update failure
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);

      // 3. verify correct result (user deletion succeeds despite ownership update failure)
      expect(result).toEqual({
        deletedUser: { _id: mockUserId, email: mockEmail, username: "testuser" },
      });
    });
  });
});
