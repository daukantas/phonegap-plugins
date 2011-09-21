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
    - (void)getModuleSource:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
    - (void)returnSuccess:(NSString*)scannedText callback:(NSString*)callback;
    - (void)returnError:(NSString*)message callback:(NSString*)callback;
@end

//------------------------------------------------------------------------------
// plugin class
//------------------------------------------------------------------------------
@implementation PGModjewel

    //--------------------------------------------------------------------------
    - (void)getModuleSource:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
        NSString*      callback      = [arguments objectAtIndex:0];
        NSFileManager* nsFileManager = [NSFileManager defaultManager];

        // get the root directory of the modules
        NSString* bundleRoot = [NSString
            stringWithFormat: @"%@/www/modules",
            [[NSBundle mainBundle] bundlePath]
        ];

        // get all the files under that root directory
        NSArray* fileNames = [nsFileManager subpathsAtPath:bundleRoot];

        id result = [[[NSMutableArray alloc] init] autorelease];

        // iterate through the files
        for (NSString* fileName in fileNames) {
            NSString* fullName = [NSString stringWithFormat:@"%@/%@", bundleRoot, fileName];

            // get file attrs
            NSDictionary* attrs = [nsFileManager attributesOfItemAtPath:fullName error:nil];

            // needs to be a regular file
            if (![[attrs fileType] isEqualToString:NSFileTypeRegular]) continue;

            // needs to be a .js, .coffee or .json file
            if (![fileName hasSuffix:@".js"] &&
                ![fileName hasSuffix:@".coffee"] &&
                ![fileName hasSuffix:@".json"])
                continue;

            // get the file contents
            NSString* contents = [NSString
                stringWithContentsOfFile:fullName
                encoding:NSUTF8StringEncoding
                error:nil
            ];

            id dict = [[[NSMutableDictionary alloc] init] autorelease];

            [dict setObject:fileName forKey:@"fileName"];
            [dict setObject:contents forKey:@"contents"];

            [result addObject: dict];
        }

        [self returnSuccess:result callback:callback];
    }

    //--------------------------------------------------------------------------
    - (void)returnSuccess:(id)moduleSource callback:(NSString*)callback {
        SBJSON* jsonLib = [[[SBJSON alloc] init] autorelease];

        NSString* moduleSource_js = [jsonLib stringWithObject:moduleSource allowScalar:YES error:nil];

        PluginResult* result = [PluginResult
            resultWithStatus: PGCommandStatus_OK
            messageAsArray: [NSArray arrayWithObject:moduleSource_js]
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

