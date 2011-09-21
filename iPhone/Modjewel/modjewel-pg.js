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
var PROGRAM = "modjewel"
var VERSION = "1.2.0"


//-------------------------------------------------------------------
if (PhoneGap.hasResource(PROGRAM)) return
PhoneGap.addResource(PROGRAM)

//----------------------------------------------------------------------------
// "globals" (local to this function scope though)
//----------------------------------------------------------------------------
var ModuleSource = null
var ModuleStore  = {}

//----------------------------------------------------------------------------
function loadAsFile(fileName) {
    if (hop(ModuleSource, fileName) return ModuleSource[fileName]

    fileName += ".js"
    if (hop(ModuleSource, fileName) return ModuleSource[fileName]

    return null
}

//----------------------------------------------------------------------------
function loadAsDirectory(dirName) {
    var jsonFile = dirName + "/package.json"
    if (hop(ModuleSource, jsonFile)) {
        var json = ModuleSource[jsonFile].content

        try {
            var val = JSON.parse(json)
        }
        catch(e) {
            error("unable to parse JSON file '" + jsonFile + "': " + e
        }

        var main = val.main
        var result = loadAsFile(dirName + "/" + main)
        if (result) return result
    }

    var result = loadAsFile(dirName + "/index")
    if (result) return result

    return null
}

//----------------------------------------------------------------------------
function loadNodeModules(fileName, start) {
    var dirs = nodeModulesPaths(start)

    for (var i=0; i<dirs.length; i++) {
        var dir = dirs[i]
        var result

        result = loadAsFile(dir + "/" + fileName)
        if (result) return result

        result = loadAsDirectory(dir + "/" + fileName)
        if (result) return result
    }
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
// the require function
//----------------------------------------------------------------------------
function get_require(currentModule) {
    var result = function require(moduleId) {

        var relative = false
        if (moduleId.match(/^\.{1,2}\//)) {
            relative = true
            moduleId = normalize(currentModule, moduleId)
        }

        if (hop(ModuleStore, moduleId)) {
            return ModuleStore[moduleId].exports
        }

        var factory = ModuleSource[moduleId]
        var factoryFunc

        factory = "function(require,exports,module) {" + factory + "}

        try {
            factoryFunc = eval(factory)
        }
        catch(e) {
            error("error building module " + moduleId + ": " + e)
        }

        var module     = create_module(moduleId)
        var newRequire = get_require(module)

        ModuleStore[moduleId] = module

        try {
            factoryFunc.call(null, newRequire, module.exports, module)
        }
        catch(e) {
            error("error running module " + moduleId + ": " + e)
        }

        return module.exports
    }

    result.implementation = PROGRAM
    result.version        = VERSION

    return result
}

//----------------------------------------------------------------------------
// shorter version of hasOwnProperty
//----------------------------------------------------------------------------
function hop(object, name) {
    return Object.prototype.hasOwnProperty.call(object, name)
}

//----------------------------------------------------------------------------
// create a new module
//----------------------------------------------------------------------------
function create_module(id) {
    return {
        id:      id,
        exports: {}
    }
}

//----------------------------------------------------------------------------
// get the path of a module
//----------------------------------------------------------------------------
function getModulePath(module) {
    if (!module || !module.id) return ""

    var parts = module.id.split("/")

    return parts.slice(0, parts.length-1).join("/")
}

//----------------------------------------------------------------------------
// normalize a 'file name' with . and .. with a 'directory name'
//----------------------------------------------------------------------------
function normalize(module, file) {
    var modulePath = getModulePath(module)
    var dirParts   = ("" == modulePath) ? [] : modulePath.split("/")
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
                // error("error normalizing '" + module + "' and '" + file + "'")
                // eat non-valid .. paths
            }
        }

        else {
            dirParts.push(filePart)
        }
    }

    return dirParts.join("/")
}

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

//----------------------------------------------------------------------------
// make the require function a global
//----------------------------------------------------------------------------
require_reset()

//-------------------------------------------------------------------
PhoneGap.addConstructor(function() {
    window.modjewel = {
        VERSION:         VERSION,
        require:         get_require(create_module(null)),
        onModulesReady:  onModulesReady
    }
})

//-------------------------------------------------------------------
var onModulesReadyCallbacks = []

//-------------------------------------------------------------------
function onModulesReady(callback) {
    onModulesReadyCallbacks.push(callback)
}

//-------------------------------------------------------------------
function getModuleSourceSuccess(moduleSource) {
    ModuleSource = moduleSource

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
function getModuleSourceFailure(message) {
    log("error loading module source: " + message)
}

//-------------------------------------------------------------------
function onDeviceReady() {
    PhoneGap.exec(
        getModuleSourceSuccess,
        getModuleSourceFailure,
        "com.phonegap.modjewel", "getModuleSource", [])
}

document.addEventListener("deviceready", onDeviceReady, false);

})();
