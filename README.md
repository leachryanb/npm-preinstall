# npm-preinstall

## Node command line utility

### Use case:
The intended use of this plugin is in a sequential release candidate CI build flow where a version bump in an upstream package should necessitate a change in the referenced version in a downstream project.

Consider the following dependency graph:

```shell
ProjectC@0.0.1
├─┬ ProjectB@0.0.2
│ ├─┬ ProjectA@0.0.3
```

If a code change is committed to ProjectA or ProjectB, in order for ProjectC to be 100% frozen and reproducible it needs to have its references to ProjectA or B updated when they change, prior to doing an install.  Once the hard version has been installed, a shrinkwrap will take care of baking the entire stack.

### Installation:
```shell
npm install -g git+http://as-gitmaster:7990/scm/rd/npm-preinstall.git
```

This will install the utility to your local bin folder

### Usage:
```shell
$ npm-preinstall
```

`npm-preinstall`, as indicated should be run prior to running `npm install`.  In Jenkins, you could add build actions as follows:

```shell
if [[ `which npm-preinstall` != *npm-preinstall* ]]; then
	npm install -g git+http://as-gitmaster:7990/scm/rd/npm-preinstall.git
fi

npm-preinstall
npm install
grunt release --scmtrigger=${BUILD_CAUSE_SCMTRIGGER}
```

npm-preinstall will look for a `build.properties.json` file in the current working directory.  The specific format for that json should be as follows:

```js
{
	"packageName": "packageTag"
}
```

* Where `packageName` is the exact `name` property from the package.json or bower.json file and where `packageTag` is the exact tag reference in the target repo.
* Reads in dependency package versions from a build.properties.json file and updates the same packages found in package.json and bower.json, parsing url refs as necessary.
* Whenever a discrepency is found between an installed package version and the version listed in the build.properties.json file, that package will be recorded in a `[package|bower].outdated.json` file, depending upon which manifest file contained the discrepency.
* Works in conjunction with the grunt-eis-release plugin, the output of which is a build.properties.json file, but any build process which deposits that file with the appropriate versions in the downstream working directory will work.
* grunt-eis-release uses [package|bower].outdated.json to determine whether upstream changes should require it to bump its package.

### Flags:

**`--test`** If specified, stdout will log the actions, but not actually rewrite any files (`package.json`, `bower.json`, `package.outdated.json`, `bower.outdated.json`).

**`--no-sync`** If specified, process with not rewrite `package.json`, `bower.json`, but will still write `package.outdated.json` and/or `bower.outdated.json` so that downstream jobs are aware of changes.

### Roadmap:
In future, this utility may support specifying the filename and file format of the properties file.
