const fs = require('fs')
const path = require('path')
const util = require('util')
const babel = require('babel-core')

const inPath = path.resolve(__dirname, '../src/main.js')
const outPath = path.resolve(__dirname, 'babel.out.ignore.js')

util.promisify(babel.transformFile)(inPath).then(({ code }) =>
	util.promisify(fs.writeFile)(outPath, code),
)
