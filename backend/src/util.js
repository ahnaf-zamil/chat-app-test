const fs = require("fs");

module.exports = {
  writeConfig: (conf) => {
    fs.writeFile("./config.json", JSON.stringify(conf), () => {
      console.log("config updated");
    });
  },
  getConfig: () => {
    const f = fs.readFileSync("./config.json", "utf8");
    return JSON.parse(f);
  },
};
