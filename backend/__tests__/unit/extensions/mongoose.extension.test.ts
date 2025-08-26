import { Query } from "mongoose";
import { applyMongooseExtensions } from "../../../src/extensions/mongoose.extension";
import { joinLabels } from "../../../src/utils/join-labels.util";
import { remapFields } from "../../../src/utils/mongoose.util";

// Mock external dependencies
jest.mock("../../../src/utils/mongoose.util");
jest.mock("../../../src/utils/join-labels.util");

// Mock type definitions
const mockRemapFields = remapFields as jest.MockedFunction<typeof remapFields>;
const mockJoinLabels = joinLabels as jest.MockedFunction<typeof joinLabels>;

describe("Mongoose Extensions", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests
  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
  });

  describe("applyMongooseExtensions", () => {
    it("should apply all required mongoose extensions to Query prototype", async () => {
      // ==================== Arrange ====================
      // prepare clean Query prototype for testing by removing existing extensions
      const originalMethods = {} as any;
      const requiredMethods = [
        "forPagination",
        "remapFields",
        "populateSongDetails",
        "populateNestedSongDetails",
        "sortByIds",
        "refactorSongFields",
      ];

      // backup and remove existing methods
      requiredMethods.forEach((method) => {
        if ((Query.prototype as any)[method]) {
          originalMethods[method] = (Query.prototype as any)[method];
          delete (Query.prototype as any)[method];
        }
      });

      // ==================== Act ====================
      // apply mongoose extensions to Query prototype
      await applyMongooseExtensions();

      // ==================== Assert ====================
      // 1. verify all required methods are added to Query prototype
      requiredMethods.forEach((method) => {
        expect(typeof (Query.prototype as any)[method]).toBe("function");
      });

      // restore original methods after test
      Object.keys(originalMethods).forEach((method) => {
        (Query.prototype as any)[method] = originalMethods[method];
      });
    });

    it("should skip applying extensions if they already exist", async () => {
      // ==================== Arrange ====================
      // ensure extensions are applied first
      await applyMongooseExtensions();

      // verify methods exist after first application
      const methodsExistAfterFirst = [
        typeof Query.prototype.forPagination,
        typeof Query.prototype.remapFields,
        typeof Query.prototype.populateSongDetails,
        typeof Query.prototype.refactorSongFields,
      ];

      // ==================== Act ====================
      // attempt to apply mongoose extensions again
      await applyMongooseExtensions();

      // ==================== Assert ====================
      // verify methods still exist and are functions after second application
      expect(typeof Query.prototype.forPagination).toBe("function");
      expect(typeof Query.prototype.remapFields).toBe("function");
      expect(typeof Query.prototype.populateSongDetails).toBe("function");
      expect(typeof Query.prototype.refactorSongFields).toBe("function");

      // verify method types remain consistent (all should be functions)
      const methodsExistAfterSecond = [
        typeof Query.prototype.forPagination,
        typeof Query.prototype.remapFields,
        typeof Query.prototype.populateSongDetails,
        typeof Query.prototype.refactorSongFields,
      ];

      expect(methodsExistAfterSecond).toEqual(methodsExistAfterFirst);
    });

    it("should skip applying extensions when all required methods already exist", async () => {
      // ==================== Arrange ====================
      // manually add all required methods to Query.prototype to simulate already applied state
      const requiredMethods = [
        "forPagination",
        "remapFields",
        "populateSongDetails",
        "refactorData",
      ];

      // backup existing methods
      const originalMethods = {} as any;
      requiredMethods.forEach((method) => {
        if ((Query.prototype as any)[method]) {
          originalMethods[method] = (Query.prototype as any)[method];
        }
      });

      // ensure all required methods exist
      requiredMethods.forEach((method) => {
        if (!(Query.prototype as any)[method]) {
          (Query.prototype as any)[method] = jest.fn();
        }
      });

      // ==================== Act ====================
      // attempt to apply extensions when all methods already exist
      await applyMongooseExtensions();

      // ==================== Assert ====================
      // verify all methods still exist
      requiredMethods.forEach((method) => {
        expect((Query.prototype as any)[method]).toBeDefined();
      });

      // restore original methods
      Object.keys(originalMethods).forEach((method) => {
        (Query.prototype as any)[method] = originalMethods[method];
      });
    });
  });

  describe("Extension method functionality", () => {
    beforeEach(async () => {
      // ensure extensions are applied before each test
      await applyMongooseExtensions();
    });

    describe("forPagination method", () => {
      it("should return paginated results with correct structure", async () => {
        // ==================== Arrange ====================
        // prepare mock query object with required methods
        const mockDocs = [
          { _id: "doc1", title: "Document 1" },
          { _id: "doc2", title: "Document 2" },
        ];
        const mockTotalDocs = 10;
        const pageNumber = 2;

        const mockQueryContext = {
          exec: jest.fn().mockResolvedValue(mockDocs),
          model: {
            countDocuments: jest.fn().mockResolvedValue(mockTotalDocs),
          },
          getFilter: jest.fn().mockReturnValue({ status: "active" }),
        };

        // ==================== Act ====================
        // call forPagination extension method with proper context
        const result = await Query.prototype.forPagination.call(mockQueryContext, pageNumber);

        // ==================== Assert ====================
        // 1. verify result structure contains docs, totalDocs, and page
        expect(result).toEqual({
          docs: mockDocs,
          totalDocs: mockTotalDocs,
          page: pageNumber,
        });

        // 2. verify query execution and count were called
        expect(mockQueryContext.exec).toHaveBeenCalledTimes(1);
        expect(mockQueryContext.model.countDocuments).toHaveBeenCalledWith({ status: "active" });
      });

      it("should return results without page number when not provided", async () => {
        // ==================== Arrange ====================
        // prepare mock query object for pagination without page number
        const mockDocs = [{ _id: "doc1" }];
        const mockTotalDocs = 5;

        const mockQueryContext = {
          exec: jest.fn().mockResolvedValue(mockDocs),
          model: {
            countDocuments: jest.fn().mockResolvedValue(mockTotalDocs),
          },
          getFilter: jest.fn().mockReturnValue({}),
        };

        // ==================== Act ====================
        // call forPagination without page parameter
        const result = await Query.prototype.forPagination.call(mockQueryContext);

        // ==================== Assert ====================
        // verify result structure without page property
        expect(result).toEqual({
          docs: mockDocs,
          totalDocs: mockTotalDocs,
        });
      });
    });

    describe("remapFields method", () => {
      it("should use transform function to remap document fields", () => {
        // ==================== Arrange ====================
        // prepare mock query context and field mapping
        const fieldsMapping = { oldField: "newField", title: "name" };
        let capturedTransformFn: any;

        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call remapFields extension method
        const result = Query.prototype.remapFields.call(mockQueryContext, fieldsMapping);

        // ==================== Assert ====================
        // 1. verify method returns query for chaining
        expect(result).toBe(mockQueryContext);

        // 2. verify transform was called
        expect(mockQueryContext.transform).toHaveBeenCalledTimes(1);
        expect(typeof capturedTransformFn).toBe("function");
      });

      it("should handle array and single document transformation", () => {
        // ==================== Arrange ====================
        // prepare test data with array and single document
        const fieldsMapping = { _id: "id", title: "name" };
        const mockDocs = [
          { _id: "1", title: "Doc 1" },
          { _id: "2", title: "Doc 2" },
        ];
        const singleDoc = { _id: "3", title: "Doc 3" };

        mockRemapFields.mockImplementation((doc, fields) => ({
          ...doc,
          id: doc._id,
          name: doc.title,
        }));

        let capturedTransformFn: any;
        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call remapFields to get transform function
        Query.prototype.remapFields.call(mockQueryContext, fieldsMapping);
        const arrayResult = capturedTransformFn(mockDocs);
        const singleResult = capturedTransformFn(singleDoc);

        // ==================== Assert ====================
        // 1. verify remapFields was called for array items
        expect(mockRemapFields).toHaveBeenCalledTimes(3); // 2 docs + 1 single doc

        // 2. verify both array and single document transformations work
        expect(Array.isArray(arrayResult)).toBe(true);
        expect(arrayResult).toHaveLength(2);
        expect(singleResult).not.toBeInstanceOf(Array);
      });
    });

    describe("populateSongDetails method", () => {
      it("should populate all required song fields", () => {
        // ==================== Arrange ====================
        // prepare mock query context
        const mockQueryContext = {
          populate: jest.fn().mockReturnThis(),
        };

        // ==================== Act ====================
        // call populateSongDetails extension method
        const result = Query.prototype.populateSongDetails.call(mockQueryContext);

        // ==================== Assert ====================
        // 1. verify method returns query for chaining
        expect(result).toBe(mockQueryContext);

        // 2. verify all required populate calls were made (8 total: artist, album, lyricists, composers, languages, genres, tags, ratings)
        expect(mockQueryContext.populate).toHaveBeenCalledTimes(8);

        // 3. verify specific populate configurations
        expect(mockQueryContext.populate).toHaveBeenCalledWith({ path: "artist", select: "name" });
        expect(mockQueryContext.populate).toHaveBeenCalledWith({ path: "album", select: "title" });
        expect(mockQueryContext.populate).toHaveBeenCalledWith({
          path: "lyricists",
          select: "name",
          transform: expect.any(Function),
        });
        expect(mockQueryContext.populate).toHaveBeenCalledWith({
          path: "ratings",
          populate: { path: "user", select: "username profileImage" },
        });
      });

      it("should test transform functions in populateSongDetails", () => {
        // ==================== Arrange ====================
        // prepare mock query context to capture transform functions
        const capturedTransforms: any[] = [];
        const mockQueryContext = {
          populate: jest.fn().mockImplementation((config) => {
            if (config.transform) {
              capturedTransforms.push(config.transform);
            }
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call populateSongDetails to capture transform functions
        Query.prototype.populateSongDetails.call(mockQueryContext);

        // ==================== Assert ====================
        // verify transform functions are captured and work correctly
        expect(capturedTransforms).toHaveLength(5); // lyricists, composers, languages, genres, tags

        // test lyricists transform function
        const lyricistsTransform = capturedTransforms[0];
        const mockLyricist = { name: "John Doe" };
        expect(lyricistsTransform(mockLyricist)).toBe("John Doe");

        // test composers transform function
        const composersTransform = capturedTransforms[1];
        const mockComposer = { name: "Jane Smith" };
        expect(composersTransform(mockComposer)).toBe("Jane Smith");

        // test languages transform function
        const languagesTransform = capturedTransforms[2];
        const mockLanguage = { label: "English" };
        expect(languagesTransform(mockLanguage)).toBe("English");

        // test genres transform function
        const genresTransform = capturedTransforms[3];
        const mockGenre = { label: "Rock" };
        expect(genresTransform(mockGenre)).toBe("Rock");

        // test tags transform function
        const tagsTransform = capturedTransforms[4];
        const mockTag = { label: "Popular" };
        expect(tagsTransform(mockTag)).toBe("Popular");
      });
    });

    describe("populateNestedSongDetails method", () => {
      it("should populate nested songs with all required fields", () => {
        // ==================== Arrange ====================
        // prepare mock query context
        const mockQueryContext = {
          populate: jest.fn().mockReturnThis(),
        };

        // ==================== Act ====================
        // call populateNestedSongDetails extension method
        const result = Query.prototype.populateNestedSongDetails.call(mockQueryContext);

        // ==================== Assert ====================
        // 1. verify method returns query for chaining
        expect(result).toBe(mockQueryContext);

        // 2. verify populate was called with songs path and nested population
        expect(mockQueryContext.populate).toHaveBeenCalledWith({
          path: "songs",
          populate: expect.arrayContaining([
            { path: "artist", select: "name" },
            { path: "album", select: "title" },
            { path: "composers", select: "name", transform: expect.any(Function) },
            { path: "lyricists", select: "name", transform: expect.any(Function) },
            { path: "languages", select: "label", transform: expect.any(Function) },
            { path: "genres", select: "label", transform: expect.any(Function) },
            { path: "tags", select: "label", transform: expect.any(Function) },
            { path: "ratings", populate: { path: "user", select: "username profileImage" } },
          ]),
        });
      });

      it("should test transform functions in populateNestedSongDetails", () => {
        // ==================== Arrange ====================
        // prepare mock query context to capture transform functions
        let capturedPopulateConfig: any;
        const mockQueryContext = {
          populate: jest.fn().mockImplementation((config) => {
            capturedPopulateConfig = config;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call populateNestedSongDetails to capture populate configuration
        Query.prototype.populateNestedSongDetails.call(mockQueryContext);

        // ==================== Assert ====================
        // verify populate configuration is captured
        expect(capturedPopulateConfig).toBeDefined();
        expect(capturedPopulateConfig.path).toBe("songs");
        expect(Array.isArray(capturedPopulateConfig.populate)).toBe(true);

        // find transform functions in the populate array
        const transformConfigs = capturedPopulateConfig.populate.filter(
          (config: any) => config.transform
        );
        expect(transformConfigs).toHaveLength(5); // composers, lyricists, languages, genres, tags

        // test composers transform function
        const composersConfig = transformConfigs.find((config: any) => config.path === "composers");
        expect(composersConfig.transform({ name: "Composer Name" })).toBe("Composer Name");

        // test lyricists transform function
        const lyricistsConfig = transformConfigs.find((config: any) => config.path === "lyricists");
        expect(lyricistsConfig.transform({ name: "Lyricist Name" })).toBe("Lyricist Name");

        // test languages transform function
        const languagesConfig = transformConfigs.find((config: any) => config.path === "languages");
        expect(languagesConfig.transform({ label: "Language Label" })).toBe("Language Label");

        // test genres transform function
        const genresConfig = transformConfigs.find((config: any) => config.path === "genres");
        expect(genresConfig.transform({ label: "Genre Label" })).toBe("Genre Label");

        // test tags transform function
        const tagsConfig = transformConfigs.find((config: any) => config.path === "tags");
        expect(tagsConfig.transform({ label: "Tag Label" })).toBe("Tag Label");
      });
    });

    describe("sortByIds method", () => {
      it("should sort documents according to provided ID order", () => {
        // ==================== Arrange ====================
        // prepare test data with documents in different order
        const providedIds = ["id3", "id1", "id2"];
        const mockDocs = [
          { _id: "id1", title: "First" },
          { _id: "id2", title: "Second" },
          { _id: "id3", title: "Third" },
        ];
        const expectedSortedDocs = [
          { _id: "id3", title: "Third" },
          { _id: "id1", title: "First" },
          { _id: "id2", title: "Second" },
        ];

        let capturedTransformFn: any;
        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call sortByIds extension method
        const result = Query.prototype.sortByIds.call(mockQueryContext, providedIds);
        const sortedResult = capturedTransformFn(mockDocs);

        // ==================== Assert ====================
        // 1. verify method returns query for chaining
        expect(result).toBe(mockQueryContext);

        // 2. verify transform function was called
        expect(mockQueryContext.transform).toHaveBeenCalledTimes(1);

        // 3. verify documents are sorted according to ID order
        expect(sortedResult).toEqual(expectedSortedDocs);
      });

      it("should handle ObjectId instances in sorting", () => {
        // ==================== Arrange ====================
        // prepare test with ObjectId-like instances
        const providedIds = ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"];
        const mockDocs = [
          { _id: { toString: () => "507f1f77bcf86cd799439012" }, title: "Second" },
          { _id: { toString: () => "507f1f77bcf86cd799439011" }, title: "First" },
        ];

        let capturedTransformFn: any;
        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call sortByIds with ObjectId-compatible IDs
        Query.prototype.sortByIds.call(mockQueryContext, providedIds);
        const sortedResult = capturedTransformFn(mockDocs);

        // ==================== Assert ====================
        // verify ObjectId toString() method is used for comparison
        expect(sortedResult[0]._id.toString()).toBe("507f1f77bcf86cd799439011");
        expect(sortedResult[1]._id.toString()).toBe("507f1f77bcf86cd799439012");
      });
    });

    describe("refactorSongFields method", () => {
      beforeEach(() => {
        // mock joinLabels utility function
        mockJoinLabels.mockImplementation((labels: any[]) =>
          Array.isArray(labels) ? labels.join(", ") : ""
        );
      });

      it("should refactor song fields with default options", () => {
        // ==================== Arrange ====================
        // prepare mock song data for refactoring
        const mockSong = {
          _id: "song1",
          title: "Test Song",
          lyricists: ["Lyricist 1", "Lyricist 2"],
          composers: ["Composer 1"],
          languages: ["English"],
          ratings: [
            {
              _id: "rating1",
              user: { username: "user1", profileImage: "image1.jpg" },
              rating: 5,
              comment: "Great song!",
            },
          ],
        };

        let capturedTransformFn: any;
        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call refactorSongFields with default options
        const result = Query.prototype.refactorSongFields.call(mockQueryContext);
        const refactoredResult = capturedTransformFn([mockSong]);

        // ==================== Assert ====================
        // 1. verify method returns query for chaining
        expect(result).toBe(mockQueryContext);

        // 2. verify song fields are refactored correctly
        expect(refactoredResult[0]).toHaveProperty("lyricists", "Lyricist 1, Lyricist 2");
        expect(refactoredResult[0]).toHaveProperty("composers", "Composer 1");
        expect(refactoredResult[0]).toHaveProperty("languages", "English");
        expect(refactoredResult[0].ratings[0]).toHaveProperty("id", "rating1");
        expect(refactoredResult[0].ratings[0]).toHaveProperty("username", "user1");

        // 3. verify joinLabels was called for array fields
        expect(mockJoinLabels).toHaveBeenCalledWith(mockSong.lyricists);
        expect(mockJoinLabels).toHaveBeenCalledWith(mockSong.composers);
        expect(mockJoinLabels).toHaveBeenCalledWith(mockSong.languages);
      });

      it("should refactor nested songs when transformNestedSongs option is true", () => {
        // ==================== Arrange ====================
        // prepare mock data with nested songs
        const mockAlbum = {
          _id: "album1",
          title: "Test Album",
          songs: [
            {
              _id: "song1",
              title: "Song 1",
              lyricists: ["Lyricist 1"],
              composers: ["Composer 1"],
              languages: ["English"],
              ratings: [],
            },
          ],
        };

        let capturedTransformFn: any;
        const mockQueryContext = {
          transform: jest.fn().mockImplementation((transformFn: any) => {
            capturedTransformFn = transformFn;
            return mockQueryContext;
          }),
        };

        // ==================== Act ====================
        // call refactorSongFields with transformNestedSongs option
        Query.prototype.refactorSongFields.call(mockQueryContext, { transformNestedSongs: true });
        const refactoredResult = capturedTransformFn([mockAlbum]);

        // ==================== Assert ====================
        // 1. verify nested songs are refactored correctly
        expect(refactoredResult[0].songs[0]).toHaveProperty("lyricists", "Lyricist 1");
        expect(refactoredResult[0].songs[0]).toHaveProperty("composers", "Composer 1");
        expect(refactoredResult[0].songs[0]).toHaveProperty("languages", "English");

        // 2. verify joinLabels was called for nested song fields
        expect(mockJoinLabels).toHaveBeenCalledTimes(3); // lyricists, composers, languages
      });
    });
  });

  describe("Integration and method chaining", () => {
    beforeEach(async () => {
      // ensure extensions are applied before each test
      await applyMongooseExtensions();
    });

    it("should verify all extensions work together in method chaining", () => {
      // ==================== Arrange ====================
      // prepare mock query context that supports all extension methods
      const mockQueryContext = {
        populate: jest.fn().mockReturnThis(),
        transform: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      };

      const fieldsMapping = { _id: "id" };
      const sortIds = ["id1", "id2"];

      // ==================== Act ====================
      // attempt to chain multiple extension methods
      let result: any;
      expect(() => {
        result = Query.prototype.populateSongDetails
          .call(mockQueryContext)
          .populate({ path: "customField" })
          .transform(() => {})
          .sort({ createdAt: -1 });
      }).not.toThrow();

      // ==================== Assert ====================
      // verify chaining works without errors and returns appropriate context
      expect(result).toBe(mockQueryContext);
      expect(mockQueryContext.populate).toHaveBeenCalled();
    });
  });

  describe("Error handling and edge cases", () => {
    beforeEach(async () => {
      // ensure extensions are applied before each test
      await applyMongooseExtensions();
    });

    it("should handle empty arrays gracefully", () => {
      // ==================== Arrange ====================
      // prepare edge case data for transform functions
      let capturedSortTransformFn: any;
      let capturedRefactorTransformFn: any;

      const mockQueryContext = {
        transform: jest.fn().mockImplementation((transformFn: any) => {
          if (!capturedSortTransformFn) {
            capturedSortTransformFn = transformFn;
          } else {
            capturedRefactorTransformFn = transformFn;
          }
          return mockQueryContext;
        }),
      };

      // ==================== Act & Assert ====================
      // test sortByIds with empty data
      Query.prototype.sortByIds.call(mockQueryContext, []);
      expect(() => capturedSortTransformFn([])).not.toThrow();
      expect(capturedSortTransformFn([])).toEqual([]);

      // test refactorSongFields with undefined ratings
      Query.prototype.refactorSongFields.call(mockQueryContext);
      const songWithoutRatings = { lyricists: [], composers: [], languages: [] };
      expect(() => capturedRefactorTransformFn([songWithoutRatings])).not.toThrow();
    });

    it("should handle null input in sortByIds by throwing error", () => {
      // ==================== Arrange ====================
      // prepare test for null input which should throw error based on current implementation
      let capturedSortTransformFn: any;

      const mockQueryContext = {
        transform: jest.fn().mockImplementation((transformFn: any) => {
          capturedSortTransformFn = transformFn;
          return mockQueryContext;
        }),
      };

      // ==================== Act ====================
      Query.prototype.sortByIds.call(mockQueryContext, []);

      // ==================== Assert ====================
      // test sortByIds with null - current implementation will throw error as expected
      expect(() => capturedSortTransformFn(null)).toThrow("Cannot read properties of null");
    });

    it("should handle transform function errors gracefully", async () => {
      // ==================== Arrange ====================
      // prepare query context that might fail
      const mockQueryContext = {
        exec: jest.fn().mockRejectedValue(new Error("Query execution failed")),
        model: {
          countDocuments: jest.fn().mockResolvedValue(0),
        },
        getFilter: jest.fn().mockReturnValue({}),
      };

      // ==================== Act & Assert ====================
      // verify forPagination handles query execution errors
      await expect(Query.prototype.forPagination.call(mockQueryContext)).rejects.toThrow(
        "Query execution failed"
      );
    });

    it("should handle countDocuments errors in forPagination", async () => {
      // ==================== Arrange ====================
      // prepare query context with countDocuments error
      const mockQueryContext = {
        exec: jest.fn().mockResolvedValue([]),
        model: {
          countDocuments: jest.fn().mockRejectedValue(new Error("Count failed")),
        },
        getFilter: jest.fn().mockReturnValue({}),
      };

      // ==================== Act & Assert ====================
      // verify forPagination handles countDocuments errors
      await expect(Query.prototype.forPagination.call(mockQueryContext)).rejects.toThrow(
        "Count failed"
      );
    });

    it("should handle undefined ratings in refactorSongFields", () => {
      // ==================== Arrange ====================
      // prepare song data with undefined ratings
      const mockSong = {
        _id: "song1",
        title: "Test Song",
        lyricists: ["Lyricist 1"],
        composers: ["Composer 1"],
        languages: ["English"],
        ratings: undefined,
      };

      let capturedTransformFn: any;
      const mockQueryContext = {
        transform: jest.fn().mockImplementation((transformFn: any) => {
          capturedTransformFn = transformFn;
          return mockQueryContext;
        }),
      };

      // ==================== Act ====================
      // call refactorSongFields with undefined ratings
      Query.prototype.refactorSongFields.call(mockQueryContext);
      const refactoredResult = capturedTransformFn([mockSong]);

      // ==================== Assert ====================
      // verify undefined ratings are handled gracefully
      expect(refactoredResult[0]).toHaveProperty("ratings", undefined);
      expect(() => capturedTransformFn([mockSong])).not.toThrow();
    });

    it("should handle empty transform function in remapFields", () => {
      // ==================== Arrange ====================
      // prepare test for empty transform function
      const fieldsMapping = {};
      const mockQueryContext = {
        transform: jest.fn().mockReturnThis(),
      };

      // ==================== Act ====================
      // call remapFields with empty mapping
      const result = Query.prototype.remapFields.call(mockQueryContext, fieldsMapping);

      // ==================== Assert ====================
      // verify method handles empty mapping gracefully
      expect(result).toBe(mockQueryContext);
      expect(mockQueryContext.transform).toHaveBeenCalledTimes(1);
    });
  });
});
