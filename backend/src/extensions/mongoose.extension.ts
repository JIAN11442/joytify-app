import { Query } from "mongoose";
import { Label, Musician, PopulatedSongResponse } from "@joytify/shared-types/types";
import { remapFields } from "../utils/mongoose.util";
import { joinLabels } from "../utils/join-labels.util";

/**
 * adds custom methods to Mongoose Query prototype
 */
export const applyMongooseExtensions = async () => {
  const REQUIRED_METHODS = ["forPagination", "remapFields", "populateSongDetails", "refactorData"];

  // skip if already applied
  if (REQUIRED_METHODS.every((method) => method in Query.prototype)) {
    return;
  }

  /**
   * returns documents with total count for pagination
   * @returns {Promise<{docs: any[], totalDocs: number}>}
   */
  Query.prototype.forPagination = async function (page?: number) {
    const [docs, totalDocs] = await Promise.all([
      this.exec(),
      this.model.countDocuments(this.getFilter()),
    ]);
    return { ...(page ? { page } : {}), totalDocs, docs };
  };

  /**
   * renames document fields according to mapping
   * @param {Object} fields - {oldField: 'newField'}
   */
  Query.prototype.remapFields = function (fields) {
    return this.transform((docs) => {
      const transformDoc = (doc: any) => {
        return remapFields(doc, fields);
      };

      return Array.isArray(docs) ? docs.map(transformDoc) : transformDoc(docs);
    });
  };

  /**
   * populates song details - supports both Query objects and Document arrays
   */
  Query.prototype.populateSongDetails = function () {
    return this.populate({ path: "artist", select: "name" })
      .populate({ path: "album", select: "title" })
      .populate({ path: "lyricists", select: "name", transform: (doc: Musician) => doc.name })
      .populate({ path: "composers", select: "name", transform: (doc: Musician) => doc.name })
      .populate({ path: "languages", select: "label", transform: (doc: Label) => doc.label })
      .populate({ path: "genres", select: "label", transform: (doc: Label) => doc.label })
      .populate({ path: "tags", select: "label", transform: (doc: Label) => doc.label })
      .populate({ path: "ratings", populate: { path: "user", select: "username profileImage" } });
  };

  /**
   * populates nested songs
   */
  Query.prototype.populateNestedSongDetails = function () {
    return this.populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name" },
        { path: "album", select: "title" },
        { path: "composers", select: "name", transform: (doc: Musician) => doc.name },
        { path: "lyricists", select: "name", transform: (doc: Musician) => doc.name },
        { path: "languages", select: "label", transform: (doc: Label) => doc.label },
        { path: "genres", select: "label", transform: (doc: Label) => doc.label },
        { path: "tags", select: "label", transform: (doc: Label) => doc.label },
        { path: "ratings", populate: { path: "user", select: "username profileImage" } },
      ],
    });
  };

  /**
   * sorts documents by provided ID order
   */
  Query.prototype.sortByIds = function (ids: any[]) {
    return this.transform((docs: any[]) => {
      const idOrder = ids.map(id => id.toString());
      return docs.sort((a, b) => {
        const indexA = idOrder.indexOf(a._id.toString());
        const indexB = idOrder.indexOf(b._id.toString());
        return indexA - indexB;
      });
    });
  };

  /**
   * refactors data by converting arrays to strings and formatting ratings
   * @param {RefactorSongDataOptions} options - Configuration options for the transformation
   * @param {boolean} options.transformNestedSongs - Whether to transform nested songs in albums (default: false)
   */

  type RefactorSongDataOptions = {
    transformNestedSongs?: boolean;
  };

  Query.prototype.refactorSongFields = function <TInput>({
    transformNestedSongs = false,
  }: RefactorSongDataOptions = {}) {
    // transform a single song
    const transformSong = (song: PopulatedSongResponse) => ({
      ...song,
      lyricists: joinLabels(song.lyricists),
      composers: joinLabels(song.composers),
      languages: joinLabels(song.languages),
      ratings: song.ratings?.map((rating: any) => ({
        id: rating._id,
        username: rating.user?.username,
        profileImage: rating.user?.profileImage,
        rating: rating.rating,
        comment: rating.comment,
      })),
    });

    return this.transform((docs: TInput[]) => {
      const transformDoc = (doc: TInput) => {
        // refactor item with nested songs
        if (transformNestedSongs) {
          return {
            ...doc,
            songs: (doc as any).songs.map(transformSong),
          };
        }
        // refactor item without nested songs
        else {
          return transformSong(doc as any);
        }
      };

      return Array.isArray(docs) ? docs.map(transformDoc) : transformDoc(docs);
    });
  };
};
