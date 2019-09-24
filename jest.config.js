module.exports = {
	testRegex: '\\.test\\.js$',
	coverageDirectory: '<rootDir>/coverage/',
	collectCoverageFrom: ['src/**/*.js', '!src/rules.js'],
	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/dist/',
		'<rootDir>/scripts/',
	],
}
