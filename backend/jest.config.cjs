//separate configs: Using an in-memory DB only for integration
module.exports = {
  transform: {},
  collectCoverageFrom: ["src/controllers/**/*.js", "src/models/**/*.js"],
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/src/__tests__/unitTest/**/*.test.js"],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/src/__tests__/integrationTest/**/*.test.js"],
    },
  ],
};

// use commands:
// npm run test -- --selectProjects unit
// npm run test -- --selectProjects integration
