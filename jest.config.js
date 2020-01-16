module.exports = {
	testRegex: '^.+\\.test\\.[jt]s?$',
	transform: { '^.+\\.[jt]s?$': '<rootDir>/node_modules/babel-jest' },
	moduleFileExtensions: ['ts', 'js', 'json'],
	coverageReporters: ['lcov'],
	coveragePathIgnorePatterns: ['/node_modules/'],
	setupFiles: ['jest-canvas-mock'],
}
