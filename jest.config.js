const path = require("path");

module.exports = {
  setupFilesAfterEnv: [path.resolve(__dirname, "jest.setup.js")],
  testRegex: "(\\.spec)\\.(jsx?|js?|tsx?|ts?)$",
  transform: {
    "^.+\\.[j|t]sx?$": "ts-jest",
  },
  moduleNameMapper: {
    "\\.(ttf|woff|woff2)$": path.resolve(__dirname, "__mocks__", "fileMock.js"),
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg)$": path.resolve(__dirname, "__mocks__", "fileMock.js"),
    "\\.(mp4|webm|wav|mp3|m4a|aac|oga)$": path.resolve(__dirname, "__mocks__", "fileMock.js"),
    "\\.css$": path.resolve(__dirname, "__mocks__", "styleMock.js"),
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
