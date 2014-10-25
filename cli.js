#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	preinstall = require('./main'),
	buildProps = path.resolve(process.cwd(),'build.properties.json');

if (fs.existsSync(buildProps)) {
	buildProps = require(buildProps);
	Object.keys(buildProps).forEach(function(pkgName) {
		var pkgTag = buildProps[pkgName];
		console.log('Upstream dependency changes from: %s@%s',pkgName,pkgTag);
		preinstall.bumpdep(pkgName,pkgTag);
	});
}
