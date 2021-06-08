const fs = require("fs");
const path = require("path");

const thisFileName = path.basename(__filename);
module.exports = fs
  .readdirSync(__dirname)
  .filter((f) => f !== thisFileName)
  .map((f) => {
    const name = path.basename(f, ".js");
    return {
      baseRoute: name,
      controller: require(`./${name}`),
    };
  });
