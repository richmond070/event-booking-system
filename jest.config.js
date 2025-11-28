// const { createDefaultPreset } = require("ts-jest");

// const tsJestTransformCfg = createDefaultPreset().transform;

// /** @type {import("jest").Config} **/
// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     ...tsJestTransformCfg,
//   },
// };


module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  modulePathIgnorePatterns: ['dist/'],  
  roots: ["<rootDir>/src/tests"],        
  testMatch: ["**/?(*.)+(test).ts"],    
  moduleFileExtensions: ["ts", "js", "json", "node"],

  moduleNameMapper: {
    "^jest-setup$": "<rootDir>/jest.setup.ts",
  },
};