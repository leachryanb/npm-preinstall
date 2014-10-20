var fs = require('fs'),
	when = require('when'),
	findup = require('findup-sync');

var formatReference = function(pkgRef, pkgName, pkgVersion) {
	if (/#|\/\//g.test(pkgRef)) {
		return pkgRef.split('#')[0] + '#' + pkgVersion;
	} else {
		return pkgVersion;
	}
};

var updateReference = function(pkgFile, pkgName, pkgVersion, deferred) {
	console.log('Updating %s', pkgFile);
	var thisPkg = require(pkgFile);

	['dependencies', 'devDependencies'].forEach(function(key) {
		var depsHash = thisPkg[key],
			pkgRef;

		if (depsHash && depsHash[pkgName]) {
			pkgRef = formatReference(depsHash[pkgName], pkgName, pkgVersion);
			console.log('Updating dependency reference from: %s to %s', depsHash[pkgName], pkgRef);
			depsHash[pkgName] = pkgRef;
		}
	});
	fs.writeFile(pkgFile, JSON.stringify(thisPkg, null, '  '), function(err) {
		if (err) {
			deferred.reject(err);
		} else {
			console.log('%s updated', pkgFile);
		}
	});
};

module.exports = function(name, tag) {
	var mngrProms = [];

	['package.json','bower.json'].forEach(function(pkgFile){
		var deferred = when.defer(),
			pkgPath = findup(pkgFile);

		if (fs.existsSync(pkgPath)) {
			mngrProms.push(deferred.promise);
			updateReference(pkgPath, name, tag, deferred);
		} else {
			deferred.resolve();
		}
	});

	when.all(mngrProms).done(function() {
		console.log('Finished updating dependency: %s@%s', name, tag);
	}, function(err) {
		console.error(err);
	});
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
