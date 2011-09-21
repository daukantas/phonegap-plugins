/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, IBM Corporation
 */

//------------------------------------------------------------------------------
function onLoad() {
    if (!window.PhoneGap) {
        console.log("PhoneGap not loaded")
        return
    }

    if (PhoneGap.Fake) {
        onDeviceReady()
    }
    else {
        document.addEventListener("deviceready", onDeviceReady, false);
    }
}

//------------------------------------------------------------------------------
function onDeviceReady() {
    modjewel.getModuleSource(getModuleSourceSuccess, getModuleSourceFailure)
}

//------------------------------------------------------------------------------
function getModuleSourceSuccess(moduleSource) {
    console.log("modjewel.getModuleSource(): " + moduleSource)

    modjewel.require("basic/program.js")

}

//------------------------------------------------------------------------------
function getModuleSourceFailure(message) {
    console.log("failure callback from modjewel.getModuleSource(): " + message)
}
