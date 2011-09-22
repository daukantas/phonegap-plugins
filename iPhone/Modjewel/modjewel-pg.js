/**
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, IBM Corporation
 */

;(function(){

//----------------------------------------------------------------------------
// some constants
//----------------------------------------------------------------------------
var PROGRAM = "modjewel-pg"
var VERSION = "1.0.0"

//-------------------------------------------------------------------
if (PhoneGap.hasResource(PROGRAM)) return
PhoneGap.addResource(PROGRAM)

//----------------------------------------------------------------------------
// "globals" (local to this function scope though)
//----------------------------------------------------------------------------
var FileMap  = null
var Modules  = {}
var Packages = {}

//----------------------------------------------------------------------------
function fileExists(fileName) {
    if (!FileMap) error("trying to access require() before onModulesReady")

    if (!FileMap.hasOwnProperty(fileName)) return null
    return FileMap[fileName]
}

//----------------------------------------------------------------------------
function packageExists(fileName) {
    if (!Packages.hasOwnProperty(fileName)) return null
    return Packages[fileName]
}

//----------------------------------------------------------------------------
function moduleExists(moduleId) {
    if (!Modules.hasOwnProperty(moduleId)) return null
    return Modules[moduleId]
}

//----------------------------------------------------------------------------
function getFileAsText(fileName) {
    var xhr = new XMLHttpRequest()
    xhr.open("get","modules/" + fileName, false)
    xhr.send()
    return xhr.responseText
}

//----------------------------------------------------------------------------
// node.js's module resolution process, as doc'd in:
//     http://nodejs.org/docs/v0.4.12/api/modules.html#all_Together...
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
function loadAsFile(fileName) {
    if (fileExists(fileName)) return fileName

    var origFileName = fileName

    fileName = origFileName + ".js"
    if (fileExists(fileName)) return fileName

    fileName = origFileName + ".coffee"
    if (fileExists(fileName)) return fileName

    return null
}

//----------------------------------------------------------------------------
function loadAsDirectory(dirName) {
    var jsonFile = dirName + "/package.json"
    var pkg
    var moduleId

    if (fileExists(jsonFile)) {
        if (packageExists(fileName)) {
            pkg = Packages[fileName]
        }
        else {
            try {
                var pkgSource = getFileAsText(jsonFile)
                pkg = JSON.parse(pkgSource)
                Packages[jsonFile] = pkg
            }
            catch(e) {
                error("error loading '" + jsonFile + "': " + e)
            }
        }

        if (!pkg.main) error("no main entry in '" + jsonFile + "'")

        var fileName = normalize(dirName, pkg.main)
        moduleId = loadAsFile(fileName)
        if (moduleId) return moduleId
    }

    var moduleId = loadAsFile(dirName + "/index")
    if (moduleId) return moduleId

    return null
}

//----------------------------------------------------------------------------
function loadNodeModules(fileName, start) {
    var dirs = nodeModulesPaths(start)

    for (var i=0; i<dirs.length; i++) {
        var dir = dirs[i]
        var moduleId

        moduleId = loadAsFile(dir + "/" + fileName)
        if (moduleId) return moduleId

        moduleId = loadAsDirectory(dir + "/" + fileName)
        if (moduleId) return moduleId
    }

    return null
}

//----------------------------------------------------------------------------
function nodeModulesPaths(start) {
    var parts = start.split("/")
    var root  = parts.indexOf("node_modules")
    var i     = parts.length - 1
    var dirs  = []

    if (root == -1) root = 0

    while (i > root) {
        if (parts[i] == "node_modules") continue
        dir = parts.slice(0,i).join("/") + "node_modules"
        dirs.push(dir)
        i--
    }

    return dirs
}

//----------------------------------------------------------------------------
// resolve the actual fileName
//----------------------------------------------------------------------------
function resolve(moduleName, path) {
    var moduleId

    if (moduleName.match(/^\//)) {
        error("absolute module names not supported: " + moduleName)
    }

    if (moduleName.match(/^\.{1,2}\//)) {
        moduleId = loadAsFile(normalize(path, moduleName))
        if (moduleId) return moduleId

        moduleId = loadAsDirectory(normalize(path, moduleName))
        if (moduleId) return moduleId
     }

     moduleName = normalize("", moduleName)

     moduleId = loadNodeModules(moduleName, getDirName(path))
     if (moduleId) return moduleId

     return null
}

//----------------------------------------------------------------------------
// the require function
//----------------------------------------------------------------------------
function getRequire(currentModule) {
    var result = function require(moduleName) {

        var moduleId = resolve(moduleName, currentModule.dirName)
        if (null == moduleId) error("unable to resolve module '" + moduleName + "'")

        var module = moduleExists(moduleId)
        if (module) return module.exports

        var factorySource = getFileAsText(moduleId)

        if (moduleId.match(/\.coffee$/)) {
            var cs = require("coffee-script")
            factorySource = cs.compile(factorySource)
        }

        factorySource = "function(require,exports,module) {" + factorySource + "}"

        var factoryFunc
        try {
            factoryFunc = eval(factory)
        }
        catch(e) {
            error("error building module " + moduleName + ": " + e)
        }

        var module     = createModule(moduleName)
        var newRequire = getRequire(module)

        Modules[moduleName] = module

        try {
            factoryFunc.call(null, newRequire, module.exports, module)
        }
        catch(e) {
            delete Modules[moduleName]
            error("error running module " + moduleName + ": " + e)
        }

        return module.exports
    }

    result.implementation = PROGRAM
    result.version        = VERSION

    return result
}

//----------------------------------------------------------------------------
// create a new module
//----------------------------------------------------------------------------
function createModule(id, dirName) {
    if (!dirName) dirName = getDirName(id)

    return {
        id:      id,
        exports: {},
        dirName: dirName
    }
}

//----------------------------------------------------------------------------
// get the path of a file
//----------------------------------------------------------------------------
function getDirName(fileName) {
    if (!fileName) return ""

    var parts = fileName.split("/")

    return parts.slice(0, parts.length-1).join("/")
}

//----------------------------------------------------------------------------
// normalize a 'file name' with . and .. with a 'directory name'
//----------------------------------------------------------------------------
function normalize(dirName, file) {
    var dirParts   = ("" == dirName) ? [] : dirName.split("/")
    var fileParts  = file.split("/")

    for (var i=0; i<fileParts.length; i++) {
        var filePart = fileParts[i]

        if (filePart == ".") {
        }

        else if (filePart == "..") {
            if (dirParts.length > 0) {
                dirParts.pop()
            }
            else {
                error("too many ..'s in file name '" + file + "'")
            }
        }

        else {
            dirParts.push(filePart)
        }
    }

    return dirParts.join("/")
}

//-------------------------------------------------------------------
PhoneGap.addConstructor(function() {
    window.modjewel = {
        VERSION:         VERSION,
        require:         getRequire(createModule(".")),
        onModulesReady:  onModulesReady
    }
})

//----------------------------------------------------------------------------
// throw an error
//----------------------------------------------------------------------------
function error(message) {
    log(message)
    throw new Error(PROGRAM + ": " + message)
}

//----------------------------------------------------------------------------
// log a message
//----------------------------------------------------------------------------
function log(message) {
    console.log(PROGRAM + ": " + message)
}

//-------------------------------------------------------------------
var onModulesReadyCallbacks = []

//-------------------------------------------------------------------
function onModulesReady(callback) {
    onModulesReadyCallbacks.push(callback)
}

//-------------------------------------------------------------------
function getFileMapSuccess(fileMap) {
    FileMap  = {}
    for (var i=0; i<fileMap.length; i++) {
        FileMap[fileMap[i]] = true
    }

    console.log("modjewel file map: " + JSON.stringify(fileMap,null,4))

    for (var i=0; i<onModulesReadyCallbacks.length; i++) {
        var callback = onModulesReadyCallbacks[i]
        try {
            callback.call()
        }
        catch(e) {
            log("error calling onModuleReady callback '" + callback.name + "': " + e)
        }
    }
}

//-------------------------------------------------------------------
function getFileMapFailure(message) {
    error("error loading file map: " + message)
}

//-------------------------------------------------------------------
function onDeviceReady() {
    PhoneGap.exec(
        getFileMapSuccess,
        getFileMapFailure,
        "com.phonegap.modjewel", "getFileMap", [])
}

document.addEventListener("deviceready", onDeviceReady, false);

})();
