/* forked from  https://github.com/mkramb/bower-clean  */
'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('extfs');

const async = require('async');
const bower = require('bower');
const walk = require('walk');


const cfg = require(path.join(process.cwd(), 'bower.json')).bowerPurge;

function extractComponents(list) {
  var components = {};
  var missingLst=[];

  function callback(l) {
    _.each(l.dependencies, function (info, component) {
      if (info.canonicalDir) {
        components[component] = info.canonicalDir;
      }
      if(info.missing){missingLst.push(component);}

      callback(info);
    });
  }

  callback(list);
  if (missingLst.length>0) {console.log('missing components:', missingLst); process.stdout.write(`missing ${missingLst.length} components.`);}
  return components;
}

function isToKeep(_path){

    if (process.platform==='win32') _path =  _path.replace(/\\/g, "/");
    
    // 1. blacklisted folders
    var keep = true;
    var list = cfg.deleteDir; // ["/test/", "/demo/", "/helpers/", "/patterns/", "/templates/"]; globs are not working well with dirs
    list.forEach(function(dir){
        if (_path.includes(dir)) keep = false;
    });
    if (!keep) return false;

     // 2. whitelisted filepath endings
    keep = false;
    list = cfg.keep;  // ['bower.json', '.html', '.js'];

    list.forEach(function(ending){ // items matching keepList will not be deleted
        if (_path.endsWith(ending)) keep = true;
    });
  
    return keep;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function sortByLength(a, b) {
    a = a.toString().length;
    b = b.toString().length;

    return a < b ?
      1 : (a > b ? -1 : 0);
}

module.exports = function(dryRun, cb) {

    var totCount = 0, delCount = 0, delSize = 0;

    if (!cfg  || _.isEmpty(cfg)) throw 'Configuration in bower.json is missing: "bowerPurge:{keep:[], deleteDir:[]}"';

  bower.commands
    .list({}, { offline: true })

    .on('error', function (err) {
      console.error(err.message);
    })

    .on('end', function (list) {
        var components = extractComponents(list);
        var processed = {};

        async.each(
            _.keys(components),
            function(component, callback) {
                processed[component] = {
                    directories: [],
                    files: []
                };

                var walker = walk.walk(components[component], {
                    followLinks: false
                });

                walker.on('directories', function (root, stats, next) {
                    _.each(stats, function(stat) {
                        var _path = path.join( root, stat.name);
                        processed[component].directories.push(_path);
                    });

                    next();
                });

                walker.on('file', function(root, stat, next) {
                    var _path = path.join( root, stat.name);
                    totCount++;

                    if (!isToKeep(_path)){
                        processed[component].files.push(_path); // add to be deleted
                        delSize += stat.size;
                    }

                    next();
                });

                walker.on('end', function() {
                    callback();
                });
            },
            function() {
                var output = [];

                _.each(processed, function(item, component) {
                    var directories = item.directories;
                    var files = item.files;

                    output.push(`= ${component}\n`);

                    _.each(files, function(_path) {
                        output.push(`  - ${_path}\n`);
                        delCount++;

                        if (!dryRun) {
                            fs.removeSync(_path);
                        }
                    });

                    output.push("\n");

                    _.each(directories, function(_path) {
                        if (fs.isEmptySync(_path)) {
                            fs.removeSync(_path);
                        }
                    });
                });

                var msg =`
bower-purge
${dryRun ? 'dryRun  ':''}file count before delete: ${totCount}   deleted count: ${delCount}  deleted size: ${(delSize/1000).toLocaleString('en-US')}kB\n`;
                process.stdout.write(output.join(''));
                process.stdout.write(msg);

                console.log(output.join(''));
                console.log(msg);

                if (typeof cb==='function') {cb();}
            }
        );
    });
};
