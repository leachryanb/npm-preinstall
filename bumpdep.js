var fs = require('fs'),
	findup = require('findup-sync');

var formatReference = function(pkgRef, pkgName, pkgVersion) {
	if (/#|\/\//g.test(pkgRef)) {
		return pkgRef.split('#')[0] + '#' + pkgVersion;
	} else {
		return pkgVersion;
	}
};

var updateReference = function(pkgFile, pkgName, pkgVersion) {
	var thisPkg = require(pkgFile);

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key],
			pkgRef;

		if (depsHash && depsHash[pkgName]) {
			pkgRef = formatReference(depsHash[pkgName], pkgName, pkgVersion);
			console.log('Updating %s to %s in %s', depsHash[pkgName], pkgRef, pkgFile);
			depsHash[pkgName] = pkgRef;
		}
	});
	fs.writeFileSync(pkgFile, JSON.stringify(thisPkg, null, '  '));
};

module.exports = function(name, tag) {

	['package.json','bower.json'].forEach(function(pkgFile){
		var pkgPath = findup(pkgFile);

		if (fs.existsSync(pkgPath)) {
			updateReference(pkgPath, name, tag);
		}
	});

	console.log('Finished updating dependency: %s@%s', name, tag);
};


/*
var updateReference = function(pkgFile, pkgName, pkgVersion, deferred) {
	var thisPkg = require(pkgFile),
		manager = /bower\.json$/.test(pkgFile) ? 'bower' : 'npm';,
		resolver = deferred.resolve;

	if (manager === 'npm') {
		resolver = function() {
			exec('npm shrinkwrap;', function(err, stdOut, stdErr) {
				if (err || stdErr) {
					throw(err || stdErr);
				}
				console.log(stdOut);
				deferred.resolve();
			});
		};
	}

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key],
			cmdData = {
				flag: (key === 'dependencies' ? '--save' : '--save-dev'),
				repo: pkgName,
				tag: pkgVersion,
				mngr: manager
			},
			cmd = '<%=mngr%> install <%=flag%> <%=repo%><%=tag%>';

		if (manager === 'bower') {
			cmdData.flag = '--allow-root --config.interactive=false ' + cmdData.flag;
		} else {
			cmdData.flag = '--save-exact ' + cmdData.flag;
		}

		if (depsHash && depsHash[pkgName]) {
			cmdData.repo = formatReference(depsHash[pkgName], pkgName);
			console.log('Updating dependency using command:');
			console.log(_.template(cmd, cmdData));
			exec(_.template(cmd, cmdData), function(err, stdOut, stdErr) {
				if (err || stdErr) {
					console.error(err || stdErr);
					deferred.reject(err || stdErr);
				}
				console.log(stdOut);
				deferred.resolve();
			});
		}
	});

};
*/
