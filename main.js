var fs = require('fs'),
	findup = require('findup-sync'),
	program = require('commander'),
	semver = require('semver'),
	pkg = require('./package.json'),
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
		oldRef, newRef, outdated = {};

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key];

		if (depsHash && depsHash[pkgName]) {
			oldRef = depsHash[pkgName];
			newRef = formatReference(oldRef, pkgName, pkgTag);
			console.log('%s outdated (%s > %s) in %s', pkgName, oldRef, newRef, pkgFile);
			depsHash[pkgName] = newRef;
			outdated[pkgName] = newRef;
		}
	});

	if (newRef) {
		if (!args.test) {
			if (!args['no-sync']) {
				fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
				console.log('Successfully updated %s', pkgFile);
			}
			if (Object.keys(outdated)) {
				fs.writeFileSync(pkgFile.replace('.json','.outdated.json'), JSON.stringify(outdated, null, '  '));
			}
		}
	}
};

var syncCurrentPackage = function(tag) {
	var thisPkg;

	['package.json','bower.json'].forEach(function(pkgFile){
		var pkgPath = findup(pkgFile);

		if (fs.existsSync(pkgPath)) {
			thisPkg = require(pkgPath);
			thisPkg.version = semver.clean(tag);

			if (!args.test) {
				fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
			}
			console.log('Successfully updated %s', pkgFile);
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
