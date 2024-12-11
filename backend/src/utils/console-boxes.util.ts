const logbox = require("log-box");

const consoleLogBox = (msg: string) => {
  const options = {
    style: "double",
    padding: {
      top: 1,
      bottom: 1,
    },
  };

  return logbox(msg, options);
};

export default consoleLogBox;
