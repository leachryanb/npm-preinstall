#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	bumpdep = require('./bumpdep'),
	buildProps = path.resolve(process.cwd(),'build.properties.json');

if (fs.existsSync(buildProps)) {
	buildProps = require(buildProps);
	Object.keys(buildProps).forEach(function(pkgName) {
		var pkgVersion = buildProps[pkgName];
		console.log('Bumping dependency %s@%s',pkgName,pkgVersion);
		bumpdep(pkgName,pkgVersion);
	});
}
