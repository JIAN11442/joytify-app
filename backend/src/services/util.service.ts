import { Model } from "mongoose";

type CollectDocumentAttributesParams<T> = {
  model: Model<T>;
  ids: string[];
  fields: string[];
};

type CollectedAttributes = {
  [key: string]: any[];
};

/**
 * Collects unique values from specified fields across multiple documents
 * @param params - Parameters for collecting attributes
 * @returns Object with field names as keys and arrays of unique values as values
 */
export const collectDocumentAttributes = async <T>({
  model,
  ids,
  fields,
}: CollectDocumentAttributesParams<T>): Promise<CollectedAttributes> => {
  const result: CollectedAttributes = {};

  // Initialize result object with empty arrays
  fields.forEach((field) => {
    result[field] = [];
  });

  // Get documents by IDs
  const documents = await model.find({ _id: { $in: ids } }).lean();

  // Collect unique values from each field
  documents.forEach((doc: any) => {
    fields.forEach((field) => {
      const value = doc[field];
      if (value) {
        if (Array.isArray(value)) {
          // If field is an array, add all values
          value.forEach((item) => {
            if (!result[field].includes(item)) {
              result[field].push(item);
            }
          });
        } else {
          // If field is a single value, add it
          if (!result[field].includes(value)) {
            result[field].push(value);
          }
        }
      }
    });
  });

  return result;
};
