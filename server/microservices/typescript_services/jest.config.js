module.exports = {
  verbose: true,
  projects: [
    {
      displayName: 'common',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/common/**/*.test.ts'],
    },
    {
      displayName: 'map-tile',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/map_tile_service/**/*.test.ts'],
      moduleNameMapper: {
        "^@typescript_services/common$": "<rootDir>/common/src"
      }
    },
    {
      displayName: 'route-service',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/route_service/**/*.test.ts'],
      moduleNameMapper: {
        "^@typescript_services/common$": "<rootDir>/common/src"
      }
    }
  ]
};