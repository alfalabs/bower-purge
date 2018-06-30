# bower-purge

utility to remove junk from `bower_components` folder optimized for Polymer components.  
Only files needed are left as specified in `bowerPurge.keep` array.

## install
```npm i bower-purge --save-dev```

## use
add configuration to your project `bower.json` file

```javascript
"bowerPurge": {
    "deleteDir": ["/test/", "/demo/"],
    "keep": ["bower.json", ".html", ".js"]
}
```

where  
`deleteDir` is a list of folders to be deleted (folder name inside forward slashes / for `filepath.includes(dir)`)  
`keep` is a list of file path endings to be kept (for `filepath.endsWith(str)`)  
NOTE:  
`DeleteDir` runs first, so files matching `keep` will be deleted in these folders.  
Do NOT use `globs` or wildcards.

## use as gulp task
As a part of gulp build, 
copy `bower.json` to build folder and run bower install.   
the 'bower-purge' task must run in the build folder after bower install completes.
```javascript
const bowerPurge = require('bower-purge');

gulp.task('bower-purge', function(cb){
    process.chdir(buildFolder);
    bowerPurge({dryRun:false, quiet:true}, cb);
});
```
## dryRun
### before use, make a dry run to see what files will be deleted without actulally deleting them:
`bower-purge --dryRun`

if you delete needed files, no worries, run `bower install` to restore them. (if bower install does do nothing, delete `bower_components` folder and run bower install again.)

in Windows CLI terminal, you can run `run.cmd` see this file for CLI usage.

based on  https://github.com/mkramb/bower-clean

