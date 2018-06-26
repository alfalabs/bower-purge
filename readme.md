# bower-purge

utility to remove junk from `bower_components` folder optimized for Polymer components.  
Only files needed are left as specified in `bowerPurge.keep` array.

## install
```npm i bower-purge --save-dev```

## use
add configuration to your project `bower.json` file

```javascript
"bowerPurge": {
    "deleteDir": ["/test/", "/demo/", "/helpers/", "/patterns/", "/templates/"],
    "keep": ["bower.json", ".html", ".js"]
}
```

where  
`deleteDir` is a list of folders to be deleted (folder name inside forward slashes / for `filepath.includes(dir)`)  
`keep` is a list of file path endings to be kept (for `filepath.endsWith(str)`)  
Do NOT use `globs` or wildcards.

### before use, make a dry run to see what files will be deleted without actulally deleting them:
`bower-purge --dryRun`

