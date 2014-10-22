#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	findup = require('findup-sync'),
	buildProps = path.resolve(process.cwd(),'build.properties.json');

var formatReference = function(pkgRef, pkgName, pkgVersion) {
	if (/#|\/\//g.test(pkgRef)) {
		return pkgRef.split('#')[0] + '#' + pkgVersion;
	} else {
		return pkgVersion;
	}
};

var updateReference = function(pkgFile, pkgName, pkgVersion) {
	var thisPkg = require(pkgFile),
		pkgRef;

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key];

		if (depsHash && depsHash[pkgName]) {
			pkgRef = formatReference(depsHash[pkgName], pkgName, pkgVersion);
			console.log('Updating %s to %s in %s', depsHash[pkgName], pkgRef, pkgFile);
			depsHash[pkgName] = pkgRef;
		}
	});

	if (pkgRef) {
		fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
		console.log('Successfully updated %s', pkgFile);
	}
};

var bumpdep = function(name, tag) {
	['package.json','bower.json'].forEach(function(pkgFile){
		var pkgPath = findup(pkgFile);

		if (fs.existsSync(pkgPath)) {
			updateReference(pkgPath, name, tag);
		}
	});
};

if (fs.existsSync(buildProps)) {
	buildProps = require(buildProps);
	Object.keys(buildProps).forEach(function(pkgName) {
		var pkgVersion = buildProps[pkgName];
		console.log('Upstream dependency changes from: %s@%s',pkgName,pkgVersion);
		bumpdep(pkgName,pkgVersion);
	});
}
