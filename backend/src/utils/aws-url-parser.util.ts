const awsUrlParser = (awsUrl: string) => {
  try {
    const url = new URL(awsUrl);
    const rootPath = url.origin;
    const subPath = url.pathname;
    const pathParts = subPath.split("/").filter(Boolean);

    const [mainFolder, subFolder, fileName] =
      pathParts.length === 3
        ? pathParts
        : pathParts.length === 2
        ? [pathParts[0], null, pathParts[1]]
        : (() => {
            throw new Error(
              `Invalid URL structure: expected 2 or 3 parts, got ${pathParts.length}`
            );
          })();

    const [file, extension] = fileName ? fileName.split(".") : [null, null];

    const folderPath = `${mainFolder}/${subFolder}`;
    const awsS3Key = pathParts.join("/");

    return {
      rootPath,
      subPath,
      pathParts,
      folderPath,
      mainFolder,
      subFolder,
      fileName,
      file,
      extension,
      awsS3Key,
    };
  } catch (error) {
    console.log("Error parsing AWS URL:", error);
    throw error;
  }
};

export default awsUrlParser;
