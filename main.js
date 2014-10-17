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



	// var getVersion = function(installPath) {
	// 	if (grunt.file.exists(installPath)) {
	// 		return grunt.file.readJSON(installPath).version;
	// 	}
	// 	return null;
	// };

	// var getVersionNpm = function(pkgName) {
	// 	return getVersion(path.resolve('node_modules', pkgName, 'package.json'));
	// };

	// var getVersionBower = function(pkgName) {
	// 	var bowerDir = 'bower_components', bowerrc;
	// 	if (grunt.file.exists('.bowerrc')) {
	// 		bowerrc = grunt.file.readJSON('.bowerrc');
	// 		if (bowerrc.directory) {
	// 			bowerDir = bowerrc.directory;
	// 		}
	// 	}
	// 	return getVersion(path.resolve(bowerDir, pkgName, 'bower.json'));
	// };

	// var checkPackage = function(pkgName, versionGetter, pkgCollector) {
	// 	var pkgVersion = buildProps[pkgName],
	// 		installedVersion = versionGetter(pkgName);
	// 	if (pkgVersion && String(installedVersion) !== String(pkgVersion)) {
	// 		grunt.log.writeln(
	// 			'NPM package: %s is out of date.  Installed: %s, required: %s',
	// 			pkgName, installedVersion, pkgVersion);
	// 		pkgCollector[pkgName] = pkgVersion;
	// 	}
	// };

	// var checkDependencyVersions = function() {
	// 	if (grunt.file.exists('build.properties.json')) {
	// 		buildProps = grunt.file.readJSON('build.properties.json');
	// 	}
	// 	grunt.option('packageVersions', buildProps);
	// 	grunt.log.writeln('build.properties read:', JSON.stringify(buildProps, null, '  '));

	// 	_.each(opts.packages, function(pkgFiles, pkgName) {
	// 		if (pkgFiles.indexOf('package.json') > -1) {
	// 			checkPackage(pkgName, getVersionNpm, npmNeedsUpdate);
	// 		}
	// 		if (pkgFiles.indexOf('bower.json') > -1) {
	// 			checkPackage(pkgName, getVersionBower, bowerNeedsUpdate);
	// 		}
	// 	});

	// 	return _.size(npmNeedsUpdate) + _.size(bowerNeedsUpdate) > 0;
	// };
