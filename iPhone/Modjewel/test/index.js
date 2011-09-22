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
        setTimeout(onDeviceReady,200)
    }
    else {
        document.addEventListener("deviceready", onDeviceReady, false)
    }
}

//------------------------------------------------------------------------------
function onDeviceReady() {
    modjewel.onModulesReady(onModulesReady)
}

//------------------------------------------------------------------------------
function onModulesReady() {
    setTimeout(function(){modjewel.require("basic/program")}, 100)
}
