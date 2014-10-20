var fs = require('fs'),
	_ = require('lodash'),
	exec = require('child_process').exec,
	when = require('when'),
	findup = require('findup-sync'),
	packageVersion;

var formatRepo = function(pkgName, pkgRef) {
	if (/#|\/\//g.test(pkgRef)) {
		return pkgRef.split('#')[0] + '#';
	} else {
		return pkgName + '@';
	}
};

var updateReference = function(pkgFile, pkgName, pkgVersion, deferred) {
	var thisPkg = require(pkgFile),
		manager = /bower\.json$/.test(pkgFile) ? 'bower' : 'npm';/*,
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
	}*/

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
			cmdData.flag += ' --save-exact';
		}

		if (depsHash && depsHash[pkgName]) {
			cmdData.repo = formatRepo(pkgName, depsHash[pkgName]);
			console.log('Updating dependency using command:');
			console.log(_.template(cmd, cmdData));
			exec(_.template(cmd, cmdData), function(err, stdOut, stdErr) {
				if (err || stdErr) {
					console.error(err || stdErr);
				}
				console.log(stdOut);
				deferred.resolve();
			});
		}
	});

};

module.exports = function(name, tag) {
	var mngrProms = [];

	['package.json','bower.json'].forEach(function(pkgFile) {
		var pkgPath = findup(pkgFile),
			deferred = when.defer();

		console.log('Checking %s', pkgFile);
		mngrProms.push(deferred.promise);
		if (fs.existsSync(pkgPath)) {
			updateReference(pkgPath, name, tag, deferred);
		} else {
			deferred.resolve();
		}
	});

	when.all(mngrProms).done(function() {
		console.log('Finished updating dependency: %s@%s', name, tag);
	}, function(err) {
		throw(err);
	});
};
