import { Query } from "mongoose";
import { remapFields } from "../utils/mongoose.util";

/**
 * adds custom methods to Mongoose Query prototype
 */
export const applyMongooseExtensions = async () => {
  const REQUIRED_METHODS = ["forPagination", "remapFields"];

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
};
