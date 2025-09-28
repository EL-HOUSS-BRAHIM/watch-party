

const nextJest = require("next/jest")

const createJestConfig = nextJest({}
  // Provide the path to your Next.js app to load next.config.js and .env files;
  dir: "./",
})

// Add any custom config to be passed to Jest;
const customJestConfig = { setupFilesAfterEnv: ["<rootDir>/jest.setup.js&quot;],}
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {}
    "^@/(.*)$": "<rootDir>/$1&quot;,
  },
  collectCoverageFrom: []
    "components/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "contexts/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  testPathIgnorePatterns: ["<rootDir>/.next/&quot;, "<rootDir>/node_modules/&quot;, "<rootDir>/e2e/"],
  transform: {}
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async;
module.exports = createJestConfig(customJestConfig)
