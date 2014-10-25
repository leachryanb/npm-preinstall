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

module.exports = {
	bumpdep: bumpdep,
	updateReference: updateReference,
	formatReference: formatReference
};
