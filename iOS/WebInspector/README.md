<!-- 
//------------------------------------------------------------------------------
// Copyright 2012 IBM
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
-->

Cordova Web Inspector plugin for iOS
====================================


what is it
------------------------------------

The WebInspector plugin will enable remote Web Inspector.  Add the plugin
to your application, and when you run it, you can dial into Web Inspector
running on your device by browsing to [http://localhost:9999](http://localhost:9999)
on the machine your device is connected to.

Only works with iOS 5.1, in the simulator.

You **cannot** open the URL for remote Web Inspector in Chrome.  Use Safari
instead.  It works on Safari 5.1.5 (7534.55.3).

The code that enables Web Inspector is conditionally removed if you are not
compiling for the simulator.  So, in theory you can leave this code in the
production version of your app.  Good luck, let us know how *that* turns out.

Compatible with the following versions of Cordova:

* 1.6.1

Original idea from 
[Nathan de Vries](http://atnan.com/blog/2011/11/17/enabling-remote-debugging-via-private-apis-in-mobile-safari/).


using the plugin
------------------------------------

* copy the file `CDVWebInspector.m`       to the `Plugins` directory in your project.

* copy the file `cordova-WebInspector.js` to your `www`    directory in your project.

* add the following line to your `index.html` file, 
**AFTER the `cordova.js` file**:

        <script src="cordova-WebInspector.js"></script>

* in the `Supporting Files` directory of your project, add a new plugin
by editing the file `Cordova.plist` and in the `Plugins` dictionary adding
the following key/value pair:

    <table>
    <tr><td>key:   <td>&nbsp; <td><tt>org.muellerware.WebInspector</tt>
    <tr><td>value: <td>&nbsp; <td><tt>CDVWebInspector</tt>
    </table>

Nothing else for you to do. No JavaScript for you to call, just 
include the plugin's `.js` file in your `.html` file.

A message will be logged to the Xcode console
indicating success or failure at enabling remote Web Inspector.

removing the plugin
------------------------------------

Follow the **using the plugin** directions above, backwards, to undo what you done.
The most important step is to remove the `.m` file from your `Plugins` 
directory.


interesting looking hidden APIs
------------------------------------

for future hacking

    @interface WebView (WebPrivate)
        + (id)sharedWebInspectorServer;
        + (void)_enableRemoteInspector;
        + (void)_disableRemoteInspector;
        + (BOOL)_isRemoteInspectorEnabled;
        - (id)inspector;
        - (BOOL)canBeRemotelyInspected;
        - (BOOL)allowsRemoteInspection;
        - (void)setAllowsRemoteInspection:(BOOL)arg1;
    @end
    
    
    @interface WebPreferences (WebPrivate)
        - (BOOL)webInspectorServerEnabled;
        - (void)setWebInspectorServerEnabled:(BOOL)arg1;
        - (short)webInspectorServerPort;
        - (void)setWebInspectorServerPort:(short)arg1;
    @end

As determined using class-dump. eg:

    class-dump Contents/Developer/Platforms/.../WebKit.framework


copyright/license
------------------------------------

Copyright 2012 IBM

Licensed under [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)


