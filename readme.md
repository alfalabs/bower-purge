# bower-purge

utility to remove junk from `bower_components` folder optimized for Polymer components.  
Only files needed are left as specified in `bowerPurge.keep` array. Use as a gulp task.

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
var buildFolder = 'your_build_folder';

gulp.task('bower-purge', function(cb){
    process.chdir(buildFolder);
    bowerPurge({dryRun:false, quiet:true}, cb);
});
```

## advanced gulp example
install dependencies and cleanup after, in one gulp task
```javascript
const bowerPurge = require('bower-purge');
const install = require('gulp-install');
const stripComments = require('gulp-strip-comments');
const htmlmin = require('gulp-htmlmin'); // can not minify JS ES6 because it uses uglifyJS
const pump = require('pump'); 

dest = 'your_build_folder';

gulp.task('bower-install-and-purge', function(cb){

    // callback heaven! hell for C!# (read: see-blunt) programmers! 
    // promises are for politicians not to keep
    step1(function(){
        step2(function(){
            step3(cb);
        });
    });

    /** 1. run npm install */
    function step1(_cb){
        pump([
            gulp.src([`${dest}bower.json`]), 
            install({args: ['--production' ]}),
            gulp.dest(dest)
        ], _cb);
    }

    /** 2. purge bower_components folder */
    function step2(_cb){
        process.chdir(dest);
        bowerPurge({dryRun:false, quiet:true}, _cb);
    }

    /** 3. minify html */
    function step3(_cb){
        pump([
            gulp.src([`${dest}bower_components/**/*.html`], {base: dest }), 
            htmlmin({collapseWhitespace: true, removeComments: true}),
            gulp.dest(dest)
        ], _cb);
    }
});
```
## dryRun
### before use, make a dry run to see what files will be deleted without actulally deleting them:
`bower-purge --dryRun`

if you delete needed files, no worries, run `bower install` to restore them. (if bower install does do nothing, delete `bower_components` folder and run bower install again.)

in Windows CLI terminal, you can run `run.cmd` see this file for CLI usage.

## similar utility for `node_modules`
try npm [node-modules-prod](https://www.npmjs.com/package/node-modules-prod) or github [alfalabs/node-modules-prod](https://github.com/alfalabs/node-modules-prod) 

## credits
based on  https://github.com/mkramb/bower-clean

