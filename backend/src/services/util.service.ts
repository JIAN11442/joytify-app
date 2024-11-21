import mongoose from "mongoose";

// update array reference property service
export const updateArrRefToProp = async <
  M extends mongoose.Document,
  R extends mongoose.Document
>(
  documentData: M,
  updateId: mongoose.Types.ObjectId,
  refToModel: mongoose.Model<R>,
  refToProperty: string,
  updateOperation: "$push" | "$pull" | "$addToSet"
) => {
  // get reference model name
  const ref = refToModel.modelName;
  // get document model
  const documentModel = documentData.constructor as mongoose.Model<M>;
  // convert mongoose document to a plain javascript object
  const generateDocumentData = documentData.toObject();

  Object.entries(generateDocumentData)?.map(async ([key, val]) => {
    // get main document data path
    const documentItemPath = documentModel.schema.path(key);

    // get main document data ref
    const documentItemRef = documentItemPath?.options.ref;

    // validate if the value is a MongoDB ObjectId instance or an array of ObjectId instances
    const isValidObjectIds = (val: unknown) => {
      if (Array.isArray(val)) {
        return (
          val.length > 0 &&
          val.every((item) => item instanceof mongoose.Types.ObjectId)
        );
      }
      return val instanceof mongoose.Types.ObjectId;
    };

    // process document updates if:
    // 1. value contains valid ObjectId(s)
    // 2. document reference matches the target model
    if (isValidObjectIds(val) && documentItemRef === ref) {
      // convert single value to array for unified processing
      const ids = Array.isArray(val) ? val : [val];
      // update each referenced document
      for (const id of ids) {
        await refToModel.findByIdAndUpdate(id, {
          [updateOperation]: { [refToProperty]: updateId },
        } as mongoose.UpdateQuery<R>);
      }
    }
  });
};
