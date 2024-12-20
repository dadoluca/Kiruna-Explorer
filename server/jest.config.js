module.exports = {
    transform: {
      "^.+\\.[tj]sx?$": "babel-jest", // Handle .js and .jsx files
      "^.+\\.mjs$": "babel-jest", // Handle .mjs files
    },
    testEnvironment: 'node', // Ensure you're using the Node environment for Jest
    coverageDirectory: "./coverage", // Optional: Set up where the coverage reports should go
    collectCoverageFrom: [
      "server/**/*.js",  // Collect coverage from all JS files in the server folder
      "server/**/*.mjs", // Also collect coverage from .mjs files
    ],
  };
  