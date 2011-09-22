PhoneGap modjewel test applications
=========================================

This directory contains a set of tests
for the PhoneGap modjewel plugin.

Running the tests
-----------------

To run the tests,

Updating index.json
-------------------

The file `index.json` is needed for the browser version of the test; it
supplies the file names in the module directory that a PhoneGap native
supplies.  To regenerate the guts, run:

    cd test/modules; find . -type f | sed "s/^..\(.*\)/\"\1\",/"


