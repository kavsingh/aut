module.exports = {
	testEnvironment: 'jsdom',
	testRegex: '^.+\\.test\\.[jt]s?$',
	coverageReporters: ['lcov'],
	coveragePathIgnorePatterns: ['/node_modules/'],
	setupFilesAfterEnv: ['jest-canvas-mock'],
}
