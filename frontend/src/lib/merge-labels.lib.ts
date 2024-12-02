type LabelType = {
  id: string;
  [key: string]: string;
};

const mergeProperties = (
  labels: LabelType[],
  property: keyof LabelType,
  joinType: string = ", "
) => {
  // default return value
  let joinVal = "";

  // combine
  if (labels && labels.length) {
    joinVal = labels
      .map((label) => {
        // check if each label contains the specified property
        if (!(property in label)) {
          throw new Error(
            `Label with id "${label.id}" does not contain the property "${property}".`
          );
        }

        return label[property];
      })
      .join(joinType);
  }

  return joinVal;
};

export default mergeProperties;
