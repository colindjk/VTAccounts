const { defaults } = require('jest-config');

// jest.config.js
module.exports = {
  verbose: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  moduleNameMapper: { ...defaults.moduleNameMapper, 
    '\\.(css|jpg|png)$': '<rootDir>/empty-module.js',
  },
  modulePaths: [ '<rootDir>/src/', ]
};
