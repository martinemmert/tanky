module.exports = {
  scripts: {
    "mount:public": "mount public --to /",
    "mount:dist": "mount src --to /_dist",
    "run:tsc": "tsc",
    "run:tsc::watch": "$1 --watch",
  },
  installOptions: {
    // eslint-disable-next-line node/no-unpublished-require
    rollup: { plugins: [require("rollup-plugin-node-polyfills")()] },
  },
};
