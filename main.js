#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	findup = require('findup-sync'),
	program = require('commander'),
	semver = require('semver'),
	pkg = require('./package.json'),
	buildProps = path.resolve(process.cwd(),'build.properties.json'),
	args = {};

program
	.version(pkg.version)
	.parse(process.argv);

program.args.forEach(function(val) {
	val = val.split('=');
	args[val[0]] = val.length>1 ? val[1] : true;
});

var formatReference = function(pkgRef, pkgName, pkgTag) {
	if (/#|\/\//g.test(pkgRef)) {
		pkgRef = pkgRef.split('#')[0];
		return pkgRef + '#' + pkgTag;
	} else {
		return semver.clean(pkgTag);
	}
};

var updateReference = function(pkgFile, pkgName, pkgTag) {
	var thisPkg = require(pkgFile),
		pkgRef;

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key];

		if (depsHash && depsHash[pkgName]) {
			pkgRef = formatReference(depsHash[pkgName], pkgName, pkgTag);
			console.log('Updating %s to %s in %s', depsHash[pkgName], pkgRef, pkgFile);
			depsHash[pkgName] = pkgRef;
		}
	});

	if (pkgRef) {
		if (!args.test) {
			fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
		}
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
		var pkgTag = buildProps[pkgName];
		console.log('Upstream dependency changes from: %s@%s',pkgName,pkgTag);
		bumpdep(pkgName,pkgTag);
	});
}
