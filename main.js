var fs = require('fs'),
	findup = require('findup-sync'),
	program = require('commander'),
	semver = require('semver'),
	pkg = require('./package.json'),
	path = require('path'),
	args = {};

program
	.version(pkg.version)
	.parse(process.argv);

program.args.forEach(function(val) {
	val = val.split('=');
	args[val[0]] = val.length>1 ? val[1] : true;
});

var getReferenceVersion = function(pkgRef) {
	var tag = pkgRef;
	if (/#|\/\//g.test(tag)) {
		tag = pkgRef.split('#')[1];
	}
	return semver.clean(tag);
};

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
		oldRef, newRef, oldVersion, newVersion, outdated = {};

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key];

		if (depsHash && depsHash[pkgName]) {
			oldRef = depsHash[pkgName];
			oldVersion = getReferenceVersion(oldRef);
			newRef = formatReference(oldRef, pkgName, pkgTag);
			newVersion = getReferenceVersion(pkgTag);
			if (newVersion !== oldVersion) {
				console.log('%s outdated (old: %s, new: %s) in %s', pkgName, oldVersion, newVersion, path.basename(pkgFile));
				depsHash[pkgName] = outdated[pkgName] = newRef;
			}
		}
	});

	if (Object.keys(outdated)) {
		if (!args.test) {
			if (!args['no-sync']) {
				fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
				console.log('Successfully updated %s', pkgFile);
			}
			fs.writeFileSync(pkgFile.replace('.json','.outdated.json'), JSON.stringify(outdated, null, '  '));
		}
	}
};

var syncCurrentPackage = function(tag) {
	var thisPkg;

	['package.json','bower.json'].forEach(function(pkgFile){
		var pkgPath = findup(pkgFile), oldVersion, newVersion;

		if (fs.existsSync(pkgPath)) {
			thisPkg = require(pkgPath);
			oldVersion = thisPkg.version;
			newVersion = semver.clean(tag);

			if (semver.gt(newVersion, oldVersion)) {
				thisPkg.version = semver.clean(tag);
				if (!args.test) {
					fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
				}
				console.log('Syncing version in %s to: %s', path.basename(pkgFile), tag);
			}

		}
	});
};

var bumpdep = function(name, tag) {
	['package.json','bower.json'].forEach(function(pkgFile){
		var pkgPath = findup(pkgFile);

		if (fs.existsSync(pkgPath)) {
			updateReference(pkgPath, name, tag);
		}
	});
};

module.exports = {
	syncCurrentPackage: syncCurrentPackage,
	bumpdep: bumpdep,
	updateReference: updateReference,
	formatReference: formatReference
};
