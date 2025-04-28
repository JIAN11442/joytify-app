import mongoose, { Document, FilterQuery, Model } from "mongoose";

/**
 * Maps through type T to extract array property names
 * [K in keyof T] - Iterate through all properties of type T
 * T[K] extends Array<any> - Type guard to check if property is an array type
 * ? K : never - Conditional type to filter array properties
 * [keyof T] - Index access type to create union of valid array properties
 *
 * @param model - The model to check
 * @param filter - The mongoose filter query to apply
 * @param arrayFields - The array fields to check
 */

type ArrayPropertyNames<T> = {
  [K in keyof T]: T[K] extends Array<any> ? K : never;
}[keyof T];

type DeleteDocParams<T> = {
  model: Model<T>;
  filter?: FilterQuery<T>;
  arrayFields: ArrayPropertyNames<T>[];
};

export const deleteDocWhileFieldsArrayEmpty = async <T extends Document>(
  params: DeleteDocParams<T>
) => {
  const { model, filter, arrayFields } = params;

  // get all docs with empty array fields
  const emptyDocs = await model
    .find({
      ...filter,
      $and: arrayFields.map((field) => ({ [field]: { $size: 0 } })),
    })
    .lean();

  // delete docs with empty array fields
  if (emptyDocs.length > 0) {
    const docIds = emptyDocs.map((doc: T) => doc._id);

    await model.deleteMany({ _id: { $in: docIds } });
  }
};

/**
 * Bulk update reference array fields
 * @param sourceDoc - The source document to update
 * @param referenceId - The reference ID to update
 * @param targetModel - The target model to update
 * @param targetField - The target field to update
 * @param operation - The operation to perform
 * @param relativeFields - The relative fields to update
 */

export const bulkUpdateReferenceArrayFields = async <
  TSource extends Document,
  TTarget extends Document,
>(
  sourceDoc: TSource,
  referenceId: mongoose.Types.ObjectId,
  targetModel: mongoose.Model<TTarget>,
  targetField: keyof TTarget,
  operation: "$push" | "$pull" | "$addToSet",
  relativeFields?: Array<keyof TSource>
) => {
  try {
    const targetModelName = targetModel.modelName;
    const sourceModel = sourceDoc.constructor as mongoose.Model<TSource>;
    const sourceData = sourceDoc.toObject();

    const idSet = new Set<mongoose.Types.ObjectId>();

    // 1. get fields to check (must be reference fields from the source model)
    const fieldsToCheck = relativeFields || (Object.keys(sourceData) as Array<keyof TSource>);

    // 2. get ids (must reference to target model and be an ObjectId or an array of ObjectId instances)
    fieldsToCheck.forEach((field) => {
      const value = sourceData[field];
      const path = sourceModel.schema.path(field);

      if (path?.options.ref === targetModelName) {
        if (value instanceof mongoose.Types.ObjectId) {
          idSet.add(value);
        } else {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item instanceof mongoose.Types.ObjectId) {
                idSet.add(item);
              }
            });
          }
        }
      }
    });

    // 3. update target model with unique ids
    if (idSet.size > 0) {
      const idsArr = Array.from(idSet);

      await targetModel.updateMany({ _id: { $in: idsArr } }, {
        [operation]: { [targetField]: referenceId },
      } as mongoose.UpdateQuery<TTarget>);
    }
  } catch (error) {
    console.error("Error in update References:", error);
    throw error;
  }
};

/**
 * Find documents with dynamic pagination (initial load and subsequent loads can have different sizes)
 * @param model - The model to get the documents from
 * @param filter - Query conditions for fetching documents
 * @param limit - Contains two properties:
 *               - initial: Number of documents to fetch on first page
 *               - load: Number of additional documents to fetch on subsequent pages
 * @param page - Page number (starts from 1)
 */

type PaginationQueryParams<T> = {
  model: Model<T>;
  filter: FilterQuery<T>;
  limit: { initial: number; load: number };
  page: number;
};

export const getPaginatedDocs = <T extends Document>({
  model,
  filter,
  limit,
  page,
}: PaginationQueryParams<T>) => {
  const { initial, load } = limit;
  const fetchLimit = page === 1 ? initial : initial + (page - 1) * load;
  // const limitNum = page === 1 ? initial : load;
  // const skipNum = page === 1 ? 0 : initial + (page - 2) * load;

  // return model.find(filter).skip(skipNum).limit(limitNum).sort({ createdAt: -1 });
  return model.find(filter).limit(fetchLimit).sort({ createdAt: -1 });
};

/**
 * Remap fields of a document
 * @param doc - The document to remap fields
 * @param fields - The fields to remap
 * @returns The remapped document
 */

export const remapFields = <T extends Record<string, any>>(
  doc: T,
  fields: Partial<Record<keyof T, string>>
) => {
  if (!doc) {
    return null;
  }

  // convert to plain object if it's a Mongoose document
  const plainDoc = doc.toObject ? doc.toObject() : doc;
  const result: Record<string, any> = {};

  for (const key in plainDoc) {
    // if key is in fields, rename it
    if (Object.prototype.hasOwnProperty.call(plainDoc, key)) {
      result[fields[key] || key] = plainDoc[key];
    }
  }
  return result;
};
