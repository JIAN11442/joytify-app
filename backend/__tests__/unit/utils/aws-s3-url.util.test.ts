import { nanoid } from "nanoid";
import s3 from "../../../src/config/aws-s3.config";
import { UploadFolder, FileExtension } from "@joytify/shared-types/constants";
import {
  generateUploadUrl,
  deleteAwsFileUrl,
  deleteAwsFileUrlOnModel,
} from "../../../src/utils/aws-s3-url.util";
import awsUrlParser from "../../../src/utils/aws-url-parser.util";

// Mock external dependencies
jest.mock("nanoid");
jest.mock("../../../src/config/aws-s3.config");
jest.mock("../../../src/utils/aws-url-parser.util");
jest.mock("../../../src/constants/env-validate.constant", () => ({
  AWS_BUCKET_NAME: "test-bucket",
}));

const mockNanoid = nanoid as jest.MockedFunction<typeof nanoid>;
const mockS3 = s3 as jest.Mocked<typeof s3>;
const mockAwsUrlParser = awsUrlParser as jest.MockedFunction<typeof awsUrlParser>;

describe("AWS S3 URL Util", () => {
  // ==================== Arrange ====================
  // setup mocks and spies for all tests
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("generateUploadUrl", () => {
    it("should generate upload URL with all parameters", async () => {
      // ==================== Arrange ====================
      // prepare mock data for signed URL generation
      const mockSignedUrl = "https://s3.amazonaws.com/test-bucket/music/test-123-1640995200000.mp3";
      mockNanoid.mockReturnValue("test-nanoid");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // ==================== Act ====================
      // call the function with all parameters
      const result = await generateUploadUrl({
        subfolder: UploadFolder.SONGS_MP3,
        extension: FileExtension.MP3,
        nanoID: "test-123",
      });

      // ==================== Assert ====================
      // verify S3 was called with correct parameters
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
        Bucket: "test-bucket",
        Key: "songs/mp3/test-123-1640995200000.mp3",
        Expires: 60,
      });
      // verify correct result is returned
      expect(result).toBe(mockSignedUrl);
    });

    it("should generate upload URL without subfolder", async () => {
      // ==================== Arrange ====================
      // prepare mock data for URL generation without subfolder
      const mockSignedUrl = "https://s3.amazonaws.com/test-bucket/test-456-1640995200000.jpg";
      mockNanoid.mockReturnValue("test-nanoid");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // ==================== Act ====================
      // call the function without subfolder parameter
      const result = await generateUploadUrl({
        extension: FileExtension.JPG,
        nanoID: "test-456",
      });

      // ==================== Assert ====================
      // verify S3 was called with correct parameters (no subfolder)
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
        Bucket: "test-bucket",
        Key: "test-456-1640995200000.jpg",
        Expires: 60,
      });
      // verify correct result is returned
      expect(result).toBe(mockSignedUrl);
    });

    it("should generate upload URL with auto-generated nanoid", async () => {
      // ==================== Arrange ====================
      // prepare mock data for auto-generated nanoid scenario
      const mockSignedUrl =
        "https://s3.amazonaws.com/test-bucket/images/auto-nanoid-1640995200000.png";
      mockNanoid.mockReturnValue("auto-nanoid");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // ==================== Act ====================
      // call the function without nanoID parameter to trigger auto-generation
      const result = await generateUploadUrl({
        subfolder: UploadFolder.USERS_IMAGE,
        extension: FileExtension.PNG,
      });

      // ==================== Assert ====================
      // verify nanoid was called to generate ID
      expect(mockNanoid).toHaveBeenCalledTimes(1);
      // verify S3 was called with auto-generated nanoid
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
        Bucket: "test-bucket",
        Key: "users/image/auto-nanoid-1640995200000.png",
        Expires: 60,
      });
      // verify correct result is returned
      expect(result).toBe(mockSignedUrl);
    });

    it("should handle different file extensions", async () => {
      // ==================== Arrange ====================
      // prepare mock data for different file extensions testing
      const mockSignedUrl = "https://s3.amazonaws.com/test-bucket/docs/file.pdf";
      mockNanoid.mockReturnValue("file");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // prepare test cases for different file extensions
      const extensionTests = [
        { ext: FileExtension.PNG, expected: ".png" },
        { ext: FileExtension.JPG, expected: ".jpg" },
        { ext: FileExtension.JPEG, expected: ".jpeg" },
        { ext: FileExtension.GIF, expected: ".gif" },
      ];

      // ==================== Act & Assert ====================
      // test each file extension and verify correct key generation
      for (const { ext, expected } of extensionTests) {
        await generateUploadUrl({
          subfolder: UploadFolder.ALBUMS_IMAGE,
          extension: ext,
          nanoID: "file",
        });

        expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
          Bucket: "test-bucket",
          Key: `albums/image/file-1640995200000${expected}`,
          Expires: 60,
        });
      }
    });

    it("should handle empty nanoID parameter", async () => {
      // ==================== Arrange ====================
      // prepare mock data for empty nanoID scenario
      const mockSignedUrl = "https://s3.amazonaws.com/test-bucket/test.txt";
      mockNanoid.mockReturnValue("generated-id");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // ==================== Act ====================
      // call the function with empty nanoID parameter
      const result = await generateUploadUrl({
        extension: FileExtension.PNG,
        nanoID: "",
      });

      // ==================== Assert ====================
      // verify nanoid was called to generate ID when nanoID is empty
      expect(mockNanoid).toHaveBeenCalledTimes(1);
      // verify S3 was called with generated nanoid
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
        Bucket: "test-bucket",
        Key: "generated-id-1640995200000.png",
        Expires: 60,
      });
      // verify correct result is returned
      expect(result).toBe(mockSignedUrl);
    });

    it("should throw error when S3 operation fails", async () => {
      // ==================== Arrange ====================
      // prepare mock error for S3 operation failure
      const mockError = new Error("S3 operation failed");
      mockNanoid.mockReturnValue("test-id");
      mockS3.getSignedUrlPromise.mockRejectedValue(mockError);

      // ==================== Act & Assert ====================
      // verify function throws error when S3 operation fails
      await expect(
        generateUploadUrl({
          subfolder: UploadFolder.SONGS_MP3,
          extension: FileExtension.MP3,
          nanoID: "test-id",
        })
      ).rejects.toThrow("S3 operation failed");

      // verify error was logged
      expect(console.log).toHaveBeenCalledWith(mockError);
    });

    it("should use current timestamp in filename", async () => {
      // ==================== Arrange ====================
      // prepare mock data with fixed timestamp
      const mockSignedUrl = "https://s3.amazonaws.com/test-bucket/test.jpg";
      const mockTimestamp = 1609459200000; // Fixed timestamp
      mockNanoid.mockReturnValue("test");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockSignedUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(mockTimestamp);

      // ==================== Act ====================
      // call the function to generate URL
      await generateUploadUrl({
        extension: FileExtension.JPG,
        nanoID: "test",
      });

      // ==================== Assert ====================
      // verify S3 was called with correct timestamp in key
      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith("putObject", {
        Bucket: "test-bucket",
        Key: "test-1609459200000.jpg",
        Expires: 60,
      });
    });
  });

  describe("deleteAwsFileUrl", () => {
    it("should delete file successfully", async () => {
      // ==================== Arrange ====================
      // prepare mock data for successful delete operation
      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // call the delete function
      const result = await deleteAwsFileUrl("music/song.mp3");

      // ==================== Assert ====================
      // verify S3 deleteObject was called with correct parameters
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "music/song.mp3",
      });
      // verify promise was called
      expect(mockDeleteResult.promise).toHaveBeenCalledTimes(1);
      // verify function returns true on success
      expect(result).toBe(true);
    });

    it("should return false when delete operation fails", async () => {
      // ==================== Arrange ====================
      // prepare mock error for delete operation failure
      const mockError = new Error("Delete failed");
      const mockDeleteResult = { promise: jest.fn().mockRejectedValue(mockError) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // call the delete function
      const result = await deleteAwsFileUrl("music/song.mp3");

      // ==================== Assert ====================
      // verify S3 deleteObject was called with correct parameters
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "music/song.mp3",
      });
      // verify error was logged
      expect(console.log).toHaveBeenCalledWith(mockError);
      // verify function returns false on failure
      expect(result).toBe(false);
    });

    it("should handle various S3 key formats", async () => {
      // ==================== Arrange ====================
      // prepare mock data for various S3 key formats testing
      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // prepare different S3 key formats to test
      const s3Keys = [
        "music/song.mp3",
        "images/photo.jpg",
        "documents/file.pdf",
        "uploads/user-123/avatar.png",
      ];

      // ==================== Act & Assert ====================
      // test each S3 key format and verify correct behavior
      for (const key of s3Keys) {
        const result = await deleteAwsFileUrl(key);

        expect(mockS3.deleteObject).toHaveBeenCalledWith({
          Bucket: "test-bucket",
          Key: key,
        });
        expect(result).toBe(true);
      }

      // verify promise was called for each key
      expect(mockDeleteResult.promise).toHaveBeenCalledTimes(s3Keys.length);
    });

    it("should handle empty S3 key", async () => {
      // ==================== Arrange ====================
      // prepare mock data for empty S3 key testing
      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // call the function with empty S3 key
      const result = await deleteAwsFileUrl("");

      // ==================== Assert ====================
      // verify S3 deleteObject was called with empty key
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "",
      });
      // verify function returns true even with empty key
      expect(result).toBe(true);
    });
  });

  describe("deleteAwsFileUrlOnModel", () => {
    it("should delete file when mainFolder is not defaults", async () => {
      // ==================== Arrange ====================
      // prepare mock data for non-defaults mainFolder scenario
      mockAwsUrlParser.mockReturnValue({
        mainFolder: "user-uploads",
        awsS3Key: "user-uploads/music/song.mp3",
        rootPath: "https://s3.amazonaws.com",
        subPath: "/user-uploads/music/song.mp3",
        pathParts: ["user-uploads", "music", "song.mp3"],
        folderPath: "user-uploads/music",
        subFolder: "music",
        fileName: "song.mp3",
        file: "song",
        extension: "mp3",
      });

      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // call the function with non-defaults mainFolder
      await deleteAwsFileUrlOnModel("https://s3.amazonaws.com/user-uploads/music/song.mp3");

      // ==================== Assert ====================
      // verify awsUrlParser was called with correct URL
      expect(mockAwsUrlParser).toHaveBeenCalledWith(
        "https://s3.amazonaws.com/user-uploads/music/song.mp3"
      );
      // verify S3 deleteObject was called with correct parameters
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user-uploads/music/song.mp3",
      });
      // verify promise was called
      expect(mockDeleteResult.promise).toHaveBeenCalledTimes(1);
    });

    it("should not delete file when mainFolder is defaults", async () => {
      // ==================== Arrange ====================
      // prepare mock data for defaults mainFolder scenario
      mockAwsUrlParser.mockReturnValue({
        mainFolder: "defaults",
        awsS3Key: "defaults/avatar.jpg",
        rootPath: "https://s3.amazonaws.com",
        subPath: "/defaults/avatar.jpg",
        pathParts: ["defaults", "avatar.jpg"],
        folderPath: "defaults/null",
        subFolder: null,
        fileName: "avatar.jpg",
        file: "avatar",
        extension: "jpg",
      });

      // ==================== Act ====================
      // call the function with defaults mainFolder
      await deleteAwsFileUrlOnModel("https://s3.amazonaws.com/defaults/avatar.jpg");

      // ==================== Assert ====================
      // verify awsUrlParser was called with correct URL
      expect(mockAwsUrlParser).toHaveBeenCalledWith("https://s3.amazonaws.com/defaults/avatar.jpg");
      // verify S3 deleteObject was not called for defaults folder
      expect(mockS3.deleteObject).not.toHaveBeenCalled();
    });

    it("should handle different mainFolder values", async () => {
      // ==================== Arrange ====================
      // prepare test cases for different mainFolder values
      const testCases = [
        { mainFolder: "user-content", shouldDelete: true },
        { mainFolder: "uploads", shouldDelete: true },
        { mainFolder: "defaults", shouldDelete: false },
        { mainFolder: "system", shouldDelete: true },
        { mainFolder: "public", shouldDelete: true },
      ];

      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act & Assert ====================
      // test each mainFolder value and verify correct behavior
      for (const { mainFolder, shouldDelete } of testCases) {
        mockAwsUrlParser.mockReturnValue({
          mainFolder,
          awsS3Key: `${mainFolder}/file.txt`,
          rootPath: "https://s3.amazonaws.com",
          subPath: `/${mainFolder}/file.txt`,
          pathParts: [mainFolder, "file.txt"],
          folderPath: `${mainFolder}/null`,
          subFolder: null,
          fileName: "file.txt",
          file: "file",
          extension: "txt",
        });

        mockS3.deleteObject.mockClear();

        await deleteAwsFileUrlOnModel(`https://s3.amazonaws.com/${mainFolder}/file.txt`);

        if (shouldDelete) {
          expect(mockS3.deleteObject).toHaveBeenCalledWith({
            Bucket: "test-bucket",
            Key: `${mainFolder}/file.txt`,
          });
        } else {
          expect(mockS3.deleteObject).not.toHaveBeenCalled();
        }
      }
    });

    it("should handle awsUrlParser errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare mock error for awsUrlParser failure
      const mockError = new Error("URL parsing failed");
      mockAwsUrlParser.mockImplementation(() => {
        throw mockError;
      });

      // ==================== Act & Assert ====================
      // verify function throws error when awsUrlParser fails
      await expect(deleteAwsFileUrlOnModel("invalid-url")).rejects.toThrow("URL parsing failed");

      // verify awsUrlParser was called with invalid URL
      expect(mockAwsUrlParser).toHaveBeenCalledWith("invalid-url");
      // verify S3 deleteObject was not called when parsing fails
      expect(mockS3.deleteObject).not.toHaveBeenCalled();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete upload and delete workflow", async () => {
      // ==================== Arrange ====================
      // prepare mock data for complete upload and delete workflow
      const mockUploadUrl = "https://s3.amazonaws.com/test-bucket/music/test-123-1640995200000.mp3";
      mockNanoid.mockReturnValue("test-123");
      mockS3.getSignedUrlPromise.mockResolvedValue(mockUploadUrl);
      jest.spyOn(Date.prototype, "getTime").mockReturnValue(1640995200000);

      // ==================== Act ====================
      // upload scenario: generate upload URL
      const uploadUrl = await generateUploadUrl({
        subfolder: UploadFolder.SONGS_MP3,
        extension: FileExtension.MP3,
        nanoID: "test-123",
      });

      // ==================== Assert ====================
      // verify upload URL was generated correctly
      expect(uploadUrl).toBe(mockUploadUrl);

      // ==================== Arrange ====================
      // prepare mock data for delete scenario
      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // delete scenario: delete the uploaded file
      const deleteSuccess = await deleteAwsFileUrl("songs/mp3/test-123-1640995200000.mp3");

      // ==================== Assert ====================
      // verify delete operation was successful
      expect(deleteSuccess).toBe(true);
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "songs/mp3/test-123-1640995200000.mp3",
      });
    });

    it("should handle model-based delete workflow", async () => {
      // ==================== Arrange ====================
      // prepare mock data for model-based delete workflow
      const fullUrl = "https://s3.amazonaws.com/user-uploads/images/photo.jpg";

      mockAwsUrlParser.mockReturnValue({
        mainFolder: "user-uploads",
        awsS3Key: "user-uploads/images/photo.jpg",
        rootPath: "https://s3.amazonaws.com",
        subPath: "/user-uploads/images/photo.jpg",
        pathParts: ["user-uploads", "images", "photo.jpg"],
        folderPath: "user-uploads/images",
        subFolder: "images",
        fileName: "photo.jpg",
        file: "photo",
        extension: "jpg",
      });

      const mockDeleteResult = { promise: jest.fn().mockResolvedValue({}) };
      mockS3.deleteObject.mockReturnValue(mockDeleteResult as any);

      // ==================== Act ====================
      // call the model-based delete function
      await deleteAwsFileUrlOnModel(fullUrl);

      // ==================== Assert ====================
      // verify awsUrlParser was called with full URL
      expect(mockAwsUrlParser).toHaveBeenCalledWith(fullUrl);
      // verify S3 deleteObject was called with correct parameters
      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user-uploads/images/photo.jpg",
      });
    });
  });
});
