import SongModel from "../../../src/models/song.model";
import AlbumModel from "../../../src/models/album.model";
import LabelModel from "../../../src/models/label.model";
import MusicianModel from "../../../src/models/musician.model";
import { searchContentByType } from "../../../src/services/search.service";
import { SearchFilterOptions, LabelOptions } from "@joytify/types/constants";
import {
  FETCH_LIMIT_PER_PAGE,
  PROFILE_FETCH_LIMIT,
} from "../../../src/constants/env-validate.constant";
import { getPaginatedDocs } from "../../../src/utils/mongoose.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/album.model");
jest.mock("../../../src/models/label.model");
jest.mock("../../../src/models/musician.model");
jest.mock("../../../src/utils/mongoose.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockAlbumModel = AlbumModel as jest.Mocked<typeof AlbumModel>;
const mockLabelModel = LabelModel as jest.Mocked<typeof LabelModel>;
const mockMusicianModel = MusicianModel as jest.Mocked<typeof MusicianModel>;
const mockGetPaginatedDocs = getPaginatedDocs as jest.MockedFunction<typeof getPaginatedDocs>;

// Mock mongoose query with extended methods
// Create a complete mock of the Mongoose Query object with all necessary methods
const createMockQuery = () => {
  const mockQuery: any = {
    populateSongDetails: jest.fn(),
    refactorSongFields: jest.fn(),
    lean: jest.fn(),
    forPagination: jest.fn(),
    populateNestedSongDetails: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    exec: jest.fn(),
    transform: jest.fn(),
  };

  // Chain all methods to return this
  Object.keys(mockQuery).forEach((key) => {
    if (key !== "forPagination" && key !== "exec") {
      mockQuery[key].mockReturnValue(mockQuery);
    }
  });

  return mockQuery;
};

describe("Search Service", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests
  let mockQuery: any;

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
    // create fresh mock query object with mongoose extension methods
    mockQuery = createMockQuery();
    // configure getPaginatedDocs to return our mock query
    mockGetPaginatedDocs.mockReturnValue(mockQuery);
  });

  describe("searchContentByType", () => {
    const baseParams = {
      query: "test query",
      page: 1,
    };

    describe("Search Type: ALL", () => {
      it("should return all content types when type is ALL", async () => {
        // ==================== Arrange ====================
        const mockResults = {
          songs: [{ id: "song1", title: "Test Song" }],
          musicians: [{ id: "musician1", name: "Test Artist" }],
          albums: [{ id: "album1", title: "Test Album" }],
          genresAndTags: [{ id: "label1", label: "Test Genre" }],
          languages: [{ id: "lang1", label: "English" }],
        };

        // Mock aggregation results for all models to simulate found documents
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }]);
        mockMusicianModel.aggregate.mockResolvedValue([{ _id: "musician1" }]);
        mockAlbumModel.aggregate.mockResolvedValue([{ _id: "album1" }]);
        mockLabelModel.aggregate.mockResolvedValue([{ _id: "label1" }]);

        // Mock query execution results
        mockQuery.forPagination.mockResolvedValue(mockResults.songs);
        mockQuery.lean.mockResolvedValue(mockResults);

        // ==================== Act ====================
        const result = await searchContentByType({
          type: SearchFilterOptions.ALL,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify result structure contains all expected content types
        expect(result).toHaveProperty("songs");
        expect(result).toHaveProperty("musicians");
        expect(result).toHaveProperty("albums");
        expect(result).toHaveProperty("genresAndTags");
        expect(result).toHaveProperty("languages");

        // verify all models were queried with aggregation pipelines
        expect(mockSongModel.aggregate).toHaveBeenCalled();
        expect(mockMusicianModel.aggregate).toHaveBeenCalled();
        expect(mockAlbumModel.aggregate).toHaveBeenCalled();
        expect(mockLabelModel.aggregate).toHaveBeenCalledTimes(2); // genres/tags + languages separately
      });

      it("should use profile fetch limit for ALL search", async () => {
        // ==================== Arrange ====================
        // prepare empty aggregation results to focus on pagination behavior
        mockSongModel.aggregate.mockResolvedValue([]);
        mockMusicianModel.aggregate.mockResolvedValue([]);
        mockAlbumModel.aggregate.mockResolvedValue([]);
        mockLabelModel.aggregate.mockResolvedValue([]);
        mockQuery.lean.mockResolvedValue({});

        // ==================== Act ====================
        // execute ALL search type which should use profile limits
        await searchContentByType({
          type: SearchFilterOptions.ALL,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify profile fetch limit is used instead of default pagination limit
        expect(mockGetPaginatedDocs).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: {
              initial: PROFILE_FETCH_LIMIT,
              load: FETCH_LIMIT_PER_PAGE,
            },
          })
        );
      });
    });

    describe("Search Type: SONGS", () => {
      it("should return songs when type is SONGS", async () => {
        // ==================== Arrange ====================
        // prepare mock song data for successful search results
        const mockSongs = [
          { _id: "song1", title: "Test Song 1" },
          { _id: "song2", title: "Test Song 2" },
        ];

        // mock aggregation to return matching song IDs
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }, { _id: "song2" }]);
        // mock query execution to return populated song data
        mockQuery.forPagination.mockResolvedValue(mockSongs);

        // ==================== Act ====================
        const result = await searchContentByType({
          type: SearchFilterOptions.SONGS,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify correct song results are returned
        expect(result).toEqual(mockSongs);
        // verify aggregation pipeline is called with correct structure
        expect(mockSongModel.aggregate).toHaveBeenCalledWith([
          // first lookup: populate artist information
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "musicians",
              localField: "artist",
              foreignField: "_id",
            }),
          }),
          expect.any(Object), // album lookup stage
          expect.any(Object), // label lookup stage
          // match stage: search across multiple fields with case-insensitive regex
          expect.objectContaining({
            $match: expect.objectContaining({
              $or: expect.arrayContaining([
                { title: { $regex: "test query", $options: "i" } },
                { "artistDoc.name": { $regex: "test query", $options: "i" } },
                { "albumDoc.title": { $regex: "test query", $options: "i" } },
                { "labelDocs.label": { $regex: "test query", $options: "i" } },
              ]),
            }),
          }),
          // project stage: return only document IDs for efficiency
          { $project: { _id: 1 } },
        ]);

        // ==================== Assert Process ====================
        // 1. verify pagination query is configured correctly
        expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
          model: SongModel,
          filter: { _id: { $in: [{ _id: "song1" }, { _id: "song2" }] } },
          limit: {
            initial: FETCH_LIMIT_PER_PAGE,
            load: FETCH_LIMIT_PER_PAGE,
          },
          page: 1,
        });

        // 2. verify query builder methods are called in correct order
        expect(mockQuery.populateSongDetails).toHaveBeenCalled();
        expect(mockQuery.refactorSongFields).toHaveBeenCalled();
        expect(mockQuery.lean).toHaveBeenCalled();
        expect(mockQuery.forPagination).toHaveBeenCalledWith(1);
      });

      it("should handle empty search results for songs", async () => {
        // ==================== Arrange ====================
        // prepare empty aggregation results to simulate no matches
        mockSongModel.aggregate.mockResolvedValue([]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        // execute search with no matching results
        const result = await searchContentByType({
          type: SearchFilterOptions.SONGS,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify empty array is returned for no matches
        expect(result).toEqual([]);
        expect(mockSongModel.aggregate).toHaveBeenCalled();
      });
    });

    describe("Search Type: MUSICIANS", () => {
      it("should return musicians when type is MUSICIANS", async () => {
        // ==================== Arrange ====================
        // prepare mock musician data for successful search results
        const mockMusicians = [
          { _id: "musician1", name: "Test Artist 1" },
          { _id: "musician2", name: "Test Artist 2" },
        ];

        // mock aggregation to return matching musician IDs
        mockMusicianModel.aggregate.mockResolvedValue([{ _id: "musician1" }, { _id: "musician2" }]);
        // mock query execution to return populated musician data
        mockQuery.forPagination.mockResolvedValue(mockMusicians);

        // ==================== Act ====================
        // execute musician search with test query
        const result = await searchContentByType({
          type: SearchFilterOptions.MUSICIANS,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify correct musician results are returned
        expect(result).toEqual(mockMusicians);
        // verify aggregation pipeline is called with correct structure for musician search
        expect(mockMusicianModel.aggregate).toHaveBeenCalledWith([
          // first lookup: populate songs information for musician search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "songs",
              localField: "songs",
              foreignField: "_id",
            }),
          }),
          // second lookup: populate albums information for musician search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "albums",
              localField: "albums",
              foreignField: "_id",
            }),
          }),
          // match stage: search across musician name, song titles, and album titles
          expect.objectContaining({
            $match: expect.objectContaining({
              $or: expect.arrayContaining([
                { name: { $regex: "test query", $options: "i" } },
                { "songDocs.title": { $regex: "test query", $options: "i" } },
                { "songDocs.labelDocs.label": { $regex: "test query", $options: "i" } },
                { "albumDocs.title": { $regex: "test query", $options: "i" } },
              ]),
            }),
          }),
          // project stage: return only document IDs for efficiency
          { $project: { _id: 1 } },
        ]);

        // verify query builder methods are called with correct parameters
        expect(mockQuery.populateNestedSongDetails).toHaveBeenCalled();
        expect(mockQuery.refactorSongFields).toHaveBeenCalledWith({ transformNestedSongs: true });
      });
    });

    describe("Search Type: ALBUMS", () => {
      it("should return albums when type is ALBUMS", async () => {
        // ==================== Arrange ====================
        // prepare mock album data for successful search results
        const mockAlbums = [
          { _id: "album1", title: "Test Album 1" },
          { _id: "album2", title: "Test Album 2" },
        ];

        // mock aggregation to return matching album IDs
        mockAlbumModel.aggregate.mockResolvedValue([{ _id: "album1" }, { _id: "album2" }]);
        // mock query execution to return populated album data
        mockQuery.forPagination.mockResolvedValue(mockAlbums);

        // ==================== Act ====================
        // execute album search with test query
        const result = await searchContentByType({
          type: SearchFilterOptions.ALBUMS,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify correct album results are returned
        expect(result).toEqual(mockAlbums);
        // verify aggregation pipeline is called with correct structure for album search
        expect(mockAlbumModel.aggregate).toHaveBeenCalledWith([
          // first lookup: populate artists information for album search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "musicians",
              localField: "artists",
              foreignField: "_id",
            }),
          }),
          // second lookup: populate songs information for album search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "songs",
              localField: "songs",
              foreignField: "_id",
            }),
          }),
          // match stage: search across album title, artist names, and song titles
          expect.objectContaining({
            $match: expect.objectContaining({
              $or: expect.arrayContaining([
                { title: { $regex: "test query", $options: "i" } },
                { "artistDocs.name": { $regex: "test query", $options: "i" } },
                { "songDocs.title": { $regex: "test query", $options: "i" } },
                { "songDocs.labelDocs.label": { $regex: "test query", $options: "i" } },
              ]),
            }),
          }),
          // project stage: return only document IDs for efficiency
          { $project: { _id: 1 } },
        ]);

        // verify query builder methods are called with correct parameters
        expect(mockQuery.populate).toHaveBeenCalledWith({
          path: "artists",
          select: "name",
          transform: expect.any(Function),
        });
      });
    });

    describe("Search Type: GENRES_AND_TAGS", () => {
      it("should return genres and tags when type is GENRES_AND_TAGS", async () => {
        // ==================== Arrange ====================
        // prepare mock label data for genres and tags search results
        const mockLabels = [
          { _id: "label1", label: "Rock", type: "GENRE" },
          { _id: "label2", label: "Popular", type: "TAG" },
        ];

        // mock aggregation to return matching label IDs
        mockLabelModel.aggregate.mockResolvedValue([{ _id: "label1" }, { _id: "label2" }]);
        // mock query execution to return populated label data
        mockQuery.forPagination.mockResolvedValue(mockLabels);

        // ==================== Act ====================
        // execute genres and tags search with test query
        const result = await searchContentByType({
          type: SearchFilterOptions.GENRES_AND_TAGS,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify correct label results are returned
        expect(result).toEqual(mockLabels);
        // verify aggregation pipeline is called with correct structure for genres/tags search
        expect(mockLabelModel.aggregate).toHaveBeenCalledWith([
          // first stage: filter by genre and tag types only
          { $match: { type: { $in: [LabelOptions.GENRE, LabelOptions.TAG] } } },
          // second lookup: populate author information for label search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "users",
              localField: "author",
              foreignField: "_id",
            }),
          }),
          // third lookup: populate songs information for label search
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: "songs",
              localField: "songs",
              foreignField: "_id",
            }),
          }),
          // match stage: search across label name, author name, and related song/artist/album info
          expect.objectContaining({
            $match: expect.objectContaining({
              $or: expect.arrayContaining([
                { label: { $regex: "test query", $options: "i" } },
                { "authorDoc.name": { $regex: "test query", $options: "i" } },
                { "songDocs.title": { $regex: "test query", $options: "i" } },
                { "songDocs.artistDoc.name": { $regex: "test query", $options: "i" } },
                { "songDocs.albumDoc.title": { $regex: "test query", $options: "i" } },
              ]),
            }),
          }),
          // project stage: return only document IDs for efficiency
          { $project: { _id: 1 } },
        ]);

        // verify sorting is applied for genres and tags (alphabetical by label, then by creation date)
        expect(mockQuery.sort).toHaveBeenCalledWith({ label: 1, createdAt: -1 });
      });
    });

    describe("Search Type: LANGUAGES", () => {
      it("should return languages when type is LANGUAGES", async () => {
        // ==================== Arrange ====================
        // prepare mock language data for language search results
        const mockLanguages = [
          { _id: "lang1", label: "English", type: "LANGUAGE" },
          { _id: "lang2", label: "Spanish", type: "LANGUAGE" },
        ];

        // mock aggregation to return matching language IDs
        mockLabelModel.aggregate.mockResolvedValue([{ _id: "lang1" }, { _id: "lang2" }]);
        // mock query execution to return populated language data
        mockQuery.forPagination.mockResolvedValue(mockLanguages);

        // ==================== Act ====================
        // execute language search with test query
        const result = await searchContentByType({
          type: SearchFilterOptions.LANGUAGES,
          ...baseParams,
        });

        // ==================== Assert ====================
        // verify correct language results are returned
        expect(result).toEqual(mockLanguages);
        // verify aggregation pipeline is called with correct structure for language search
        expect(mockLabelModel.aggregate).toHaveBeenCalledWith([
          // first stage: filter by language type only
          { $match: { type: { $in: [LabelOptions.LANGUAGE] } } },
          expect.any(Object), // author lookup stage
          expect.any(Object), // songs lookup stage
          expect.any(Object), // match query stage
          // project stage: return only document IDs for efficiency
          { $project: { _id: 1 } },
        ]);
      });
    });

    describe("Edge cases and error handling", () => {
      it("should handle special characters in search query", async () => {
        // ==================== Arrange ====================
        // prepare query with special characters that could break regex
        const specialQuery = "test@#$%^&*()query";
        mockSongModel.aggregate.mockResolvedValue([]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        // execute search with special characters
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: specialQuery,
          page: 1,
        });

        // ==================== Assert ====================
        // verify regex pattern accepts special characters without escaping issues
        expect(mockSongModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $match: expect.objectContaining({
                $or: expect.arrayContaining([{ title: { $regex: specialQuery, $options: "i" } }]),
              }),
            }),
          ])
        );
      });

      it("should handle empty query string", async () => {
        // ==================== Arrange ====================
        // prepare empty aggregation results for empty query test
        mockSongModel.aggregate.mockResolvedValue([]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        // execute search with empty query string to test edge case
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: "",
          page: 1,
        });

        // ==================== Assert ====================
        // verify aggregation is called with empty regex pattern for empty query
        expect(mockSongModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $match: expect.objectContaining({
                $or: expect.arrayContaining([{ title: { $regex: "", $options: "i" } }]),
              }),
            }),
          ])
        );
      });

      it("should handle different page numbers", async () => {
        // ==================== Arrange ====================
        // prepare mock data for pagination test
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        // execute search with specific page number to test pagination
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: "test",
          page: 5,
        });

        // ==================== Assert ====================
        // verify pagination parameters are correctly passed to query builder
        expect(mockGetPaginatedDocs).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 5,
          })
        );
        // verify pagination method is called with correct page number
        expect(mockQuery.forPagination).toHaveBeenCalledWith(5);
      });

      it("should handle database errors gracefully", async () => {
        // ==================== Arrange ====================
        // prepare database error to simulate connection issues
        const dbError = new Error("Database connection failed");
        mockSongModel.aggregate.mockRejectedValue(dbError);

        // ==================== Act & Assert ====================
        // verify error is properly propagated when database fails
        await expect(
          searchContentByType({
            type: SearchFilterOptions.SONGS,
            query: "test",
            page: 1,
          })
        ).rejects.toThrow("Database connection failed");
      });

      it("should handle Promise.all errors in ALL search", async () => {
        // ==================== Arrange ====================
        const dbError = new Error("One of the search queries failed");
        mockSongModel.aggregate.mockRejectedValue(dbError);
        mockMusicianModel.aggregate.mockResolvedValue([]);
        mockAlbumModel.aggregate.mockResolvedValue([]);
        mockLabelModel.aggregate.mockResolvedValue([]);

        // ==================== Act & Assert ====================
        await expect(
          searchContentByType({
            type: SearchFilterOptions.ALL,
            query: "test",
            page: 1,
          })
        ).rejects.toThrow("One of the search queries failed");
      });

      it("should handle case-insensitive search correctly", async () => {
        // ==================== Arrange ====================
        const caseQuery = "TestQuery";
        mockSongModel.aggregate.mockResolvedValue([]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: caseQuery,
          page: 1,
        });

        // ==================== Assert ====================
        expect(mockSongModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $match: expect.objectContaining({
                $or: expect.arrayContaining([{ title: { $regex: caseQuery, $options: "i" } }]),
              }),
            }),
          ])
        );
      });
    });

    describe("Query builder integration", () => {
      it("should use correct query builder methods for different content types", async () => {
        // ==================== Arrange ====================
        // prepare mock aggregation results for all content types
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }]);
        mockMusicianModel.aggregate.mockResolvedValue([{ _id: "musician1" }]);
        mockAlbumModel.aggregate.mockResolvedValue([{ _id: "album1" }]);
        mockLabelModel.aggregate.mockResolvedValue([{ _id: "label1" }]);

        const mockResults = ["result"];
        mockQuery.forPagination.mockResolvedValue(mockResults);

        // define expected query builder methods for each content type
        const testCases = [
          {
            type: SearchFilterOptions.SONGS,
            expectedMethods: ["populateSongDetails", "refactorSongFields", "lean"],
          },
          {
            type: SearchFilterOptions.MUSICIANS,
            expectedMethods: ["populateNestedSongDetails", "refactorSongFields", "lean"],
          },
          {
            type: SearchFilterOptions.ALBUMS,
            expectedMethods: [
              "populate",
              "populateNestedSongDetails",
              "refactorSongFields",
              "lean",
            ],
          },
          {
            type: SearchFilterOptions.GENRES_AND_TAGS,
            expectedMethods: ["populateNestedSongDetails", "refactorSongFields", "sort", "lean"],
          },
        ];

        // ==================== Act & Assert ====================
        // test each content type to verify correct query builder methods are used
        for (const { type, expectedMethods } of testCases) {
          jest.clearAllMocks();

          await searchContentByType({
            type,
            query: "test",
            page: 1,
          });

          // verify expected query builder methods were called for each content type
          expectedMethods.forEach((method) => {
            expect(mockQuery[method as keyof typeof mockQuery]).toHaveBeenCalled();
          });
        }
      });

      it("should use pagination for SONGS search type", async () => {
        // ==================== Arrange ====================
        // prepare mock data for pagination test
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        // execute songs search which should use pagination
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: "test",
          page: 1,
        });

        // ==================== Assert ====================
        // verify pagination method is called for songs search type
        expect(mockQuery.forPagination).toHaveBeenCalledWith(1);
      });

      it("should not use pagination for ALL search type", async () => {
        // ==================== Arrange ====================
        // prepare empty mock data for ALL search type
        mockSongModel.aggregate.mockResolvedValue([]);
        mockMusicianModel.aggregate.mockResolvedValue([]);
        mockAlbumModel.aggregate.mockResolvedValue([]);
        mockLabelModel.aggregate.mockResolvedValue([]);

        // mock lean method to return combined results
        mockQuery.lean.mockResolvedValue({
          songs: [],
          musicians: [],
          albums: [],
          genresAndTags: [],
          languages: [],
        });

        // ==================== Act ====================
        // execute ALL search which should not use pagination
        await searchContentByType({
          type: SearchFilterOptions.ALL,
          query: "test",
          page: 1,
        });

        // ==================== Assert ====================
        // verify pagination method is not called for ALL search type
        expect(mockQuery.forPagination).not.toHaveBeenCalled();
        // verify lean method is called to get combined results
        expect(mockQuery.lean).toHaveBeenCalled();
      });

      it("should verify detailed aggregation pipeline structure for songs", async () => {
        // ==================== Arrange ====================
        const searchQuery = "test song";
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }]);
        mockQuery.forPagination.mockResolvedValue([]);

        // ==================== Act ====================
        await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: searchQuery,
          page: 1,
        });

        // ==================== Assert ====================
        expect(mockSongModel.aggregate).toHaveBeenCalledWith([
          // First lookup: musicians
          {
            $lookup: {
              from: "musicians",
              localField: "artist",
              foreignField: "_id",
              as: "artistDoc",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          // Second lookup: albums
          {
            $lookup: {
              from: "albums",
              localField: "album",
              foreignField: "_id",
              as: "albumDoc",
              pipeline: [{ $project: { title: 1 } }],
            },
          },
          // Third lookup: labels (genres, tags, languages)
          {
            $lookup: {
              from: "labels",
              let: { labelIds: { $setUnion: ["$genres", "$tags", "$languages"] } },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$labelIds"] } } },
                { $project: { label: 1 } },
              ],
              as: "labelDocs",
            },
          },
          // Match query
          {
            $match: {
              $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { "artistDoc.name": { $regex: searchQuery, $options: "i" } },
                { "albumDoc.title": { $regex: searchQuery, $options: "i" } },
                { "labelDocs.label": { $regex: searchQuery, $options: "i" } },
              ],
            },
          },
          // Project only _id
          { $project: { _id: 1 } },
        ]);
      });
    });

    describe("Integration scenarios", () => {
      it("should demonstrate complete search workflow", async () => {
        // ==================== Arrange ====================
        // prepare realistic search scenario with beatles query
        const searchQuery = "beatles";
        const expectedSongs = [
          { _id: "song1", title: "Hey Jude", artist: "The Beatles" },
          { _id: "song2", title: "Let It Be", artist: "The Beatles" },
        ];

        // mock aggregation to return matching song IDs
        mockSongModel.aggregate.mockResolvedValue([{ _id: "song1" }, { _id: "song2" }]);
        // mock query execution to return populated song data
        mockQuery.forPagination.mockResolvedValue(expectedSongs);

        // ==================== Act ====================
        // execute complete search workflow with realistic query
        const result = await searchContentByType({
          type: SearchFilterOptions.SONGS,
          query: searchQuery,
          page: 1,
        });

        // ==================== Assert ====================
        // verify correct search results are returned
        expect(result).toEqual(expectedSongs);

        // verify complete search workflow from aggregation to final results
        expect(mockSongModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $match: expect.objectContaining({
                $or: expect.arrayContaining([{ title: { $regex: searchQuery, $options: "i" } }]),
              }),
            }),
          ])
        );

        // verify pagination query is configured with correct parameters
        expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
          model: SongModel,
          filter: { _id: { $in: [{ _id: "song1" }, { _id: "song2" }] } },
          limit: { initial: FETCH_LIMIT_PER_PAGE, load: FETCH_LIMIT_PER_PAGE },
          page: 1,
        });

        // verify all query builder methods are called in correct order
        expect(mockQuery.populateSongDetails).toHaveBeenCalled();
        expect(mockQuery.refactorSongFields).toHaveBeenCalled();
        expect(mockQuery.lean).toHaveBeenCalled();
        expect(mockQuery.forPagination).toHaveBeenCalledWith(1);
      });
    });
  });
});
