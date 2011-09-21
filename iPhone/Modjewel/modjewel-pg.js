/**
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, IBM Corporation
 */

;(function(){

//-------------------------------------------------------------------
if (PhoneGap.hasResource("modjewel")) return
PhoneGap.addResource("modjewel")

//-------------------------------------------------------------------
function require(moduleName) {
    console.log("not yet fully operational")
}

//-------------------------------------------------------------------
var onModulesReadyCallbacks = []

//-------------------------------------------------------------------
function onModulesReady(callback) {
    onModulesReadyCallbacks.push(callback)
}

//-------------------------------------------------------------------
function getModuleSourceSuccess(moduleSource) {
    console.log("loaded module source: " + JSON.stringify(moduleSource,null,4))

    for (var i=0; i<onModulesReadyCallbacks.length; i++) {
        var callback = onModulesReadyCallbacks[i]
        try {
            callback.call()
        }
        catch(e) {
            console.log("error calling onModuleReady callback '" + callback.name + "': " + e)
        }
    }
}

//-------------------------------------------------------------------
function getModuleSourceFailure(message) {
    console.log("error loading module source: " + message)
}

//-------------------------------------------------------------------
PhoneGap.addConstructor(function() {
    window.modjewel = {
        require:         require,
        onModulesReady:  onModulesReady
    }
})

//-------------------------------------------------------------------
function onDeviceReady() {
    PhoneGap.exec(
        getModuleSourceSuccess,
        getModuleSourceFailure,
        "com.phonegap.modjewel", "getModuleSource", [])
}

document.addEventListener("deviceready", onDeviceReady, false);

})();
