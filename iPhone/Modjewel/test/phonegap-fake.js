/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, IBM Corporation
 */

// defines just enough PhoneGap goop that you can load an iPhone
// plugin in the browser and even run it a bit

;(function(){

if (window.PhoneGap) return

window.PhoneGap = {}

PhoneGap.Fake = true

PhoneGap.hasResource = function(pluginName) {
    return false
}

PhoneGap.addResource = function(pluginName) {
}

PhoneGap.exec = function(success, fail, pluginLongName, method, args) {
    console.log("wanted to run " + pluginLongName + "." + method + "(" + args + ")")
}

PhoneGap.addConstructor = function(func) {
    func.call()
}

})();
