/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, IBM Corporation
 */

#import <Foundation/Foundation.h>

#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#import <PhoneGap/JSON.h>
#else
#import "PGPlugin.h"
#import "JSON.h"
#endif

//------------------------------------------------------------------------------
// plugin class
//------------------------------------------------------------------------------
@interface PGModjewel : PGPlugin {}
    @property (nonatomic, retain) NSString* fileMapString;

    - (NSString*)buildFileMapString;
    - (void)getFileMap:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
    - (void)returnSuccess:(id)fileMap callback:(NSString*)callback;
    - (void)returnError:(NSString*)message callback:(NSString*)callback;
@end

//------------------------------------------------------------------------------
// plugin class
//------------------------------------------------------------------------------
@implementation PGModjewel
    @synthesize fileMapString = _fileMapString;

    //--------------------------------------------------------------------------
    - (NSString*)buildFileMapString {
        NSFileManager* nsFileManager = [NSFileManager defaultManager];
        NSString*      bundlePath    = [[NSBundle mainBundle] bundlePath];

        // get the root directory of the modules
        NSString* bundleRoot = [NSString stringWithFormat: @"%@/www/modules", bundlePath];

        // get all the files under that root directory
        NSArray* fileNames = [nsFileManager subpathsAtPath:bundleRoot];

        NSMutableArray* filteredFileNames = [[[NSMutableArray alloc] init] autorelease];
        for (NSString* fileName in fileNames) {
            NSString*     fullFileName = [NSString stringWithFormat: @"%@/%@", bundleRoot, fileName];
            NSDictionary* attrs        = [nsFileManager attributesOfItemAtPath:fullFileName error:nil];
            NSString*     fileType     = [attrs fileType];

            if (![fileType isEqualToString:NSFileTypeRegular]) continue;

            [filteredFileNames addObject: fileName];
        }

        // convert to JSON
        SBJSON* jsonLib = [[[SBJSON alloc] init] autorelease];
        NSString* json = [jsonLib stringWithObject:filteredFileNames allowScalar:YES error:nil];

        return json;
    }

    //--------------------------------------------------------------------------
    - (void)getFileMap:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
        NSString*      callback      = [arguments objectAtIndex:0];

        if (!self.fileMapString) {
            self.fileMapString = [self buildFileMapString];
        }

        [self returnSuccess:self.fileMapString callback:callback];
    }

    //--------------------------------------------------------------------------
    - (void)returnSuccess:(id)fileMapString callback:(NSString*)callback {

        PluginResult* result = [PluginResult
            resultWithStatus: PGCommandStatus_OK
            messageAsArray: [NSArray arrayWithObject:fileMapString]
        ];

        NSString* js = [result toSuccessCallbackString:callback];

        [self writeJavascript:js];
    }

    //--------------------------------------------------------------------------
    - (void)returnError:(NSString*)message callback:(NSString*)callback {
        PluginResult* result = [PluginResult
            resultWithStatus: PGCommandStatus_OK
            messageAsString: message
        ];

        NSString* js = [result toErrorCallbackString:callback];

        [self writeJavascript:js];
    }

@end

