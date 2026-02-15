module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-geolocation-service|@maplibre)/)',
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text']
};
