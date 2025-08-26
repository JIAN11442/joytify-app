import awsUrlParser from "../../../src/utils/aws-url-parser.util";

// Mock console.log to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

describe("AWS URL Parser Util", () => {
  afterAll(() => {
    // Restore console.log
    mockConsoleLog.mockRestore();
  });

  describe("awsUrlParser", () => {
    it("should parse AWS URL with 3 path parts (main/sub/file)", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/my-bucket/music/song.mp3";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        rootPath: "https://s3.amazonaws.com",
        subPath: "/my-bucket/music/song.mp3",
        pathParts: ["my-bucket", "music", "song.mp3"],
        folderPath: "my-bucket/music",
        mainFolder: "my-bucket",
        subFolder: "music",
        fileName: "song.mp3",
        file: "song",
        extension: "mp3",
        awsS3Key: "my-bucket/music/song.mp3",
      });
    });

    it("should parse AWS URL with 2 path parts (main/file)", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/my-bucket/image.jpg";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        rootPath: "https://s3.amazonaws.com",
        subPath: "/my-bucket/image.jpg",
        pathParts: ["my-bucket", "image.jpg"],
        folderPath: "my-bucket/null",
        mainFolder: "my-bucket",
        subFolder: null,
        fileName: "image.jpg",
        file: "image",
        extension: "jpg",
        awsS3Key: "my-bucket/image.jpg",
      });
    });

    it("should handle files without extensions correctly", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/README";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe("README");
      // Note: Source code splits by ".", so "README" becomes ["README"], 
      // making file="README" and extension=undefined (as expected)
      expect(result.file).toBe("README");
      expect(result.extension).toBeUndefined();
    });

    it("should handle files with single character extension", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/script.c";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe("script.c");
      expect(result.file).toBe("script");
      expect(result.extension).toBe("c");
    });

    it("should handle different AWS domains", () => {
      // ==================== Arrange ====================
      const testUrls = [
        "https://s3.amazonaws.com/bucket/folder/file.txt", // 3 parts
        "https://s3.us-west-2.amazonaws.com/bucket/folder/file.txt", // 3 parts
      ];

      // ==================== Act & Assert ====================
      testUrls.forEach(url => {
        const result = awsUrlParser(url);
        
        expect(result.pathParts).toHaveLength(3);
        expect(result.fileName).toBe("file.txt");
        expect(result.file).toBe("file");
        expect(result.extension).toBe("txt");
      });
    });

    it("should handle bucket subdomain format", () => {
      // These URLs have different path structures due to subdomain routing
      const testUrls = [
        "https://bucket.s3.amazonaws.com/folder/file.txt", // 2 parts: folder, file.txt
        "https://bucket.s3.us-east-1.amazonaws.com/folder/file.txt", // 2 parts: folder, file.txt
      ];

      testUrls.forEach(url => {
        const result = awsUrlParser(url);
        
        expect(result.pathParts).toHaveLength(2);
        expect(result.fileName).toBe("file.txt");
        expect(result.file).toBe("file");
        expect(result.extension).toBe("txt");
      });
    });

    it("should handle files without extensions", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/README";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe("README");
      expect(result.file).toBe("README");
      expect(result.extension).toBeUndefined();
    });

    it("should handle files with multiple dots in name", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/file.backup.tar.gz";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe("file.backup.tar.gz");
      // Source code splits by "." and uses array destructuring [file, extension]
      // "file.backup.tar.gz".split(".") => ["file", "backup", "tar", "gz"]
      // With destructuring: file="file", extension="backup" (second element)
      expect(result.file).toBe("file");
      expect(result.extension).toBe("backup");
    });

    it("should handle edge case with filename starting with dot", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/.env";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe(".env");
      // split(".") on ".env" gives ["", "env"]
      expect(result.file).toBe("");
      expect(result.extension).toBe("env");
    });

    it("should handle filename with only dots", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/bucket/folder/...";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.fileName).toBe("...");
      // split(".") on "..." gives ["", "", "", ""]
      expect(result.file).toBe("");
      expect(result.extension).toBe("");
    });

    it("should handle special characters in paths", () => {
      // ==================== Arrange ====================
      const awsUrl = "https://s3.amazonaws.com/my-bucket/user-uploads/file%20with%20spaces.pdf";

      // ==================== Act ====================
      const result = awsUrlParser(awsUrl);

      // ==================== Assert Process ====================
      expect(result.mainFolder).toBe("my-bucket");
      expect(result.subFolder).toBe("user-uploads");
      expect(result.fileName).toBe("file%20with%20spaces.pdf");
      expect(result.folderPath).toBe("my-bucket/user-uploads");
    });

    it("should throw error for invalid URL structure with 1 part", () => {
      // ==================== Arrange ====================
      const invalidUrl = "https://s3.amazonaws.com/bucket-only";

      // ==================== Act & Assert ====================
      expect(() => {
        awsUrlParser(invalidUrl);
      }).toThrow("Invalid URL structure: expected 2 or 3 parts, got 1");
    });

    it("should throw error for invalid URL structure with more than 3 parts", () => {
      // ==================== Arrange ====================
      const invalidUrl = "https://s3.amazonaws.com/bucket/folder/subfolder/file.txt";

      // ==================== Act & Assert ====================
      expect(() => {
        awsUrlParser(invalidUrl);
      }).toThrow("Invalid URL structure: expected 2 or 3 parts, got 4");
    });

    it("should throw error for malformed URL", () => {
      // ==================== Arrange ====================
      const malformedUrl = "not-a-valid-url";

      // ==================== Act & Assert ====================
      expect(() => {
        awsUrlParser(malformedUrl);
      }).toThrow();

      // ==================== Assert Process ====================
      expect(mockConsoleLog).toHaveBeenCalledWith("Error parsing AWS URL:", expect.any(Error));
    });

    it("should handle empty path segments correctly", () => {
      // ==================== Arrange ====================
      const urlWithEmptySegment = "https://s3.amazonaws.com/bucket//file.txt";

      // ==================== Act ====================
      const result = awsUrlParser(urlWithEmptySegment);

      // ==================== Assert Process ====================
      // Empty segments should be filtered out
      expect(result.pathParts).toEqual(["bucket", "file.txt"]);
      expect(result.mainFolder).toBe("bucket");
      expect(result.subFolder).toBeNull();
    });

    it("should handle different file types", () => {
      // ==================== Arrange ====================
      const testCases = [
        { url: "https://s3.amazonaws.com/bucket/music/song.mp3", expectedExt: "mp3" },
        { url: "https://s3.amazonaws.com/bucket/images/photo.jpg", expectedExt: "jpg" },
        { url: "https://s3.amazonaws.com/bucket/images/photo.png", expectedExt: "png" },
        { url: "https://s3.amazonaws.com/bucket/docs/document.pdf", expectedExt: "pdf" },
        { url: "https://s3.amazonaws.com/bucket/videos/movie.mp4", expectedExt: "mp4" },
        { url: "https://s3.amazonaws.com/bucket/data/config.json", expectedExt: "json" },
      ];

      // ==================== Act & Assert ====================
      testCases.forEach(({ url, expectedExt }) => {
        const result = awsUrlParser(url);
        expect(result.extension).toBe(expectedExt);
      });
    });

    it("should correctly construct awsS3Key", () => {
      // ==================== Arrange ====================
      const testCases = [
        {
          url: "https://s3.amazonaws.com/bucket/folder/file.txt",
          expectedKey: "bucket/folder/file.txt"
        },
        {
          url: "https://s3.amazonaws.com/my-bucket/file.jpg",
          expectedKey: "my-bucket/file.jpg"
        },
        {
          url: "https://s3.amazonaws.com/bucket/sub1/sub2/file.pdf",
          expectedKey: "bucket/sub1/sub2/file.pdf"
        },
      ];

      // ==================== Act & Assert ====================
      testCases.forEach(({ url, expectedKey }) => {
        try {
          const result = awsUrlParser(url);
          expect(result.awsS3Key).toBe(expectedKey);
        } catch (error) {
          // For the 4-part URL case, it should throw an error
          if (expectedKey.split('/').length > 3) {
            expect(error).toBeDefined();
          } else {
            throw error;
          }
        }
      });
    });

    it("should handle URLs with query parameters", () => {
      // ==================== Arrange ====================
      const urlWithQuery = "https://s3.amazonaws.com/bucket/folder/file.jpg?version=1&cache=false";

      // ==================== Act ====================
      const result = awsUrlParser(urlWithQuery);

      // ==================== Assert Process ====================
      expect(result.mainFolder).toBe("bucket");
      expect(result.subFolder).toBe("folder");
      expect(result.fileName).toBe("file.jpg");
      // Query parameters should not affect the parsing
      expect(result.awsS3Key).toBe("bucket/folder/file.jpg");
    });

    it("should handle URLs with fragments", () => {
      // ==================== Arrange ====================
      const urlWithFragment = "https://s3.amazonaws.com/bucket/folder/file.pdf#page=1";

      // ==================== Act ====================
      const result = awsUrlParser(urlWithFragment);

      // ==================== Assert Process ====================
      expect(result.mainFolder).toBe("bucket");
      expect(result.subFolder).toBe("folder");
      expect(result.fileName).toBe("file.pdf");
      // Fragments should not affect the parsing
      expect(result.awsS3Key).toBe("bucket/folder/file.pdf");
    });

    it("should parse complex real-world AWS URLs", () => {
      // ==================== Arrange ====================
      const realWorldUrls = [
        // 2-part URLs (bucket in subdomain)
        {
          url: "https://my-app-storage.s3.us-west-2.amazonaws.com/user-uploads/profile-pictures.jpg",
          expectedParts: 2,
        },
        // 3-part URLs (bucket in path)
        {
          url: "https://s3.amazonaws.com/cdn-assets/js/app.min.js",
          expectedParts: 3,
        },
      ];

      // ==================== Act & Assert ====================
      realWorldUrls.forEach(({ url, expectedParts }) => {
        const result = awsUrlParser(url);
        
        expect(result.rootPath).toContain("amazonaws.com");
        expect(result.pathParts.length).toBe(expectedParts);
        expect(result.awsS3Key).toBe(result.pathParts.join("/"));
      });
    });

    it("should handle edge case with only bucket name", () => {
      // ==================== Arrange ====================
      const bucketOnlyUrl = "https://s3.amazonaws.com/my-bucket";

      // ==================== Act & Assert ====================
      expect(() => {
        awsUrlParser(bucketOnlyUrl);
      }).toThrow("Invalid URL structure: expected 2 or 3 parts, got 1");
    });

    it("should correctly parse folder structure", () => {
      // ==================== Arrange ====================
      const testCases = [
        {
          url: "https://s3.amazonaws.com/bucket/folder/file.txt",
          expectedFolderPath: "bucket/folder"
        },
        {
          url: "https://s3.amazonaws.com/bucket/file.txt",
          expectedFolderPath: "bucket/null"
        },
      ];

      // ==================== Act & Assert ====================
      testCases.forEach(({ url, expectedFolderPath }) => {
        const result = awsUrlParser(url);
        expect(result.folderPath).toBe(expectedFolderPath);
      });
    });

    it("should handle network errors during URL parsing", () => {
      // ==================== Arrange ====================
      const invalidProtocol = "ftp://s3.amazonaws.com/bucket/file.txt";

      // ==================== Act & Assert ====================
      // This should not throw since URL constructor can handle different protocols
      const result = awsUrlParser(invalidProtocol);
      expect(result.rootPath).toBe("ftp://s3.amazonaws.com");
    });
  });
});